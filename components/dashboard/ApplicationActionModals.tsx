import React from 'react';
import { Modal, Button } from '../UIComponents';
import { CheckCircle, XCircle, Calendar, Trash2, QrCode, Star } from 'lucide-react';
import { api } from '../../services/api';
import type { ApplicationStatus } from '../../services/api';

interface ActionModalsProps {
    currentUserId: string | null;
    currentUserName: string | null;
    activeUsers: any[];
    closeReasons: any[];
    showToast: (message: string, type: 'success' | 'error') => void;
    fetchData: () => void;

    // App states
    claimingApp: any | null;
    setClaimingApp: (app: any | null) => void;

    unassigningApp: any | null;
    setUnassigningApp: (app: any | null) => void;

    transferringApp: any | null;
    setTransferringApp: (app: any | null) => void;
    transferTarget: string;
    setTransferTarget: (val: string) => void;

    rejectingApp: any | null;
    setRejectingApp: (app: any | null) => void;
    rejectionReason: string;
    setRejectionReason: (val: string) => void;
    rejectComment: string;
    setRejectComment: (val: string) => void;

    approvingApp: any | null;
    setApprovingApp: (app: any | null) => void;

    interviewingApp: any | null;
    setInterviewingApp: (app: any | null) => void;
    interviewDate: string;
    setInterviewDate: (val: string) => void;

    deletingApp: any | null;
    setDeletingApp: (app: any | null) => void;
    isDeleting: boolean;
    handleDeleteApplication: () => void;

    confirmQrAction: 'empty' | 'filled' | null;
    setConfirmQrAction: (val: 'empty' | 'filled' | null) => void;
    executeGenerateLink: () => void;

    evaluatingApp: any | null;
    setEvaluatingApp: (app: any | null) => void;
}

const RatingInput = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-150">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-5 h-5 ${
                                star <= value
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

