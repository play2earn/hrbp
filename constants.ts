
import { Language } from './types';

export const TRANSLATIONS = {
  en: {
    appTitle: 'Double A Network',
    welcome: 'Join Our Team',
    steps: {
      1: 'Job Interest',
      2: 'Personal Info',
      3: 'Contact Info',
      4: 'Family Info',
      5: 'Education',
      6: 'Skills',
      7: 'Experience',
      8: 'Questionnaire',
      9: 'Health & Emergency',
      10: 'Documents',
      11: 'Review'
    },
    actions: {
      next: 'Next Step',
      back: 'Back',
      submit: 'Submit Application',
      login: 'Login',
      logout: 'Logout',
      exportPdf: 'Preview & Export PDF',
      print: 'Print / Save as PDF',
      edit: 'Edit Information'
    },
    sections: {
      position: 'Position Applied',
      personal: 'Personal Information',
      contact: 'Contact Information',
      family: 'Family Information',
      education: 'Education Information',
      skills: 'Skills and Capability',
      experience: 'Work Experiences',
      questionnaire: 'Interview Questionnaire',
      health: 'Health Conditions',
      emergency: 'Emergency Contact',
      documents: 'Memo & Documents'
    },
    labels: {
      // Step 1
      bu: 'Business Unit',
      department: 'Department',
      position: 'Position',
      salary: 'Expected Salary',
      negotiable: 'Negotiable',
      startDate: 'Available Start Date',
      source: 'Source Channel',

      // Step 2
      nationality: 'Nationality',
      thai: 'Thai National',
      foreigner: 'Foreigner',
      idCard: 'Identification Card Number',
      passport: 'Passport Number',
      title: 'Title',
      firstName: 'First Name',
      lastName: 'Last Name',
      nickname: 'Nickname (TH)',
      nicknameEn: 'Nickname (EN)',
      dob: 'Date of Birth',
      age: 'Age',
      weight: 'Weight (kg)',
      height: 'Height (cm)',
      military: 'Military Status',

      // Step 3
      registeredAddress: 'Registered Address',
      currentAddress: 'Current Address',
      province: 'Province',
      district: 'District',
      subDistrict: 'Sub-district',
      phone: 'Phone number',
      email: 'Official Email Address',

      // Step 4
      maritalStatus: 'Marital Status',
      children: 'Numbers of Children',
      spouseName: "Spouse's Name - Surname",
      spouseAge: "Spouse's Age",
      spouseOccupation: "Spouse's Occupation/Position",
      fatherName: "Father's Name - Surname",
      fatherAge: "Father's Age",
      fatherOccupation: "Father's Occupation",
      motherName: "Mother's Name - Surname",
      motherAge: "Mother's Age",
      motherOccupation: "Mother's Occupation",
      siblings: 'Numbers of your Sibling (Exclude yourself)',

      // Step 5
      institute: 'Name of the institution',
      major: 'Major subject',
      program: 'Program',
      gpa: 'GPA',
      yearStart: 'Year Start',
      yearFinish: 'Year Finish',

      // Step 6
      langSkill: 'Languages Skill',
      english: 'English skill',
      englishScore: 'English Test score (TOEIC, TOEFL, IELTS)',
      chinese: 'Chinese skill',
      chineseScore: 'Chinese Test score (HSK, Etc.)',
      driving: 'Driving (For positions that require the use of vehicles)',
      motorcycle: 'รถจักรยานยนต์',
      car: 'รถยนต์',
      canDrive: 'Can you drive/ride?',
      haveLicense: 'Do you have a license?',
      licenseList: 'Driving License',
      computer: 'Computer skill',
      graphics: 'Graphics Skill',
      specialAbility: 'Software skill / Other Programs (Max 250 Character)',
      hobbies: 'Hobbies & Sports (Max 250 Character)',

      // Step 7
      from: 'From',
      to: 'To',
      company: 'Company name',
      lastPosition: 'Position',
      lastSalary: 'Salary per month',
      businessType: 'Business type (Explain business type)',
      jobDesc: 'Job description (Max 250 Character)',

      // Step 8
      upcountry: 'Are you willing to work upcountry?',
      strength: 'My strength (max 250 character)',
      weakness: 'My weaknesses (max 250 character)',
      lessFit: 'Type of work that less fit my own interest and reason why',
      principles: 'My principles in working are',
      troubleResolve: 'When troubles in a job arise, I resolve them by',
      jobCriteria: 'My criteria in choosing a job in any company is',
      interests: 'I\'m interested in News, Trends, Technology, Etc.',
      digitalTransform: 'What do you think about Digital Transform?',

      // Step 9
      relationship: 'Relationships',
      chronic: 'Chronic disease',
      surgery: 'Surgery records',
      medicalRecord: 'Other medical records',
      pleaseSpecify: 'If any of the above, please provide more information.',

      // Step 10
      photo: 'Your current photo (.JPG/ .PNG) limit 2MB',
      resume: 'Resume/ CV (.PDF) limit 2MB',
      transcript: 'Academic Transcript (.PDF) *Required',
      otherDocs: 'Others important documents (TOEIC, Cert., etc.)',
      links: 'Another link about you (LinkedIn, JobThai, etc.)'
    },
    dashboard: {
      totalApps: 'Total Applications',
      pending: 'Pending Review',
      interview: 'Interview Stage',
      rejected: 'Rejected'
    },
    options: {
      single: 'Single',
      married: 'Married',
      divorced: 'Divorced',
      widowed: 'Widowed',
      exempted: 'ได้รับการยกเว้น',
      conscripted: 'ผ่านการเกณฑ์ทหารแล้ว',
      reserved: 'นักศึกษาวิชาทหาร (รด.)',
      pending: 'อยู่ระหว่างการผ่อนผัน',
      'awaiting selection': 'จะเข้ารับการตรวจเลือกเร็วๆ นี้',
      female: 'เพศหญิง - ได้รับการยกเว้น',
      fluent: 'Fluent',
      good: 'Good',
      fair: 'Fair',
      basic: 'Basic',
      none: 'None',
      advanced: 'Advanced',
      noSkill: 'No Skill',
      yes: 'Yes',
      no: 'No',
      yesIcan: 'Yes, I can',
      noIcannot: 'No, I cannot',
      yesIdo: 'Yes, I do',
      noIdont: 'No, I don\'t',
      notHave: 'Not have license',
      privateCar: 'Private Car',
      privateMotorcycle: 'รถจักรยานยนต์ส่วนบุคคล',
      publicVehicle2: 'Public Vehicle Class 2',
      publicVehicle3: 'Public Vehicle Class 3',
      fatherInfo: "Father's Information",
      motherInfo: "Mother's Information",
      primarySchool: 'Primary School (P.1-P.6)',
      juniorHighSchool: 'Junior High School (M.1-M.3)',
      highSchool: 'High School / Vocational Cert. (ม.4-ม.6 / ปวช.)',
      vocational: 'Higher Vocational (Diploma / ปวส.)',
      bachelor: 'Bachelor',
      master: 'Master',
      phd: 'Doctorate (Ph.D.)',
      addExperience: 'Add Experience',
      removeExperience: 'Remove',
      noExperienceYet: 'No experience added yet. Click "Add Experience" if applicable.',
      // Military Status
      militaryCompleted: 'ผ่านการเกณฑ์ทหารแล้ว',
      militaryRotc: 'จบหลักสูตร รด.',
      militaryExemptFemale: 'ได้รับการยกเว้น - เพศหญิง',
      militaryExemptLaw: 'ได้รับการยกเว้น - ตามกฎหมาย',
      militaryNotYet: 'ยังไม่เกณฑ์ทหาร'
    }
  },
  th: {
    appTitle: 'Double A Network',
    welcome: 'ร่วมงานกับเรา',
    steps: {
      1: 'ตำแหน่งงาน',
      2: 'ข้อมูลส่วนตัว',
      3: 'ข้อมูลติดต่อ',
      4: 'ครอบครัว',
      5: 'การศึกษา',
      6: 'ทักษะ',
      7: 'ประสบการณ์',
      8: 'แบบสอบถาม',
      9: 'สุขภาพ/ฉุกเฉิน',
      10: 'เอกสาร',
      11: 'ตรวจสอบ'
    },
    actions: {
      next: 'ถัดไป',
      back: 'ย้อนกลับ',
      submit: 'ส่งใบสมัคร',
      login: 'เข้าสู่ระบบ',
      logout: 'ออกจากระบบ',
      exportPdf: 'ดูตัวอย่างและพิมพ์ PDF',
      print: 'พิมพ์ / บันทึกเป็น PDF',
      edit: 'แก้ไขข้อมูล'
    },
    sections: {
      position: 'ตำแหน่งที่สมัคร',
      personal: 'ข้อมูลส่วนตัว',
      contact: 'ข้อมูลการติดต่อ',
      family: 'ข้อมูลครอบครัว',
      education: 'ข้อมูลการศึกษา',
      skills: 'ทักษะและความสามารถ',
      experience: 'ประสบการณ์ทำงาน',
      questionnaire: 'แบบสอบถามสัมภาษณ์',
      health: 'ประวัติสุขภาพ',
      emergency: 'บุคคลติดต่อฉุกเฉิน',
      documents: 'เอกสารแนบ'
    },
    labels: {
      // Step 1
      bu: 'หน่วยธุรกิจ',
      department: 'แผนก',
      position: 'ตำแหน่ง',
      salary: 'เงินเดือนที่คาดหวัง',
      negotiable: 'ต่อรองได้ / ตามโครงสร้างบริษัท',
      startDate: 'วันที่เริ่มงานได้',
      source: 'ทราบข่าวจาก',

      // Step 2
      nationality: 'สัญชาติ',
      thai: 'ไทย',
      foreigner: 'ต่างชาติ',
      idCard: 'เลขบัตรประชาชน',
      passport: 'เลขที่พาสปอร์ต',
      title: 'คำนำหน้า',
      firstName: 'ชื่อจริง',
      lastName: 'นามสกุล',
      nickname: 'ชื่อเล่น (ไทย)',
      nicknameEn: 'ชื่อเล่น (อังกฤษ)',
      dob: 'วันเกิด',
      age: 'อายุ',
      weight: 'น้ำหนัก (กก.)',
      height: 'ส่วนสูง (ซม.)',
      military: 'สถานภาพทางทหาร',

      // Step 3
      registeredAddress: 'ที่อยู่ตามทะเบียนบ้าน',
      currentAddress: 'ที่อยู่ปัจจุบัน',
      province: 'จังหวัด',
      district: 'อำเภอ/เขต',
      subDistrict: 'ตำบล/แขวง',
      phone: 'เบอร์โทรศัพท์',
      email: 'อีเมล',

      // Step 4
      maritalStatus: 'สถานภาพสมรส',
      children: 'จำนวนบุตร',
      spouseName: "ชื่อ-นามสกุล คู่สมรส",
      spouseAge: "อายุคู่สมรส",
      spouseOccupation: "อาชีพ/ตำแหน่ง คู่สมรส",
      fatherName: "ชื่อ-นามสกุล บิดา",
      fatherAge: "อายุบิดา",
      fatherOccupation: "อาชีพ บิดา",
      motherName: "ชื่อ-นามสกุล มารดา",
      motherAge: "อายุมารดา",
      motherOccupation: "อาชีพ มารดา",
      siblings: 'จำนวนพี่น้อง (ไม่รวมตัวเอง)',

      // Step 5
      institute: 'ชื่อสถาบัน',
      major: 'สาขาวิชา',
      program: 'โปรแกรม/สาขาวิชา',
      gpa: 'เกรดเฉลี่ย',
      yearStart: 'ปีที่เริ่ม',
      yearFinish: 'ปีที่จบ',

      // Step 6
      langSkill: 'ทักษะภาษา',
      english: 'ภาษาอังกฤษ',
      englishScore: 'คะแนนสอบ (TOEIC, TOEFL, IELTS)',
      chinese: 'ภาษาจีน',
      chineseScore: 'คะแนนสอบ (HSK, อื่นๆ)',
      driving: 'การขับขี่ (สำหรับตำแหน่งที่ต้องใช้ยานพาหนะ)',
      motorcycle: 'รถจักรยานยนต์',
      car: 'รถยนต์',
      canDrive: 'คุณสามารถขับขี่ได้หรือไม่?',
      haveLicense: 'คุณมีใบขับขี่หรือไม่?',
      licenseList: 'ประเภทใบขับขี่ที่มี',
      computer: 'ทักษะคอมพิวเตอร์',
      graphics: 'ทักษะกราฟิก',
      specialAbility: 'ความสามารถพิเศษ / โปรแกรมอื่นๆ',
      hobbies: 'งานอดิเรก & กีฬา',

      // Step 7
      from: 'จาก',
      to: 'ถึง',
      company: 'ชื่อบริษัท',
      lastPosition: 'ตำแหน่ง',
      lastSalary: 'เงินเดือนสุดท้าย',
      businessType: 'ประเภทธุรกิจ (อธิบาย)',
      jobDesc: 'รายละเอียดงาน',

      // Step 8
      upcountry: 'คุณสามารถไปทำงานต่างจังหวัดได้หรือไม่?',
      strength: 'จุดแข็งของฉัน',
      weakness: 'จุดอ่อนของฉัน',
      lessFit: 'งานที่ไม่ถนัดและเหตุผล',
      principles: 'หลักการทำงานของฉัน',
      troubleResolve: 'เมื่อเจอปัญหาในงาน ฉันแก้ไขโดย',
      jobCriteria: 'เกณฑ์ในการเลือกงานของฉัน',
      interests: 'ฉันสนใจข่าวสาร เทรนด์ เทคโนโลยี ฯลฯ (โปรดระบุ)',
      digitalTransform: 'คุณคิดอย่างไรกับ Digital Transformation?',

      // Step 9
      relationship: 'ความสัมพันธ์',
      chronic: 'โรคประจำตัว',
      surgery: 'ประวัติการผ่าตัด',
      medicalRecord: 'ประวัติการรักษาอื่นๆ',
      pleaseSpecify: 'หากมี โปรดระบุรายละเอียด',

      // Step 10
      photo: 'รูปถ่ายปัจจุบัน (.JPG/ .PNG) ไม่เกิน 2MB',
      resume: 'เรซูเม่ / CV (.PDF) ไม่เกิน 2MB',
      transcript: 'Transcript / ใบรับรองผลการศึกษา (.PDF) *จำเป็น',
      otherDocs: 'เอกสารสำคัญอื่นๆ (ใบเซอร์, TOEIC ฯลฯ)',
      links: 'ลิงก์เพิ่มเติม (LinkedIn, JobThai, Portfolio)'
    },
    dashboard: {
      totalApps: 'ใบสมัครทั้งหมด',
      pending: 'รอตรวจสอบ',
      interview: 'นัดสัมภาษณ์',
      rejected: 'ปฏิเสธ'
    },
    options: {
      single: 'โสด',
      married: 'แต่งงาน',
      divorced: 'หย่าร้าง',
      widowed: 'ม่าย',
      exempted: 'ได้รับการยกเว้น',
      conscripted: 'ผ่านการเกณฑ์ทหารแล้ว',
      reserved: 'นักศึกษาวิชาทหาร (รด.)',
      pending: 'อยู่ระหว่างการผ่อนผัน',
      'awaiting selection': 'จะเข้ารับการตรวจเลือกเร็วๆ นี้',
      female: 'เพศหญิง - ได้รับการยกเว้น',
      fluent: 'คล่องแคล่ว / ดีมาก',
      good: 'ดี',
      fair: 'พอใช้',
      basic: 'พื้นฐาน',
      none: 'ไม่มี',
      advanced: 'เชี่ยวชาญ',
      noSkill: 'ไม่มีทักษะ',
      yes: 'ใช่',
      no: 'ไม่ใช่',
      yesIcan: 'ได้',
      noIcannot: 'ไม่ได้',
      yesIdo: 'มี',
      noIdont: 'ไม่มี',
      notHave: 'ไม่มีใบขับขี่',
      privateCar: 'รถยนต์ส่วนบุคคล',
      privateMotorcycle: 'รถจักรยานยนต์ส่วนบุคคล',
      publicVehicle2: 'รถสาธารณะ ประเภท 2',
      publicVehicle3: 'รถสาธารณะ ประเภท 3',
      fatherInfo: 'ข้อมูลบิดา',
      motherInfo: 'ข้อมูลมารดา',
      primarySchool: 'ประถมศึกษา (ป.1-ป.6)',
      juniorHighSchool: 'มัธยมศึกษาตอนต้น (ม.1-ม.3)',
      highSchool: 'มัธยมศึกษาตอนปลาย / ปวช.',
      vocational: 'ปวส.',
      bachelor: 'ปริญญาตรี',
      master: 'ปริญญาโท',
      phd: 'ปริญญาเอก',
      addExperience: 'เพิ่มประสบการณ์',
      removeExperience: 'ลบ',
      noExperienceYet: 'ยังไม่ได้เพิ่มประสบการณ์ กด "เพิ่มประสบการณ์" หากมี',
      // Military Status
      militaryCompleted: 'ผ่านการเกณฑ์ทหารแล้ว',
      militaryRotc: 'จบหลักสูตร รด.',
      militaryExemptFemale: 'ได้รับการยกเว้น - เพศหญิง',
      militaryExemptLaw: 'ได้รับการยกเว้น - ตามกฎหมาย',
      militaryNotYet: 'ยังไม่เกณฑ์ทหาร'
    }
  }
};

