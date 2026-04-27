import React, { useState, useMemo } from 'react';
import { Modal, Button, FileUpload } from '../UIComponents';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { api } from '../../services/api';
import type { ApplicationStatus } from '../../services/api';

interface EditFormState {
  position?: string;
  department?: string;
  departmentId?: number;
  expectedSalary?: string;
  status: string;
  phone?: string;
  email?: string;
  businessUnit?: string;
  sourceChannel?: string;
  campaignTag?: string;
  height?: string;
  weight?: string;
  photoUrl?: string;
}

interface ApplicationEditModalProps {
  editingApp: any;
  setEditingApp: (app: any | null) => void;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  departments: any[];
  positions: any[];
  businessUnits: any[];
  channels: any[];
  currentUserId: string | null;
  currentUserName: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
  fetchData: () => void;
}

export const ApplicationEditModal: React.FC<ApplicationEditModalProps> = ({
  editingApp, setEditingApp, editForm, setEditForm,
  departments, positions, businessUnits, channels,
  currentUserId, currentUserName, showToast, fetchData
}) => {
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const editFilteredPositions = useMemo(() => {
    return positions.filter((p) => !editForm.departmentId || p.department_id === editForm.departmentId);
  }, [positions, editForm.departmentId]);

  return (
    <>
      {/* Edit Application Modal */}
      <Modal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        title="แก้ไขข้อมูลผู้สมัคร"
        size="lg"
        footer={null}
      >
        {editingApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แผนก <span className="text-red-500">*</span></label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editForm.department}
                  onChange={(e) => {
                    const selectedDept = departments.find((d: any) => (d.name_th || d.name) === e.target.value);
                    setEditForm(prev => ({
                      ...prev,
                      department: e.target.value,
                      departmentId: selectedDept?.id || 0,
                      position: '' // Clear position when department changes
                    }));
                  }}
                >
                  <option value="">-- เลือกแผนกก่อน --</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.name_th || d.name}>{d.name_th || d.name}</option>
                  ))}
                  {editForm.department && !departments.find((d: any) => (d.name_th || d.name) === editForm.department) && (
                    <option value={editForm.department}>{editForm.department} (ข้อมูลเดิม)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง <span className="text-red-500">*</span></label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editForm.position}
                  onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                  disabled={!editForm.departmentId && !editForm.position}
                >
                  <option value="">{editForm.departmentId ? '-- เลือกตำแหน่ง --' : '-- เลือกแผนกก่อน --'}</option>
                  {editFilteredPositions.map((p: any) => (
                    <option key={p.id} value={p.name_th || p.name}>{p.name_th || p.name}</option>
                  ))}
                  {editForm.position && !editFilteredPositions.find((p: any) => (p.name_th || p.name) === editForm.position) && (
                    <option value={editForm.position}>{editForm.position} (ข้อมูลเดิม)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เงินเดือนที่คาดหวัง</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.expectedSalary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expectedSalary: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Pending">รอดำเนินการ</option>
                  <option value="Reviewing">กำลังพิจารณา</option>
                  <option value="InterviewScheduled">นัดสัมภาษณ์</option>
                  <option value="Interviewed">สัมภาษณ์แล้ว</option>
                  <option value="Offer">เสนอจ้าง</option>
                  <option value="Hired">รับแล้ว</option>
                  <option value="Rejected">ไม่ผ่าน</option>
                  <option value="Withdrawn">ผู้สมัครยกเลิก</option>
                  <option value="NoShow">ไม่มาตามนัด</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ส่วนสูง (ซม.)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.height || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนัก (กก.)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.weight || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="py-2">
              <FileUpload
                label="รูปถ่ายผู้สมัคร (อัปโหลดทดแทน)"
                description="รูปภาพปัจจุบันจะถูกแทนที่เมื่อกดบันทึก"
                value={editForm.photoUrl}
                onChange={() => {}} // Controlled via onFileSelect
                onFileSelect={async (file) => {
                  if (!file) {
                    setEditForm(prev => ({ ...prev, photoUrl: '' }));
                    return;
                  }
                  setIsUploadingPhoto(true);
                  showToast('กำลังอัปโหลดรูปภาพ...', 'success');
                  const url = await api.uploadFile(file, 'photos');
                  if (url) {
                    setEditForm(prev => ({ ...prev, photoUrl: url }));
                    showToast('อัปโหลดและแทนที่สำเร็จ (รอคลิกบันทึก)', 'success');
                  } else {
                    showToast('เกิดข้อผิดพลาดในการอัปโหลด', 'error');
                  }
                  setIsUploadingPhoto(false);
                }}
                uploading={isUploadingPhoto}
                accept=".jpg,.png"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลช่องทาง</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={editForm.businessUnit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, businessUnit: e.target.value }))}
                  >
                    <option value="">-- เลือก BU --</option>
                    {businessUnits.map((bu: any) => (
                      <option key={bu.id} value={bu.name_th || bu.name}>{bu.name_th || bu.name}</option>
                    ))}
                    {editForm.businessUnit && !businessUnits.find((bu: any) => (bu.name_th || bu.name) === editForm.businessUnit) && (
                      <option value={editForm.businessUnit}>{editForm.businessUnit} (ข้อมูลเดิม)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={editForm.sourceChannel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sourceChannel: e.target.value }))}
                  >
                    <option value="">-- เลือก Channel --</option>
                    {channels.map((ch: any) => (
                      <option key={ch.id} value={ch.name_th || ch.name}>{ch.name_th || ch.name}</option>
                    ))}
                    {editForm.sourceChannel && !channels.find((ch: any) => (ch.name_th || ch.name) === editForm.sourceChannel) && (
                      <option value={editForm.sourceChannel}>{editForm.sourceChannel} (ข้อมูลเดิม)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.campaignTag}
                    onChange={(e) => setEditForm(prev => ({ ...prev, campaignTag: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingApp(null)}>ยกเลิก</Button>
              <Button
                onClick={async () => {
                  setIsSavingEdit(true);
                  try {
                    if (editForm.status !== editingApp.status && !currentUserId) {
                      showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                      return;
                    }
                    const updatedFormData = {
                      ...editingApp.form_data,
                      position: editForm.position,
                      department: editForm.department,
                      expectedSalary: editForm.expectedSalary,
                      phone: editForm.phone,
                      email: editForm.email,
                      businessUnit: editForm.businessUnit,
                      sourceChannel: editForm.sourceChannel,
                      campaignTag: editForm.campaignTag,
                      height: editForm.height,
                      weight: editForm.weight,
                      photoUrl: editForm.photoUrl,
                    };
                    // Only update columns that definitely exist in the database
                    const { error } = await supabase
                      .from('applications')
                      .update({
                        position: editForm.position,
                        department: editForm.department,
                        phone: editForm.phone,
                        email: editForm.email,
                        business_unit: editForm.businessUnit,
                        source_channel: editForm.sourceChannel,
                        campaign_tag: editForm.campaignTag,
                        form_data: updatedFormData,
                      })
                      .eq('id', editingApp.id);
                    if (error) throw error;
                    if (editForm.status !== editingApp.status && currentUserId) {
                      const statusResult = await api.updateApplicationStatus(editingApp.id, editForm.status as ApplicationStatus, {
                        performedByUserId: currentUserId,
                        performedByName: currentUserName,
                        comment: 'อัปเดตจากหน้าแก้ไขข้อมูล',
                        rejectionReason: ['Rejected', 'Withdrawn', 'NoShow'].includes(editForm.status) ? 'อื่นๆ' : undefined,
                      });
                      if (!statusResult.success) {
                        throw new Error(statusResult.error?.message || 'Status update failed');
                      }
                    }
                    showToast('บันทึกสำเร็จ!', 'success');
                    setEditingApp(null);
                    fetchData();
                  } catch (err: any) {
                    console.error('Save error:', err);
                    showToast('บันทึกไม่สำเร็จ: ' + (err.message || 'Unknown error'), 'error');
                  } finally {
                    setIsSavingEdit(false);
                  }
                }}
                isLoading={isSavingEdit}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> บันทึกการแก้ไข
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
