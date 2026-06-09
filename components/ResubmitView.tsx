import React, { useState, useEffect, useRef } from 'react';
import {
    Shield, Upload, CheckCircle2, XCircle, Loader2,
    FileText, Image as ImageIcon, Lock, AlertTriangle, ChevronRight
} from 'lucide-react';
import { uploadToR2 } from '../utils/r2-upload';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResubmitViewProps {
    token: string;
}

type ViewState = 'loading' | 'pin' | 'upload' | 'success' | 'error';

interface UploadedFile {
    file: File;
    previewUrl?: string;
    uploading: boolean;
    uploadedUrl?: string;
    error?: string;
}

const FIELD_CONFIG: Record<string, { label: string; labelEn: string; icon: React.ReactNode; accept: string; hint: string }> = {
    resumeUrl:       { label: 'Resume / CV',                   labelEn: 'Resume / CV',             icon: <FileText className="w-5 h-5" />,  accept: '.pdf,.doc,.docx', hint: 'PDF, DOC (ไม่เกิน 10MB)' },
    transcriptUrl:   { label: 'Transcript / ใบแสดงผลการเรียน', labelEn: 'Transcript / Grade Report',icon: <FileText className="w-5 h-5" />,  accept: '.pdf,.jpg,.png',  hint: 'PDF, JPG, PNG (ไม่เกิน 10MB)' },
    certificateUrl:  { label: 'Certificate / เอกสารเพิ่มเติม', labelEn: 'Certificate / Other Docs', icon: <FileText className="w-5 h-5" />,  accept: '.pdf,.jpg,.png',  hint: 'PDF, JPG, PNG (ไม่เกิน 10MB)' },
    photoUrl:        { label: 'รูปถ่าย',                        labelEn: 'Profile Photo',            icon: <ImageIcon className="w-5 h-5" />, accept: '.jpg,.jpeg,.png', hint: 'JPG, PNG (ไม่เกิน 5MB)' },
};

// ─── PIN Input Component ───────────────────────────────────────────────────────

