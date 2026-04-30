import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { api } from '../../services/api';
import { Modal, Button } from '../UIComponents';
import {
  User, MapPin, Users, Building2, GraduationCap, Tag,
  FileText, ExternalLink, Edit, Calendar, History, Clock,
  CheckCircle, XCircle, UserPlus, UserCheck, Link, Copy, Check
} from 'lucide-react';
import {
  LOG_LABELS, getStatusBadgeClass, getStatusLabel,
  getMilitaryStatusLabel, isInterviewScheduledStatus, isClosedStatus
} from './dashboardConstants';

interface ApplicationDetailModalProps {
  viewingApp: any;
  setViewingApp: (app: any | null) => void;
  appLogs: any[];
  isLoadingLogs: boolean;
  setEditingApp: (app: any) => void;
  setClaimingApp: (app: any) => void;
  setTransferringApp: (app: any) => void;
  setUnassigningApp: (app: any) => void;
  setInterviewingApp: (app: any) => void;
  setInterviewDate: (date: string) => void;
  setRejectingApp: (app: any) => void;
  setRejectComment: (comment: string) => void;
  setRejectionReason: (reason: string) => void;
  setApprovingApp: (app: any) => void;
  onApplicationUpdated?: (app: any) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  viewingApp, setViewingApp, appLogs, isLoadingLogs,
  setEditingApp, setClaimingApp, setTransferringApp, setUnassigningApp,
  setInterviewingApp, setInterviewDate,
  setRejectingApp, setRejectComment, setRejectionReason,
  setApprovingApp, onApplicationUpdated
}) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareLinkExpiry, setShareLinkExpiry] = useState<string | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  // Load existing share link when modal opens
  useEffect(() => {
    if (viewingApp?.id) {
      const fetchExistingToken = async () => {
        const result = await api.getExistingShareToken(viewingApp.id);
        if (result.success && result.data) {
          setShareLink(result.data.url);
          setShareToken(result.data.token);
          setShareLinkExpiry(result.data.expires_at);
        } else {
          setShareLink(null);
          setShareToken(null);
          setShareLinkExpiry(null);
        }
      };
      fetchExistingToken();
    } else {
      setShareLink(null);
      setShareToken(null);
      setShareLinkExpiry(null);
    }
  }, [viewingApp?.id]);

  const handleGenerateShareLink = async () => {
    if (!viewingApp) return;
    if (shareLink) return;
    setShowShareConfirm(true);
  };

  const executeGenerateShareLink = async () => {
    if (!viewingApp) return;
    setShowShareConfirm(false);
    setIsGeneratingLink(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const createdBy = currentUser?.full_name || currentUser?.email || 'ระบบ';
      const result = await api.generateShareToken(viewingApp.id, createdBy);
      if (result.success && result.data) {
        setShareLink(result.data.url);
        setShareToken(result.data.token);
        setShareLinkExpiry(result.data.expires_at);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result.error?.message || 'ไม่สามารถสร้างลิงก์ได้'));
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = shareLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setShareLinkCopied(true);
      setTimeout(() => setShareLinkCopied(false), 2500);
    }
  };

  const handleRevokeShareLink = async () => {
    if (!shareToken) return;
    setShowRevokeConfirm(true);
  };

  const executeRevokeShareLink = async () => {
    if (!shareToken) return;
    setShowRevokeConfirm(false);
    setIsGeneratingLink(true);
    try {
      const result = await api.revokeShareToken(shareToken);
      if (result.success) {
        setShareLink(null);
        setShareToken(null);
        setShareLinkExpiry(null);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result.error?.message || 'ไม่สามารถยกเลิกได้'));
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const fdTop = viewingApp?.form_data || {};
  const hasThaiName = fdTop.firstName && fdTop.lastName;
  const fullName = hasThaiName
    ? [fdTop.title || fdTop.prefix, fdTop.firstName, fdTop.lastName].filter(Boolean).join(' ')
    : [fdTop.titleEn, fdTop.firstNameEn, fdTop.lastNameEn].filter(Boolean).join(' ') || viewingApp?.full_name || '-';
  const fullNameEn = hasThaiName ? [fdTop.titleEn, fdTop.firstNameEn, fdTop.lastNameEn].filter(Boolean).join(' ') : null;

  return (
    <>
      {/* View Application Modal - Comprehensive View */}
      <Modal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title="รายละเอียดผู้สมัคร"
        size="full"
        footer={null}
      >
        {viewingApp && (() => {
          const fd = viewingApp.form_data || {};
          const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: any }) => (
            <div className="bg-gray-100 border-y border-gray-300 py-2 px-3 -mx-1 mt-4 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />} {title}
              </h4>
            </div>
          );
          const InfoRow = ({ label, value, className = '' }: { label: string; value: any; className?: string }) => (
            <div className={`text-sm py-1 ${className}`}>
              <span className="text-gray-500">{label}:</span> <span className="font-medium text-gray-900">{value || '-'}</span>
            </div>
          );


          return (
            <div className="max-h-[80vh] overflow-y-auto px-1">
              {/* Header with Photo */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200 mb-4">
                <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border group">
                  {fd.photoUrl ? (
                    <img src={fd.photoUrl} alt="Photo" className="w-full h-full object-cover" key={fd.photoUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                  {/* Hover Overlay for Upload */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-white text-xs text-center p-1 font-semibold">
                      {isUploadingPhoto ? 'กำลังโหลด...' : 'เปลี่ยนรูป'}
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.png"
                        disabled={isUploadingPhoto}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingPhoto(true);
                          try {
                            const url = await api.uploadFile(file, 'photos');
                            if (url) {
                              const updatedFormData = { ...fd, photoUrl: url };
                              const { error } = await supabase
                                .from('applications')
                                .update({ form_data: updatedFormData, photo_url: url })
                                .eq('id', viewingApp.id);
                              if (!error) {
                                const updatedApp = { ...viewingApp, form_data: updatedFormData, photo_url: url };
                                setViewingApp(updatedApp);
                                onApplicationUpdated?.(updatedApp);
                              } else {
                                throw error;
                              }
                            }
                          } catch (err) {
                            console.error('Failed to upload photo:', err);
                            alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
                          } finally {
                            e.target.value = '';
                            setIsUploadingPhoto(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {fullName}
                  </h3>
                  {fullNameEn && <p className="text-sm text-gray-600 mb-1">{fullNameEn}</p>}
                  <p className="text-sm text-gray-600">{fd.nickname || fd.nicknameEn ? `(${[fd.nickname, fd.nicknameEn].filter(Boolean).join(' / ')})` : ''}</p>
                  <p className="text-sm text-indigo-600 font-medium mt-1">{fd.position || viewingApp.position || 'ไม่ระบุตำแหน่ง'}</p>
                  <p className="text-sm text-gray-500">{fd.department || viewingApp.department || ''}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(viewingApp.status)}`}>
                      {getStatusLabel(viewingApp.status)}
                    </span>
                  </div>
                  {/* Timeline */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">สมัคร</span>
                      <span>{new Date(viewingApp.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                    {(viewingApp.interview_date || viewingApp.interviewed_at) && (
                      <>
                        <div className="w-4 h-px bg-slate-300"></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-yellow-700">สัมภาษณ์</span>
                          <span>{new Date(viewingApp.interview_date || viewingApp.interviewed_at).toLocaleDateString('th-TH')}</span>
                        </div>
                      </>
                    )}
                    {viewingApp.hired_at && (
                      <>
                        <div className="w-4 h-px bg-slate-300"></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-green-700">รับเข้าทำงาน</span>
                          <span>{new Date(viewingApp.hired_at).toLocaleDateString('th-TH')}</span>
                        </div>
                      </>
                    )}
                    {viewingApp.rejected_at && (
                      <>
                        <div className="w-4 h-px bg-slate-300"></div>
                        <div className="flex flex-col">
                          <span className="font-medium text-red-700">ปฏิเสธ</span>
                          <span>{new Date(viewingApp.rejected_at).toLocaleDateString('th-TH')}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Recruiter Assignment Info */}
                  {viewingApp.assigned_user && (
                    <div className="mt-3 flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs text-indigo-700 font-medium">
                        ผู้ดูแล: {viewingApp.assigned_user.full_name}
                      </span>
                      {viewingApp.assigned_at && (
                        <span className="text-xs text-indigo-400">
                          (รับเมื่อ {new Date(viewingApp.assigned_at).toLocaleDateString('th-TH')})
                        </span>
                      )}
                    </div>
                  )}
                  {!viewingApp.assigned_to && (
                    <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-amber-700 font-medium">ยังไม่มีผู้ดูแล</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1. Position Applied */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-indigo-50 p-3 rounded-lg mb-4">
                <InfoRow label="ตำแหน่งที่สมัคร" value={fd.position || viewingApp.position} />
                <InfoRow label="เงินเดือนที่ต้องการ" value={fd.expectedSalary ? `${fd.expectedSalary} ${fd.isSalaryNegotiable ? '(ต่อรองได้)' : ''}` : '-'} />
                <InfoRow label="แผนก/ฝ่าย" value={fd.department} />
                <InfoRow label="วันที่สามารถเริ่มงาน" value={fd.availability} />
              </div>

              {/* 2. Personal Info */}
              <SectionHeader title="ข้อมูลส่วนตัว" icon={User} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <InfoRow label="คำนำหน้า" value={fd.title || fd.prefix} />
                <InfoRow label="ชื่อเล่น (ไทย)" value={fd.nickname} />
                <InfoRow label="ชื่อเล่น (อังกฤษ)" value={fd.nicknameEn} />
                <InfoRow label="ชื่อ" value={fd.firstName} />
                <InfoRow label="นามสกุล" value={fd.lastName} />
                <InfoRow label="สัญชาติ" value={fd.isThaiNational ? 'ไทย' : 'ต่างชาติ'} />
                <InfoRow label={fd.isThaiNational ? 'เลขบัตรประชาชน' : 'หมายเลขหนังสือเดินทาง'} value={fd.isThaiNational ? fd.nationalId : fd.passportNo} />
                {!fd.isThaiNational && (
                  <InfoRow label="Work Permit / สิทธิ์ทำงานในไทย" value={fd.availableToWorkInThailand ? '✅ มีสิทธิ์ทำงานในประเทศไทย' : '⚠️ ยังไม่มีสิทธิ์ทำงานในประเทศไทย'} />
                )}
                <InfoRow label="วันเกิด" value={fd.dateOfBirth} />
                <InfoRow label="อายุ" value={fd.age ? `${fd.age} ปี` : '-'} />
                <InfoRow label="ส่วนสูง" value={fd.height ? `${fd.height} ซม.` : '-'} />
                <InfoRow label="น้ำหนัก" value={fd.weight ? `${fd.weight} กก.` : '-'} />
                <InfoRow label="สถานะทางทหาร" value={getMilitaryStatusLabel(fd.militaryStatus)} />
                <InfoRow label="เบอร์โทร" value={fd.phone || viewingApp.phone} />
                <InfoRow label="อีเมล" value={fd.email || viewingApp.email} className="col-span-2" />
              </div>

              {/* 3. Contact Address */}
              <SectionHeader title="ที่อยู่" icon={MapPin} />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">ที่อยู่ตามทะเบียนบ้าน:</span>
                  <p className="text-gray-900">{fd.registeredAddress || '-'} {fd.registeredSubDistrict ? `ต.${fd.registeredSubDistrict}` : ''} {fd.registeredDistrict ? `อ.${fd.registeredDistrict}` : ''} {fd.registeredProvince ? `จ.${fd.registeredProvince}` : ''} {fd.registeredPostcode || ''}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">ที่อยู่ปัจจุบัน:</span>
                  <p className="text-gray-900">{fd.currentAddress || '-'} {fd.currentSubDistrict ? `ต.${fd.currentSubDistrict}` : ''} {fd.currentDistrict ? `อ.${fd.currentDistrict}` : ''} {fd.currentProvince ? `จ.${fd.currentProvince}` : ''} {fd.currentPostcode || ''}</p>
                </div>
              </div>

              {/* 4. Family Info */}
              <SectionHeader title="ข้อมูลครอบครัว" icon={Users} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mb-3">
                <InfoRow label="สถานภาพ" value={fd.maritalStatus} />
                <InfoRow label="จำนวนบุตร" value={fd.childrenCount} />
                <InfoRow label="จำนวนพี่น้อง" value={fd.siblingCount} />
              </div>
              {fd.maritalStatus === 'สมรส' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mb-3 bg-gray-50 p-2 rounded">
                  <InfoRow label="ชื่อคู่สมรส" value={fd.spouseName} />
                  <InfoRow label="อาชีพคู่สมรส" value={fd.spouseOccupation} />
                  <InfoRow label="อายุคู่สมรส" value={fd.spouseAge} />
                </div>
              )}
              {/* Desktop: Table | Mobile: Cards */}
              <div className="hidden sm:block border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ความสัมพันธ์</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ชื่อ-สกุล</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">อายุ</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">อาชีพ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">บิดา</td>
                      {fd.fatherDeceased ? (
                        <td colSpan={3} className="py-2 px-3 italic text-gray-400">เสียชีวิตแล้ว (Deceased)</td>
                      ) : (
                        <>
                          <td className="py-2 px-3">{fd.fatherName || '-'}</td>
                          <td className="py-2 px-3">{fd.fatherAge || '-'}</td>
                          <td className="py-2 px-3">{fd.fatherOccupation || '-'}</td>
                        </>
                      )}
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">มารดา</td>
                      {fd.motherDeceased ? (
                        <td colSpan={3} className="py-2 px-3 italic text-gray-400">เสียชีวิตแล้ว (Deceased)</td>
                      ) : (
                        <>
                          <td className="py-2 px-3">{fd.motherName || '-'}</td>
                          <td className="py-2 px-3">{fd.motherAge || '-'}</td>
                          <td className="py-2 px-3">{fd.motherOccupation || '-'}</td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden space-y-2">
                {[
                  { rel: 'บิดา', deceased: fd.fatherDeceased, name: fd.fatherName, age: fd.fatherAge, occ: fd.fatherOccupation },
                  { rel: 'มารดา', deceased: fd.motherDeceased, name: fd.motherName, age: fd.motherAge, occ: fd.motherOccupation }
                ].map((p) => (
                  <div key={p.rel} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="font-semibold text-gray-800 mb-1">{p.rel}</div>
                    {p.deceased ? (
                      <div className="italic text-gray-400">เสียชีวิตแล้ว (Deceased)</div>
                    ) : (
                      <>
                        <div className="text-gray-600">ชื่อ: <span className="text-gray-900 font-medium">{p.name || '-'}</span></div>
                        <div className="flex gap-4 text-gray-600"><span>อายุ: <span className="text-gray-900 font-medium">{p.age || '-'}</span></span><span>อาชีพ: <span className="text-gray-900 font-medium">{p.occ || '-'}</span></span></div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* 5. Education */}
              <SectionHeader title="การศึกษา" icon={GraduationCap} />
              {fd.education ? (
                <>
                  {/* Desktop: Table */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-1/5">ระดับ</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-1/3">สถาบัน</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">สาขา</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-16">GPA</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-20">ปี</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(() => {
                          const edu = fd.education;
                          const levelNames: Record<string, string> = {
                            primarySchool: 'ประถมศึกษา (ป.1-6)', juniorHighSchool: 'มัธยมต้น (ม.1-3)',
                            highSchool: 'มัธยมปลาย / ปวช.', vocational: 'ปวส.',
                            bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', phd: 'ปริญญาเอก',
                          };
                          if (Array.isArray(edu)) {
                            return edu.filter(e => e?.institute).map((e, i) => (
                              <tr key={i}>
                                <td className="py-2 px-3 font-medium">{levelNames[e.level || ''] || e.level || '-'}</td>
                                <td className="py-2 px-3">{e.institute || '-'}</td>
                                <td className="py-2 px-3">{e.major || '-'}</td>
                                <td className="py-2 px-3">{e.gpa || '-'}</td>
                                <td className="py-2 px-3 text-xs">{e.startDate && e.endDate ? `${e.startDate}-${e.endDate}` : '-'}</td>
                              </tr>
                            ));
                          }
                          return (['primarySchool', 'juniorHighSchool', 'highSchool', 'vocational', 'bachelor', 'master', 'phd'] as const).map((key) => {
                            const e = edu?.[key];
                            if (!e?.institute) return null;
                            return (
                              <tr key={key}>
                                <td className="py-2 px-3 font-medium">{levelNames[key]}</td>
                                <td className="py-2 px-3">{e.institute || '-'}</td>
                                <td className="py-2 px-3">{e.major || '-'}</td>
                                <td className="py-2 px-3">{e.gpa || '-'}</td>
                                <td className="py-2 px-3 text-xs">{e.startDate && e.endDate ? `${e.startDate}-${e.endDate}` : '-'}</td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile: Cards */}
                  <div className="sm:hidden space-y-2">
                    {(() => {
                      const edu = fd.education;
                      const levelNames: Record<string, string> = {
                        primarySchool: 'ประถมศึกษา (ป.1-6)', juniorHighSchool: 'มัธยมต้น (ม.1-3)',
                        highSchool: 'มัธยมปลาย / ปวช.', vocational: 'ปวส.',
                        bachelor: 'ปริญญาตรี', master: 'ปริญญาโท', phd: 'ปริญญาเอก',
                      };
                      if (Array.isArray(edu)) {
                        return edu.filter(e => e?.institute).map((e, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-semibold text-gray-800">{levelNames[e.level || ''] || e.level || '-'}</div>
                            <div className="text-gray-600 mt-0.5">{e.institute || '-'}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0 text-xs text-gray-500 mt-1">
                              <span>สาขา: {e.major || '-'}</span>
                              <span>GPA: {e.gpa || '-'}</span>
                              {e.startDate && e.endDate && <span>{e.startDate}-{e.endDate}</span>}
                            </div>
                          </div>
                        ));
                      }
                      return (['primarySchool', 'juniorHighSchool', 'highSchool', 'vocational', 'bachelor', 'master', 'phd'] as const).map((key) => {
                        const e = edu?.[key];
                        if (!e?.institute) return null;
                        return (
                          <div key={key} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-semibold text-gray-800">{levelNames[key]}</div>
                            <div className="text-gray-600 mt-0.5">{e.institute || '-'}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0 text-xs text-gray-500 mt-1">
                              <span>สาขา: {e.major || '-'}</span>
                              <span>GPA: {e.gpa || '-'}</span>
                              {e.startDate && e.endDate && <span>{e.startDate}-{e.endDate}</span>}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
              )}

              {/* 6. Work Experience */}
              <SectionHeader title="ประสบการณ์ทำงาน" icon={Building2} />
              {fd.experience && fd.experience.length > 0 ? (
                <>
                  {/* Desktop: Table */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-24">ช่วงเวลา</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">บริษัท</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ตำแหน่ง</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-20">เงินเดือน</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">หน้าที่</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {fd.experience.map((exp: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-3 text-xs">{exp.from}<br />{exp.to || 'ปัจจุบัน'}</td>
                            <td className="py-2 px-3 font-medium">{exp.company || '-'}</td>
                            <td className="py-2 px-3">{exp.position || '-'}</td>
                            <td className="py-2 px-3">{exp.salary || '-'}</td>
                            <td className="py-2 px-3 text-xs">{exp.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile: Cards */}
                  <div className="sm:hidden space-y-2">
                    {fd.experience.map((exp: any, i: number) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm border-l-3 border-indigo-300">
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-gray-800">{exp.company || '-'}</div>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{exp.from} - {exp.to || 'ปัจจุบัน'}</span>
                        </div>
                        <div className="text-gray-600 text-xs mt-0.5">{exp.position || '-'}{exp.salary ? ` · ${exp.salary}` : ''}</div>
                        {exp.description && <div className="text-xs text-gray-500 mt-1">{exp.description}</div>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">ไม่มีประสบการณ์ทำงาน</p>
              )}

              {/* 7. Skills */}
              <SectionHeader title="ทักษะ" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Languages */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">ภาษา</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">ภาษาอังกฤษ:</span><span className="font-medium">{fd.englishSkill || '-'} {fd.englishScore ? `(${fd.englishScore})` : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">ภาษาจีน:</span><span className="font-medium">{fd.chineseSkill || '-'} {fd.chineseScore ? `(${fd.chineseScore})` : ''}</span></div>
                  </div>
                </div>
                {/* Driving */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">การขับขี่</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">รถจักรยานยนต์:</span><span className="font-medium">{fd.driving?.motorcycle ? 'ได้' : 'ไม่ได้'} {fd.driving?.motorcycleLicense ? '(มีใบขับขี่)' : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">รถยนต์:</span><span className="font-medium">{fd.driving?.car ? 'ได้' : 'ไม่ได้'} {fd.driving?.carLicense ? '(มีใบขับขี่)' : ''}</span></div>
                    {fd.driving?.licenseClasses?.length > 0 && <div className="text-xs text-gray-500">ประเภท: {fd.driving.licenseClasses.join(', ')}</div>}
                  </div>
                </div>
                {/* Computer Skills */}
                {fd.computerSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">คอมพิวเตอร์</h5>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      {Object.entries(fd.computerSkills).map(([k, v]) => (
                        <div key={k} className="flex justify-between"><span className="text-gray-600 capitalize">{k}:</span><span className="font-medium text-xs">{v as string}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Graphics Skills */}
                {fd.graphicsSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">กราฟิก/มีเดีย</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Canva:</span><span className="font-medium">{fd.graphicsSkills.canva || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Video Editor:</span><span className="font-medium">{fd.graphicsSkills.videoEditor || '-'}</span></div>
                    </div>
                  </div>
                )}
              </div>
              {/* Special Skills & Hobbies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="text-sm"><span className="text-gray-500 font-medium">ความสามารถพิเศษ:</span> <span className="text-gray-900">{fd.specialAbility || '-'}</span></div>
                <div className="text-sm"><span className="text-gray-500 font-medium">งานอดิเรก:</span> <span className="text-gray-900">{fd.hobbies || '-'}</span></div>
              </div>

              {/* 8. Questionnaire */}
              <SectionHeader title="แบบสอบถามเพิ่มเติม" />
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">สามารถทำงานต่างจังหวัดได้:</span>
                  <span className="text-gray-900">{fd.upcountryLocations?.length > 0 ? fd.upcountryLocations.join(', ') : '-'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="text-gray-500 font-medium block mb-1">จุดเด่น:</span>
                    <span className="text-gray-900">{fd.strength || '-'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="text-gray-500 font-medium block mb-1">จุดด้อย:</span>
                    <span className="text-gray-900">{fd.weakness || '-'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">งานที่ไม่ถนัด:</span>
                  <span className="text-gray-900">{fd.lessFitTask || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">หลักการทำงาน:</span>
                  <span className="text-gray-900">{fd.principles || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">วิธีแก้ปัญหา:</span>
                  <span className="text-gray-900">{fd.troubleResolve || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">เกณฑ์เลือกงาน:</span>
                  <span className="text-gray-900">{fd.jobCriteria || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">สิ่งที่สนใจ:</span>
                  <span className="text-gray-900">{fd.interests || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">ความคิดเห็น Digital Transformation:</span>
                  <span className="text-gray-900">{fd.digitalTransformOpinion || '-'}</span>
                </div>
              </div>

              {/* 9. Health & Emergency */}
              <SectionHeader title="สุขภาพและผู้ติดต่อฉุกเฉิน" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-blue-800 mb-2">ผู้ติดต่อฉุกเฉิน</h5>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">ชื่อ:</span> <span className="font-medium">{fd.emergencyContactName || '-'}</span></div>
                    <div><span className="text-gray-600">ความสัมพันธ์:</span> <span className="font-medium">{fd.emergencyContactRelation || '-'}</span></div>
                    <div><span className="text-gray-600">เบอร์โทร:</span> <span className="font-medium">{fd.emergencyContactPhone || '-'}</span></div>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-red-800 mb-2">ประวัติสุขภาพ</h5>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">โรคประจำตัว:</span> <span className="font-medium">{fd.hasChronicDisease ? fd.chronicDiseaseDetail : 'ไม่มี'}</span></div>
                    <div><span className="text-gray-600">ประวัติผ่าตัด:</span> <span className="font-medium">{fd.hasSurgery ? fd.surgeryDetail : 'ไม่มี'}</span></div>
                    <div><span className="text-gray-600">ประวัติการรักษา:</span> <span className="font-medium">{fd.hasMedicalRecord ? fd.medicalRecordDetail : 'ไม่มี'}</span></div>
                  </div>
                </div>
              </div>

              {/* Source Tags */}
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> ช่องทางที่มา
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(fd.businessUnit || viewingApp.business_unit) && <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">BU: {fd.businessUnit || viewingApp.business_unit}</span>}
                  {(fd.sourceChannel || viewingApp.source_channel) && <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Channel: {fd.sourceChannel || viewingApp.source_channel}</span>}
                  {(fd.campaignTag || viewingApp.campaign_tag) && <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Tag: {fd.campaignTag || viewingApp.campaign_tag}</span>}
                </div>
              </div>

              {/* Attachments */}
              {(fd.resumeUrl || fd.certificateUrl || fd.profileLinks) && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">ไฟล์แนบ & Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {fd.resumeUrl && (
                      <a href={fd.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                        <FileText className="w-4 h-4" /> Resume
                      </a>
                    )}
                    {fd.certificateUrl && (
                      <a href={fd.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                        <FileText className="w-4 h-4" /> เอกสารแนบ
                      </a>
                    )}
                    {fd.profileLinks && (
                      <a href={fd.profileLinks} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded text-sm text-blue-700 transition">
                        <ExternalLink className="w-4 h-4" /> Profile Link
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Interview Date Display */}
              {isInterviewScheduledStatus(viewingApp.status) && viewingApp.interview_date && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800">วันนัดสัมภาษณ์</h4>
                    <p className="text-sm text-orange-700">
                      {new Date(viewingApp.interview_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity Log Timeline */}
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> ประวัติการดำเนินการ
                </h4>
                {isLoadingLogs ? (
                  <div className="text-center py-4 text-sm text-gray-400">กำลังโหลด...</div>
                ) : appLogs.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-400">ยังไม่มีประวัติ</div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto pl-2 py-2">
                    {[...appLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((log: any, index: number) => {
                      const meta = LOG_LABELS[log.action] || { label: log.action, icon: '📌', color: 'text-gray-600' };
                      return (
                        <div key={log.id} className="relative flex items-start gap-4 text-sm w-full">
                          {/* Timeline Line */}
                          {index !== appLogs.length - 1 && (
                            <div className="absolute top-6 left-[11px] bottom-[-20px] w-px bg-slate-200"></div>
                          )}
                          <div className={`relative z-10 flex text-base leading-none mt-0.5 items-center justify-center bg-white rounded-full p-1 border shadow-sm ${meta.color === 'text-green-600' ? 'border-green-200' : 'border-slate-200'}`}>
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm leading-snug hover:bg-slate-100/80 transition-colors">
                            <div className={`font-semibold ${meta.color} flex items-center`}>
                              {meta.label}
                              {log.old_value && log.new_value && <span className="text-gray-500 font-normal ml-2 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs shadow-sm"> {getStatusLabel(log.old_value)} → {getStatusLabel(log.new_value)}</span>}
                              {!log.old_value && log.new_value && <span className="text-gray-500 font-normal ml-2 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs shadow-sm"> {getStatusLabel(log.new_value)}</span>}
                            </div>
                            {log.note && <div className="text-sm text-slate-600 mt-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm leading-relaxed">"{log.note}"</div>}
                            <div className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium tracking-wide">
                              <User className="w-3 h-3" /> {log.performed_by}
                              <span>•</span>
                              <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleDateString('th-TH')} {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Share Link Panel */}
              {shareLink && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1"><Link className="w-3.5 h-3.5" /> ลิงก์แชร์โปรไฟล์</span>
                    <span className="text-[10px] text-emerald-600">
                      หมดอายุ: {shareLinkExpiry ? new Date(shareLinkExpiry).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input readOnly value={shareLink} className="flex-1 text-xs bg-white border border-emerald-200 rounded px-2 py-1.5 text-emerald-900 truncate" />
                    <button
                      onClick={handleCopyShareLink}
                      className="flex-shrink-0 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {shareLinkCopied ? <><Check className="w-3.5 h-3.5" /> คัดลอกแล้ว!</> : <><Copy className="w-3.5 h-3.5" /> คัดลอก</>}
                    </button>
                    <button
                      onClick={handleRevokeShareLink}
                      disabled={isGeneratingLink}
                      className="flex-shrink-0 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      title="หยุดการแชร์ (ยกเลิกลิงก์)"
                    >
                      <XCircle className="w-3.5 h-3.5" /> หยุดแชร์
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 mt-4 border-t sticky bottom-0 bg-white pb-2">
                <Button variant="outline" onClick={() => {
                  // Store form_data in localStorage and open print.html
                  const fd = viewingApp.form_data ? { ...viewingApp.form_data } : {};
                  fd.created_at = viewingApp.created_at;
                  fd.id = viewingApp.id;
                  localStorage.setItem('printPreviewData', JSON.stringify(fd));
                  window.open('/print.html', '_blank');
                }}>
                  <ExternalLink className="w-4 h-4 mr-2" /> เปิด Preview เต็มจอ
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={handleGenerateShareLink}
                  disabled={isGeneratingLink}
                >
                  <Link className="w-4 h-4 mr-2" />
                  {isGeneratingLink ? 'กำลังสร้าง...' : shareLink ? 'ดูลิงก์แชร์' : 'สร้างลิงก์แชร์'}
                </Button>
                <Button variant="outline" onClick={() => { setEditingApp(viewingApp); setViewingApp(null); }}>
                  <Edit className="w-4 h-4 mr-2" /> แก้ไขข้อมูล
                </Button>
                {!viewingApp.assigned_to && !isClosedStatus(viewingApp.status) ? (
                  <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => { setClaimingApp(viewingApp); setViewingApp(null); }}>
                    <User className="w-4 h-4 mr-2" /> รับเคสนี้ (Claim)
                  </Button>
                ) : viewingApp.assigned_to && !isClosedStatus(viewingApp.status) ? (
                  <>
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => { setTransferringApp(viewingApp); setViewingApp(null); }}>
                      <Users className="w-4 h-4 mr-2" /> โอนเคส
                    </Button>
                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => { setUnassigningApp(viewingApp); setViewingApp(null); }}>
                      <User className="w-4 h-4 mr-2" /> ยกเลิกการรับเคส
                    </Button>
                  </>
                ) : null}
                {viewingApp.status === 'Reviewing' && (
                  <>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { setInterviewingApp(viewingApp); setInterviewDate(''); setViewingApp(null); }}>
                      <Calendar className="w-4 h-4 mr-2" /> นัดสัมภาษณ์
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectingApp(viewingApp); setViewingApp(null); setRejectComment(''); setRejectionReason(''); }}>
                      <XCircle className="w-4 h-4 mr-2" /> ไม่รับ
                    </Button>
                  </>
                )}
                {isInterviewScheduledStatus(viewingApp.status) && (
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { setInterviewingApp(viewingApp); setInterviewDate(viewingApp.interview_date || ''); setViewingApp(null); }}>
                    <Calendar className="w-4 h-4 mr-2" /> เปลี่ยนวันสัมภาษณ์
                  </Button>
                )}
                {(isInterviewScheduledStatus(viewingApp.status) || viewingApp.status === 'Interviewed' || viewingApp.status === 'Offer') && (
                  <>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setApprovingApp(viewingApp); setViewingApp(null); }}>
                      <CheckCircle className="w-4 h-4 mr-2" /> รับเข้าทำงาน
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectingApp(viewingApp); setViewingApp(null); setRejectComment(''); setRejectionReason(''); }}>
                      <XCircle className="w-4 h-4 mr-2" /> ไม่ผ่าน
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setViewingApp(null)} className="ml-auto">ปิด</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Share Link Confirm Modal */}
      <Modal
        isOpen={showShareConfirm}
        onClose={() => setShowShareConfirm(false)}
        title="สร้างลิงก์แชร์โปรไฟล์"
        footer={null}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-700">
              ต้องการสร้างลิงก์แชร์โปรไฟล์ <strong>{fullName}</strong> หรือไม่?
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>ลิงก์จะหมดอายุอัตโนมัติใน <strong>30 วัน</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>ผู้ที่มีลิงก์สามารถดูข้อมูลผู้สมัครได้ <strong>โดยไม่ต้องล็อกอิน</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>สามารถยกเลิกลิงก์ได้ภายหลัง</span>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowShareConfirm(false)}>ยกเลิก</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={executeGenerateShareLink}
            >
              <Link className="w-4 h-4 mr-2" /> ยืนยันสร้างลิงก์
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Share Link Confirm Modal */}
      <Modal
        isOpen={showRevokeConfirm}
        onClose={() => setShowRevokeConfirm(false)}
        title="ยกเลิกการแชร์โปรไฟล์"
        footer={null}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-gray-700">
              คุณต้องการ <strong>หยุดการแชร์</strong> โปรไฟล์นี้ใช่หรือไม่?
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700 border border-red-100">
            <div className="flex items-start gap-2">
              <span className="font-bold">⚠️ ข้อควรระวัง:</span>
              <span>ลิงก์เดิมที่เคยส่งออกไปจะ <strong>ใช้งานไม่ได้ทันที</strong> และไม่สามารถกู้คืนได้</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowRevokeConfirm(false)} 
              className="flex-1"
            >
              ย้อนกลับ
            </Button>
            <Button 
              onClick={executeRevokeShareLink}
              disabled={isGeneratingLink}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isGeneratingLink ? 'กำลังดำเนินการ...' : 'ยืนยันการหยุดแชร์'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