export const LANDING_CONTENT = {
  en: {
    heroTitle: 'Build Your Future With Us',
    heroSubtitle: 'Join a team of innovators driven by our culture (Transform, Think Forward, Team Synergy) to build a sustainable future together.',
    cta: 'View Open Positions',
    aboutTitle: 'Why Join Us?',
    values: [
      { 
        title: 'Transform', 
        desc: 'Ultimate Changing & Dependability. We adapt fast and stay reliable to survive and thrive in any situation.' 
      },
      { 
        title: 'Think Forward', 
        desc: 'Proactiveness & Worksmart Playhard. We think ahead and act immediately to conquer the digital world.' 
      },
      { 
        title: 'Team Synergy', 
        desc: 'One Team & Respect. We unite as one, leveraging our collective power for sustainable growth.' 
      }
    ],
    jobsTitle: 'Open Positions',
    apply: 'Apply Now',
    staffLogin: 'Staff Login',
    alliance: {
      title: 'Our Alliance Group',
      subtitle: 'Grow with a diverse, stable, and sustainable business ecosystem.',
      groups: [
        { 
          name: 'Double A', 
          desc: 'Global leader in premium paper and office stationary.', 
          tag: 'Consumer Goods',
          color: 'from-blue-600 to-indigo-600',
          url: 'https://doubleapaper.com/',
          logo: 'https://doubleapaper.com/logo.svg'
        },
        { 
          name: 'NPS & GLH', 
          desc: 'Leader in clean energy and sustainable industrial resource management.', 
          tag: 'Energy & Utility',
          color: 'from-yellow-500 to-orange-500',
          url: 'https://www.npsplc.com/en/home',
          logos: ['/nps_logo_new.jpg', '/glh_logo_new.jpg']
        },
        { 
          name: 'Real Estate', 
          desc: 'Residential developer under "My Green Town" brand.', 
          tag: 'Living & Housing',
          color: 'from-teal-500 to-emerald-500',
          url: 'https://mygreentownhousing.com/',
          logo: '/relo_logo.png'
        }
      ]
    }
  },
  th: {
    heroTitle: 'สร้างอนาคตไปกับเรา',
    heroSubtitle: 'ร่วมเป็นส่วนหนึ่งของทีมนักนวัตกรรมที่ขับเคลื่อนด้วยวัฒนธรรม Transform ME Transform US เพื่อสร้างอนาคตที่ยั่งยืนไปด้วยกัน',
    cta: 'ดูตำแหน่งงานว่าง',
    aboutTitle: 'ทำไมต้องทำงานกับเรา?',
    values: [
      { 
        title: 'Transform', 
        desc: 'พร้อมเปลี่ยน ทรานส์ฟอร์มให้ไว ยังไงก็อยู่รอด (Ultimate Changing & Dependability)' 
      },
      { 
        title: 'Think Forward', 
        desc: 'คิดเพื่ออนาคต ปรับแนวคิดพิชิตองค์กรดิจิทัล (Proactiveness & Worksmart Playhard)' 
      },
      { 
        title: 'Team Synergy', 
        desc: 'รวมเราเป็นหนึ่ง ผนึกกำลังสร้างการเติบโตอย่างยั่งยืน (One Team & Respect)' 
      }
    ],
    jobsTitle: 'ตำแหน่งงานว่าง',
    apply: 'สมัครทันที',
    staffLogin: 'เข้าสู่ระบบเจ้าหน้าที่',
    alliance: {
      title: 'เครือบริษัทพันธมิตรของเรา',
      subtitle: 'ก้าวหน้าไปกับกลุ่มธุรกิจที่หลากหลาย มั่นคง และยั่งยืน',
      groups: [
        { 
          name: 'Double A', 
          desc: 'ผู้นำด้านกระดาษและเครื่องใช้สำนักงานระดับโลก', 
          tag: 'Consumer Goods',
          color: 'from-blue-600 to-indigo-600',
          url: 'https://doubleapaper.com/',
          logo: 'https://doubleapaper.com/logo.svg'
        },
        { 
          name: 'NPS & GLH', 
          desc: 'ผู้นำด้านพลังงานสะอาดและการจัดการทรัพยากรอุตสาหกรรมอย่างยั่งยืน', 
          tag: 'Energy & Utility',
          color: 'from-yellow-500 to-orange-500',
          url: 'https://www.npsplc.com/en/home',
          logos: ['/nps_logo_new.jpg', '/glh_logo_new.jpg']
        },
        { 
          name: 'Real Estate', 
          desc: 'ผู้พัฒนาอสังหาริมทรัพย์และที่อยู่อาศัยภายใต้แบรนด์ My Green Town', 
          tag: 'Living & Housing',
          color: 'from-teal-500 to-emerald-500',
          url: 'https://mygreentownhousing.com/',
          logo: '/relo_logo.png'
        }
      ]
    }
  }
};