function PinInput({ length = 4, value, onChange, disabled }: {
    length?: number; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!value[i] && i > 0) {
                const next = value.split('');
                next[i - 1] = '';
                onChange(next.join(''));
                refs.current[i - 1]?.focus();
            } else {
                const next = value.split('');
                next[i] = '';
                onChange(next.join(''));
            }
        }
    };

    const handleChange = (i: number, char: string) => {
        const clean = char.replace(/[^0-9a-zA-Z]/g, '').slice(-1);
        const next = (value || '').split('').slice(0, length);
        while (next.length < length) next.push('');
        next[i] = clean.toLowerCase();
        onChange(next.join(''));
        if (clean && i < length - 1) refs.current[i + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/[^0-9a-zA-Z]/g, '').slice(0, length).toLowerCase();
        const next = pasted.split('').concat(Array(length).fill('')).slice(0, length);
        onChange(next.join(''));
        const lastFilled = Math.min(pasted.length, length - 1);
        refs.current[lastFilled]?.focus();
    };

    return (
        <div className="flex gap-3 justify-center">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={1}
                    value={(value || '')[i] || ''}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl bg-slate-50
                               border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all outline-none"
                />
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ResubmitView({ token }: ResubmitViewProps) {
    const [state, setState] = useState<ViewState>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    // Token metadata (loaded on mount)
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenExpiry, setTokenExpiry] = useState('');

    // PIN state
    const [pin1, setPin1] = useState('');   // last4 ID/Passport
    const [pin2, setPin2] = useState('');   // last4 phone
    const [pinError, setPinError] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [pinLoading, setPinLoading] = useState(false);
    const [isForeignerHint, setIsForeignerHint] = useState(false);

    // Upload state (after PIN success)
    const [applicationId, setApplicationId] = useState('');
    const [allowedFields, setAllowedFields] = useState<string[]>([]);
    const [uploads, setUploads] = useState<Record<string, UploadedFile | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // ── Validate token on mount (just check it exists and is not expired)
    useEffect(() => {
        const checkToken = async () => {
            try {
                // We do a lightweight check — the token will be fully validated on PIN verify
                // For now just check the URL token is present
                if (!token || token.length < 32) {
                    setState('error');
                    setErrorMsg('ลิงก์ไม่ถูกต้อง');
                    return;
                }
                setState('pin');
                setTokenValid(true);
            } catch {
                setState('error');
                setErrorMsg('เกิดข้อผิดพลาดในการตรวจสอบลิงก์');
            }
        };
        checkToken();
    }, [token]);

    // ── Handle PIN submit
    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin1.length < 4 || pin2.length < 4) {
            setPinError('กรุณากรอก PIN ให้ครบทั้ง 2 ช่อง');
            return;
        }
        setPinLoading(true);
        setPinError('');

        try {
            const res = await fetch('/api/verify-resubmit-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, pin1, pin2 }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setApplicationId(data.applicationId);
                setAllowedFields(data.allowedFields || []);
                // Init upload slots
                const slots: Record<string, UploadedFile | null> = {};
                (data.allowedFields || []).forEach((f: string) => { slots[f] = null; });
                setUploads(slots);
                setState('upload');
            } else if (res.status === 410) {
                setState('error');
                setErrorMsg(data.error || 'ลิงก์นี้ถูกใช้งานไปแล้ว');
            } else if (res.status === 404) {
                setState('error');
                setErrorMsg(data.error || 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว');
            } else if (res.status === 423) {
                setPinError(data.error || 'บัญชีถูกล็อกชั่วคราว กรุณาลองใหม่ภายหลัง');
                setAttemptsLeft(0);
            } else {
                setPinError(data.error || 'PIN ไม่ถูกต้อง');
                if (typeof data.attemptsLeft === 'number') setAttemptsLeft(data.attemptsLeft);
            }
        } catch {
            setPinError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
        } finally {
            setPinLoading(false);
        }
    };

    // ── Handle file selection and immediate upload to R2
    const handleFileSelect = async (field: string, file: File) => {
        setUploads(prev => ({
            ...prev,
            [field]: { file, uploading: true, previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined }
        }));

        try {
            // Upload directly to R2 under the application's permanent folder
            const url = await uploadToR2(file, `applications/${applicationId}`);
            setUploads(prev => ({
                ...prev,
                [field]: { ...prev[field]!, uploading: false, uploadedUrl: url }
            }));
        } catch (err: any) {
            setUploads(prev => ({
                ...prev,
                [field]: { ...prev[field]!, uploading: false, error: err.message || 'อัปโหลดล้มเหลว' }
            }));
        }
    };

    // ── Handle final submit
    const handleSubmit = async () => {
        const uploadedFields: Record<string, string> = {};
        for (const [field, up] of Object.entries(uploads)) {
            if (up?.uploadedUrl) uploadedFields[field] = up.uploadedUrl;
        }

        if (Object.keys(uploadedFields).length === 0) {
            setSubmitError('กรุณาอัปโหลดเอกสารอย่างน้อย 1 ไฟล์');
            return;
        }

        setSubmitting(true);
        setSubmitError('');

        try {
            const res = await fetch('/api/complete-resubmit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, applicationId, uploadedFields }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setState('success');
            } else if (res.status === 410) {
                setState('error');
                setErrorMsg(data.error || 'ลิงก์นี้ถูกใช้งานไปแล้ว');
            } else {
                setSubmitError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
            }
        } catch {
            setSubmitError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
        } finally {
            setSubmitting(false);
        }
    };

    const anyUploading = Object.values(uploads).some(u => u?.uploading);
    const anyUploaded = Object.values(uploads).some(u => u?.uploadedUrl);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">

                {/* Logo / Branding */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-3">
                        <Upload className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">ระบบอัปโหลดเอกสาร</h1>
                    <p className="text-sm text-slate-500 mt-1">HR Recruitment Portal</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* ── State: Loading ── */}
                    {state === 'loading' && (
                        <div className="p-8 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-slate-500">กำลังตรวจสอบลิงก์...</p>
                        </div>
                    )}

                    {/* ── State: Error ── */}
                    {state === 'error' && (
                        <div className="p-8 flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-9 h-9 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-1">ไม่สามารถเข้าถึงได้</h2>
                                <p className="text-sm text-slate-500">{errorMsg}</p>
                            </div>
                            <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 w-full">
                                หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อเจ้าหน้าที่ HR
                            </p>
                        </div>
                    )}

                    {/* ── State: PIN Gate ── */}
                    {state === 'pin' && (
                        <form onSubmit={handlePinSubmit}>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 text-white">
                                <div className="flex items-center gap-3 mb-1">
                                    <Shield className="w-5 h-5 opacity-80" />
                                    <h2 className="font-bold text-lg">ยืนยันตัวตน</h2>
                                </div>
                                <p className="text-indigo-200 text-sm">กรุณากรอก PIN เพื่อเข้าถึงการอัปโหลดเอกสาร</p>
                            </div>

                            <div className="p-6 space-y-7">

                                {/* Toggle Thai / Foreigner hint */}
                                <div className="flex rounded-xl bg-slate-100 p-1">
                                    <button type="button"
                                        onClick={() => { setIsForeignerHint(false); setPin1(''); setPinError(''); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isForeignerHint ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'}`}
                                    >🇹🇭 บัตรประชาชน</button>
                                    <button type="button"
                                        onClick={() => { setIsForeignerHint(true); setPin1(''); setPinError(''); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isForeignerHint ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500'}`}
                                    >🌏 Passport</button>
                                </div>

                                {/* PIN 1: ID / Passport last 4 */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-0.5">
                                            {isForeignerHint ? '4 ตัวท้ายหมายเลข Passport' : '4 ตัวท้ายเลขบัตรประชาชน'}
                                        </label>
                                        <p className="text-xs text-slate-400 mb-3">
                                            {isForeignerHint
                                                ? 'ตัวอักษร/ตัวเลข 4 หลักสุดท้ายของ Passport No. เช่น AA123456 → ใส่ 3456'
                                                : 'เลขบัตรประชาชน 13 หลัก → ใส่ 4 หลักสุดท้าย เช่น X-XXXX-XXXXX-XX-9 → ใส่ 0009'}
                                        </p>
                                        <PinInput value={pin1} onChange={setPin1} disabled={pinLoading} />
                                    </div>

                                    {/* PIN 2: Phone last 4 */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-0.5">
                                            4 ตัวท้ายเบอร์โทรศัพท์
                                        </label>
                                        <p className="text-xs text-slate-400 mb-3">
                                            เบอร์โทรที่ลงทะเบียนไว้ เช่น 08X-XXX-3456 → ใส่ 3456
                                        </p>
                                        <PinInput value={pin2} onChange={setPin2} disabled={pinLoading} />
                                    </div>
                                </div>

                                {/* Error */}
                                {pinError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-in slide-in-from-top-1">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <div>
                                            <p>{pinError}</p>
                                            {attemptsLeft !== null && attemptsLeft > 0 && (
                                                <p className="text-xs mt-0.5 text-red-400">เหลืออีก {attemptsLeft} ครั้งก่อนถูกล็อก</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={pinLoading || pin1.length < 4 || pin2.length < 4}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                                               text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {pinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                                    {pinLoading ? 'กำลังตรวจสอบ...' : 'ยืนยัน PIN'}
                                </button>

                                <p className="text-center text-xs text-slate-400">
                                    ล็อกอัตโนมัติหลังกรอกผิด 5 ครั้ง เพื่อความปลอดภัย
                                </p>
                            </div>
                        </form>
                    )}

                    {/* ── State: Upload Zone ── */}
                    {state === 'upload' && (
                        <div>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
                                <div className="flex items-center gap-3 mb-1">
                                    <Upload className="w-5 h-5 opacity-80" />
                                    <h2 className="font-bold text-lg">อัปโหลดเอกสารใหม่</h2>
                                </div>
                                <p className="text-emerald-100 text-sm">เลือกไฟล์ใหม่เพื่อแทนที่เอกสารเดิม</p>
                            </div>

                            <div className="p-6 space-y-4">
                                {allowedFields.map((field) => {
                                    const cfg = FIELD_CONFIG[field];
                                    if (!cfg) return null;
                                    const up = uploads[field];

                                    return (
                                        <div key={field} className={`border-2 rounded-xl p-4 transition-all ${up?.uploadedUrl ? 'border-emerald-300 bg-emerald-50' : up?.error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`${up?.uploadedUrl ? 'text-emerald-600' : 'text-slate-500'}`}>{cfg.icon}</span>
                                                <span className="font-semibold text-sm text-slate-700">{cfg.label}</span>
                                                {up?.uploadedUrl && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                                                {up?.uploading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-auto" />}
                                            </div>

                                            {up?.error && (
                                                <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
                                                    <AlertTriangle className="w-3.5 h-3.5" /> {up.error}
                                                </p>
                                            )}

                                            {up?.uploadedUrl ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {up.previewUrl && <img src={up.previewUrl} alt="" className="w-10 h-10 object-cover rounded-lg border" />}
                                                        <p className="text-xs text-emerald-700 font-medium truncate max-w-[180px]">{up.file.name}</p>
                                                    </div>
                                                    <label className="cursor-pointer text-xs text-slate-500 hover:text-indigo-600 underline transition-colors">
                                                        เปลี่ยนไฟล์
                                                        <input type="file" className="hidden" accept={cfg.accept}
                                                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(field, f); e.target.value = ''; }} />
                                                    </label>
                                                </div>
                                            ) : (
                                                <label className={`flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${up?.uploading ? 'border-indigo-300 bg-indigo-50 cursor-wait' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'}`}>
                                                    {up?.uploading ? (
                                                        <><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /><span className="text-sm text-indigo-500">กำลังอัปโหลด...</span></>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-6 h-6 text-slate-400" />
                                                            <span className="text-sm text-slate-500">คลิกเพื่อเลือกไฟล์</span>
                                                            <span className="text-xs text-slate-400">{cfg.hint}</span>
                                                        </>
                                                    )}
                                                    <input type="file" className="hidden" accept={cfg.accept} disabled={up?.uploading}
                                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(field, f); e.target.value = ''; }} />
                                                </label>
                                            )}
                                        </div>
                                    );
                                })}

                                {submitError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {submitError}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || anyUploading || !anyUploaded}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                                               text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    {submitting ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
                                </button>

                                <p className="text-center text-xs text-slate-400">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    ลิงก์นี้ใช้ได้เพียงครั้งเดียว หลังบันทึกจะหมดอายุทันที
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── State: Success ── */}
                    {state === 'success' && (
                        <div className="p-8 flex flex-col items-center gap-5 text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-11 h-11 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">อัปโหลดสำเร็จ! 🎉</h2>
                                <p className="text-slate-500 text-sm">เอกสารของคุณถูกบันทึกเรียบร้อยแล้ว</p>
                                <p className="text-slate-400 text-sm mt-1">ทีม HR จะตรวจสอบเอกสารและติดต่อกลับหากมีข้อสอบถาม</p>
                            </div>
                            <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-1.5">
                                {Object.entries(uploads).map(([field, up]) => up?.uploadedUrl && (
                                    <div key={field} className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>{FIELD_CONFIG[field]?.label || field}</span>
                                        <span className="text-slate-400 text-xs truncate">— {up.file.name}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> ลิงก์นี้ถูกปิดการใช้งานแล้ว ไม่สามารถใช้ซ้ำได้
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
