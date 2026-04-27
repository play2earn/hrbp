import React from 'react';
import { Card, Button, Modal } from '../UIComponents';
import { Users, UserIcon, MoreVertical, Edit, Shield, AlertTriangle, Plus } from 'lucide-react';
import { api } from '../../services/api';

interface UserManagementTabProps {
  pendingUsers: any[];
  activeUsers: any[];
  fetchPendingUsers: () => void;
  fetchActiveUsers: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  // Local state lifted up for safety or kept local?
  editingUser: any;
  setEditingUser: React.Dispatch<React.SetStateAction<any>>;
  isConfirmingDisable: boolean;
  setIsConfirmingDisable: React.Dispatch<React.SetStateAction<boolean>>;
  isAddUserOpen: boolean;
  setIsAddUserOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newUserForm: any;
  setNewUserForm: React.Dispatch<React.SetStateAction<any>>;
  isCreatingUser: boolean;
  setIsCreatingUser: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  pendingUsers, activeUsers, fetchPendingUsers, fetchActiveUsers, showToast,
  editingUser, setEditingUser, isConfirmingDisable, setIsConfirmingDisable,
  isAddUserOpen, setIsAddUserOpen, newUserForm, setNewUserForm,
  isCreatingUser, setIsCreatingUser
}) => {
  // We need to bring the handler functions that were inline in Dashboard.tsx
  const handleUpdateUser = async (status: 'Active' | 'Inactive') => {
    if (!editingUser) return;
    const result = await api.auth.updateUserStatus(editingUser.id, status);
    if (!result.success) {
      showToast('อัปเดตสถานะล้มเหลว', 'error');
      return;
    }
    showToast(`อัปเดตผู้ใช้เป็น ${status} เรียบร้อย`, 'success');
    setIsConfirmingDisable(false);
    setEditingUser(null);
    fetchActiveUsers();
  };

  const handleUserAction = async (userId: string, status: 'Active' | 'Rejected' | 'Inactive') => {
    if (status === 'Rejected' && !confirm('ยืนยันที่จะปฏิเสธและลบข้อมูลผู้ใช้งานนี้?')) return;
    const result = await api.auth.updateUserStatus(userId, status);
    if (!result.success) {
      showToast(result.error?.message || 'ดำเนินการล้มเหลว', 'error');
      return;
    }
    showToast(`ดำเนินการ ${status} เรียบร้อย`, 'success');
    fetchPendingUsers();
    fetchActiveUsers();
  };

  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  return (
    <>
      <div className="form-step-enter">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

        {/* Pending Users Management */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5" /> Pending Registrations
            </h3>
            <Button size="sm" variant="outline" onClick={fetchPendingUsers}>Refresh</Button>
          </div>

          {pendingUsers.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">No pending account requests.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">วันที่สร้าง</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">เบอร์โทร</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Moderator'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUserAction(user.id, 'Active')}>Approve</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUserAction(user.id, 'Rejected')}>Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {pendingUsers.map(user => (
                  <div key={user.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{user.phone || '-'}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Moderator'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t pt-3">
                      <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString('th-TH')}</span>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs" onClick={() => handleUserAction(user.id, 'Active')}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-3 text-xs" onClick={() => handleUserAction(user.id, 'Rejected')}>Reject</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-gray-800">Existing Users</h3>
            <Button variant="outline" size="sm" onClick={() => setIsAddUserOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add New User
            </Button>
          </div>
          {activeUsers.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 text-center">No active users found.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">วันที่สร้าง</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">เบอร์โทร</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Moderator'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingUser(user); setIsConfirmingDisable(false); }}>Manage</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-3">
                {activeUsers.map(user => (
                  <div key={user.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{user.phone || '-'}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Moderator'}
                        </span>
                        <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t pt-3">
                      <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString('th-TH')}</span>
                      <Button size="sm" variant="outline" className="h-8 px-4 text-xs" onClick={() => { setEditingUser(user); setIsConfirmingDisable(false); }}>Manage</Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Edit User Modal */}
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={isConfirmingDisable ? "Confirm Action" : "Manage User"}
          footer={null}
        >
          {editingUser && (
            <div className="space-y-4">
              {!isConfirmingDisable ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Details</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-semibold text-gray-900">{editingUser.full_name}</p>
                      <p className="text-gray-500">{editingUser.email}</p>
                      <p className="text-gray-500 capitalize">Role: {editingUser.role}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
                    <div className="flex gap-3">
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={() => setIsConfirmingDisable(true)}
                      >
                        Disable Account
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Disabled users will be moved to the Rejected/Pending list and cannot log in.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Close</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Disable this account?</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Are you sure you want to disable <strong>{editingUser.full_name}</strong>? They will immediately lose access to the system.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setIsConfirmingDisable(false)}>Cancel</Button>
                    <Button variant="danger" onClick={() => handleUpdateUser('Inactive')}>Yes, Disable Account</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Add New User Modal */}
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => { setIsAddUserOpen(false); setNewUserForm({ full_name: '', email: '', phone: '', role: 'mod', emp_id: '', hrms_username: '' }); }}
          title="Add New User"
          footer={null}
        >
          <form onSubmit={async (e) => {
            e.preventDefault();
            setIsCreatingUser(true);
            try {
              const result = await api.auth.registerHrmsUser(newUserForm);
              if (result.success) {
                showToast('สร้างผู้ใช้สำเร็จ!', 'success');
                setIsAddUserOpen(false);
                setNewUserForm({ full_name: '', email: '', phone: '', role: 'mod', emp_id: '', hrms_username: '' });
                fetchPendingUsers();
                fetchActiveUsers();
              } else {
                throw result.error;
              }
            } catch (err: any) {
              showToast('สร้างผู้ใช้ล้มเหลว: ' + (err.message || 'Unknown error'), 'error');
            } finally {
              setIsCreatingUser(false);
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={newUserForm.full_name}
                onChange={(e) => setNewUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="ชื่อ นามสกุล"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="081-XXX-XXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="mod">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emp ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newUserForm.emp_id}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, emp_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HRMS Username <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newUserForm.hrms_username}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, hrms_username: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. somchai_ka"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => setIsAddUserOpen(false)}>ยกเลิก</Button>
              <Button type="submit" isLoading={isCreatingUser}>
                <Plus className="w-4 h-4 mr-1" /> สร้างผู้ใช้
              </Button>
            </div>
          </form>
        </Modal>
      </div>

    </>
  );
};