export const FEATURED_JOBS = [
  { id: 1, title: 'Senior Frontend Engineer', dept: 'IT', loc: 'Bangkok / Remote', type: 'Full-time' },
  { id: 2, title: 'UX/UI Designer', dept: 'Marketing', loc: 'Bangkok', type: 'Full-time' },
  { id: 3, title: 'Marketing Manager', dept: 'Marketing', loc: 'Bangkok', type: 'Full-time' },
  { id: 4, title: 'Sales Executive', dept: 'Sales', loc: 'Chiang Mai', type: 'Contract' },
  { id: 5, title: 'Backend Developer', dept: 'IT', loc: 'Remote', type: 'Full-time' },
  { id: 6, title: 'HR Officer', dept: 'HR', loc: 'Bangkok', type: 'Full-time' },
];

export const MOCK_BU = ['Retail', 'Logistics', 'Technology', 'Finance'];
export const MOCK_DEPARTMENTS = ['IT', 'HR', 'Marketing', 'Sales', 'Operations'];
export const MOCK_POSITIONS = {
  'IT': ['Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Senior Frontend Engineer'],
  'HR': ['Recruiter', 'HR Manager', 'HR Officer'],
  'Marketing': ['Content Creator', 'SEO Specialist', 'UX/UI Designer', 'Marketing Manager'],
  'Sales': ['Sales Executive', 'Account Manager'],
  'Operations': ['Driver', 'Warehouse Manager']
};

