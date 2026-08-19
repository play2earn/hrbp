import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getAdminSupabase, readSignedSession } from '../server/security';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pending = readSignedSession(req, 'hrms');
    if (!pending?.empId || !pending.account) return res.status(401).json({ error: 'Verified HRMS session required' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const fullName = String(req.body?.full_name || '').trim();
    const phone = String(req.body?.phone || '').trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || fullName.length < 2 || fullName.length > 200 || phone.length > 30) {
      return res.status(400).json({ error: 'Invalid registration details' });
    }

    const supabase = getAdminSupabase();
    const [{ data: byEmail }, { data: byEmp }] = await Promise.all([
      supabase.from('users').select('id').eq('email', email).limit(1).maybeSingle(),
      supabase.from('users').select('id').eq('emp_id', pending.empId).limit(1).maybeSingle(),
    ]);
    if (byEmail || byEmp) return res.status(409).json({ error: 'This email or employee ID is already registered' });

    const now = new Date().toISOString();
    const { data, error } = await supabase.from('users').insert([{
      email,
      full_name: fullName,
      phone,
      role: 'mod',
      status: 'Pending',
      emp_id: pending.empId,
      hrms_username: pending.account,
      position_name: 'รอตรวจสอบข้อมูลตำแหน่ง',
      department_name: 'รอตรวจสอบข้อมูลฝ่าย',
      company_name: 'Double A (1991) PLC',
      is_hr_team: false,
      last_synced_at: now,
      created_at: now,
    }]).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('[register-hrms-user]', error);
    return res.status(500).json({ error: 'Unable to register HRMS user' });
  }
}
