import React from 'react';
import { Card, Button, Modal } from '../UIComponents';
import { 
  Users, Shield, Clock, Building2, Briefcase, CheckCircle2, AlertCircle, 
  RefreshCw, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Sparkles, SlidersHorizontal, X, LayoutGrid, Table as TableIcon
} from 'lucide-react';
import { api } from '../../services/api';

interface UserManagementTabProps {
  pendingUsers: any[];
  activeUsers: any[];
  fetchPendingUsers: () => void;
  fetchActiveUsers: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  editingUser: any;
  setEditingUser: React.Dispatch<React.SetStateAction<any>>;
  isConfirmingDisable: boolean;
  setIsConfirmingDisable: React.Dispatch<React.SetStateAction<boolean>>;
}

// Helper component to render HRMS Employee Avatar / Photocard image
const UserAvatar: React.FC<{ user: any; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
  const [imgError, setImgError] = React.useState(false);
  const empId = user?.emp_id;
  const avatarUrl = empId ? `https://api-idms.advanceagro.net/hrms/employee/${empId}/photocard/?size=120` : null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-xl'
  }[size];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getGradient = (str?: string) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600',
    ];
    let hash = 0;
    if (str) {
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  if (avatarUrl && !imgError) {
    return (
      <div className={`relative shrink-0 ${sizeClasses} rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-200 bg-gray-100`}>
        <img
          src={avatarUrl}
          alt={user.full_name || 'User Photo'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`shrink-0 ${sizeClasses} rounded-full bg-gradient-to-br ${getGradient(user?.full_name || user?.id)} text-white font-bold flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-gray-200 select-none`}>
      {getInitials(user?.full_name)}
    </div>
  );
};

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  pendingUsers, activeUsers, fetchPendingUsers, fetchActiveUsers, showToast,
  editingUser, setEditingUser, isConfirmingDisable, setIsConfirmingDisable
}) => {
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false);
  const [isBatchSyncing, setIsBatchSyncing] = React.useState<boolean>(false);
  const [batchSyncProgress, setBatchSyncProgress] = React.useState<{ current: number; total: number; name: string } | null>(null);

  // View Display Mode State: auto | cards | table
  const [viewDisplayMode, setViewDisplayMode] = React.useState<'auto' | 'cards' | 'table'>('auto');

  // Filters State
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [deptFilter, setDeptFilter] = React.useState<'All' | 'HR' | 'IT' | 'Audit' | 'ProcessImprovement' | 'Other'>('All');
  const [activityFilter, setActivityFilter] = React.useState<'All' | 'ActiveToday' | 'Active30Days' | 'Inactive30Days' | 'Inactive60Days' | 'Never'>('All');

  // Pagination State
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(10);

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, deptFilter, activityFilter, itemsPerPage]);

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

  const handleSyncHrms = async (user: any) => {
    if (!user?.emp_id) {
      showToast('ไม่มีรหัสพนักงานสำหรับซิงค์ข้อมูล', 'error');
      return;
    }
    setIsSyncing(true);
    const result = await api.auth.syncUserWorklogDetails(user.id, user.emp_id);
    setIsSyncing(false);
    if (result.success) {
      showToast('อัปเดตข้อมูลตำแหน่งและสังกัดจาก HRMS Central เรียบร้อย', 'success');
      if (editingUser?.id === user.id) {
        setEditingUser(result.data);
      }
      fetchActiveUsers();
      fetchPendingUsers();
    } else {
      showToast('ซิงค์ข้อมูลตำแหน่งล้มเหลว', 'error');
    }
  };

  // Batch sync HRMS Central profiles for all users
  const handleBatchSyncHrms = async () => {
    const allUsers = [...activeUsers, ...pendingUsers].filter(u => u.emp_id);
    if (allUsers.length === 0) {
      showToast('ไม่พบผู้ใช้งานที่มีรหัสพนักงานสำหรับซิงค์', 'error');
      return;
    }

    if (!confirm(`ยืนยันการรันซิงค์ตำแหน่งและสังกัดจาก HRMS Central API สำหรับพนักงานทั้งหมด ${allUsers.length} คน?`)) return;

    setIsBatchSyncing(true);
    let successCount = 0;

    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      setBatchSyncProgress({ current: i + 1, total: allUsers.length, name: user.full_name });
      try {
        const res = await api.auth.syncUserWorklogDetails(user.id, user.emp_id);
        if (res.success) successCount++;
      } catch (err) {
        console.warn(`Failed batch sync for ${user.full_name}:`, err);
      }
    }

    setIsBatchSyncing(false);
    setBatchSyncProgress(null);
    showToast(`ซิงค์ข้อมูลตำแหน่งจาก HRMS Central สำเร็จ ${successCount}/${allUsers.length} คนเรียบร้อยแล้ว`, 'success');
    fetchActiveUsers();
    fetchPendingUsers();
  };

  const formatLastLogin = (lastActiveAt?: string, lastLoginAt?: string) => {
    const effectiveTime = lastActiveAt || lastLoginAt;
    if (!effectiveTime) {
      return <span className="text-gray-400 italic text-xs">ยังไม่เคยเข้าใช้งาน</span>;
    }
    const loginDate = new Date(effectiveTime);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    let text = '';
    let badgeStyle = '';

    if (diffHours < 1) {
      text = 'เคลื่อนไหวเมื่อครู่ (Online)';
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    } else if (diffHours < 24) {
      text = `${diffHours} ชม. ที่แล้ว`;
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (diffDays <= 30) {
      text = `${diffDays} วันที่แล้ว`;
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (diffDays <= 60) {
      text = `⚠️ ไม่ได้ใช้งาน ${diffDays} วัน`;
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-300 font-medium';
    } else {
      text = `🚨 ไม่ได้ใช้งาน ${diffDays} วัน (เสี่ยงย้ายสายงาน)`;
      badgeStyle = 'bg-red-50 text-red-700 border-red-300 font-semibold';
    }

    return (
      <div className="flex flex-col gap-0.5">
        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border w-fit ${badgeStyle}`}>
          <Clock className="w-3 h-3 shrink-0" />
          {text}
        </span>
        <span className="text-[10px] text-gray-400">
          {loginDate.toLocaleDateString('th-TH')} {loginDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    );
  };

  const renderHrVerificationBadge = (user: any) => {
    const isHr = user.is_hr_team ?? true;
    if (isHr) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> ทีมสรรหา (HR)
        </span>
      );
    }

    // Identify department category if non-HR
    const posText = `${user.position_name || ''} ${user.department_name || ''}`.toLowerCase();
    let label = 'ต่างฝ่าย/ต่างแผนก';

    if (posText.includes('process') || posText.includes('improvement') || posText.includes('ปรับปรุง')) {
      label = 'Process Improvement';
    } else if (posText.includes('it') || posText.includes('สารสนเทศ') || posText.includes('system') || posText.includes('dev')) {
      label = 'IT / Technology';
    } else if (posText.includes('audit') || posText.includes('ตรวจ') || posText.includes('compliance')) {
      label = 'Audit / Governance';
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800" title="ตำแหน่งหรือฝ่ายอยู่นอกเหนือทีมสรรหา">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {label}
      </span>
    );
  };

  // Filter Active Users
  const filteredActiveUsers = React.useMemo(() => {
    return activeUsers.filter(user => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.full_name?.toLowerCase().includes(q);
        const matchEmail = user.email?.toLowerCase().includes(q);
        const matchEmpId = user.emp_id?.toLowerCase().includes(q);
        const matchPos = user.position_name?.toLowerCase().includes(q);
        const matchCompany = user.company_name?.toLowerCase().includes(q);
        const matchDept = user.department_name?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchEmpId && !matchPos && !matchCompany && !matchDept) {
          return false;
        }
      }

      // 2. Department Filter
      if (deptFilter !== 'All') {
        const posText = `${user.position_name || ''} ${user.department_name || ''}`.toLowerCase();
        const isHr = user.is_hr_team ?? true;

        if (deptFilter === 'HR') {
          if (!isHr) return false;
        } else if (deptFilter === 'IT') {
          if (!posText.includes('it') && !posText.includes('สารสนเทศ') && !posText.includes('system') && !posText.includes('dev') && !posText.includes('tech')) return false;
        } else if (deptFilter === 'Audit') {
          if (!posText.includes('audit') && !posText.includes('ตรวจ') && !posText.includes('compliance')) return false;
        } else if (deptFilter === 'ProcessImprovement') {
          if (!posText.includes('process') && !posText.includes('improvement') && !posText.includes('ปรับปรุง') && !posText.includes('ประสิทธิภาพ')) return false;
        } else if (deptFilter === 'Other') {
          if (isHr) return false;
        }
      }

      // 3. Activity / Last Login Filter
      if (activityFilter !== 'All') {
        const effectiveTime = user.last_active_at || user.last_login_at;
        if (activityFilter === 'Never') {
          if (effectiveTime) return false;
        } else {
          if (!effectiveTime) return false;
          const diffMs = new Date().getTime() - new Date(effectiveTime).getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

          if (activityFilter === 'ActiveToday' && diffHours >= 24) return false;
          if (activityFilter === 'Active30Days' && diffDays > 30) return false;
          if (activityFilter === 'Inactive30Days' && diffDays <= 30) return false;
          if (activityFilter === 'Inactive60Days' && diffDays <= 60) return false;
        }
      }

      return true;
    });
  }, [activeUsers, searchQuery, deptFilter, activityFilter]);

  // Pagination Math
  const totalPages = Math.ceil(filteredActiveUsers.length / itemsPerPage) || 1;
  const paginatedActiveUsers = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActiveUsers.slice(start, start + itemsPerPage);
  }, [filteredActiveUsers, currentPage, itemsPerPage]);

  return (
    <>
      <div className="form-step-enter space-y-6">
        {/* Header Title & Batch Sync Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <p className="text-xs text-gray-500 mt-1">จัดการผู้ใช้งาน สิทธิ์การเข้าถึง และการซิงค์ข้อมูลสายงานสังกัดพนักงาน</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBatchSyncHrms}
              disabled={isBatchSyncing}
              className="w-full sm:w-auto justify-center text-indigo-600 border-indigo-200 hover:bg-indigo-50 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isBatchSyncing ? 'animate-spin' : ''}`} />
              {isBatchSyncing ? 'กำลังซิงค์โปรไฟล์ทั้งหมด...' : '🔄 ซิงค์ตำแหน่งทุกคนจาก HRMS Central'}
            </Button>
          </div>
        </div>

        {/* Batch Sync Progress Banner */}
        {isBatchSyncing && batchSyncProgress && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl shadow-sm text-indigo-900 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                กำลังซิงค์ตำแหน่งกับ HRMS Central API ({batchSyncProgress.current}/{batchSyncProgress.total})
              </span>
              <span className="text-xs font-semibold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
                {Math.round((batchSyncProgress.current / batchSyncProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden mb-1">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(batchSyncProgress.current / batchSyncProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-indigo-700 truncate">กำลังตรวจสอบ: {batchSyncProgress.name}</p>
          </div>
        )}

        {/* Pending Users Management */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Pending Registrations
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">อนุมัติผู้ใช้งานใหม่พร้อมตรวจสอบตำแหน่งสังกัดทีมสรรหา</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchPendingUsers}>Refresh</Button>
          </div>

          {pendingUsers.length === 0 ? (
            <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center">No pending account requests.</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">วันที่สมัคร</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ - รหัสพนักงาน</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ตำแหน่ง & สังกัด (HRMS)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ทีมสรรหา</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {new Date(user.created_at).toLocaleDateString('th-TH')} {new Date(user.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          {user.emp_id && (
                            <span className="inline-block mt-0.5 text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                              ID: {user.emp_id}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium text-gray-800 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {user.position_name || 'เจ้าหน้าที่สรรหาบุคลากร'}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            {user.company_name || 'Double A (1991) PLC'} {user.department_name ? `• ${user.department_name}` : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {renderHrVerificationBadge(user)}
                        </td>
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
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.emp_id && <div className="text-xs text-indigo-600 font-medium mt-0.5">ID: {user.emp_id}</div>}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {user.role === 'admin' ? 'Admin' : 'Moderator'}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-lg text-xs space-y-1 my-1">
                      <div className="font-medium text-gray-800 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                        {user.position_name || 'เจ้าหน้าที่สรรหาบุคลากร'}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-400" />
                        {user.company_name || 'Double A (1991) PLC'}
                      </div>
                      <div className="pt-1">{renderHrVerificationBadge(user)}</div>
                    </div>

                    <div className="flex justify-between items-center mt-1 border-t pt-3">
                      <span className="text-xs text-gray-400">
                        {new Date(user.created_at).toLocaleDateString('th-TH')}
                      </span>
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

        {/* Existing Active Users with Search, Filter & Paging */}
        <Card>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <span>Existing Users</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {filteredActiveUsers.length} คน
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">ค้นหา กรองแผนก/สิทธิ์ และเลือกมุมมอง Cards หรือ Table ได้ตามต้องการ</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                {/* View Switcher: Auto / Cards / Table */}
                <div className="inline-flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewDisplayMode('auto')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      viewDisplayMode === 'auto' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="ปรับรูปแบบอัตโนมัติตามขนาดหน้าจอ"
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setViewDisplayMode('cards')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      viewDisplayMode === 'cards' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="แสดงแบบ Card (แนะนำสำหรับมือถือและจอย่อ)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => setViewDisplayMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      viewDisplayMode === 'table' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    title="แสดงแบบตาราง Table"
                  >
                    <TableIcon className="w-3.5 h-3.5 text-gray-500" />
                    <span>Table</span>
                  </button>
                </div>

                <Button size="sm" variant="outline" onClick={fetchActiveUsers}>Refresh List</Button>
              </div>
            </div>

            {/* Filter Toolbar Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              {/* Search Bar */}
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="ค้นหา ชื่อ, อีเมล, รหัสพนักงาน, ตำแหน่ง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Department Group Filter */}
              <div className="sm:col-span-4 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:block" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium cursor-pointer"
                >
                  <option value="All">🏢 สายงานทั้งหมด (All Depts)</option>
                  <option value="HR">🟢 ทีมสรรหา (Recruitment/HR)</option>
                  <option value="ProcessImprovement">⚡ Process Improvement</option>
                  <option value="IT">💻 เทคโนโลยีสารสนเทศ (IT)</option>
                  <option value="Audit">🔍 ตรวจสอบ (Audit / Governance)</option>
                  <option value="Other">⚠️ ต่างฝ่าย / ต่างแผนกอื่น</option>
                </select>
              </div>

              {/* Last Active Filter */}
              <div className="sm:col-span-4 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0 hidden sm:block" />
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 font-medium cursor-pointer"
                >
                  <option value="All">🕒 ความเคลื่อนไหวทั้งหมด (All Activity)</option>
                  <option value="ActiveToday">🟢 เคลื่อนไหววันนี้ / เมื่อครู่</option>
                  <option value="Active30Days">🔵 ใช้งานภายใน 30 วัน</option>
                  <option value="Inactive30Days">⚠️ ไม่เคลื่อนไหวเกิน 30 วัน</option>
                  <option value="Inactive60Days">🚨 ไม่เคลื่อนไหวเกิน 60 วัน (เสี่ยงย้ายสายงาน)</option>
                  <option value="Never">⚪ ยังไม่เคยเข้าใช้งาน</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Status Badges */}
            {(deptFilter !== 'All' || activityFilter !== 'All' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-gray-500 font-medium">กำลังตัวกรอง:</span>
                {deptFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                    แผนก: {deptFilter}
                    <button onClick={() => setDeptFilter('All')} className="hover:text-indigo-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {activityFilter !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                    สถานะ: {activityFilter}
                    <button onClick={() => setActivityFilter('All')} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full font-medium">
                    ค้นหา: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={() => { setSearchQuery(''); setDeptFilter('All'); setActivityFilter('All'); }}
                  className="text-xs text-red-600 hover:underline font-medium ml-auto"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>

          {filteredActiveUsers.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 font-medium text-sm">ไม่พบผู้ใช้งานตามเงื่อนไขที่ค้นหา</p>
              <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูรายชื่อทั้งหมด</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { setSearchQuery(''); setDeptFilter('All'); setActivityFilter('All'); }}>
                ล้างตัวกรอง
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className={viewDisplayMode === 'table' ? 'block overflow-x-auto border rounded-xl shadow-sm' : viewDisplayMode === 'cards' ? 'hidden' : 'hidden lg:block overflow-x-auto border rounded-xl shadow-sm'}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ - รหัสพนักงาน</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ตำแหน่ง & สังกัด (HRMS)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">ใช้งานล่าสุด (Last Active)</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {paginatedActiveUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="md" />
                            <div>
                              <div className="font-bold text-gray-900">{user.full_name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                              {user.emp_id && (
                                <span className="inline-block mt-0.5 text-[11px] bg-gray-100 text-gray-700 font-mono px-1.5 py-0.5 rounded border">
                                  ID: {user.emp_id}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 max-w-xs truncate">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {user.position_name || 'เจ้าหน้าที่สรรหาบุคลากร'}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 max-w-xs truncate">
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                            {user.company_name || 'Double A (1991) PLC'} {user.department_name ? `• ${user.department_name}` : ''}
                          </div>
                          <div className="mt-1">{renderHrVerificationBadge(user)}</div>
                        </td>
                        <td className="px-4 py-3">
                          {formatLastLogin(user.last_active_at, user.last_login_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                            {user.role === 'admin' ? 'Admin' : 'Moderator'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">Active</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="ghost" className="hover:bg-indigo-50 hover:text-indigo-600" onClick={() => { setEditingUser(user); setIsConfirmingDisable(false); }}>
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (Responsive & Auto for Screens < lg or when Cards selected) */}
              <div className={viewDisplayMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : viewDisplayMode === 'table' ? 'hidden' : 'grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3'}>
                {paginatedActiveUsers.map(user => (
                  <div key={user.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="md" />
                        <div>
                          <div className="font-bold text-gray-900 text-base">{user.full_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          {user.emp_id && <div className="text-xs text-indigo-600 font-mono font-medium mt-0.5">ID: {user.emp_id}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Moderator'}
                        </span>
                        <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1.5 my-1 border border-gray-150">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {user.position_name || 'เจ้าหน้าที่สรรหาบุคลากร'}
                      </div>
                      <div className="text-gray-600 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {user.company_name || 'Double A (1991) PLC'} {user.department_name ? `• ${user.department_name}` : ''}
                      </div>
                      <div className="pt-1">{renderHrVerificationBadge(user)}</div>
                      <div className="pt-1.5 border-t border-gray-200 mt-1">
                        {formatLastLogin(user.last_active_at, user.last_login_at)}
                      </div>
                    </div>

                    <div className="flex justify-end items-center mt-1 border-t pt-2.5">
                      <Button size="sm" variant="outline" className="h-8 px-4 text-xs" onClick={() => { setEditingUser(user); setIsConfirmingDisable(false); }}>Manage Profile</Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-4 text-xs text-gray-600">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <span>
                    แสดง {Math.min((currentPage - 1) * itemsPerPage + 1, filteredActiveUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredActiveUsers.length)} จากทั้งหมด {filteredActiveUsers.length} คน
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">แสดงหน้าละ:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="py-1 px-2 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="หน้าแรก"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 px-2.5 font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>ก่อนหน้า</span>
                  </button>

                  <span className="px-3 py-1 font-bold text-gray-900 bg-gray-100 rounded-md">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 px-2.5 font-medium"
                  >
                    <span>ถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="หน้าสุดท้าย"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Edit User Modal */}
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={isConfirmingDisable ? "Confirm Action" : "Manage User Profile"}
          footer={null}
        >
          {editingUser && (
            <div className="space-y-4">
              {!isConfirmingDisable ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">ข้อมูลผู้ใช้งาน & สังกัด (HRMS Detail)</label>
                    <div className="p-4 bg-gray-50 border rounded-xl space-y-3 text-sm">
                      <div className="flex items-center gap-3.5 border-b pb-3.5">
                        <UserAvatar user={editingUser} size="lg" />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-gray-900 text-lg leading-snug truncate">{editingUser.full_name}</p>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${editingUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                              {editingUser.role === 'admin' ? 'Admin' : 'Moderator'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs truncate">{editingUser.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400 block">รหัสพนักงาน:</span>
                          <span className="font-medium text-gray-800">{editingUser.emp_id || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">HRMS Account:</span>
                          <span className="font-medium text-gray-800">{editingUser.hrms_username || '-'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 block">ตำแหน่งงาน:</span>
                          <span className="font-medium text-gray-900 flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                            {editingUser.position_name || 'เจ้าหน้าที่สรรหาบุคลากร'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-400 block">สังกัดบริษัท/แผนก:</span>
                          <span className="font-medium text-gray-900 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            {editingUser.company_name || 'Double A (1991) PLC'} {editingUser.department_name ? `• ${editingUser.department_name}` : ''}
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t mt-1">
                          <span className="text-gray-400 block mb-1">การตรวจสอบสายงาน HR:</span>
                          {renderHrVerificationBadge(editingUser)}
                        </div>
                        <div className="col-span-2 pt-1 border-t mt-1">
                          <span className="text-gray-400 block mb-1">การเคลื่อนไหวล่าสุดบนระบบ (Activity):</span>
                          {formatLastLogin(editingUser.last_active_at, editingUser.last_login_at)}
                        </div>
                        {editingUser.last_login_at && (
                          <div className="col-span-2 text-[11px] text-gray-500">
                            <span className="text-gray-400">ยืนยันรหัสผ่านล่าสุด (Password Auth): </span>
                            {new Date(editingUser.last_login_at).toLocaleDateString('th-TH')} {new Date(editingUser.last_login_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>

                      {editingUser.emp_id && (
                        <div className="pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => handleSyncHrms(editingUser)}
                            disabled={isSyncing}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'Re-sync HRMS Central Org Info'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">จัดการสถานะผู้ใช้</label>
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
                      พนักงานที่ถูก Disable จะไม่สามารถเข้าถึงระบบ HRBP และดูข้อมูลผู้สมัครได้
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

      </div>
    </>
  );
};
