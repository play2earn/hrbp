import React, { useState, useEffect, memo } from 'react';
import { supabase } from '../../supabaseClient';
import { api } from '../../services/api';
import { Modal, Button } from '../UIComponents';
import {
  User, MapPin, Users, Building2, GraduationCap, Tag,
  FileText, ExternalLink, Edit, Calendar, History, Clock,
  CheckCircle, XCircle, UserPlus, UserCheck, Link, Copy, Check,
  Crop, RotateCcw, Upload, ChevronDown, ChevronUp, AlertTriangle, Paperclip, ShieldAlert,
  Eye, Download, X, Settings, Star
} from 'lucide-react';
import {
  LOG_LABELS, getStatusBadgeClass, getStatusLabel,
  getMilitaryStatusLabel, isInterviewScheduledStatus, isClosedStatus
} from './dashboardConstants';
import { TRANSLATIONS } from '../../constants';
import { ImageCropperModal } from './ImageCropperModal';
import { deleteFromR2 } from '../../utils/r2-upload';

const fmtYearMonth = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}`;
};

const fmtSalary = (val: string | number | undefined | null): string => {
  if (val === null || val === undefined || val === '') return '-';
  const str = String(val);
  const match = str.replace(/,/g, '').match(/^[\s]*([\d.]+)([\s\S]*)$/);
  if (!match) return str;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return str;
  const suffix = match[2].trim();
  const formatted = num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return suffix ? `${formatted} ${suffix}` : formatted;
};

const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: any }) => (
  <div className="bg-gray-100 border-y border-gray-300 py-2 px-3 -mx-1 mt-4 mb-3">
    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />} {title}
    </h4>
  </div>
);

const InfoRow = memo(({ label, value, className = '' }: { label: string; value: any; className?: string }) => (
  <div className={`text-sm py-1 ${className}`}>
    <span className="text-gray-500">{label}:</span> <span className="font-medium text-gray-900">{value || '-'}</span>
  </div>
));

const getOverallRecBadge = (rec: string) => {
  if (rec === 'Hired') return 'bg-green-100 text-green-800 border-green-200';
  if (rec === 'Rejected') return 'bg-red-100 text-red-800 border-red-200';
  if (rec === 'Shortlisted' || rec === 'Hold') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-blue-100 text-blue-800 border-blue-200';
};

const getOverallRecLabel = (rec: string) => {
  if (rec === 'Hired') return 'รับเข้าทำงาน (Hire)';
  if (rec === 'Rejected') return 'ไม่ผ่าน (Not Pass)';
  if (rec === 'Shortlisted') return 'Shortlist';
  if (rec === 'Hold') return 'พิจารณาภายหลัง (Hold)';
  return rec;
};

const StarRating = ({ val }: { val: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3 h-3 ${
          s <= val ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'
        }`}
      />
    ))}
  </div>
);

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
  blacklistEntries: any[];
  onViewBlacklistDetail: (entry: any) => void;
  setEvaluatingApp: (app: any | null) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = memo(({
  viewingApp, setViewingApp, appLogs, isLoadingLogs,
  setEditingApp, setClaimingApp, setTransferringApp, setUnassigningApp,
  setInterviewingApp, setInterviewDate,
  setRejectingApp, setRejectComment, setRejectionReason,
  setApprovingApp, onApplicationUpdated, blacklistEntries,
  onViewBlacklistDetail,
  setEvaluatingApp
}) => {
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [shareLinkExpiry, setShareLinkExpiry] = useState<string | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);

  // Calendar confirmation modal state
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarTargetApp, setCalendarTargetApp] = useState<any | null>(null);
  const [calendarHasShareLink, setCalendarHasShareLink] = useState(false);
  const [calendarCreateShareLink, setCalendarCreateShareLink] = useState(true);
  const [calendarShareLinkUrl, setCalendarShareLinkUrl] = useState<string | null>(null);
  const [isProcessingCalendar, setIsProcessingCalendar] = useState(false);

  useEffect(() => {
    if (viewingApp?.id) {
      setIsLoadingEvaluations(true);
      api.evaluations.getByApplicationId(viewingApp.id).then(res => {
        setEvaluations(res);
        setIsLoadingEvaluations(false);
      });
    } else {
      setEvaluations([]);
    }
  }, [viewingApp?.id]);

  // ── Resubmit Token State ──────────────────────────────────────
  const [showResubmitPanel, setShowResubmitPanel] = useState(false);
  const [resubmitAllowedFields, setResubmitAllowedFields] = useState<string[]>([]);
  const [isGeneratingResubmit, setIsGeneratingResubmit] = useState(false);
  const [resubmitToken, setResubmitToken] = useState<string | null>(null);
  const [resubmitUrl, setResubmitUrl] = useState<string | null>(null);
  const [resubmitExpiry, setResubmitExpiry] = useState<string | null>(null);
  const [resubmitAllowedExisting, setResubmitAllowedExisting] = useState<string[]>([]);
  const [resubmitUrlCopied, setResubmitUrlCopied] = useState(false);

  // ── Document Previewer State ─────────────────────────────────
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [autoSelectOnLoad, setAutoSelectOnLoad] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Outlook calendar deeplink URL generator
  const generateOutlookCalendarUrl = (app: any, shareUrl?: string | null) => {
    const candidateName = app.full_name || app.form_data?.firstName || 'ผู้สมัคร';
    const position = app.position || app.form_data?.position || '-';
    const phone = app.phone || app.form_data?.phone || '-';
    const email = app.email || app.form_data?.email || '-';
    const teamsLink = app.teams_meeting_url || '';

    let startStr = '';
    let endStr = '';
    if (app.interview_start_time) {
      startStr = new Date(app.interview_start_time).toISOString();
    } else if (app.interview_date) {
      startStr = new Date(`${app.interview_date}T10:00:00`).toISOString();
    } else {
      startStr = new Date().toISOString();
    }

    if (app.interview_end_time) {
      endStr = new Date(app.interview_end_time).toISOString();
    } else if (app.interview_start_time) {
      const end = new Date(app.interview_start_time);
      end.setHours(end.getHours() + 1);
      endStr = end.toISOString();
    } else if (app.interview_date) {
      endStr = new Date(`${app.interview_date}T11:00:00`).toISOString();
    } else {
      const end = new Date();
      end.setHours(end.getHours() + 1);
      endStr = end.toISOString();
    }

    const subject = `สัมภาษณ์คุณ ${candidateName} - ตำแหน่ง ${position}`;
    
    // Note: Outlook Web Calendar requires CRLF (\r\n) for compose body breaks, standard \n will be lost.
    const bodyText = `เรียนผู้บริหารและคณะกรรมการ,\r\n\r\n` +
      `นัดหมายสัมภาษณ์ผู้สมัครงาน:\r\n` +
      `- ผู้สมัคร: คุณ ${candidateName} (${app.form_data?.nickname ? `ชื่อเล่น: ${app.form_data.nickname}` : ''})\r\n` +
      `- ตำแหน่ง: ${position}\r\n` +
      `- เบอร์โทรศัพท์: ${phone}\r\n` +
      `- อีเมล: ${email}\r\n` +
      `- ลิงก์โปรไฟล์ผู้สมัคร: ${shareUrl || `${window.location.origin}/dashboard?appId=${app.id}`}\r\n\r\n` +
      `ขอบคุณครับ/ค่ะ\r\n` +
      `ฝ่ายบริหารทรัพยากรบุคคล (HR Recruitment)`;

    const url = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
    url.searchParams.append('path', '/calendar/action/compose');
    url.searchParams.append('rru', 'addevent');
    url.searchParams.append('subject', subject);
    url.searchParams.append('startdt', startStr);
    url.searchParams.append('enddt', endStr);
    url.searchParams.append('body', bodyText);
    if (teamsLink) {
      url.searchParams.append('location', teamsLink);
    } else {
      url.searchParams.append('location', 'Microsoft Teams Meeting');
    }

    return url.toString();
  };

  const handleCalendarClick = async (app: any) => {
    try {
      setCalendarTargetApp(app);
      setIsProcessingCalendar(true);
      
      const checkTokenRes = await api.getExistingShareToken(app.id);
      const exists = !!(checkTokenRes.success && checkTokenRes.data);
      const shareUrl = exists ? checkTokenRes.data.url : null;
      
      setCalendarHasShareLink(exists);
      setCalendarShareLinkUrl(shareUrl);
      setCalendarCreateShareLink(!exists);
      setIsProcessingCalendar(false);
      setCalendarModalOpen(true);
    } catch (error) {
      console.error("Error checking share token:", error);
      setIsProcessingCalendar(false);
      setCalendarTargetApp(app);
      setCalendarHasShareLink(false);
      setCalendarShareLinkUrl(null);
      setCalendarCreateShareLink(true);
      setCalendarModalOpen(true);
    }
  };

  const executeCalendarOpen = async () => {
    if (!calendarTargetApp) return;
    setIsProcessingCalendar(true);
    try {
      let finalShareUrl = calendarShareLinkUrl;

      if (!finalShareUrl && calendarCreateShareLink) {
        const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const createdBy = currentUserData?.full_name || currentUserData?.email || 'ระบบ';
        const res = await api.generateShareToken(calendarTargetApp.id, createdBy);
        if (res.success && res.data?.url) {
          finalShareUrl = res.data.url;
          setShareLink(res.data.url);
          setShareToken(res.data.token);
          setShareLinkExpiry(res.data.expires_at);
        }
      }

      const composeUrl = generateOutlookCalendarUrl(calendarTargetApp, finalShareUrl);
      window.open(composeUrl, '_blank');
      setCalendarModalOpen(false);
    } catch (err) {
      console.error("Failed to process calendar launch:", err);
    } finally {
      setIsProcessingCalendar(false);
    }
  };
  const moreActionsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewingApp?.id) {
      setShowPreview(true); // Reset toggle to show preview panel for new profile opening
      setPreviewUrl(null); // Reset preview url
      setPreviewTitle(''); // Reset preview title
      setAutoSelectOnLoad(false); // Do not auto-select initially on modal open
      setShowMoreActions(false); // Reset dropdown menu
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

      // Fetch existing resubmit token (if any active/unused one)
      const fetchResubmitToken = async () => {
        const result = await api.getExistingResubmitToken(viewingApp.id);
        if (result.success && result.data) {
          setResubmitToken(result.data.token);
          setResubmitUrl(result.data.url);
          setResubmitExpiry(result.data.expires_at);
          setResubmitAllowedExisting(result.data.allowed_fields);
        } else {
          setResubmitToken(null);
          setResubmitUrl(null);
          setResubmitExpiry(null);
          setResubmitAllowedExisting([]);
        }
      };
      fetchResubmitToken();

      const fd = viewingApp.form_data;
      if (fd && fd.isThaiNational === false && !fd.positionEn && (fd.position || viewingApp.position)) {
        const fetchPosEn = async () => {
          try {
            const posResult = await api.master.getAll('positions');
            if (posResult.success && posResult.data) {
              const matchedPos = posResult.data.find((p: any) => p.name_th === (fd.position || viewingApp.position));
              if (matchedPos && matchedPos.name_en) {
                // Immutable update to prevent flickering/state issues
                setViewingApp({
                  ...viewingApp,
                  form_data: {
                    ...viewingApp.form_data,
                    positionEn: matchedPos.name_en
                  }
                });
              }
            }
          } catch (e) {
            console.error('Failed to map legacy position', e);
          }
        };
        fetchPosEn();
      }
    } else {
      setShareLink(null);
      setShareToken(null);
      setShareLinkExpiry(null);
      setResubmitToken(null);
      setResubmitUrl(null);
      setResubmitExpiry(null);
      setResubmitAllowedExisting([]);
    }
  }, [viewingApp?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };
    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreActions]);

  // Auto-select first available document for live preview when full details are loaded
  useEffect(() => {
    if (!viewingApp?.id) {
      setPreviewUrl(null);
      setPreviewTitle('');
      return;
    }

    const autoFd = viewingApp.form_data || {};
    // Only auto-select if no document is currently selected AND showPreview is true AND autoSelectOnLoad is true
    if (previewUrl || !showPreview || !autoSelectOnLoad) return;

    if (autoFd.resumeUrl) {
      setPreviewUrl(autoFd.resumeUrl);
      setPreviewTitle('Resume / CV');
    } else if (autoFd.transcriptUrl) {
      setPreviewUrl(autoFd.transcriptUrl);
      setPreviewTitle('Transcript');
    } else if (autoFd.idCardUrl) {
      setPreviewUrl(autoFd.idCardUrl);
      setPreviewTitle('สำเนาบัตรประชาชน');
    } else if (autoFd.houseRegUrl) {
      setPreviewUrl(autoFd.houseRegUrl);
      setPreviewTitle('สำเนาทะเบียนบ้าน');
    } else if (autoFd.eduCertificateUrl) {
      setPreviewUrl(autoFd.eduCertificateUrl);
      setPreviewTitle('ใบรับรองวุฒิการศึกษา');
    } else if (autoFd.bankBookUrl) {
      const bankNameText = autoFd.bankName ? ` (${autoFd.bankName})` : '';
      setPreviewUrl(autoFd.bankBookUrl);
      setPreviewTitle(`สำเนาบัญชีธนาคาร${bankNameText}`);
    } else if (autoFd.militaryCertUrl) {
      setPreviewUrl(autoFd.militaryCertUrl);
      setPreviewTitle('ใบผ่านการเกณฑ์ทหาร');
    } else if (autoFd.toeicCertUrl) {
      setPreviewUrl(autoFd.toeicCertUrl);
      setPreviewTitle('ผลสอบ TOEIC');
    } else if (autoFd.certificateUrl) {
      setPreviewUrl(autoFd.certificateUrl);
      setPreviewTitle('Certificate / เอกสารเพิ่มเติม');
    }
  }, [viewingApp?.id, viewingApp?.form_data, showPreview, previewUrl, autoSelectOnLoad]);

  // ── Resubmit Handlers ────────────────────────────────────────
  const RESUBMIT_FIELD_OPTIONS = [
    { key: 'resumeUrl',         label: 'Resume / CV' },
    { key: 'transcriptUrl',     label: 'Transcript / ใบ Grade' },
    { key: 'certificateUrl',    label: 'Certificate / เอกสารเพิ่มเติม' },
    { key: 'photoUrl',          label: 'รูปถ่าย' },
    { key: 'idCardUrl',         label: 'สำเนาบัตรประชาชน' },
    { key: 'houseRegUrl',       label: 'สำเนาทะเบียนบ้าน' },
    { key: 'eduCertificateUrl', label: 'ใบรับรองวุฒิการศึกษา' },
    { key: 'militaryCertUrl',   label: 'ใบผ่านการเกณฑ์ทหาร (ถ้ามี)' },
    { key: 'toeicCertUrl',      label: 'ผลสอบ TOEIC (ถ้ามี)' },
    { key: 'bankBookUrl_scb',   label: 'สำเนาบัญชีธนาคารไทยพาณิชย์ (ออมทรัพย์)' },
    { key: 'bankBookUrl_ktb',   label: 'สำเนาบัญชีธนาคารกรุงไทย (ออมทรัพย์)' },
  ];

  const handleGenerateResubmitToken = async () => {
    if (!viewingApp || resubmitAllowedFields.length === 0) return;
    setIsGeneratingResubmit(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const createdBy = currentUser?.full_name || currentUser?.email || 'HR';
      const result = await api.generateResubmitToken(
        viewingApp.id,
        resubmitAllowedFields as any,
        createdBy
      );
      if (result.success && result.data) {
        setResubmitToken(result.data.token);
        setResubmitUrl(result.data.url);
        setResubmitExpiry(result.data.expires_at);
        setResubmitAllowedExisting(resubmitAllowedFields);
        setResubmitAllowedFields([]);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (result.error?.message || 'ไม่สามารถสร้าง token ได้'));
      }
    } finally {
      setIsGeneratingResubmit(false);
    }
  };

  const handleCopyResubmitUrl = async () => {
    if (!resubmitUrl) return;
    try {
      await navigator.clipboard.writeText(resubmitUrl);
      setResubmitUrlCopied(true);
      setTimeout(() => setResubmitUrlCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = resubmitUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setResubmitUrlCopied(true);
      setTimeout(() => setResubmitUrlCopied(false), 2500);
    }
  };

  const handleRevokeResubmitToken = async () => {
    if (!resubmitToken) return;
    try {
      const result = await api.revokeShareToken(resubmitToken);
      if (result.success) {
        setResubmitToken(null);
        setResubmitUrl(null);
        setResubmitExpiry(null);
        setResubmitAllowedExisting([]);
      }
    } catch (err) {
      console.error('Failed to revoke resubmit token:', err);
    }
  };

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

  const fd = viewingApp?.form_data || {};
  const hasAnyDocuments = !!(fd.resumeUrl || fd.transcriptUrl || fd.idCardUrl || fd.houseRegUrl || fd.eduCertificateUrl || fd.bankBookUrl || fd.militaryCertUrl || fd.toeicCertUrl || fd.certificateUrl);
  const isDetailLoaded = !!(viewingApp?.form_data && 'resumeUrl' in viewingApp.form_data);
  const isForeigner = fd.isThaiNational === false;
  const lang = isForeigner ? 'en' : 'th';
  const t = TRANSLATIONS[lang];

  const hasThaiName = fd.firstName && fd.lastName;
  const fullName = hasThaiName
    ? [fd.title || fd.prefix, fd.firstName, fd.lastName].filter(Boolean).join(' ')
    : [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ') || viewingApp?.full_name || '-';
  const fullNameEn = hasThaiName ? [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ') : null;

  const deleteFileByUrl = async (url: string | undefined | null) => {
    if (!url) return;
    try {
      if (url.includes('supabase.co') || url.includes('/storage/v1/object/public/')) {
        const matches = url.match(/\/public\/applicants\/(.+)$/);
        const path = matches ? matches[1] : null;
        if (path) {
          await supabase.storage.from('applicants').remove([path]);
        }
      } else {
        await deleteFromR2(url);
      }
    } catch (err) {
      console.error('Failed to delete file from storage:', url, err);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingPhoto(true);
    try {
      // Create a File from the Blob
      const file = new File([croppedBlob], `photo_cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const url = await api.uploadFile(file, 'photos');
      if (url) {
        const oldPhotoUrl = fd.photoUrl;
        const isAlreadyCropped = !!fd.originalPhotoUrl;
        
        // If this is the first crop, save the current photo as originalPhotoUrl
        // Otherwise, delete the previous cropped photo to save space
        const updatedFormData = { ...fd, photoUrl: url };
        if (!isAlreadyCropped) {
          updatedFormData.originalPhotoUrl = oldPhotoUrl;
        } else {
          // Cleanup previous intermediate cropped photo
          if (oldPhotoUrl && oldPhotoUrl !== fd.originalPhotoUrl) {
            await deleteFileByUrl(oldPhotoUrl);
          }
        }

        const { error } = await supabase
          .from('applications')
          .update({ form_data: updatedFormData, photo_url: url })
          .eq('id', viewingApp.id);
        
        if (!error) {
          const updatedApp = { ...viewingApp, form_data: updatedFormData, photo_url: url };
          setViewingApp(updatedApp);
          onApplicationUpdated?.(updatedApp);
          
          // Log the action
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          await api.addApplicationLog({
            application_id: viewingApp.id,
            action: 'updated',
            note: 'ปรับแต่งรูปภาพผู้สมัคร (Crop/Rotate)',
            performed_by: currentUser.full_name || 'ระบบ'
          });

          // Close cropper modal on success
          setIsCropperOpen(false);
        } else {
          throw error;
        }
      }
    } catch (err) {
      console.error('Failed to upload cropped photo:', err);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพที่ปรับแต่ง');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRestoreOriginal = async () => {
    if (!fd.originalPhotoUrl) return;
    
    setIsUploadingPhoto(true);
    try {
      const currentCroppedUrl = fd.photoUrl;
      const originalUrl = fd.originalPhotoUrl;
      
      const updatedFormData = { ...fd, photoUrl: originalUrl };
      delete updatedFormData.originalPhotoUrl;

      const { error } = await supabase
        .from('applications')
        .update({ form_data: updatedFormData, photo_url: originalUrl })
        .eq('id', viewingApp.id);
      
      if (!error) {
        // Cleanup the cropped photo from storage
        if (currentCroppedUrl) {
          await deleteFileByUrl(currentCroppedUrl);
        }

        const updatedApp = { ...viewingApp, form_data: updatedFormData, photo_url: originalUrl };
        setViewingApp(updatedApp);
        onApplicationUpdated?.(updatedApp);
        
        // Log the action
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        await api.addApplicationLog({
          application_id: viewingApp.id,
          action: 'updated',
          note: 'คืนค่ารูปภาพต้นฉบับ',
          performed_by: currentUser.full_name || 'ระบบ'
        });
        setShowRestoreConfirm(false);
      } else {
        throw error;
      }
    } catch (err) {
      console.error('Failed to restore original photo:', err);
      alert('เกิดข้อผิดพลาดในการคืนค่ารูปภาพ');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const checkIsBlacklisted = () => {
    if (!blacklistEntries || blacklistEntries.length === 0 || !viewingApp) return null;
    const fd = viewingApp.form_data || {};
    const nationalId = (fd.nationalId || '').trim();
    const passportNo = (fd.passportNo || '').trim().toUpperCase();

    for (const entry of blacklistEntries) {
      if (entry.status !== 'active') continue;
      
      if (entry.national_id && nationalId && entry.national_id.trim() === nationalId) {
        return entry;
      }
      if (entry.passport_no && passportNo && entry.passport_no.trim().toUpperCase() === passportNo) {
        return entry;
      }
    }
    return null;
  };

  const isBlacklisted = checkIsBlacklisted();

  // Log a 'view_detail' action when a blacklisted candidate's profile is opened
  useEffect(() => {
    if (!viewingApp || !isBlacklisted) return;
    
    const logBlacklistView = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        await api.blacklist.addAuditLog({
          performed_by: currentUser?.id || null,
          performed_by_name: currentUser?.full_name || currentUser?.email || 'HR Recruiter',
          action: 'view_detail',
          blacklist_id: isBlacklisted.id,
          candidate_name: `${isBlacklisted.first_name} ${isBlacklisted.last_name}`,
          details: `เข้าดูข้อมูลใบสมัครและตรวจสอบระบบประวัติเสียของผู้สมัคร (ผลลัพธ์: ตรวจพบประวัติ Blacklist ระดับ ${isBlacklisted.severity_level})`
        });
      } catch (err) {
        console.error('Failed to log blacklist view audit log:', err);
      }
    };
    
    logBlacklistView();
  }, [viewingApp?.id, isBlacklisted?.id]);

  return (
    <>
      {/* View Application Modal - Comprehensive View */}
      <Modal
        key={viewingApp?.id || 'none'}
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title={t.labels.applicationDetail}
        size="full"
        footer={null}
      >
        {viewingApp && (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[600px] lg:h-[calc(100vh-140px)] overflow-hidden w-full">
            {/* Left Column: Candidate Info */}
            <div className={`w-full flex flex-col h-full transition-all duration-300 ${showPreview ? 'lg:w-[45%]' : 'lg:w-full'}`}>
              {/* Scrollable Profile Info */}
              <div className="flex-1 overflow-y-auto pr-2 pb-6">
            {/* Blacklist Warning Banner */}
            {isBlacklisted && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex flex-col items-start gap-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 w-full">
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-red-200/50 mb-2">
                      <h4 className="text-sm font-bold text-red-800">
                        ⚠️ ตรวจพบประวัติเสีย (Blacklist Match Detected!)
                      </h4>
                      <button
                        type="button"
                        onClick={() => onViewBlacklistDetail(isBlacklisted)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-red-50 text-red-700 font-bold rounded-lg shadow-sm border border-red-200 transition-colors text-xs flex-shrink-0"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        ดูรายละเอียดประวัติเสียทั้งหมด
                      </button>
                    </div>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      พบประวัติเสียในฐานข้อมูล: <span className="font-semibold">{isBlacklisted.first_name} {isBlacklisted.last_name}</span> (ตรงกับข้อมูลระบุตัวตนของผู้สมัครรายนี้)
                      <span className="block mt-1">
                        หมวดหมู่ความผิด: <span className="font-semibold underline">{isBlacklisted.reason_category === 'theft' ? 'ขโมยทรัพย์สิน' : isBlacklisted.reason_category === 'policy_violation' ? 'ผิดกฏระเบียบบริษัท' : isBlacklisted.reason_category === 'attendance' ? 'ขาดงาน/ละทิ้งหน้าที่' : isBlacklisted.reason_category === 'harassment' ? 'ล่วงละเมิด/ทะเลาะวิวาท' : isBlacklisted.reason_category === 'fraud' ? 'ทุจริต/ปลอมเอกสาร' : 'อื่นๆ'} ({isBlacklisted.severity_level?.toUpperCase()})</span>
                      </span>
                      {isBlacklisted.description && <span className="block mt-1 bg-red-100/50 p-2 rounded text-red-900 font-mono text-[11px]">รายละเอียด: "{isBlacklisted.description}"</span>}
                      {isBlacklisted.original_bu && <span className="block mt-1 font-medium">หน่วยงานเดิม: {isBlacklisted.original_bu} | แผนกเดิม: {isBlacklisted.original_department || '-'} | วันที่เกิดเหตุ: {isBlacklisted.incident_date || '-'}</span>}
                    </p>
                  </div>
                </div>

                {/* Evidence attachments list */}
                {(isBlacklisted.attachment_url_1 || isBlacklisted.attachment_url_2) && (
                  <div className="w-full border-t border-red-200 pt-3 mt-1.5">
                    <p className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" /> เอกสารหลักฐานอ้างอิง:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {isBlacklisted.attachment_url_1 && (
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs transition shadow-sm cursor-pointer ${previewUrl === isBlacklisted.attachment_url_1 ? 'bg-red-100/70 border-red-300' : 'bg-white hover:bg-red-50/50 border-red-100'}`}
                          onClick={() => { setPreviewUrl(isBlacklisted.attachment_url_1); setPreviewTitle(isBlacklisted.attachment_name_1 || 'หลักฐานแบล็คลิสต์ 1'); }}
                        >
                          <span className="truncate max-w-[180px] font-medium text-gray-700 font-sans" title={isBlacklisted.attachment_name_1}>
                            {isBlacklisted.attachment_name_1 || 'หลักฐานแนบ 1'}
                          </span>
                          <a
                            href={isBlacklisted.attachment_url_1}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline px-2 py-1 bg-red-50 rounded"
                          >
                            <ExternalLink className="w-3 h-3" /> เปิดดู
                          </a>
                        </div>
                      )}
                      {isBlacklisted.attachment_url_2 && (
                        <div 
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs transition shadow-sm cursor-pointer ${previewUrl === isBlacklisted.attachment_url_2 ? 'bg-red-100/70 border-red-300' : 'bg-white hover:bg-red-50/50 border-red-100'}`}
                          onClick={() => { setPreviewUrl(isBlacklisted.attachment_url_2); setPreviewTitle(isBlacklisted.attachment_name_2 || 'หลักฐานแบล็คลิสต์ 2'); }}
                        >
                          <span className="truncate max-w-[180px] font-medium text-gray-700 font-sans" title={isBlacklisted.attachment_name_2}>
                            {isBlacklisted.attachment_name_2 || 'หลักฐานแนบ 2'}
                          </span>
                          <a
                            href={isBlacklisted.attachment_url_2}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline px-2 py-1 bg-red-50 rounded"
                          >
                            <ExternalLink className="w-3 h-3" /> เปิดดู
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Header with Photo */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200 mb-4">
                <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border group">
                  {(() => {
                    if (!fd.photoUrl) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-10 h-10" />
                        </div>
                      );
                    }
                    if (fd.photoUrl.toLowerCase().endsWith('.pdf')) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50/10">
                          <FileText className="w-8 h-8 text-indigo-400" />
                          <span className="text-[10px] text-gray-500 mt-1">PDF File</span>
                        </div>
                      );
                    }
                    return (
                      <div className="relative w-full h-full">
                        <img src={fd.photoUrl} alt="Photo" className="w-full h-full object-cover" key={fd.photoUrl} />
                        <div className="absolute bottom-1 right-1 flex gap-1 z-10">
                          {fd.originalPhotoUrl && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowRestoreConfirm(true);
                              }}
                              className="p-1.5 bg-white/90 hover:bg-white text-orange-600 rounded-md shadow-sm border border-orange-100 transition-colors"
                              title={lang === 'en' ? 'Restore Original' : 'คืนค่ารูปภาพเดิม'}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsCropperOpen(true);
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-indigo-600 rounded-md shadow-sm border border-indigo-100 transition-colors"
                            title="ปรับแต่งรูปภาพ"
                          >
                            <Crop className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Hover Overlay for Upload */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-white text-xs text-center p-1 font-semibold">
                      {isUploadingPhoto ? t.labels.uploading : t.labels.changePhoto}
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
                              // Cleanup previous photos if they exist
                              const extractPathFromUrl = (url: string | undefined | null) => {
                                if (!url) return null;
                                const matches = url.match(/\/public\/applicants\/(.+)$/);
                                return matches ? matches[1] : null;
                              };

                              const oldPhotoPath = extractPathFromUrl(fd.photoUrl);
                              const originalPhotoPath = extractPathFromUrl(fd.originalPhotoUrl);
                              const pathsToDelete = [oldPhotoPath, originalPhotoPath].filter((p): p is string => !!p);
                              
                              if (pathsToDelete.length > 0) {
                                await supabase.storage.from('applicants').remove(pathsToDelete);
                              }

                              const updatedFormData = { ...fd, photoUrl: url };
                              delete updatedFormData.originalPhotoUrl; // Clear original since we have a brand new photo

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
                  <p className="text-sm text-indigo-600 font-medium mt-1">{fd.isThaiNational === false ? (fd.positionEn || fd.position || viewingApp.position || 'ไม่ระบุตำแหน่ง') : (fd.position || viewingApp.position || 'ไม่ระบุตำแหน่ง')}</p>
                  <p className="text-sm text-gray-500">{fd.isThaiNational === false ? (fd.departmentEn || fd.department || viewingApp.department || '') : (fd.department || viewingApp.department || '')}</p>
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
                <InfoRow label={t.labels.position} value={fd.isThaiNational === false ? (fd.positionEn || fd.position || viewingApp.position) : (fd.position || viewingApp.position)} />
                <InfoRow label={t.labels.expectedSalary} value={fd.expectedSalary ? `${fmtSalary(fd.expectedSalary)} ${fd.isSalaryNegotiable ? `(${t.options.negotiable})` : ''}`.trim() : '-'} />
                <InfoRow label={t.labels.department} value={fd.department} />
                <InfoRow label={t.labels.availability} value={fd.availability} />
              </div>

              {/* Interview Details Block */}
              {(viewingApp.interview_date || viewingApp.interview_start_time || viewingApp.teams_meeting_url) && (() => {
                const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
                const gridColsClass = latestEval 
                  ? (showPreview ? "grid grid-cols-1 xl:grid-cols-2 gap-5 divide-y xl:divide-y-0 xl:divide-x divide-amber-200" : "grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-amber-200")
                  : "";

                return (
                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl mb-4 text-sm shadow-sm animate-in fade-in duration-300">
                    <div className={gridColsClass}>
                      {/* Left Pane: Schedule Info */}
                      <div className={latestEval ? "space-y-2.5 pb-4 md:pb-0 xl:pb-0" : ""}>
                        <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-amber-600" /> รายละเอียดการนัดสัมภาษณ์ (Interview Details)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <span className="text-gray-500 text-xs block">วันที่สัมภาษณ์:</span>
                            <span className="font-semibold text-gray-900">
                              {viewingApp.interview_date ? new Date(viewingApp.interview_date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs block">เวลาสัมภาษณ์:</span>
                            <span className="font-semibold text-gray-900">
                              {viewingApp.interview_start_time ? (
                                `${new Date(viewingApp.interview_start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}` +
                                (viewingApp.interview_end_time ? ` - ${new Date(viewingApp.interview_end_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}` : '')
                              ) : '-'}
                            </span>
                          </div>
                          <div className="col-span-2 border-t border-amber-200/50 pt-2.5 mt-1 flex flex-wrap gap-2">
                            {viewingApp.teams_meeting_url && (
                              <a
                                href={viewingApp.teams_meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold bg-white px-3 py-1.5 rounded-lg border border-indigo-150 shadow-sm transition-all text-xs"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                เข้าร่วมประชุม MS Teams
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCalendarClick(viewingApp)}
                              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm transition-all text-xs cursor-pointer animate-in fade-in"
                            >
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              เพิ่มนัดในปฏิทิน Outlook
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Pane: Latest Evaluation Results */}
                      {latestEval && (
                        <div className={`pt-4 md:pt-0 md:pl-5 ${showPreview ? 'xl:pt-0 xl:pl-5' : 'md:pt-0 md:pl-5'} flex flex-col justify-between`}>
                          <div>
                            <h4 className="font-bold text-indigo-800 flex items-center gap-1.5 mb-2.5">
                              <Star className="w-4 h-4 text-indigo-500 fill-indigo-500" /> ผลการประเมินล่าสุด (Latest Evaluation)
                            </h4>
                            
                            <div className="space-y-2">
                              {/* Round & Recommendation */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-500">
                                  สัมภาษณ์รอบที่ {latestEval.interview_round > 1 ? latestEval.interview_round : evaluations.length}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getOverallRecBadge(latestEval.overall_recommendation)}`}>
                                  {getOverallRecLabel(latestEval.overall_recommendation)}
                                </span>
                              </div>

                              {/* Ratings */}
                              <div className="grid grid-cols-3 gap-1.5 bg-white p-2 rounded-lg border border-slate-150 text-center shadow-sm">
                                <div className="flex flex-col items-center">
                                  <span className="text-[9px] text-gray-400 font-medium uppercase">ทักษะ</span>
                                  <StarRating val={latestEval.rating_skills} />
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[9px] text-gray-400 font-medium uppercase">ทัศนคติ</span>
                                  <StarRating val={latestEval.rating_attitude} />
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[9px] text-gray-400 font-medium uppercase">วัฒนธรรม</span>
                                  <StarRating val={latestEval.rating_cultural_fit} />
                                </div>
                              </div>

                              {/* Comments Snippet */}
                              {latestEval.comments && (
                                <div 
                                  className="text-xs text-gray-600 bg-white/70 p-2 rounded border border-slate-100 leading-relaxed font-sans max-h-16 overflow-y-auto" 
                                  title={latestEval.comments}
                                >
                                  "{latestEval.comments}"
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interviewer & Date */}
                          <div className="text-[10px] text-gray-400 flex items-center justify-between mt-3 pt-1.5 border-t border-slate-200/50">
                            <span>ผู้ประเมิน: {latestEval.interviewer?.full_name || 'ไม่ระบุ'}</span>
                            <span>{new Date(latestEval.created_at).toLocaleDateString('th-TH')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 2. Personal Info */}
              <SectionHeader title={t.sections.personal} icon={User} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <InfoRow label={t.labels.title} value={fd.title || fd.prefix} />
                <InfoRow label={`${t.labels.nickname} (TH)`} value={fd.nickname} />
                <InfoRow label={`${t.labels.nickname} (EN)`} value={fd.nicknameEn} />
                <InfoRow label={t.labels.firstName} value={fd.firstName} />
                <InfoRow label={t.labels.lastName} value={fd.lastName} />
                <InfoRow label={t.labels.nationality} value={fd.isThaiNational ? t.options.thai : t.options.foreigner} />
                <InfoRow label={fd.isThaiNational ? t.labels.nationalId : t.labels.passport} value={fd.isThaiNational ? fd.nationalId : fd.passportNo} />
                {!fd.isThaiNational && (
                  <InfoRow label={t.labels.haveLicense} value={fd.availableToWorkInThailand ? `✅ ${t.options.yesIdo}` : `⚠️ ${t.options.noIdont}`} />
                )}
                <InfoRow label={t.labels.dateOfBirth} value={fd.dateOfBirth} />
                <InfoRow label={t.labels.age} value={fd.age ? `${fd.age} ${t.options.years}` : '-'} />
                <InfoRow label={t.labels.height} value={fd.height ? `${fd.height} ${t.options.cm}` : '-'} />
                <InfoRow label={t.labels.weight} value={fd.weight ? `${fd.weight} ${t.options.kg}` : '-'} />
                <InfoRow label={t.labels.militaryStatus} value={t.options[fd.militaryStatus?.toLowerCase() as keyof typeof t.options] || getMilitaryStatusLabel(fd.militaryStatus)} />
                <InfoRow label={t.labels.phone} value={fd.phone || viewingApp.phone} />
                <InfoRow label={t.labels.email} value={fd.email || viewingApp.email} className="col-span-2" />
              </div>

              {/* 3. Contact Address */}
              <SectionHeader title={t.sections.contact} icon={MapPin} />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">{t.labels.registeredAddress}:</span>
                  <p className="text-gray-900">{fd.registeredAddress || '-'} {fd.registeredSubDistrict ? `${lang === 'en' ? 'Sub-district ' : 'ต.'}${fd.registeredSubDistrict}` : ''} {fd.registeredDistrict ? `${lang === 'en' ? 'District ' : 'อ.'}${fd.registeredDistrict}` : ''} {fd.registeredProvince ? `${lang === 'en' ? 'Province ' : 'จ.'}${fd.registeredProvince}` : ''} {fd.registeredPostcode || ''}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">{t.labels.currentAddress}:</span>
                  <p className="text-gray-900">{fd.currentAddress || '-'} {fd.currentSubDistrict ? `${lang === 'en' ? 'Sub-district ' : 'ต.'}${fd.currentSubDistrict}` : ''} {fd.currentDistrict ? `${lang === 'en' ? 'District ' : 'อ.'}${fd.currentDistrict}` : ''} {fd.currentProvince ? `${lang === 'en' ? 'Province ' : 'จ.'}${fd.currentProvince}` : ''} {fd.currentPostcode || ''}</p>
                </div>
              </div>

              {/* 4. Family Info */}
              <SectionHeader title={t.sections.family} icon={Users} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mb-3">
                <InfoRow label={t.labels.maritalStatus} value={t.options[fd.maritalStatus?.toLowerCase() as keyof typeof t.options] || fd.maritalStatus} />
                <InfoRow label={t.labels.children} value={fd.childrenCount} />
                <InfoRow label={t.labels.siblings} value={fd.siblingCount} />
              </div>
              {(fd.maritalStatus === 'สมรส' || fd.maritalStatus === 'Married') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 mb-3 bg-gray-50 p-2 rounded">
                  <InfoRow label={t.labels.spouseName} value={fd.spouseName} />
                  <InfoRow label={t.labels.spouseOccupation} value={fd.spouseOccupation} />
                  <InfoRow label={t.labels.spouseAge} value={fd.spouseAge} />
                </div>
              )}
              {/* Desktop: Table | Mobile: Cards */}
              <div className="hidden sm:block border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.relationship}</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.firstName} - {t.labels.lastName}</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.age}</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.lastPosition} / {t.labels.department}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">{t.options.fatherInfo}</td>
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
                      <td className="py-2 px-3 font-medium">{t.options.motherInfo}</td>
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
                  { rel: t.options.fatherInfo, deceased: fd.fatherDeceased, name: fd.fatherName, age: fd.fatherAge, occ: fd.fatherOccupation },
                  { rel: t.options.motherInfo, deceased: fd.motherDeceased, name: fd.motherName, age: fd.motherAge, occ: fd.motherOccupation }
                ].map((p) => (
                  <div key={p.rel} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="font-semibold text-gray-800 mb-1">{p.rel}</div>
                    {p.deceased ? (
                      <div className="italic text-gray-400">เสียชีวิตแล้ว (Deceased)</div>
                    ) : (
                      <>
                        <div className="text-gray-600">{t.labels.firstName}: <span className="text-gray-900 font-medium">{p.name || '-'}</span></div>
                        <div className="flex gap-4 text-gray-600"><span>{t.labels.age}: <span className="text-gray-900 font-medium">{p.age || '-'}</span></span><span>{t.labels.lastPosition}: <span className="text-gray-900 font-medium">{p.occ || '-'}</span></span></div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* 5. Education */}
              <SectionHeader title={lang === 'en' ? 'Education' : 'การศึกษา'} icon={GraduationCap} />
              {fd.education ? (
                <>
                  {/* Desktop: Table */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-1/5">{t.labels.program}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-1/3">{t.labels.institute}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.major}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-16">{t.labels.gpa}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-20">{t.options.period}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(() => {
                          const edu = fd.education;
                          const levelNames: Record<string, string> = Object.keys(t.options).reduce((acc, key) => ({
                            ...acc, [key]: t.options[key as keyof typeof t.options]
                          }), {});
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
                      const levelNames: Record<string, string> = Object.keys(t.options).reduce((acc, key) => ({
                        ...acc, [key]: t.options[key as keyof typeof t.options]
                      }), {});
                      if (Array.isArray(edu)) {
                        return edu.filter(e => e?.institute).map((e, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                            <div className="font-semibold text-gray-800">{levelNames[e.level || ''] || e.level || '-'}</div>
                            <div className="text-gray-600 mt-0.5">{e.institute || '-'}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0 text-xs text-gray-500 mt-1">
                              <span>{t.labels.major}: {e.major || '-'}</span>
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
                              <span>{t.labels.major}: {e.major || '-'}</span>
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
                <p className="text-sm text-gray-500">{t.options.noInfo}</p>
              )}

              {/* 6. Work Experience */}
              <SectionHeader title={lang === 'en' ? 'Work Experience' : 'ประสบการณ์ทำงาน'} icon={Building2} />
              {fd.experience && fd.experience.length > 0 ? (
                <>
                  {/* Desktop: Table */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-24">{t.options.period}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.company}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.labels.lastPosition}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-20">{t.labels.salary}</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">{t.options.responsibilities}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {fd.experience.map((exp: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-3 text-xs">{fmtYearMonth(exp.from)}<br />{exp.to ? fmtYearMonth(exp.to) : t.options.present}</td>
                            <td className="py-2 px-3 font-medium">{exp.company || '-'}</td>
                            <td className="py-2 px-3">{exp.position || '-'}</td>
                            <td className="py-2 px-3">{fmtSalary(exp.salary)}</td>
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
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{fmtYearMonth(exp.from)} - {exp.to ? fmtYearMonth(exp.to) : t.options.present}</span>
                        </div>
                        <div className="text-gray-600 text-xs mt-0.5">{exp.position || '-'}{exp.salary ? ` · ${fmtSalary(exp.salary)}` : ''}</div>
                        {exp.description && <div className="text-xs text-gray-500 mt-1">{exp.description}</div>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">ไม่มีประสบการณ์ทำงาน</p>
              )}

              {/* 7. Skills */}
              <SectionHeader title={lang === 'en' ? 'Skills' : 'ทักษะ'} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Languages */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">ภาษา</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">{t.labels.english}:</span><span className="font-medium">{fd.englishSkill || '-'} {fd.englishScore ? `(${fd.englishScore})` : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">{t.labels.chinese}:</span><span className="font-medium">{fd.chineseSkill || '-'} {fd.chineseScore ? `(${fd.chineseScore})` : ''}</span></div>
                  </div>
                </div>
                {/* Driving */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">{t.labels.driving}</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">{t.labels.motorcycle}:</span><span className="font-medium">{fd.driving?.motorcycle ? t.options.yesIcan : t.options.noIcannot} {fd.driving?.motorcycleLicense ? `(${t.options.yesIdo}${t.options.license})` : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">{t.labels.car}:</span><span className="font-medium">{fd.driving?.car ? t.options.yesIcan : t.options.noIcannot} {fd.driving?.carLicense ? `(${t.options.yesIdo}${t.options.license})` : ''}</span></div>
                    {fd.driving?.licenseClasses?.length > 0 && <div className="text-xs text-gray-500">{t.options.types}: {fd.driving.licenseClasses.join(', ')}</div>}
                  </div>
                </div>
                {/* Computer Skills */}
                {fd.computerSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">{t.labels.computer}</h5>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      {Object.entries(fd.computerSkills).map(([k, v]) => {
                        const formattedLabel = {
                          word: 'MS Word',
                          excel: 'MS Excel',
                          powerpoint: 'PowerPoint',
                          sheets: 'Google Sheets',
                          docs: 'Google Docs',
                          forms: 'Google Forms',
                          slides: 'Google Slides',
                        }[k] || (k.charAt(0).toUpperCase() + k.slice(1));
                        return (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-600">{formattedLabel}:</span>
                            <span className="font-medium text-xs">{v as string}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Graphics Skills */}
                {fd.graphicsSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">{t.labels.graphics}</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">{t.options.canva}:</span><span className="font-medium">{fd.graphicsSkills.canva || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">{t.options.videoEditor}:</span><span className="font-medium">{fd.graphicsSkills.videoEditor || '-'}</span></div>
                    </div>
                  </div>
                )}
              </div>
              {/* Special Skills & Hobbies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div className="text-sm"><span className="text-gray-500 font-medium">{t.labels.specialAbility}:</span> <span className="text-gray-900">{fd.specialAbility || '-'}</span></div>
                <div className="text-sm"><span className="text-gray-500 font-medium">{t.labels.hobbies}:</span> <span className="text-gray-900">{fd.hobbies || '-'}</span></div>
              </div>

              {/* 8. Questionnaire */}
              <SectionHeader title={t.sections.questionnaire} />
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.upcountry}:</span>
                   <span className="text-gray-900">{fd.upcountryLocations?.length > 0 ? fd.upcountryLocations.join(', ') : '-'}</span>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div className="bg-gray-50 p-3 rounded text-sm">
                     <span className="text-gray-500 font-medium block mb-1">{t.labels.strength}:</span>
                     <span className="text-gray-900">{fd.strength || '-'}</span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded text-sm">
                     <span className="text-gray-500 font-medium block mb-1">{t.labels.weakness}:</span>
                     <span className="text-gray-900">{fd.weakness || '-'}</span>
                   </div>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.lessFit}:</span>
                   <span className="text-gray-900">{fd.lessFitTask || '-'}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.principles}:</span>
                   <span className="text-gray-900">{fd.principles || '-'}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.troubleResolve}:</span>
                   <span className="text-gray-900">{fd.troubleResolve || '-'}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.jobCriteria}:</span>
                   <span className="text-gray-900">{fd.jobCriteria || '-'}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.interests}:</span>
                   <span className="text-gray-900">{fd.interests || '-'}</span>
                 </div>
                 <div className="bg-gray-50 p-3 rounded text-sm">
                   <span className="text-gray-500 font-medium block mb-1">{t.labels.digitalTransform}:</span>
                   <span className="text-gray-900">{fd.digitalTransformOpinion || '-'}</span>
                 </div>
              </div>

              {/* 9. Health & Emergency */}
              <SectionHeader title={t.sections.health} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-blue-800 mb-2">{t.sections.emergency}</h5>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">{t.labels.firstName}:</span> <span className="font-medium">{fd.emergencyContactName || '-'}</span></div>
                    <div><span className="text-gray-600">{t.labels.relationship}:</span> <span className="font-medium">{fd.emergencyContactRelation || '-'}</span></div>
                    <div><span className="text-gray-600">{t.labels.phone}:</span> <span className="font-medium">{fd.emergencyContactPhone || '-'}</span></div>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-red-800 mb-2">{t.options.medicalHistory}</h5>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">{t.labels.chronic}:</span> <span className="font-medium">{fd.hasChronicDisease ? fd.chronicDiseaseDetail : t.options.no}</span></div>
                    <div><span className="text-gray-600">{t.labels.surgery}:</span> <span className="font-medium">{fd.hasSurgery ? fd.surgeryDetail : t.options.no}</span></div>
                    <div><span className="text-gray-600">{t.labels.medicalRecord}:</span> <span className="font-medium">{fd.hasMedicalRecord ? fd.medicalRecordDetail : t.options.no}</span></div>
                  </div>
                </div>
              </div>

              {/* Source Tags */}
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> {t.labels.sourceChannel}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(fd.businessUnit || viewingApp.business_unit) && <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">BU: {fd.businessUnit || viewingApp.business_unit}</span>}
                  {(fd.sourceChannel || viewingApp.source_channel) && <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Channel: {fd.sourceChannel || viewingApp.source_channel}</span>}
                  {(fd.campaignTag || viewingApp.campaign_tag) && <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Tag: {fd.campaignTag || viewingApp.campaign_tag}</span>}
                </div>
              </div>

              {/* Attachments */}
              {(fd.resumeUrl || fd.transcriptUrl || fd.certificateUrl || fd.profileLinks) && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{t.labels.attachments}</h4>
                  <div className="flex flex-wrap gap-2">
                    {fd.resumeUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.resumeUrl); setPreviewTitle('Resume / CV'); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition border shadow-sm ${previewUrl === fd.resumeUrl ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'}`}
                      >
                        <FileText className="w-4 h-4" /> Resume
                        <a href={fd.resumeUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1.5 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.transcriptUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.transcriptUrl); setPreviewTitle('Transcript'); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition border shadow-sm ${previewUrl === fd.transcriptUrl ? 'bg-amber-600 text-white border-amber-600' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100'}`}
                      >
                        <FileText className="w-4 h-4" /> Transcript
                        <a href={fd.transcriptUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1.5 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.certificateUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.certificateUrl); setPreviewTitle('Certificate / เอกสารเพิ่มเติม'); }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition border shadow-sm ${previewUrl === fd.certificateUrl ? 'bg-slate-700 text-white border-slate-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
                      >
                        <FileText className="w-4 h-4" /> {t.sections.documents}
                        <a href={fd.certificateUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-1.5 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.profileLinks && (
                      <a href={fd.profileLinks} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700 transition border border-blue-100 shadow-sm">
                        <ExternalLink className="w-4 h-4" /> Profile Link
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Hiring Documents Section */}
              {(fd.idCardUrl || fd.houseRegUrl || fd.eduCertificateUrl || fd.militaryCertUrl || fd.toeicCertUrl || fd.bankBookUrl) && (
                <div className="mt-4 pt-3 border-t bg-emerald-50/20 p-3 rounded-lg border border-emerald-100">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    💼 เอกสารประกอบการจ้างงาน (Hiring Documents)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fd.idCardUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.idCardUrl); setPreviewTitle('สำเนาบัตรประชาชน'); }}
                        className={`inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition border shadow-sm ${previewUrl === fd.idCardUrl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${previewUrl === fd.idCardUrl ? 'text-white' : 'text-emerald-500'}`} /> 
                          สำเนาบัตรประชาชน
                        </span>
                        <a href={fd.idCardUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.houseRegUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.houseRegUrl); setPreviewTitle('สำเนาทะเบียนบ้าน'); }}
                        className={`inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition border shadow-sm ${previewUrl === fd.houseRegUrl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${previewUrl === fd.houseRegUrl ? 'text-white' : 'text-emerald-500'}`} /> 
                          สำเนาทะเบียนบ้าน
                        </span>
                        <a href={fd.houseRegUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.eduCertificateUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.eduCertificateUrl); setPreviewTitle('ใบรับรองวุฒิการศึกษา'); }}
                        className={`inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition border shadow-sm ${previewUrl === fd.eduCertificateUrl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${previewUrl === fd.eduCertificateUrl ? 'text-white' : 'text-emerald-500'}`} /> 
                          ใบรับรองวุฒิการศึกษา
                        </span>
                        <a href={fd.eduCertificateUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.militaryCertUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.militaryCertUrl); setPreviewTitle('ใบผ่านการเกณฑ์ทหาร'); }}
                        className={`inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition border shadow-sm ${previewUrl === fd.militaryCertUrl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${previewUrl === fd.militaryCertUrl ? 'text-white' : 'text-emerald-500'}`} /> 
                          ใบผ่านการเกณฑ์ทหาร
                        </span>
                        <a href={fd.militaryCertUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.toeicCertUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.toeicCertUrl); setPreviewTitle('ผลสอบ TOEIC'); }}
                        className={`inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition border shadow-sm ${previewUrl === fd.toeicCertUrl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        <span className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${previewUrl === fd.toeicCertUrl ? 'text-white' : 'text-emerald-500'}`} /> 
                          ผลสอบ TOEIC
                        </span>
                        <a href={fd.toeicCertUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                    {fd.bankBookUrl && (
                      <button
                        type="button"
                        onClick={() => { setPreviewUrl(fd.bankBookUrl); setPreviewTitle(`สำเนาบัญชีธนาคาร${fd.bankName ? ` (${fd.bankName})` : ''}`); }}
                        className={`inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition border shadow-sm ${previewUrl === fd.bankBookUrl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                      >
                        <span className="flex items-center gap-2 text-left">
                          <FileText className={`w-4 h-4 shrink-0 ${previewUrl === fd.bankBookUrl ? 'text-white' : 'text-emerald-500'}`} /> 
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">
                            สำเนาบัญชีธนาคาร{fd.bankName ? ` (${fd.bankName === 'SCB' ? 'ไทยพาณิชย์' : 'กรุงไทย'})` : ''}
                          </span>
                        </span>
                        <a href={fd.bankBookUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-current hover:opacity-80">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Interview Date Display */}
              {isInterviewScheduledStatus(viewingApp.status) && viewingApp.interview_date && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800">{t.labels.interviewDate}</h4>
                    <p className="text-sm text-orange-700">
                      {new Date(viewingApp.interview_date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}

              {/* Evaluation scorecards section */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-indigo-500" /> ผลการประเมินสัมภาษณ์ (Interview Scorecard History)
                </h4>
                {isLoadingEvaluations ? (
                  <div className="text-center py-4 text-sm text-gray-400">กำลังโหลดผลประเมิน...</div>
                ) : evaluations.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">ยังไม่มีผลการประเมินสัมภาษณ์</div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {evaluations.map((ev: any, idx: number) => {
                      return (
                        <div key={ev.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-sm text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-slate-800">สัมภาษณ์รอบที่ {ev.interview_round > 1 ? ev.interview_round : (idx + 1)}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getOverallRecBadge(ev.overall_recommendation)}`}>
                              {getOverallRecLabel(ev.overall_recommendation)}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100 mb-2.5">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-400 font-medium uppercase">ทักษะ (Skills)</span>
                              <StarRating val={ev.rating_skills} />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-400 font-medium uppercase">ทัศนคติ (Attitude)</span>
                              <StarRating val={ev.rating_attitude} />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-gray-400 font-medium uppercase">วัฒนธรรม (Fit)</span>
                              <StarRating val={ev.rating_cultural_fit} />
                            </div>
                          </div>

                          {ev.comments && (
                            <div className="text-xs text-gray-600 bg-white p-2.5 rounded-lg border border-slate-150 mb-2 leading-relaxed">
                              {ev.comments}
                            </div>
                          )}

                          <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-slate-100">
                            <span>ผู้ประเมิน: {ev.interviewer?.full_name || 'ไม่ระบุผู้ประเมิน'}</span>
                            <span>{new Date(ev.created_at).toLocaleDateString('th-TH')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Activity Log Timeline */}
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> {t.labels.actionHistory}
                </h4>
                {isLoadingLogs ? (
                  <div className="text-center py-4 text-sm text-gray-400">กำลังโหลด...</div>
                ) : appLogs.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-400">{t.labels.noHistory}</div>
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
                              <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')} {new Date(log.created_at).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ─── Resubmit Token Panel ─── */}
              <div className="mt-4">
                <button
                  onClick={() => setShowResubmitPanel(prev => !prev)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all border
                    ${resubmitToken
                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {lang === 'en' ? 'Request Document Resubmission' : 'ขอเอกสารใหม่'}
                    {resubmitToken && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">Active</span>
                    )}
                  </span>
                  {showResubmitPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showResubmitPanel && (
                  <div className="mt-2 p-3 border border-slate-200 rounded-lg bg-white space-y-3">

                    {/* Existing active token */}
                    {resubmitToken ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" /> มี token ที่ใช้งานได้อยู่
                          </p>
                          <span className="text-[10px] text-slate-400">
                            หมดอายุ: {resubmitExpiry ? new Date(resubmitExpiry).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          เอกสารที่อนุญาต: {resubmitAllowedExisting.map(f => ({
                            resumeUrl: 'Resume',
                            transcriptUrl: 'Transcript',
                            certificateUrl: 'Certificate / เอกสารเพิ่มเติม',
                            photoUrl: 'รูปถ่าย',
                            idCardUrl: 'สำเนาบัตรประชาชน',
                            houseRegUrl: 'สำเนาทะเบียนบ้าน',
                            eduCertificateUrl: 'ใบรับรองวุฒิการศึกษา',
                            militaryCertUrl: 'ใบผ่านการเกณฑ์ทหาร',
                            toeicCertUrl: 'ผลสอบ TOEIC',
                            bankBookUrl_scb: 'สำเนาบัญชีธนาคารไทยพาณิชย์',
                            bankBookUrl_ktb: 'สำเนาบัญชีธนาคารกรุงไทย',
                          })[f] || f).join(', ')}
                        </p>
                        <div className="flex items-center gap-2">
                          <input readOnly value={resubmitUrl || ''} className="flex-1 text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1.5 text-amber-900 truncate" />
                          <button
                            onClick={handleCopyResubmitUrl}
                            className="flex-shrink-0 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                          >
                            {resubmitUrlCopied ? <><Check className="w-3.5 h-3.5" /> คัดลอกแล้ว</> : <><Copy className="w-3.5 h-3.5" /> คัดลอก</>}
                          </button>
                          <button
                            onClick={handleRevokeResubmitToken}
                            className="flex-shrink-0 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs font-semibold flex items-center gap-1 transition"
                            title="ยกเลิก token นี้"
                          >
                            <XCircle className="w-3.5 h-3.5" /> ยกเลิก
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          ผู้สมัครสามารถกดปุ่ม "แก้ไขเอกสาร" จากหน้าตรวจสอบสถานะได้เลย ไม่จำเป็นต้องส่ง link
                        </p>
                        <div className="border-t pt-2">
                          <p className="text-xs text-slate-500 font-medium mb-1">สร้าง token ใหม่แทนของเดิม:</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Field selector */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 pb-1 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-600">
                          {resubmitToken ? 'เลือกเอกสารใหม่ (จะยกเลิก token เดิม):' : 'เลือกเอกสารที่ต้องการขอใหม่:'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const isNps = (viewingApp?.business_unit || fd.businessUnit || '').toLowerCase().includes('nps');
                            const targetBankKey = isNps ? 'bankBookUrl_ktb' : 'bankBookUrl_scb';
                            const hiringKeys = ['idCardUrl', 'houseRegUrl', 'eduCertificateUrl', 'militaryCertUrl', 'toeicCertUrl', targetBankKey];
                            setResubmitAllowedFields(prev => {
                              const hasAll = hiringKeys.every(k => prev.includes(k));
                              if (hasAll) {
                                return prev.filter(k => !hiringKeys.includes(k));
                              } else {
                                const union = new Set([...prev, ...hiringKeys]);
                                return Array.from(union);
                              }
                            });
                          }}
                          className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-2 py-0.5 rounded transition border border-emerald-200 self-start sm:self-auto"
                        >
                          {['idCardUrl', 'houseRegUrl', 'eduCertificateUrl', 'militaryCertUrl', 'toeicCertUrl', (viewingApp?.business_unit || fd.businessUnit || '').toLowerCase().includes('nps') ? 'bankBookUrl_ktb' : 'bankBookUrl_scb'].every(k => resubmitAllowedFields.includes(k))
                            ? '🚫 ยกเลิกเลือกเอกสารจ้างงาน'
                            : '📋 เลือกเอกสารการจ้างงานทั้งหมด'}
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {RESUBMIT_FIELD_OPTIONS.map(opt => (
                          <label key={opt.key} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded">
                            <input
                              type="checkbox"
                              checked={resubmitAllowedFields.includes(opt.key)}
                              onChange={(e) => {
                                setResubmitAllowedFields(prev =>
                                  e.target.checked ? [...prev, opt.key] : prev.filter(f => f !== opt.key)
                                );
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="text-sm text-slate-700">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {resubmitAllowedFields.length === 0 && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> กรุณาเลือกเอกสารอย่างน้อย 1 รายการ
                      </p>
                    )}

                    <button
                      onClick={handleGenerateResubmitToken}
                      disabled={isGeneratingResubmit || resubmitAllowedFields.length === 0}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                    >
                      {isGeneratingResubmit
                        ? <><span className="animate-spin">⏳</span> กำลังสร้าง...</>
                        : <><Upload className="w-4 h-4" /> {resubmitToken ? 'สร้าง token ใหม่แทน' : 'สร้าง Token'}</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Share Link Panel */}
              {shareLink && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm">
                  {/* Title and Expiration Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-emerald-600" /> {t.labels.shareProfile}
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-2.5 py-0.5 rounded-full font-semibold self-start sm:self-auto">
                      {t.labels.expires}: {shareLinkExpiry ? new Date(shareLinkExpiry).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>

                  {/* Share Link Input with Embedded Copy Button */}
                  <div className="relative flex items-center mb-2.5">
                    <input 
                      readOnly 
                      value={shareLink} 
                      className="w-full text-xs bg-white border border-emerald-200 rounded-lg pl-3 pr-28 py-2.5 text-emerald-900 font-mono shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                    />
                    <button
                      onClick={handleCopyShareLink}
                      className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                    >
                      {shareLinkCopied ? <><Check className="w-3 h-3" /> {t.labels.copied}</> : <><Copy className="w-3 h-3" /> {t.labels.copy}</>}
                    </button>
                  </div>

                  {/* Revoke Option */}
                  <div className="flex justify-end pt-2 border-t border-emerald-100/60">
                    <button
                      onClick={handleRevokeShareLink}
                      disabled={isGeneratingLink}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 hover:text-red-700 text-red-600 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                      title={t.labels.stopSharing}
                    >
                      <XCircle className="w-3.5 h-3.5" /> {t.labels.stopSharing}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="relative bg-white border-t border-slate-200 py-3 px-4 z-30 flex flex-wrap items-center justify-end gap-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] shrink-0">
                {!showPreview && hasAnyDocuments && (
                  <Button
                    variant="primary"
                    size={showPreview ? "sm" : "md"}
                    onClick={() => {
                      setShowPreview(true);
                      setAutoSelectOnLoad(true);
                    }}
                    className="mr-auto animate-in fade-in zoom-in-95 duration-200"
                  >
                    <Eye className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Show Documents' : 'แสดงตัวอย่างเอกสาร'}
                  </Button>
                )}

                {/* Dropdown Menu for Secondary Actions */}
                <div className="relative" ref={moreActionsRef}>
                  <Button
                    variant="outline"
                    size={showPreview ? "sm" : "md"}
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    {lang === 'en' ? 'Manage' : 'จัดการเคส'}
                    {showMoreActions ? <ChevronUp className="w-4 h-4 ml-0.5 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-0.5 text-slate-400" />}
                  </Button>

                  {showMoreActions && (
                    <div className={`absolute ${showPreview ? 'left-0' : 'right-0'} bottom-full mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150`}>
                      {/* 1. Print Preview */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreActions(false);
                          const fd = viewingApp.form_data ? { ...viewingApp.form_data } : {};
                          fd.created_at = viewingApp.created_at;
                          fd.id = viewingApp.id;
                          localStorage.setItem('printPreviewData', JSON.stringify(fd));
                          window.open('/print.html', '_blank');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        {t.labels.openFullPreview}
                      </button>

                      {/* 2. Memo */}
                      <button
                        type="button"
                        onClick={async () => {
                          setShowMoreActions(false);
                          const fd = viewingApp.form_data ? { ...viewingApp.form_data } : {};
                          fd.created_at = viewingApp.created_at;
                          fd.id = viewingApp.id;
                          fd.interview_date = viewingApp.interview_date;
                          fd.position = viewingApp.position;
                          fd.department = viewingApp.department;
                          fd.business_unit = viewingApp.business_unit;

                          try {
                            const [condsRes, calsRes] = await Promise.all([
                              api.master.getAll('memo_conditions'),
                              api.master.getAll('memo_calendars')
                            ]);
                            fd.masterConditions = condsRes.data || [];
                            fd.masterCalendars = calsRes.data || [];
                          } catch (e) {
                            console.error("Failed to prefetch memo master data", e);
                          }

                          localStorage.setItem('memoPreviewData', JSON.stringify(fd));
                          window.open('/memo.html', '_blank');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        สร้าง Memo
                      </button>

                      {/* 3. Share Link */}
                      <button
                        type="button"
                        disabled={isGeneratingLink}
                        onClick={() => {
                          setShowMoreActions(false);
                          handleGenerateShareLink();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors disabled:opacity-50 border-t border-slate-100"
                      >
                        <Link className="w-3.5 h-3.5 text-slate-500" />
                        {isGeneratingLink ? (lang === 'en' ? 'Generating...' : 'กำลังสร้าง...') : shareLink ? (lang === 'en' ? 'View Share Link' : 'ดูลิงก์แชร์') : (lang === 'en' ? 'Create Share Link' : 'สร้างลิงก์แชร์')}
                      </button>

                      {/* 4. Edit details */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreActions(false);
                          setEditingApp(viewingApp);
                          setViewingApp(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        {t.actions.edit}
                      </button>

                      {/* 5. Claim / Transfer / Unassign Case */}
                      {!viewingApp.assigned_to && !isClosedStatus(viewingApp.status) && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowMoreActions(false);
                            setClaimingApp(viewingApp);
                            setViewingApp(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                        >
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          {lang === 'en' ? 'Claim Case' : 'รับเคสนี้ (Claim)'}
                        </button>
                      )}

                      {viewingApp.assigned_to && !isClosedStatus(viewingApp.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              setTransferringApp(viewingApp);
                              setViewingApp(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                          >
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            {lang === 'en' ? 'Transfer Case' : 'โอนเคส'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMoreActions(false);
                              setUnassigningApp(viewingApp);
                              setViewingApp(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100"
                          >
                            <User className="w-3.5 h-3.5 text-red-500" />
                            {lang === 'en' ? 'Unassign Case' : 'ยกเลิกการรับเคส'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Workflow Status Actions */}
                {viewingApp.status === 'Reviewing' && (
                  <>
                    <Button size={showPreview ? "sm" : "md"} className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { setInterviewingApp(viewingApp); setInterviewDate(''); setViewingApp(null); }}>
                      <Calendar className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Schedule Interview' : 'นัดสัมภาษณ์'}
                    </Button>
                    <Button size={showPreview ? "sm" : "md"} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectingApp(viewingApp); setViewingApp(null); setRejectComment(''); setRejectionReason(''); }}>
                      <XCircle className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Reject' : 'ไม่รับ'}
                    </Button>
                  </>
                )}
                {isInterviewScheduledStatus(viewingApp.status) && (
                  <Button size={showPreview ? "sm" : "md"} className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => { setInterviewingApp(viewingApp); setInterviewDate(viewingApp.interview_date || ''); setViewingApp(null); }}>
                    <Calendar className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Reschedule Interview' : 'เปลี่ยนวันสัมภาษณ์'}
                  </Button>
                )}
                {/* Evaluate Candidate Button */}
                {(isInterviewScheduledStatus(viewingApp.status) || viewingApp.status === 'Interviewed') && (
                  <Button
                    size={showPreview ? "sm" : "md"}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                      setEvaluatingApp(viewingApp);
                      setViewingApp(null);
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Evaluate Candidate' : 'บันทึกการประเมิน'}
                  </Button>
                )}
                {(isInterviewScheduledStatus(viewingApp.status) || viewingApp.status === 'Interviewed' || viewingApp.status === 'Offer') && (
                  <>
                    <Button size={showPreview ? "sm" : "md"} className="bg-green-600 hover:bg-green-700" onClick={() => { setApprovingApp(viewingApp); setViewingApp(null); }}>
                      <CheckCircle className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Hire' : 'รับเข้าทำงาน'}
                    </Button>
                    <Button size={showPreview ? "sm" : "md"} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectingApp(viewingApp); setViewingApp(null); setRejectComment(''); setRejectionReason(''); }}>
                      <XCircle className="w-4 h-4 mr-2" /> {lang === 'en' ? 'Not Pass' : 'ไม่ผ่าน'}
                    </Button>
                  </>
                )}
                <Button size={showPreview ? "sm" : "md"} variant="outline" onClick={() => setViewingApp(null)}>{lang === 'en' ? 'Close' : 'ปิด'}</Button>
              </div>
            </div>

            {/* Right Column: Document Previewer */}
            {showPreview && (
              <div className="w-full lg:w-[55%] flex flex-col h-[600px] lg:h-full bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm overflow-hidden animate-in slide-in-from-right duration-350">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      📄 แสดงตัวอย่างเอกสาร (Document Viewer)
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {previewTitle || 'กรุณาเลือกไฟล์เพื่อพรีวิว'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs border border-slate-200 transition shadow-sm"
                      title="เปิดในแท็บใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      เปิดแท็บใหม่
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center shadow-sm"
                    title="ซ่อนพรีวิวเอกสาร"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chips for all available documents */}
              <div className="py-2.5 flex flex-wrap gap-1.5 border-b border-slate-100 overflow-x-auto flex-shrink-0 scrollbar-thin">
                {/* 1. Resume */}
                <button
                  type="button"
                  disabled={!fd.resumeUrl}
                  onClick={() => { setPreviewUrl(fd.resumeUrl); setPreviewTitle('Resume / CV'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.resumeUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.resumeUrl 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100'
                  }`}
                >
                  <FileText className="w-3 h-3" /> Resume
                </button>

                {/* 2. Transcript */}
                <button
                  type="button"
                  disabled={!fd.transcriptUrl}
                  onClick={() => { setPreviewUrl(fd.transcriptUrl); setPreviewTitle('Transcript'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.transcriptUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.transcriptUrl 
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100'
                  }`}
                >
                  <FileText className="w-3 h-3" /> Transcript
                </button>

                {/* 3. Certificate */}
                <button
                  type="button"
                  disabled={!fd.certificateUrl}
                  onClick={() => { setPreviewUrl(fd.certificateUrl); setPreviewTitle('Certificate / เอกสารเพิ่มเติม'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.certificateUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.certificateUrl 
                        ? 'bg-slate-700 text-white border-slate-700 shadow-sm' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                  }`}
                >
                  <FileText className="w-3 h-3" /> Certificate
                </button>

                <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0 self-center"></div>

                {/* 4. ID Card */}
                <button
                  type="button"
                  disabled={!fd.idCardUrl}
                  onClick={() => { setPreviewUrl(fd.idCardUrl); setPreviewTitle('สำเนาบัตรประชาชน'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.idCardUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.idCardUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  บัตรประชาชน
                </button>

                {/* 5. House Registration */}
                <button
                  type="button"
                  disabled={!fd.houseRegUrl}
                  onClick={() => { setPreviewUrl(fd.houseRegUrl); setPreviewTitle('สำเนาทะเบียนบ้าน'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.houseRegUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.houseRegUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  ทะเบียนบ้าน
                </button>

                {/* 6. Degree Cert */}
                <button
                  type="button"
                  disabled={!fd.eduCertificateUrl}
                  onClick={() => { setPreviewUrl(fd.eduCertificateUrl); setPreviewTitle('ใบรับรองวุฒิการศึกษา'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.eduCertificateUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.eduCertificateUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  ใบรับรองวุฒิ
                </button>

                {/* 7. Military */}
                <button
                  type="button"
                  disabled={!fd.militaryCertUrl}
                  onClick={() => { setPreviewUrl(fd.militaryCertUrl); setPreviewTitle('ใบผ่านการเกณฑ์ทหาร'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.militaryCertUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.militaryCertUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  เกณฑ์ทหาร
                </button>

                {/* 8. TOEIC */}
                <button
                  type="button"
                  disabled={!fd.toeicCertUrl}
                  onClick={() => { setPreviewUrl(fd.toeicCertUrl); setPreviewTitle('ผลสอบ TOEIC'); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.toeicCertUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.toeicCertUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  TOEIC
                </button>

                {/* 9. Bank Book */}
                <button
                  type="button"
                  disabled={!fd.bankBookUrl}
                  onClick={() => { setPreviewUrl(fd.bankBookUrl); setPreviewTitle(`สำเนาบัญชีธนาคาร${fd.bankName ? ` (${fd.bankName})` : ''}`); }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition border flex items-center gap-1 shrink-0 ${
                    !fd.bankBookUrl 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-55' 
                      : previewUrl === fd.bankBookUrl 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  บัญชีธนาคาร{fd.bankName ? ` (${fd.bankName})` : ''}
                </button>
              </div>

              {/* View Box Container */}
              <div className="flex-1 min-h-0 w-full mt-3 bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-inner">
                {previewUrl ? (
                  previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.includes('/pdf') ? (
                    <iframe
                      src={previewUrl}
                      title={previewTitle}
                      className="w-full h-full border-none"
                    />
                  ) : (
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-900/90 relative group">
                      <img
                        src={previewUrl}
                        alt={previewTitle}
                        className="max-w-full max-h-full object-contain select-none shadow-lg transition-transform duration-300"
                      />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-white">
                    <FileText className="w-14 h-14 text-slate-300 mb-3 animate-pulse" />
                    {!isDetailLoaded ? (
                      <>
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-slate-400 mt-2 font-medium">กำลังโหลดข้อมูลเอกสาร...</p>
                        </div>
                      </>
                    ) : hasAnyDocuments ? (
                      <>
                        <h5 className="text-sm font-bold text-slate-700">กรุณาเลือกไฟล์เพื่อพรีวิว</h5>
                        <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                          คลิกเลือกประเภทเอกสารที่ต้องการดูตัวอย่างจากปุ่มด้านบน
                        </p>
                      </>
                    ) : (
                      <>
                        <h5 className="text-sm font-bold text-slate-700">ไม่มีเอกสารสำหรับผู้สมัครรายนี้</h5>
                        <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                          ผู้สมัครรายนี้ยังไม่ได้อัปโหลดเอกสารใดๆ หรือยังไม่ได้ขอให้จัดส่งเอกสารใหม่
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>

      {/* Outlook Calendar Confirmation Modal */}
      <Modal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        title="เพิ่มนัดลงในปฏิทิน (Outlook Calendar)"
        size="md"
        footer={null}
      >
        {calendarTargetApp && (
          <div className="space-y-4 text-slate-700">
            {/* Header / Icon */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  รายละเอียดนัดหมายปฏิทิน
                </h4>
                <p className="text-xs text-slate-500">
                  เตรียมข้อมูลผู้สมัครเพื่อเปิดหน้าจอบันทึกปฏิทินของ Outlook Web
                </p>
              </div>
            </div>

            {/* Candidate Summary Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">ผู้สมัคร (Candidate)</span>
                  <span className="font-bold text-slate-800">{calendarTargetApp.full_name || calendarTargetApp.form_data?.firstName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ตำแหน่ง (Position)</span>
                  <span className="font-bold text-slate-800">{calendarTargetApp.position || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">วันเวลาสัมภาษณ์ (Date & Time)</span>
                  <span className="font-bold text-slate-800">
                    {calendarTargetApp.interview_start_time ? (
                      new Date(calendarTargetApp.interview_start_time).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + ' น.'
                    ) : calendarTargetApp.interview_date ? (
                      `${new Date(calendarTargetApp.interview_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} (เวลา 10:00 น.)`
                    ) : '-'}
                  </span>
                </div>
                {calendarTargetApp.teams_meeting_url && (
                  <div className="col-span-2 truncate">
                    <span className="text-slate-400 block">ลิงก์การสัมภาษณ์ (Microsoft Teams Link)</span>
                    <span className="font-semibold text-blue-600 underline font-mono text-[10px] break-all">{calendarTargetApp.teams_meeting_url}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Link Settings */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 block mb-1">
                การตั้งค่าลิงก์ข้อมูลผู้สมัคร (Profile Sharing Link)
              </span>

              {calendarHasShareLink ? (
                <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>
                    พบลิงก์แชร์โปรไฟล์ผู้สมัครแล้ว ระบบจะแนบลิงก์แชร์นี้ลงในคำอธิบายนัดหมายให้อัตโนมัติ เพื่อให้กรรมการผู้ประเมินคลิกเปิดดูเอกสารประวัติได้ทันที
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={calendarCreateShareLink}
                      onChange={(e) => setCalendarCreateShareLink(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 block">สร้างลิงก์แชร์โปรไฟล์ผู้สมัครโดยอัตโนมัติ (แนะนำ)</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        ระบบจะสร้างลิงก์แชร์ภายนอกและแนบไปในรายละเอียดนัดหมายปฏิทิน ช่วยให้กรรมการสามารถคลิกดูประวัติ ผลทดสอบ และเอกสารแนบได้โดยไม่ต้องล็อกอินเข้าระบบ
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <Button 
                variant="outline" 
                onClick={() => setCalendarModalOpen(false)}
                disabled={isProcessingCalendar}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={executeCalendarOpen}
                disabled={isProcessingCalendar}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-200"
              >
                {isProcessingCalendar ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span> กำลังเตรียมการ...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" /> ยืนยันเปิดปฏิทิน Outlook
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
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

      {/* Restore Original Photo Confirm Modal */}
      <Modal
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        title={lang === 'en' ? 'Restore Original Photo' : 'คืนค่ารูปภาพต้นฉบับ'}
        footer={null}
      >
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-gray-700">
              {lang === 'en' 
                ? 'Are you sure you want to restore the original photo? The current cropped version will be deleted.' 
                : 'ยืนยันคืนค่ารูปภาพต้นฉบับ? รูปภาพที่ตัดแต่งปัจจุบันจะถูกลบออก'}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowRestoreConfirm(false)} 
              className="flex-1"
            >
              {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
            </Button>
            <Button 
              onClick={handleRestoreOriginal}
              disabled={isUploadingPhoto}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isUploadingPhoto 
                ? (lang === 'en' ? 'Restoring...' : 'กำลังคืนค่า...') 
                : (lang === 'en' ? 'Restore' : 'ยืนยันคืนค่า')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Cropper Modal */}
      {fd.photoUrl && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageUrl={fd.photoUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(fd.photoUrl)}` : fd.photoUrl}
          onCropComplete={handleCropComplete}
          isUploading={isUploadingPhoto}
        />
      )}
    </>
  );
});
