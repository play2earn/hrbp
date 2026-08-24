import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Film,
  File,
  Download,
  ExternalLink,
  RefreshCw,
  Upload,
  Search,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Database,
  HardDrive,
  Grid,
  List as ListIcon,
  ArrowRight,
  Eye,
  Trash2,
  AlertTriangle,
  Layers,
  X
} from 'lucide-react';

interface S3FileItem {
  name: string;
  docTitle?: string;
  key: string;
  size: number;
  lastModified: string;
  extension: string;
  provider: 's3' | 'r2' | 'supabase';
  proxyUrl: string;
}

interface FolderItem {
  name: string;
  prefix: string;
  refCode?: string;
  isApplicantFolder?: boolean;
  applicantMeta?: {
    id: string;
    fullName: string;
    position: string;
    formData?: any;
  } | null;
}

interface S3StorageTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  currentUser?: any;
  initialPrefix?: string;
}

interface BucketStats {
  totalBytes: number;
  formattedTotalSize: string;
  totalObjects: number;
  quotaCapGB: number;
  quotaCapBytes: number;
  usagePercent: number;
}

interface MigrationAuditRef {
  applicationId: string;
  applicantName: string;
  field: string;
  provider: 's3' | 'r2' | 'supabase' | 'external' | 'unknown';
  statusBucket: 'already_s3' | 'ready_to_migrate' | 'broken_reference' | 'needs_review';
  value: string;
  key?: string;
  bucket?: string;
  path?: string;
  reason: string;
}

interface BrokenApplicationReport {
  applicationId: string;
  applicantName: string;
  status?: string;
  createdAt?: string;
  brokenRefs: number;
  draftRefs: number;
  uniqueMissingFiles: number;
  fields: string[];
  refs: MigrationAuditRef[];
  recommendation: 'request_reupload' | 'review_draft_reference' | 'review_legacy_reference';
}

interface MigrationAuditResult {
  generatedAt: string;
  mode: 'read-only';
  summary: {
    applicationsScanned: number;
    referencesScanned: number;
    affectedApplications: number;
    draftReferenceApplications: number;
    brokenReferenceApplications: number;
    uniqueReadySourceFiles?: number;
    uniqueBrokenSourceFiles?: number;
    uniqueAlreadyS3Files?: number;
    byProvider: Record<string, number>;
    byStatus: Record<string, number>;
  };
  inventories: {
    s3: { bucket: string; totalObjects: number; formattedTotalSize: string };
    r2: { bucket: string; configured: boolean; totalObjects: number; formattedTotalSize: string };
  };
  samples: {
    readyToMigrate: MigrationAuditRef[];
    brokenReferences: MigrationAuditRef[];
    draftReferences: MigrationAuditRef[];
    supabaseLegacy: MigrationAuditRef[];
    needsReview: MigrationAuditRef[];
  };
  reports?: {
    brokenApplications: BrokenApplicationReport[];
  };
  nextRecommendedBatch: 'draftReferences' | 'readyToMigrate' | 'none';
}

export interface DocCategorySetting {
  id: string;
  field: string;
  label: string;
  icon: string;
  order: number;
}

export const DEFAULT_DOC_CATEGORIES: DocCategorySetting[] = [
  { id: '1', field: 'photo_url', label: 'รูปถ่ายหน้าตรง', icon: '📷', order: 1 },
  { id: '2', field: 'idCardUrl', label: 'สำเนาบัตรประชาชน', icon: '🪪', order: 2 },
  { id: '3', field: 'houseRegUrl', label: 'สำเนาทะเบียนบ้าน', icon: '🏠', order: 3 },
  { id: '4', field: 'transcriptUrl', label: 'ใบทรานสคริปต์ (Transcript)', icon: '🎓', order: 4 },
  { id: '5', field: 'eduCertificateUrl', label: 'ใบรับรองวุฒิการศึกษา', icon: '📜', order: 5 },
  { id: '6', field: 'militaryCertUrl', label: 'ใบผ่านการเกณฑ์ทหาร (สด.43)', icon: '🎖️', order: 6 },
  { id: '7', field: 'toeicCertUrl', label: 'ผลสอบภาษา (TOEIC / English)', icon: '🌐', order: 7 },
  { id: '8', field: 'bankBookUrl', label: 'สำเนาบัญชีธนาคาร', icon: '💳', order: 8 },
  { id: '9', field: 'resume_url', label: 'เรซูเม่ (Resume / CV)', icon: '📄', order: 9 },
  { id: '10', field: 'certificateUrl', label: 'ใบรับรอง / ประกาศนียบัตร', icon: '🏅', order: 10 },
  { id: '11', field: 'otherDocsUrl', label: 'เอกสารประกอบอื่นๆ', icon: '📎', order: 11 },
];

