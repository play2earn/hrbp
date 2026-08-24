const HR_KEYWORDS = [
  'recruit', 'สรรหา', 'human resource', 'talent',
  'personnel', 'บุคคล', 'ว่าจ้าง', 'สรรหาและคัดเลือก',
];

export function checkIsHrTeam(position?: string, department?: string, section?: string, lineOfWork?: string): boolean {
  const text = `${position || ''} ${department || ''} ${section || ''} ${lineOfWork || ''}`.toLowerCase().trim();
  if (!text) return false;
  return /(^|[^a-z0-9])hr(?:bp)?([^a-z0-9]|$)/.test(text)
    || HR_KEYWORDS.some(keyword => text.includes(keyword));
}
