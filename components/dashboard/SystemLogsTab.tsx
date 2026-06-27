import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal } from '../UIComponents';
import { 
  Activity, 
  ShieldAlert, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
  ExternalLink,
  User
} from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../supabaseClient';

interface SystemLogsTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  currentUser: any;
  onViewCandidate?: (appId: string) => void;
}

export const SystemLogsTab: React.FC<SystemLogsTabProps> = ({ showToast, currentUser, onViewCandidate }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    loginSuccess: 0,
    loginFailed: 0,
    bruteForceWarnings: [] as { username: string; count: number; ips: string[] }[]
  });

  // Modal details
  const [viewingMetadata, setViewingMetadata] = useState<any | null>(null);

  // Fetch users for dropdown filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, role, status')
          .order('full_name');
        if (data) {
          setUsersList(data);
        } else if (error) {
          console.error('Error fetching users for dropdown:', error);
        }
      } catch (err) {
        console.error('Error in fetchUsers:', err);
      }
    };
    fetchUsers();
  }, []);

  const fetchLogs = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    try {
      // If dates are provided, convert to ISOString/correct start/end of day format
      let formattedStart = '';
      let formattedEnd = '';
      if (startDate) {
        formattedStart = new Date(startDate).toISOString();
      }
      if (endDate) {
        // Set to end of the day (23:59:59)
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        formattedEnd = d.toISOString();
      }

      const res = await api.systemLogs.getLogs({
        page: targetPage,
        limit: 100,
        userFilter: userFilter || undefined,
        actionFilter: actionFilter || undefined,
        startDate: formattedStart || undefined,
        endDate: formattedEnd || undefined
      });

      if (res.success && res.data) {
        setLogs(res.data.logs);
        setTotalCount(res.data.count);
        setPage(targetPage);
      } else {
        showToast('ไม่สามารถดึงข้อมูลระบบ Log ได้', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการดึงข้อมูล Log', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userFilter, actionFilter, startDate, endDate, showToast]);

  // Fetch summary stats & analyze brute force attempts
  const calculateStats = useCallback(async () => {
    try {
      // Get recent 500 logs to perform client-side analysis
      const res = await api.systemLogs.getLogs({
        page: 1,
        limit: 500
      });

      if (res.success && res.data) {
        const allLogs = res.data.logs;
        const total = res.data.count;
        
        let loginSuccess = 0;
        let loginFailed = 0;

        // Track failures per username/IP to detect brute force (e.g. >= 5 failures)
        const userFailures: Record<string, { count: number; ips: Set<string> }> = {};

        allLogs.forEach(log => {
          if (log.action === 'login_success') {
            loginSuccess++;
          } else if (log.action === 'login_failed') {
            loginFailed++;
            const name = log.user_name || 'unknown';
            const ip = log.metadata?.ip || 'unknown';
            
            if (!userFailures[name]) {
              userFailures[name] = { count: 0, ips: new Set<string>() };
            }
            userFailures[name].count++;
            userFailures[name].ips.add(ip);
          }
        });

        // Filter brute force warnings (>= 5 failed attempts)
        const bruteForceWarnings = Object.entries(userFailures)
          .filter(([_, data]) => data.count >= 5)
          .map(([username, data]) => ({
            username,
            count: data.count,
            ips: Array.from(data.ips)
          }));

        setStats({
          total,
          loginSuccess,
          loginFailed,
          bruteForceWarnings
        });
      }
    } catch (err) {
      console.error('Error calculating log stats:', err);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchLogs(1);
    calculateStats();
  }, [fetchLogs, calculateStats]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleResetFilters = () => {
    setUserFilter('');
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    // We fetch immediately by resetting page to 1
    setTimeout(() => fetchLogs(1), 50);
  };

  // Helper to format action names into friendly labels
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login_success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Login Success
          </span>
        );
      case 'login_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5" /> Login Failed
          </span>
        );
      case 'view_candidate_profile':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Eye className="w-3.5 h-3.5" /> View Candidate
          </span>
        );
      case 'view_blacklist_detail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            <ShieldAlert className="w-3.5 h-3.5" /> View Blacklist
          </span>
        );
      case 'export_report':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <FileText className="w-3.5 h-3.5" /> Export Data
          </span>
        );
      default:
        // Handle view_tab_XXX actions
        if (action.startsWith('view_tab_')) {
          const tabName = action.replace('view_tab_', '');
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              <Activity className="w-3.5 h-3.5" /> Open Tab: {tabName}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Activity className="w-3.5 h-3.5" /> {action}
          </span>
        );
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / 100));

  return (
    <div className="form-step-enter space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">System Audit & Activity Logs</h2>
          <p className="text-gray-500 text-sm">ตรวจสอบพฤติกรรมการเข้าชมข้อมูลและการเข้าใช้งานระบบสรรหา</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { fetchLogs(page); calculateStats(); }}
          className="self-start sm:self-center flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Logs
        </Button>
      </div>

      {/* Brute Force Alert Banner */}
      {stats.bruteForceWarnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-800 text-base">🚨 แจ้งเตือนความปลอดภัย (Brute Force Security Warning)</h4>
            <p className="text-sm text-red-700 leading-relaxed">
              ตรวจพบลักษณะการพยายามสุ่มรหัสผ่าน (Failed Login) ติดต่อกันเกิน 5 ครั้งขึ้นไปจากบัญชีผู้ใช้งานต่อไปนี้:
            </p>
            <div className="mt-3 space-y-2">
              {stats.bruteForceWarnings.map((warn, i) => (
                <div key={i} className="text-xs bg-white/70 border border-red-150 p-2.5 rounded-xl font-mono text-red-900 flex flex-wrap gap-2 items-center">
                  <span className="font-bold">Username: {warn.username}</span> 
                  <span className="bg-red-100 px-2 py-0.5 rounded-full text-red-800 font-bold">{warn.count} ครั้ง</span>
                  <span className="text-gray-500">IPs: {warn.ips.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-4 top-4 opacity-10 text-indigo-900">
            <Activity className="w-16 h-16" />
          </div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Activities</span>
          <span className="text-3xl font-extrabold text-gray-900">{stats.total.toLocaleString()}</span>
          <span className="block text-xs text-gray-500 mt-2">ประวัติการใช้งานทั้งหมดในฐานข้อมูล</span>
        </Card>

        <Card className="glass relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-4 top-4 opacity-10 text-emerald-900">
            <UserCheck className="w-16 h-16" />
          </div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Successful Logins</span>
          <span className="text-3xl font-extrabold text-emerald-600">{stats.loginSuccess.toLocaleString()}</span>
          <span className="block text-xs text-gray-500 mt-2">จำนวนการล็อกอินเข้าใช้งานสำเร็จล่าสุด</span>
        </Card>

        <Card className="glass relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <div className="absolute right-4 top-4 opacity-10 text-rose-900">
            <ShieldAlert className="w-16 h-16" />
          </div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Failed Login Spikes</span>
          <span className="text-3xl font-extrabold text-rose-600">{stats.loginFailed.toLocaleString()}</span>
          <span className="block text-xs text-gray-500 mt-2">จำนวนการล็อกอินล้มเหลว (ต้องเฝ้าระวัง)</span>
        </Card>
      </div>

      {/* Search and Filters panel */}
      <Card className="glass">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Recruiter / User Name Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">ผู้ทำกิจกรรม (Who)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">ทั้งหมด (All Users)</option>
                  {usersList.map((user) => (
                    <option key={user.id} value={user.full_name}>
                      {user.full_name} ({user.role === 'admin' ? 'Admin' : 'Moderator'}{user.status !== 'Active' ? ` - ${user.status}` : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Type Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">ประเภทเหตุการณ์ (What)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Filter className="w-4 h-4" />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">ทั้งหมด (All Events)</option>
                  <option value="login_success">การล็อกอินสำเร็จ (Login Success)</option>
                  <option value="login_failed">การล็อกอินล้มเหลว (Login Failed)</option>
                  <option value="view_candidate_profile">การกดส่องประวัติใบสมัคร (View Profile)</option>
                  <option value="view_blacklist_detail">การส่องรายละเอียดประวัติเสีย (View Blacklist)</option>
                  <option value="export_report">การกดส่งออกข้อมูล (Export)</option>
                </select>
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">ตั้งแต่วันที่ (Start Date)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">ถึงวันที่ (End Date)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetFilters}
              className="px-4 py-2 text-gray-700 border-gray-200 hover:bg-gray-50 text-sm"
            >
              Reset Filters
            </Button>
            <Button 
              type="submit" 
              className="px-5 py-2 animated-gradient text-white shadow-md hover:shadow-lg text-sm"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </Card>

      {/* Logs Table */}
      <Card className="glass overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
            <svg className="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-semibold text-gray-600">กำลังโหลดประวัติกิจกรรม...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-20 text-indigo-900" />
            <p className="font-bold text-lg text-gray-700">ไม่พบประวัติกิจกรรมสรรหา</p>
            <p className="text-sm text-gray-400 mt-1">ทดลองรีเซ็ตตัวกรองหรือการค้นหาของคุณ</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-900/5 border-b border-gray-150">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-700">วัน-เวลา (When)</th>
                    <th className="px-5 py-4 font-bold text-slate-700">ผู้ทำกิจกรรม (Who)</th>
                    <th className="px-5 py-4 font-bold text-slate-700">กิจกรรม (What)</th>
                    <th className="px-5 py-4 font-bold text-slate-700">เป้าหมาย (Where)</th>
                    <th className="px-5 py-4 font-bold text-slate-700 text-right">รายละเอียด (How)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString('th-TH')} {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900">{log.user_name}</div>
                        {log.user_role && (
                          <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md mt-0.5 
                            ${log.user_role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                              log.user_role === 'mod' ? 'bg-indigo-100 text-indigo-700' : 
                              'bg-gray-100 text-gray-600'}`}>
                            {log.user_role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">{getActionBadge(log.action)}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        {log.action === 'view_candidate_profile' && log.target_id ? (
                          <button
                            onClick={() => onViewCandidate && log.target_id && onViewCandidate(log.target_id)}
                            className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 text-left focus:outline-none"
                            title="Click to view candidate details"
                          >
                            <span>{log.target_name || '-'}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        ) : (
                          <div className="font-semibold text-gray-900">{log.target_name || '-'}</div>
                        )}
                        {log.action === 'view_candidate_profile' && log.metadata && (
                          <div className="text-xs text-gray-500 mt-1">
                            {log.metadata.position || '-'} · {log.metadata.department || '-'} ({log.metadata.business_unit || '-'})
                          </div>
                        )}
                        {log.action === 'login_failed' && log.metadata && (
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            เหตุผล: {log.metadata.reason || '-'}
                          </div>
                        )}
                        {log.action === 'login_success' && log.metadata && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            IP: {log.metadata.ip || 'unknown'}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewingMetadata(log)}
                          className="hover:text-indigo-600 hover:bg-indigo-50/50"
                        >
                          View Info
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-gray-150">
              {logs.map((log) => (
                <div key={log.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.created_at).toLocaleDateString('th-TH')} {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="font-bold text-gray-900 mt-0.5">{log.user_name}</div>
                    </div>
                    {getActionBadge(log.action)}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-2">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        เป้าหมาย:{' '}
                        {log.action === 'view_candidate_profile' && log.target_id ? (
                          <button
                            onClick={() => onViewCandidate && log.target_id && onViewCandidate(log.target_id)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 focus:outline-none"
                          >
                            <span>{log.target_name || '-'}</span>
                            <ExternalLink className="w-3 h-3 inline shrink-0" />
                          </button>
                        ) : (
                          <strong className="text-gray-900">{log.target_name || '-'}</strong>
                        )}
                      </div>
                      {log.action === 'view_candidate_profile' && log.metadata && (
                        <div className="text-[11px] text-gray-500 font-medium">
                          {log.metadata.position || '-'} · {log.metadata.department || '-'} ({log.metadata.business_unit || '-'})
                        </div>
                      )}
                      {log.action === 'login_failed' && log.metadata && (
                        <div className="text-[11px] text-red-600 font-semibold">
                          เหตุผล: {log.metadata.reason || '-'}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setViewingMetadata(log)}
                      className="text-xs py-1 px-2.5 h-8 border-gray-200"
                    >
                      View Info
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination panel */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-150 flex items-center justify-between bg-slate-900/5 text-sm text-gray-600">
                <span>หน้า {page} จากทั้งหมด {totalPages} หน้า (ทั้งหมด {totalCount} รายการ)</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => fetchLogs(page - 1)}
                    className="flex items-center gap-1.5 h-9 px-3 border-gray-200 bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => fetchLogs(page + 1)}
                    className="flex items-center gap-1.5 h-9 px-3 border-gray-200 bg-white"
                  >
                    ถัดไป <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Metadata Detail Modal */}
      <Modal
        isOpen={!!viewingMetadata}
        onClose={() => setViewingMetadata(null)}
        title="ประวัติระบบ & ข้อมูลการทำงานย่อย"
        size="md"
        footer={null}
      >
        {viewingMetadata && (
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-2.5">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-gray-400 text-xs font-semibold uppercase">วัน-เวลา</span>
                <span className="col-span-2 text-gray-900 font-semibold font-mono text-xs">
                  {new Date(viewingMetadata.created_at).toLocaleString('th-TH')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 border-t pt-2">
                <span className="text-gray-400 text-xs font-semibold uppercase">ผู้กระทำ</span>
                <span className="col-span-2 text-gray-900 font-semibold">{viewingMetadata.user_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 border-t pt-2">
                <span className="text-gray-400 text-xs font-semibold uppercase">เหตุการณ์</span>
                <span className="col-span-2">{getActionBadge(viewingMetadata.action)}</span>
              </div>
              {viewingMetadata.target_name && (
                <div className="grid grid-cols-3 gap-1 border-t pt-2">
                  <span className="text-gray-400 text-xs font-semibold uppercase">เป้าหมาย</span>
                  <span className="col-span-2 text-gray-900 font-semibold">{viewingMetadata.target_name}</span>
                </div>
              )}
            </div>

            {/* Detailed metadata */}
            <div>
              <span className="block text-xs font-bold text-gray-700 uppercase mb-2">ข้อมูลเบื้องหลัง (Technical Metadata / Client Info)</span>
              <pre className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-auto max-h-[300px] leading-relaxed shadow-inner">
                {JSON.stringify({
                  ipAddress: viewingMetadata.metadata?.ip || 'unknown',
                  userAgent: viewingMetadata.metadata?.userAgent || 'unknown',
                  details: {
                    ...viewingMetadata.metadata,
                    ip: undefined,
                    userAgent: undefined
                  }
                }, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-150">
              <Button variant="outline" onClick={() => setViewingMetadata(null)}>ปิดหน้าต่าง</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
