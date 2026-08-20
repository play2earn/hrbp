import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSession, configureSameOrigin, getActiveStaff, getAdminSupabase, readSignedSession, setSignedSession } from '../server/security';
import { checkIsHrTeam } from '../server/hr-access';

async function fetchCurrentOrg(empId: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`https://api-idms.advanceagro.net/hrms/employee/${encodeURIComponent(empId)}/`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const json = await response.json();
    const emp = json?.data?.employee;
    if (!emp) return null;
    const position = emp.Position || emp.Section || '';
    const department = emp.Department || emp.Section || '';
    const nameTh = (emp.EmpName || `${emp.FNameT || ''} ${emp.LNameT || ''}`).trim();
    const nameEn = `${emp.FNameE || ''} ${emp.LNameE || ''}`.trim();
    return {
      full_name: nameEn ? `${nameTh} (${nameEn})` : nameTh,
      name_th: nameTh,
      name_en: nameEn,
      position_name: position,
      department_name: department,
      company_name: emp.CompanyName || emp.Comp_NameE || 'Double A (1991) PLC',
      is_hr_team: checkIsHrTeam(position, department, emp.Section, emp.Emp_LineOfWork),
      last_synced_at: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[session] HRMS organization sync unavailable:', error);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST, DELETE')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'DELETE') {
    clearSession(res, 'staff');
    clearSession(res, 'hrms');
    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const user = await getActiveStaff(req);
    return user
      ? res.status(200).json({ success: true, user })
      : res.status(401).json({ success: false, error: 'Session expired' });
  }

  if (req.method === 'POST') {
    const pending = readSignedSession(req, 'hrms');
    if (!pending?.empId || !pending.account) {
      return res.status(401).json({ error: 'Verified HRMS session required' });
    }

    const supabase = getAdminSupabase();
    const [{ data: byEmp, error: empError }, { data: byAccount, error: accountError }] = await Promise.all([
      supabase.from('users').select('*').eq('emp_id', pending.empId).limit(1).maybeSingle(),
      supabase.from('users').select('*').eq('hrms_username', pending.account).limit(1).maybeSingle(),
    ]);
    if (empError || accountError) return res.status(500).json({ error: 'Unable to verify portal account' });
    const user = byEmp || byAccount;
    if (!user) return res.status(404).json({ error: 'Portal account is not registered', needsRegistration: true, empId: pending.empId });
    if (user.status !== 'Active' || (user.role !== 'admin' && user.role !== 'mod')) {
      return res.status(403).json({ error: 'Portal account is not active or does not match HRMS identity' });
    }

    const now = new Date().toISOString();
    const org = await fetchCurrentOrg(pending.empId);
    if (!org && user.role !== 'admin') {
      return res.status(503).json({ error: 'ไม่สามารถยืนยันฝ่ายงานปัจจุบันจาก HRMS ได้ กรุณาลองใหม่ภายหลัง' });
    }
    const approvedNonHr = Boolean(
      user.allow_non_hr_access && user.approved_department_name && org?.department_name &&
      String(org.department_name).trim().toLowerCase() === String(user.approved_department_name).trim().toLowerCase()
    );
    if (org?.is_hr_team === false && user.role !== 'admin' && !approvedNonHr) {
      await supabase.from('users').update({ status: 'Pending', ...org }).eq('id', user.id);
      return res.status(403).json({ error: 'ตรวจพบการย้ายสายงานออกจากทีมสรรหา บัญชีถูกระงับเพื่อรอ Admin ตรวจสอบ' });
    }
    const { data: updatedUser } = await supabase.from('users')
      .update({ ...(org || {}), last_login_at: now, last_active_at: now })
      .eq('id', user.id)
      .select('*')
      .maybeSingle();
    const sessionUser = updatedUser || { ...user, last_login_at: now, last_active_at: now };
    setSignedSession(res, 'staff', { sub: sessionUser.id, empId: sessionUser.emp_id, account: sessionUser.hrms_username }, 8 * 60 * 60);
    clearSession(res, 'hrms');
    return res.status(200).json({ success: true, user: sessionUser });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
