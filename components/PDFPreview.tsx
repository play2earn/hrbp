
import React from 'react';
import { ApplicationForm, Language } from '../types';
import { Button } from './UIComponents';
import { TRANSLATIONS } from '../constants';
import { Printer, Edit, FileText, Send } from 'lucide-react';

interface PDFPreviewProps {
  data: ApplicationForm;
  onEdit: () => void;
  lang: Language;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

// ===== ConsentSection Component =====
const ConsentSection: React.FC<{ data: ApplicationForm; lang: Language }> = ({ data, lang }) => {
  const applicantName = [data.title, data.firstName, data.lastName].filter(Boolean).join(' ') || '............................................';
  const today = new Date();
  const formattedDate = today.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="mt-8 break-before-page text-black">
      {/* ===== Section 1: หนังสือยินยอมและรับรอง ===== */}
      <div className="bg-blue-700 py-2 px-3 mb-0">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {lang === 'th' ? 'หนังสือยินยอมและรับรอง' : 'Declaration & Consent Letter'}
        </h3>
      </div>
      <div className="border-2 border-t-0 border-black p-6 text-black">
        <p className="text-sm leading-relaxed text-center mb-6 indent-8">
          {lang === 'th'
            ? 'ข้าพเจ้าได้อ่าน ศึกษาเอกสารและพิจารณาคำยินยอมจากผู้ให้ข้อมูลกับบริษัทฯเจ้าขอรับรองว่า รายละเอียดทั้งหมดที่ให้ไว้ในใบสมัครงานนี้ ถูกต้องและเป็นความจริงทุกประการ หากภายหลังบริษัทฯ ตรวจพบว่าข้อใดเป็นเท็จ ข้าพเจ้ายินยอมให้บริษัทฯบอกเลิกการว่าจ้างข้าพเจ้าได้ทันที โดยข้าพเจ้าจะไม่เรียกร้องค่าสินไหมทดแทนหรือเงินทดแทนใดๆ ทั้งสิ้นจากบริษัท'
            : 'I hereby certify that all information provided in this application form is true and complete to the best of my knowledge. I understand that any misrepresentation or omission of facts may result in immediate termination of employment, without any claim for compensation or damages from the company.'
          }
        </p>

        {/* Signature rows */}
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <div className="border-b border-black h-8 mb-1"></div>
            <p className="text-xs text-gray-600">{lang === 'th' ? 'ชื่อ-นามสกุล (ผู้สมัคร)' : 'Name (Applicant)'}</p>
            <p className="text-sm font-semibold mt-1">{applicantName}</p>
          </div>
          <div>
            <div className="border-b border-black h-8 mb-1"></div>
            <p className="text-xs text-gray-600">{lang === 'th' ? 'วัน/เดือน/ปี' : 'Date'}</p>
            <p className="text-sm font-semibold mt-1">{formattedDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <div className="border-b border-black h-8 mb-1"></div>
            <p className="text-xs text-gray-600">{lang === 'th' ? 'ตำแหน่ง' : 'Position'}</p>
          </div>
          <div>
            <div className="border-b border-black h-8 mb-1"></div>
            <p className="text-xs text-gray-600">{lang === 'th' ? 'เบอร์โทรติดต่อ' : 'Contact Number'}</p>
          </div>
        </div>

        <div className="text-center mt-6 text-sm font-bold">{lang === 'th' ? 'ผู้สมัครงาน' : 'Applicant'}</div>
        <div className="text-center mt-1 text-xs text-gray-500">{lang === 'th' ? 'วัน/ เดือน/ ปี' : 'Day / Month / Year'}</div>
      </div>

      {/* ===== Section 2: รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล (Privacy Notice) ===== */}
      <div className="mt-6 break-before-page">
        <div className="bg-blue-700 py-2 px-3 mb-0">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
            {lang === 'th' ? 'รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล' : 'Privacy Notice'}
          </h3>
        </div>
        <div className="border-2 border-t-0 border-black p-6 text-black">
          <p className="text-sm leading-relaxed mb-4">
            {lang === 'th'
              ? 'หนังสือนี้จัดทำขึ้นเพื่อชี้แจงรายละเอียดเกี่ยวกับข้อมูลส่วนบุคคลระหว่างบริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน) ("บริษัทฯ") และผู้ที่มีความประสงค์จะสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ ("ผู้สมัครงาน") ตามหลักเกณฑ์และนโยบายของบริษัทฯ ดังนี้'
              : 'This Privacy Notice is to clarify the personal data processing between Double A (1991) Public Company Limited (the "Company") and the applicant who intends to apply for a job at the Company and/or the Company\'s alliance (the "Applicant") according to the Policy of the Company.'
            }
          </p>

          {/* 1. การเก็บรวบรวมข้อมูลส่วนบุคคล */}
          <p className="text-sm font-bold mt-4 mb-1">
            {lang === 'th' ? '1. การเก็บรวบรวมข้อมูลส่วนบุคคล' : '1. Processing of the Personal Data'}
          </p>
          <p className="text-sm leading-relaxed ml-4 mb-3">
            {lang === 'th'
              ? 'บริษัทฯ จะเก็บ รวบรวม ใช้ ประมวลผล และเปิดเผยข้อมูลส่วนบุคคลของผู้สมัครงาน ได้แก่ ชื่อ นามสกุล เลขประจำตัวประชาชน ที่อยู่ ประวัติการศึกษา ประวัติการทำงานหรือการอบรม ประวัติการเกณฑ์ทหาร อีเมล เบอร์โทรศัพท์ ข้อมูลตามที่ผู้สมัครงานระบุใน Resume และ CV ที่ผู้สมัครนำส่งให้บริษัทฯ ที่ไม่ใช่ข้อมูลอ่อนไหว เพื่อประโยชน์ของผู้สมัครงานในการยืนยันตัวบุคคลของผู้สมัครงาน และเพื่อการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทฯ'
              : 'The Company will collect, use, or disclose the Applicant\'s personal data, including name, surname, identification number, address, education background, work/training experience, military status, email, contact number, photo, and the information in the Applicant\'s resume or CV, which is not sensitive personal data (the "Personal Data") for the benefit of the Applicant, to verify identity and to consider the employment.'
            }
          </p>

          {/* 2. การเปิดเผยข้อมูลส่วนบุคคล */}
          <p className="text-sm font-bold mt-4 mb-1">
            {lang === 'th' ? '2. การเปิดเผยข้อมูลส่วนบุคคล' : '2. Disclosure of Personal Data'}
          </p>
          <p className="text-sm leading-relaxed ml-4 mb-3">
            {lang === 'th'
              ? 'บริษัทฯ อาจเปิดเผยข้อมูลส่วนบุคคลของผู้สมัครงานต่อบริษัทในเครือพันธมิตรของบริษัทฯ เพื่อผลประโยชน์ของผู้สมัครงานในการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทในเครือพันธมิตรของบริษัทฯ รวมถึงเพื่อการดำเนินการตามวัตถุประสงค์ที่เกี่ยวข้องกับวัตถุประสงค์ดังกล่าว'
              : 'The Company may disclose the Applicant\'s personal data to the Company\'s alliance for considering the employment and processing for the said purpose.'
            }
          </p>

          {/* 3. การประมวลผลข้อมูล */}
          <p className="text-sm font-bold mt-4 mb-1">
            {lang === 'th' ? '3. การประมวลผลข้อมูล' : '3. Data Processing'}
          </p>
          <p className="text-sm leading-relaxed ml-4 mb-3">
            {lang === 'th'
              ? 'ข้อมูลส่วนบุคคลของผู้สมัครงานจะถูกประมวลผลโดยผู้ที่ได้รับอนุมัติจากบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ เพื่อการพิจารณารับบุคคลเข้าทำงาน'
              : 'The Applicant\'s personal data will be processed by authorized persons of the Company and/or the Company\'s alliance for employment consideration.'
            }
          </p>

          {/* 4. ระยะเวลาในการจัดเก็บข้อมูล */}
          <p className="text-sm font-bold mt-4 mb-1">
            {lang === 'th' ? '4. ระยะเวลาในการจัดเก็บข้อมูล' : '4. Data Retention Period'}
          </p>
          <p className="text-sm leading-relaxed ml-4 mb-3">
            {lang === 'th'
              ? 'บริษัทฯ จะเก็บข้อมูลส่วนบุคคลของผู้สมัครงานเพื่อการดำเนินการตามวัตถุประสงค์เป็นระยะเวลา 5 ปี นับแต่วันที่ผู้สมัครงานทำการสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ'
              : 'The Company shall collect the Personal Data for 5 years from the date that the Applicant applies for a job with the Company and/or the Company\'s alliance.'
            }
          </p>

          {/* 5. สิทธิของผู้สมัครงาน */}
          <p className="text-sm font-bold mt-4 mb-1">
            {lang === 'th' ? '5. สิทธิของผู้สมัครงาน' : '5. Rights of the Applicant'}
          </p>
          <p className="text-sm leading-relaxed ml-4 mb-2">
            {lang === 'th'
              ? 'รายละเอียดปรากฏตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 นโยบายคุ้มครองข้อมูลส่วนบุคคลของบริษัทฯ เรื่อง "สิทธิของเจ้าของข้อมูล"'
              : 'Rights of the Applicant are in accordance with the Personal Data Protection Act, B.E. 2562 (2019) and the Company\'s Personal Information Protection Policy.'
            }
          </p>
          <p className="text-sm leading-relaxed ml-4 mb-2">
            {lang === 'th'
              ? 'กรณีที่ผู้สมัครงานต้องการเข้าถึง แก้ไข ลบข้อมูลส่วนบุคคลที่ให้ไว้แก่บริษัทฯ ผู้สมัครงานสามารถติดต่อมายังบริษัทฯ เพื่อยื่นคำขอเกี่ยวกับข้อมูลส่วนบุคคลของท่านผ่านช่องทางการติดต่อดังนี้'
              : 'If the Applicant would like access, rectification, erasure of the Personal Data provided to the Company, please submit the request to the contact below:'
            }
          </p>

          {/* DPO Contact Info */}
          <div className="ml-4 bg-gray-50 border border-gray-200 rounded p-3 text-xs mb-3">
            <p><span className="font-bold">{lang === 'th' ? 'ผู้ควบคุมข้อมูลส่วนบุคคล:' : 'Data Controller:'}</span> {lang === 'th' ? 'บริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน)' : 'Double A (1991) Public Company Limited'}</p>
            <p><span className="font-bold">{lang === 'th' ? 'สถานที่ติดต่อ:' : 'Address:'}</span> {lang === 'th' ? 'ฝ่ายสรรหาและคัดเลือกบุคลากร' : 'Recruitment Department'}</p>
            <p className="ml-24">{lang === 'th' ? '187/3 หมู่ที่ 1 ถนนบางนา-ตราด กม. 42 ตำบลบางวัว อำเภอบางปะกง' : '187/3 Moo 1, Bangna-Trad Km. 42 Road, Bangwua, Bangpakong'}</p>
            <p className="ml-24">{lang === 'th' ? 'จังหวัดฉะเชิงเทรา 24180' : 'Chachoengsao 24180, Thailand'}</p>
            <p><span className="font-bold">Email:</span> recruit@doublea1991.com</p>
          </div>

          <p className="text-sm leading-relaxed ml-4 mb-3">
            {lang === 'th'
              ? <>ผู้สมัครงานสามารถตรวจสอบรายละเอียดเกี่ยวกับสิทธิอื่นๆ ของผู้สมัครงานได้ที่ <a href="https://www.doubleapaper.com/privacy-policy" className="text-blue-600 underline">https://www.doubleapaper.com/privacy-policy</a></>
              : <>The Application can find the information of the Personal Data Protection Policy at <a href="https://www.doubleapaper.com/privacy-policy" className="text-blue-600 underline">https://www.doubleapaper.com/privacy-policy</a></>
            }
          </p>

          <p className="text-sm leading-relaxed ml-4 mb-3">
            {lang === 'th'
              ? 'ทั้งนี้ผู้สมัครงานยืนยันว่าข้อมูลส่วนบุคคลของบุคคลที่สามที่ผู้สมัครงานให้แก่บริษัทฯ เพื่อผลประโยชน์ของผู้สมัครงานในการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทฯ หรือบริษัทในเครือ ถูกต้อง และเจ้าของข้อมูลส่วนบุคคลทราบถึงการเปิดเผยข้อมูลดังกล่าวแก่บริษัทฯ แล้ว'
              : 'The Applicant certifies that the third party\'s personal data provided to the Company is true and correct, and the third party has acknowledged the said disclosure of their personal data to the Company.'
            }
          </p>

          <p className="text-sm leading-relaxed font-semibold mb-6">
            {lang === 'th'
              ? 'ผู้สมัครงาน อ่าน เข้าใจ และรายละเอียดซึ่งระบุไว้ข้างต้นแล้ว โดยยอมรับรองว่าข้อมูลที่นำส่งให้แก่บริษัทฯ เพื่อการประมวลผลข้อมูลนั้นถูกต้อง และเป็นความจริงทุกประการ'
              : 'The Applicant has read and understood this Privacy Notice including the above terms and conditions. The Applicant certifies that the Personal Data provided to the Company is true and correct.'
            }
          </p>

          {/* Signature rows */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <div className="border-b border-black h-8 mb-1"></div>
              <p className="text-xs text-gray-600">{lang === 'th' ? 'ชื่อ-นามสกุล (ผู้สมัคร)' : 'Name (Applicant)'}</p>
              <p className="text-sm font-semibold mt-1">{applicantName}</p>
            </div>
            <div>
              <div className="border-b border-black h-8 mb-1"></div>
              <p className="text-xs text-gray-600">{lang === 'th' ? 'วัน/เดือน/ปี' : 'Date'}</p>
              <p className="text-sm font-semibold mt-1">{formattedDate}</p>
            </div>
          </div>
          <div className="text-center mt-6 text-sm font-bold">{lang === 'th' ? 'ผู้สมัครงาน' : 'Applicant'}</div>
          <div className="text-center mt-1 text-xs text-gray-500">{lang === 'th' ? 'วัน/ เดือน/ ปี' : 'Day / Month / Year'}</div>
        </div>
      </div>

      {/* ===== Section 3: ความยินยอมในการประมวลผลข้อมูล ===== */}
      <div className="mt-6">
        <div className="bg-blue-700 py-2 px-3 mb-0">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
            {lang === 'th' ? 'ความยินยอมในการประมวลผลข้อมูล' : 'Data Processing Consent'}
          </h3>
        </div>
        <div className="border-2 border-t-0 border-black p-6 text-black">
          <p className="text-sm leading-relaxed mb-4">
            {lang === 'th'
              ? 'ผู้สมัครงานให้บริษัทฯ เก็บ รวบรวม ใช้ ประมวลผล ข้อมูลส่วนบุคคลที่มีอยู่ในข้อมูลผู้สมัครงานโดยเป็นอนุโลมของโครงการฯ เพื่อการดำเนินงานในการทำงาน ได้แก่ เพื่อการพิจารณาจ้างงานของบริษัทฯ และเพื่อบริหารจัดการแรงงานของบริษัทฯ โดยโปรดทราบว่าที่ผู้สมัครงานยินยอมให้ใช้ข้อมูลดังกล่าว บริษัทฯ สัญญาว่าจะเก็บรักษาข้อมูลไว้เป็นความลับอย่างเคร่งครัด และจะไม่เปิดเผยข้อมูลของผู้สมัครงาน ยกเว้นต่อผู้ที่เกี่ยวข้องกับกระบวนการพิจารณาว่าจ้าง และ/หรือ บริษัทในเครือ หรือตามที่กฎหมายกำหนด'
              : 'The applicant consents to the company collecting, using, and processing personal data contained in the job application for employment consideration and workforce management purposes. The company commits to strictly maintaining data confidentiality and will not disclose applicant information except to those involved in the hiring process, affiliated companies, or as required by law.'
            }
          </p>
          <p className="text-sm leading-relaxed mb-6">
            {lang === 'th'
              ? 'ทั้งนี้ที่ผู้สมัครงานยินยอม จะจัดเก็บและใช้งานข้อมูลดังกล่าวไว้เป็นระยะเวลา 5 ปี นับแต่วันที่ผู้สมัครงานทำการสมัครงาน เพื่อใช้ในการติดต่อและดำเนินการพิจารณาคัดเลือกบริษัทฯ และ/หรือพิจารณาให้บริษัทในเครือรับผู้สมัครงาน'
              : 'This consent covers data storage and use for a period of 5 years from the application date, to facilitate contact and selection processes within the company and/or affiliated companies.'
            }
          </p>

          {/* Signature rows */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <div className="border-b border-black h-8 mb-1"></div>
              <p className="text-xs text-gray-600">{lang === 'th' ? 'ชื่อ-นามสกุล (ผู้สมัคร)' : 'Name (Applicant)'}</p>
              <p className="text-sm font-semibold mt-1">{applicantName}</p>
            </div>
            <div>
              <div className="border-b border-black h-8 mb-1"></div>
              <p className="text-xs text-gray-600">{lang === 'th' ? 'วัน/เดือน/ปี' : 'Date'}</p>
              <p className="text-sm font-semibold mt-1">{formattedDate}</p>
            </div>
          </div>
          <div className="text-center mt-6 text-sm font-bold">{lang === 'th' ? 'ผู้สมัครงาน' : 'Applicant'}</div>
          <div className="text-center mt-1 text-xs text-gray-500">{lang === 'th' ? 'วัน/ เดือน/ ปี' : 'Day / Month / Year'}</div>
        </div>
      </div>
    </div>
  );
};
// ===== End ConsentSection =====

export const PDFPreview: React.FC<PDFPreviewProps> = ({ data, onEdit, lang, onSubmit, isSubmitting }) => {
  const t = TRANSLATIONS[lang];

  const handlePrint = () => {
    window.print();
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="bg-gray-200 border-y-2 border-black py-2 px-3 mt-6 mb-0 print:bg-gray-300 print:text-black">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">{title}</h3>
    </div>
  );

  const BoxField = ({ label, value, className = '' }: { label: string; value: any; className?: string }) => (
    <div className={`p-2 border-r border-b border-black text-black last:border-r-0 ${className}`}>
      <div className="text-[10px] text-gray-600 font-bold uppercase mb-1 tracking-tight">{label}</div>
      <div className="text-sm font-semibold text-black min-h-[1.25rem]">{value || '-'}</div>
    </div>
  );

  return (
    <div className="max-w-[210mm] mx-auto py-8 px-4 form-step-enter print:p-0 print:max-w-none">
      {/* Action Bar */}
      <div className="no-print flex flex-col gap-4 mb-8 sticky top-4 bg-white/95 backdrop-blur shadow-xl ring-1 ring-gray-900/5 p-4 rounded-xl z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg shrink-0">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{t.actions.exportPdf}</h2>
            <p className="text-xs text-gray-500 truncate">Review your information before printing or submitting</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={onEdit} className="border-gray-300 hover:bg-gray-50">
            <Edit className="w-4 h-4 mr-2" /> {t.actions.edit}
          </Button>
          <Button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
            <Printer className="w-4 h-4 mr-2" /> {t.actions.print}
          </Button>
          {onSubmit && (
            <Button onClick={onSubmit} isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
              <Send className="w-4 h-4 mr-2" /> {t.actions.submit}
            </Button>
          )}
        </div>
      </div>

      {/* A4 Printable Area */}
      <div className="bg-white shadow-2xl mx-auto p-[10mm] min-h-[297mm] print:shadow-none print:p-0 print:w-full text-black font-sans">

        {/* Header - Position Info + Photo */}
        <div className="flex justify-between items-start mb-6">
          {/* Position Details Table */}
          <div className="flex-1 border-2 border-black">
            <div className="grid grid-cols-2">
              <BoxField label={t.labels.position} value={data.position} />
              <BoxField label={t.labels.salary} value={`${data.expectedSalary || '-'} ${data.isSalaryNegotiable ? '(Negotiable)' : ''}`} className="border-r-0" />
            </div>
            <div className="grid grid-cols-2">
              <BoxField label={t.labels.department} value={data.department} className="border-b-0" />
              <BoxField label={t.labels.startDate} value={data.availability} className="border-r-0 border-b-0" />
            </div>
          </div>
          {/* Photo */}
          <div className="flex flex-col items-center ml-4">
            <div className="w-32 h-40 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center bg-gray-50 text-gray-400 overflow-hidden relative">
              {data.photoUrl ? (
                <img src={data.photoUrl} alt="Applicant" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="text-xs">Attach</span>
                  <span className="text-xs">Photo</span>
                  <span className="text-xs">Here</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Source Tags (BU/Channel/Tag) */}
        {(data.businessUnit || data.sourceChannel || data.campaignTag) && (
          <div className="flex flex-wrap gap-2 mb-6 no-print">
            {data.businessUnit && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-200 text-sm">
                <span className="text-indigo-400 mr-1">BU:</span> {data.businessUnit}
              </span>
            )}
            {data.sourceChannel && data.sourceChannel !== 'Direct' && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200 text-sm">
                <span className="text-emerald-400 mr-1">Channel:</span> {data.sourceChannel}
              </span>
            )}
            {data.campaignTag && data.campaignTag !== 'General' && (
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200 text-sm">
                <span className="text-amber-400 mr-1">Tag:</span> {data.campaignTag}
              </span>
            )}
          </div>
        )}

        {/* 2. Personal Information */}
        <SectionTitle title={t.sections.personal} />
        <div className="border-2 border-t-0 border-black">
          <div className="grid grid-cols-5">
            <BoxField label={t.labels.title} value={data.title} />
            <BoxField label={t.labels.firstName} value={data.firstName} />
            <BoxField label={t.labels.lastName} value={data.lastName} />
            <BoxField label={t.labels.nickname} value={data.nickname} />
            <BoxField label={t.labels.nicknameEn} value={data.nicknameEn} className="border-r-0" />
          </div>
          <div className="grid grid-cols-4">
            <BoxField label={t.labels.nationality} value={data.isThaiNational ? t.labels.thai : t.labels.foreigner} />
            <BoxField label={data.isThaiNational ? t.labels.idCard : t.labels.passport} value={data.isThaiNational ? data.nationalId : data.passportNo} className="col-span-2" />
            <BoxField label={t.labels.dob} value={data.dateOfBirth} className="border-r-0" />
          </div>
          <div className="grid grid-cols-4">
            <BoxField label={t.labels.age} value={data.age} />
            <BoxField label={t.labels.height} value={data.height ? `${data.height} cm` : '-'} />
            <BoxField label={t.labels.weight} value={data.weight ? `${data.weight} kg` : '-'} />
            <BoxField label={t.labels.military} value={data.militaryStatus} className="border-r-0" />
          </div>
          <div className="grid grid-cols-2">
            <BoxField label={t.labels.email} value={data.email} className="border-b-0" />
            <BoxField label={t.labels.phone} value={data.phone} className="border-r-0 border-b-0" />
          </div>
        </div>

        {/* 3. Contact Address */}
        <SectionTitle title={t.sections.contact} />
        <div className="border-2 border-t-0 border-black">
          <div className="grid grid-cols-1">
            <BoxField label={t.labels.registeredAddress} value={`${data.registeredAddress || ''} ${data.registeredSubDistrict ? ` ${t.labels.subDistrict} ${data.registeredSubDistrict}` : ''} ${data.registeredDistrict ? ` ${t.labels.district} ${data.registeredDistrict}` : ''} ${data.registeredProvince ? ` ${t.labels.province} ${data.registeredProvince}` : ''}`} />
            <BoxField label={t.labels.currentAddress} value={`${data.currentAddress || ''} ${data.currentSubDistrict ? ` ${t.labels.subDistrict} ${data.currentSubDistrict}` : ''} ${data.currentDistrict ? ` ${t.labels.district} ${data.currentDistrict}` : ''} ${data.currentProvince ? ` ${t.labels.province} ${data.currentProvince}` : ''}`} className="border-b-0" />
          </div>
        </div>

        {/* 4. Family Information */}
        <SectionTitle title={t.sections.family} />
        <div className="border-2 border-t-0 border-black">
          {/* Status Row */}
          <div className="grid grid-cols-3">
            <BoxField label={t.labels.maritalStatus} value={data.maritalStatus} />
            <BoxField label={t.labels.children} value={data.childrenCount} />
            <BoxField label={t.labels.siblings} value={data.siblingCount} className="border-r-0" />
          </div>
          {/* Spouse Row */}
          <div className="grid grid-cols-3 bg-gray-50/50">
            <BoxField label={t.labels.spouseName} value={data.spouseName} />
            <BoxField label={t.labels.spouseOccupation} value={data.spouseOccupation} />
            <BoxField label={t.labels.spouseAge} value={data.spouseAge} className="border-r-0" />
          </div>

          {/* Parent Table */}
          <div className="border-t border-black">
            <table className="w-full text-sm text-left text-black">
              <thead>
                <tr className="bg-gray-200 border-b border-black text-black">
                  <th className="py-2 px-2 border-r border-black w-1/4 text-xs font-bold uppercase text-black">{t.labels.relationship}</th>
                  <th className="py-2 px-2 border-r border-black w-1/3 text-xs font-bold uppercase text-black">{t.labels.firstName} - {t.labels.lastName}</th>
                  <th className="py-2 px-2 border-r border-black w-1/6 text-xs font-bold uppercase text-black">{t.labels.age}</th>
                  <th className="py-2 px-2 text-xs font-bold uppercase text-black">{t.labels.fatherOccupation}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400">
                <tr>
                  <td className="py-2 px-2 border-r border-gray-400 font-bold bg-gray-50 text-black">Father</td>
                  {data.fatherDeceased ? (
                    <td colSpan={3} className="py-2 px-2 text-black italic text-gray-500">เสียชีวิตแล้ว (Deceased)</td>
                  ) : (
                    <>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{data.fatherName || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{data.fatherAge || '-'}</td>
                      <td className="py-2 px-2 text-black">{data.fatherOccupation || '-'}</td>
                    </>
                  )}
                </tr>
                <tr>
                  <td className="py-2 px-2 border-r border-gray-400 font-bold bg-gray-50 text-black">Mother</td>
                  {data.motherDeceased ? (
                    <td colSpan={3} className="py-2 px-2 text-black italic text-gray-500">เสียชีวิตแล้ว (Deceased)</td>
                  ) : (
                    <>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{data.motherName || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{data.motherAge || '-'}</td>
                      <td className="py-2 px-2 text-black">{data.motherOccupation || '-'}</td>
                    </>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Education */}
        <SectionTitle title={t.sections.education} />
        <div className="border-2 border-t-0 border-black">
          <table className="w-full text-sm text-left text-black">
            <thead>
              <tr className="bg-gray-200 border-b border-black text-black">
                <th className="py-2 px-2 border-r border-black w-1/5 text-xs font-bold uppercase text-black">Level</th>
                <th className="py-2 px-2 border-r border-black w-1/3 text-xs font-bold uppercase text-black">{t.labels.institute}</th>
                <th className="py-2 px-2 border-r border-black w-1/4 text-xs font-bold uppercase text-black">{t.labels.major}</th>
                <th className="py-2 px-2 border-r border-black w-20 text-xs font-bold uppercase text-black">{t.labels.gpa}</th>
                <th className="py-2 px-2 text-xs font-bold uppercase text-black">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {(() => {
                const edu = data.education;
                // New structure: Array
                if (Array.isArray(edu)) {
                  const levelDisplayNames: Record<string, string> = {
                    primarySchool: lang === 'th' ? 'ประถมศึกษา' : 'Primary School',
                    juniorHighSchool: lang === 'th' ? 'มัธยมศึกษาตอนต้น' : 'Junior High School',
                    highSchool: lang === 'th' ? 'มัธยมปลาย / ปวช.' : 'High School / Voc.Cert.',
                    vocational: lang === 'th' ? 'ปวส.' : 'Higher Vocational',
                    bachelor: lang === 'th' ? 'ปริญญาตรี' : 'Bachelor',
                    master: lang === 'th' ? 'ปริญญาโท' : 'Master',
                    phd: lang === 'th' ? 'ปริญญาเอก' : 'Ph.D.',
                  };
                  return edu.filter(e => e.institute).map((e, i) => (
                    <tr key={i}>
                      <td className="py-2 px-2 border-r border-gray-400 font-bold bg-gray-50 text-black text-xs">{levelDisplayNames[e.level || ''] || e.level || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{e.institute || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{e.major || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{e.gpa || '-'}</td>
                      <td className="py-2 px-2 text-black">{e.startDate && e.endDate ? `${e.startDate}-${e.endDate}` : '-'}</td>
                    </tr>
                  ));
                }
                // Old structure: Object
                return (['primarySchool', 'juniorHighSchool', 'highSchool', 'vocational', 'bachelor', 'master', 'phd'] as const).map((key) => {
                  const e = (edu as any)?.[key];
                  const levelDisplayNames: Record<string, string> = {
                    primarySchool: lang === 'th' ? 'ประถมศึกษา' : 'Primary School',
                    juniorHighSchool: lang === 'th' ? 'มัธยมศึกษาตอนต้น' : 'Junior High School',
                    highSchool: lang === 'th' ? 'มัธยมปลาย / ปวช.' : 'High School / Voc.Cert.',
                    vocational: lang === 'th' ? 'ปวส.' : 'Higher Vocational',
                    bachelor: lang === 'th' ? 'ปริญญาตรี' : 'Bachelor',
                    master: lang === 'th' ? 'ปริญญาโท' : 'Master',
                    phd: lang === 'th' ? 'ปริญญาเอก' : 'Ph.D.',
                  };
                  if (!e?.institute) return null;
                  return (
                    <tr key={key}>
                      <td className="py-2 px-2 border-r border-gray-400 font-bold bg-gray-50 text-black text-xs">{levelDisplayNames[key]}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{e.institute || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{e.major || '-'}</td>
                      <td className="py-2 px-2 border-r border-gray-400 text-black">{e.gpa || '-'}</td>
                      <td className="py-2 px-2 text-black">{e.startDate && e.endDate ? `${e.startDate}-${e.endDate}` : '-'}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* 6. Work Experience */}
        <SectionTitle title={t.sections.experience} />
        <div className="border-2 border-t-0 border-black min-h-[150px]">
          <table className="w-full text-sm text-left text-black">
            <thead>
              <tr className="bg-gray-200 border-b border-black text-black">
                <th className="py-2 px-2 border-r border-black w-24 text-xs font-bold uppercase text-black">{t.labels.from} - {t.labels.to}</th>
                <th className="py-2 px-2 border-r border-black w-1/4 text-xs font-bold uppercase text-black">{t.labels.company}</th>
                <th className="py-2 px-2 border-r border-black w-1/4 text-xs font-bold uppercase text-black">{t.labels.position}</th>
                <th className="py-2 px-2 border-r border-black w-24 text-xs font-bold uppercase text-black">{t.labels.lastSalary}</th>
                <th className="py-2 px-2 text-xs font-bold uppercase text-black">{t.labels.jobDesc}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {data.experience.length > 0 ? (
                data.experience.map((exp, i) => (
                  <tr key={i}>
                    <td className="py-2 px-2 border-r border-gray-400 text-xs text-black">{exp.from}<br />{exp.to}</td>
                    <td className="py-2 px-2 border-r border-gray-400 font-semibold text-black">{exp.company}</td>
                    <td className="py-2 px-2 border-r border-gray-400 text-black">{exp.position}</td>
                    <td className="py-2 px-2 border-r border-gray-400 text-black">{exp.salary}</td>
                    <td className="py-2 px-2 text-xs text-black">{exp.description}</td>
                  </tr>
                ))
              ) : (
                // Empty Rows for layout
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="h-12">
                    <td className="border-r border-gray-400"></td>
                    <td className="border-r border-gray-400"></td>
                    <td className="border-r border-gray-400"></td>
                    <td className="border-r border-gray-400"></td>
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="break-inside-avoid">
          {/* 7. Skills */}
          <SectionTitle title={t.sections.skills} />
          <div className="border-2 border-t-0 border-black p-4">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold border-b border-black mb-2 pb-1 text-sm uppercase text-black">{t.labels.langSkill}</h4>
                <div className="space-y-1 text-sm text-black">
                  <div className="flex justify-between"><span className="text-gray-600">English:</span> <span className="font-semibold">{data.englishSkill} (Score: {data.englishScore || '-'})</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Chinese:</span> <span className="font-semibold">{data.chineseSkill} (Score: {data.chineseScore || '-'})</span></div>
                </div>

                <h4 className="font-bold border-b border-black mb-2 pb-1 text-sm uppercase mt-6 text-black">{t.labels.driving}</h4>
                <div className="space-y-1 text-sm text-black">
                  <div className="flex justify-between"><span className="text-gray-600">Motorcycle:</span> <span className="font-semibold">{data.driving.motorcycle ? 'Yes' : 'No'} (Lic: {data.driving.motorcycleLicense ? 'Yes' : 'No'})</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Car:</span> <span className="font-semibold">{data.driving.car ? 'Yes' : 'No'} (Lic: {data.driving.carLicense ? 'Yes' : 'No'})</span></div>
                  <div className="text-xs mt-1 text-gray-500">Types: {data.driving.licenseClasses.join(', ') || '-'}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold border-b border-black mb-2 pb-1 text-sm uppercase text-black">{t.labels.computer}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-black">
                  {Object.entries(data.computerSkills).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center border-b border-dotted border-gray-300 pb-0.5">
                      <span className="capitalize text-gray-700">{k}</span>
                      <span className="font-bold text-xs">{v}</span>
                    </div>
                  ))}
                </div>

                <h4 className="font-bold border-b border-black mb-2 pb-1 text-sm uppercase mt-6 text-black">{t.labels.graphics}</h4>
                <div className="space-y-1 text-sm text-black">
                  <div className="flex justify-between"><span className="text-gray-600">Canva:</span> <span className="font-semibold">{data.graphicsSkills.canva}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Video Editor:</span> <span className="font-semibold">{data.graphicsSkills.videoEditor}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-dashed border-gray-400 pt-4 text-black">
              <div className="mb-2">
                <span className="font-bold text-sm uppercase mr-2">{t.labels.specialAbility}:</span>
                <span className="text-sm">{data.specialAbility || '-'}</span>
              </div>
              <div>
                <span className="font-bold text-sm uppercase mr-2">{t.labels.hobbies}:</span>
                <span className="text-sm">{data.hobbies || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="break-inside-avoid">
          {/* 8. Questionnaire & Health */}
          <SectionTitle title={t.sections.questionnaire} />
          <div className="border-2 border-t-0 border-black p-4 space-y-3 text-black">
            <div className="grid grid-cols-1 gap-2 border-b border-dashed border-gray-300 pb-3">
              <div className="text-xs font-bold text-gray-500 uppercase">{t.labels.upcountry}</div>
              <div className="text-sm font-semibold">{data.upcountryLocations.length > 0 ? data.upcountryLocations.join(', ') : '-'}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-dashed border-gray-300 pb-3">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.strength}</div>
                <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.strength || '-'}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.weakness}</div>
                <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.weakness || '-'}</div>
              </div>
            </div>

            {/* Added Questionnaire Fields */}
            <div className="grid grid-cols-1 gap-1 border-b border-dashed border-gray-300 pb-3">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.lessFit}</div>
              <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.lessFitTask || '-'}</div>
            </div>

            <div className="grid grid-cols-1 gap-1 border-b border-dashed border-gray-300 pb-3">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.principles}</div>
              <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.principles || '-'}</div>
            </div>

            <div className="grid grid-cols-1 gap-1 border-b border-dashed border-gray-300 pb-3">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.troubleResolve}</div>
              <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.troubleResolve || '-'}</div>
            </div>

            <div className="grid grid-cols-1 gap-1 border-b border-dashed border-gray-300 pb-3">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.jobCriteria}</div>
              <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.jobCriteria || '-'}</div>
            </div>

            <div className="grid grid-cols-1 gap-1 border-b border-dashed border-gray-300 pb-3">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.interests}</div>
              <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.interests || '-'}</div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.labels.digitalTransform}</div>
              <div className="text-sm bg-gray-50 p-2 border border-gray-200 rounded min-h-[3rem]">{data.digitalTransformOpinion || '-'}</div>
            </div>
          </div>

          <SectionTitle title={t.sections.health} />
          <div className="border-2 border-t-0 border-black text-black">
            <div className="grid grid-cols-2 border-b border-black">
              <div className="p-3 border-r border-black">
                <h4 className="font-bold text-sm uppercase mb-2 underline">{t.sections.emergency}</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">{t.labels.firstName}:</span> {data.emergencyContactName}</p>
                  <p><span className="font-semibold">{t.labels.relationship}:</span> {data.emergencyContactRelation}</p>
                  <p><span className="font-semibold">{t.labels.phone}:</span> {data.emergencyContactPhone}</p>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm uppercase mb-2 underline">Medical History</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">{t.labels.chronic}:</span> {data.hasChronicDisease ? data.chronicDiseaseDetail : 'No'}</p>
                  <p><span className="font-semibold">{t.labels.surgery}:</span> {data.hasSurgery ? data.surgeryDetail : 'No'}</p>
                  <p><span className="font-semibold">{t.labels.medicalRecord}:</span> {data.hasMedicalRecord ? data.medicalRecordDetail : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* ===== หนังสือยินยอมและรับรอง ===== */}
        <ConsentSection data={data} lang={lang} />

      </div>
    </div>
  );
};
