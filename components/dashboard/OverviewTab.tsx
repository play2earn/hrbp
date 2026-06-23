import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Card, Button } from '../UIComponents';
import {
  FileText, Users, Edit, Calendar, CheckCircle, XCircle,
  Search, MoreVertical, LayoutGrid, List, ChevronDown, ChevronRight, Check,
  UserPlus, UserCheck, Phone, Copy, ShieldAlert
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

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
  minWidth?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  minWidth = '160px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div 
      className={`relative w-full md:w-auto ${className}`} 
      ref={containerRef} 
      style={{ minWidth }}
    >
      <div
        className="border rounded-lg px-2.5 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full flex items-center justify-between cursor-pointer text-gray-700 hover:border-gray-400 select-none shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-gray-100 flex items-center gap-1.5 bg-gray-50 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400 py-0.5"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1 text-xs">
            <button
              type="button"
              className={`w-full text-left px-3 py-1.5 hover:bg-indigo-50/50 font-medium transition-colors ${value === '' ? 'bg-indigo-50/80 text-indigo-700' : 'text-gray-600'}`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearch('');
              }}
            >
              {placeholder}
            </button>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 italic">ไม่พบข้อมูล</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 hover:bg-indigo-50/50 truncate transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


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
  blacklistEntries: any[];
  onViewBlacklistDetail: (entry: any) => void;
  loading?: boolean;
}

