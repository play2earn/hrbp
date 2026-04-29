import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, GraduationCap, Briefcase, MapPin, Phone, Mail, Shield, Clock, AlertTriangle, Heart, Users, Car, Monitor, Globe, FileText, Building2, MessageSquare } from 'lucide-react';

interface SharedProfileViewProps {
  token: string;
}

const EDU_LEVELS: Record<string, string> = {
  primarySchool: 'ประถมศึกษา (ป.1-6)',
  juniorHighSchool: 'มัธยมศึกษาตอนต้น (ม.1-3)',
  highSchool: 'มัธยมปลาย / ปวช.',
  vocational: 'ปวส.',
  bachelor: 'ปริญญาตรี',
  master: 'ปริญญาโท',
  phd: 'ปริญญาเอก',
};

const MILITARY_STATUS_MAP: Record<string, string> = {
  'Completed': 'ผ่านการเกณฑ์ทหารแล้ว',
  'Exempted': 'ได้รับการยกเว้น',
  'Conscripted': 'ผ่านการเกณฑ์ทหารแล้ว',
  'Reserved': 'นักศึกษาวิชาทหาร (รด.)',
  'Pending': 'อยู่ระหว่างการผ่อนผัน',
  'Awaiting Selection': 'จะเข้ารับการตรวจเลือกเร็วๆ นี้',
  'Female': 'ได้รับการยกเว้น - เพศหญิง',
  'Not Yet': 'ยังไม่เกณฑ์ทหาร',
  'N/A (Female)': 'ได้รับการยกเว้น - เพศหญิง',
  'ได้รับการยกเว้น': 'ได้รับการยกเว้น',
  'ผ่านการเกณฑ์ทหารแล้ว': 'ผ่านการเกณฑ์ทหารแล้ว',
  'นักศึกษาวิชาทหาร': 'นักศึกษาวิชาทหาร (รด.)',
  'อยู่ระหว่างการผ่อนผัน': 'อยู่ระหว่างการผ่อนผัน',
  'เพศหญิง (ได้รับการยกเว้น)': 'ได้รับการยกเว้น - เพศหญิง',
  'ROTC': 'จบหลักสูตร รด.',
  'ExemptFemale': 'ได้รับการยกเว้น - เพศหญิง',
  'ExemptLaw': 'ได้รับการยกเว้น - ตามกฎหมาย',
};

const EDU_ORDER = ['primarySchool', 'juniorHighSchool', 'highSchool', 'vocational', 'bachelor', 'master', 'phd'];

