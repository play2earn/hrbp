import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, GraduationCap, Briefcase, MapPin, Phone, Mail, Shield, Clock, AlertTriangle, Heart, Users, Car, Monitor, Globe, FileText, Building2, MessageSquare } from 'lucide-react';

interface SharedProfileViewProps {
  token: string;
}

const EDU_LEVEL_MAP: Record<string, Record<string, string>> = {
  th: {
    primarySchool: 'ประถมศึกษา (ป.1-6)',
    juniorHighSchool: 'มัธยมศึกษาตอนต้น (ม.1-3)',
    highSchool: 'มัธยมปลาย / ปวช.',
    vocational: 'ปวส.',
    bachelor: 'ปริญญาตรี',
    master: 'ปริญญาโท',
    phd: 'ปริญญาเอก',
  },
  en: {
    primarySchool: 'Primary School',
    juniorHighSchool: 'Junior High School',
    highSchool: 'High School / Vocational',
    vocational: 'Higher Vocational (Diploma)',
    bachelor: 'Bachelor\'s Degree',
    master: 'Master\'s Degree',
    phd: 'Doctorate (Ph.D.)',
  }
};

const MILITARY_STATUS_MAP: Record<string, Record<string, string>> = {
  th: {
    'Completed': 'ผ่านการเกณฑ์ทหารแล้ว',
    'Exempted': 'ได้รับการยกเว้น',
    'Conscripted': 'ผ่านการเกณฑ์ทหารแล้ว',
    'Reserved': 'นักศึกษาวิชาทหาร (รด.)',
    'Pending': 'อยู่ระหว่างการผ่อนผัน',
    'Awaiting Selection': 'จะเข้ารับการตรวจเลือกเร็วๆ นี้',
    'Female': 'ได้รับการยกเว้น - เพศหญิง',
    'Not Yet': 'ยังไม่เกณฑ์ทหาร',
    'N/A (Female)': 'ได้รับการยกเว้น - เพศหญิง',
    'ROTC': 'จบหลักสูตร รด.',
    'ExemptFemale': 'ได้รับการยกเว้น - เพศหญิง',
    'ExemptLaw': 'ได้รับการยกเว้น - ตามกฎหมาย',
  },
  en: {
    'Completed': 'Completed',
    'Exempted': 'Exempted',
    'Conscripted': 'Completed',
    'Reserved': 'ROTC Reserved',
    'Pending': 'Pending / Deferred',
    'Awaiting Selection': 'Awaiting Selection',
    'Female': 'Exempted (Female)',
    'Not Yet': 'Not Yet',
    'N/A (Female)': 'Exempted (Female)',
    'ROTC': 'ROTC Completed',
    'ExemptFemale': 'Exempted (Female)',
    'ExemptLaw': 'Exempted by Law',
  }
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
        const appData = result.data;
        // Legacy data fallback: if foreigner but missing positionEn, try to fetch it
        if (appData.form_data && appData.form_data.isThaiNational === false && !appData.form_data.positionEn && appData.form_data.position) {
          try {
            const posResult = await api.master.getAll('positions');
            if (posResult.success && posResult.data) {
              const matchedPos = posResult.data.find((p: any) => p.name_th === appData.form_data.position);
              if (matchedPos && matchedPos.name_en) {
                appData.form_data.positionEn = matchedPos.name_en;
              }
            }
          } catch (e) {
            console.error('Failed to fetch positions for legacy mapping', e);
          }
        }
        setApp(appData);
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
          <p className="text-gray-500 text-sm">Loading data...</p>
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600 text-sm">{error || 'The link has expired or been revoked. Please contact the sender for a new link.'}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Share links expire in 30 days</span>
          </div>
        </div>
      </div>
    );
  }

  const fd = app.form_data || {};
  const isForeigner = fd.isThaiNational === false;
  const lang = isForeigner ? 'en' : 'th';

  const hasThaiName = fd.firstName && fd.lastName;
  const fullName = hasThaiName
    ? [fd.title, fd.firstName, fd.lastName].filter(Boolean).join(' ')
    : [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ') || app.full_name || '-';
  const fullNameEn = hasThaiName ? [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ') : null;

  const labels = {
    th: {
      quickInfo: 'ข้อมูลติดต่อ',
      personalTh: 'ข้อมูลส่วนตัว (ภาษาไทย)',
      personalEn: 'ข้อมูลส่วนตัว (English)',
      basicInfo: 'ข้อมูลพื้นฐาน',
      address: 'ที่อยู่',
      registeredAddress: 'ที่อยู่ตามทะเบียนบ้าน',
      currentAddress: 'ที่อยู่ปัจจุบัน',
      family: 'ข้อมูลครอบครัว',
      education: 'ประวัติการศึกษา',
      experience: 'ประวัติการทำงาน',
      language: 'ทักษะภาษา',
      computer: 'ทักษะคอมพิวเตอร์',
      driving: 'การขับขี่',
      otherSkills: 'ความสามารถอื่นๆ',
      questionnaire: 'แบบสอบถาม',
      health: 'สุขภาพ',
      emergency: 'ผู้ติดต่อฉุกเฉิน',
      attachments: 'เอกสารแนบ',
      expectedSalary: 'เงินเดือนที่คาดหวัง',
      age: 'อายุ',
      height: 'ส่วนสูง',
      weight: 'น้ำหนัก',
      ethnicity: 'เชื้อชาติ',
      nationality: 'สัญชาติ',
      religion: 'ศาสนา',
      idCard: 'เลขบัตรประชาชน',
      passport: 'หมายเลขหนังสือเดินทาง',
      workPermit: 'Work Permit / สิทธิ์ทำงานในไทย',
      hasWorkPermit: '✅ มีสิทธิ์ทำงานในประเทศไทย',
      noWorkPermit: '⚠️ ยังไม่มีสิทธิ์ทำงานในประเทศไทย',
      maritalStatus: 'สถานภาพ',
      militaryStatus: 'สถานะทหาร',
      father: 'บิดา',
      mother: 'มารดา',
      deceased: 'เสียชีวิตแล้ว (Deceased)',
      resume: 'Resume',
      certificate: 'เอกสารแนบ',
      transcript: 'Transcript',
      consent: 'หนังสือยินยอมและรับรอง',
      privacyNotice: 'รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล',
      consentProcessing: 'ความยินยอมในการประมวลผลข้อมูล',
      applicantName: 'ชื่อ-นามสกุล (ผู้สมัคร)',
      date: 'วัน/เดือน/ปี',
      signature: 'ลงชื่อ ผู้สมัคร',
      loading: 'กำลังโหลดข้อมูล...',
      invalidLink: 'ลิงก์ไม่ถูกต้อง',
      expiredLink: 'ลิงก์หมดอายุหรือถูกยกเลิก กรุณาติดต่อผู้แชร์ลิงก์เพื่อขอลิงก์ใหม่',
      linkLife: 'ลิงก์แชร์มีอายุ 30 วัน',
    },
    en: {
      quickInfo: 'Contact Info',
      personalTh: 'Personal Info (Thai)',
      personalEn: 'Personal Info (English)',
      basicInfo: 'Basic Information',
      address: 'Address',
      registeredAddress: 'Registered Address',
      currentAddress: 'Current Address',
      family: 'Family Information',
      education: 'Education History',
      experience: 'Work Experience',
      language: 'Language Skills',
      computer: 'Computer Skills',
      driving: 'Driving Skills',
      otherSkills: 'Other Skills',
      questionnaire: 'Questionnaire',
      health: 'Health',
      emergency: 'Emergency Contact',
      attachments: 'Attachments',
      expectedSalary: 'Expected Salary',
      age: 'Age',
      height: 'Height',
      weight: 'Weight',
      ethnicity: 'Ethnicity',
      nationality: 'Nationality',
      religion: 'Religion',
      idCard: 'National ID',
      passport: 'Passport No.',
      workPermit: 'Work Permit / Eligibility',
      hasWorkPermit: '✅ Eligible to work in Thailand',
      noWorkPermit: '⚠️ Not yet eligible to work in Thailand',
      maritalStatus: 'Marital Status',
      militaryStatus: 'Military Status',
      father: 'Father',
      mother: 'Mother',
      deceased: 'Deceased',
      resume: 'Resume',
      certificate: 'Other Docs',
      transcript: 'Transcript',
      consent: 'Confirmation & Consent',
      privacyNotice: 'Privacy Notice',
      consentProcessing: 'Consent to Processing',
      applicantName: 'Applicant Full Name',
      date: 'Date',
      signature: 'Applicant Signature',
      loading: 'Loading data...',
      invalidLink: 'Invalid Link',
      expiredLink: 'The link has expired or been revoked. Please contact the sender for a new link.',
      linkLife: 'Share links expire in 30 days',
    }
  }[lang];

  const t = labels;

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
            <img src="/doublea_logo.png" alt="Double A Logo" className="w-8 h-8 flex-shrink-0 object-contain" />
            <span className="font-bold text-gray-900">
              <span className="text-blue-700 italic">Double A</span> Alliance
            </span>
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
              <p className="text-indigo-200 font-medium mt-1">{isForeigner ? (fd.positionEn || fd.position || app.position || '-') : (fd.position || app.position || '-')}</p>
              <p className="text-indigo-200/70 text-sm">{fd.department || app.department || ''}</p>
              {fd.expectedSalary && <p className="text-white/80 text-xs mt-1">{t.expectedSalary}: {fd.expectedSalary}</p>}
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
          {(!isForeigner || fd.firstName) && (
            <Section title={t.personalTh} icon={User}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'คำนำหน้า' : 'Title (TH)', value: fd.title },
                { label: lang === 'th' ? 'ชื่อ' : 'First Name (TH)', value: fd.firstName },
                { label: lang === 'th' ? 'นามสกุล' : 'Last Name (TH)', value: fd.lastName },
                { label: lang === 'th' ? 'ชื่อเล่น' : 'Nickname (TH)', value: fd.nickname },
              ]} />
            </Section>
          )}

          {/* ข้อมูลส่วนตัว (EN) */}
          {(isForeigner || fd.firstNameEn) && (
            <Section title={t.personalEn} icon={Globe}>
              <InfoGrid items={[
                { label: 'Title (EN)', value: fd.titleEn },
                { label: 'First Name (EN)', value: fd.firstNameEn },
                { label: 'Last Name (EN)', value: fd.lastNameEn },
                { label: 'Nickname (EN)', value: fd.nicknameEn },
              ]} />
            </Section>
          )}

          {/* ข้อมูลพื้นฐาน */}
          <Section title={t.basicInfo} icon={FileText}>
            <InfoGrid items={[
              { label: lang === 'th' ? 'วันเกิด' : 'Date of Birth', value: fd.dateOfBirth },
              { label: t.age, value: fd.age ? `${fd.age} ${lang === 'th' ? 'ปี' : 'Years'}` : null },
              { label: t.height, value: fd.height ? `${fd.height} ${lang === 'th' ? 'ซม.' : 'cm'}` : null },
              { label: t.weight, value: fd.weight ? `${fd.weight} ${lang === 'th' ? 'กก.' : 'kg'}` : null },
              { label: t.ethnicity, value: fd.ethnicity },
              { label: t.nationality, value: fd.isThaiNational !== undefined ? (fd.isThaiNational ? (lang === 'th' ? 'ไทย' : 'Thai') : (lang === 'th' ? 'ต่างชาติ' : 'Foreigner')) : fd.nationality },
              { label: t.religion, value: fd.religion },
              { label: isForeigner ? t.passport : t.idCard, value: isForeigner ? fd.passportNo : (fd.nationalId || fd.idCardNumber) },
              ...(isForeigner ? [{ label: t.workPermit, value: fd.availableToWorkInThailand ? t.hasWorkPermit : t.noWorkPermit }] : []),
              { label: lang === 'th' ? 'วันออกบัตร' : 'Issue Date', value: fd.idCardIssueDate },
              { label: lang === 'th' ? 'วันหมดอายุบัตร' : 'Expiry Date', value: fd.idCardExpiryDate },
              { label: t.maritalStatus, value: fd.maritalStatus },
              { label: t.militaryStatus, value: MILITARY_STATUS_MAP[lang][fd.militaryStatus] || fd.militaryStatus },
              { label: 'Line ID', value: fd.lineId },
            ]} />
          </Section>

          {/* ที่อยู่ */}
          {(fd.registeredAddress || fd.currentAddress) && (
            <Section title={t.address} icon={MapPin}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {fd.registeredAddress && (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      {t.registeredAddress}
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">{fd.registeredAddress}</p>
                    {(fd.registeredProvince || fd.registeredDistrict) && (
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {[fd.registeredDistrict, fd.registeredSubDistrict, fd.registeredProvince, fd.registeredPostalCode || fd.registeredPostcode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {fd.currentAddress && (
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      {t.currentAddress}
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">{fd.currentAddress}</p>
                    {(fd.currentProvince || fd.currentDistrict) && (
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {[fd.currentDistrict, fd.currentSubDistrict, fd.currentProvince, fd.currentPostalCode || fd.currentPostcode].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ข้อมูลครอบครัว */}
          {(fd.fatherName || fd.motherName || fd.spouseName || fd.childrenCount !== undefined) && (
            <Section title={t.family} icon={Users}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'ชื่อบิดา' : 'Father\'s Name', value: fd.fatherDeceased ? t.deceased : fd.fatherName },
                { label: lang === 'th' ? 'อายุ/อาชีพบิดา' : 'Age/Occupation', value: fd.fatherDeceased ? null : ([fd.fatherAge ? `${fd.fatherAge} ${lang === 'th' ? 'ปี' : 'Years'}` : '', fd.fatherOccupation].filter(Boolean).join(' / ') || null) },
                { label: lang === 'th' ? 'ชื่อมารดา' : 'Mother\'s Name', value: fd.motherDeceased ? t.deceased : fd.motherName },
                { label: lang === 'th' ? 'อายุ/อาชีพมารดา' : 'Age/Occupation', value: fd.motherDeceased ? null : ([fd.motherAge ? `${fd.motherAge} ${lang === 'th' ? 'ปี' : 'Years'}` : '', fd.motherOccupation].filter(Boolean).join(' / ') || null) },
                { label: lang === 'th' ? 'ชื่อคู่สมรส' : 'Spouse Name', value: fd.spouseName },
                { label: lang === 'th' ? 'อายุคู่สมรส' : 'Spouse Age', value: fd.spouseAge ? `${fd.spouseAge} ${lang === 'th' ? 'ปี' : 'Years'}` : null },
                { label: lang === 'th' ? 'อาชีพคู่สมรส' : 'Spouse Occupation', value: fd.spouseOccupation },
                { label: lang === 'th' ? 'จำนวนบุตร' : 'No. of Children', value: fd.childrenCount !== undefined ? fd.childrenCount : null },
                { label: lang === 'th' ? 'จำนวนพี่น้อง' : 'No. of Siblings', value: fd.siblingCount !== undefined ? fd.siblingCount : null },
              ]} />
            </Section>
          )}

          {/* การศึกษา */}
          {fd.education && (
            <Section title={t.education} icon={GraduationCap}>
              {/* Mobile: Card layout */}
              <div className="sm:hidden space-y-3">
                {(() => {
                  const edu = fd.education;
                  const renderCard = (e: any, key: string | number, levelLabel: string) => {
                    if (!e?.institute) return null;
                    return (
                      <div key={key} className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                        <p className="font-bold text-indigo-700 text-sm mb-1">{levelLabel}</p>
                        <p className="font-semibold text-gray-900 text-sm">{e.institute}</p>
                        {e.major && <p className="text-gray-500 text-xs mt-0.5">{e.major}</p>}
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                          <span>GPA: <strong className="text-gray-700">{e.gpa || '-'}</strong></span>
                          <span>{e.startDate && e.endDate ? `${e.startDate} – ${e.endDate}` : e.endDate || '-'}</span>
                        </div>
                      </div>
                    );
                  };
                  if (Array.isArray(edu)) {
                    return edu.filter(e => e?.institute).map((e, i) =>
                      renderCard(e, i, EDU_LEVEL_MAP[lang][e.level || ''] || e.level || '-')
                    );
                  }
                  return EDU_ORDER.map(key => {
                    const e = edu?.[key];
                    return renderCard(e, key, EDU_LEVEL_MAP[lang][key]);
                  });
                })()}
              </div>
              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-gray-100">
                      <th className="text-left py-3 px-3 font-bold text-[11px] uppercase tracking-wider">{lang === 'th' ? 'ระดับ' : 'Level'}</th>
                      <th className="text-left py-3 px-3 font-bold text-[11px] uppercase tracking-wider">{lang === 'th' ? 'สถาบัน / สาขา' : 'Institute / Major'}</th>
                      <th className="text-center py-3 px-3 font-bold text-[11px] uppercase tracking-wider">GPA</th>
                      <th className="text-center py-3 px-3 font-bold text-[11px] uppercase tracking-wider">{lang === 'th' ? 'ช่วงเวลา' : 'Period'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                      const edu = fd.education;
                      if (Array.isArray(edu)) {
                        return edu.filter(e => e?.institute).map((e, i) => (
                          <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="py-3 px-3 align-top">
                              <span className="font-bold text-indigo-700 block whitespace-nowrap">{EDU_LEVEL_MAP[lang][e.level || ''] || e.level || '-'}</span>
                            </td>
                            <td className="py-3 px-3 align-top">
                              <div className="font-semibold text-gray-900">{e.institute}</div>
                              {e.major && <div className="text-gray-500 text-xs mt-0.5">{e.major}</div>}
                            </td>
                            <td className="py-3 px-3 text-center align-top font-medium text-slate-600">{e.gpa || '-'}</td>
                            <td className="py-3 px-3 text-center align-top text-xs text-slate-500 whitespace-nowrap">
                              {e.startDate && e.endDate ? `${e.startDate} – ${e.endDate}` : e.endDate || '-'}
                            </td>
                          </tr>
                        ));
                      }
                      return EDU_ORDER.map(key => {
                        const e = edu?.[key];
                        if (!e?.institute) return null;
                        return (
                          <tr key={key} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="py-3 px-3 align-top">
                              <span className="font-bold text-indigo-700 block whitespace-nowrap">{EDU_LEVEL_MAP[lang][key]}</span>
                            </td>
                            <td className="py-3 px-3 align-top">
                              <div className="font-semibold text-gray-900">{e.institute}</div>
                              {e.major && <div className="text-gray-500 text-xs mt-0.5">{e.major}</div>}
                            </td>
                            <td className="py-3 px-3 text-center align-top font-medium text-slate-600">{e.gpa || '-'}</td>
                            <td className="py-3 px-3 text-center align-top text-xs text-slate-500 whitespace-nowrap">
                              {e.startDate && e.endDate ? `${e.startDate} – ${e.endDate}` : e.endDate || '-'}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ประสบการณ์ทำงาน */}
          {fd.experience && fd.experience.length > 0 && (
            <Section title={t.experience} icon={Briefcase}>
              {/* Mobile: Card layout */}
              <div className="sm:hidden space-y-3">
                {fd.experience.map((exp: any, i: number) => (
                  <div key={i} className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{exp.company || '-'}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{exp.salary || '-'}</span>
                    </div>
                    <p className="text-indigo-700 text-sm font-medium">{exp.position || '-'}</p>
                    <p className="text-xs text-gray-500 mt-1">{exp.from || '-'} — {exp.to || (lang === 'th' ? 'ปัจจุบัน' : 'Present')}</p>
                    {exp.description && <p className="text-xs text-gray-500 italic mt-2">📌 {exp.description}</p>}
                  </div>
                ))}
              </div>
              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="text-left py-2 px-3 font-medium border-b">{lang === 'th' ? 'บริษัท' : 'Company'}</th>
                      <th className="text-left py-2 px-3 font-medium border-b">{lang === 'th' ? 'ตำแหน่ง' : 'Position'}</th>
                      <th className="text-center py-2 px-3 font-medium border-b">{lang === 'th' ? 'ช่วงเวลา' : 'Period'}</th>
                      <th className="text-right py-2 px-3 font-medium border-b whitespace-nowrap">{lang === 'th' ? 'เงินเดือน' : 'Salary'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fd.experience.map((exp: any, i: number) => (
                      <>
                        <tr key={`${i}-main`} className="border-b border-gray-50 hover:bg-gray-50/30">
                          <td className="pt-3 pb-1 px-3 font-semibold text-gray-800">{exp.company || '-'}</td>
                          <td className="pt-3 pb-1 px-3 text-indigo-700">{exp.position || '-'}</td>
                          <td className="pt-3 pb-1 px-3 text-center text-xs text-gray-500 whitespace-nowrap">{exp.from || '-'} — {exp.to || (lang === 'th' ? 'ปัจจุบัน' : 'Present')}</td>
                          <td className="pt-3 pb-1 px-3 text-right font-medium">{exp.salary || '-'}</td>
                        </tr>
                        <tr key={`${i}-desc`} className="border-b border-gray-100">
                          <td colSpan={4} className="pb-3 pt-0 px-3 text-xs text-gray-500 italic">
                            {exp.description ? `📌 ${exp.description}` : ''}
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ทักษะภาษา */}
          {(fd.englishSkill || fd.chineseSkill || fd.otherLang) && (
            <Section title={t.language} icon={Globe}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'ภาษาอังกฤษ' : 'English', value: fd.englishSkill ? `${fd.englishSkill}${fd.englishScore ? ` (${fd.englishScore})` : ''}` : null },
                { label: lang === 'th' ? 'ภาษาจีน' : 'Chinese', value: fd.chineseSkill ? `${fd.chineseSkill}${fd.chineseScore ? ` (${fd.chineseScore})` : ''}` : null },
                { label: lang === 'th' ? 'ภาษาอื่น' : 'Other Lang', value: fd.otherLang || null },
              ]} />
            </Section>
          )}

          {/* ทักษะคอมพิวเตอร์ */}
          {fd.computerSkills && (
            <Section title={t.computer} icon={Monitor}>
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
            <Section title={t.driving} icon={Car}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'รถจักรยานยนต์' : 'Motorcycle', value: fd.driving.motorcycle ? (lang === 'th' ? 'ได้' : 'Yes') : (lang === 'th' ? 'ไม่ได้' : 'No') },
                { label: lang === 'th' ? 'ใบขับขี่รถจักรยานยนต์' : 'Motorcycle License', value: fd.driving.motorcycleLicense ? (lang === 'th' ? 'มี' : 'Yes') : (lang === 'th' ? 'ไม่มี' : 'No') },
                { label: lang === 'th' ? 'รถยนต์' : 'Car', value: fd.driving.car ? (lang === 'th' ? 'ได้' : 'Yes') : (lang === 'th' ? 'ไม่ได้' : 'No') },
                { label: lang === 'th' ? 'ใบขับขี่รถยนต์' : 'Car License', value: fd.driving.carLicense ? (lang === 'th' ? 'มี' : 'Yes') : (lang === 'th' ? 'ไม่มี' : 'No') },
                { label: lang === 'th' ? 'ประเภทใบขับขี่' : 'License Class', value: fd.driving.licenseClasses?.join(', ') || null },
              ]} />
            </Section>
          )}

          {/* ความสามารถอื่นๆ */}
          {(fd.specialAbility || fd.hobbies) && (
            <Section title={t.otherSkills}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'ความสามารถพิเศษ' : 'Special Ability', value: fd.specialAbility },
                { label: lang === 'th' ? 'งานอดิเรก' : 'Hobbies', value: fd.hobbies },
              ]} />
            </Section>
          )}

          {/* แบบสอบถาม */}
          {(fd.strength || fd.weakness || fd.jobCriteria || fd.interests || fd.upcountryLocations?.length > 0) && (
            <Section title={t.questionnaire} icon={MessageSquare}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'พื้นที่ต่างจังหวัด' : 'Upcountry Working', value: fd.upcountryLocations?.length > 0 ? fd.upcountryLocations.join(', ') : null },
                { label: lang === 'th' ? 'จุดแข็ง' : 'Strength', value: fd.strength },
                { label: lang === 'th' ? 'จุดอ่อน' : 'Weakness', value: fd.weakness },
                { label: lang === 'th' ? 'งานที่ไม่ถนัด' : 'Less Fit Task', value: fd.lessFitTask },
                { label: lang === 'th' ? 'หลักการทำงาน' : 'Principles', value: fd.principles },
                { label: lang === 'th' ? 'วิธีแก้ปัญหา' : 'Problem Solving', value: fd.troubleResolve },
                { label: lang === 'th' ? 'เกณฑ์เลือกงาน' : 'Criteria', value: fd.jobCriteria },
                { label: lang === 'th' ? 'ความสนใจ' : 'Interests', value: fd.interests },
                { label: 'Digital Transform', value: fd.digitalTransformOpinion },
              ]} />
            </Section>
          )}

          {/* สุขภาพ */}
          {(fd.hasChronicDisease !== undefined || fd.hasSurgery !== undefined || fd.hasMedicalRecord !== undefined) && (
            <Section title={t.health} icon={Heart}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'โรคประจำตัว' : 'Chronic Disease', value: fd.hasChronicDisease ? (fd.chronicDiseaseDetail || (lang === 'th' ? 'มี' : 'Yes')) : (lang === 'th' ? 'ไม่มี' : 'None') },
                { label: lang === 'th' ? 'ประวัติผ่าตัด' : 'Surgery History', value: fd.hasSurgery ? (fd.surgeryDetail || (lang === 'th' ? 'มี' : 'Yes')) : (lang === 'th' ? 'ไม่มี' : 'None') },
                { label: lang === 'th' ? 'ประวัติการรักษา' : 'Medical Record', value: fd.hasMedicalRecord ? (fd.medicalRecordDetail || (lang === 'th' ? 'มี' : 'Yes')) : (lang === 'th' ? 'ไม่มี' : 'None') },
              ]} />
            </Section>
          )}

          {/* ผู้ติดต่อฉุกเฉิน */}
          {(fd.emergencyContactName || fd.emergencyContactPhone) && (
            <Section title={t.emergency} icon={Phone}>
              <InfoGrid items={[
                { label: lang === 'th' ? 'ชื่อ-สกุล' : 'Name', value: fd.emergencyContactName },
                { label: lang === 'th' ? 'ความสัมพันธ์' : 'Relation', value: fd.emergencyContactRelation },
                { label: lang === 'th' ? 'เบอร์โทร' : 'Phone', value: fd.emergencyContactPhone },
                { label: lang === 'th' ? 'บริษัท' : 'Company', value: fd.emergencyContactCompany },
                { label: lang === 'th' ? 'ตำแหน่ง' : 'Position', value: fd.emergencyContactPosition },
              ]} />
            </Section>
          )}

          {/* เอกสารแนบ */}
          {(fd.resumeUrl || fd.certificateUrl || fd.transcriptUrl) && (
            <Section title={t.attachments} icon={FileText}>
              <div className="flex flex-wrap gap-2">
                {fd.resumeUrl && (
                  <a href={fd.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm text-indigo-700 font-medium transition">
                    📄 {t.resume}
                  </a>
                )}
                {fd.certificateUrl && (
                  <a href={fd.certificateUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-700 font-medium transition">
                    📋 {t.certificate}
                  </a>
                )}
                {fd.transcriptUrl && (
                  <a href={fd.transcriptUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm text-emerald-700 font-medium transition">
                    🎓 {t.transcript}
                  </a>
                )}
              </div>
            </Section>
          )}

          {/* ===== หนังสือยินยอมและรับรอง ===== */}
          <div className="mb-6 mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t.consent}</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed text-center mb-4">
              {lang === 'th' ? (
                "ข้าพเจ้าได้อ่าน ศึกษาเอกสารและพิจารณาคำยินยอมจากผู้ให้ข้อมูลกับบริษัทฯ ข้าพเจ้าขอรับรองว่า รายละเอียดทั้งหมดที่ให้ไว้ในใบสมัครงานนี้ ถูกต้องและเป็นความจริงทุกประการ หากภายหลังบริษัทฯ ตรวจพบว่าข้อใดเป็นเท็จ ข้าพเจ้ายินยอมให้บริษัทฯบอกเลิกการว่าจ้างข้าพเจ้าได้ทันที"
              ) : (
                "I have read and considered the documents and consents provided to the Company. I certify that all details provided in this application are true and correct in every respect. If the Company later finds any information to be false, I agree that the Company may terminate my employment immediately."
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">{t.applicantName}</p>
                <p className="text-sm font-semibold mt-1">{fullName}</p>
              </div>
              <div className="border-b border-gray-300 pb-1 h-12 flex flex-col justify-end">
                <p className="text-[10px] text-gray-400 mb-1">{t.signature}</p>
                <div className="border-t border-dashed border-gray-400 w-full"></div>
              </div>
            </div>
            <p className="text-center mt-3 text-xs text-gray-500">
              {lang === 'th' ? 'ผู้สมัครงาน' : 'Applicant'} &nbsp;|&nbsp; {app.created_at ? new Date(app.created_at).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* ===== รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล (Privacy Notice) ===== */}
          <div className="mb-6 mt-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t.privacyNotice}</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              {lang === 'th' ? (
                <>
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
                </>
              ) : (
                <>
                  <p>This document is prepared to clarify the details regarding personal data between Double A (1991) Public Company Limited ("<strong>the Company</strong>") and persons wishing to apply for employment with the Company and/or its affiliates ("<strong>the Applicant</strong>") in accordance with the Company's criteria and policies as follows:</p>
                  <div>
                    <p className="font-bold">1. Collection of Personal Data</p>
                    <p className="ml-4 mt-1 text-gray-600">The Company will collect, use, process, and disclose the Applicant's personal data, including name, surname, national identification number, address, educational history, work or training history, military service history, email, telephone number, and information specified in the Resume and CV submitted by the Applicant that is not sensitive data, for the benefit of identity verification and considering suitability for an employment contract.</p>
                  </div>
                  <div>
                    <p className="font-bold">2. Disclosure of Personal Data</p>
                    <p className="ml-4 mt-1 text-gray-600">The Company may disclose the Applicant's personal data to its affiliates for the benefit of considering suitability for an employment contract with the Company's affiliates.</p>
                  </div>
                  <div>
                    <p className="font-bold">3. Data Processing</p>
                    <p className="ml-4 mt-1 text-gray-600">The Applicant's personal data will be processed by persons approved by the Company and/or its affiliates for the purpose of considering employment.</p>
                  </div>
                  <div>
                    <p className="font-bold">4. Data Retention Period</p>
                    <p className="ml-4 mt-1 text-gray-600">The Company will retain the Applicant's personal data for the specified purposes for a period of 5 years from the date the Applicant applies for employment with the Company and/or its affiliates.</p>
                  </div>
                </>
              )}
              <div>
                <p className="font-bold">5. {lang === 'th' ? 'สิทธิของผู้สมัครงาน' : 'Rights of the Applicant'}</p>
                {lang === 'th' ? (
                  <>
                    <p className="ml-4 mt-1 text-gray-600">รายละเอียดปรากฏตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 นโยบายคุ้มครองข้อมูลส่วนบุคคลของบริษัทฯ เรื่อง "สิทธิของเจ้าของข้อมูล"</p>
                    <p className="ml-4 mt-1 text-gray-600">กรณีที่ผู้สมัครงานต้องการเข้าถึง แก้ไข ลบข้อมูลส่วนบุคคลที่ให้ไว้แก่บริษัทฯ ผู้สมัครงานสามารถติดต่อมายังบริษัทฯ เพื่อยื่นคำขอผ่านช่องทางการติดต่อดังนี้</p>
                  </>
                ) : (
                  <>
                    <p className="ml-4 mt-1 text-gray-600">Details are as appeared in the Personal Data Protection Act B.E. 2562 and the Company's Privacy Policy regarding "Rights of the Data Subject".</p>
                    <p className="ml-4 mt-1 text-gray-600">In the event that the Applicant wishes to access, rectify, or delete personal data provided to the Company, the Applicant may contact the Company to submit a request through the following contact channels:</p>
                  </>
                )}
              </div>
              <div className="ml-4 bg-gray-100 border border-gray-200 rounded p-3 text-xs space-y-1">
                <p><strong>{lang === 'th' ? 'ผู้ควบคุมข้อมูลส่วนบุคคล:' : 'Data Controller:'}</strong> {lang === 'th' ? 'บริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน)' : 'Double A (1991) Public Company Limited'}</p>
                <p><strong>{lang === 'th' ? 'สถานที่ติดต่อ:' : 'Contact Location:'}</strong> {lang === 'th' ? 'ฝ่ายสรรหาและคัดเลือกบุคลากร' : 'Recruitment and Selection Department'}</p>
                <p className={lang === 'th' ? "pl-16" : "pl-4"}>187/3 Moo 1, Bangna-Trad km. 42, Bang Wua, Bang Pakong,</p>
                <p className={lang === 'th' ? "pl-16" : "pl-4"}>{lang === 'th' ? 'จังหวัดฉะเชิงเทรา 24180' : 'Chachoengsao 24180, Thailand'}</p>
                <p><strong>Email:</strong> recruit@doublea1991.com</p>
              </div>
              <p className="ml-4 text-gray-600">{lang === 'th' ? 'สามารถตรวจสอบรายละเอียดอื่นๆ ได้ที่' : 'Additional details can be checked at'} <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://www.doubleapaper.com/privacy-policy</a></p>
              <p className="ml-4 text-gray-600">{lang === 'th' ? 'ทั้งนี้ผู้สมัครงานยืนยันว่าข้อมูลส่วนบุคคลของบุคคลที่สามที่ผู้สมัครงานให้แก่บริษัทฯ ถูกต้อง และเจ้าของข้อมูลส่วนบุคคลทราบถึงการเปิดเผยข้อมูลดังกล่าวแก่บริษัทฯ แล้ว' : 'The Applicant certifies that the personal data of third parties provided to the Company is accurate and the data owners are aware of such disclosure to the Company.'}</p>
              <p className="font-semibold">{lang === 'th' ? 'ผู้สมัครงาน อ่าน เข้าใจ และรายละเอียดซึ่งระบุไว้ข้างต้นแล้ว โดยยอมรับรองว่าข้อมูลที่นำส่งให้แก่บริษัทฯ เพื่อการประมวลผลข้อมูลนั้นถูกต้อง และเป็นความจริงทุกประการ' : 'The Applicant has read and understood the details specified above and certifies that the information submitted for data processing is accurate and true in all respects.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">{t.applicantName}</p>
                <p className="text-sm font-semibold mt-1">{fullName}</p>
              </div>
              <div className="border-b border-gray-300 pb-1 h-12 flex flex-col justify-end">
                <p className="text-[10px] text-gray-400 mb-1">{t.signature}</p>
                <div className="border-t border-dashed border-gray-400 w-full"></div>
              </div>
            </div>
          </div>

          {/* ===== ความยินยอมในการประมวลผลข้อมูล ===== */}
          <div className="mb-6 mt-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-indigo-200">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t.consentProcessing}</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed bg-gray-50 rounded-lg p-4">
              <p>{lang === 'th' ? 'ผู้สมัครงานให้บริษัทฯ เก็บ รวบรวม ใช้ ประมวลผล ข้อมูลส่วนบุคคลที่มีอยู่ในข้อมูลผู้สมัครงานเพื่อการดำเนินงานในการทำงาน ได้แก่ เพื่อการพิจารณาจ้างงานและการบริหารจัดการแรงงานของบริษัทฯ' : 'The Applicant allows the Company to collect, use, and process personal data contained in the application for operational purposes, including recruitment consideration and labor management.'}</p>
              <p>{lang === 'th' ? 'ทั้งนี้ยินยอมให้จัดเก็บและใช้งานข้อมูลดังกล่าวเป็นระยะเวลา 5 ปี นับแต่วันที่สมัครงาน' : 'Consent is given for storage and use of such data for a period of 5 years from the application date.'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
              <div className="border-b border-gray-300 pb-1">
                <p className="text-xs text-gray-500">{t.applicantName}</p>
                <p className="text-sm font-semibold mt-1">{fullName}</p>
              </div>
              <div className="border-b border-gray-300 pb-1 h-12 flex flex-col justify-end">
                <p className="text-[10px] text-gray-400 mb-1">{t.signature}</p>
                <div className="border-t border-dashed border-gray-400 w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 bg-gray-50/50 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 opacity-60">
            <img src="/doublea_logo.png" alt="Double A Logo" className="w-5 h-5 object-contain" />
            <span className="text-xs font-bold text-gray-900">
              <span className="text-blue-700 italic">Double A</span> Alliance
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400">
            {lang === 'th' ? 'ลิงก์แชร์มีอายุ 30 วัน · สร้างจากระบบ Double A Alliance · เอกสารใช้ภายในเท่านั้น' : 'Share links expire in 30 days · Generated by Double A Alliance · For internal use only'}
          </p>
        </div>
      </div>
    </div>
  );
};