export const S3StorageTab: React.FC<S3StorageTabProps> = ({
  showToast,
  currentUser,
  initialPrefix = '',
}) => {
  const [currentPrefix, setCurrentPrefix] = useState<string>(initialPrefix);

  // When initialPrefix or currentPrefix changes, jump to prefix and reset search query
  useEffect(() => {
    if (initialPrefix !== undefined && initialPrefix !== currentPrefix) {
      setCurrentPrefix(initialPrefix);
    }
    setSearchQuery('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrefix, currentPrefix]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<S3FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; prefix: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [migratingKey, setMigratingKey] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [bucketStats, setBucketStats] = useState<BucketStats | null>(null);
  const [migrationAudit, setMigrationAudit] = useState<MigrationAuditResult | null>(null);
  const [loadingMigrationAudit, setLoadingMigrationAudit] = useState<boolean>(false);
  const [migratingReadyBatch, setMigratingReadyBatch] = useState<boolean>(false);
  const [readyMigrateStep, setReadyMigrateStep] = useState<string>('');
  const [showReadyMigrateConfirm, setShowReadyMigrateConfirm] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Multi-select & Delete Confirm State
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    open: boolean;
    files: S3FileItem[];
    isDeleting: boolean;
  }>({ open: false, files: [], isDeleting: false });

  // Trash Bin State
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);
  const [trashItems, setTrashItems] = useState<any[]>([]);
  const [loadingTrash, setLoadingTrash] = useState<boolean>(false);
  const [actionKey, setActionKey] = useState<string | null>(null);

  // Category Order Settings State
  const [showCategorySettings, setShowCategorySettings] = useState<boolean>(false);
  const [docCategories, setDocCategories] = useState<DocCategorySetting[]>(() => {
    try {
      const saved = localStorage.getItem('hr_drive_doc_category_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DOC_CATEGORIES;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [currentPrefix, searchQuery]);

  const fetchTrashItems = async () => {
    setLoadingTrash(true);
    try {
      const res = await fetch('/api/trash');
      const data = await res.json();
      if (data.success) {
        setTrashItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTrash(false);
    }
  };

  // Open confirm modal for single file
  const handleSoftDelete = (file: S3FileItem) => {
    setConfirmDeleteModal({ open: true, files: [file], isDeleting: false });
  };

  // Open confirm modal for all selected files
  const handleBulkDelete = () => {
    const toDelete = filteredFiles.filter((f) => selectedKeys.has(f.key));
    if (toDelete.length === 0) return;
    setConfirmDeleteModal({ open: true, files: toDelete, isDeleting: false });
  };

  // Execute soft-delete for all files in the modal
  const executeDelete = async () => {
    const { files } = confirmDeleteModal;
    setConfirmDeleteModal((prev) => ({ ...prev, isDeleting: true }));
    let successCount = 0;
    for (const file of files) {
      try {
        const res = await fetch('/api/trash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', key: file.key }),
        });
        const data = await res.json();
        if (data.success) successCount++;
      } catch {}
    }
    setConfirmDeleteModal({ open: false, files: [], isDeleting: false });
    setSelectedKeys(new Set());
    if (successCount > 0) {
      showToast(`ย้าย ${successCount} ไฟล์ไปถังขยะเรียบร้อยแล้ว`, 'success');
      fetchS3Objects(currentPrefix);
    } else {
      showToast('เกิดข้อผิดพลาดในการลบไฟล์', 'error');
    }
  };


  const handleRestoreTrash = async (key: string) => {
    setActionKey(key);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', key }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('กู้คืนไฟล์สำเร็จ!', 'success');
        fetchTrashItems();
        fetchS3Objects(currentPrefix);
      } else {
        showToast(data.error || 'กู้คืนไฟล์ล้มเหลว', 'error');
      }
    } catch (e) {
      showToast('เกิดข้อผิดพลาดในการกู้คืนไฟล์', 'error');
    } finally {
      setActionKey(null);
    }
  };

  const handlePurgeTrash = async (key: string) => {
    if (!confirm('ยืนยันลบไฟล์นี้ถาวรจากถังขยะ? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    setActionKey(key);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge', key }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('ลบไฟล์ถาวรเรียบร้อยแล้ว', 'success');
        fetchTrashItems();
      } else {
        showToast(data.error || 'ลบไฟล์ถาวรล้มเหลว', 'error');
      }
    } catch (e) {
      showToast('เกิดข้อผิดพลาดในการลบไฟล์ถาวร', 'error');
    } finally {
      setActionKey(null);
    }
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const updated = [...docCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    updated.forEach((cat, idx) => {
      cat.order = idx + 1;
    });

    setDocCategories(updated);
    localStorage.setItem('hr_drive_doc_category_settings', JSON.stringify(updated));
    showToast('อัปเดตลำดับการจัดเรียงเอกสารเรียบร้อยแล้ว', 'success');
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const folder = currentPrefix ? currentPrefix.replace(/\/$/, '') : 'hrd-documents';

        const res = await fetch('/api/upload-s3', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            fileName: file.name,
            fileType: file.type || 'application/pdf',
            folder,
          }),
        });

        const data = await res.json();
        if (data.success) {
          showToast(`อัปโหลด ${file.name} เข้า AWS S3 สำเร็จ!`, 'success');
          fetchS3Objects(currentPrefix);
        } else {
          showToast(data.error || 'Upload failed', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(err.message || 'Upload error', 'error');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const fetchMigrationAudit = async () => {
    setLoadingMigrationAudit(true);
    try {
      const res = await fetch('/api/storage-migration-audit');
      const data = await res.json();
      if (data.success) {
        setMigrationAudit(data);
        showToast('สแกน Migration Center สำเร็จ — ยังไม่มีการย้ายหรือลบไฟล์', 'success');
      } else {
        showToast(data.error || 'Migration audit failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Migration audit network error', 'error');
    } finally {
      setLoadingMigrationAudit(false);
    }
  };

  const executeMigrateReadyBatch = async () => {
    if (!migrationAudit) return;
    setShowReadyMigrateConfirm(false);
    setMigratingReadyBatch(true);
    setReadyMigrateStep('เตรียมรายการ ready และข้าม broken/draft applications...');
    try {
      setReadyMigrateStep('กำลัง copy ไฟล์จาก R2 ไป AWS S3 และ verify ขนาดไฟล์...');
      const res = await fetch('/api/storage-migration-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate-ready-batch', limit: 10 }),
      });
      const data = await res.json();
      if (data.success) {
        setReadyMigrateStep(`อัปเดต DB สำเร็จ ${data.migratedApplications || 0} applications / ${data.migratedRefs || 0} refs กำลังสแกนซ้ำ...`);
        showToast(`Migrate สำเร็จ ${data.migratedApplications || 0} applications / ${data.migratedRefs || 0} refs — ไม่ลบ R2 source`, 'success');
        await fetchMigrationAudit();
        setReadyMigrateStep('รีเฟรช HR Drive...');
        fetchS3Objects(currentPrefix);
      } else {
        showToast(data.error || 'Batch migration failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Batch migration network error', 'error');
    } finally {
      setMigratingReadyBatch(false);
      setReadyMigrateStep('');
    }
  };

  // Preview State
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Fetch S3 Objects from Serverless API
  const fetchS3Objects = useCallback(async (prefix: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/s3-explorer?prefix=${encodeURIComponent(prefix)}`);
      const data = await res.json();

      if (data.success) {
        let loadedFolders: FolderItem[] = data.folders || [];
        setFiles(data.files || []);
        let loadedBreadcrumbs = data.breadcrumbs || [];

        if (data.bucketStats) {
          setBucketStats(data.bucketStats);
        }

        // Client-side fallback for candidate name mapping if folder.applicantMeta is missing
        const unmappedApplicantFolders = loadedFolders.filter(
          (f) => f.isApplicantFolder && !f.applicantMeta
        );

        if (unmappedApplicantFolders.length > 0) {
          const unmappedIds = unmappedApplicantFolders.map((f) => f.name.trim());
          try {
            const { data: dbApps } = await supabase
              .from('applications')
              .select('id, full_name, first_name, last_name, title, position, form_data')
              .in('id', unmappedIds);

            if (dbApps && dbApps.length > 0) {
              const appMap: Record<string, any> = {};
              dbApps.forEach((app: any) => {
                const fd = app.form_data || {};
                const rawFullName = app.full_name ? String(app.full_name).trim() : '';
                const colName = [app.title, app.first_name, app.last_name].filter(Boolean).join(' ').trim();
                const thaiName = [fd.prefix || fd.title || fd.titleTh, fd.firstName || fd.firstNameTh, fd.lastName || fd.lastNameTh].filter(Boolean).join(' ').trim();
                const engName = [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ').trim();
                const altName = fd.name || fd.applicantName || fd.fullName || '';

                const fullName = rawFullName || colName || thaiName || engName || altName || 'ไม่ระบุชื่อ';
                const position = app.position || fd.position || fd.positionEn || 'ไม่ระบุตำแหน่ง';

                appMap[String(app.id).trim()] = {
                  id: String(app.id),
                  fullName,
                  position,
                  formData: fd,
                };
              });

              loadedFolders = loadedFolders.map((f) => {
                const cleanId = f.name.trim();
                if (f.isApplicantFolder && !f.applicantMeta && appMap[cleanId]) {
                  return { ...f, applicantMeta: appMap[cleanId] };
                }
                return f;
              });
            }
          } catch (fallbackErr) {
            console.error('[HR Drive] Client-side applicant mapping fallback error:', fallbackErr);
          }
        }

        setFolders(loadedFolders);

        // Fallback for single candidate folder breadcrumb & files applicantName
        const pathSegments = prefix.split('/').filter(Boolean);
        if (pathSegments.length >= 2 && pathSegments[0] === 'applicants') {
          const currentAppId = pathSegments[1].trim();
          try {
            const { data: dbApp } = await supabase
              .from('applications')
              .select('id, full_name, first_name, last_name, title, form_data')
              .eq('id', currentAppId)
              .maybeSingle();

            if (dbApp) {
              const fd = dbApp.form_data || {};
              const rawFullName = dbApp.full_name ? String(dbApp.full_name).trim() : '';
              const colName = [dbApp.title, dbApp.first_name, dbApp.last_name].filter(Boolean).join(' ').trim();
              const thaiName = [fd.prefix || fd.title || fd.titleTh, fd.firstName || fd.firstNameTh, fd.lastName || fd.lastNameTh].filter(Boolean).join(' ').trim();
              const engName = [fd.titleEn, fd.firstNameEn, fd.lastNameEn].filter(Boolean).join(' ').trim();
              const altName = fd.name || fd.applicantName || fd.fullName || '';

              const fullName = rawFullName || colName || thaiName || engName || altName || '';
              if (fullName) {
                loadedBreadcrumbs = loadedBreadcrumbs.map((bc, idx) => {
                  if (idx === loadedBreadcrumbs.length - 1) {
                    return { ...bc, name: `👤 ${fullName}` };
                  }
                  return bc;
                });

                let loadedFiles = data.files || [];
                loadedFiles = loadedFiles.map((f: any) => ({
                  ...f,
                  applicantName: fullName,
                  applicantId: currentAppId,
                }));
                setFiles(loadedFiles);
              }
            }
          } catch (appErr) {
            console.error('[HR Drive] Breadcrumb fallback error:', appErr);
          }
        }

        setBreadcrumbs(loadedBreadcrumbs);
      } else {
        showToast(data.error || 'Failed to load S3 objects', 'error');
      }
    } catch (err: any) {
      console.error('Error fetching S3 objects:', err);
      showToast('Network error loading S3 objects', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchS3Objects(currentPrefix);
  }, [currentPrefix, fetchS3Objects]);

  // Handle Single File Migration (R2/Supabase -> AWS S3)
  const handleMigrateFile = async (file: S3FileItem) => {
    setMigratingKey(file.key);
    try {
      const res = await fetch('/api/migrate-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: file.proxyUrl,
          targetFolder: currentPrefix || 'hrd-documents',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Migrated ${file.name} to AWS S3 successfully!`, 'success');
        fetchS3Objects(currentPrefix);
      } else {
        showToast(data.error || 'Migration failed', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Migration network error', 'error');
    } finally {
      setMigratingKey(null);
    }
  };

  // Helper for File Icon
  const getFileIcon = (ext: string) => {
    switch (ext) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'mp4':
      case 'mov':
        return <Film className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format Bytes
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatCount = (value?: number) => Number(value || 0).toLocaleString('th-TH');

  const renderAuditSample = (items: MigrationAuditRef[], emptyText: string) => {
    if (items.length === 0) {
      return <p className="text-[11px] text-slate-400">{emptyText}</p>;
    }
    return (
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {items.slice(0, 6).map((item, idx) => (
          <div key={`${item.applicationId}-${item.field}-${idx}`} className="rounded-lg border border-slate-100 bg-white/80 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[11px] text-slate-800 truncate" title={item.applicantName}>
                {item.applicantName}
              </span>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">{item.applicationId.slice(0, 8)}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500 truncate" title={item.key || item.path || item.reason}>
              {item.field} • {item.key || `${item.bucket || item.provider}/${item.path || ''}` || item.reason}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const recommendationLabel = (value: BrokenApplicationReport['recommendation']) => {
    if (value === 'review_draft_reference') return 'ตรวจ draft / ขออัปโหลดใหม่';
    if (value === 'request_reupload') return 'ขอเอกสารใหม่';
    return 'ตรวจ legacy ref';
  };

  // Open Preview
  const handlePreview = (file: S3FileItem) => {
    if (file.extension === 'pdf') {
      setPreviewPdfUrl(file.proxyUrl);
      setPreviewPdfTitle(file.name);
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(file.extension)) {
      setPreviewImageUrl(file.proxyUrl);
    } else {
      window.open(file.proxyUrl, '_blank');
    }
  };

  // Helper to resolve sort order for a file
  // Priority: 1) user-customized docCategories in localStorage, 2) API-provided sortOrder
  const getFileSortOrder = (file: S3FileItem): number => {
    const fileAny = file as any;
    // Check if user has customized order via docCategories
    const customMatch = docCategories.find((cat) =>
      cat.field === fileAny.field ||
      (file.docTitle || file.name).toLowerCase().includes(cat.label.toLowerCase())
    );
    if (customMatch) return customMatch.order;
    // Fall back to API-level sortOrder
    return fileAny.sortOrder ?? 999;
  };

  // Filtered & Sorted Lists
  const filteredFolders = folders.filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchName = f.name.toLowerCase().includes(q);
    const matchRef = f.refCode ? f.refCode.toLowerCase().includes(q) : false;
    const matchAppName = f.applicantMeta?.fullName
      ? f.applicantMeta.fullName.toLowerCase().includes(q)
      : false;
    const matchAppPos = f.applicantMeta?.position
      ? f.applicantMeta.position.toLowerCase().includes(q)
      : false;
    return matchName || matchRef || matchAppName || matchAppPos;
  });

  const filteredFiles = files
    .filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const fileAny = f as any;
      const matchName = f.name.toLowerCase().includes(q);
      const matchDocTitle = (f.docTitle || fileAny.docLabel || '').toLowerCase().includes(q);
      const matchApplicantName = fileAny.applicantName
        ? fileAny.applicantName.toLowerCase().includes(q)
        : false;
      const matchApplicantId = fileAny.applicantId
        ? fileAny.applicantId.toLowerCase().includes(q)
        : false;

      // If inside an applicant folder and search query matches the applicant's name/ID or breadcrumbs, show all files inside
      const isInsideApplicantFolder = currentPrefix.startsWith('applicants/') && currentPrefix.split('/').filter(Boolean).length >= 2;
      const currentFolderName = breadcrumbs[breadcrumbs.length - 1]?.name || '';
      const matchCurrentFolder = isInsideApplicantFolder && (
        currentFolderName.toLowerCase().includes(q) ||
        currentPrefix.toLowerCase().includes(q)
      );

      return matchName || matchDocTitle || matchApplicantName || matchApplicantId || matchCurrentFolder;
    })
    .sort((a, b) => getFileSortOrder(a) - getFileSortOrder(b));

  const allPaginatedItems = [
    ...filteredFolders.map((f) => ({ type: 'folder' as const, data: f })),
    ...filteredFiles.map((f) => ({ type: 'file' as const, data: f })),
  ];

  const totalItems = allPaginatedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageItems = allPaginatedItems.slice(startIndex, startIndex + pageSize);

  const displayedFolders = currentPageItems.filter((item) => item.type === 'folder').map((i) => i.data);
  const displayedFiles = currentPageItems.filter((item) => item.type === 'file').map((i) => i.data);

  return (
    <div className="space-y-6">
      {/* Top Banner: Storage Info & Multi-Cloud Visualizer */}
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-indigo-50/50 border border-slate-200/80 rounded-2xl p-6 shadow-sm text-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900">HR Drive</h2>
              <span className="bg-amber-100/80 text-amber-800 border border-amber-300/60 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                AWS S3 Native Explorer
              </span>
            </div>
            <p className="text-sm text-slate-600">
              บริหารจัดการไฟล์ผู้สมัครและเอกสาร HRD บนระบบจัดเก็บไฟล์คลาวด์ความปลอดภัยสูง
            </p>
          </div>

          {/* Quick Storage Stats */}
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur border border-slate-200/80 shadow-xs rounded-xl px-4 py-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-slate-500">AWS S3:</span>
              <span className="font-semibold text-slate-900">Primary Storage</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-500">Cloudflare R2:</span>
              <span className="font-semibold text-slate-700">Active</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">Supabase:</span>
              <span className="font-semibold text-slate-700">Legacy</span>
            </div>
          </div>
        </div>

        {/* Bucket Storage Usage & Capacity Metrics */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Storage Used & Progress */}
          <div className="bg-white/90 border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-4 h-4 text-amber-500 shrink-0" /> พื้นที่ใช้งานรวม (AWS S3)
              </span>
              <span className="font-mono text-amber-600 font-bold text-xs">
                {bucketStats ? bucketStats.formattedTotalSize : 'กำลังคำนวณ...'}
              </span>
            </div>

            {/* Usage Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1.5, bucketStats ? bucketStats.usagePercent : 0)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>โควต้าเป้าหมาย: <strong className="text-slate-700">{bucketStats ? `${bucketStats.quotaCapGB} GB` : '10 GB'}</strong></span>
              <span className="font-mono font-bold text-amber-600">{bucketStats ? `${bucketStats.usagePercent}%` : '0%'}</span>
            </div>
          </div>

          {/* Card 2: Total Active Objects */}
          <div className="bg-white/90 border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-blue-500 shrink-0" /> จำนวนไฟล์บน S3
              </span>
              <span className="font-mono text-blue-600 font-bold text-sm">
                {bucketStats ? `${bucketStats.totalObjects} ไฟล์` : '0 ไฟล์'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              ไฟล์ผู้สมัครงาน & เอกสารกลางระบบ HRD
            </p>
          </div>

          {/* Card 3: Storage Region & Health Status */}
          <div className="bg-white/90 border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> สถานะ Storage Bucket
              </span>
              <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Normal
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              AWS Region: <span className="font-mono text-slate-700 font-semibold">ap-southeast-1</span>
            </p>
          </div>
        </div>

        {/* Quick Folder Jump Shortcuts */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">ทางลัดโฟลเดอร์:</span>
          <button
            onClick={() => setCurrentPrefix('')}
            className={`px-3 py-1 rounded-lg border transition-all shadow-xs ${
              currentPrefix === ''
                ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            🏠 Root
          </button>
          <button
            onClick={() => setCurrentPrefix('applicants/')}
            className={`px-3 py-1 rounded-lg border transition-all shadow-xs ${
              currentPrefix.startsWith('applicants')
                ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            📁 applicants/ (ผู้สมัครงาน)
          </button>
          <button
            onClick={() => setCurrentPrefix('hrd-documents/')}
            className={`px-3 py-1 rounded-lg border transition-all shadow-xs ${
              currentPrefix.startsWith('hrd-documents')
                ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            📁 hrd-documents/ (เอกสารกลาง)
          </button>
          <button
            onClick={() => setCurrentPrefix('drafts/')}
            className={`px-3 py-1 rounded-lg border transition-all shadow-xs ${
              currentPrefix.startsWith('drafts')
                ? 'bg-amber-100/90 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            📁 drafts/ (ไฟล์ร่างค้าง)
          </button>
        </div>
      </div>

      {/* Migration Center — read-only legacy storage audit */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900">Migration Center</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">
                Audit-only
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              ตรวจไฟล์ legacy ที่ยังชี้ Cloudflare R2 / Supabase Storage ก่อนทยอยย้ายเข้า AWS S3 — ปุ่มนี้ไม่ย้ายไฟล์ ไม่แก้ DB และไม่ลบ source
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={fetchMigrationAudit}
              disabled={loadingMigrationAudit || migratingReadyBatch}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMigrationAudit ? 'animate-spin' : ''}`} />
              {loadingMigrationAudit ? 'กำลังสแกน...' : 'สแกนสถานะ Migration'}
            </button>
            <button
              onClick={() => setShowReadyMigrateConfirm(true)}
              disabled={!migrationAudit || migratingReadyBatch || loadingMigrationAudit}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors"
              title="ย้ายเฉพาะ ready refs ครั้งละ 10 applications; ข้าม broken/draft และไม่ลบ R2 source"
            >
              <Upload className={`w-4 h-4 ${migratingReadyBatch ? 'animate-bounce' : ''}`} />
              {migratingReadyBatch ? 'กำลัง migrate...' : 'Migrate ready 10 apps'}
            </button>
          </div>
        </div>

        {migrationAudit ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Applications scanned</p>
                <p className="mt-1 text-xl font-black text-slate-900">{formatCount(migrationAudit.summary.applicationsScanned)}</p>
                <p className="text-[10px] text-slate-400">refs: {formatCount(migrationAudit.summary.referencesScanned)}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] text-amber-700">Ready to migrate</p>
                <p className="mt-1 text-xl font-black text-amber-700">{formatCount(migrationAudit.summary.byStatus.ready_to_migrate)}</p>
                <p className="text-[10px] text-amber-600">
                  refs • {formatCount(migrationAudit.summary.uniqueReadySourceFiles)} unique files
                </p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-[11px] text-red-700">Broken refs</p>
                <p className="mt-1 text-xl font-black text-red-700">{formatCount(migrationAudit.summary.byStatus.broken_reference)}</p>
                <p className="text-[10px] text-red-600">
                  {formatCount(migrationAudit.summary.brokenReferenceApplications)} apps • {formatCount(migrationAudit.summary.uniqueBrokenSourceFiles)} files
                </p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-[11px] text-blue-700">Draft refs</p>
                <p className="mt-1 text-xl font-black text-blue-700">{formatCount(migrationAudit.summary.draftReferenceApplications)}</p>
                <p className="text-[10px] text-blue-600">ควรจัดการก่อน</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[11px] text-emerald-700">Already S3</p>
                <p className="mt-1 text-xl font-black text-emerald-700">{formatCount(migrationAudit.summary.byStatus.already_s3)}</p>
                <p className="text-[10px] text-emerald-600">
                  refs • {formatCount(migrationAudit.summary.uniqueAlreadyS3Files)} unique files
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowRight className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-900">ตัวอย่างที่พร้อมย้าย</h4>
                </div>
                {renderAuditSample(migrationAudit.samples.readyToMigrate, 'ยังไม่พบ R2 refs ที่พร้อมย้าย')}
              </div>
              <div className="rounded-xl border border-red-100 bg-red-50/40 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="text-xs font-bold text-red-900">ตัวอย่าง broken refs</h4>
                </div>
                {renderAuditSample(migrationAudit.samples.brokenReferences, 'ยังไม่พบ broken refs จาก R2 listing')}
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-blue-900">Supabase / needs review</h4>
                </div>
                {renderAuditSample(
                  migrationAudit.samples.supabaseLegacy.length > 0
                    ? migrationAudit.samples.supabaseLegacy
                    : migrationAudit.samples.needsReview,
                  'ยังไม่พบ Supabase legacy refs ใน sample'
                )}
              </div>
            </div>

            {(migrationAudit.reports?.brokenApplications?.length || 0) > 0 && (
              <div className="rounded-xl border border-red-100 bg-white overflow-hidden">
                <div className="px-3.5 py-3 bg-red-50/70 border-b border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-red-900">Broken / Draft Detail Report</h4>
                      <p className="text-[11px] text-red-700">
                        รายการนี้ควรเคลียร์ก่อนเริ่ม batch migrate จริง เพราะ source หายหรือยังชี้ draft เก่า
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-red-500 bg-white border border-red-100 rounded-lg px-2 py-1">
                    {formatCount(migrationAudit.reports?.brokenApplications?.length)} applications
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">ผู้สมัคร</th>
                        <th className="px-3 py-2.5">Broken</th>
                        <th className="px-3 py-2.5">Draft</th>
                        <th className="px-3 py-2.5">Fields</th>
                        <th className="px-3 py-2.5">ตัวอย่าง path ที่หาย</th>
                        <th className="px-3 py-2.5">แนะนำ</th>
                        <th className="px-3 py-2.5 text-right">คำสั่ง</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {migrationAudit.reports?.brokenApplications.slice(0, 30).map((item) => {
                        const firstRef = item.refs[0];
                        return (
                          <tr key={item.applicationId} className="hover:bg-red-50/30">
                            <td className="px-3 py-2.5 align-top min-w-[220px]">
                              <div className="font-bold text-slate-900">{item.applicantName}</div>
                              <div className="font-mono text-[10px] text-slate-400">{item.applicationId}</div>
                              {item.status && (
                                <div className="mt-1 inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                                  {item.status}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 align-top">
                              <span className="font-black text-red-700">{formatCount(item.brokenRefs)}</span>
                              <span className="block text-[10px] text-slate-400">{formatCount(item.uniqueMissingFiles)} files</span>
                            </td>
                            <td className="px-3 py-2.5 align-top">
                              <span className={`font-black ${item.draftRefs > 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                                {formatCount(item.draftRefs)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 align-top min-w-[180px]">
                              <div className="flex flex-wrap gap-1">
                                {item.fields.slice(0, 5).map((field) => (
                                  <span key={field} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                                    {field.replace(/^form_data\./, '')}
                                  </span>
                                ))}
                                {item.fields.length > 5 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                                    +{item.fields.length - 5}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 align-top min-w-[260px] max-w-[360px]">
                              <div className="font-mono text-[10px] text-slate-500 truncate" title={firstRef?.key || firstRef?.path || firstRef?.value || ''}>
                                {firstRef?.key || firstRef?.path || firstRef?.value || '—'}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate" title={firstRef?.reason || ''}>
                                {firstRef?.reason || '—'}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 align-top min-w-[150px]">
                              <span className={`inline-flex px-2 py-1 rounded-lg border text-[10px] font-semibold ${
                                item.recommendation === 'request_reupload'
                                  ? 'bg-red-50 border-red-200 text-red-700'
                                  : item.recommendation === 'review_draft_reference'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}>
                                {recommendationLabel(item.recommendation)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 align-top text-right">
                              <button
                                onClick={() => {
                                  setCurrentPrefix(`applicants/${item.applicationId}/`);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-semibold"
                                title="เปิด folder ผู้สมัครใน HR Drive"
                              >
                                <FolderOpen className="w-3 h-3" />
                                เปิด HR Drive
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {(migrationAudit.reports?.brokenApplications?.length || 0) > 30 && (
                  <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
                    แสดง 30 รายการแรกจากทั้งหมด {formatCount(migrationAudit.reports?.brokenApplications?.length)} applications
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[11px] text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Inventory:</span>{' '}
                S3 {formatCount(migrationAudit.inventories.s3.totalObjects)} objects / {migrationAudit.inventories.s3.formattedTotalSize}
                {' • '}
                R2 {migrationAudit.inventories.r2.configured ? `${formatCount(migrationAudit.inventories.r2.totalObjects)} objects / ${migrationAudit.inventories.r2.formattedTotalSize}` : 'not configured'}
              </div>
              <div className="font-mono text-slate-400">
                Last audit: {new Date(migrationAudit.generatedAt).toLocaleString('th-TH')}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500">
            กด “สแกนสถานะ Migration” เพื่อดู backlog ก่อนย้ายจริง แนะนำให้เริ่มจาก draft refs และ broken refs ก่อนเสมอ
          </div>
        )}
      </div>

      {/* Ready Batch Migration Confirm Modal */}
      {showReadyMigrateConfirm && migrationAudit && (
        <div
          className="fixed inset-0 z-[120000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowReadyMigrateConfirm(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">ยืนยัน Batch Migration</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    ย้ายเฉพาะกลุ่ม ready เข้า AWS S3 ครั้งละ 10 applications แบบปลอดภัย
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="text-[10px] text-amber-700">Ready refs</p>
                  <p className="text-lg font-black text-amber-700">{formatCount(migrationAudit.summary.byStatus.ready_to_migrate)}</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                  <p className="text-[10px] text-red-700">Excluded</p>
                  <p className="text-lg font-black text-red-700">{formatCount(migrationAudit.summary.brokenReferenceApplications)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-[10px] text-emerald-700">Source delete</p>
                  <p className="text-lg font-black text-emerald-700">No</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5">
                <p>• ระบบจะ migrate สูงสุด <strong>10 applications</strong> ต่อรอบ</p>
                <p>• ระบบจะข้าม broken/draft applications อัตโนมัติ</p>
                <p>• ระบบจะ copy R2 → S3, verify size แล้วจึง update DB</p>
                <p>• ระบบจะ <strong>ไม่ลบไฟล์ R2 ต้นทาง</strong> ในรอบนี้</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowReadyMigrateConfirm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={executeMigrateReadyBatch}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  ยืนยัน migrate 10 apps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ready Batch Migration Progress Modal */}
      {migratingReadyBatch && (
        <div className="fixed inset-0 z-[120000] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5 text-amber-700 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">กำลัง migrate เข้า AWS S3</h3>
                  <p className="mt-1 text-xs text-slate-600">กรุณารอสักครู่ อย่าปิดหน้านี้ระหว่างทำงาน</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 animate-pulse" />
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                {readyMigrateStep || 'กำลังดำเนินการ...'}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <p className="text-[10px] text-slate-500">Batch</p>
                  <p className="font-black text-slate-900">10 apps</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <p className="text-[10px] text-slate-500">Broken/Draft</p>
                  <p className="font-black text-slate-900">Skip</p>
                </div>
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-2">
                  <p className="text-[10px] text-slate-500">R2 source</p>
                  <p className="font-black text-slate-900">Keep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Explorer Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        {/* Navigation & Controls Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Breadcrumbs */}
          <div className="flex items-center flex-wrap gap-1 text-sm font-medium text-slate-600">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.prefix}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                <button
                  onClick={() => setCurrentPrefix(b.prefix)}
                  className={`hover:text-amber-600 transition-colors ${
                    idx === breadcrumbs.length - 1
                      ? 'text-slate-900 font-bold'
                      : ''
                  }`}
                >
                  {b.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Controls: Search, View Mode, Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อไฟล์ / โฟลเดอร์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-800 placeholder-slate-400"
              />
            </div>

            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors bg-white shadow-xs"
              title="สลับมุมมอง"
            >
              {viewMode === 'table' ? <Grid className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => fetchS3Objects(currentPrefix)}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors bg-white shadow-xs"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setShowCategorySettings(true);
              }}
              className="px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              title="ตั้งค่าลำดับการแสดงผลเอกสาร"
            >
              <span>⚙️</span> เรียงลำดับเอกสาร
            </button>

            <button
              onClick={() => {
                setShowTrashModal(true);
                fetchTrashItems();
              }}
              className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              title="เปิดถังขยะ (.trash/)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" /> ถังขยะ (.trash)
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer select-none">
              <Upload className={`w-4 h-4 ${isUploadingFile ? 'animate-bounce' : ''}`} />
              {isUploadingFile ? 'กำลังอัปโหลด...' : '📤 อัปโหลดไฟล์เข้า S3'}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.png,.webp,.doc,.docx"
                disabled={isUploadingFile}
                onChange={handleDirectUpload}
              />
            </label>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-sm text-slate-600 font-medium">กำลังโหลดข้อมูลไฟล์จาก AWS S3...</p>
          </div>
        ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 border-2 border-dashed border-slate-200 rounded-xl">
            <FolderOpen className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-700">ไม่พบไฟล์หรือโฟลเดอร์ในตำแหน่งนี้</p>
            <p className="text-xs text-slate-500">เลือกโฟลเดอร์อื่นหรือทดลองอัปโหลดไฟล์ใหม่</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto">
            {/* Bulk-delete toolbar — shown when files are selected */}
            {selectedKeys.size > 0 && (
              <div className="mb-2 flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-sm font-semibold text-red-700">
                  เลือกแล้ว {selectedKeys.size} ไฟล์
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ย้ายไปถังขยะ ({selectedKeys.size} ไฟล์)
                </button>
                <button
                  onClick={() => setSelectedKeys(new Set())}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            )}
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {/* Select All checkbox */}
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded accent-red-500 cursor-pointer"
                      checked={filteredFiles.length > 0 && filteredFiles.every((f) => selectedKeys.has(f.key))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeys(new Set(filteredFiles.map((f) => f.key)));
                        } else {
                          setSelectedKeys(new Set());
                        }
                      }}
                      title="เลือกทั้งหมด"
                    />
                  </th>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4">ชื่อไฟล์ / โฟลเดอร์</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">ขนาด</th>
                  <th className="py-3 px-4">แก้ไขล่าสุด</th>
                  <th className="py-3 px-4 text-right">คำสั่ง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Folders */}
                {displayedFolders.map((folder) => (
                  <tr
                    key={folder.prefix}
                    onClick={() => setCurrentPrefix(folder.prefix)}
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3"><span className="w-3.5 h-3.5 block" /></td>
                    <td className="py-3 px-3 text-center text-xs text-slate-400">—</td>
                    <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-3">
                      <Folder className="w-5 h-5 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col min-w-0">
                        {folder.applicantMeta ? (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                                <span>👤</span> {folder.applicantMeta.fullName}
                              </span>
                              {folder.applicantMeta.position && (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                  {folder.applicantMeta.position}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono truncate" title={folder.name}>
                              Folder ID: {folder.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {folder.name}
                            </span>
                            {folder.refCode && (
                              <span className="text-[11px] text-slate-400 font-mono truncate" title={folder.refCode}>
                                {folder.refCode}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <span className="bg-amber-100 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full font-semibold">
                        Directory
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">—</td>
                    <td className="py-3 px-4 text-xs text-slate-400">—</td>
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 inline-block text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </td>
                  </tr>
                ))}

                {/* Files */}
                {displayedFiles.map((file, fileIdx) => {
                  const isSelected = selectedKeys.has(file.key);
                  return (
                    <tr
                      key={file.key}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-red-50/80'
                          : 'hover:bg-amber-50/30'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded accent-red-500 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => {
                            const next = new Set(selectedKeys);
                            if (e.target.checked) next.add(file.key);
                            else next.delete(file.key);
                            setSelectedKeys(next);
                          }}
                        />
                      </td>
                      {/* Order Number */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold font-mono text-slate-600">
                          {String((file as any).sortOrder && (file as any).sortOrder < 50
                            ? (file as any).sortOrder
                            : fileIdx + 1
                          ).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 flex items-center gap-3">
                        {getFileIcon(file.extension)}
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            {file.docTitle || file.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3 text-amber-500" />
                          AWS S3
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                        {formatSize(file.size)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(file.lastModified).toLocaleDateString('th-TH', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button onClick={() => handlePreview(file)} className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="เปิดดูไฟล์">
                          <Eye className="w-4 h-4" />
                        </button>
                        <a href={`${file.proxyUrl}&download=true`} download={file.name} className="inline-block p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ดาวน์โหลด">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleSoftDelete(file)} className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ย้ายไปถังขยะ">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedFolders.map((folder) => (
              <div
                key={folder.prefix}
                onClick={() => setCurrentPrefix(folder.prefix)}
                className="bg-slate-50/80 border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/30 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md text-center space-y-2 group"
              >
                <Folder className="w-10 h-10 mx-auto text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform" />
                {folder.applicantMeta ? (
                  <>
                    <p className="text-xs font-bold text-slate-900 truncate" title={folder.applicantMeta.fullName}>
                      👤 {folder.applicantMeta.fullName}
                    </p>
                    {folder.applicantMeta.position && (
                      <p className="text-[10px] text-indigo-600 font-medium truncate" title={folder.applicantMeta.position}>
                        {folder.applicantMeta.position}
                      </p>
                    )}
                    <p className="text-[9px] text-slate-400 font-mono truncate" title={folder.name}>
                      ID: {folder.name}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-800 truncate" title={folder.name}>
                      {folder.name}
                    </p>
                    {folder.refCode && (
                      <p className="text-[10px] text-slate-400 font-mono truncate" title={folder.refCode}>
                        {folder.refCode}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}

            {displayedFiles.map((file) => (
              <div
                key={file.key}
                className="bg-white border border-slate-200/80 hover:border-amber-400 rounded-xl p-3 flex flex-col justify-between space-y-2 transition-all hover:shadow-md"
              >
                <div className="text-center space-y-2 pt-2">
                  <div className="mx-auto w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg">
                    {getFileIcon(file.extension)}
                  </div>
                  <p className="text-xs font-bold text-slate-800 truncate" title={file.docTitle || file.name}>
                    {file.docTitle || file.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{file.name} • {formatSize(file.size)}</p>
                </div>

                <div className="flex items-center justify-center gap-1 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handlePreview(file)}
                    className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                    title="เปิดดู"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`${file.proxyUrl}&download=true`}
                    download={file.name}
                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="ดาวน์โหลด"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleSoftDelete(file)}
                    className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="ย้ายไปถังขยะ"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls Bar */}
        {totalItems > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>แสดงผล</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              >
                <option value={20}>20 รายการ/หน้า</option>
                <option value={50}>50 รายการ/หน้า</option>
                <option value={100}>100 รายการ/หน้า</option>
              </select>
              <span>จากทั้งหมด <strong className="text-slate-800 font-semibold">{totalItems}</strong> รายการ</span>
            </div>

            <div className="flex items-center gap-2 font-medium">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1 text-slate-700 shadow-xs"
              >
                <span>◀</span> ก่อนหน้า
              </button>
              <span className="px-2 font-mono">
                หน้า <strong className="text-amber-600 font-bold">{currentPage}</strong> / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1 text-slate-700 shadow-xs"
              >
                ถัดไป <span>▶</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewPdfUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewPdfUrl(null)}
        >
          <div
            className="relative w-full max-w-5xl h-[85vh] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-50 text-slate-900 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-slate-800 truncate">{previewPdfTitle}</h3>
              </div>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe src={previewPdfUrl} className="w-full flex-1 bg-white border-none" title="PDF Preview" />
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white border border-slate-200 p-2 shadow-2xl">
            <img
              src={previewImageUrl}
              alt="Preview"
              className="max-h-[85vh] w-auto object-contain rounded-xl mx-auto"
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ===== 🗑️ Trash Bin Modal (.trash/) ===== */}
      {showTrashModal && (
        <div
          className="fixed inset-0 z-[120000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowTrashModal(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{ animation: 'fadeInScale 0.18s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 text-slate-900 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">ถังขยะ (.trash/) — ไฟล์ที่ถูกลบชั่วคราว</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">ไฟล์จะถูก AWS S3 Lifecycle ลบถาวรอัตโนมัติเมื่อครบ 30 วัน</p>
                </div>
              </div>
              <button
                onClick={() => setShowTrashModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2.5 bg-slate-50/50">
              {loadingTrash ? (
                <div className="py-14 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                  <p className="text-xs text-slate-600">กำลังโหลดรายการถังขยะ...</p>
                </div>
              ) : trashItems.length === 0 ? (
                <div className="py-14 text-center text-slate-500 space-y-2">
                  <Trash2 className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">ถังขยะว่างเปล่า</p>
                  <p className="text-xs text-slate-400">กดปุ่ม 🗑️ ที่ข้างไฟล์เพื่อย้ายไปถังขยะก่อนลบถาวร</p>
                </div>
              ) : (
                trashItems.map((item: any) => (
                  <div
                    key={item.key}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(item.extension || item.name?.split('.').pop()?.toLowerCase() || '')}
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {item.key} • {formatSize(item.size || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={actionKey === item.key}
                        onClick={() => handleRestoreTrash(item.key)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionKey === item.key ? '...' : '↺ กู้คืน'}
                      </button>
                      <button
                        disabled={actionKey === item.key}
                        onClick={() => handlePurgeTrash(item.key)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {actionKey === item.key ? '...' : '❌ ลบถาวร'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>💡 S3 Lifecycle Rule จะลบไฟล์ใน <code className="font-mono text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">.trash/</code> อัตโนมัติหลัง 30 วัน</span>
              <button
                onClick={() => setShowTrashModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ⚙️ Document Category Order Settings Modal ===== */}
      {showCategorySettings && (
        <div
          className="fixed inset-0 z-[120000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowCategorySettings(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            style={{ animation: 'fadeInScale 0.18s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 text-slate-900 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="text-amber-500 text-lg">⚙️</span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">ตั้งค่าลำดับการแสดงเอกสาร (Category Order)</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">ลำดับนี้จะใช้ในการจัดเรียงเอกสารของผู้สมัครทุกคนในระบบ</p>
                </div>
              </div>
              <button
                onClick={() => setShowCategorySettings(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category List */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2 bg-slate-50/50">
              <p className="text-xs text-slate-500 pb-1 font-medium">
                ใช้ปุ่ม ⬆️ / ⬇️ เพื่อเรียงลำดับเอกสาร — ระบบจะจัดเรียงไฟล์ตามลำดับที่กำหนดโดยอัตโนมัติ
              </p>

              {docCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 transition-all hover:border-amber-400 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs shrink-0">
                      {String(cat.order).padStart(2, '0')}
                    </span>
                    <span className="text-base shrink-0">{cat.icon}</span>
                    <span className="text-xs font-semibold text-slate-800 truncate">{cat.label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveCategory(idx, 'up')}
                      title="เลื่อนขึ้น"
                      className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors text-sm font-bold border border-slate-200"
                    >
                      ▲
                    </button>
                    <button
                      disabled={idx === docCategories.length - 1}
                      onClick={() => moveCategory(idx, 'down')}
                      title="เลื่อนลง"
                      className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 rounded-lg transition-colors text-sm font-bold border border-slate-200"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setDocCategories(DEFAULT_DOC_CATEGORIES);
                  localStorage.removeItem('hr_drive_doc_category_settings');
                  showToast('คืนค่าลำดับเริ่มต้นสำเร็จ', 'success');
                }}
                className="text-xs text-slate-500 hover:text-amber-600 underline transition-colors font-medium"
              >
                🔄 คืนค่าเริ่มต้น (Reset Default)
              </button>
              <button
                onClick={() => setShowCategorySettings(false)}
                className="px-5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                เสร็จสิ้น ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ===== Delete Confirmation Modal (light theme) ===== */}
      {confirmDeleteModal.open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          onClick={() => !confirmDeleteModal.isDeleting && setConfirmDeleteModal({ open: false, files: [], isDeleting: false })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'fadeInScale 0.18s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  ย้ายไฟล์ไปถังขยะ
                </h3>
                <p className="text-xs text-slate-500">
                  ไฟล์จะถูกย้ายไปยัง .trash/ และสามารถกู้คืนได้ภายหลัง
                </p>
              </div>
            </div>

            {/* File List */}
            <div className="px-6 py-4 max-h-56 overflow-y-auto space-y-1.5">
              {confirmDeleteModal.files.map((f) => (
                <div key={f.key} className="flex items-center gap-2.5 py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {f.docTitle || f.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{f.name}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setConfirmDeleteModal({ open: false, files: [], isDeleting: false })}
                disabled={confirmDeleteModal.isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={executeDelete}
                disabled={confirmDeleteModal.isDeleting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 shadow-sm"
              >
                {confirmDeleteModal.isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    กำลังย้าย...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    ยืนยัน ย้าย {confirmDeleteModal.files.length} ไฟล์
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
