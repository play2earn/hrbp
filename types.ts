
export type Role = 'applicant' | 'mod' | 'admin' | 'guest';

export type Language = 'en' | 'th';

export type SkillLevel = 'Advanced' | 'Good' | 'Fair' | 'No Skill';

export interface EducationEntry {
  institute: string;
  major: string;
  gpa: string;
  startDate: string;
  endDate: string;
}

export interface WorkEntry {
  from: string;
  to: string;
  position: string;
  company: string;
  salary: string;
  businessType: string;
  description: string;
}

export interface ApplicationForm {
  // Step 1: Job Interest
  businessUnit: string;
  department: string;
  position: string;
  expectedSalary: string;
  isSalaryNegotiable: boolean;
  availability: string;
  sourceChannel: string;
  campaignTag: string;

  // Step 2: Personal Info
  isThaiNational: boolean;
  nationalId?: string;
  passportNo?: string;
  title: string;
  firstName: string;
  lastName: string;
  titleEn: string;      // English prefix
  firstNameEn: string;  // English first name
  lastNameEn: string;   // English last name
  nickname: string;
  nicknameEn: string;
  dateOfBirth: string;
  age: string;
  weight: string;
  height: string;
  militaryStatus: string;
  email: string;
  phone: string;

  // Step 3: Contact Info
  registeredAddress: string;
  registeredProvince: string;
  registeredDistrict: string;
  registeredSubDistrict: string;
  registeredPostcode: string;
  currentAddress: string;
  currentProvince: string;
  currentDistrict: string;
  currentSubDistrict: string;
  currentPostcode: string;

  // Step 4: Family
  maritalStatus: string;
  spouseName?: string;
  spouseAge?: string;
  spouseOccupation?: string;
  childrenCount: number;

  fatherName: string;
  fatherAge: string;
  fatherOccupation: string;
  motherName: string;
  motherAge: string;
  motherOccupation: string;
  siblingCount: number;

  // Step 5: Education
  education: {
    highSchool: EducationEntry;
    vocational: EducationEntry;
    bachelor: EducationEntry;
    master: EducationEntry;
  };

  // Step 6: Skills
  englishSkill: string;
  englishScore: string;
  chineseSkill: string;
  chineseScore: string;
  otherLang: string;

  driving: {
    motorcycle: boolean;
    motorcycleLicense: boolean;
    car: boolean;
    carLicense: boolean;
    licenseClasses: string[];
  };

  computerSkills: {
    word: SkillLevel;
    excel: SkillLevel;
    powerpoint: SkillLevel;
    sheets: SkillLevel;
    docs: SkillLevel;
    forms: SkillLevel;
    slides: SkillLevel;
  };

  graphicsSkills: {
    canva: SkillLevel;
    videoEditor: SkillLevel;
  };

  specialAbility: string;
  hobbies: string;

  // Step 7: Work History
  experience: WorkEntry[];

  // Step 8: Questionnaire
  upcountryLocations: string[];
  strength: string;
  weakness: string;
  lessFitTask: string;
  principles: string;
  troubleResolve: string;
  jobCriteria: string;
  interests: string;
  digitalTransformOpinion: string;

  // Step 9: Health & Emergency
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  emergencyContactCompany: string;
  emergencyContactPosition: string;

  hasChronicDisease: boolean;
  chronicDiseaseDetail: string;
  hasSurgery: boolean;
  surgeryDetail: string;
  hasMedicalRecord: boolean;
  medicalRecordDetail: string;

  // Step 10: Uploads
  photoUrl: string;
  resumeUrl: string;
  certificateUrl: string;
  otherDocsUrl: string;
  profileLinks: string; // LinkedIn, JobThai, etc.
}

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

const emptyEdu: EducationEntry = { institute: '', major: '', gpa: '', startDate: '', endDate: '' };

export const INITIAL_FORM_STATE: ApplicationForm = {
  businessUnit: '',
  department: '',
  position: '',
  expectedSalary: '',
  isSalaryNegotiable: false,
  availability: '',
  sourceChannel: 'Direct',
  campaignTag: 'General',

  isThaiNational: true,
  title: 'Mr.',
  firstName: '',
  lastName: '',
  titleEn: 'Mr.',
  firstNameEn: '',
  lastNameEn: '',
  nickname: '',
  nicknameEn: '',
  dateOfBirth: '',
  age: '',
  weight: '',
  height: '',
  militaryStatus: 'Exempted',
  email: '',
  phone: '',

  registeredAddress: '',
  registeredProvince: '',
  registeredDistrict: '',
  registeredSubDistrict: '',
  registeredPostcode: '',
  currentAddress: '',
  currentProvince: '',
  currentDistrict: '',
  currentSubDistrict: '',
  currentPostcode: '',

  maritalStatus: 'Single',
  childrenCount: 0,
  fatherName: '',
  fatherAge: '',
  fatherOccupation: '',
  motherName: '',
  motherAge: '',
  motherOccupation: '',
  siblingCount: 0,

  education: {
    highSchool: { ...emptyEdu },
    vocational: { ...emptyEdu },
    bachelor: { ...emptyEdu },
    master: { ...emptyEdu }
  },

  englishSkill: 'Fair',
  englishScore: '',
  chineseSkill: 'None',
  chineseScore: '',
  otherLang: '',

  driving: {
    motorcycle: false,
    motorcycleLicense: false,
    car: false,
    carLicense: false,
    licenseClasses: []
  },

  computerSkills: {
    word: 'Fair',
    excel: 'Fair',
    powerpoint: 'Fair',
    sheets: 'Fair',
    docs: 'Fair',
    forms: 'Fair',
    slides: 'Fair',
  },

  graphicsSkills: {
    canva: 'No Skill',
    videoEditor: 'No Skill'
  },

  specialAbility: '',
  hobbies: '',

  experience: [],

  upcountryLocations: [],
  strength: '',
  weakness: '',
  lessFitTask: '',
  principles: '',
  troubleResolve: '',
  jobCriteria: '',
  interests: '',
  digitalTransformOpinion: '',

  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',
  emergencyContactCompany: '',
  emergencyContactPosition: '',

  hasChronicDisease: false,
  chronicDiseaseDetail: '',
  hasSurgery: false,
  surgeryDetail: '',
  hasMedicalRecord: false,
  medicalRecordDetail: '',

  photoUrl: '',
  resumeUrl: '',
  certificateUrl: '',
  otherDocsUrl: '',
  profileLinks: ''
};
