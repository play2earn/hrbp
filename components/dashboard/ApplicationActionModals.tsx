import React from 'react';
import { Modal, Button } from '../UIComponents';
import { CheckCircle, XCircle, Calendar, Trash2, QrCode } from 'lucide-react';
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
}

export const ApplicationActionModals: React.FC<ActionModalsProps> = ({
    currentUserId, currentUserName, activeUsers, closeReasons, showToast, fetchData,
    claimingApp, setClaimingApp,
    unassigningApp, setUnassigningApp,
    transferringApp, setTransferringApp, transferTarget, setTransferTarget,
    rejectingApp, setRejectingApp, rejectionReason, setRejectionReason, rejectComment, setRejectComment,
    approvingApp, setApprovingApp,
    interviewingApp, setInterviewingApp, interviewDate, setInterviewDate,
    deletingApp, setDeletingApp, isDeleting, handleDeleteApplication,
    confirmQrAction, setConfirmQrAction, executeGenerateLink
}) => {
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่นัดสัมภาษณ์ <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setInterviewingApp(null)}>ยกเลิก</Button>
                            <Button
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                disabled={!interviewDate}
                                onClick={async () => {
                                    if (!currentUserId) {
                                        showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                                        return;
                                    }
                                    const result = await api.updateApplicationStatus(interviewingApp.id, 'InterviewScheduled', {
                                        performedByUserId: currentUserId,
                                        performedByName: currentUserName,
                                        interviewDate,
                                    });
                                    if (!result.success) {
                                        showToast(result.error?.message || 'นัดสัมภาษณ์ไม่สำเร็จ', 'error');
                                        return;
                                    }
                                    setInterviewingApp(null);
                                    setInterviewDate('');
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
        </>
    );
};
