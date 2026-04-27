import React, { useMemo } from 'react';
import { Card, Button } from '../UIComponents';
import {
  FileText, Users, Edit, Calendar, CheckCircle, XCircle,
  Search, MoreVertical, LayoutGrid, List, ChevronDown, ChevronRight, Check,
  UserPlus, UserCheck, Phone, Copy
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import type { ApplicationStatus } from '../../services/api';
import {
  COLORS, getBuChartColor, getBuColor, getStatusBadgeClass, getStatusLabel,
  isInterviewScheduledStatus, isClosedStatus
} from './dashboardConstants';

interface OverviewTabProps {
  stats: any;
  fetchData: () => void;
  applications: any[];
  positions: any[];
  departments: any[];
  businessUnits: any[];
  channels: any[];
  appFilters: any;
  setAppFilters: React.Dispatch<React.SetStateAction<any>>;
  appPage: number;
  setAppPage: React.Dispatch<React.SetStateAction<number>>;
  appPerPage: number;
  setAppPerPage: React.Dispatch<React.SetStateAction<number>>;
  actionMenu: any;
  setActionMenu: React.Dispatch<React.SetStateAction<any>>;
  setViewingApp: (app: any) => void;
  setEditingApp: (app: any) => void;
  setClaimingApp: (app: any) => void;
  setTransferringApp: (app: any) => void;
  setUnassigningApp: (app: any) => void;
  setInterviewingApp: (app: any) => void;
  setRejectingApp: (app: any) => void;
  setApprovingApp: (app: any) => void;
  currentUserId: string | null;
  openActionMenu: (app: any, e: React.MouseEvent) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats, fetchData, applications, positions, departments, businessUnits, channels,
  appFilters, setAppFilters, appPage, setAppPage,
  actionMenu, setActionMenu, setViewingApp, setEditingApp,
  setClaimingApp, setTransferringApp, setUnassigningApp, setInterviewingApp,
  setRejectingApp, setApprovingApp, currentUserId,
  appPerPage, setAppPerPage, openActionMenu
}) => {
  const appsByBU = useMemo(() => {
    const acc: Record<string, number> = {};
    applications.forEach((app: any) => {
      const bu = app.business_unit || 'Unknown';
      acc[bu] = (acc[bu] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const appsByStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    applications.forEach((app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({
      name: getStatusLabel(name),
      value,
      originalKey: name
    }));
  }, [applications]);

  const appsByDept = useMemo(() => {
    const acc: Record<string, number> = {};
    applications.forEach((app: any) => {
      const dept = app.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const chartData = appsByBU.length > 0 ? appsByBU : [{ name: 'No Data', value: 1 }];
  const statusData = appsByStatus.length > 0 ? appsByStatus : [{ name: 'No Data', value: 1 }];
  const deptData = appsByDept.length > 0 ? appsByDept : [{ name: 'No Data', value: 1 }];

  return (
    <>
      <div className="space-y-6 form-step-enter">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchData}>Refresh Data</Button>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border hidden sm:flex items-center">Last updated: Just now</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-xl shadow-indigo-500/25 card-hover">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-[11px] sm:text-sm font-medium">Total Apps</p>
                <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1.5">{stats.total}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl"><FileText className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-xl shadow-orange-500/25 card-hover">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-50 text-[11px] sm:text-sm font-medium">Pending Review</p>
                <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1.5">{stats.pending}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl"><Users className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-xl shadow-blue-500/25 card-hover">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-50 text-[11px] sm:text-sm font-medium">Reviewing</p>
                <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1.5">{stats.reviewing}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl"><Edit className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-xl shadow-purple-500/25 card-hover">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-50 text-[11px] sm:text-sm font-medium">Interviewing</p>
                <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1.5">{stats.interviewing}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl"><Calendar className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-xl shadow-emerald-500/25 card-hover">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-50 text-[11px] sm:text-sm font-medium">Hired (YTD)</p>
                <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1.5">{stats.hired}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl"><CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            </div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-red-500 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-white shadow-xl shadow-red-500/25 card-hover">
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-50 text-[11px] sm:text-sm font-medium">Rejected/Cancel</p>
                <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1.5">{stats.rejected}</p>
              </div>
              <div className="p-1.5 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl"><XCircle className="w-4 h-4 sm:w-6 sm:h-6" /></div>
            </div>
          </div>
        </div>

        {/* Recent Applications Table */}
        <Card>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800">Applications</h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-auto sm:flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, เบอร์โทร..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full lg:w-56 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={appFilters.search}
                  onChange={(e) => { setAppFilters(f => ({ ...f, search: e.target.value })); setAppPage(1); }}
                />
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Position Filter */}
                <select
                  className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                  value={appFilters.position}
                  onChange={(e) => { setAppFilters(f => ({ ...f, position: e.target.value })); setAppPage(1); }}
                >
                  <option value="">ตำแหน่งทั้งหมด</option>
                  {positions.filter(p => p.is_active !== false).map(p => (
                    <option key={p.id} value={p.name_th || p.name}>{p.name_th || p.name}</option>
                  ))}
                </select>
                {/* BU Filter */}
                <select
                  className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                  value={appFilters.bu}
                  onChange={(e) => { setAppFilters(f => ({ ...f, bu: e.target.value })); setAppPage(1); }}
                >
                  <option value="">BU ทั้งหมด</option>
                  {businessUnits.map(b => (
                    <option key={b.id || b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
                {/* Channel Filter */}
                <select
                  className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                  value={appFilters.channel}
                  onChange={(e) => { setAppFilters(f => ({ ...f, channel: e.target.value })); setAppPage(1); }}
                >
                  <option value="">ช่องทางทั้งหมด</option>
                  {channels.filter(c => c.is_active !== false).map(c => (
                    <option key={c.id} value={c.name_th || c.name}>{c.name_th || c.name}</option>
                  ))}
                </select>
                {/* Status Filter */}
                <select
                  className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                  value={appFilters.status}
                  onChange={(e) => { setAppFilters(f => ({ ...f, status: e.target.value })); setAppPage(1); }}
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="Pending">รอดำเนินการ</option>
                  <option value="Reviewing">กำลังพิจารณา</option>
                  <option value="InterviewScheduled">นัดสัมภาษณ์</option>
                  <option value="Interviewed">สัมภาษณ์แล้ว</option>
                  <option value="Offer">เสนอจ้าง</option>
                  <option value="Hired">รับเข้าทำงาน</option>
                  <option value="Rejected">ไม่ผ่าน</option>
                  <option value="Withdrawn">ผู้สมัครยกเลิก</option>
                  <option value="NoShow">ไม่มาตามนัด</option>
                </select>
              </div>

              {/* Assignment Quick Filter Tabs */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { value: 'all', label: 'ทั้งหมด', icon: Users },
                  { value: 'me', label: 'เคสของฉัน', icon: UserCheck },
                  { value: 'unassigned', label: 'ยังไม่มีเคส', icon: UserPlus },
                ].map(tab => (
                  <button
                    key={tab.value}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${appFilters.assignment === tab.value
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => { setAppFilters(f => ({ ...f, assignment: tab.value })); setAppPage(1); }}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtered & Paginated Data */}
          {(() => {
            const filtered = applications.filter((app: any) => {
              if (appFilters.status !== 'all') {
                if (appFilters.status === 'InterviewScheduled' && !isInterviewScheduledStatus(app.status)) return false;
                if (appFilters.status !== 'InterviewScheduled' && app.status !== appFilters.status) return false;
              }
              if (appFilters.assignment === 'me' && (!currentUserId || String(app.assigned_to).toLowerCase() !== String(currentUserId).toLowerCase())) return false;
              if (appFilters.assignment === 'unassigned' && app.assigned_to) return false;
              if (appFilters.position && (app.position || app.form_data?.position) !== appFilters.position) return false;
              if (appFilters.bu && (app.form_data?.businessUnit || app.business_unit) !== appFilters.bu) return false;
              if (appFilters.channel && (app.form_data?.sourceChannel || app.source_channel) !== appFilters.channel) return false;
              if (appFilters.search) {
                const q = appFilters.search.toLowerCase();
                const name = (app.full_name || `${app.form_data?.firstName || ''} ${app.form_data?.lastName || ''}`).toLowerCase();
                const phone = (app.phone || app.form_data?.phone || '').toLowerCase();
                if (!name.includes(q) && !phone.includes(q)) return false;
              }
              return true;
            });
            const totalPages = Math.ceil(filtered.length / appPerPage);
            const paginated = filtered.slice((appPage - 1) * appPerPage, appPage * appPerPage);

            return (
              <>
                {/* ===== MOBILE: Card List ===== */}
                <div className="lg:hidden">
                  {paginated.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้สมัคร</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {paginated.map((app: any, idx: number) => {
                        const rowIndex = (appPage - 1) * appPerPage + idx + 1;
                        const fd = app.form_data || {};
                        const fullName = app.full_name || `${fd.prefix || ''} ${fd.firstName || ''} ${fd.lastName || ''}`.trim() || 'ไม่ระบุ';
                        const phone = app.phone || fd.phone || '-';
                        const dept = app.department || fd.department || '-';
                        const pos = app.position || fd.position || '-';
                        const bu = fd.businessUnit || app.business_unit || '';
                        const ch = fd.sourceChannel || app.source_channel || '';

                        return (
                          <div key={app.id} className="py-3 px-1 hover:bg-gray-50/50 transition-colors" onClick={() => setViewingApp(app)}>
                            <div className="flex items-start gap-3">
                              {/* Photo */}
                              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex items-center justify-center mt-0.5">
                                {fd.photoUrl ? (
                                  <img src={fd.photoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-bold text-indigo-400">
                                    {(fullName.charAt(0) || '?').toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate">{fullName}{fd.nickname ? ` (${fd.nickname})` : ''}</h4>
                                  <div className="flex flex-col items-end">
                                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full flex-shrink-0 ${getStatusBadgeClass(app.status)}`}>
                                      {getStatusLabel(app.status)}
                                    </span>
                                    {isInterviewScheduledStatus(app.status) && app.interview_date && (
                                      <div className="text-[10px] text-orange-600 font-medium mt-1 whitespace-nowrap">
                                        นัด: {new Date(app.interview_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-0.5 font-medium">{pos}</div>
                                <div className="text-xs text-gray-400">{dept}</div>
                                <div className="flex items-center justify-between mt-1.5">
                                  <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>
                                    <span>·</span>
                                    <span>{new Date(app.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })} {new Date(app.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                                    {fd.age && <><span>·</span><span>{fd.age} ปี</span></>}
                                  </div>
                                  {/* Action Menu */}
                                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors border border-indigo-200"
                                      onClick={(e) => openActionMenu(app.id, e)}
                                    >
                                      จัดการ <ChevronDown className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {/* Tags */}
                                {(bu || ch) && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {bu && <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium border ${getBuColor(bu)}`}>BU: {bu}</span>}
                                    {ch && <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-600 font-medium border border-blue-100">CH: {ch}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ===== DESKTOP: Table ===== */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">ลำดับ</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สมัคร</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้สมัคร</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง / แผนก</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">แหล่งที่มา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28 whitespace-nowrap">สถานะ</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-28 whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginated.map((app: any, idx: number) => {
                        const rowIndex = (appPage - 1) * appPerPage + idx + 1;
                        const fd = app.form_data || {};
                        const fullName = app.full_name || `${fd.prefix || ''} ${fd.firstName || ''} ${fd.lastName || ''}`.trim() || 'ไม่ระบุ';
                        const phone = app.phone || fd.phone || '-';
                        const dept = app.department || fd.department || '-';
                        const pos = app.position || fd.position || '-';
                        const bu = fd.businessUnit || app.business_unit || '';
                        const ch = fd.sourceChannel || app.source_channel || '';
                        const tag = fd.campaignTag || app.campaign_tag || '';

                        return (
                          <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                            {/* ลำดับ */}
                            <td className="px-4 py-3 text-sm text-gray-500 text-center font-medium bg-gray-50/50 w-16">{rowIndex}</td>

                            {/* วันที่สมัคร */}
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-800 whitespace-nowrap">
                                {new Date(app.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                  {new Date(app.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                  className="text-gray-300 hover:text-indigo-500 transition-colors p-0.5 rounded"
                                  title={`Copy ID: ${app.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(app.id);
                                    const target = e.currentTarget;
                                    target.classList.add('text-green-500');
                                    setTimeout(() => target.classList.remove('text-green-500'), 1000);
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            {/* ผู้สมัคร */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {/* Profile Thumbnail */}
                                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex items-center justify-center">
                                  {fd.photoUrl ? (
                                    <img src={fd.photoUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs font-bold text-indigo-400">
                                      {(fullName.charAt(0) || '?').toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div
                                    className="text-sm font-semibold text-indigo-700 whitespace-nowrap cursor-pointer hover:text-indigo-900 hover:underline transition-colors truncate max-w-[180px]"
                                    onClick={() => setViewingApp(app)}
                                    title={`${fullName} — คลิกเพื่อดูรายละเอียด`}
                                  >
                                    {fullName}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center mt-0.5 whitespace-nowrap">
                                    <Phone className="w-3 h-3 mr-1" /> {phone}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* ตำแหน่ง / แผนก */}
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{pos}</div>
                              <div className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">{dept}</div>
                            </td>

                            {/* แหล่งที่มา (BU + Channel) */}
                            <td className="px-4 py-3">
                              <div className="flex flex-col items-start gap-1">
                                {bu ? <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium whitespace-nowrap border ${getBuColor(bu)}`} title="Business Unit">BU: {bu}</span> : null}
                                {ch ? <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-700 font-medium whitespace-nowrap border border-blue-100 placeholder-transparent" title="Channel">CH: {ch}</span> : null}
                                {!bu && !ch && <span className="text-gray-400 text-xs">-</span>}
                              </div>
                            </td>

                            {/* สถานะ */}
                            <td className="px-4 py-3 w-28 whitespace-nowrap">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${getStatusBadgeClass(app.status)}`}>
                                  {getStatusLabel(app.status)}
                                </span>
                                {isInterviewScheduledStatus(app.status) && app.interview_date && (
                                  <span className="text-[11px] text-orange-600 font-medium whitespace-nowrap">
                                    นัด: {new Date(app.interview_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              {/* Assignment logic */}
                              {app.assigned_to ? (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200">
                                    {app.assigned_user?.emp_id ? (
                                      <img
                                        src={`https://wms.advanceagro.net/WSVIS/api/Face/GetImage?CardID=${app.assigned_user.emp_id}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="flex items-center justify-center w-full h-full text-[10px] font-bold text-indigo-500">${(app.assigned_user?.full_name || '?').charAt(0)}</span>`); }}
                                      />
                                    ) : (
                                      <span className="flex items-center justify-center w-full h-full text-[10px] font-bold text-indigo-500">
                                        {(app.assigned_user?.full_name || '?').charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-indigo-700 font-medium truncate max-w-[80px]">
                                    {app.assigned_user?.full_name || 'ผู้ดูแล'}
                                  </span>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" className="h-7 text-xs bg-white mt-1.5 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); setClaimingApp(app); }}>
                                  <UserPlus className="w-3.5 h-3.5 mr-1" /> Claim
                                </Button>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 w-20 text-center whitespace-nowrap">
                              <button
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium transition-colors border border-indigo-200"
                                onClick={(e) => { e.stopPropagation(); openActionMenu(app.id, e); }}
                              >
                                จัดการ <ChevronDown className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {paginated.length === 0 && (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้สมัคร</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>แสดง:</span>
                    <select
                      className="border rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={appPerPage}
                      onChange={(e) => { setAppPerPage(Number(e.target.value)); setAppPage(1); }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>รายการ | {filtered.length === 0 ? 0 : (appPage - 1) * appPerPage + 1}-{Math.min(appPage * appPerPage, filtered.length)} จาก {filtered.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" disabled={appPage === 1} onClick={() => setAppPage(1)}>«</Button>
                    <Button size="sm" variant="outline" disabled={appPage === 1} onClick={() => setAppPage(p => p - 1)}>‹</Button>
                    <span className="px-3 py-1 text-sm">หน้า {appPage} / {totalPages || 1}</span>
                    <Button size="sm" variant="outline" disabled={appPage >= totalPages} onClick={() => setAppPage(p => p + 1)}>›</Button>
                    <Button size="sm" variant="outline" disabled={appPage >= totalPages} onClick={() => setAppPage(totalPages)}>»</Button>
                  </div>
                </div>
              </>
            );
          })()}
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="h-96">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Application Trends</h3>
            <div className="h-72 w-full" style={{ minWidth: '200px', minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#F3F4F6' }}
                  />
                  <Bar dataKey="applications" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="h-96">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Applications by Business Unit</h3>
            <div className="h-72 w-full" style={{ minWidth: '200px', minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                <PieChart>
                  <Pie
                    data={deptData.length > 0 ? deptData : [{ name: 'No Data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(deptData.length > 0 ? deptData : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

    </>
  );
};
