import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getActiveStaff, readSignedSession } from '../server/security';
import { checkIsHrTeam } from '../server/hr-access';

/**
 * HR / Recruitment keyword detector to verify if job position or department
 * belongs to the Recruitment / HR team.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const emp_id = (req.query.emp_id || req.body?.emp_id || '').toString().trim();

  if (!emp_id) {
    return res.status(400).json({ error: 'Missing emp_id parameter' });
  }

  const staff = await getActiveStaff(req);
  const pending = readSignedSession(req, 'hrms');
  const canRead = Boolean(
    (staff && (staff.role === 'admin' || String(staff.emp_id || '') === emp_id)) ||
    (pending?.empId && pending.empId === emp_id)
  );
  if (!canRead) return res.status(403).json({ error: 'Not authorized to read this employee profile' });

  // Primary HRMS Employee Detail API endpoint
  const hrmsUrl = `https://api-idms.advanceagro.net/hrms/employee/${encodeURIComponent(emp_id)}/`;
  // Secondary Worklog endpoint fallback
  const agentCode = process.env.IDMS_AGENT_CODE;
  if (!agentCode) return res.status(500).json({ error: 'Worklog integration is not configured' });
  const worklogUrl = `https://mobiledev.advanceagro.net/ws/api/worklog/employee-info/?emp_id=${encodeURIComponent(emp_id)}&Service=0000&AgentId=SystemMango&AgentCode=${encodeURIComponent(agentCode)}`;

  try {
    // 1. Try HRMS API first
    const hrmsResponse = await fetch(hrmsUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (hrmsResponse.ok) {
      const json = await hrmsResponse.json();
      const emp = json?.data?.employee;
      if (emp) {
        const position = emp.Position || emp.Section || 'เจ้าหน้าที่สรรหาบุคลากร';
        const department = emp.Department || emp.Section || 'ฝ่ายทรัพยากรบุคคล (HR)';
        const company = emp.CompanyName || emp.Comp_NameE || 'Double A (1991) PLC';
        const is_hr = checkIsHrTeam(position, department, emp.Section, emp.Emp_LineOfWork);
        const name_th = (emp.EmpName || `${emp.FNameT || ''} ${emp.LNameT || ''}`).trim();
        const name_en = `${emp.FNameE || ''} ${emp.LNameE || ''}`.trim();
        const full_name = name_en ? `${name_th} (${name_en})` : name_th;

        return res.status(200).json({
          success: true,
          emp_id,
          full_name,
          name_th,
          name_en,
          position_name: position,
          department_name: department,
          company_name: company,
          is_hr_team: is_hr,
          raw: emp
        });
      }
    }

    // 2. Try Worklog API as secondary
    const response = await fetch(worklogUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        const position = data.PositionName || data.position || data.JobTitle || 'เจ้าหน้าที่สรรหาบุคลากร';
        const department = data.DepartmentName || data.department || data.Division || 'ฝ่ายทรัพยากรบุคคล (HR)';
        const company = data.CompanyName || data.company || data.BusinessUnit || 'Double A (1991) PLC';
        const is_hr = checkIsHrTeam(position, department);

        return res.status(200).json({
          success: true,
          emp_id,
          position_name: position,
          department_name: department,
          company_name: company,
          is_hr_team: is_hr,
          raw: data
        });
      } catch (parseErr) {
        console.warn('Worklog response parse warning:', parseErr);
      }
    }

    return res.status(502).json({ success: false, error: 'HRMS and Worklog employee data are unavailable' });
  } catch (err: any) {
    console.error('HRMS / Worklog API fetch error:', err);
    return res.status(502).json({ success: false, error: 'HRMS and Worklog employee data are unavailable' });
  }
}