export const PDPA_TEXT = `
  By continuing, you acknowledge that you have read and understood our Privacy Policy.
  We collect your personal data for recruitment purposes only. Your data will be stored securely
  and will not be shared with unauthorized third parties. You have the right to access,
  rectify, or erase your personal data at any time.
`;

export const MILITARY_STATUS_OPTIONS = [
  { value: 'Completed', labelTh: 'ผ่านการเกณฑ์ทหารแล้ว', labelEn: 'Completed Military Service' },
  { value: 'ROTC', labelTh: 'จบหลักสูตร รด.', labelEn: 'Completed R.O.T.C.' },
  { value: 'ExemptFemale', labelTh: 'ได้รับการยกเว้น - เพศหญิง', labelEn: 'Exempted - Female' },
  { value: 'ExemptLaw', labelTh: 'ได้รับการยกเว้น - ตามกฎหมาย', labelEn: 'Exempted - Legal' },
  { value: 'NotYet', labelTh: 'ยังไม่เกณฑ์ทหาร', labelEn: 'Not Yet Drafted' },
];

export const UPCOUNTRY_LOCATIONS_DATA = [
  { key: 'dap', en: 'Chachoengsao : Bangna Trat km.42 (DAP)', th: 'ฉะเชิงเทรา : บางนา-ตราด กม.42 (DAP)' },
  { key: 'ip5', en: 'Chachoengsao : Bangprakong (IP5)', th: 'ฉะเชิงเทรา : บางปะกง (IP5)' },
  { key: 'ip2', en: 'Chachoengsao : Phanom Sarakham (IP2)', th: 'ฉะเชิงเทรา : พนมสารคาม (IP2)' },
  { key: 'ip1', en: 'Prachin Buri : 304 ดั๊บเบิ้ล เอ (IP1)', th: 'ปราจีนบุรี : 304 ดั๊บเบิ้ล เอ (IP1)' },
  { key: 'sriracha', en: 'Chonburi : Si Racha', th: 'ชลบุรี : ศรีราชา' },
  { key: 'silom', en: 'Bangkok : Silom Edge Office', th: 'กรุงเทพฯ : สีลม เอดจ์ ออฟฟิศ' },
  { key: 'onebkk', en: 'Bangkok : One Bangkok', th: 'กรุงเทพฯ : One Bangkok' },
  { key: 'unable', en: "I'm unable to work in a different province", th: 'ไม่สามารถไปทำงานต่างจังหวัดได้' }
];

