import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // When parent passes a new initialPrefix (e.g. navigating from candidate drawer), jump to it
  useEffect(() => {
    if (initialPrefix !== undefined && initialPrefix !== currentPrefix) {
      setCurrentPrefix(initialPrefix);
    }
  // Only re-run when initialPrefix changes from outside
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrefix]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<S3FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; prefix: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [migratingKey, setMigratingKey] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [bucketStats, setBucketStats] = useState<BucketStats | null>(null);

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
        setFolders(data.folders || []);
        setFiles(data.files || []);
        setBreadcrumbs(data.breadcrumbs || []);
        if (data.bucketStats) {
          setBucketStats(data.bucketStats);
        }
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
  const filteredFolders = folders.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.refCode && f.refCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredFiles = files
    .filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.docTitle && f.docTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    )
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
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {folder.name}
                        </span>
                        {folder.refCode && (
                          <span className="text-[11px] text-slate-400 font-mono truncate" title={folder.refCode}>
                            {folder.refCode}
                          </span>
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
                <p className="text-xs font-bold text-slate-800 truncate" title={folder.name}>
                  {folder.name}
                </p>
                {folder.refCode && (
                  <p className="text-[10px] text-slate-400 font-mono truncate" title={folder.refCode}>
                    {folder.refCode}
                  </p>
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

