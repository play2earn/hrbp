import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, Clock, XCircle, FileText, X, CreditCard, Hash } from 'lucide-react';
import { Button } from './UIComponents';
import { api } from '../services/api';

interface TrackingSystemProps {
    isOpen: boolean;
    onClose: () => void;
    lang?: 'en' | 'th';
}

export default function TrackingSystem({ isOpen, onClose, lang = 'en' }: TrackingSystemProps) {
    const [searchInput, setSearchInput] = useState('');
    const [searchMode, setSearchMode] = useState<'tracking' | 'id_passport'>('tracking');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timelines, setTimelines] = useState<Record<string, any[]>>({});

    if (!isOpen) return null;

    const t = {
        title: lang === 'th' ? 'ตรวจสอบสถานะใบสมัคร' : 'Check Application Status',
        trackingLabel: lang === 'th' ? 'หมายเลขติดตาม' : 'Tracking ID',
        idPassportLabel: lang === 'th' ? 'บัตรประชาชน / Passport' : 'ID / Passport',
        trackingPlaceholder: 'e.g. a1b2-c3d4...',
        idPassportPlaceholder: lang === 'th' ? 'เลขบัตรประชาชน / หมายเลขหนังสือเดินทาง' : 'National ID or Passport No.',
        notFound: lang === 'th' ? 'ไม่พบข้อมูลใบสมัคร' : 'Application not found or invalid ID.',
        systemError: lang === 'th' ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'System error. Please try again.',
        applicant: lang === 'th' ? 'ผู้สมัคร' : 'Applicant',
        position: lang === 'th' ? 'ตำแหน่ง' : 'Position',
        department: lang === 'th' ? 'แผนก' : 'Department',
        lastUpdated: lang === 'th' ? 'อัปเดตล่าสุด' : 'Last Updated',
        resultsCount: lang === 'th' ? 'พบใบสมัคร' : 'Found',
        entries: lang === 'th' ? 'รายการ' : 'application(s)',
        statusLabels: {
            Pending: lang === 'th' ? 'รอดำเนินการ' : 'Pending',
            Reviewing: lang === 'th' ? 'กำลังพิจารณา' : 'Reviewing',
            Interview: lang === 'th' ? 'นัดสัมภาษณ์' : 'Interview',
            InterviewScheduled: lang === 'th' ? 'นัดสัมภาษณ์' : 'Interview Scheduled',
            Interviewed: lang === 'th' ? 'สัมภาษณ์แล้ว' : 'Interviewed',
            Offer: lang === 'th' ? 'ได้รับข้อเสนอ' : 'Offer',
            Rejected: lang === 'th' ? 'ไม่ผ่าน' : 'Rejected',
            Withdrawn: lang === 'th' ? 'ผู้สมัครยกเลิก' : 'Withdrawn',
            NoShow: lang === 'th' ? 'ไม่มาตามนัด' : 'No show',
            Hired: lang === 'th' ? 'รับเข้าทำงาน' : 'Hired',
        } as Record<string, string>,
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        setLoading(true);
        setError('');
        setResults([]);

        try {
            if (searchMode === 'id_passport') {
                // Search by national ID or passport
                const trimmed = searchInput.trim();
                if (!trimmed) { setLoading(false); return; }
                const { data, error: apiError } = await api.trackByIdOrPassport(trimmed);
                if (apiError) {
                    setError(t.notFound);
                } else if (data && data.length > 0) {
                    setResults(data);
                    // Load timelines for each result
                    data.forEach((app: any) => {
                        api.getApplicationTimeline(app.id).then((logs) => {
                            setTimelines(prev => ({ ...prev, [app.id]: logs }));
                        });
                    });
                } else {
                    setError(t.notFound);
                }
            } else {
                // Search by tracking ID (UUID)
                const { data, error: apiError } = await api.trackApplication(searchInput.trim());
                if (apiError) {
                    setError(t.notFound);
                } else if (data && (data as any).error) {
                    setError((data as any).error);
                } else if (data) {
                    setResults([data]);
                    // Load timeline
                    api.getApplicationTimeline((data as any).id).then((logs) => {
                        setTimelines(prev => ({ ...prev, [(data as any).id]: logs }));
                    });
                } else {
                    setError(t.notFound);
                }
            }
        } catch (err) {
            console.error(err);
            setError(t.systemError);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Interview': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'InterviewScheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Interviewed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Reviewing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Offer': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'Withdrawn': return 'bg-red-100 text-red-800 border-red-200';
            case 'NoShow': return 'bg-red-100 text-red-800 border-red-200';
            case 'Hired': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'Pending': return <Clock className="w-5 h-5" />;
            case 'Rejected': return <XCircle className="w-5 h-5" />;
            case 'Hired':
            case 'Offer': return <CheckCircle2 className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Search className="w-5 h-5 text-indigo-600" />
                        {t.title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Search Mode Toggle */}
                    <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
                        <button
                            onClick={() => { setSearchMode('tracking'); setError(''); setResults([]); setSearchInput(''); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${searchMode === 'tracking' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Hash className="w-3.5 h-3.5" /> {t.trackingLabel}
                        </button>
                        <button
                            onClick={() => { setSearchMode('id_passport'); setError(''); setResults([]); setSearchInput(''); }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${searchMode === 'id_passport' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <CreditCard className="w-3.5 h-3.5" /> {t.idPassportLabel}
                        </button>
                    </div>

                    <form onSubmit={handleTrack} className="mb-4 relative">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={searchMode === 'tracking' ? t.trackingPlaceholder : t.idPassportPlaceholder}
                                maxLength={50}
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                            />
                            <div className="absolute right-2 top-2">
                                <Button type="submit" disabled={loading} size="sm" className="h-8 w-8 p-0 rounded-lg flex items-center justify-center">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Result Area */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                            <XCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {results.length > 1 && (
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {t.resultsCount} {results.length} {t.entries}
                                </p>
                            )}
                            {results.map((status, idx) => (
                                <div key={idx} className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2">
                                    <div className={`p-3 border-b flex items-center gap-3 ${getStatusColor(status.status)} bg-opacity-20`}>
                                        {getStatusIcon(status.status)}
                                        <span className="font-bold text-base">{t.statusLabels[status.status] || status.status}</span>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold">{t.applicant}</p>
                                            <p className="font-medium text-slate-900">{status.full_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">{t.position}</p>
                                                <p className="font-medium text-slate-900 text-sm">{status.position || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold">{t.department}</p>
                                                <p className="font-medium text-slate-900 text-sm">{status.department || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100">
                                            <p className="text-xs text-gray-400">{t.lastUpdated}: {new Date(status.updated_at || status.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        {/* Public Timeline */}
                                        {timelines[status.id] && timelines[status.id].length > 0 && (
                                            <div className="pt-3 mt-2 border-t border-slate-100">
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-2">{lang === 'th' ? 'ไทม์ไลน์' : 'Timeline'}</p>
                                                <div className="space-y-0">
                                                    {timelines[status.id].map((log: any, i: number) => {
                                                        const isSubmit = log.action === 'submitted';
                                                        const statusLabel = t.statusLabels[log.new_value] || log.new_value || '';
                                                        return (
                                                            <div key={log.id} className="flex gap-2.5">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-2.5 h-2.5 rounded-full mt-1 ${isSubmit ? 'bg-green-400' : 'bg-indigo-400'}`} />
                                                                    {i < timelines[status.id].length - 1 && <div className="w-px flex-1 bg-gray-200 my-0.5" />}
                                                                </div>
                                                                <div className="pb-3 min-w-0">
                                                                    <p className="text-xs font-medium text-slate-700">
                                                                        {isSubmit ? (lang === 'th' ? 'ได้รับใบสมัครเรียบร้อย' : 'Application received') : statusLabel}
                                                                        {log.metadata?.interview_date && (log.new_value === 'Interview' || log.new_value === 'InterviewScheduled') && (
                                                                            <span className="text-indigo-600 block mt-0.5 font-semibold text-[11px]">
                                                                                {lang === 'th' ? 'วันที่นัดหมาย: ' : 'Date: '}
                                                                                {new Date(log.metadata.interview_date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-[10px] text-gray-400">
                                                                        {lang === 'th' ? 'บันทึกเมื่อ: ' : 'Recorded: '}
                                                                        {new Date(log.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
