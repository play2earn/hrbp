const fs = require('fs');
const file = '/Users/gamma/Documents/VibeCode/ALL/hrbp/components/dashboard/ApplicationDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Age, Height, Weight
content = content.replace(/fd\.age \? `\$\{fd\.age\} ปี`/g, "fd.age ? `${fd.age} ${lang === 'en' ? 'Years' : 'ปี'}`");
content = content.replace(/fd\.height \? `\$\{fd\.height\} ซม\`/g, "fd.height ? `${fd.height} ${lang === 'en' ? 'cm' : 'ซม.'}`");
content = content.replace(/fd\.weight \? `\$\{fd\.weight\} กก\`/g, "fd.weight ? `${fd.weight} ${lang === 'en' ? 'kg' : 'กก.'}`");

// Address labels
content = content.replace(/<span className="text-gray-500 font-medium">ที่อยู่ตามทะเบียนบ้าน:<\/span>/g, '<span className="text-gray-500 font-medium">{lang === \'en\' ? \'Registered Address:\' : \'ที่อยู่ตามทะเบียนบ้าน:\'}</span>');
content = content.replace(/<span className="text-gray-500 font-medium">ที่อยู่ปัจจุบัน:<\/span>/g, '<span className="text-gray-500 font-medium">{lang === \'en\' ? \'Current Address:\' : \'ที่อยู่ปัจจุบัน:\'}</span>');

// Address prefixes
content = content.replace(/ต\.\$\{/g, "${lang === 'en' ? 'Sub-district ' : 'ต.'}${");
content = content.replace(/อ\.\$\{/g, "${lang === 'en' ? 'District ' : 'อ.'}${");
content = content.replace(/จ\.\$\{/g, "${lang === 'en' ? 'Province ' : 'จ.'}${");

// Family headers
content = content.replace(/>ความสัมพันธ์<\/th>/g, '>{lang === \'en\' ? \'Relationship\' : \'ความสัมพันธ์\'}</th>');
content = content.replace(/>ชื่อ-สกุล<\/th>/g, '>{lang === \'en\' ? \'Full Name\' : \'ชื่อ-สกุล\'}</th>');
content = content.replace(/>อายุ<\/th>/g, '>{lang === \'en\' ? \'Age\' : \'อายุ\'}</th>');
content = content.replace(/>อาชีพ<\/th>/g, '>{lang === \'en\' ? \'Occupation\' : \'อาชีพ\'}</th>');

// Family values
content = content.replace(/>บิดา<\/td>/g, '>{lang === \'en\' ? \'Father\' : \'บิดา\'}</td>');
content = content.replace(/>มารดา<\/td>/g, '>{lang === \'en\' ? \'Mother\' : \'มารดา\'}</td>');
content = content.replace(/rel: 'บิดา'/g, "rel: lang === 'en' ? 'Father' : 'บิดา'");
content = content.replace(/rel: 'มารดา'/g, "rel: lang === 'en' ? 'Mother' : 'มารดา'");
content = content.replace(/ชื่อ:/g, "{lang === 'en' ? 'Name:' : 'ชื่อ:'}");
content = content.replace(/อายุ:/g, "{lang === 'en' ? 'Age:' : 'อายุ:'}");
content = content.replace(/อาชีพ:/g, "{lang === 'en' ? 'Occupation:' : 'อาชีพ:'}");

// Education headers
content = content.replace(/>ระดับ<\/th>/g, '>{lang === \'en\' ? \'Level\' : \'ระดับ\'}</th>');
content = content.replace(/>สถาบัน<\/th>/g, '>{lang === \'en\' ? \'Institute\' : \'สถาบัน\'}</th>');
content = content.replace(/>สาขา<\/th>/g, '>{lang === \'en\' ? \'Major\' : \'สาขา\'}</th>');
content = content.replace(/>ปี<\/th>/g, '>{lang === \'en\' ? \'Year\' : \'ปี\'}</th>');

// Experience headers
content = content.replace(/>ช่วงเวลา<\/th>/g, '>{lang === \'en\' ? \'Period\' : \'ช่วงเวลา\'}</th>');
content = content.replace(/>บริษัท<\/th>/g, '>{lang === \'en\' ? \'Company\' : \'บริษัท\'}</th>');
content = content.replace(/>ตำแหน่ง<\/th>/g, '>{lang === \'en\' ? \'Position\' : \'ตำแหน่ง\'}</th>');
content = content.replace(/>เงินเดือน<\/th>/g, '>{lang === \'en\' ? \'Salary\' : \'เงินเดือน\'}</th>');
content = content.replace(/>หน้าที่<\/th>/g, '>{lang === \'en\' ? \'Responsibilities\' : \'หน้าที่\'}</th>');
content = content.replace(/>ปัจจุบัน<\/td>/g, '>{lang === \'en\' ? \'Present\' : \'ปัจจุบัน\'}</td>');
content = content.replace(/'ปัจจุบัน'/g, "lang === 'en' ? 'Present' : 'ปัจจุบัน'");

// Education values
const eduObjMatch = `const levelNames: Record<string, string> = {
                            primarySchool: 'ประถมศึกษา (ป.1-6)', juniorHighSchool: 'มัธยมต้น (ม.1-3)',
                            highSchool: 'มัธยมปลาย / ปวช.', vocational: 'ปวส.',
                            bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', phd: 'ปริญญาเอก',
                          };`;
const eduObjReplace = `const levelNames: Record<string, string> = lang === 'en' ? {
                            primarySchool: 'Primary School', juniorHighSchool: 'Junior High School',
                            highSchool: 'High School / Voc.Cert.', vocational: 'Higher Vocational',
                            bachelor: 'Bachelor', master: 'Master', phd: 'Ph.D.',
                          } : {
                            primarySchool: 'ประถมศึกษา (ป.1-6)', juniorHighSchool: 'มัธยมต้น (ม.1-3)',
                            highSchool: 'มัธยมปลาย / ปวช.', vocational: 'ปวส.',
                            bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', phd: 'ปริญญาเอก',
                          };`;
content = content.split(eduObjMatch).join(eduObjReplace);

// Military mapping
content = content.replace(/value=\{getMilitaryStatusLabel\(fd\.militaryStatus\)\}/g, "value={lang === 'en' ? fd.militaryStatus : getMilitaryStatusLabel(fd.militaryStatus)}");

fs.writeFileSync(file, content);
console.log('Done fix-modal.js');