export const UPCOUNTRY_LOCATIONS = UPCOUNTRY_LOCATIONS_DATA.map(l => l.en);

export const MOCK_APPLICATION_DATA: any = {
  // Step 1: Job Interest
  businessUnit: 'Head Office',
  department: 'Technology',
  position: 'Software Engineer',
  expectedSalary: '50000',
  isSalaryNegotiable: true,
  availability: '2024-01-01',
  sourceChannel: 'LinkedIn',
  campaignTag: 'Test-Run',

  // Step 2: Personal Info
  isThaiNational: true,
  nationalId: '1234567890123',
  title: 'นาย',
  firstName: 'สมชาย',
  lastName: 'ดีมาก',
  titleEn: 'Mr.',
  firstNameEn: 'Somchai',
  lastNameEn: 'Deemak',
  nickname: 'ชาย',
  nicknameEn: 'Chai',
  dateOfBirth: '1995-05-15',
  age: '29',
  weight: '70',
  height: '175',
  militaryStatus: 'Exempted',
  email: 'somchai.test@example.com',
  phone: '0812345678',

  // Step 3: Contact Info
  registeredAddress: '123 Test Road',
  registeredProvince: 'Bangkok',
  registeredDistrict: 'Pathum Wan',
  registeredSubDistrict: 'Lumphini',
  currentAddress: '456 Condo Test',
  currentProvince: 'Bangkok',
  currentDistrict: 'Vadhana',
  currentSubDistrict: 'Khlong Tan Nuea',

  // Step 4: Family Info
  maritalStatus: 'Single',
  children: 0,
  fatherName: 'Somnuek Dee',
  fatherAge: '60',
  fatherOccupation: 'Retired',
  motherName: 'Somsee Dee',
  motherAge: '58',
  motherOccupation: 'Housewife',
  siblings: 1,

  // Step 5: Education
  education: {
    highSchool: {
      institute: 'Test High School',
      major: 'Science-Math',
      gpa: '3.50',
      yearStart: '2010',
      yearFinish: '2013'
    },
    vocational: {
      institute: '',
      major: '',
      gpa: '',
      yearStart: '',
      yearFinish: ''
    },
    bachelor: {
      institute: 'Test University',
      major: 'Computer Science',
      gpa: '3.25',
      yearStart: '2013',
      yearFinish: '2017'
    },
    master: {
      institute: '',
      major: '',
      gpa: '',
      yearStart: '',
      yearFinish: ''
    }
  },

  // Step 6: Skills
  englishSkill: 'Good',
  englishScore: 'TOEIC 750',
  chineseSkill: 'None',
  chineseScore: '',
  otherLang: '',
  driving: {
    motorcycle: true,
    motorcycleLicense: true,
    car: true,
    carLicense: true,
    licenseClasses: ['Private Car']
  },
  computerSkills: {
    word: 'Good',
    excel: 'Advanced',
    powerpoint: 'Good',
    sheets: 'Advanced',
    docs: 'Good',
    forms: 'Good',
    slides: 'Good'
  },
  graphicsSkills: {
    canva: 'Fair',
    videoEditor: 'Fair'
  },
  specialAbility: 'Coding in React, Node.js',
  hobbies: 'Running, Reading',

  // Step 7: Experience (Requires proper array structure if type enforces arrays)
  experience: [
    {
      dateFrom: '2017-06',
      dateTo: '2020-05',
      companyName: 'Old Tech Co',
      position: 'Junior Dev',
      salary: '25000',
      businessType: 'Software House',
      jobDescription: 'Full stack development',
      reasonForLeaving: 'Career growth'
    }
  ],

  // Step 8: Questionnaire
  upcountryLocations: [],
  strength: 'Fast learner, Team player',
  weakness: 'Perfectionist',
  lessFitTask: 'Routine data entry',
  principles: 'Integrity and Hard work',
  troubleResolve: 'Analyze root cause and fix',
  jobCriteria: 'Good culture and growth',
  interests: 'AI, Cloud Computing',
  digitalTransformOpinion: 'Essential for survival',

  // Step 9: Health & Emergency
  emergencyContactName: 'Somnuek Dee',
  emergencyContactRelation: 'Father',
  emergencyContactPhone: '0811111111',
  emergencyContactCompany: 'Home',
  emergencyContactPosition: 'Retired',
  hasChronicDisease: false,
  chronicDiseaseDetail: '',
  hasSurgery: false,
  surgeryDetail: '',
  hasMedicalRecord: false,
  medicalRecordDetail: '',

  // Step 10: Documents/Links
  profileLinks: 'https://linkedin.com/in/somchai-test'
};
