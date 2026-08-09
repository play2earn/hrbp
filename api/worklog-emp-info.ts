import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * HR / Recruitment keyword detector to verify if job position or department
 * belongs to the Recruitment / HR team.
 */
export function checkIsHrTeam(position?: string, department?: string, section?: string, lineOfWork?: string): boolean {
  const textToTest = `${position || ''} ${department || ''} ${section || ''} ${lineOfWork || ''}`.toLowerCase();
  if (!textToTest.trim()) return true;

  const hrKeywords = [
    'recruit',
    'สรรหา',
    'hr',
    'hrbp',
    'human resource',
    'talent',
    'personnel',
    'บุคคล',
    'ว่าจ้าง',
    'สรรหาและคัดเลือก'
  ];

  return hrKeywords.some(kw => textToTest.includes(kw));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const emp_id = (req.query.emp_id || req.body?.emp_id || '').toString().trim();

  if (!emp_id) {
    return res.status(400).json({ error: 'Missing emp_id parameter' });
  }

  // Primary HRMS Employee Detail API endpoint
  const hrmsUrl = `https://api-idms.advanceagro.net/hrms/employee/${encodeURIComponent(emp_id)}/`;
  // Secondary Worklog endpoint fallback
  const worklogUrl = `https://mobiledev.advanceagro.net/ws/api/worklog/employee-info/?emp_id=${encodeURIComponent(emp_id)}&Service=0000&AgentId=SystemMango&AgentCode=Np4kfRh5`;

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

    // 3. Fallback default response if APIs unavailable
    const defaultPosition = 'เจ้าหน้าที่สรรหาบุคลากร (Recruiter)';
    const defaultDept = 'ฝ่ายทรัพยากรบุคคล (HRBP)';
    const defaultCompany = 'Double A (1991) PLC';

    return res.status(200).json({
      success: true,
      emp_id,
      position_name: defaultPosition,
      department_name: defaultDept,
      company_name: defaultCompany,
      is_hr_team: checkIsHrTeam(defaultPosition, defaultDept),
      is_fallback: true
    });
  } catch (err: any) {
    console.error('HRMS / Worklog API fetch error:', err);
    return res.status(200).json({
      success: true,
      emp_id,
      position_name: 'เจ้าหน้าที่สรรหาบุคลากร (Recruiter)',
      department_name: 'ฝ่ายทรัพยากรบุคคล (HRBP)',
      company_name: 'Double A (1991) PLC',
      is_hr_team: true,
      is_fallback: true
    });
  }
}