export const OverviewTab = React.memo<OverviewTabProps>(({
  stats, fetchData, applications, positions, departments, businessUnits, channels,
  appFilters, setAppFilters, appPage, setAppPage,
  actionMenu, setActionMenu, setViewingApp, setEditingApp,
  setClaimingApp, setTransferringApp, setUnassigningApp, setInterviewingApp,
  setRejectingApp, setApprovingApp, currentUserId,
  appPerPage, setAppPerPage, openActionMenu, blacklistEntries,
  onViewBlacklistDetail, loading = false
}) => {

  const checkIsBlacklisted = React.useCallback((app: any) => {
    if (!blacklistEntries || blacklistEntries.length === 0) return null;
    const fd = app.form_data || {};
    const nationalId = (fd.nationalId || '').trim();
    const passportNo = (fd.passportNo || '').trim().toUpperCase();

    for (const entry of blacklistEntries) {
      if (entry.status !== 'active') continue;
      
      if (entry.national_id && nationalId && entry.national_id.trim() === nationalId) {
        return entry;
      }
      if (entry.passport_no && passportNo && entry.passport_no.trim().toUpperCase() === passportNo) {
        return entry;
      }
    }
    return null;
  }, [blacklistEntries]);

  const appsByBU = useMemo(() => {
    const acc: Record<string, number> = {};
    applications.forEach((app: any) => {
      const bu = app.form_data?.businessUnit || app.business_unit || 'Unknown';
      acc[bu] = (acc[bu] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const selectedDeptObj = useMemo(() => {
    if (!appFilters.department) return null;
    return departments.find(d => d.name_th === appFilters.department || d.name === appFilters.department);
  }, [departments, appFilters.department]);

  const positionOptions = useMemo(() => {
    let filteredPositions = positions;
    if (selectedDeptObj) {
      filteredPositions = positions.filter(p => p.department_id === selectedDeptObj.id);
    }
    return filteredPositions
      .filter(p => p.is_active !== false)
      .map(p => ({
        value: p.name_th || p.name,
        label: p.name_th || p.name
      }));
  }, [positions, selectedDeptObj]);

  const departmentOptions = useMemo(() => {
    return departments
      .filter(d => d.is_active !== false)
      .map(d => ({
        value: d.name_th || d.name,
        label: d.name_th || d.name
      }));
  }, [departments]);

  const handleDepartmentChange = React.useCallback((deptName: string) => {
    setAppFilters(f => {
      let nextPosition = f.position;
      if (deptName) {
        const selectedDept = departments.find(d => d.name_th === deptName || d.name === deptName);
        if (selectedDept) {
          const exists = positions.some(p => p.department_id === selectedDept.id && (p.name_th === f.position || p.name === f.position));
          if (!exists) {
            nextPosition = '';
          }
        }
      }
      return { ...f, department: deptName, position: nextPosition };
    });
    setAppPage(1);
  }, [departments, positions, setAppFilters, setAppPage]);

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

  const appsByDate = useMemo(() => {
    const acc: Record<string, number> = {};
    // Sort applications by date first
    const sorted = [...applications].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    sorted.forEach((app: any) => {
      const date = new Date(app.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
      acc[date] = (acc[date] || 0) + 1;
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

  const chartData = appsByDate.length > 0 ? appsByDate : [{ name: 'No Data', value: 0 }];
  const statusData = appsByStatus.length > 0 ? appsByStatus : [{ name: 'No Data', value: 0 }];
  const buData = appsByBU.length > 0 ? appsByBU : [{ name: 'No Data', value: 0 }];
  const deptData = appsByDept.length > 0 ? appsByDept : [{ name: 'No Data', value: 0 }];

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
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col justify-between h-24 sm:h-28 shadow-sm">
                <div className="flex items-center justify-between w-full">
                  <div className="space-y-2 flex-1 min-w-0 pr-2">
                    <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-5 sm:h-7 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl flex-shrink-0"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
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
        )}

        {/* Recent Applications Table */}
        <Card>
          <div className="border-b border-gray-100 pb-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Applications</h3>
                <p className="text-xs text-gray-500 mt-1">จัดการและติดตามสถานะผู้สมัครทั้งหมด</p>
              </div>
              
              {/* Search & Quick Tabs */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64 flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, เบอร์โทร..."
                    className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={appFilters.search}
                    onChange={(e) => { setAppFilters(f => ({ ...f, search: e.target.value })); setAppPage(1); }}
                  />
                </div>
                
                {/* Assignment Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-between sm:justify-start">
                  {[
                    { value: 'all', label: 'ทั้งหมด', icon: Users },
                    { value: 'me', label: 'เคสของฉัน', icon: UserCheck },
                    { value: 'unassigned', label: 'ยังไม่มีเคส', icon: UserPlus },
                  ].map(tab => (
                    <button
                      key={tab.value}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 sm:flex-none justify-center ${appFilters.assignment === tab.value
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                      onClick={() => { setAppFilters(f => ({ ...f, assignment: tab.value })); setAppPage(1); }}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter Dropdowns Row */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-gray-50">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:inline">ตัวกรอง:</span>
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2.5 w-full md:w-auto flex-1">
                {/* Department Filter */}
                <SearchableSelect
                  options={departmentOptions}
                  value={appFilters.department}
                  onChange={handleDepartmentChange}
                  placeholder="แผนกทั้งหมด"
                  minWidth="140px"
                />

                {/* Position Filter */}
                <SearchableSelect
                  options={positionOptions}
                  value={appFilters.position}
                  onChange={(val) => { setAppFilters(f => ({ ...f, position: val })); setAppPage(1); }}
                  placeholder="ตำแหน่งทั้งหมด"
                  minWidth="160px"
                />
                
                {/* BU Filter */}
                <select
                  className="border rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto min-w-[120px] text-gray-700"
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
                  className="border rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto min-w-[130px] text-gray-700"
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
                  className="border rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto min-w-[120px] text-gray-700"
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

                {/* Blacklist Filter */}
                <select
                  className="border rounded-lg px-2 py-1.5 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto min-w-[130px] text-gray-750 font-semibold"
                  value={appFilters.blacklist || 'all'}
                  onChange={(e) => { setAppFilters(f => ({ ...f, blacklist: e.target.value })); setAppPage(1); }}
                >
                  <option value="all">ประวัติทั้งหมด (All)</option>
                  <option value="yes">⚠️ ติด Blacklist</option>
                  <option value="no">✅ ประวัติปกติ</option>
                </select>
                
                {/* Clear Filters Button */}
                {(appFilters.position || appFilters.department || appFilters.bu || appFilters.channel || appFilters.status !== 'all' || (appFilters.blacklist && appFilters.blacklist !== 'all') || appFilters.search) && (
                  <button
                    onClick={() => {
                      setAppFilters({
                        search: '',
                        status: 'all',
                        position: '',
                        department: '',
                        bu: '',
                        channel: '',
                        assignment: appFilters.assignment,
                        blacklist: 'all'
                      });
                      setAppPage(1);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2.5 py-1.5 rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-1 col-span-2 md:col-span-1 md:w-auto"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtered & Paginated Data */}
          {loading ? (
            <>
              {/* ===== MOBILE: Card List Skeleton ===== */}
              <div className="lg:hidden divide-y divide-gray-100 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-3 px-1 flex items-start gap-3">
                    <div className="w-11 h-11 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 mt-1">
                      <div className="flex justify-between items-center w-full">
                        <div className="h-3.5 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded-full w-16"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2.5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== DESKTOP: Table Skeleton ===== */}
              <div className="hidden lg:block overflow-x-auto animate-pulse">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">ลำดับ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">วันที่สมัคร</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้สมัคร / แหล่งที่มา</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง / แผนก</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">สถานะ</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="h-16">
                        <td className="px-4 py-3 bg-gray-50/50 text-center"><div className="h-3.5 bg-gray-200 rounded w-1/2 mx-auto"></div></td>
                        <td className="px-4 py-3"><div className="space-y-1.5"><div className="h-3.5 bg-gray-300 rounded w-2/3"></div><div className="h-2.5 bg-gray-200 rounded w-1/2"></div></div></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0"></div>
                            <div className="space-y-1.5 flex-1">
                              <div className="h-3.5 bg-gray-300 rounded w-1/2"></div>
                              <div className="h-2.5 bg-gray-200 rounded w-1/3"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><div className="space-y-1.5"><div className="h-3.5 bg-gray-300 rounded w-3/4"></div><div className="h-2.5 bg-gray-200 rounded w-1/2"></div></div></td>
                        <td className="px-4 py-3"><div className="h-5 bg-gray-200 rounded-full w-20"></div></td>
                        <td className="px-4 py-3"><div className="h-7 bg-gray-200 rounded-lg w-16 mx-auto"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (() => {
            const filtered = applications.filter((app: any) => {
              if (appFilters.status !== 'all') {
                if (appFilters.status === 'InterviewScheduled' && !isInterviewScheduledStatus(app.status)) return false;
                if (appFilters.status !== 'InterviewScheduled' && app.status !== appFilters.status) return false;
              }
              if (appFilters.assignment === 'me' && (!currentUserId || String(app.assigned_to).toLowerCase() !== String(currentUserId).toLowerCase())) return false;
              if (appFilters.assignment === 'unassigned' && app.assigned_to) return false;
              if (appFilters.position && (app.position || app.form_data?.position) !== appFilters.position) return false;
              if (appFilters.department) {
                const appDept = (app.department || app.form_data?.department || app.form_data?.departmentEn || '').trim().toLowerCase();
                const filterDept = appFilters.department.trim().toLowerCase();
                if (appDept !== filterDept) return false;
              }
              if (appFilters.bu && (app.form_data?.businessUnit || app.business_unit) !== appFilters.bu) return false;
              if (appFilters.channel && (app.form_data?.sourceChannel || app.source_channel) !== appFilters.channel) return false;
              
              // Blacklist filter
              if (appFilters.blacklist && appFilters.blacklist !== 'all') {
                const isBlacklisted = checkIsBlacklisted(app);
                if (appFilters.blacklist === 'yes' && !isBlacklisted) return false;
                if (appFilters.blacklist === 'no' && isBlacklisted) return false;
              }

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
                        const isForeigner = fd.isThaiNational === false;
                        const dept = isForeigner ? (fd.departmentEn || app.department || fd.department || '-') : (app.department || fd.department || '-');
                        const pos = isForeigner ? (fd.positionEn || app.position || fd.position || '-') : (app.position || fd.position || '-');
                        const bu = fd.businessUnit || app.business_unit || '';
                        const ch = fd.sourceChannel || app.source_channel || '';
                        const isBlacklisted = checkIsBlacklisted(app);

                        return (
                          <div key={app.id} className="py-3 px-1 hover:bg-gray-50/50 transition-colors" onClick={() => setViewingApp(app)}>
                            <div className="flex items-start gap-3">
                              {/* Photo */}
                              <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex items-center justify-center mt-0.5">
                                {fd.photoUrl ? (
                                  <img src={fd.photoUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(fd.photoUrl)}` : fd.photoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm font-bold text-indigo-400">
                                    {(fullName.charAt(0) || '?').toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
                                    {fullName}{fd.nickname ? ` (${fd.nickname})` : ''}
                                    {isBlacklisted && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewBlacklistDetail(isBlacklisted);
                                        }}
                                        className="inline-flex items-center text-red-600 bg-red-55/20 border border-red-200 px-1 py-0.5 rounded text-[10px] font-bold gap-0.5 hover:bg-red-100 hover:text-red-700 transition-colors animate-pulse flex-shrink-0 align-middle"
                                        title="คลิกเพื่อดูรายละเอียดประวัติเสีย"
                                      >
                                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                        <span>Blacklist</span>
                                      </button>
                                    )}
                                  </h4>
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
                                    {bu && <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium border max-w-[140px] truncate inline-block align-middle ${getBuColor(bu)}`} title={`BU: ${bu}`}>BU: {bu}</span>}
                                    {ch && <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-600 font-medium border border-blue-100 max-w-[140px] truncate inline-block align-middle" title={`Channel: ${ch}`}>CH: {ch}</span>}
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">วันที่สมัคร</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้สมัคร / แหล่งที่มา</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง / แผนก</th>
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
                        const isForeigner = fd.isThaiNational === false;
                        const dept = isForeigner ? (fd.departmentEn || app.department || fd.department || '-') : (app.department || fd.department || '-');
                        const pos = isForeigner ? (fd.positionEn || app.position || fd.position || '-') : (app.position || fd.position || '-');
                        const bu = fd.businessUnit || app.business_unit || '';
                        const ch = fd.sourceChannel || app.source_channel || '';
                        const tag = fd.campaignTag || app.campaign_tag || '';
                        const isBlacklisted = checkIsBlacklisted(app);

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

                            {/* ผู้สมัคร / แหล่งที่มา */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {/* Profile Thumbnail */}
                                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 border border-gray-200 flex items-center justify-center">
                                  {fd.photoUrl ? (
                                    <img src={fd.photoUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(fd.photoUrl)}` : fd.photoUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs font-bold text-indigo-400">
                                      {(fullName.charAt(0) || '?').toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <div
                                      className="text-sm font-semibold text-indigo-700 whitespace-nowrap cursor-pointer hover:text-indigo-900 hover:underline transition-colors truncate max-w-[150px]"
                                      onClick={() => setViewingApp(app)}
                                      title={`${fullName} — คลิกเพื่อดูรายละเอียด`}
                                    >
                                      {fullName}
                                    </div>
                                    {isBlacklisted && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewBlacklistDetail(isBlacklisted);
                                        }}
                                        className="inline-flex items-center text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold gap-0.5 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                                        title="คลิกเพื่อดูรายละเอียดประวัติเสีย"
                                      >
                                        <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-red-600" />
                                        <span>Blacklist</span>
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center mt-0.5 whitespace-nowrap">
                                    <Phone className="w-3 h-3 mr-1" /> {phone}
                                  </div>
                                  {/* แหล่งที่มา (BU + Channel) */}
                                  {(bu || ch) && (
                                    <div className="flex flex-wrap gap-1 mt-1.5 max-w-[180px]">
                                      {bu && <span className={`px-1.5 py-0.5 text-[9px] rounded font-medium border max-w-[120px] truncate inline-block align-middle ${getBuColor(bu)}`} title={`BU: ${bu}`}>BU: {bu}</span>}
                                      {ch && <span className="px-1.5 py-0.5 text-[9px] rounded bg-blue-50 text-blue-700 font-medium border border-blue-100 max-w-[120px] truncate inline-block align-middle" title={`Channel: ${ch}`}>CH: {ch}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* ตำแหน่ง / แผนก */}
                            <td className="px-4 py-3 max-w-[240px]">
                              <div className="text-sm font-medium text-gray-800 break-words">{pos}</div>
                              <div className="text-xs text-gray-500 mt-1 break-words">{dept}</div>
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
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้สมัคร</td></tr>
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
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="h-96 animate-pulse flex flex-col justify-between p-6 bg-white">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="h-72 w-full bg-gray-100/50 rounded-lg flex items-end justify-between p-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-t w-8" style={{ height: `${20 + i * 15}%` }}></div>
                ))}
              </div>
            </Card>
            <Card className="h-96 animate-pulse flex flex-col justify-between p-6 bg-white">
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="h-72 w-full flex items-center justify-center">
                <div className="w-44 h-44 rounded-full border-[10px] border-gray-100 border-t-gray-200 flex items-center justify-center"></div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="h-96">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Application Trends (by Date)</h3>
              <div className="h-72 w-full" style={{ minWidth: '200px', minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#F3F4F6' }}
                    />
                    <Bar dataKey="value" name="Applications" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={30} />
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
                      data={buData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={renderCustomizedLabel}
                      labelLine={false}
                    >
                      {buData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBuChartColor(entry.name, index)} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>

    </>
  );
});

