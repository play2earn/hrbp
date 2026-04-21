
import React, { useState, useEffect } from 'react';
import { ApplicationForm, INITIAL_FORM_STATE, Language, SkillLevel, EducationEntry, WorkEntry } from '../types';
import { TRANSLATIONS, MOCK_BU, MOCK_DEPARTMENTS, MOCK_POSITIONS, MILITARY_STATUS_OPTIONS, UPCOUNTRY_LOCATIONS, UPCOUNTRY_LOCATIONS_DATA, MOCK_APPLICATION_DATA } from '../constants';
import { Button, Input, Select, TextArea, Card, DatePicker, FileUpload, Modal } from './UIComponents';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { PDFPreview } from './PDFPreview';
import { api } from '../services/api';

interface ApplicantFormProps {
  lang: Language;
  urlParams: { bu?: string; ch?: string; tag?: string };
  initialValues?: Partial<ApplicationForm>;
}

// --- Enhanced Radio Components ---

const SkillRadioGroup: React.FC<{
  label: string;
  value: SkillLevel;
  onChange: (val: SkillLevel) => void;
  optionsText: { [key: string]: string };
}> = ({ label, value, onChange, optionsText }) => (
  <div className="py-5 border-b border-gray-200 last:border-0">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <span className="text-sm font-bold text-gray-900 sm:w-1/3">{label}</span>
      <div className="flex flex-wrap gap-2 sm:w-2/3 sm:justify-end">
        {['Advanced', 'Good', 'Fair', 'No Skill'].map((level) => {
          const key = level === 'No Skill' ? 'noSkill' : level.toLowerCase();
          const isSelected = value === level;
          return (
            <label
              key={level}
              className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all border select-none
                  ${isSelected
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}
                `}
            >
              <input
                type="radio"
                checked={isSelected}
                onChange={() => onChange(level as SkillLevel)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-white bg-indigo-600' : 'border-gray-400 bg-white'}`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-sm font-semibold">{optionsText[key] || level}</span>
            </label>
          )
        })}
      </div>
    </div>
  </div>
);

