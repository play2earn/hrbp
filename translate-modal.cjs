const fs = require('fs');
const file = '/Users/gamma/Documents/VibeCode/ALL/hrbp/components/dashboard/ApplicationDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const dict = {
  'รายละเอียดผู้สมัคร': 'Application Details',
  'ตำแหน่งที่สมัคร': 'Position Applied',
  'เงินเดือนที่ต้องการ': 'Expected Salary',
  'แผนก/ฝ่าย': 'Department',
  'วันที่สามารถเริ่มงาน': 'Availability',
  'ข้อมูลส่วนตัว': 'Personal Information',
  'คำนำหน้า': 'Title',
  'ชื่อเล่น (ไทย)': 'Nickname (TH)',
  'ชื่อเล่น (อังกฤษ)': 'Nickname (EN)',
  'ชื่อ': 'First Name',
  'นามสกุล': 'Last Name',
  'สัญชาติ': 'Nationality',
  'เลขบัตรประชาชน': 'ID Card / Passport',
  'วันเกิด': 'Date of Birth',
  'อายุ': 'Age',
  'ส่วนสูง': 'Height',
  'น้ำหนัก': 'Weight',
  'สถานะทางทหาร': 'Military Status',
  'เบอร์โทร': 'Phone',
  'อีเมล': 'Email',
  'ที่อยู่': 'Address',
  'ข้อมูลครอบครัว': 'Family Information',
  'สถานภาพ': 'Marital Status',
  'จำนวนบุตร': 'No. of Children',
  'จำนวนพี่น้อง': 'No. of Siblings',
  'ชื่อคู่สมรส': 'Spouse Name',
  'อาชีพคู่สมรส': 'Spouse Occupation',
  'อายุคู่สมรส': 'Spouse Age',
  'การศึกษา': 'Education',
  'ประสบการณ์ทำงาน': 'Work Experience',
  'ทักษะ': 'Skills',
  'แบบสอบถามเพิ่มเติม': 'Additional Questionnaire',
  'สุขภาพและผู้ติดต่อฉุกเฉิน': 'Health & Emergency Contact',
};

// Add `const isForeigner = fd.isThaiNational === false; const lang = isForeigner ? 'en' : 'th';` right after `const fd = viewingApp.form_data || {};`
content = content.replace(
  /const fd = viewingApp\.form_data \|\| \{\};/,
  "const fd = viewingApp.form_data || {};\n          const isForeigner = fd.isThaiNational === false;\n          const lang = isForeigner ? 'en' : 'th';"
);

// Replace InfoRow label="..." with label={lang === 'en' ? '...' : '...'}
for (const [th, en] of Object.entries(dict)) {
  const regexRow = new RegExp(`label="${th}"`, 'g');
  content = content.replace(regexRow, `label={lang === 'en' ? '${en}' : '${th}'}`);

  const regexHeader = new RegExp(`title="${th}"`, 'g');
  content = content.replace(regexHeader, `title={lang === 'en' ? '${en}' : '${th}'}`);
}

// Special cases
content = content.replace(
  /label=\{fd\.isThaiNational \? 'เลขบัตรประชาชน' : 'หมายเลขหนังสือเดินทาง'\}/g,
  "label={lang === 'en' ? 'ID Card / Passport' : (fd.isThaiNational ? 'เลขบัตรประชาชน' : 'หมายเลขหนังสือเดินทาง')}"
);
content = content.replace(
  /label="Work Permit \/ สิทธิ์ทำงานในไทย"/g,
  "label={lang === 'en' ? 'Work Permit' : 'Work Permit / สิทธิ์ทำงานในไทย'}"
);
content = content.replace(
  /value=\{fd\.availableToWorkInThailand \? '✅ มีสิทธิ์ทำงานในประเทศไทย' : '⚠️ ยังไม่มีสิทธิ์ทำงานในประเทศไทย'\}/g,
  "value={fd.availableToWorkInThailand ? (lang === 'en' ? '✅ Eligible to work in Thailand' : '✅ มีสิทธิ์ทำงานในประเทศไทย') : (lang === 'en' ? '⚠️ Not eligible to work in Thailand yet' : '⚠️ ยังไม่มีสิทธิ์ทำงานในประเทศไทย')}"
);
content = content.replace(
  /value=\{fd\.isThaiNational \? 'ไทย' : 'ต่างชาติ'\}/g,
  "value={fd.isThaiNational ? (lang === 'en' ? 'Thai' : 'ไทย') : (lang === 'en' ? 'Foreigner' : 'ต่างชาติ')}"
);
content = content.replace(
  /title="รายละเอียดผู้สมัคร"/g,
  "title={lang === 'en' ? 'Application Details' : 'รายละเอียดผู้สมัคร'}"
);

fs.writeFileSync(file, content);
console.log('Done ApplicationDetailModal.tsx');