export const SharedProfileView: React.FC<SharedProfileViewProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [app, setApp] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await api.getApplicationByShareToken(token);
      if (result.success && result.data) {
        setApp(result.data);
      } else {
        setError(result.error?.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ลิงก์ไม่ถูกต้อง</h2>
          <p className="text-gray-600 text-sm">{error || 'ลิงก์หมดอายุหรือถูกยกเลิก กรุณาติดต่อผู้แชร์ลิงก์เพื่อขอลิงก์ใหม่'}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>ลิงก์แชร์มีอายุ 30 วัน</span>
          </div>
        </div>
      </div>
    );
  }

  const fd = app.form_data || {};
  const fullName = [fd.title, fd.firstName, fd.lastName].filter(Boolean).join(' ') || app.full_name || '-';
  const fullNameEn = [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ');

  const Section = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
        {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value: any }) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
        <span className="text-gray-500 font-medium min-w-[120px]">{label}</span>
        <span className="text-gray-900 font-medium text-right max-w-[65%]">{value}</span>
      </div>
    );
  };

  const InfoGrid = ({ items }: { items: { label: string; value: any }[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
      {items.map((item, i) => <InfoRow key={i} label={item.label} value={item.value} />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-purple-50/30 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/doublea_logo.png" alt="Double A Logo" className="w-8 h-8 rounded-lg flex-shrink-0 object-contain shadow-sm" />
            <span className="font-bold text-gray-900">Double A Network</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/80 rounded-full px-3 py-1.5 border border-gray-200">
            <Shield className="w-3.5 h-3.5" />
            <span>Shared Profile (Read Only)</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-24 h-28 bg-white/20 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white/30">
              {fd.photoUrl || app.photo_url ? (
                <img src={fd.photoUrl || app.photo_url} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white/60" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{fullName}</h1>
              {fullNameEn && <p className="text-white/70 text-sm">{fullNameEn}</p>}
              <p className="text-indigo-200 font-medium mt-1">{fd.position || app.position || '-'}</p>
              <p className="text-indigo-200/70 text-sm">{fd.department || app.department || ''}</p>
              {fd.expectedSalary && <p className="text-white/80 text-xs mt-1">เงินเดือนที่คาดหวัง: {fd.expectedSalary}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-1">

          {/* Contact Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {fd.phone && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <Phone className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-700">{fd.phone}</span>
              </div>
            )}
            {fd.email && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-700 truncate">{fd.email}</span>
              </div>
            )}
            {(fd.currentProvince || fd.registeredProvince) && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-gray-700">{fd.currentProvince || fd.registeredProvince}</span>
              </div>
            )}
          </div>

          {/* ช่องทางที่มา & Links */}
          {(fd.businessUnit || fd.sourceChannel || fd.campaignTag || fd.profileLinks) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fd.businessUnit && (
                <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">BU: {fd.businessUnit}</span>
              )}
              {fd.sourceChannel && (
                <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">CH: {fd.sourceChannel}</span>
              )}
              {fd.campaignTag && (
                <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Tag: {fd.campaignTag}</span>
              )}
              {fd.profileLinks && (
                <a href={fd.profileLinks} target="_blank" rel="noopener noreferrer"
                  className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200 transition underline">
                  🔗 {fd.profileLinks}
                </a>
              )}
            </div>
          )}

          {/* ข้อมูลส่วนตัว (ไทย) */}
          <Section title="ข้อมูลส่วนตัว (ภาษาไทย)" icon={User}>
            <InfoGrid items={[
              { label: 'คำนำหน้า', value: fd.title },
              { label: 'ชื่อ', value: fd.firstName },
              { label: 'นามสกุล', value: fd.lastName },
              { label: 'ชื่อเล่น', value: fd.nickname },
            ]} />
          </Section>

          {/* ข้อมูลส่วนตัว (EN) */}
          {(fd.firstNameEn || fd.lastNameEn) && (
            <Section title="ข้อมูลส่วนตัว (English)" icon={Globe}>
              <InfoGrid items={[
                { label: 'Title', value: fd.titleEn },
                { label: 'First Name', value: fd.firstNameEn },
                { label: 'Last Name', value: fd.lastNameEn },
                { label: 'Nickname', value: fd.nicknameEn },
              ]} />
            </Section>
          )}

          {/* ข้อมูลพื้นฐาน */}
          <Section title="ข้อมูลพื้นฐาน" icon={FileText}>
            <InfoGrid items={[
              { label: 'วันเกิด', value: fd.dateOfBirth },
              { label: 'อายุ', value: fd.age ? `${fd.age} ปี` : null },
              { label: 'ส่วนสูง', value: fd.height ? `${fd.height} ซม.` : null },
              { label: 'น้ำหนัก', value: fd.weight ? `${fd.weight} กก.` : null },
              { label: 'เชื้อชาติ', value: fd.ethnicity },
              { label: 'สัญชาติ', value: fd.nationality },
              { label: 'ศาสนา', value: fd.religion },
              { label: 'เลขบัตรประชาชน', value: fd.idCardNumber },
              { label: 'วันออกบัตร', value: fd.idCardIssueDate },
              { label: 'วันหมดอายุบัตร', value: fd.idCardExpiryDate },
              { label: 'สถานภาพ', value: fd.maritalStatus },
              { label: 'สถานะทหาร', value: MILITARY_STATUS_MAP[fd.militaryStatus] || fd.militaryStatus },
              { label: 'Line ID', value: fd.lineId },
            ]} />
          </Section>

          {/* ที่อยู่ */}
          {(fd.registeredAddress || fd.currentAddress) && (
            <Section title="ที่อยู่" icon={MapPin}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {fd.registeredAddress && (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      ที่อยู่ตามทะเบียนบ้าน
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">{fd.registeredAddress}</p>
                    {fd.registeredProvince && (
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {[fd.registeredDistrict, fd.registeredSubDistrict, fd.registeredProvince, fd.registeredPostalCode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {fd.currentAddress && (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      ที่อยู่ปัจจุบัน
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">{fd.currentAddress}</p>
                    {fd.currentProvince && (
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {[fd.currentDistrict, fd.currentSubDistrict, fd.currentProvince, fd.currentPostalCode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ข้อมูลครอบครัว */}
          {(fd.fatherName || fd.motherName || fd.spouseName || fd.childrenCount !== undefined) && (
            <Section title="ข้อมูลครอบครัว" icon={Users}>
              <InfoGrid items={[
                { label: 'ชื่อบิดา', value: fd.fatherName },
                { label: 'อายุ/อาชีพบิดา', value: [fd.fatherAge ? `${fd.fatherAge} ปี` : '', fd.fatherOccupation].filter(Boolean).join(' / ') || null },
                { label: 'ชื่อมารดา', value: fd.motherName },
                { label: 'อายุ/อาชีพมารดา', value: [fd.motherAge ? `${fd.motherAge} ปี` : '', fd.motherOccupation].filter(Boolean).join(' / ') || null },
                { label: 'ชื่อคู่สมรส', value: fd.spouseName },
                { label: 'อายุคู่สมรส', value: fd.spouseAge ? `${fd.spouseAge} ปี` : null },
                { label: 'อาชีพคู่สมรส', value: fd.spouseOccupation },
                { label: 'จำนวนบุตร', value: fd.childrenCount !== undefined ? fd.childrenCount : null },
                { label: 'จำนวนพี่น้อง', value: fd.siblingCount !== undefined ? fd.siblingCount : null },
              ]} />
            </Section>
          )}

          {/* การศึกษา */}
          {fd.education && (
            <Section title="ประวัติการศึกษา" icon={GraduationCap}>
              <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-bold text-[11px] uppercase tracking-wider">ระดับ</th>
                      <th className="text-left py-3 px-4 font-bold text-[11px] uppercase tracking-wider">สถาบัน / สาขา</th>
                      <th className="text-center py-3 px-4 font-bold text-[11px] uppercase tracking-wider">GPA</th>
                      <th className="text-center py-3 px-4 font-bold text-[11px] uppercase tracking-wider">ช่วงเวลา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {EDU_ORDER.map(key => {
                      const edu = fd.education?.[key];
                      if (!edu?.institute) return null;
                      return (
                        <tr key={key} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="py-4 px-4 align-top">
                            <span className="font-bold text-indigo-700 block whitespace-nowrap">{EDU_LEVELS[key]}</span>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="font-semibold text-gray-900">{edu.institute}</div>
                            {edu.major && <div className="text-gray-500 text-xs mt-0.5">{edu.major}</div>}
                          </td>
                          <td className="py-4 px-4 text-center align-top font-medium text-slate-600">
                            {edu.gpa || '-'}
                          </td>
                          <td className="py-4 px-4 text-center align-top text-xs text-slate-500 whitespace-nowrap">
                            {edu.startDate && edu.endDate ? `${edu.startDate} – ${edu.endDate}` : edu.endDate || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ประสบการณ์ทำงาน */}
          {fd.experience && fd.experience.length > 0 && (
            <Section title="ประวัติการทำงาน (Experience)" icon={Briefcase}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left py-2 px-3 font-medium border-b">บริษัท</th>
                      <th className="text-left py-2 px-3 font-medium border-b">ตำแหน่ง</th>
                      <th className="text-center py-2 px-3 font-medium border-b">ช่วงเวลา</th>
                      <th className="text-right py-2 px-3 font-medium border-b">เงินเดือน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fd.experience.map((exp: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-medium">{exp.company || '-'}</td>
                        <td className="py-2 px-3">{exp.position || '-'}</td>
                        <td className="py-2 px-3 text-center text-xs">{exp.from || '-'} — {exp.to || 'ปัจจุบัน'}</td>
                        <td className="py-2 px-3 text-right">{exp.salary || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ทักษะภาษา */}
          {(fd.englishSkill || fd.chineseSkill || fd.otherLang) && (
            <Section title="ทักษะภาษา" icon={Globe}>
              <InfoGrid items={[
                { label: 'ภาษาอังกฤษ', value: fd.englishSkill ? `${fd.englishSkill}${fd.englishScore ? ` (${fd.englishScore})` : ''}` : null },
                { label: 'ภาษาจีน', value: fd.chineseSkill ? `${fd.chineseSkill}${fd.chineseScore ? ` (${fd.chineseScore})` : ''}` : null },
                { label: 'ภาษาอื่น', value: fd.otherLang || null },
              ]} />
            </Section>
          )}

          {/* ทักษะคอมพิวเตอร์ */}
          {fd.computerSkills && (
            <Section title="ทักษะคอมพิวเตอร์" icon={Monitor}>
              <InfoGrid items={[
                { label: 'MS Word', value: fd.computerSkills.word },
                { label: 'MS Excel', value: fd.computerSkills.excel },
                { label: 'PowerPoint', value: fd.computerSkills.powerpoint },
                { label: 'Google Sheets', value: fd.computerSkills.sheets },
                { label: 'Google Docs', value: fd.computerSkills.docs },
                { label: 'Canva', value: fd.graphicsSkills?.canva },
                { label: 'Video Editor', value: fd.graphicsSkills?.videoEditor },
              ]} />
            </Section>
          )}

          {/* การขับขี่ */}
          {fd.driving && (
            <Section title="การขับขี่" icon={Car}>
              <InfoGrid items={[
                { label: 'รถจักรยานยนต์', value: fd.driving.motorcycle ? 'ได้' : 'ไม่ได้' },
                { label: 'ใบขับขี่รถจักรยานยนต์', value: fd.driving.motorcycleLicense ? 'มี' : 'ไม่มี' },
                { label: 'รถยนต์', value: fd.driving.car ? 'ได้' : 'ไม่ได้' },
                { label: 'ใบขับขี่รถยนต์', value: fd.driving.carLicense ? 'มี' : 'ไม่มี' },
                { label: 'ประเภทใบขับขี่', value: fd.driving.licenseClasses?.join(', ') || null },
              ]} />
            </Section>
          )}

          {/* ความสามารถอื่นๆ */}
          {(fd.specialAbility || fd.hobbies) && (
            <Section title="ความสามารถอื่นๆ">
              <InfoGrid items={[
                { label: 'ความสามารถพิเศษ', value: fd.specialAbility },
                { label: 'งานอดิเรก', value: fd.hobbies },
              ]} />
            </Section>
          )}

          {/* แบบสอบถาม */}
          {(fd.strength || fd.weakness || fd.jobCriteria || fd.interests || fd.upcountryLocations?.length > 0) && (
            <Section title="แบบสอบถาม" icon={MessageSquare}>
              <InfoGrid items={[
                { label: 'พื้นที่ต่างจังหวัด', value: fd.upcountryLocations?.length > 0 ? fd.upcountryLocations.join(', ') : null },
                { label: 'จุดแข็ง', value: fd.strength },
                { label: 'จุดอ่อน', value: fd.weakness },
                { label: 'งานที่ไม่ถนัด', value: fd.lessFitTask },
                { label: 'หลักการทำงาน', value: fd.principles },
                { label: 'วิธีแก้ปัญหา', value: fd.troubleResolve },
                { label: 'เกณฑ์เลือกงาน', value: fd.jobCriteria },
                { label: 'ความสนใจ', value: fd.interests },
                { label: 'Digital Transform', value: fd.digitalTransformOpinion },
              ]} />
            </Section>
          )}

          {/* สุขภาพ */}
          {(fd.hasChronicDisease !== undefined || fd.hasSurgery !== undefined || fd.hasMedicalRecord !== undefined) && (
            <Section title="สุขภาพ" icon={Heart}>
              <InfoGrid items={[
                { label: 'โรคประจำตัว', value: fd.hasChronicDisease ? (fd.chronicDiseaseDetail || 'มี') : 'ไม่มี' },
                { label: 'ประวัติผ่าตัด', value: fd.hasSurgery ? (fd.surgeryDetail || 'มี') : 'ไม่มี' },
                { label: 'ประวัติการรักษา', value: fd.hasMedicalRecord ? (fd.medicalRecordDetail || 'มี') : 'ไม่มี' },
              ]} />
            </Section>
          )}

          {/* ผู้ติดต่อฉุกเฉิน */}
          {(fd.emergencyContactName || fd.emergencyContactPhone) && (
            <Section title="ผู้ติดต่อฉุกเฉิน" icon={Phone}>
              <InfoGrid items={[
                { label: 'ชื่อ-สกุล', value: fd.emergencyContactName },
                { label: 'ความสัมพันธ์', value: fd.emergencyContactRelation },
                { label: 'เบอร์โทร', value: fd.emergencyContactPhone },
                { label: 'บริษัท', value: fd.emergencyContactCompany },
                { label: 'ตำแหน่ง', value: fd.emergencyContactPosition },
              ]} />
            </Section>
          )}

          {/* เอกสารแนบ */}
          {(fd.resumeUrl || fd.certificateUrl || fd.transcriptUrl) && (
            <Section title="เอกสารแนบ" icon={FileText}>
              <div className="flex flex-wrap gap-2">
                {fd.resumeUrl && (
                  <a href={fd.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm text-indigo-700 font-medium transition">
                    📄 Resume
                  </a>
                )}
                {fd.certificateUrl && (
                  <a href={fd.certificateUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 font-medium transition">
                    📋 เอกสารแนบ
                  </a>
                )}
                {fd.transcriptUrl && (
                  <a href={fd.transcriptUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm text-emerald-700 font-medium transition">
                    🎓 Transcript
                  </a>
                )}
              </div>
            </Section>
          )}

          {/* ===== หนังสือยินยอมและรับรอง ===== */}
          <div className="mb-6 mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">หนังสือยินยอมและรับรอง</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed text-center mb-4">
              ข้าพเจ้าได้อ่าน ศึกษาเอกสารและพิจารณาคำยินยอมจากผู้ให้ข้อมูลกับบริษัทฯ ข้าพเจ้าขอรับรองว่า รายละเอียดทั้งหมดที่ให้ไว้ในใบสมัครงานนี้ ถูกต้องและเป็นความจริงทุกประการ หากภายหลังบริษัทฯ ตรวจพบว่าข้อใดเป็นเท็จ ข้าพเจ้ายินยอมให้บริษัทฯบอกเลิกการว่าจ้างข้าพเจ้าได้ทันที
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ผู้สมัคร)</p>
                <p className="text-sm font-semibold mt-1">{[fd.title, fd.firstName, fd.lastName].filter(Boolean).join(' ') || '-'}</p>
              </div>
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">ตำแหน่ง</p>
                <p className="text-sm font-semibold mt-1">{fd.position || app.position || '-'}</p>
              </div>
            </div>
            <p className="text-center mt-3 text-xs text-gray-500">
              ผู้สมัครงาน &nbsp;|&nbsp; {app.created_at ? new Date(app.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* ===== รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล (Privacy Notice) ===== */}
          <div className="mb-6 mt-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>หนังสือนี้จัดทำขึ้นเพื่อชี้แจงรายละเอียดเกี่ยวกับข้อมูลส่วนบุคคลระหว่างบริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน) ("บริษัทฯ") และผู้ที่มีความประสงค์จะสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ ("ผู้สมัครงาน") ตามหลักเกณฑ์และนโยบายของบริษัทฯ ดังนี้</p>
              <div>
                <p className="font-bold">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</p>
                <p className="ml-4 mt-1 text-gray-600">บริษัทฯ จะเก็บ รวบรวม ใช้ ประมวลผล และเปิดเผยข้อมูลส่วนบุคคลของผู้สมัครงาน ได้แก่ ชื่อ นามสกุล เลขประจำตัวประชาชน ที่อยู่ ประวัติการศึกษา ประวัติการทำงานหรือการอบรม ประวัติการเกณฑ์ทหาร อีเมล เบอร์โทรศัพท์ ข้อมูลตามที่ผู้สมัครงานระบุใน Resume และ CV ที่ผู้สมัครนำส่งให้บริษัทฯ ที่ไม่ใช่ข้อมูลอ่อนไหว เพื่อประโยชน์ของผู้สมัครงานในการยืนยันตัวบุคคลของผู้สมัครงาน และเพื่อการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทฯ</p>
              </div>
              <div>
                <p className="font-bold">2. การเปิดเผยข้อมูลส่วนบุคคล</p>
                <p className="ml-4 mt-1 text-gray-600">บริษัทฯ อาจเปิดเผยข้อมูลส่วนบุคคลของผู้สมัครงานต่อบริษัทในเครือพันธมิตรของบริษัทฯ เพื่อผลประโยชน์ของผู้สมัครงานในการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทในเครือพันธมิตรของบริษัทฯ</p>
              </div>
              <div>
                <p className="font-bold">3. การประมวลผลข้อมูล</p>
                <p className="ml-4 mt-1 text-gray-600">ข้อมูลส่วนบุคคลของผู้สมัครงานจะถูกประมวลผลโดยผู้ที่ได้รับอนุมัติจากบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ เพื่อการพิจารณารับบุคคลเข้าทำงาน</p>
              </div>
              <div>
                <p className="font-bold">4. ระยะเวลาในการจัดเก็บข้อมูล</p>
                <p className="ml-4 mt-1 text-gray-600">บริษัทฯ จะเก็บข้อมูลส่วนบุคคลของผู้สมัครงานเพื่อการดำเนินการตามวัตถุประสงค์เป็นระยะเวลา 5 ปี นับแต่วันที่ผู้สมัครงานทำการสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ</p>
              </div>
              <div>
                <p className="font-bold">5. สิทธิของผู้สมัครงาน</p>
                <p className="ml-4 mt-1 text-gray-600">รายละเอียดปรากฏตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 นโยบายคุ้มครองข้อมูลส่วนบุคคลของบริษัทฯ เรื่อง "สิทธิของเจ้าของข้อมูล"</p>
                <p className="ml-4 mt-1 text-gray-600">กรณีที่ผู้สมัครงานต้องการเข้าถึง แก้ไข ลบข้อมูลส่วนบุคคลที่ให้ไว้แก่บริษัทฯ ผู้สมัครงานสามารถติดต่อมายังบริษัทฯ เพื่อยื่นคำขอผ่านช่องทางการติดต่อดังนี้</p>
              </div>
              <div className="ml-4 bg-gray-100 border border-gray-200 rounded p-3 text-xs space-y-1">
                <p><strong>ผู้ควบคุมข้อมูลส่วนบุคคล:</strong> บริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน)</p>
                <p><strong>สถานที่ติดต่อ:</strong> ฝ่ายสรรหาและคัดเลือกบุคลากร</p>
                <p className="pl-16">187/3 หมู่ที่ 1 ถนนบางนา-ตราด กม. 42 ตำบลบางวัว อำเภอบางปะกง</p>
                <p className="pl-16">จังหวัดฉะเชิงเทรา 24180</p>
                <p><strong>Email:</strong> recruit@doublea1991.com</p>
              </div>
              <p className="ml-4 text-gray-600">ผู้สมัครงานสามารถตรวจสอบรายละเอียดเกี่ยวกับสิทธิอื่นๆ ได้ที่ <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://www.doubleapaper.com/privacy-policy</a></p>
              <p className="ml-4 text-gray-600">ทั้งนี้ผู้สมัครงานยืนยันว่าข้อมูลส่วนบุคคลของบุคคลที่สามที่ผู้สมัครงานให้แก่บริษัทฯ ถูกต้อง และเจ้าของข้อมูลส่วนบุคคลทราบถึงการเปิดเผยข้อมูลดังกล่าวแก่บริษัทฯ แล้ว</p>
              <p className="font-semibold">ผู้สมัครงาน อ่าน เข้าใจ และรายละเอียดซึ่งระบุไว้ข้างต้นแล้ว โดยยอมรับรองว่าข้อมูลที่นำส่งให้แก่บริษัทฯ เพื่อการประมวลผลข้อมูลนั้นถูกต้อง และเป็นความจริงทุกประการ</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ผู้สมัคร)</p>
                <p className="text-sm font-semibold mt-1">{[fd.title, fd.firstName, fd.lastName].filter(Boolean).join(' ') || '-'}</p>
              </div>
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">วัน/เดือน/ปี</p>
                <p className="text-sm font-semibold mt-1">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

          </div>

          {/* ===== ความยินยอมในการประมวลผลข้อมูล ===== */}
          <div className="mb-6 mt-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">ความยินยอมในการประมวลผลข้อมูล</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed bg-gray-50 rounded-lg p-4">
              <p>ผู้สมัครงานให้บริษัทฯ เก็บ รวบรวม ใช้ ประมวลผล ข้อมูลส่วนบุคคลที่มีอยู่ในข้อมูลผู้สมัครงานเพื่อการดำเนินงานในการทำงาน ได้แก่ เพื่อการพิจารณาจ้างงานและการบริหารจัดการแรงงานของบริษัทฯ</p>
              <p>ทั้งนี้ยินยอมให้จัดเก็บและใช้งานข้อมูลดังกล่าวเป็นระยะเวลา 5 ปี นับแต่วันที่สมัครงาน</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">ชื่อ-นามสกุล (ผู้สมัคร)</p>
                <p className="text-sm font-semibold mt-1">{[fd.title, fd.firstName, fd.lastName].filter(Boolean).join(' ') || '-'}</p>
              </div>
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">วัน/เดือน/ปี</p>
                <p className="text-sm font-semibold mt-1">{new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 text-center">
          <p className="text-xs text-gray-400">
            ลิงก์แชร์มีอายุ 30 วัน · สร้างจากระบบ Double A Network · เอกสารใช้ภายในเท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
};