const RadioOption: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
  name?: string;
  className?: string;
}> = ({ label, checked, onChange, name, className = '' }) => (
  <label className={`
    flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all select-none
    ${checked
      ? 'bg-indigo-50 border-indigo-600 shadow-sm'
      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
    ${className}
  `}>
    <div className="relative flex items-center justify-center">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400 bg-white'}`}>
        {checked && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
      </div>
    </div>
    <span className={`text-base font-medium ${checked ? 'text-indigo-900' : 'text-gray-700'}`}>{label}</span>
  </label>
);

const CheckboxOption: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}> = ({ label, checked, onChange, className = '' }) => (
  <label className={`
    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all select-none group
    ${className}
  `}>
    <div className={`
      w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shadow-sm
      ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-indigo-400'}
    `}>
      <Check className="w-4 h-4" strokeWidth={3} />
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />
    <span className={`text-base ${checked ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>{label}</span>
  </label>
);

export const ApplicantFormComp: React.FC<ApplicantFormProps> = ({ lang, urlParams, initialValues }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationForm>({
    ...INITIAL_FORM_STATE,
    ...initialValues,
    businessUnit: urlParams.bu || initialValues?.businessUnit || '',
    sourceChannel: urlParams.ch || 'Direct',
    campaignTag: urlParams.tag || 'General',
  });
  const [showPreview, setShowPreview] = useState(false);

  // File upload states
  const [uploadingState, setUploadingState] = useState({
    photo: false,
    resume: false,
    certificate: false
  });

  // Master Data State
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [bus, setBus] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdistricts, setSubdistricts] = useState<any[]>([]);

  // Current Address State (for cascading)
  const [currentDistricts, setCurrentDistricts] = useState<any[]>([]);
  const [currentSubdistricts, setCurrentSubdistricts] = useState<any[]>([]);

  const [universities, setUniversities] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);

  // Fetch Initial Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      const [deptData, buData, provData, uniData, collegeData, facData] = await Promise.all([
        api.master.getDepartments(),
        api.master.getBusinessUnits(),
        api.master.getProvinces(),
        api.master.getUniversities(),
        api.master.getColleges(),
        api.master.getFaculties()
      ]);
      setDepartments(deptData);
      setBus(buData);
      setProvinces(provData);
      setUniversities(uniData);
      setColleges(collegeData);
      setFaculties(facData);
    };
    fetchMasterData();
  }, []);

  // Fetch Positions when Department changes
  useEffect(() => {
    if (formData.department) {
      // Find dept ID from name (assuming name is stored, but API needs ID to filter positions)
      // Ideally we should store ID, but schema stores strings. 
      // We'll find the ID from the departments list.
      const dept = departments.find(d => d.name_en === formData.department || d.name_th === formData.department);
      if (dept) {
        api.master.getPositions(dept.id).then(setPositions);
      } else {
        setPositions([]);
      }
    } else {
      setPositions([]);
    }
  }, [formData.department, departments]);

  // Load ALL subdistricts for postcode search
  const [allSubdistricts, setAllSubdistricts] = useState<any[]>([]);
  const [postcodeSearch, setPostcodeSearch] = useState('');
  const [postcodeResults, setPostcodeResults] = useState<any[]>([]);
  const [currentPostcodeSearch, setCurrentPostcodeSearch] = useState('');
  const [currentPostcodeResults, setCurrentPostcodeResults] = useState<any[]>([]);

  useEffect(() => {
    // Clear cache to get fresh data
    api.master.clearCache();
    api.master.getAllSubdistricts().then(setAllSubdistricts);
  }, []);

  // Cascading: Fetch Districts when Province changes (Registered)
  useEffect(() => {
    if (formData.registeredProvince) {
      const prov = provinces.find(p => p.name_th === formData.registeredProvince);
      if (prov) {
        api.master.getDistricts(prov.id).then(setDistricts);
      } else {
        setDistricts([]);
      }
    } else {
      setDistricts([]);
    }
  }, [formData.registeredProvince, provinces]);

  // Cascading: Fetch Subdistricts when District changes (Registered)
  useEffect(() => {
    if (formData.registeredDistrict) {
      const dist = districts.find(d => d.name_th === formData.registeredDistrict);
      if (dist) {
        api.master.getSubdistricts(dist.id).then(setSubdistricts);
      } else {
        setSubdistricts([]);
      }
    } else {
      setSubdistricts([]);
    }
  }, [formData.registeredDistrict, districts]);

  // Cascading: Fetch Districts when Province changes (Current)
  useEffect(() => {
    if (formData.currentProvince) {
      const prov = provinces.find(p => p.name_th === formData.currentProvince);
      if (prov) {
        api.master.getDistricts(prov.id).then(setCurrentDistricts);
      } else {
        setCurrentDistricts([]);
      }
    } else {
      setCurrentDistricts([]);
    }
  }, [formData.currentProvince, provinces]);

  // Cascading: Fetch Subdistricts when District changes (Current)
  useEffect(() => {
    if (formData.currentDistrict) {
      const dist = currentDistricts.find(d => d.name_th === formData.currentDistrict);
      if (dist) {
        api.master.getSubdistricts(dist.id).then(setCurrentSubdistricts);
      } else {
        setCurrentSubdistricts([]);
      }
    } else {
      setCurrentSubdistricts([]);
    }
  }, [formData.currentDistrict, currentDistricts]);

  // Postcode search handler - search by typing postcode
  const handlePostcodeSearch = (searchValue: string, addressType: 'registered' | 'current') => {
    if (addressType === 'registered') {
      setPostcodeSearch(searchValue);
      if (searchValue.length >= 3) {
        console.log('Total allSubdistricts:', allSubdistricts.length);
        console.log('Searching for:', searchValue);
        const results = allSubdistricts.filter(s =>
          s.postcode?.toString().startsWith(searchValue)
        );
        console.log('Found results:', results.length, results);
        setPostcodeResults(results.slice(0, 10));
      } else {
        setPostcodeResults([]);
      }
    } else {
      setCurrentPostcodeSearch(searchValue);
      if (searchValue.length >= 3) {
        const results = allSubdistricts.filter(s =>
          s.postcode?.toString().startsWith(searchValue)
        ).slice(0, 10);
        setCurrentPostcodeResults(results);
      } else {
        setCurrentPostcodeResults([]);
      }
    }
  };

  // Select postcode result and auto-fill address
  const selectPostcodeResult = async (subdistrict: any, addressType: 'registered' | 'current') => {
    // Find district from subdistrict
    const allDistricts = await api.master.getAllDistricts();
    const district = allDistricts.find((d: any) => d.id === subdistrict.district_id);

    // Find province from district
    const province = provinces.find(p => p.id === district?.province_id);

    if (addressType === 'registered') {
      updateField('registeredProvince', province?.name_th || '');
      updateField('registeredDistrict', district?.name_th || '');
      updateField('registeredSubDistrict', subdistrict.name_th);
      updateField('registeredPostcode', subdistrict.postcode?.toString() || '');
      setPostcodeSearch('');
      setPostcodeResults([]);
    } else {
      updateField('currentProvince', province?.name_th || '');
      updateField('currentDistrict', district?.name_th || '');
      updateField('currentSubDistrict', subdistrict.name_th);
      updateField('currentPostcode', subdistrict.postcode?.toString() || '');
      setCurrentPostcodeSearch('');
      setCurrentPostcodeResults([]);
    }
  };


  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, showPreview]);

  const t = TRANSLATIONS[lang];

  // Helper to update top-level fields
  const updateField = (field: keyof ApplicationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to update nested object fields
  const updateNested = (parent: keyof ApplicationForm, child: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [child]: value
      }
    }));
  };

  const handleFileUpload = async (file: File | null, fieldName: 'photoUrl' | 'resumeUrl' | 'certificateUrl', stateKey: 'photo' | 'resume' | 'certificate') => {
    if (!file) {
      updateField(fieldName, '');
      return;
    }

    setUploadingState(prev => ({ ...prev, [stateKey]: true }));

    try {
      // Use API service
      const url = await api.uploadFile(file, stateKey);

      if (url) {
        updateField(fieldName, url); // Store URL, not just filename
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      alert(error.message || "Upload failed. Please try again.");
    } finally {
      setUploadingState(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  const handleFinalSubmit = () => {
    setIsConfirmModalOpen(true);
  };

  const executeSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    const result = await api.submitApplication(formData);
    setIsSubmitting(false);

    if (result.success) {
      if (result.data && result.data.id) {
        setTrackingId(result.data.id);
      }
      setSubmitSuccess(true);
    } else {
      // Show actual error message if possible, or fallback
      const errorMsg = result.error?.message || 'Submission failed. Please try again later.';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Auto Calculate Age
  const handleDateOfBirthChange = (val: string) => {
    updateField('dateOfBirth', val);
    if (val) {
      const today = new Date();
      const birthDate = new Date(val);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updateField('age', age.toString());
    }
  };

  // Update Work Experience
  const updateExperience = (index: number, field: keyof WorkEntry, value: string) => {
    const newExp = [...formData.experience];
    if (!newExp[index]) newExp[index] = { from: '', to: '', position: '', company: '', salary: '', businessType: '', description: '' };
    newExp[index][field] = value;
    updateField('experience', newExp);
  };

  const addExperience = () => {
    updateField('experience', [...formData.experience, { from: '', to: '', position: '', company: '', salary: '', businessType: '', description: '' }]);
  };

  const removeExperience = (index: number) => {
    const newExp = [...formData.experience];
    newExp.splice(index, 1);
    updateField('experience', newExp);
  };

  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const totalSteps = steps.length;
  const progressPercentage = ((currentStep / totalSteps) * 100);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 2) {
      // National ID: 13 digits
      if (formData.isThaiNational && formData.nationalId) {
        const cleaned = formData.nationalId.replace(/\D/g, '');
        if (cleaned.length !== 13) {
          errors.nationalId = lang === 'th' ? 'เลขบัตรประชาชนต้องมี 13 หลัก' : 'National ID must be 13 digits';
        }
      }
      // Phone: 10 digits
      if (formData.phone) {
        const cleaned = formData.phone.replace(/\D/g, '');
        if (cleaned.length !== 10) {
          errors.phone = lang === 'th' ? 'เบอร์โทรศัพท์ต้องมี 10 หลัก' : 'Phone number must be 10 digits';
        }
      }
      // Email format
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.email = lang === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
        }
      }
    }

    // Step 3 also has phone/email
    if (step === 3) {
      if (formData.phone) {
        const cleaned = formData.phone.replace(/\D/g, '');
        if (cleaned.length !== 10) {
          errors.phone = lang === 'th' ? 'เบอร์โทรศัพท์ต้องมี 10 หลัก' : 'Phone number must be 10 digits';
        }
      }
      if (formData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          errors.email = lang === 'th' ? 'รูปแบบอีเมลไม่ถูกต้อง' : 'Invalid email format';
        }
      }
    }

    if (step === 8) {
      if (formData.upcountryLocations.length === 0) {
        errors.upcountryLocations = lang === 'th' ? 'กรุณาเลือกพื้นที่' : 'Please select location';
      }
      const qFields = ['strength', 'weakness', 'lessFitTask', 'principles', 'troubleResolve', 'jobCriteria', 'interests', 'digitalTransformOpinion'] as const;
      for (const field of qFields) {
        const val = formData[field];
        if (!val || val.trim() === '') {
          errors[field] = lang === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please complete this field';
        } else if (val.length > 250) {
          errors[field] = lang === 'th' ? 'ห้ามเกิน 250 ตัวอักษร' : 'Max 250 characters exceeded';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) setCurrentStep(prev => prev + 1);
    else setShowPreview(true);
  };

  const handleBack = () => {
    if (showPreview) setShowPreview(false);
    else if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-xl">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-600 mb-8">Thank you for your interest in NovaRecruit.</p>

        {trackingId && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-md mx-auto mb-8 shadow-inner">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Tracking ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-xl font-mono font-bold text-indigo-600 bg-white px-3 py-1 rounded border border-indigo-100">{trackingId}</code>
              <CopyButton text={trackingId} />
            </div>
            <p className="text-xs text-slate-400 mt-2">Please save this ID to track your application status.</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>Apply for another position</Button>
          <Button onClick={() => window.location.reload()} className="bg-slate-900 text-white shadow-lg">Return to Home</Button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <>
        <PDFPreview
          data={formData}
          onEdit={() => setShowPreview(false)}
          onSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
          lang={lang}
        />
        {/* Confirmation Modal */}
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title={t.actions.submit}
          size="md"
        >
          <div className="space-y-6 p-2">
            <p className="text-gray-600 text-center">
              {lang === 'en'
                ? 'Are you sure you want to submit your application? Please make sure all information is correct.'
                : 'คุณแน่ใจหรือไม่ที่จะส่งใบสมัคร? โปรดตรวจสอบข้อมูลทั้งหมดให้ถูกต้อง'
              }
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                {t.actions.back}
              </Button>
              <Button onClick={executeSubmit} isLoading={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {t.actions.submit}
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

      {/* Progress Bar (Compact Mobile / Expanded Desktop) */}
      <div className="mb-8">
        <div className="hidden lg:block">
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute w-full left-0 top-[1.25rem] -z-0 px-6">
              <div className="h-0.5 w-full bg-gray-200"></div>
            </div>
            {steps.map((step) => (
              <div key={step} className="flex flex-col items-center relative z-10 bg-slate-50 px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${step === currentStep ? 'bg-indigo-600 border-indigo-600 text-white' :
                    step < currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`text-[10px] uppercase mt-2 font-bold tracking-wider ${step === currentStep ? 'text-indigo-700' : 'text-gray-400'
                  }`}>
                  {t.steps[step as keyof typeof t.steps].split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:hidden">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-2xl font-bold text-indigo-600">{currentStep}</span>
              <span className="text-gray-400 font-medium"> / {totalSteps}</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {t.steps[currentStep as keyof typeof t.steps]}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      <div className="form-step-enter" key={currentStep}>
        <Card className="min-h-[500px]">

          {currentStep === 1 && (
            <>
              {/* Application Info Header (New Request) */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลการสมัคร</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  {formData.businessUnit && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                      <span className="text-indigo-400 mr-2">BU:</span> {formData.businessUnit}
                    </span>
                  )}
                  {(formData.sourceChannel && formData.sourceChannel !== 'Direct') && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                      <span className="text-emerald-400 mr-2">Channel:</span> {formData.sourceChannel}
                    </span>
                  )}
                  {formData.campaignTag && formData.campaignTag !== 'General' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-100">
                      <span className="text-amber-400 mr-2">Tag:</span> {formData.campaignTag}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">
            {t.steps[currentStep as keyof typeof t.steps]}
          </h2>

          {/* Top Navigation Buttons */}
          <div className="flex justify-between mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> {t.actions.back}
            </Button>
            <Button onClick={handleNext} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {currentStep === steps.length ? 'Preview' : t.actions.next} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* --- Step 1: Job Interest --- */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BU/Channel/Tag come from URL params only - not selectable by user */}
              <Select
                label={t.labels.department}
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                options={departments.map(d => ({ label: lang === 'en' ? d.name_en : d.name_th, value: d.name_en }))}
              />
              <Select
                label={t.labels.position}
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                options={positions.map(p => ({ label: lang === 'en' ? (p.name_en || p.name_th) : p.name_th, value: p.name_th }))}
              />
              <div className="flex gap-4 items-end">
                <Input
                  label={t.labels.salary}
                  type="number"
                  value={formData.expectedSalary}
                  onChange={(e) => updateField('expectedSalary', e.target.value)}
                  className="flex-1"
                />
                <div className="mb-3">
                  <CheckboxOption
                    label={t.labels.negotiable}
                    checked={formData.isSalaryNegotiable}
                    onChange={(checked) => updateField('isSalaryNegotiable', checked)}
                  />
                </div>
              </div>
              <DatePicker label={t.labels.startDate} value={formData.availability} onChange={(val) => updateField('availability', val)} />
            </div>
          )}

          {/* --- Step 2: Personal Info --- */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.labels.nationality}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RadioOption label={t.labels.thai} checked={formData.isThaiNational} onChange={() => updateField('isThaiNational', true)} />
                  <RadioOption label={t.labels.foreigner} checked={!formData.isThaiNational} onChange={() => updateField('isThaiNational', false)} />
                </div>
              </div>

              <div>
                <Input label={formData.isThaiNational ? t.labels.idCard : t.labels.passport} value={formData.isThaiNational ? formData.nationalId : formData.passportNo} onChange={(e) => updateField(formData.isThaiNational ? 'nationalId' : 'passportNo', e.target.value)} maxLength={formData.isThaiNational ? 13 : 20} />
                {validationErrors.nationalId && <p className="text-red-500 text-xs mt-1">{validationErrors.nationalId}</p>}
              </div>

              {/* Thai Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">ชื่อภาษาไทย / Thai Name</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1"><Select label={t.labels.title} options={[{ label: 'นาย', value: 'นาย' }, { label: 'นาง', value: 'นาง' }, { label: 'นางสาว', value: 'นางสาว' }]} value={formData.title} onChange={(e) => updateField('title', e.target.value)} /></div>
                  <div className="col-span-1"><Input label={t.labels.firstName} value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="ชื่อ" /></div>
                  <div className="col-span-1"><Input label={t.labels.lastName} value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="นามสกุล" /></div>
                </div>
              </div>

              {/* English Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">ชื่อภาษาอังกฤษ / English Name</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1"><Select label="Title (EN)" options={[{ label: 'Mr.', value: 'Mr.' }, { label: 'Ms.', value: 'Ms.' }, { label: 'Mrs.', value: 'Mrs.' }]} value={formData.titleEn} onChange={(e) => updateField('titleEn', e.target.value)} /></div>
                  <div className="col-span-1"><Input label="First Name (EN)" value={formData.firstNameEn} onChange={(e) => updateField('firstNameEn', e.target.value)} placeholder="First Name" /></div>
                  <div className="col-span-1"><Input label="Last Name (EN)" value={formData.lastNameEn} onChange={(e) => updateField('lastNameEn', e.target.value)} placeholder="Last Name" /></div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <Input label={t.labels.nickname} value={formData.nickname} onChange={(e) => updateField('nickname', e.target.value)} placeholder={lang === 'th' ? 'ชื่อเล่นภาษาไทย' : 'Thai nickname'} />
                  <Input label={t.labels.nicknameEn} value={formData.nicknameEn} onChange={(e) => updateField('nicknameEn', e.target.value)} placeholder={lang === 'th' ? 'ชื่อเล่นภาษาอังกฤษ' : 'English nickname'} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><DatePicker label={t.labels.dob} value={formData.dateOfBirth} onChange={handleDateOfBirthChange} /></div>
                <div className="w-24"><Input label={t.labels.age} type="number" value={formData.age} readOnly className="bg-gray-50 text-gray-500" /></div>
              </div>

              <div className="flex gap-4">
                <Input label={t.labels.weight} type="number" value={formData.weight} onChange={(e) => updateField('weight', e.target.value)} />
                <Input label={t.labels.height} type="number" value={formData.height} onChange={(e) => updateField('height', e.target.value)} />
              </div>

              <Select label={t.labels.military} options={MILITARY_STATUS_OPTIONS.map(o => ({ label: t.options[o.toLowerCase() as keyof typeof t.options] || o, value: o.split(' / ')[0] }))} value={formData.militaryStatus} onChange={(e) => updateField('militaryStatus', e.target.value)} />
            </div>
          )}

          {/* --- Step 3: Contact Info --- */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Registered Address */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-800">{t.labels.registeredAddress}</h3>
                <Input label={t.labels.registeredAddress} value={formData.registeredAddress} onChange={(e) => updateField('registeredAddress', e.target.value)} placeholder="บ้านเลขที่ หมู่ ซอย ถนน" />

                {/* Thai National: Cascading Dropdowns + Postcode Search */}
                {formData.isThaiNational ? (
                  <div className="space-y-4">
                    {/* Postcode Search Box */}
                    <div className="relative">
                      <label className="text-sm text-gray-700 mb-1 block">🔍 ค้นหาจากรหัสไปรษณีย์</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg p-2 w-full"
                        placeholder="พิมพ์รหัสไปรษณีย์ เช่น 10200"
                        value={postcodeSearch}
                        onChange={(e) => handlePostcodeSearch(e.target.value, 'registered')}
                      />
                      {postcodeResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {postcodeResults.map((sub, idx) => (
                            <div
                              key={idx}
                              className="p-3 hover:bg-indigo-50 cursor-pointer border-b text-sm"
                              onClick={() => selectPostcodeResult(sub, 'registered')}
                            >
                              <span className="font-semibold text-indigo-600">{sub.postcode}</span>
                              <span className="mx-2">-</span>
                              <span>{sub.name_th}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4-Level Cascading Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">{t.labels.province}</label>
                        <select
                          className="border border-gray-300 rounded-lg p-2"
                          value={formData.registeredProvince}
                          onChange={(e) => {
                            updateField('registeredProvince', e.target.value);
                            updateField('registeredDistrict', '');
                            updateField('registeredSubDistrict', '');
                            updateField('registeredPostcode', '');
                          }}
                        >
                          <option value="">เลือกจังหวัด</option>
                          {provinces.map(p => <option key={p.id} value={p.name_th}>{lang === 'en' ? p.name_en : p.name_th}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">{t.labels.district}</label>
                        <select
                          className="border border-gray-300 rounded-lg p-2"
                          value={formData.registeredDistrict}
                          onChange={(e) => {
                            updateField('registeredDistrict', e.target.value);
                            updateField('registeredSubDistrict', '');
                            updateField('registeredPostcode', '');
                          }}
                          disabled={!formData.registeredProvince}
                        >
                          <option value="">เลือกเขต/อำเภอ</option>
                          {districts.map(d => <option key={d.id} value={d.name_th}>{lang === 'en' ? d.name_en : d.name_th}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">{t.labels.subDistrict}</label>
                        <select
                          className="border border-gray-300 rounded-lg p-2"
                          value={formData.registeredSubDistrict}
                          onChange={(e) => {
                            const subdistrictName = e.target.value;
                            updateField('registeredSubDistrict', subdistrictName);
                            // Auto-fill postcode from subdistrict
                            const selectedSub = subdistricts.find(s => s.name_th === subdistrictName);
                            if (selectedSub?.postcode) {
                              updateField('registeredPostcode', selectedSub.postcode.toString());
                            }
                          }}
                          disabled={!formData.registeredDistrict}
                        >
                          <option value="">เลือกแขวง/ตำบล</option>
                          {subdistricts.map(s => <option key={s.id} value={s.name_th}>{lang === 'en' ? s.name_en : s.name_th}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">รหัสไปรษณีย์</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg p-2 bg-gray-50"
                          value={formData.registeredPostcode}
                          readOnly
                          placeholder="อัตโนมัติ"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Foreigner: Free text inputs */
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Input label="Province / State" value={formData.registeredProvince} onChange={(e) => updateField('registeredProvince', e.target.value)} placeholder="Province/State" />
                    <Input label="District / City" value={formData.registeredDistrict} onChange={(e) => updateField('registeredDistrict', e.target.value)} placeholder="City" />
                    <Input label="Sub-District / Area" value={formData.registeredSubDistrict} onChange={(e) => updateField('registeredSubDistrict', e.target.value)} placeholder="Area" />
                    <Input label="Postal Code" value={formData.registeredPostcode} onChange={(e) => updateField('registeredPostcode', e.target.value)} placeholder="Postal Code" />
                  </div>
                )}
              </div>

              {/* Current Address */}
              <div className="bg-white border p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-800">{t.labels.currentAddress}</h3>
                <Input label={t.labels.currentAddress} value={formData.currentAddress} onChange={(e) => updateField('currentAddress', e.target.value)} placeholder="บ้านเลขที่ หมู่ ซอย ถนน" />

                {/* Thai National: Cascading Dropdowns + Postcode Search */}
                {formData.isThaiNational ? (
                  <div className="space-y-4">
                    {/* Postcode Search Box for Current Address */}
                    <div className="relative">
                      <label className="text-sm text-gray-700 mb-1 block">🔍 ค้นหาจากรหัสไปรษณีย์</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg p-2 w-full"
                        placeholder="พิมพ์รหัสไปรษณีย์ เช่น 10200"
                        value={currentPostcodeSearch}
                        onChange={(e) => handlePostcodeSearch(e.target.value, 'current')}
                      />
                      {currentPostcodeResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {currentPostcodeResults.map((sub, idx) => (
                            <div
                              key={idx}
                              className="p-3 hover:bg-indigo-50 cursor-pointer border-b text-sm"
                              onClick={() => selectPostcodeResult(sub, 'current')}
                            >
                              <span className="font-semibold text-indigo-600">{sub.postcode}</span>
                              <span className="mx-2">-</span>
                              <span>{sub.name_th}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4-Level Cascading Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">{t.labels.province}</label>
                        <select
                          className="border border-gray-300 rounded-lg p-2"
                          value={formData.currentProvince}
                          onChange={(e) => {
                            updateField('currentProvince', e.target.value);
                            updateField('currentDistrict', '');
                            updateField('currentSubDistrict', '');
                            updateField('currentPostcode', '');
                          }}
                        >
                          <option value="">เลือกจังหวัด</option>
                          {provinces.map(p => <option key={p.id} value={p.name_th}>{lang === 'en' ? p.name_en : p.name_th}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">{t.labels.district}</label>
                        <select
                          className="border border-gray-300 rounded-lg p-2"
                          value={formData.currentDistrict}
                          onChange={(e) => {
                            updateField('currentDistrict', e.target.value);
                            updateField('currentSubDistrict', '');
                            updateField('currentPostcode', '');
                          }}
                          disabled={!formData.currentProvince}
                        >
                          <option value="">เลือกเขต/อำเภอ</option>
                          {currentDistricts.map(d => <option key={d.id} value={d.name_th}>{lang === 'en' ? d.name_en : d.name_th}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">{t.labels.subDistrict}</label>
                        <select
                          className="border border-gray-300 rounded-lg p-2"
                          value={formData.currentSubDistrict}
                          onChange={(e) => {
                            const subdistrictName = e.target.value;
                            updateField('currentSubDistrict', subdistrictName);
                            // Auto-fill postcode from subdistrict
                            const selectedSub = currentSubdistricts.find(s => s.name_th === subdistrictName);
                            if (selectedSub?.postcode) {
                              updateField('currentPostcode', selectedSub.postcode.toString());
                            }
                          }}
                          disabled={!formData.currentDistrict}
                        >
                          <option value="">เลือกแขวง/ตำบล</option>
                          {currentSubdistricts.map(s => <option key={s.id} value={s.name_th}>{lang === 'en' ? s.name_en : s.name_th}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm text-gray-700 mb-1">รหัสไปรษณีย์</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg p-2 bg-gray-50"
                          value={formData.currentPostcode}
                          readOnly
                          placeholder="อัตโนมัติ"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Foreigner: Free text inputs */
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Input label="Province / State" value={formData.currentProvince} onChange={(e) => updateField('currentProvince', e.target.value)} placeholder="Province/State" />
                    <Input label="District / City" value={formData.currentDistrict} onChange={(e) => updateField('currentDistrict', e.target.value)} placeholder="City" />
                    <Input label="Sub-District / Area" value={formData.currentSubDistrict} onChange={(e) => updateField('currentSubDistrict', e.target.value)} placeholder="Area" />
                    <Input label="Postal Code" value={formData.currentPostcode} onChange={(e) => updateField('currentPostcode', e.target.value)} placeholder="Postal Code" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input label={t.labels.phone} value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} maxLength={10} />
                  {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
                </div>
                <div>
                  <Input label={t.labels.email} value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                  {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* --- Step 4: Family Info --- */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                <Select
                  label={t.labels.maritalStatus}
                  options={[
                    { label: t.options.single, value: 'Single' },
                    { label: t.options.married, value: 'Married' },
                    { label: t.options.divorced, value: 'Divorced' },
                    { label: t.options.widowed, value: 'Widowed' }
                  ]}
                  value={formData.maritalStatus}
                  onChange={(e) => updateField('maritalStatus', e.target.value)}
                />
                <Input label={t.labels.children} type="number" value={formData.childrenCount} onChange={(e) => updateField('childrenCount', parseInt(e.target.value))} />
                {formData.maritalStatus === 'Married' && (
                  <>
                    <Input label={t.labels.spouseName} value={formData.spouseName} onChange={(e) => updateField('spouseName', e.target.value)} />
                    <div className="flex gap-4">
                      <Input label={t.labels.spouseAge} className="w-24" value={formData.spouseAge} onChange={(e) => updateField('spouseAge', e.target.value)} />
                      <Input label={t.labels.spouseOccupation} className="flex-1" value={formData.spouseOccupation} onChange={(e) => updateField('spouseOccupation', e.target.value)} />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t.options.fatherInfo}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label={t.labels.fatherName} value={formData.fatherName} onChange={(e) => updateField('fatherName', e.target.value)} />
                  <Input label={t.labels.fatherAge} value={formData.fatherAge} onChange={(e) => updateField('fatherAge', e.target.value)} />
                  <Input label={t.labels.fatherOccupation} value={formData.fatherOccupation} onChange={(e) => updateField('fatherOccupation', e.target.value)} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t.options.motherInfo}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label={t.labels.motherName} value={formData.motherName} onChange={(e) => updateField('motherName', e.target.value)} />
                  <Input label={t.labels.motherAge} value={formData.motherAge} onChange={(e) => updateField('motherAge', e.target.value)} />
                  <Input label={t.labels.motherOccupation} value={formData.motherOccupation} onChange={(e) => updateField('motherOccupation', e.target.value)} />
                </div>
              </div>
              <Input label={t.labels.siblings} type="number" value={formData.siblingCount} onChange={(e) => updateField('siblingCount', parseInt(e.target.value))} />
            </div>
          )}

          {/* --- Step 5: Education --- */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {['High School', 'Vocational', 'Bachelor', 'Master'].map((level) => {
                const key = level.toLowerCase().replace(' ', '') === 'highschool' ? 'highSchool' : level.toLowerCase() as keyof typeof formData.education;
                const data = formData.education[key];
                const currentYear = new Date().getFullYear();
                const years = Array.from({ length: currentYear - 1940 + 11 }, (_, i) => currentYear + 10 - i);

                // Determine which list to use for autocomplete
                const instituteList = level === 'Bachelor' || level === 'Master' ? universities : level === 'Vocational' ? colleges : null;
                const listId = level === 'Bachelor' || level === 'Master' ? 'universities-list' : level === 'Vocational' ? 'colleges-list' : null;

                const eduLabelKey: Record<string, string> = { 'High School': 'highSchool', 'Vocational': 'vocational', 'Bachelor': 'bachelor', 'Master': 'master' };

                return (
                  <div key={level} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">{t.options[eduLabelKey[level] as keyof typeof t.options] || level} {lang === 'th' ? '' : 'Degrees'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Institute field - with autocomplete for Bachelor, Master, Vocational */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">{t.labels.institute}</label>
                        {instituteList ? (
                          <>
                            <input
                              type="text"
                              list={listId}
                              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              value={data.institute}
                              onChange={(e) => updateNested('education', key as string, { ...data, institute: e.target.value })}
                              placeholder={`เลือกหรือพิมพ์ชื่อสถาบัน...`}
                            />
                            <datalist id={listId}>
                              {instituteList.map((item: any) => (
                                <option key={item.id} value={item.name}>{item.name_en || ''}</option>
                              ))}
                            </datalist>
                          </>
                        ) : (
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={data.institute}
                            onChange={(e) => updateNested('education', key as string, { ...data, institute: e.target.value })}
                            placeholder="ชื่อสถาบัน..."
                          />
                        )}
                      </div>
                      <Input label={level === 'High School' ? t.labels.program : t.labels.major} value={data.major} onChange={(e) => updateNested('education', key as string, { ...data, major: e.target.value })} />
                      <Input label={t.labels.gpa} value={data.gpa} onChange={(e) => updateNested('education', key as string, { ...data, gpa: e.target.value })} />
                      <div className="flex gap-2">
                        <div className="flex-1 flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">{t.labels.yearStart}</label>
                          <select
                            className="border border-gray-300 rounded-lg p-2"
                            value={data.startDate}
                            onChange={(e) => updateNested('education', key as string, { ...data, startDate: e.target.value })}
                          >
                            <option value="">เลือกปี</option>
                            {years.map(year => <option key={year} value={year.toString()}>{year}</option>)}
                          </select>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">{t.labels.yearFinish}</label>
                          <select
                            className="border border-gray-300 rounded-lg p-2"
                            value={data.endDate}
                            onChange={(e) => updateNested('education', key as string, { ...data, endDate: e.target.value })}
                          >
                            <option value="">เลือกปี</option>
                            {years.map(year => <option key={year} value={year.toString()}>{year}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* --- Step 6: Skills --- */}
          {currentStep === 6 && (
            <div className="space-y-8">
              {/* Language */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">{t.labels.langSkill}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.labels.english}</label>
                    <Select
                      options={[
                        { label: t.options.fluent, value: 'Fluent' },
                        { label: t.options.good, value: 'Good' },
                        { label: t.options.fair, value: 'Fair' },
                        { label: t.options.basic, value: 'Basic' }
                      ]}
                      value={formData.englishSkill}
                      onChange={(e) => updateField('englishSkill', e.target.value)}
                    />
                  </div>
                  <Input label={t.labels.englishScore} value={formData.englishScore} onChange={(e) => updateField('englishScore', e.target.value)} />
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.labels.chinese}</label>
                    <Select
                      options={[
                        { label: t.options.none, value: 'None' },
                        { label: t.options.basic, value: 'Basic' },
                        { label: t.options.good, value: 'Good' },
                        { label: t.options.fluent, value: 'Fluent' }
                      ]}
                      value={formData.chineseSkill}
                      onChange={(e) => updateField('chineseSkill', e.target.value)}
                    />
                  </div>
                  <Input label={t.labels.chineseScore} value={formData.chineseScore} onChange={(e) => updateField('chineseScore', e.target.value)} />
                </div>
              </div>

              {/* Driving */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">{t.labels.driving}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">{t.labels.motorcycle} - {t.labels.canDrive}</span>
                    <div className="flex gap-4">
                      <RadioOption label={t.options.yesIcan} checked={formData.driving.motorcycle} onChange={() => updateNested('driving', 'motorcycle', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.noIcannot} checked={!formData.driving.motorcycle} onChange={() => updateNested('driving', 'motorcycle', false)} className="px-3 py-2" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">{t.labels.haveLicense}</span>
                    <div className="flex gap-4">
                      <RadioOption label={t.options.yesIdo} checked={formData.driving.motorcycleLicense} onChange={() => updateNested('driving', 'motorcycleLicense', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.noIdont} checked={!formData.driving.motorcycleLicense} onChange={() => updateNested('driving', 'motorcycleLicense', false)} className="px-3 py-2" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">{t.labels.car} - {t.labels.canDrive}</span>
                    <div className="flex gap-4">
                      <RadioOption label={t.options.yesIcan} checked={formData.driving.car} onChange={() => updateNested('driving', 'car', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.noIcannot} checked={!formData.driving.car} onChange={() => updateNested('driving', 'car', false)} className="px-3 py-2" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <span className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">{t.labels.haveLicense}</span>
                    <div className="flex gap-4">
                      <RadioOption label={t.options.yesIdo} checked={formData.driving.carLicense} onChange={() => updateNested('driving', 'carLicense', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.noIdont} checked={!formData.driving.carLicense} onChange={() => updateNested('driving', 'carLicense', false)} className="px-3 py-2" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-bold text-gray-800 mb-3">{t.labels.licenseList}:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CheckboxOption
                      label={t.options.notHave}
                      checked={formData.driving.licenseClasses.length === 0}
                      onChange={() => updateNested('driving', 'licenseClasses', [])}
                    />
                    {[
                      { value: 'Private Car', labelKey: 'privateCar' },
                      { value: 'Private Motorcycle', labelKey: 'privateMotorcycle' },
                      { value: 'Public Vehicle Class 2', labelKey: 'publicVehicle2' },
                      { value: 'Public Vehicle Class 3', labelKey: 'publicVehicle3' }
                    ].map(c => (
                      <CheckboxOption
                        key={c.value}
                        label={t.options[c.labelKey as keyof typeof t.options] || c.value}
                        checked={formData.driving.licenseClasses.includes(c.value)}
                        onChange={(checked) => {
                          const current = formData.driving.licenseClasses;
                          const updated = checked ? [...current, c.value] : current.filter(x => x !== c.value);
                          updateNested('driving', 'licenseClasses', updated);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Computer & Graphics */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">{t.labels.computer}</h3>
                <div className="space-y-1">
                  {Object.keys(formData.computerSkills).map((k) => (
                    <SkillRadioGroup
                      key={k}
                      label={`Microsoft Office - ${k.charAt(0).toUpperCase() + k.slice(1)}`}
                      value={formData.computerSkills[k as keyof typeof formData.computerSkills]}
                      onChange={(val) => updateNested('computerSkills', k, val)}
                      optionsText={t.options}
                    />
                  ))}
                  <h3 className="font-bold text-gray-900 mt-6 mb-4 border-b pb-2">{t.labels.graphics}</h3>
                  <SkillRadioGroup label="Canva" value={formData.graphicsSkills.canva} onChange={(val) => updateNested('graphicsSkills', 'canva', val)} optionsText={t.options} />
                  <SkillRadioGroup label="Video Editor" value={formData.graphicsSkills.videoEditor} onChange={(val) => updateNested('graphicsSkills', 'videoEditor', val)} optionsText={t.options} />
                </div>
              </div>

              <TextArea label={t.labels.specialAbility} value={formData.specialAbility} onChange={(e) => updateField('specialAbility', e.target.value)} />
              <TextArea label={t.labels.hobbies} value={formData.hobbies} onChange={(e) => updateField('hobbies', e.target.value)} />
            </div>
          )}

          {/* --- Step 7: Experience --- */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{t.sections.experience}</h3>
                <Button size="sm" onClick={addExperience} variant="outline">{t.options.addExperience}</Button>
              </div>

              {formData.experience.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                  {t.options.noExperienceYet}
                </div>
              )}

              {formData.experience.map((exp, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-red-500 text-xs hover:underline">{t.options.removeExperience}</button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <DatePicker label={t.labels.from} value={exp.from} onChange={(val) => updateExperience(idx, 'from', val)} />
                    <DatePicker label={t.labels.to} value={exp.to} onChange={(val) => updateExperience(idx, 'to', val)} />
                    <Input label={t.labels.company} value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} />
                    <Input label={t.labels.position} value={exp.position} onChange={(e) => updateExperience(idx, 'position', e.target.value)} />
                    <Input label={t.labels.lastSalary} value={exp.salary} onChange={(e) => updateExperience(idx, 'salary', e.target.value)} />
                    <Input label={t.labels.businessType} value={exp.businessType} onChange={(e) => updateExperience(idx, 'businessType', e.target.value)} />
                  </div>
                  <TextArea label={t.labels.jobDesc} rows={2} value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {/* --- Step 8: Questionnaire --- */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                  {t.labels.upcountry} <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-3">
                  {UPCOUNTRY_LOCATIONS_DATA.map(locData => {
                    const loc = locData.en;
                    const displayLabel = lang === 'th' ? locData.th : locData.en;
                    return (
                      <CheckboxOption
                        key={loc}
                        label={displayLabel}
                        checked={formData.upcountryLocations.includes(loc)}
                        onChange={(checked) => {
                          const current = formData.upcountryLocations;
                          const updated = checked ? [...current, loc] : current.filter(x => x !== loc);
                          updateField('upcountryLocations', updated);
                        }}
                      />
                    );
                  })}
                </div>
                {validationErrors.upcountryLocations && <p className="mt-2 text-xs text-red-500">{validationErrors.upcountryLocations}</p>}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <TextArea label={`${t.labels.strength} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.strength} value={formData.strength} onChange={(e) => updateField('strength', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.weakness} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.weakness} value={formData.weakness} onChange={(e) => updateField('weakness', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.lessFit} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.lessFitTask} value={formData.lessFitTask} onChange={(e) => updateField('lessFitTask', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.principles} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.principles} value={formData.principles} onChange={(e) => updateField('principles', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.troubleResolve} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.troubleResolve} value={formData.troubleResolve} onChange={(e) => updateField('troubleResolve', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.jobCriteria} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.jobCriteria} value={formData.jobCriteria} onChange={(e) => updateField('jobCriteria', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.interests} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.interests} value={formData.interests} onChange={(e) => updateField('interests', e.target.value)} maxLength={250} />
                <TextArea label={`${t.labels.digitalTransform} ${lang === 'th' ? '(สูงสุด 250 ตัวอักษร)' : '(Max 250 characters)'}`} error={validationErrors.digitalTransformOpinion} value={formData.digitalTransformOpinion} onChange={(e) => updateField('digitalTransformOpinion', e.target.value)} maxLength={250} />
              </div>
            </div>
          )}

          {/* --- Step 9: Health & Emergency --- */}
          {currentStep === 9 && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">{t.sections.emergency}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label={t.labels.firstName + ' - ' + t.labels.lastName} value={formData.emergencyContactName} onChange={(e) => updateField('emergencyContactName', e.target.value)} />
                  <Input label={t.labels.relationship} value={formData.emergencyContactRelation} onChange={(e) => updateField('emergencyContactRelation', e.target.value)} />
                  <Input label={t.labels.phone} value={formData.emergencyContactPhone} onChange={(e) => updateField('emergencyContactPhone', e.target.value)} />
                  <Input label={t.labels.company} value={formData.emergencyContactCompany} onChange={(e) => updateField('emergencyContactCompany', e.target.value)} />
                  <Input label={t.labels.position} value={formData.emergencyContactPosition} onChange={(e) => updateField('emergencyContactPosition', e.target.value)} />
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">{t.sections.health}</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="block text-sm font-bold text-gray-900 mb-3">{t.labels.chronic}</span>
                    <div className="flex gap-4 mb-4">
                      <RadioOption label={t.options.yes} checked={formData.hasChronicDisease} onChange={() => updateField('hasChronicDisease', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.no} checked={!formData.hasChronicDisease} onChange={() => updateField('hasChronicDisease', false)} className="px-3 py-2" />
                    </div>
                    {formData.hasChronicDisease && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <Input placeholder={t.labels.pleaseSpecify} value={formData.chronicDiseaseDetail} onChange={(e) => updateField('chronicDiseaseDetail', e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="block text-sm font-bold text-gray-900 mb-3">{t.labels.surgery}</span>
                    <div className="flex gap-4 mb-4">
                      <RadioOption label={t.options.yes} checked={formData.hasSurgery} onChange={() => updateField('hasSurgery', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.no} checked={!formData.hasSurgery} onChange={() => updateField('hasSurgery', false)} className="px-3 py-2" />
                    </div>
                    {formData.hasSurgery && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <Input placeholder={t.labels.pleaseSpecify} value={formData.surgeryDetail} onChange={(e) => updateField('surgeryDetail', e.target.value)} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="block text-sm font-bold text-gray-900 mb-3">{t.labels.medicalRecord}</span>
                    <div className="flex gap-4 mb-4">
                      <RadioOption label={t.options.yes} checked={formData.hasMedicalRecord} onChange={() => updateField('hasMedicalRecord', true)} className="px-3 py-2" />
                      <RadioOption label={t.options.no} checked={!formData.hasMedicalRecord} onChange={() => updateField('hasMedicalRecord', false)} className="px-3 py-2" />
                    </div>
                    {formData.hasMedicalRecord && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <Input placeholder={t.labels.pleaseSpecify} value={formData.medicalRecordDetail} onChange={(e) => updateField('medicalRecordDetail', e.target.value)} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- Step 10: Uploads --- */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label={t.labels.photo}
                  description="Drag & drop or click to upload your photo"
                  value={formData.photoUrl}
                  onChange={() => { }} // Controlled via onFileSelect
                  onFileSelect={(file) => handleFileUpload(file, 'photoUrl', 'photo')}
                  uploading={uploadingState.photo}
                  accept=".jpg,.png"
                />
                <FileUpload
                  label={t.labels.resume}
                  description="Drag & drop or click to upload PDF resume"
                  value={formData.resumeUrl}
                  onChange={() => { }}
                  onFileSelect={(file) => handleFileUpload(file, 'resumeUrl', 'resume')}
                  uploading={uploadingState.resume}
                  accept=".pdf"
                />
                <FileUpload
                  label={t.labels.otherDocs}
                  description="Upload any supporting documents here"
                  value={formData.certificateUrl}
                  onChange={() => { }}
                  onFileSelect={(file) => handleFileUpload(file, 'certificateUrl', 'certificate')}
                  uploading={uploadingState.certificate}
                />
                <Input
                  label="Links (LinkedIn, JobThai, etc.)"
                  value={formData.profileLinks}
                  onChange={(e) => updateField('profileLinks', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t.actions.back}
            </Button>
            <Button onClick={handleNext} className="shadow-lg shadow-indigo-200">
              {currentStep === 10 ? t.actions.exportPdf : t.actions.next}
              {currentStep !== 10 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>


      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={t.actions.submit}
        size="md"
      >
        <div className="space-y-6 p-2">
          <p className="text-gray-600 text-center">
            {lang === 'en'
              ? 'Are you sure you want to submit your application? Please make sure all information is correct.'
              : 'คุณแน่ใจหรือไม่ที่จะส่งใบสมัคร? โปรดตรวจสอบข้อมูลทั้งหมดให้ถูกต้อง'
            }
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              {t.actions.back}
            </Button>
            <Button onClick={executeSubmit} isLoading={isSubmitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
              {t.actions.submit}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper Component for Copy Button
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className={`transition-all ${copied ? 'text-green-600 font-bold' : 'text-gray-400 hover:text-indigo-600'}`}
    >
      {copied ? (
        <span className="flex items-center gap-1">
          <Check className="w-4 h-4" /> Copied
        </span>
      ) : (
        'Copy'
      )}
    </Button>
  );
};
