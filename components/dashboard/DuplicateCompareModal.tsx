// components/dashboard/DuplicateCompareModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../UIComponents';
import {
  AlertTriangle, CheckCircle, Trash2, ExternalLink, Calendar,
  Briefcase, Building2, User, Phone, CreditCard, FileText, Check, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { getStatusBadgeClass, getStatusLabel, getBuColor } from './dashboardConstants';

interface DuplicateCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateApp: any | null;
  duplicateGroupAppIds: string[];
  matchReasons?: string[];
  onViewApp: (app: any) => void;
  onRefresh: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const DuplicateCompareModal: React.FC<DuplicateCompareModalProps> = ({
  isOpen,
  onClose,
  candidateApp,
  duplicateGroupAppIds,
  matchReasons = [],
  onViewApp,
  onRefresh,
  showToast,
}) => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDeleteApp, setConfirmDeleteApp] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load all application records in this duplicate group
  useEffect(() => {
    if (!isOpen || !duplicateGroupAppIds || duplicateGroupAppIds.length === 0) {
      setApps([]);
      return;
    }

    let isMounted = true;
    const fetchGroupApps = async () => {
      setLoading(true);
      try {
        const fetched = await Promise.all(
          duplicateGroupAppIds.map(async (id) => {
            try {
              const full = await api.getApplicationById(id);
              return full || null;
            } catch (err) {
              console.warn(`Failed to fetch app ${id}:`, err);
              return null;
            }
          })
        );

        if (isMounted) {
          const validApps = fetched.filter(Boolean);
          // Sort newest first
          validApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setApps(validApps);
        }
      } catch (err) {
        console.error('Error fetching duplicate group applications:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGroupApps();

    return () => {
      isMounted = false;
    };
  }, [isOpen, duplicateGroupAppIds]);

  if (!isOpen) return null;

  const candidateName = candidateApp?.full_name || 
    `${candidateApp?.form_data?.prefix || ''} ${candidateApp?.form_data?.firstName || ''} ${candidateApp?.form_data?.lastName || ''}`.trim() ||
    'ผู้สมัคร';

  const candidateNid = candidateApp?.nationalId || candidateApp?.form_data?.nationalId || candidateApp?.passportNo || candidateApp?.form_data?.passportNo || '-';
  const candidatePhone = candidateApp?.phone || candidateApp?.form_data?.phone || '-';
  const photoUrl = candidateApp?.form_data?.photoUrl || candidateApp?.photo_url;

  // Execute safe deletion
  const handleDeleteApplication = async () => {
    if (!confirmDeleteApp) return;
    setIsDeleting(true);
    try {
      const result = await api.deleteApplication(confirmDeleteApp.id);
      if (result.success) {
        showToast('ลบใบสมัครและลบไฟล์เอกสารใน Storage เรียบร้อยแล้ว', 'success');
        // Update local apps list
        const remaining = apps.filter(a => a.id !== confirmDeleteApp.id);
        setApps(remaining);
        setConfirmDeleteApp(null);
        // Refresh parent dashboard
        onRefresh();
      } else {
        showToast(result.error?.message || 'ไม่สามารถลบใบสมัครได้', 'error');
      }
    } catch (err: any) {
      console.error('Delete application error:', err);
      showToast(err?.message || 'เกิดข้อผิดพลาดในการลบใบสมัคร', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="เปรียบเทียบและจัดการใบสมัครซ้ำ (Duplicate Candidate Resolution)"
        size="2xl"
      >
        <div className="p-4 sm:p-6 space-y-6">
          {/* Candidate Profile Header Card */}
          <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-white border-2 border-amber-300 shadow-sm flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(photoUrl)}` : photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.includes('/api/proxy-image')) img.src = photoUrl;
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-amber-700">
                      {(candidateName.charAt(0) || '?').toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{candidateName}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      พบ {apps.length} ใบสมัคร
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                      เลขประจำตัว: <strong className="text-gray-800">{candidateNid}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      เบอร์โทร: <strong className="text-gray-800">{candidatePhone}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Match reasons tags */}
              {matchReasons.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
                  <span className="text-xs text-gray-500 font-medium">เกณฑ์ที่ตรวจพบ:</span>
                  {matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-gray-700 border border-amber-300 shadow-2xs"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Instruction Callout */}
            <div className="mt-3.5 pt-3 border-t border-amber-200/60 text-xs text-amber-900/90 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>ข้อควรระวัง:</strong> โปรดพิจารณาความแตกต่างของตำแหน่งงานและวันที่สมัครก่อนตัดสินใจลบ หากเป็นการส่งซ้ำในตำแหน่งเดิม สามารถเลือกลบใบที่ไม่ใช้ได้ทันที การลบจะทำความสะอาดไฟล์แนบใน Storage ออกทั้งหมด
              </span>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center text-gray-500 space-y-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium">กำลังโหลดข้อมูลใบสมัครทั้งหมดเพื่อเปรียบเทียบ...</p>
            </div>
          )}

          {/* If reduced to 1 application (resolved) */}
          {!loading && apps.length <= 1 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-emerald-900">
                {apps.length === 1 ? 'ข้อมูลของผู้สมัครท่านนี้ไม่ซ้ำแล้ว' : 'ไม่มีใบสมัครเหลืออยู่ในระบบ'}
              </h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                {apps.length === 1 
                  ? 'เหลือใบสมัครหลักเพียง 1 ใบ ข้อมูลประวัติของผู้สมัครมีความถูกต้องเรียบร้อยแล้ว'
                  : 'ใบสมัครทั้งหมดของผู้สมัครท่านนี้ถูกลบเรียบร้อย'}
              </p>
              <Button size="sm" onClick={onClose} className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                ปิดหน้าต่างนี้
              </Button>
            </div>
          )}

          {/* Side-by-side Applications Grid */}
          {!loading && apps.length > 1 && (
            <div className={`grid grid-cols-1 ${apps.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
              {apps.map((app, index) => {
                const fd = app.form_data || {};
                const isNewest = index === 0;
                const position = fd.position || app.position || 'ไม่ระบุตำแหน่ง';
                const department = fd.department || app.department || 'ไม่ระบุแผนก';
                const bu = fd.businessUnit || app.business_unit || 'ไม่ระบุ BU';
                const channel = fd.sourceChannel || app.source_channel || '-';
                const appDate = new Date(app.created_at);
                const assignedUser = app.assigned_user?.full_name || app.assigned_user?.name || null;
                const hasResume = Boolean(fd.resumeUrl);
                const hasTranscript = Boolean(fd.transcriptUrl);
                const hasCert = Boolean(fd.certificateUrl);

                return (
                  <div
                    key={app.id}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-white ${
                      isNewest
                        ? 'border-indigo-300 ring-2 ring-indigo-500/15 shadow-md'
                        : 'border-gray-200 shadow-xs hover:border-gray-300'
                    }`}
                  >
                    {/* Top Status Header */}
                    <div className={`p-4 border-b ${isNewest ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50/70 border-gray-100'}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {isNewest ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs">
                            <Check className="w-3 h-3" />
                            ใบล่าสุด (Newest)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-200 text-gray-700">
                            ใบก่อนหน้า (#{index + 1})
                          </span>
                        )}

                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeClass(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>
                          {appDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>
                          {appDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </span>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-4 space-y-3.5 flex-1 text-xs">
                      {/* Position & BU */}
                      <div>
                        <div className="text-[11px] text-gray-400 font-medium mb-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> ตำแหน่งที่สมัคร
                        </div>
                        <div className="font-bold text-gray-900 text-sm leading-snug">{position}</div>
                        <div className="text-gray-600 mt-0.5 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{department}</span>
                          <span className="text-gray-300">•</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${getBuColor(bu)}`}>{bu}</span>
                        </div>
                      </div>

                      {/* Recruiter & Channel */}
                      <div className="pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-400 font-medium">ผู้ดูแลเคส</div>
                          <div className="font-semibold text-gray-800 truncate mt-0.5">
                            {assignedUser || <span className="text-gray-400 italic">ยังไม่ได้มอบหมาย</span>}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 font-medium">ช่องทางรับสมัคร</div>
                          <div className="font-semibold text-gray-800 truncate mt-0.5">{channel}</div>
                        </div>
                      </div>

                      {/* HRMS Status */}
                      {app.hrms_sync_status && app.hrms_sync_status !== 'NOT_READY' && (
                        <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400">สถานะ HRMS:</span>
                          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            {app.hrms_sync_status === 'SYNCED' ? 'เข้า HRMS แล้ว' : 'รอส่ง HRMS'}
                          </span>
                        </div>
                      )}

                      {/* Attachments */}
                      <div className="pt-2.5 border-t border-gray-100">
                        <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> เอกสารแนบ
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {hasResume ? (
                            <a
                              href={fd.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-[11px] transition-colors"
                            >
                              Resume <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 text-[10px]">ไม่มี Resume</span>
                          )}

                          {hasTranscript && (
                            <a
                              href={fd.transcriptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium text-[11px] transition-colors"
                            >
                              Transcript <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}

                          {hasCert && (
                            <span className="px-2 py-1 rounded bg-slate-50 text-slate-700 font-medium text-[11px]">
                              มีเอกสารอื่น
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs py-1.5"
                        onClick={() => {
                          onClose();
                          onViewApp(app);
                        }}
                      >
                        ดูใบสมัครเต็ม
                      </Button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteApp(app)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors border border-red-200/80 bg-white"
                        title="ลบใบสมัครนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              💡 แนะนำให้เก็บใบสมัครที่มีสถานะก้าวหน้าที่สุด หรือใบสมัครล่าสุดไว้
            </span>
            <Button variant="outline" size="sm" onClick={onClose}>
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Delete Pop-up Modal */}
      {confirmDeleteApp && (
        <Modal
          isOpen={!!confirmDeleteApp}
          onClose={() => !isDeleting && setConfirmDeleteApp(null)}
          title="ยืนยันการลบใบสมัครซ้ำ"
          size="md"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">
                คุณแน่ใจหรือไม่ที่จะลบใบสมัครนี้?
              </h3>
              <p className="text-xs text-gray-600">
                ผู้สมัคร: <strong className="text-gray-900">{confirmDeleteApp.full_name || candidateName}</strong><br />
                ตำแหน่ง: <strong className="text-indigo-600">{confirmDeleteApp.position || confirmDeleteApp.form_data?.position}</strong><br />
                วันที่สมัคร: <strong>{new Date(confirmDeleteApp.created_at).toLocaleDateString('th-TH')}</strong>
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-left text-xs text-red-800 space-y-1">
              <div className="font-bold flex items-center gap-1 text-red-900">
                <AlertTriangle className="w-3.5 h-3.5" /> คำเตือนสำคัญเรื่อง Storage:
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-700">
                <li>ไฟล์แนบทั้งหมด (Resume, Transcript, รูปถ่าย) จะถูกลบออกจาก Cloud Storage ทันทีเพื่อประหยัดพื้นที่</li>
                <li>ประวัติการสัมภาษณ์และการประเมินของใบนี้จะถูกลบออก และไม่สามารถกู้คืนได้</li>
              </ul>
            </div>

            <div className="flex gap-2.5 justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteApp(null)}
                disabled={isDeleting}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleDeleteApplication}
                isLoading={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700 border-none shadow-sm"
              >
                ยืนยันการลบใบสมัคร
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
