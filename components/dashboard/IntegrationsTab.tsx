import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Modal } from '../UIComponents';
import {
  Key, Database, Send, RefreshCw, Copy, Check, Plus, Trash2,
  ExternalLink, FileText, Download, ShieldCheck, AlertCircle,
  Play, Terminal, Server, CheckCircle2, Clock, XCircle, Search,
  Eye, Code2, Sparkles, Lock, ArrowRight, Activity, ShieldAlert,
  SlidersHorizontal, CheckCircle, X, BarChart3, HardDrive,
  Calendar, ArrowUpRight, ChevronDown, ChevronUp
} from 'lucide-react';
import { api } from '../../services/api';
import type { AuthUser } from '../../services/api';

interface IntegrationsTabProps {
  currentUser?: AuthUser | null;
  onViewApplicant?: (app: any) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ currentUser, onViewApplicant }) => {
  const [activeSubTab, setActiveSubTab] = useState<'keys' | 'queue' | 'sandbox' | 'docs'>('keys');

  // API Keys State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyNotes, setNewKeyNotes] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [generatedKeyResult, setGeneratedKeyResult] = useState<{ name: string; plain_api_key: string; masked_key: string } | null>(null);

  // API Key Logs & Traffic State
  const [selectedKeyForLogs, setSelectedKeyForLogs] = useState<any | null>(null);
  const [keyLogsList, setKeyLogsList] = useState<any[]>([]);
  const [keyLogsStats, setKeyLogsStats] = useState<{
    total_7d: number;
    total_24h: number;
    success_count: number;
    error_count: number;
    success_rate: number;
    avg_latency_ms: number;
  } | null>(null);
  const [isLoadingKeyLogs, setIsLoadingKeyLogs] = useState(false);
  const [keyLogsStatusFilter, setKeyLogsStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Log Storage & Retention State
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    system_activity_logs: number;
    system_api_key_logs: number;
    application_logs: number;
    qr_logs: number;
    total_log_rows: number;
    checked_at: string;
  } | null>(null);
  const [isCleaningLogs, setIsCleaningLogs] = useState(false);
  const [selectedRetentionDays, setSelectedRetentionDays] = useState<number>(30);

  // Sync Queue State
  const [queueList, setQueueList] = useState<any[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'all' | 'READY_TO_SYNC' | 'SYNCED' | 'FAILED'>('all');

  // Sandbox / Explorer State
  const [selectedSandboxAppId, setSelectedSandboxAppId] = useState<string>('__ALL_READY__');
  const [sandboxApiKey, setSandboxApiKey] = useState<string>('');
  const [isExecutingSandbox, setIsExecutingSandbox] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<any | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [sandboxCodeLang, setSandboxCodeLang] = useState<'curl' | 'python' | 'js'>('curl');

  // Simulated ACK State
  const [simMockEmpId, setSimMockEmpId] = useState<string>('EMP-69001');
  const [isSimulatingAck, setIsSimulatingAck] = useState(false);
  const [simAckResult, setSimAckResult] = useState<any | null>(null);

  // JSON Preview Modal State
  const [previewJsonModalData, setPreviewJsonModalData] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Copy Feedback State
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Admin Reset HRMS Sync State
  const [appToReset, setAppToReset] = useState<any | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Revoke API Key State
  const [keyToDelete, setKeyToDelete] = useState<any | null>(null);
  const [isDeletingKey, setIsDeletingKey] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch API Keys
  const fetchKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const res = await api.apiKeys.list();
      if (res.success && res.data) {
        setApiKeys(res.data);
      } else {
        showToast(res.error?.message || 'ไม่สามารถโหลดรายการ API Key ได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลด API Keys', 'error');
    } finally {
      setIsLoadingKeys(false);
    }
  };

  // 2. Fetch Storage Stats
  const fetchStorageStats = async () => {
    try {
      const res = await api.systemLogs.getStorageStats();
      if (res.success && res.data) {
        setStorageStats(res.data);
      }
    } catch {}
  };

  // 3. Fetch API Key Request Logs
  const fetchKeyLogs = async (keyId?: string, status: string = 'all') => {
    setIsLoadingKeyLogs(true);
    try {
      const res = await api.apiKeys.getLogs({
        keyId: keyId || undefined,
        status: status !== 'all' ? status : undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setKeyLogsList(res.data.logs || []);
        setKeyLogsStats(res.data.stats || null);
      } else {
        showToast(res.error?.message || 'ไม่สามารถโหลดประวัติการเรียกใช้ API Key ได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลด API Key Logs', 'error');
    } finally {
      setIsLoadingKeyLogs(false);
    }
  };

  const openKeyLogsModal = (keyItem?: any) => {
    const target = keyItem || { id: '', name: 'ทุกกุญแจในระบบ (All API Keys Traffic)', masked_key: 'ภาพรวมระบบ' };
    setSelectedKeyForLogs(target);
    setKeyLogsStatusFilter('all');
    setExpandedLogId(null);
    fetchKeyLogs(target.id, 'all');
  };

  const handleExecuteCleanup = async (retentionDays: number = 30) => {
    setIsCleaningLogs(true);
    try {
      const res = await api.systemLogs.cleanupOldLogs({
        apiKeyDays: retentionDays,
        activityDays: Math.max(retentionDays, 60),
        appLogDays: 60,
        qrDays: 60,
      });
      if (res.success && res.data) {
        showToast(`ล้าง Log เก่าสำเร็จ! ลบไปทั้งหมด ${res.data.total_deleted.toLocaleString()} รายการ`, 'success');
        fetchStorageStats();
        fetchKeys();
        setShowRetentionModal(false);
      } else {
        showToast(res.error?.message || 'ไม่สามารถล้าง Log เก่าได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการล้าง Log', 'error');
    } finally {
      setIsCleaningLogs(false);
    }
  };

  // Helper to increment trailing numbers in Employee ID (e.g. EMP-69001 -> EMP-69002)
  const getNextEmpId = (currentId: string): string => {
    if (!currentId || !currentId.trim()) return 'EMP-69001';
    const match = currentId.trim().match(/^(.*?)(\d+)$/);
    if (!match) return `${currentId.trim()}-01`;
    const prefix = match[1];
    const digitsStr = match[2];
    const nextNum = parseInt(digitsStr, 10) + 1;
    const nextDigitsStr = String(nextNum).padStart(digitsStr.length, '0');
    return `${prefix}${nextDigitsStr}`;
  };

  const computeNextAvailableEmpId = (list: any[]): string => {
    let maxIdNum = 69000;
    let hasFound = false;
    list.forEach(item => {
      if (item.hrms_employee_id) {
        const match = String(item.hrms_employee_id).match(/(\d+)$/);
        if (match) {
          hasFound = true;
          const num = parseInt(match[1], 10);
          if (num > maxIdNum) maxIdNum = num;
        }
      }
    });
    return hasFound ? `EMP-${maxIdNum + 1}` : 'EMP-69001';
  };

  // 4. Fetch Sync Queue
  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const res = await api.hrms.getQueue();
      if (res.success && res.data) {
        setQueueList(res.data);
        if (res.data.length > 0 && !selectedSandboxAppId) {
          setSelectedSandboxAppId('__ALL_READY__');
        }
        // Auto compute next available emp id if default
        setSimMockEmpId(prev => {
          if (!prev || prev === 'EMP-69001') {
            return computeNextAvailableEmpId(res.data);
          }
          return prev;
        });
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดคิว HRMS', 'error');
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchQueue();
    fetchStorageStats();
  }, []);

  // Compute Queue Counts
  const readyCount = useMemo(() => queueList.filter(q => q.hrms_sync_status === 'READY_TO_SYNC').length, [queueList]);
  const syncedCount = useMemo(() => queueList.filter(q => q.hrms_sync_status === 'SYNCED').length, [queueList]);
  const activeKeysCount = useMemo(() => apiKeys.filter(k => k.is_active).length, [apiKeys]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queueList.filter(item => {
      if (queueFilter !== 'all' && item.hrms_sync_status !== queueFilter) return false;
      if (queueSearch) {
        const q = queueSearch.toLowerCase();
        const name = (item.full_name || `${item.form_data?.firstName || ''} ${item.form_data?.lastName || ''}`).toLowerCase();
        const pos = (item.position || item.form_data?.position || '').toLowerCase();
        const nat = (item.national_id || item.form_data?.nationalId || '').toLowerCase();
        const emp = (item.hrms_employee_id || '').toLowerCase();
        if (!name.includes(q) && !pos.includes(q) && !nat.includes(q) && !emp.includes(q)) return false;
      }
      return true;
    });
  }, [queueList, queueFilter, queueSearch]);

  // Handle Generate Key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('กรุณาระบุชื่อ API Key', 'error');
      return;
    }

    setIsGeneratingKey(true);
    try {
      const res = await api.apiKeys.generate(newKeyName.trim(), newKeyNotes.trim());
      if (res.success && res.data) {
        setGeneratedKeyResult(res.data);
        setShowNewKeyModal(false);
        setNewKeyName('');
        setNewKeyNotes('');
        fetchKeys();
        showToast('สร้าง API Key ใหม่สำเร็จ', 'success');
      } else {
        showToast(res.error?.message || 'สร้าง API Key ล้มเหลว', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการสร้าง API Key', 'error');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Handle Toggle Key Status
  const handleToggleKey = async (id: string, currentStatus: boolean) => {
    try {
      const res = await api.apiKeys.toggle(id, !currentStatus);
      if (res.success) {
        setApiKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: !currentStatus } : k));
        showToast(`เปลี่ยนสถานะเป็น ${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`, 'success');
      }
    } catch {
      showToast('ไม่สามารถเปลี่ยนสถานะได้', 'error');
    }
  };

  // Handle Delete / Revoke Key with Modal
  const handleConfirmDeleteKey = async () => {
    if (!keyToDelete) return;
    setIsDeletingKey(true);
    try {
      const res = await api.apiKeys.delete(keyToDelete.id);
      if (res.success) {
        setApiKeys(prev => prev.filter(k => k.id !== keyToDelete.id));
        showToast(`เพิกถอน API Key "${keyToDelete.name}" เรียบร้อยแล้ว`, 'success');
        setKeyToDelete(null);
      } else {
        showToast(res.error?.message || 'ไม่สามารถเพิกถอน API Key ได้', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการเพิกถอน API Key', 'error');
    } finally {
      setIsDeletingKey(false);
    }
  };

  // Handle Live Sandbox Execution
  const handleExecuteSandbox = async () => {
    if (!selectedSandboxAppId) {
      showToast('กรุณาเลือกเป้าหมายที่ต้องการทดสอบ', 'error');
      return;
    }

    const trimmedKey = (sandboxApiKey || '').trim();

    // Check if user accidentally pasted a masked key containing bullets or asterisks
    if (trimmedKey.includes('•') || trimmedKey.includes('*')) {
      setSandboxError('⚠️ ค่า X-API-Key ที่ระบุเป็น Masked Key (มีจุดซ่อนรหัส •) ไม่ใช่ Secret Key ตัวเต็ม — สำหรับการทดสอบในหน้านี้ สามารถกดล้างช่องนี้ให้ว่างเพื่อใช้ Staff Session ทดสอบได้ทันที');
      return;
    }

    // Check if key contains non-ASCII characters that would cause browser fetch header errors
    if (/[^\x00-\x7F]/.test(trimmedKey)) {
      setSandboxError('⚠️ ค่า Header X-API-Key มีตัวอักษรพิเศษที่ไม่รองรับใน HTTP Header กรุณาล้างค่าเพื่อใช้สิทธิ์ Staff Session หรือกรอก API Key ภาษาอังกฤษ');
      return;
    }

    setIsExecutingSandbox(true);
    setSandboxResponse(null);
    setSandboxError(null);

    try {
      const headers: Record<string, string> = {};
      if (trimmedKey) {
        headers['X-API-Key'] = trimmedKey;
      }

      let exportUrl = '';
      if (selectedSandboxAppId === '__ALL_READY__') {
        exportUrl = '/api?route=hrms-export&status=READY_TO_SYNC';
      } else if (selectedSandboxAppId === '__ALL_SYNCED__') {
        exportUrl = '/api?route=hrms-export&status=SYNCED';
      } else {
        exportUrl = `/api?route=hrms-export&application_id=${encodeURIComponent(selectedSandboxAppId)}`;
      }

      const res = await fetch(exportUrl, {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        credentials: 'same-origin',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setSandboxError(json.error || `HTTP ${res.status}: Failed to fetch export data`);
      } else {
        setSandboxResponse(json);
      }
    } catch (err: any) {
      setSandboxError(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsExecutingSandbox(false);
    }
  };

  // Handle Simulated Callback ACK
  const handleSimulateAck = async () => {
    if (!selectedSandboxAppId || selectedSandboxAppId.startsWith('__ALL_')) {
      showToast('กรุณาเลือกผู้สมัครรายบุคคลใน Dropdown ด้านบนเพื่อทดสอบส่ง Mock ACK', 'error');
      return;
    }

    if (!simMockEmpId.trim()) {
      showToast('กรุณากรอกรหัสพนักงานจำลอง', 'error');
      return;
    }

    setIsSimulatingAck(true);
    setSimAckResult(null);

    try {
      const usedEmpId = simMockEmpId.trim();
      const res = await api.hrms.simulateAck(
        selectedSandboxAppId,
        usedEmpId,
        'ทดสอบส่ง Callback ACK ผ่านหน้า Integrations Sandbox'
      );
      if (res.success) {
        const nextId = getNextEmpId(usedEmpId);
        setSimMockEmpId(nextId);
        setSimAckResult(res.data);
        showToast(`จำลองการออกรหัสพนักงาน ${usedEmpId} สำเร็จ (ระบบเตรียมรหัส ${nextId} สำหรับคนถัดไปให้อัตโนมัติ)`, 'success');
        fetchQueue();
      } else {
        showToast(res.error?.message || 'ส่ง Callback ACK ล้มเหลว', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setIsSimulatingAck(false);
    }
  };

  // Handle Admin Reset HRMS Status
  const handleExecuteReset = async () => {
    if (!appToReset) return;
    setIsResetting(true);
    try {
      const res = await api.hrms.cancelReadyToSync(appToReset.id);
      if (res.success) {
        showToast(`รีเซ็ตสถานะ HRMS ของ ${appToReset.full_name || 'ผู้สมัคร'} เรียบร้อยแล้ว`, 'success');
        setAppToReset(null);
        fetchQueue();
      } else {
        showToast(res.error?.message || 'รีเซ็ตสถานะไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการรีเซ็ต', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://hrbp.yourcompany.com';

  const sandboxQueryPath = useMemo(() => {
    if (selectedSandboxAppId === '__ALL_READY__') return '/api?route=hrms-export&status=READY_TO_SYNC';
    if (selectedSandboxAppId === '__ALL_SYNCED__') return '/api?route=hrms-export&status=SYNCED';
    return `/api?route=hrms-export&application_id=${selectedSandboxAppId || '<UUID>'}`;
  }, [selectedSandboxAppId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200000] animate-in slide-in-from-top duration-300">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/40'
              : 'bg-slate-900 text-white border-red-500/50 shadow-red-950/40'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-900/40 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30 shadow-inner">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  ศูนย์เชื่อมต่อระบบ IDMS / HRMS
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    Live API Hub
                  </span>
                </h1>
                <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  ระบบศูนย์กลางจัดการการเชื่อมต่อข้อมูลผู้สมัครที่ผ่านการคัดเลือก (Finalized Candidates) 
                  และเอกสารแนบทั้งหมดไปยังระบบ HRMS / IDMS ภายในองค์กร เพื่อออกรหัสพนักงานใหม่ตามมาตรฐาน PDPA
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <a
              href="/docs/HRMS_INTEGRATION_API_GUIDE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/30 border border-indigo-400/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดคู่มือ PDF</span>
            </a>
            <button
              type="button"
              onClick={() => { fetchKeys(); fetchQueue(); showToast('รีเฟรชข้อมูลล่าสุดแล้ว', 'success'); }}
              className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-white border border-slate-600 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingKeys || isLoadingQueue ? 'animate-spin text-indigo-400' : 'text-slate-300'}`} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-300">สถานะ API Server</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="mt-1 text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              พร้อมใช้งาน (Healthy)
            </div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-300">Active API Keys</span>
              <Key className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="mt-1 text-base md:text-lg font-black text-white">
              {activeKeysCount} <span className="text-xs font-normal text-slate-400">คีย์</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-300">คิวรอ IT ดึง (Ready)</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-1 text-base md:text-lg font-black text-amber-400">
              {readyCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-300">เข้า HRMS แล้ว (Synced)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-1 text-base md:text-lg font-black text-emerald-400">
              {syncedCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('keys')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'keys'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>จัดการ API Keys ({apiKeys.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'queue'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>คิวรอส่งข้อมูล & รายการ Sync ({readyCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sandbox')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'sandbox'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>เครื่องมือทดสอบ API (Interactive Sandbox)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('docs')}
          className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeSubTab === 'docs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>คู่มือการเชื่อมต่อ & Endpoints</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: API KEYS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  API Key Credentials Manager
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  สร้างและควบคุมกุญแจความปลอดภัยสำหรับให้ระบบ IT IDMS/HRMS ใช้ยืนยันตัวตนใน HTTP Header <code>X-API-Key</code>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
                  onClick={() => openKeyLogsModal()}
                  title="ดูประวัติการเรียกใช้ API รวมทุก Key"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Traffic รวมทุก Key</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
                  onClick={() => {
                    fetchStorageStats();
                    setShowRetentionModal(true);
                  }}
                  title="จัดการนโยบายล้าง Log อัตโนมัติ"
                >
                  <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                  <span>จัดการพื้นที่ Log</span>
                </Button>

                <Button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 rounded-xl cursor-pointer"
                  onClick={() => setShowNewKeyModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้าง API Key ใหม่</span>
                </Button>
              </div>
            </div>

            {/* Keys Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">ชื่อ API Key / ระบบที่ใช้</th>
                    <th className="px-4 py-3.5">Masked Secret Key</th>
                    <th className="px-4 py-3.5">สถานะ</th>
                    <th className="px-4 py-3.5">Traffic (30 วัน)</th>
                    <th className="px-4 py-3.5">ใช้งานล่าสุด</th>
                    <th className="px-4 py-3.5">สร้างโดย</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoadingKeys ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                        กำลังโหลดรายการ API Key...
                      </td>
                    </tr>
                  ) : apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400 space-y-2">
                        <Key className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">ยังไม่มี API Key ในระบบ</p>
                        <p className="text-xs text-gray-400">คลิกปุ่ม "+ สร้าง API Key ใหม่" ด้านบนเพื่อสร้างกุญแจสำหรับส่งมอบให้ทีม IT</p>
                      </td>
                    </tr>
                  ) : (
                    apiKeys.map((k) => (
                      <tr key={k.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{k.name}</span>
                            {k.notes && (
                              <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[150px]" title={k.notes}>
                                {k.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-indigo-700">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                              {k.masked_key}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(k.masked_key);
                                setCopiedKeyId(k.id);
                                setTimeout(() => setCopiedKeyId(null), 2000);
                              }}
                              className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
                              title="คัดลอก Masked Key"
                            >
                              {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleKey(k.id, k.is_active)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 w-fit ${
                              k.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${k.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                            {k.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => openKeyLogsModal(k)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors font-bold text-[11px] cursor-pointer"
                            title="คลิกเพื่อดูประวัติการเรียกใช้ของ Key นี้"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{(k.total_calls_30d || 0).toLocaleString()} calls</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {k.last_used_at ? (
                            <span className="text-emerald-700 font-medium">
                              {new Date(k.last_used_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}{' '}
                              {new Date(k.last_used_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">ยังไม่เคยใช้งาน</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          {k.created_by || 'Staff'}
                          <div className="text-[10px] text-gray-400">
                            {new Date(k.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openKeyLogsModal(k)}
                              className="px-2 py-1 text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                              title="ดูประวัติการเรียกใช้ & Traffic"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              <span>ประวัติ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setKeyToDelete(k)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="เพิกถอน API Key (Revoke)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SYNC QUEUE MONITOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Live Sync Queue & Candidate Monitoring
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ติดตามรายการผู้สมัครที่อยู่ในคิวรอให้ IT ดึงข้อมูล หรือรายการที่นำเข้าสู่ระบบ HRMS แล้ว
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ, เลขบัตร, ตำแหน่ง..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-56 text-gray-900"
                  />
                </div>

                <select
                  value={queueFilter}
                  onChange={(e: any) => setQueueFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 font-medium"
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="READY_TO_SYNC">⚡ รอ IT ดึง (READY_TO_SYNC)</option>
                  <option value="SYNCED">🟢 นำเข้าแล้ว (SYNCED)</option>
                  <option value="FAILED">🔴 ขัดข้อง (FAILED)</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-bold">
                  <tr>
                    <th className="px-4 py-3.5">ผู้สมัคร / ตำแหน่ง</th>
                    <th className="px-4 py-3.5">เลขบัตร ปชช.</th>
                    <th className="px-4 py-3.5">สถานะ HRMS</th>
                    <th className="px-4 py-3.5">เวลาที่อนุมัติส่ง</th>
                    <th className="px-4 py-3.5">รหัสพนักงาน (EMP ID)</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoadingQueue ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                        กำลังโหลดคิว HRMS...
                      </td>
                    </tr>
                  ) : filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">ไม่พบรายการในคิว</p>
                        <p className="text-xs text-gray-400">เมื่อ HR กดปุ่ม "ส่งข้อมูลไป HRMS" ในหน้าต่างผู้สมัคร รายชื่อจะมาปรากฏที่นี่</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((app) => {
                      const fd = app.form_data || {};
                      const fullName = app.full_name || `${fd.prefix || ''} ${fd.firstName || ''} ${fd.lastName || ''}`.trim() || 'ไม่ระบุ';
                      const pos = app.position || fd.position || '-';
                      const isReady = app.hrms_sync_status === 'READY_TO_SYNC';
                      const isSynced = app.hrms_sync_status === 'SYNCED';

                      return (
                        <tr key={app.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-gray-900">{fullName}</div>
                            <div className="text-[11px] text-indigo-600">{pos}</div>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-700">
                            {app.national_id || fd.nationalId || '-'}
                          </td>
                          <td className="px-4 py-3.5">
                            {isReady && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                <span>⚡ รอ IT ดึงข้อมูล</span>
                              </span>
                            )}
                            {isSynced && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>นำเข้าสำเร็จ</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600">
                            {app.hrms_ready_at ? (
                              <div>
                                <div>{new Date(app.hrms_ready_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                                <div className="text-[10px] text-gray-400">โดย: {app.hrms_ready_by || 'HR'}</div>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-gray-900">
                            {app.hrms_employee_id ? (
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200">
                                {app.hrms_employee_id}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-normal italic">รอออกรหัส</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  setIsPreviewLoading(true);
                                  try {
                                    const res = await api.hrms.previewExport(app.id);
                                    if (res.success && res.data) {
                                      setPreviewJsonModalData(res.data);
                                    } else {
                                      showToast('ไม่สามารถดึงข้อมูล JSON Preview ได้', 'error');
                                    }
                                  } finally {
                                    setIsPreviewLoading(false);
                                  }
                                }}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>ดู JSON</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setAppToReset(app)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-amber-200"
                                title="รีเซ็ตสถานะกลับเป็น NOT_READY เพื่อทดสอบซ้ำ (Demo Reset)"
                              >
                                <RefreshCw className="w-3 h-3 text-amber-600" />
                                <span>รีเซ็ต (Demo)</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: INTERACTIVE SANDBOX & CODE */}
      {/* ========================================================================= */}
      {activeSubTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-5">
              <div className="border-b pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Play className="w-5 h-5 text-indigo-600" />
                  API Request Builder
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  เลือกผู้สมัครและทดสอบยิง Export API หรือจำลองส่ง Callback ACK ได้ทันที
                </p>
              </div>

              {/* Candidate Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    1. โหมดทดสอบดึงข้อมูล (Query Target)
                  </label>
                  {selectedSandboxAppId === '__ALL_READY__' ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      ⚡ คิวรอส่ง (Ready Queue)
                    </span>
                  ) : selectedSandboxAppId === '__ALL_SYNCED__' ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      📦 ประวัติที่ Sync แล้ว (Synced)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      👤 รายบุคคล (Single ID)
                    </span>
                  )}
                </div>
                <select
                  value={selectedSandboxAppId}
                  onChange={(e) => setSelectedSandboxAppId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 font-medium"
                >
                  <option value="__ALL_READY__">
                    ⚡ ดึงคิวทั้งหมดที่พร้อมส่ง (status=READY_TO_SYNC) [{queueList.filter(q => q.hrms_sync_status === 'READY_TO_SYNC').length} คน]
                  </option>
                  <option value="__ALL_SYNCED__">
                    📦 ดึงรายการที่ Sync สำเร็จแล้วทั้งหมด (status=SYNCED) [{queueList.filter(q => q.hrms_sync_status === 'SYNCED').length} คน]
                  </option>
                  {queueList.length > 0 && (
                    <optgroup label="--- ทดสอบเจาะจงรายบุคคล (Single Candidate) ---">
                      {queueList.map((app) => (
                        <option key={app.id} value={app.id}>
                          👤 {app.full_name || app.id} ({app.position || '-'}) - {app.hrms_sync_status}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* API Key Header Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">
                    2. Header X-API-Key (Optional สำหรับทดสอบ)
                  </label>
                  {sandboxApiKey ? (
                    <button
                      type="button"
                      onClick={() => setSandboxApiKey('')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                    >
                      ล้างค่า (ใช้ Staff Session)
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✓ ใช้ Staff Session อัตโนมัติ
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={sandboxApiKey}
                    onChange={(e) => setSandboxApiKey(e.target.value)}
                    placeholder="เว้นว่างไว้เพื่อใช้ Staff Session หรือกรอก Secret Key ตัวเต็ม"
                    className={`w-full px-3 py-2 text-xs font-mono bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 pr-8 ${
                      sandboxApiKey.includes('•') ? 'border-amber-400 bg-amber-50/30' : 'border-gray-300'
                    }`}
                  />
                  {sandboxApiKey && (
                    <button
                      type="button"
                      onClick={() => setSandboxApiKey('')}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="ล้างค่า"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {sandboxApiKey.includes('•') && (
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5 animate-in fade-in">
                    <span className="shrink-0 font-bold">⚠️</span>
                    <div className="flex-1">
                      <span>นี่คือ <strong>Masked Key</strong> (มีจุดซ่อนรหัส •) ไม่ใช่ Secret Key ตัวเต็ม — กด</span>{' '}
                      <button
                        type="button"
                        onClick={() => setSandboxApiKey('')}
                        className="underline font-bold text-amber-900 hover:text-indigo-700 cursor-pointer"
                      >
                        ล้างค่าเพื่อใช้ Staff Session ทดสอบ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <Button
                  type="button"
                  onClick={handleExecuteSandbox}
                  disabled={isExecutingSandbox || !selectedSandboxAppId}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isExecutingSandbox ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      กำลังส่ง Request...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      {selectedSandboxAppId.startsWith('__ALL_') ? 'ยิงทดสอบดึงข้อมูลทั้งชุด (GET Export Batch)' : 'ยิงทดสอบดึงข้อมูลรายคน (GET Export API)'}
                    </>
                  )}
                </Button>
              </div>

              {/* Simulated ACK Section */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-600" />
                    จำลองการตอบกลับจาก IT (POST /api?route=hrms-ack)
                  </span>
                  {selectedSandboxAppId.startsWith('__ALL_') && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      (สำหรับรายคน)
                    </span>
                  )}
                </div>

                {selectedSandboxAppId.startsWith('__ALL_') ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                    <span className="text-sm">💡</span>
                    <span>การส่ง <strong>Mock ACK</strong> และปุ่มรีเซ็ตสถานะ เป็นการทำงานแบบระบุรายคน — เลือกผู้สมัครรายบุคคลใน Dropdown ข้อ 1 ด้านบน เพื่อทดสอบ</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={simMockEmpId}
                        onChange={(e) => setSimMockEmpId(e.target.value)}
                        placeholder="รหัสพนักงาน เช่น EMP-69042"
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setSimMockEmpId(prev => getNextEmpId(prev))}
                        className="absolute right-1.5 top-1.5 px-2 py-0.5 text-[10px] font-bold font-mono bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200 transition cursor-pointer"
                        title="เพิ่มรหัส +1 อัตโนมัติ"
                      >
                        +1
                      </button>
                    </div>
                    <Button
                      type="button"
                      onClick={handleSimulateAck}
                      disabled={isSimulatingAck || !selectedSandboxAppId || selectedSandboxAppId.startsWith('__ALL_') || !simMockEmpId}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 cursor-pointer"
                    >
                      {isSimulatingAck ? 'กำลังส่ง...' : 'ส่ง Mock ACK'}
                    </Button>

                    {selectedSandboxAppId && !selectedSandboxAppId.startsWith('__ALL_') && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const target = queueList.find(q => q.id === selectedSandboxAppId);
                          if (target) setAppToReset(target);
                        }}
                        className="text-amber-700 border-amber-300 hover:bg-amber-50 font-bold text-xs px-3 py-2 rounded-xl shrink-0 cursor-pointer"
                        title="รีเซ็ตสถานะผู้สมัครรายนี้กลับเป็น NOT_READY"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>รีเซ็ตสถานะ</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Code Snippets Box */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Code2 className="w-4 h-4" />
                  <span>ตัวอย่างโค้ดเรียกใช้งาน (Code Snippet)</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                  {(['curl', 'python', 'js'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSandboxCodeLang(lang)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer ${
                        sandboxCodeLang === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-3.5 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-48">
                  {sandboxCodeLang === 'curl' && `curl -X GET "${currentOrigin}${sandboxQueryPath}" \\
  -H "X-API-Key: YOUR_ENTERPRISE_SECRET_KEY" \\
  -H "Content-Type: application/json"`}

                  {sandboxCodeLang === 'python' && `import requests

url = "${currentOrigin}${sandboxQueryPath}"
headers = {
    "X-API-Key": "YOUR_ENTERPRISE_SECRET_KEY",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)
payload = response.json()
print(f"พบข้อมูล: {payload.get('count', 0)} รายการ")
print(payload)`}

                  {sandboxCodeLang === 'js' && `const res = await fetch('${currentOrigin}${sandboxQueryPath}', {
  headers: {
    'X-API-Key': 'YOUR_ENTERPRISE_SECRET_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await res.json();
console.log(data);`}
                </pre>

                <button
                  type="button"
                  onClick={() => {
                    const code = sandboxCodeLang === 'curl'
                      ? `curl -X GET "${currentOrigin}${sandboxQueryPath}" -H "X-API-Key: YOUR_ENTERPRISE_SECRET_KEY" -H "Content-Type: application/json"`
                      : sandboxCodeLang === 'python'
                      ? `import requests\nresponse = requests.get("${currentOrigin}${sandboxQueryPath}", headers={"X-API-Key": "YOUR_ENTERPRISE_SECRET_KEY"})\nprint(response.json())`
                      : `const res = await fetch('${currentOrigin}${sandboxQueryPath}', { headers: { 'X-API-Key': 'YOUR_ENTERPRISE_SECRET_KEY' } });\nconsole.log(await res.json());`;
                    navigator.clipboard.writeText(code);
                    showToast('คัดลอก Code Snippet แล้ว', 'success');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs cursor-pointer"
                  title="คัดลอกโค้ด"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Response Viewer Panel */}
          <div className="lg:col-span-7 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h4 className="font-bold text-sm text-white">Live Response Payload</h4>
                {sandboxResponse && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-mono font-bold">
                    HTTP 200 OK
                  </span>
                )}
                {sandboxError && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md text-[10px] font-mono font-bold">
                    Error
                  </span>
                )}
              </div>

              {sandboxResponse && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(sandboxResponse, null, 2));
                    showToast('คัดลอก JSON Response แล้ว', 'success');
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก JSON</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 mt-4 max-h-[600px]">
              {isExecutingSandbox ? (
                <div className="py-24 text-center text-slate-400 font-sans space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                  <p>กำลังเชื่อมต่อ API และสร้าง Presigned URLs...</p>
                </div>
              ) : sandboxError ? (
                <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 font-sans space-y-1">
                  <div className="font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    เกิดข้อผิดพลาดในการเรียก API
                  </div>
                  <p className="text-xs font-mono">{sandboxError}</p>
                </div>
              ) : sandboxResponse ? (
                <pre className="whitespace-pre-wrap break-all leading-relaxed">
                  {JSON.stringify(sandboxResponse, null, 2)}
                </pre>
              ) : (
                <div className="py-24 text-center text-slate-500 font-sans space-y-2">
                  <Code2 className="w-8 h-8 mx-auto text-slate-700" />
                  <p>คลิกปุ่ม "ยิงทดสอบดึงข้อมูล" ด้านซ้าย เพื่อดู Response Payload สดๆ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: DOCUMENTATION & ENDPOINTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'docs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Endpoints Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Endpoint 1: Export API */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono font-bold text-xs rounded-lg border border-indigo-200">
                  GET
                </span>
                <span className="text-[11px] text-gray-500">Secure Candidate Export</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">ดึงข้อมูลประวัติผู้สมัครและไฟล์แนบ</h4>
                <div className="mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-mono text-xs text-indigo-700 flex items-center justify-between">
                  <span className="truncate">/api?route=hrms-export</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${currentOrigin}/api?route=hrms-export`);
                      showToast('คัดลอก Endpoint แล้ว', 'success');
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="คัดลอก Endpoint"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                ส่ง Query Parameter <code>application_id=&lt;UUID&gt;</code> หรือ <code>status=READY_TO_SYNC</code> พร้อม <code>X-API-Key</code> ใน Header เพื่อดึงประวัติ, การศึกษา, ประสบการณ์ และ Presigned File URLs อายุ 2 ชั่วโมง
              </p>
            </Card>

            {/* Endpoint 2: Ack Callback API */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold text-xs rounded-lg border border-emerald-200">
                  POST
                </span>
                <span className="text-[11px] text-gray-500">Callback Acknowledgment</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">ส่ง Callback ยืนยันรหัสพนักงาน (EMP ID)</h4>
                <div className="mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 font-mono text-xs text-emerald-700 flex items-center justify-between">
                  <span className="truncate">/api?route=hrms-ack</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${currentOrigin}/api?route=hrms-ack`);
                      showToast('คัดลอก Endpoint แล้ว', 'success');
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
                    title="คัดลอก Endpoint"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                ส่ง JSON Body <code>&#123; application_id, hrms_employee_id, sync_status: "SYNCED" &#125;</code> เพื่ออัปเดตสถานะใน HRBP เป็นนำเข้าสำเร็จและบันทึกประวัติ
              </p>
            </Card>
          </div>

          {/* Download PDF Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 md:p-8 rounded-3xl border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                เอกสารคู่มือฉบับสมบูรณ์สำหรับทีม IT (Official PDF Guide)
              </h3>
              <p className="text-xs md:text-sm text-gray-600 max-w-xl">
                คู่มืออย่างเป็นทางการขนาด A4 อธิบายสถาปัตยกรรม, Data Dictionary ของ JSON Response, การจัดการ PDPA, การดาวน์โหลดไฟล์แนบ และการจัดการเคสพนักงานเก่า (Re-hire)
              </p>
            </div>

            <a
              href="/docs/HRMS_INTEGRATION_API_GUIDE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดคู่มือ PDF (v1.0.0)</span>
            </a>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW API KEY */}
      {/* ========================================================================= */}
      {showNewKeyModal && (
        <Modal
          isOpen={showNewKeyModal}
          onClose={() => setShowNewKeyModal(false)}
          title="สร้าง API Key ใหม่ (Generate API Key)"
        >
          <form onSubmit={handleGenerateKey} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                ชื่อ API Key / ระบบปลายทาง <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="เช่น IT IDMS Production Integration, HRMS Sync Bot"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                บันทึกช่วยจำ / Notes (Optional)
              </label>
              <Input
                type="text"
                value={newKeyNotes}
                onChange={(e) => setNewKeyNotes(e.target.value)}
                placeholder="เช่น มอบให้ทีม IT Developer ดูแล"
              />
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                ข้อควรทราบด้านความปลอดภัย
              </div>
              <p className="text-amber-800/90 leading-relaxed">
                เมื่อสร้างเสร็จ ระบบจะแสดง Secret Key ฉบับเต็มให้คัดลอก <strong>เพียงครั้งเดียวเท่านั้น</strong> กรุณาจัดเก็บในที่ปลอดภัย
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewKeyModal(false)}
                disabled={isGeneratingKey}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                disabled={isGeneratingKey}
              >
                {isGeneratingKey ? 'กำลังสร้าง...' : 'สร้าง Key'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ONE-TIME SECRET KEY DISPLAY */}
      {/* ========================================================================= */}
      {generatedKeyResult && (
        <Modal
          isOpen={!!generatedKeyResult}
          onClose={() => setGeneratedKeyResult(null)}
          title="🔑 API Key สร้างสำเร็จแล้ว!"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
              <div className="font-bold text-sm flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                API Key สำหรับ {generatedKeyResult.name} พร้อมใช้งาน
              </div>
              <p className="text-xs text-emerald-700">
                กรุณาคัดลอก Secret Key ด้านล่างนี้ทันที เนื่องจากระบบจะไม่แสดง Key นี้ให้เห็นอีก
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Secret API Key (X-API-Key Header Value):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedKeyResult.plain_api_key}
                  className="flex-1 px-3.5 py-2.5 text-xs font-mono font-bold bg-gray-50 border border-indigo-300 rounded-xl text-indigo-700 select-all outline-none"
                />
                <Button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKeyResult.plain_api_key);
                    showToast('คัดลอก Secret Key แล้ว!', 'success');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>คัดลอก</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t">
              <Button
                type="button"
                className="bg-gray-800 hover:bg-gray-900 text-white font-bold"
                onClick={() => setGeneratedKeyResult(null)}
              >
                ฉันได้บันทึก Key ไว้เรียบร้อยแล้ว
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: JSON PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewJsonModalData && (
        <Modal
          isOpen={!!previewJsonModalData}
          onClose={() => setPreviewJsonModalData(null)}
          title="ตัวอย่างข้อมูล Export (HRMS JSON Payload)"
        >
          <div className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(previewJsonModalData, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(previewJsonModalData, null, 2));
                  showToast('คัดลอก JSON Payload แล้ว', 'success');
                }}
                className="flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>คัดลอก JSON</span>
              </Button>

              <Button
                type="button"
                className="bg-gray-800 hover:bg-gray-900 text-white"
                onClick={() => setPreviewJsonModalData(null)}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* ========================================================================= */}
      {/* MODAL 4: ADMIN RESET CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {appToReset && (
        <Modal
          isOpen={!!appToReset}
          onClose={() => setAppToReset(null)}
          title="🔄 ยืนยันการรีเซ็ตสถานะ HRMS (Demo Reset)"
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1.5">
              <div className="font-bold text-sm flex items-center gap-2 text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                รีเซ็ตสถานะการซิงค์ข้อมูลกลับเป็นค่าเริ่มต้น
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                ระบบจะทำการล้างสถานะ <strong>{appToReset.hrms_sync_status}</strong>, รหัสพนักงาน <code>{appToReset.hrms_employee_id || '-'}</code>, และประวัติเวลาส่งข้อมูลของ <strong>{appToReset.full_name || 'ผู้สมัคร'}</strong> กลับเป็น <strong>"ยังไม่พร้อมส่ง (NOT_READY)"</strong> เพื่อให้คุณสามารถทดสอบส่งหรือรัน Demo ใหม่ได้ทันที
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">ชื่อผู้สมัคร:</span>
                <span className="font-bold text-gray-900">{appToReset.full_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ตำแหน่งงาน:</span>
                <span className="font-medium text-indigo-700">{appToReset.position || appToReset.form_data?.position || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สถานะปัจจุบัน:</span>
                <span className="font-bold">{appToReset.hrms_sync_status}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAppToReset(null)}
                disabled={isResetting}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5"
                onClick={handleExecuteReset}
                disabled={isResetting}
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'กำลังรีเซ็ต...' : 'ยืนยันการรีเซ็ต'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: REVOKE API KEY CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {keyToDelete && (
        <Modal
          isOpen={!!keyToDelete}
          onClose={() => setKeyToDelete(null)}
          title="🗑️ ยืนยันการเพิกถอน API Key (Revoke Key)"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 space-y-1.5">
              <div className="font-bold text-sm flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                คำเตือน: การเพิกถอนกุญแจความปลอดภัย
              </div>
              <p className="text-xs text-red-800/90 leading-relaxed">
                คุณกำลังจะเพิกถอน API Key <strong>"{keyToDelete.name}"</strong> (<code>{keyToDelete.masked_key}</code>) เมื่อเพิกถอนแล้ว ระบบ IT หรือบอทภายนอกที่ใช้ Key นี้จะไม่สามารถดึงข้อมูลได้อีกต่อไปทันที
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">ชื่อ Key:</span>
                <span className="font-bold text-gray-900">{keyToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Masked Secret:</span>
                <span className="font-mono text-indigo-700 font-bold">{keyToDelete.masked_key}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">สร้างเมื่อ:</span>
                <span>{new Date(keyToDelete.created_at).toLocaleDateString('th-TH')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setKeyToDelete(null)}
                disabled={isDeletingKey}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5"
                onClick={handleConfirmDeleteKey}
                disabled={isDeletingKey}
              >
                <Trash2 className={`w-4 h-4 ${isDeletingKey ? 'animate-spin' : ''}`} />
                <span>{isDeletingKey ? 'กำลังเพิกถอน...' : 'ยืนยันเพิกถอน Key'}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: API KEY TRAFFIC & REQUEST LOGS MODAL */}
      {/* ========================================================================= */}
      {selectedKeyForLogs && (
        <Modal
          isOpen={!!selectedKeyForLogs}
          onClose={() => setSelectedKeyForLogs(null)}
          title={`📊 ประวัติการเรียกใช้ & Traffic: ${selectedKeyForLogs.name}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl">
              <div>
                <div className="text-xs text-slate-400 font-medium">กุญแจที่เลือกตรวจสอบ</div>
                <div className="text-base font-bold flex items-center gap-2 mt-0.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>{selectedKeyForLogs.name}</span>
                </div>
                <div className="text-xs font-mono text-indigo-300 mt-1">
                  {selectedKeyForLogs.masked_key}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  onClick={() => fetchKeyLogs(selectedKeyForLogs.id, keyLogsStatusFilter)}
                  disabled={isLoadingKeyLogs}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingKeyLogs ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>รีเฟรชประวัติ</span>
                </Button>
              </div>
            </div>

            {/* Metrics Overview */}
            {keyLogsStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> 7 วันล่าสุด
                  </div>
                  <div className="text-xl font-black text-indigo-950 mt-1">
                    {keyLogsStats.total_7d.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-indigo-700/80 mt-0.5">Total API Requests</div>
                </div>

                <div className="bg-sky-50/70 border border-sky-100 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-sky-600 uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 24 ชม. ล่าสุด
                  </div>
                  <div className="text-xl font-black text-sky-950 mt-1">
                    {keyLogsStats.total_24h.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-sky-700/80 mt-0.5">Traffic 24h</div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Success Rate
                  </div>
                  <div className="text-xl font-black text-emerald-950 mt-1">
                    {keyLogsStats.success_rate}%
                  </div>
                  <div className="text-[10px] text-emerald-700/80 mt-0.5">{keyLogsStats.success_count} ครั้ง สำเร็จ</div>
                </div>

                <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-amber-600 uppercase flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Avg Latency
                  </div>
                  <div className="text-xl font-black text-amber-950 mt-1">
                    {keyLogsStats.avg_latency_ms} <span className="text-xs font-normal">ms</span>
                  </div>
                  <div className="text-[10px] text-amber-700/80 mt-0.5">ความเร็วเฉลี่ย</div>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 border-b pb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setKeyLogsStatusFilter('all');
                    fetchKeyLogs(selectedKeyForLogs.id, 'all');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    keyLogsStatusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ทั้งหมด ({keyLogsStats?.total_7d || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKeyLogsStatusFilter('success');
                    fetchKeyLogs(selectedKeyForLogs.id, 'success');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    keyLogsStatusFilter === 'success'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  🟢 สำเร็จ ({keyLogsStats?.success_count || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKeyLogsStatusFilter('error');
                    fetchKeyLogs(selectedKeyForLogs.id, 'error');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    keyLogsStatusFilter === 'error'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  🔴 ผิดพลาด ({keyLogsStats?.error_count || 0})
                </button>
              </div>

              <span className="text-xs text-gray-400 font-mono">
                แสดง 50 รายการล่าสุด
              </span>
            </div>

            {/* Request Timeline Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-2xl max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 border-b border-gray-200 font-bold">
                  <tr>
                    <th className="px-3.5 py-2.5">เวลา (Timestamp)</th>
                    <th className="px-3.5 py-2.5">สถานะ</th>
                    <th className="px-3.5 py-2.5">Method & Endpoint</th>
                    <th className="px-3.5 py-2.5">Client IP</th>
                    <th className="px-3.5 py-2.5">Latency</th>
                    <th className="px-3.5 py-2.5 text-right">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoadingKeyLogs ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                        กำลังโหลดประวัติการเรียกใช้ API...
                      </td>
                    </tr>
                  ) : keyLogsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 space-y-2">
                        <BarChart3 className="w-8 h-8 mx-auto text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">ไม่พบประวัติการเรียกใช้ในช่วงเวลานี้</p>
                        <p className="text-xs text-gray-400">เมื่อระบบ IT หรือ Sandbox มีการยิง API ระบบจะบันทึก Log แสดงที่นี่แบบ Real-time</p>
                      </td>
                    </tr>
                  ) : (
                    keyLogsList.map((log) => (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="px-3.5 py-2.5 whitespace-nowrap text-gray-600 font-mono text-[11px]">
                            {new Date(log.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}{' '}
                            {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              log.status_code >= 200 && log.status_code < 300
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status_code >= 400 && log.status_code < 500
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {log.status_code} {log.status_code === 200 ? 'OK' : log.status_code === 401 ? 'Unauthorized' : log.status_code === 400 ? 'Bad Req' : 'Error'}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                log.http_method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {log.http_method}
                              </span>
                              <span className="font-mono text-gray-800 truncate max-w-[200px]" title={log.endpoint}>
                                {log.endpoint}
                              </span>
                            </div>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                            {log.ip_address || '-'}
                          </td>
                          <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px] text-gray-600">
                            {log.response_time_ms ? `${log.response_time_ms} ms` : '-'}
                          </td>
                          <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{expandedLogId === log.id ? 'ย่อ' : 'ดูรายละเอียด'}</span>
                              {expandedLogId === log.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Accordion Detail */}
                        {expandedLogId === log.id && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={6} className="px-4 py-3 border-t border-dashed border-gray-200">
                              <div className="space-y-2 text-xs">
                                {log.summary && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-400 font-semibold shrink-0">ผลลัพธ์:</span>
                                    <span className="text-gray-900 font-medium">{log.summary}</span>
                                  </div>
                                )}
                                {log.error_message && (
                                  <div className="flex items-start gap-2 text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{log.error_message}</span>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                                  <div className="bg-white p-2 rounded border border-gray-200">
                                    <div className="text-gray-400 font-sans font-bold text-[10px] uppercase mb-1">User-Agent</div>
                                    <div className="text-gray-700 break-all">{log.user_agent || '-'}</div>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-gray-200">
                                    <div className="text-gray-400 font-sans font-bold text-[10px] uppercase mb-1">Query Parameters</div>
                                    <div className="text-gray-700 break-all">{JSON.stringify(log.query_params || {})}</div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedKeyForLogs(null)}
              >
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: LOG RETENTION & CLEANUP MODAL */}
      {/* ========================================================================= */}
      {showRetentionModal && (
        <Modal
          isOpen={showRetentionModal}
          onClose={() => setShowRetentionModal(false)}
          title="🧹 จัดการพื้นที่และนโยบายล้าง Log (Retention & Cleanup)"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm flex items-center gap-2 text-indigo-300">
                  <HardDrive className="w-4 h-4 text-indigo-400" />
                  <span>ขนาดพื้นที่และจำนวน Log ในระบบปัจจุบัน</span>
                </div>
                <button
                  type="button"
                  onClick={fetchStorageStats}
                  className="text-xs text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400">Activity Logs</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {(storageStats?.system_activity_logs || 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400">API Key Traffic</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {(storageStats?.system_api_key_logs || 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400">App Logs</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {(storageStats?.application_logs || 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <div className="text-[10px] text-slate-400">QR Logs</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {(storageStats?.qr_logs || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center border-t border-slate-800 pt-2 font-mono">
                รวมทั้งหมด: <strong className="text-white">{(storageStats?.total_log_rows || 0).toLocaleString()}</strong> แถว
              </div>
            </div>

            {/* Retention Policy Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                เลือกอายุ Log ที่ต้องการเก็บรักษา (Retention Policy):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { days: 30, label: '30 วัน', desc: 'ลบ Log ที่เก่ากว่า 1 เดือน' },
                  { days: 60, label: '60 วัน', desc: 'ลบ Log ที่เก่ากว่า 2 เดือน' },
                  { days: 90, label: '90 วัน', desc: 'ลบ Log ที่เก่ากว่า 3 เดือน' },
                ].map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => setSelectedRetentionDays(opt.days)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedRetentionDays === opt.days
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-bold text-sm text-gray-900">{opt.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto cleanup note */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ระบบ Auto-Cleanup ทำงานให้อัตโนมัติทุกสัปดาห์</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Vercel Cron จะสั่งล้าง Log เก่าเป็นประจำทุกวันอาทิตย์ เวลา 04:00 น. หรือคุณสามารถกดปุ่มด้านล่างเพื่อล้างทันทีได้ตลอดเวลา
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRetentionModal(false)}
                disabled={isCleaningLogs}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
                onClick={() => handleExecuteCleanup(selectedRetentionDays)}
                disabled={isCleaningLogs}
              >
                <Trash2 className={`w-4 h-4 ${isCleaningLogs ? 'animate-spin' : ''}`} />
                <span>{isCleaningLogs ? 'กำลังล้างข้อมูล...' : `ล้าง Log เก่ากว่า ${selectedRetentionDays} วัน`}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