export const ApplicationActionModals: React.FC<ActionModalsProps> = ({
    currentUserId, currentUserName, activeUsers, closeReasons, showToast, fetchData,
    claimingApp, setClaimingApp,
    unassigningApp, setUnassigningApp,
    transferringApp, setTransferringApp, transferTarget, setTransferTarget,
    rejectingApp, setRejectingApp, rejectionReason, setRejectionReason, rejectComment, setRejectComment,
    approvingApp, setApprovingApp,
    interviewingApp, setInterviewingApp, interviewDate, setInterviewDate,
    deletingApp, setDeletingApp, isDeleting, handleDeleteApplication,
    confirmQrAction, setConfirmQrAction, executeGenerateLink,
    evaluatingApp, setEvaluatingApp
}) => {
    const [startTime, setStartTime] = React.useState('10:00');
    const [endTime, setEndTime] = React.useState('11:00');
    const [teamsLink, setTeamsLink] = React.useState('');

    // Evaluation states
    const [ratingSkills, setRatingSkills] = React.useState(3);
    const [ratingAttitude, setRatingAttitude] = React.useState(3);
    const [ratingCulturalFit, setRatingCulturalFit] = React.useState(3);
    const [overallRec, setOverallRec] = React.useState('Hired'); // 'Hired' | 'Shortlisted' | 'Rejected' | 'Hold'
    const [evaluationComments, setEvaluationComments] = React.useState('');
    const [isSubmittingEval, setIsSubmittingEval] = React.useState(false);
    const [nextRound, setNextRound] = React.useState(1);

    // Pre-fill fields on open/reschedule
    React.useEffect(() => {
        if (interviewingApp) {
            if (interviewingApp.interview_start_time) {
                const start = new Date(interviewingApp.interview_start_time);
                setStartTime(start.toTimeString().slice(0, 5));
            } else {
                setStartTime('10:00');
            }
            if (interviewingApp.interview_end_time) {
                const end = new Date(interviewingApp.interview_end_time);
                setEndTime(end.toTimeString().slice(0, 5));
            } else {
                setEndTime('11:00');
            }
            setTeamsLink(interviewingApp.teams_meeting_url || '');
        }
    }, [interviewingApp]);

    // Reset evaluation form on open
    React.useEffect(() => {
        if (evaluatingApp) {
            setRatingSkills(3);
            setRatingAttitude(3);
            setRatingCulturalFit(3);
            setOverallRec('Hired');
            setEvaluationComments('');
            setIsSubmittingEval(false);
            setNextRound(1);

            // Fetch existing evaluations to determine next round number
            api.evaluations.getByApplicationId(evaluatingApp.id)
                .then(res => {
                    const count = Array.isArray(res) ? res.length : 0;
                    setNextRound(count + 1);
                })
                .catch(err => {
                    console.error("Failed to query evaluation round count", err);
                });
        }
    }, [evaluatingApp]);
    return (
        <>
            <Modal
                isOpen={!!approvingApp}
                onClose={() => setApprovingApp(null)}
                title="รับผู้สมัครเข้าทำงาน"
                footer={null}
            >
                {approvingApp && (
                    <div className="space-y-4">
                        <div className="text-center py-2">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-gray-700">
                                คุณต้องการรับ <strong>{approvingApp.full_name || approvingApp.form_data?.firstName}</strong> เข้าทำงานใช่หรือไม่?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                ตำแหน่ง: {approvingApp.position || approvingApp.form_data?.position || '-'}
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setApprovingApp(null)}>ยกเลิก</Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={async () => {
                                    if (!currentUserId) {
                                        showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                        return;
                                    }
                                    const result = await api.updateApplicationStatus(approvingApp.id, 'Hired', {
                                        performedByUserId: currentUserId,
                                        performedByName: currentUserName,
                                    });
                                    if (!result.success) {
                                        showToast(result.error?.message || 'รับผู้สมัครไม่สำเร็จ', 'error');
                                        return;
                                    }
                                    setApprovingApp(null);
                                    showToast('รับผู้สมัครเข้าทำงานเรียบร้อย!', 'success');
                                    fetchData();
                                }}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> ยืนยันรับเข้าทำงาน
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!interviewingApp}
                onClose={() => setInterviewingApp(null)}
                title="นัดสัมภาษณ์ผู้สมัคร"
                footer={null}
            >
                {interviewingApp && (
                    <div className="space-y-4">
                        <div className="text-center py-2">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                            <p className="text-gray-700">
                                นัดสัมภาษณ์ <strong>{interviewingApp.full_name || interviewingApp.form_data?.firstName}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                ตำแหน่ง: {interviewingApp.position || interviewingApp.form_data?.position || '-'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่นัดสัมภาษณ์ <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                    value={interviewDate}
                                    onChange={(e) => setInterviewDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม (Start Time) <span className="text-red-500">*</span></label>
                                <input
                                    type="time"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุด (End Time) <span className="text-red-500">*</span></label>
                                <input
                                    type="time"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์การประชุม MS Teams (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://teams.microsoft.com/..."
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none font-mono text-xs"
                                    value={teamsLink}
                                    onChange={(e) => setTeamsLink(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setInterviewingApp(null)}>ยกเลิก</Button>
                            <Button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                disabled={!interviewDate || !startTime || !endTime}
                                onClick={async () => {
                                    if (!currentUserId) {
                                        showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                        return;
                                    }
                                    const startTimestamp = new Date(`${interviewDate}T${startTime}:00`).toISOString();
                                    const endTimestamp = new Date(`${interviewDate}T${endTime}:00`).toISOString();

                                    const result = await api.updateApplicationStatus(interviewingApp.id, 'InterviewScheduled', {
                                        performedByUserId: currentUserId,
                                        performedByName: currentUserName,
                                        interviewDate,
                                        interviewStartTime: startTimestamp,
                                        interviewEndTime: endTimestamp,
                                        teamsMeetingUrl: teamsLink,
                                    });
                                    if (!result.success) {
                                        showToast(result.error?.message || 'นัดสัมภาษณ์ไม่สำเร็จ', 'error');
                                        return;
                                    }
                                    setInterviewingApp(null);
                                    setInterviewDate('');
                                    setStartTime('10:00');
                                    setEndTime('11:00');
                                    setTeamsLink('');
                                    showToast('นัดสัมภาษณ์เรียบร้อย!', 'success');
                                    fetchData();
                                }}
                            >
                                <Calendar className="w-4 h-4 mr-2" /> ยืนยันนัดสัมภาษณ์
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!rejectingApp}
                onClose={() => setRejectingApp(null)}
                title="ปฏิเสธผู้สมัคร"
                footer={null}
            >
                {rejectingApp && (
                    <div className="space-y-4">
                        <div className="text-center py-2">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-gray-700">
                                คุณต้องการปฏิเสธ <strong>{rejectingApp.full_name || rejectingApp.form_data?.firstName}</strong> ใช่หรือไม่?
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">สาเหตุหลัก <span className="text-red-500">*</span></label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            >
                                <option value="">-- เลือกสาเหตุ --</option>
                                {(closeReasons.length > 0 ? closeReasons : [
                                    { code: 'failed_interview', label_th: 'ไม่ผ่านสัมภาษณ์', category: 'rejected' },
                                    { code: 'qualification_mismatch', label_th: 'คุณสมบัติไม่ตรง', category: 'rejected' },
                                    { code: 'salary_over_budget', label_th: 'เรียกเงินเดือนสูงเกินงบ', category: 'rejected' },
                                    { code: 'candidate_withdrew', label_th: 'ผู้สมัครยกเลิกเอง', category: 'withdrawn' },
                                    { code: 'no_show', label_th: 'ไม่มาตามนัดสัมภาษณ์', category: 'no_show' },
                                    { code: 'cannot_contact', label_th: 'ติดต่อไม่ได้', category: 'rejected' },
                                    { code: 'other', label_th: 'อื่นๆ', category: 'rejected' },
                                ]).map((reason: any) => (
                                    <option key={reason.code || reason.label_th} value={reason.label_th} data-category={reason.category}>
                                        {reason.label_th}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดเพิ่มเติม / หมายเหตุ</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                rows={3}
                                placeholder="ระบุเหตุผลเพิ่มเติม"
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setRejectingApp(null)}>ยกเลิก</Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={!rejectionReason}
                                onClick={async () => {
                                    if (!currentUserId) {
                                        showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                        return;
                                    }
                                    const optionElem = document.querySelector(`select option[value="${rejectionReason}"]`);
                                    const category = optionElem?.getAttribute('data-category') || 'rejected';
                                    let finalStatus = 'Rejected';
                                    if (category === 'withdrawn') finalStatus = 'Withdrawn';
                                    else if (category === 'no_show') finalStatus = 'NoShow';

                                    const result = await api.updateApplicationStatus(rejectingApp.id, finalStatus as ApplicationStatus, {
                                        performedByUserId: currentUserId,
                                        performedByName: currentUserName,
                                        rejectionReason,
                                        comment: rejectComment
                                    });
                                    if (!result.success) {
                                        showToast(result.error?.message || 'ปฏิเสธผู้สมัครไม่สำเร็จ', 'error');
                                        return;
                                    }
                                    setRejectingApp(null);
                                    setRejectionReason('');
                                    setRejectComment('');
                                    showToast('ปฏิเสธผู้สมัครเรียบร้อย', 'success');
                                    fetchData();
                                }}
                            >
                                ยืนยันปฏิเสธ
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!claimingApp} onClose={() => setClaimingApp(null)} title="ยืนยันการรับเคส (Claim)">
                {claimingApp && (
                    <div className="space-y-4">
                        <p>คุณต้องการรับเคส <strong>{claimingApp.full_name || claimingApp.form_data?.firstName}</strong> มาดูแลใช่หรือไม่?</p>
                        <div className="flex gap-3 justify-end pt-4">
                            <Button variant="outline" onClick={() => setClaimingApp(null)}>ยกเลิก</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={async () => {
                                if (!currentUserId) {
                                    showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                    return;
                                }
                                const result = await api.claimApplication(claimingApp.id, currentUserId);
                                if (!result.success) {
                                    showToast(result.error?.message || 'รับเคสไม่สำเร็จ', 'error');
                                    return;
                                }
                                setClaimingApp(null);
                                showToast('รับเคสเรียบร้อย', 'success');
                                fetchData();
                            }}>ยืนยัน</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!unassigningApp} onClose={() => setUnassigningApp(null)} title="ยกเลิกการรับเคส (Unassign)">
                {unassigningApp && (
                    <div className="space-y-4">
                        <p>คุณต้องการยกเลิกการดูแลเคส <strong>{unassigningApp.full_name || unassigningApp.form_data?.firstName}</strong> ใช่หรือไม่?</p>
                        <div className="flex gap-3 justify-end pt-4">
                            <Button variant="outline" onClick={() => setUnassigningApp(null)}>ยกเลิก</Button>
                            <Button className="bg-slate-600 hover:bg-slate-700 text-white" onClick={async () => {
                                if (!currentUserId) {
                                    showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                    return;
                                }
                                const result = await api.unassignApplication(unassigningApp.id, currentUserId);
                                if (!result.success) {
                                    showToast(result.error?.message || 'ยกเลิกการดูแลเคสไม่สำเร็จ', 'error');
                                    return;
                                }
                                setUnassigningApp(null);
                                showToast('ยกเลิกการดูแลเคสเรียบร้อย', 'success');
                                fetchData();
                            }}>ยืนยัน</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!transferringApp} onClose={() => setTransferringApp(null)} title="โอนเคสให้ผู้อื่น (Transfer)">
                {transferringApp && (
                    <div className="space-y-4">
                        <p>คุณต้องการโอนเคส <strong>{transferringApp.full_name || transferringApp.form_data?.firstName}</strong> ใช่หรือไม่?</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกผู้รับผิดชอบใหม่ <span className="text-red-500">*</span></label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={transferTarget}
                                onChange={(e) => setTransferTarget(e.target.value)}
                            >
                                <option value="">-- เลือก --</option>
                                {activeUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setTransferringApp(null)}>ยกเลิก</Button>
                            <Button disabled={!transferTarget} className="bg-blue-600 hover:bg-blue-700 text-white" onClick={async () => {
                                const targetUser = activeUsers.find((u: any) => u.id === transferTarget);
                                if (!currentUserId) {
                                    showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                    return;
                                }
                                if (targetUser) {
                                    const result = await api.transferApplication(transferringApp.id, targetUser.id, currentUserId);
                                    if (!result.success) {
                                        showToast(result.error?.message || 'โอนเคสไม่สำเร็จ', 'error');
                                        return;
                                    }
                                }
                                setTransferringApp(null);
                                setTransferTarget('');
                                showToast(`โอนเคสให้ ${targetUser?.full_name || ''} เรียบร้อย`, 'success');
                                fetchData();
                            }}>ยืนยันโอนเคส</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={!!deletingApp}
                onClose={() => !isDeleting && setDeletingApp(null)}
                title="ลบใบสมัคร"
                size="md"
            >
                <div className="text-center py-4 px-2">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการลบใบสมัคร</h3>
                    <p className="text-gray-500 mb-6">
                        คุณแน่ใจหรือไม่ที่จะลบใบสมัครของ <span className="font-bold text-gray-800">{deletingApp?.full_name || deletingApp?.form_data?.firstName}</span>?<br />
                        <span className="text-red-500 font-medium">คำเตือน: ไฟล์แนบ (รูป, Resume) จะถูกลบออกจาก Storage ทันทีเพื่อประหยัดพื้นที่ และไม่สามารถกู้คืนได้</span>
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setDeletingApp(null)} disabled={isDeleting}>ยกเลิก</Button>
                        <Button onClick={handleDeleteApplication} isLoading={isDeleting} className="bg-red-600 text-white hover:bg-red-700 border-none shadow-md">ยืนยันการลบ</Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!confirmQrAction}
                onClose={() => setConfirmQrAction(null)}
                title="ยืนยันการสร้าง QR Code"
                footer={null}
            >
                <div className="text-center py-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <p className="mb-6 text-gray-600">
                        {confirmQrAction === 'empty'
                             ? 'คุณยังไม่ได้เลือก Business Unit หรือ Channel ยืนยันที่จะสร้าง QR Code แบบไม่ระบุช่องทางหรือไม่?'
                             : 'ยืนยันการสร้าง QR Code ด้วยข้อมูลที่เลือก?'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setConfirmQrAction(null)}>ยกเลิก</Button>
                        <Button onClick={executeGenerateLink}>ยืนยัน</Button>
                    </div>
                </div>
            </Modal>

            {/* Evaluation Modal */}
            <Modal
                isOpen={!!evaluatingApp}
                onClose={() => setEvaluatingApp(null)}
                title={`แบบประเมินผลการสัมภาษณ์ รอบที่ ${nextRound}`}
                size="md"
                footer={null}
            >
                {evaluatingApp && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50">
                            <h4 className="font-semibold text-slate-800 text-sm">ผู้สมัคร: {evaluatingApp.full_name || evaluatingApp.form_data?.firstName}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">ตำแหน่ง: {evaluatingApp.position || '-'}</p>
                        </div>

                        {/* Rating Star inputs */}
                        <div className="space-y-1">
                            <RatingInput label="ทักษะและความสามารถ (Skills & Capability)" value={ratingSkills} onChange={setRatingSkills} />
                            <RatingInput label="ทัศนคติและแรงจูงใจ (Attitude & Motivation)" value={ratingAttitude} onChange={setRatingAttitude} />
                            <RatingInput label="ความเข้ากันได้กับองค์กร (Cultural Fit)" value={ratingCulturalFit} onChange={setRatingCulturalFit} />
                        </div>

                        {/* Overall Recommendation */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ผลการเสนอแนะ (Recommendation) <span className="text-red-500">*</span></label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                                value={overallRec}
                                onChange={(e) => setOverallRec(e.target.value)}
                            >
                                <option value="Hired">🟢 รับเข้าทำงาน (Recommend to Hire)</option>
                                <option value="Shortlisted">🟡 ผ่านการสัมภาษณ์ / รอการพิจารณา (Shortlist)</option>
                                <option value="Hold">🔵 พิจารณาเพิ่มเติม (Hold)</option>
                                <option value="Rejected">🔴 ไม่รับเข้าทำงาน (Reject)</option>
                            </select>
                        </div>

                        {/* Detailed Comments */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-750 mb-1.5">ความเห็นและข้อเสนอแนะเพิ่มเติม</label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows={4}
                                placeholder="ระบุเหตุผลในการประเมิน จุดเด่น หรือข้อควรระวัง..."
                                value={evaluationComments}
                                onChange={(e) => setEvaluationComments(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setEvaluatingApp(null)} disabled={isSubmittingEval}>ยกเลิก</Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                isLoading={isSubmittingEval}
                                onClick={async () => {
                                    if (!currentUserId) {
                                        showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                        return;
                                    }
                                    setIsSubmittingEval(true);
                                    try {
                                        const resEval = await api.evaluations.submit({
                                            application_id: evaluatingApp.id,
                                            interviewer_id: currentUserId,
                                            interview_round: nextRound,
                                            rating_skills: ratingSkills,
                                            rating_attitude: ratingAttitude,
                                            rating_cultural_fit: ratingCulturalFit,
                                            overall_recommendation: overallRec,
                                            comments: evaluationComments
                                        });
                                        if (!resEval.success) {
                                            showToast(resEval.error?.message || 'บันทึกการประเมินไม่สำเร็จ', 'error');
                                            return;
                                        }

                                        // Auto advance status to Interviewed if it is scheduled
                                        if (evaluatingApp.status === 'Interview' || evaluatingApp.status === 'InterviewScheduled') {
                                            await api.updateApplicationStatus(evaluatingApp.id, 'Interviewed', {
                                                performedByUserId: currentUserId,
                                                comment: `ประเมินสัมภาษณ์เรียบร้อย (ผลประเมิน: ${overallRec === 'Hired' ? 'ผ่าน/รับเข้าทำงาน' : overallRec === 'Rejected' ? 'ไม่ผ่าน' : 'Shortlist/Hold'})`
                                            });
                                        }

                                        showToast('บันทึกการประเมินสำเร็จ!', 'success');
                                        setEvaluatingApp(null);
                                        fetchData();
                                    } catch (e) {
                                        console.error('Failed to submit evaluation', e);
                                        showToast('เกิดข้อผิดพลาดในการบันทึกการประเมิน', 'error');
                                    } finally {
                                        setIsSubmittingEval(false);
                                    }
                                }}
                            >
                                <Star className="w-4 h-4 mr-2" /> ยืนยันบันทึกประเมิน
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};
