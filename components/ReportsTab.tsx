import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button } from './UIComponents';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { api } from '../services/api';
import { 
  BarChart2, PieChart as PieChartIcon, Activity, GraduationCap, 
  Building2, Languages, Sparkles, Filter, X, Search, ChevronDown, 
  User, UserCheck, UserX, AlertCircle, ExternalLink, Briefcase,
  Users, Clock, ShieldAlert
} from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

// Brand-specific BU color map
const BU_COLOR_MAP: Record<string, string> = {
  'ดั๊บเบิ้ล เอ': '#2563EB',   // Blue
  'Double A': '#2563EB',      // Support legacy data
  'NPS': '#EAB308',           // Yellow
  'ReLo': '#16A34A',          // Green
};
const FALLBACK_COLORS = ['#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#EF4444', '#0EA5E9'];

const getBuColor = (buName: string, index: number): string => {
  return BU_COLOR_MAP[buName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

// Helper: Find highest education entry
const getHighestEdu = (eduList: any[]) => {
  if (!eduList || !Array.isArray(eduList) || eduList.length === 0) return null;
  const levelOrder: Record<string, number> = {
    'doctor': 5,
    'master': 4,
    'bachelor': 3,
    'diploma': 2,
    'vocational': 2,
    'highschool': 1,
    'other': 0
  };
  
  const normalizedList = eduList.map(e => {
    const lvl = (e.level || '').toLowerCase().trim();
    let stdLevel = 'other';
    if (lvl.includes('doctor') || lvl.includes('เอก') || lvl.includes('phd')) stdLevel = 'doctor';
    else if (lvl.includes('master') || lvl.includes('โท') || lvl.includes('mba')) stdLevel = 'master';
    else if (lvl.includes('bachelor') || lvl.includes('ตรี') || lvl.includes('ba') || lvl.includes('bs')) stdLevel = 'bachelor';
    else if (lvl.includes('diploma') || lvl.includes('ปวส') || lvl.includes('ปวช') || lvl.includes('อนุปริญญา')) stdLevel = 'diploma';
    else if (lvl.includes('school') || lvl.includes('มัธยม') || lvl.includes('ประถม')) stdLevel = 'highschool';
    return { ...e, stdLevel };
  });

  let highest = normalizedList[0];
  for (let i = 1; i < normalizedList.length; i++) {
    const currentWeight = levelOrder[normalizedList[i].stdLevel] ?? 0;
    const highestWeight = levelOrder[highest.stdLevel] ?? 0;
    if (currentWeight > highestWeight) {
      highest = normalizedList[i];
    }
  }
  return highest;
};

// Helper: Translate education level
const getEduLabel = (stdLevel: string) => {
  switch (stdLevel) {
    case 'doctor': return 'ปริญญาเอก';
    case 'master': return 'ปริญญาโท';
    case 'bachelor': return 'ปริญญาตรี';
    case 'diploma': return 'ปวส./ปวช./อนุปริญญา';
    case 'highschool': return 'มัธยมปลาย';
    default: return 'อื่นๆ';
  }
};

// Helper: Get GPA grouping
const getGpaGroup = (gpaStr: string | undefined | null) => {
  if (!gpaStr) return 'ไม่ระบุ';
  const gpa = parseFloat(gpaStr.trim());
  if (isNaN(gpa)) return 'ไม่ระบุ';
  if (gpa >= 3.5) return 'ดีเลิศ (3.50+)';
  if (gpa >= 3.0) return 'ดี (3.00 - 3.49)';
  if (gpa >= 2.5) return 'ปานกลาง (2.50 - 2.99)';
  return 'ทั่วไป (< 2.50)';
};

// Helper: Get availability label
const getAvailabilityStatus = (app: any) => {
  const fd = app.form_data || {};
  if (fd.isAvailableImmediately === true || fd.isAvailableImmediately === 'true' || fd.availability === 'เริ่มงานได้ทันที') {
    return 'เริ่มงานได้ทันที';
  }
  return fd.availability || 'ต้องแจ้งล่วงหน้า (ปกติ)';
};

const getLangBadgeClass = (skill: string) => {
  switch ((skill || '').toLowerCase().trim()) {
    case 'advanced': return 'bg-emerald-55/20 text-emerald-700 border border-emerald-200';
    case 'good': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'fair': return 'bg-amber-50 text-amber-700 border border-amber-200';
    default: return 'bg-slate-50 text-slate-400 border border-slate-200';
  }
};

const translateLangSkill = (skill: string) => {
  switch ((skill || '').toLowerCase().trim()) {
    case 'advanced': return 'ดีมาก';
    case 'good': return 'ดี';
    case 'fair': return 'พอใช้';
    default: return 'ไม่มีทักษะ';
  }
};

const mapLangLabelToFilter = (label: string) => {
  if (label.includes('Advanced') || label.includes('ดีมาก')) return 'advanced';
  if (label.includes('Good') || label.includes('ดี')) return 'good';
  if (label.includes('Fair') || label.includes('พอใช้')) return 'fair';
  return 'all';
};

interface ReportsTabProps {
  setViewingApp: (app: any | null) => void;
  currentUserId?: string | null;
  activeUsers?: any[];
  businessUnits?: any[];
  departments?: any[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  setViewingApp,
  currentUserId,
  activeUsers = [],
  businessUnits = [],
  departments = []
}) => {
  // Navigation State
  const [subTab, setSubTab] = useState<'kpi' | 'talent_quality'>('kpi');

  // Existing reports state
  const [executiveSummary, setExecutiveSummary] = useState<any[]>([]);
  const [recruiterKpi, setRecruiterKpi] = useState<any[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Talent Pool state
  const [allApps, setAllApps] = useState<any[]>([]);
  const [allAppsLoading, setAllAppsLoading] = useState(false);
  
  // Unified Filters (Combines both chart clicks & dropdown selections)
  const [searchQuery, setSearchQuery] = useState('');
  const [eduFilter, setEduFilter] = useState('all');
  const [instituteFilter, setInstituteFilter] = useState('all');
  const [gpaFilter, setGpaFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [claimFilter, setClaimFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [buFilter, setBuFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');

  // Searchable dropdown search terms & visibility states
  const [instSearchText, setInstSearchText] = useState('');
  const [isInstDropdownOpen, setIsInstDropdownOpen] = useState(false);

  const [deptSearchText, setDeptSearchText] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  const [posSearchText, setPosSearchText] = useState('');
  const [isPosDropdownOpen, setIsPosDropdownOpen] = useState(false);

  // Sync searchable text boxes with filters
  useEffect(() => {
    if (instituteFilter === 'all') {
      setInstSearchText('');
    } else {
      setInstSearchText(instituteFilter);
    }
  }, [instituteFilter]);

  useEffect(() => {
    if (deptFilter === 'all') {
      setDeptSearchText('');
    } else {
      setDeptSearchText(deptFilter);
    }
  }, [deptFilter]);

  useEffect(() => {
    if (positionFilter === 'all') {
      setPosSearchText('');
    } else {
      setPosSearchText(positionFilter);
    }
  }, [positionFilter]);

  // Local Paging state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery, eduFilter, instituteFilter, gpaFilter, langFilter, 
    claimFilter, availabilityFilter, buFilter, deptFilter, positionFilter
  ]);

  // Fetch KPI data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [execData, kpiData, rejectData] = await Promise.all([
          api.reports.getExecutiveSummary(),
          api.reports.getRecruiterKpi(),
          api.reports.getRejectionReasons()
        ]);
        setExecutiveSummary(execData);
        setRecruiterKpi(kpiData);
        setRejectionReasons(rejectData);
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch all applications for Talent Analytics
  const fetchAllApps = async () => {
    setAllAppsLoading(true);
    try {
      const data = await api.getApplications();
      setAllApps(data || []);
    } catch (e) {
      console.error("Failed to fetch all applications:", e);
    } finally {
      setAllAppsLoading(false);
    }
  };

  // Get unique lists for filter options
  const uniqueInstitutes = useMemo(() => {
    const set = new Set<string>();
    allApps.forEach(app => {
      const fd = app.form_data || {};
      const highestEdu = getHighestEdu(fd.education);
      if (highestEdu && highestEdu.institute) {
        const name = highestEdu.institute.trim();
        if (name) set.add(name);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [allApps]);

  const uniqueBUs = useMemo(() => {
    const set = new Set<string>();
    allApps.forEach(app => {
      if (app.business_unit) {
        const name = app.business_unit.trim();
        if (name) set.add(name);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [allApps]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    allApps.forEach(app => {
      if (app.department) {
        const name = app.department.trim();
        if (name) set.add(name);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [allApps]);

  const uniquePositions = useMemo(() => {
    const set = new Set<string>();
    allApps.forEach(app => {
      if (app.position) {
        const name = app.position.trim();
        if (name) set.add(name);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'));
  }, [allApps]);

  // Filter unique lists based on search texts
  const filteredInstitutes = useMemo(() => {
    if (!instSearchText) return uniqueInstitutes;
    const q = instSearchText.toLowerCase();
    return uniqueInstitutes.filter(inst => inst.toLowerCase().includes(q));
  }, [uniqueInstitutes, instSearchText]);

  const filteredDepartments = useMemo(() => {
    if (!deptSearchText) return uniqueDepartments;
    const q = deptSearchText.toLowerCase();
    return uniqueDepartments.filter(dept => dept.toLowerCase().includes(q));
  }, [uniqueDepartments, deptSearchText]);

  const filteredPositions = useMemo(() => {
    if (!posSearchText) return uniquePositions;
    const q = posSearchText.toLowerCase();
    return uniquePositions.filter(pos => pos.toLowerCase().includes(q));
  }, [uniquePositions, posSearchText]);

  // Calculate statistics from allApps (Client-side)
  const talentMetrics = useMemo(() => {
    if (allApps.length === 0) return { total: 0, immediate: 0, unassigned: 0 };
    
    let immediate = 0;
    let unassigned = 0;

    allApps.forEach(app => {
      if (getAvailabilityStatus(app) === 'เริ่มงานได้ทันที') {
        immediate++;
      }
      if (!app.assigned_to) {
        unassigned++;
      }
    });

    return {
      total: allApps.length,
      immediate,
      unassigned
    };
  }, [allApps]);

  // Compile aggregations for Talent charts (Client-side caching)
  const chartsData = useMemo(() => {
    const eduCounts: Record<string, number> = { doctor: 0, master: 0, bachelor: 0, diploma: 0, highschool: 0, other: 0 };
    const instCounts: Record<string, number> = {};
    const posCounts: Record<string, number> = {};
    const buCounts: Record<string, number> = {};
    const gpaCounts: Record<string, number> = { 'ดีเลิศ (3.50+)': 0, 'ดี (3.00 - 3.49)': 0, 'ปานกลาง (2.50 - 2.99)': 0, 'ทั่วไป (< 2.50)': 0, 'ไม่ระบุ': 0 };
    const langLevels = {
      English: { Advanced: 0, Good: 0, Fair: 0, None: 0 },
      Chinese: { Advanced: 0, Good: 0, Fair: 0, None: 0 }
    };

    allApps.forEach(app => {
      const fd = app.form_data || {};
      const highestEdu = getHighestEdu(fd.education);

      // 1. Education Level
      if (highestEdu) {
        const lvl = highestEdu.stdLevel;
        if (eduCounts[lvl] !== undefined) eduCounts[lvl]++;
        else eduCounts.other++;

        // 2. Institutes (School names)
        if (highestEdu.institute) {
          const inst = highestEdu.institute.trim();
          if (inst) {
            instCounts[inst] = (instCounts[inst] || 0) + 1;
          }
        }

        // 3. GPA Group
        const gpaGrp = getGpaGroup(highestEdu.gpa);
        gpaCounts[gpaGrp]++;
      } else {
        eduCounts.other++;
        gpaCounts['ไม่ระบุ']++;
      }

      // 4. Position
      if (app.position) {
        const pos = app.position.trim();
        posCounts[pos] = (posCounts[pos] || 0) + 1;
      }

      // 5. Business Unit
      if (app.business_unit) {
        const bu = app.business_unit.trim();
        buCounts[bu] = (buCounts[bu] || 0) + 1;
      }

      // 6. Languages (English/Chinese)
      const eng = (fd.englishSkill || 'None').trim().toLowerCase();
      if (eng === 'advanced') langLevels.English.Advanced++;
      else if (eng === 'good') langLevels.English.Good++;
      else if (eng === 'fair') langLevels.English.Fair++;
      else langLevels.English.None++;

      const chi = (fd.chineseSkill || 'None').trim().toLowerCase();
      if (chi === 'advanced') langLevels.Chinese.Advanced++;
      else if (chi === 'good') langLevels.Chinese.Good++;
      else if (chi === 'fair') langLevels.Chinese.Fair++;
      else langLevels.Chinese.None++;
    });

    // Format Education Level Chart (Pie)
    const eduChartData = [
      { name: 'ปริญญาเอก', value: eduCounts.doctor, stdLevel: 'doctor' },
      { name: 'ปริญญาโท', value: eduCounts.master, stdLevel: 'master' },
      { name: 'ปริญญาตรี', value: eduCounts.bachelor, stdLevel: 'bachelor' },
      { name: 'ปวส./ปวช./อนุปริญญา', value: eduCounts.diploma, stdLevel: 'diploma' },
      { name: 'มัธยมปลาย', value: eduCounts.highschool, stdLevel: 'highschool' },
      { name: 'อื่นๆ', value: eduCounts.other, stdLevel: 'other' }
    ].filter(item => item.value > 0);

    // Format Top Institutes Chart (Vertical Bar - Top 5)
    const instChartData = Object.entries(instCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format Top Positions Chart (Vertical Bar - Top 5)
    const posChartData = Object.entries(posCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Format BU Distribution Chart (Pie)
    const buChartData = Object.entries(buCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Format GPA Groups Chart (Vertical Bar)
    const gpaChartData = [
      { name: 'ดีเลิศ (3.50+)', count: gpaCounts['ดีเลิศ (3.50+)'] },
      { name: 'ดี (3.00 - 3.49)', count: gpaCounts['ดี (3.00 - 3.49)'] },
      { name: 'ปานกลาง (2.50 - 2.99)', count: gpaCounts['ปานกลาง (2.50 - 2.99)'] },
      { name: 'ทั่วไป (< 2.50)', count: gpaCounts['ทั่วไป (< 2.50)'] },
      { name: 'ไม่ระบุ', count: gpaCounts['ไม่ระบุ'] }
    ].filter(item => item.count > 0);

    // Format Languages Chart
    const langChartData = [
      { name: 'ดีมาก (Advanced)', English: langLevels.English.Advanced, Chinese: langLevels.Chinese.Advanced },
      { name: 'ดี (Good)', English: langLevels.English.Good, Chinese: langLevels.Chinese.Good },
      { name: 'พอใช้ (Fair)', English: langLevels.English.Fair, Chinese: langLevels.Chinese.Fair },
      { name: 'ไม่มีทักษะ (None)', English: langLevels.English.None, Chinese: langLevels.Chinese.None }
    ];

    return {
      edu: eduChartData,
      institute: instChartData,
      position: posChartData,
      bu: buChartData,
      gpa: gpaChartData,
      lang: langChartData
    };
  }, [allApps]);

  // Filtered Candidates List
  const filteredCandidates = useMemo(() => {
    return allApps.filter(app => {
      const fd = app.form_data || {};
      const highestEdu = getHighestEdu(fd.education);
      
      // 1. Text Search (Name, position, department, institute)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = (app.full_name || '').toLowerCase().includes(query);
        const posMatch = (app.position || '').toLowerCase().includes(query);
        const deptMatch = (app.department || '').toLowerCase().includes(query);
        const instMatch = highestEdu && (highestEdu.institute || '').toLowerCase().includes(query);
        
        if (!nameMatch && !posMatch && !deptMatch && !instMatch) return false;
      }

      // 2. Education Level Filter
      if (eduFilter !== 'all') {
        if (!highestEdu || highestEdu.stdLevel !== eduFilter) return false;
      }

      // 3. Institute Filter
      if (instituteFilter !== 'all') {
        if (!highestEdu || highestEdu.institute !== instituteFilter) return false;
      }

      // 4. GPA Group Filter
      if (gpaFilter !== 'all') {
        if (getGpaGroup(highestEdu?.gpa) !== gpaFilter) return false;
      }

      // 5. Language Filter
      if (langFilter !== 'all') {
        const hasEng = (fd.englishSkill || '').toLowerCase().trim() === langFilter;
        const hasChi = (fd.chineseSkill || '').toLowerCase().trim() === langFilter;
        if (!hasEng && !hasChi) return false;
      }

      // 6. Availability Filter
      if (availabilityFilter !== 'all') {
        const isImmediate = getAvailabilityStatus(app) === 'เริ่มงานได้ทันที';
        if (availabilityFilter === 'immediate' && !isImmediate) return false;
        if (availabilityFilter === 'notice' && isImmediate) return false;
      }

      // 7. Claim Filter
      if (claimFilter !== 'all') {
        if (claimFilter === 'claimed' && !app.assigned_to) return false;
        if (claimFilter === 'unassigned' && app.assigned_to) return false;
      }

      // 8. BU Filter
      if (buFilter !== 'all') {
        if ((app.business_unit || '').trim() !== buFilter) return false;
      }

      // 9. Department Filter
      if (deptFilter !== 'all') {
        if ((app.department || '').trim() !== deptFilter) return false;
      }

      // 10. Position Filter
      if (positionFilter !== 'all') {
        if ((app.position || '').trim() !== positionFilter) return false;
      }

      return true;
    });
  }, [
    allApps, searchQuery, eduFilter, instituteFilter, gpaFilter, langFilter, 
    availabilityFilter, claimFilter, buFilter, deptFilter, positionFilter
  ]);

  // Paginated Candidates List
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(start, start + itemsPerPage);
  }, [filteredCandidates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const clearAllFilters = () => {
    setSearchQuery('');
    setEduFilter('all');
    setInstituteFilter('all');
    setGpaFilter('all');
    setLangFilter('all');
    setClaimFilter('all');
    setAvailabilityFilter('all');
    setBuFilter('all');
    setDeptFilter('all');
    setPositionFilter('all');
    setInstSearchText('');
    setDeptSearchText('');
    setPosSearchText('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            รายงานสถิติวิเคราะห์ (Analytics Dashboard)
          </h2>
          <p className="text-slate-500 mt-1">ภาพรวมการสรรหาและตัวชี้วัดความสามารถของผู้สมัคร (HR Recruitment Intelligence)</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-center border border-slate-200">
          <button
            onClick={() => setSubTab('kpi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              subTab === 'kpi'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            ภาพรวม & KPIs
          </button>
          <button
            onClick={() => {
              setSubTab('talent_quality');
              if (allApps.length === 0) fetchAllApps();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative cursor-pointer ${
              subTab === 'talent_quality'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            วิเคราะห์ผู้สมัคร (Talent)
            {allApps.length === 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUB TAB 1: KPI OVERVIEW */}
      {subTab === 'kpi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Executive Summary by BU */}
            <Card className="p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-500" />
                ภาพรวมการสรรหา (ตาม BU)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={executiveSummary} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="business_unit" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="total_applications" name="ผู้สมัครทั้งหมด" radius={[4, 4, 0, 0]}>
                      {executiveSummary.map((entry: any, index: number) => (
                        <Cell key={`total-${index}`} fill={getBuColor(entry.business_unit, index)} />
                      ))}
                    </Bar>
                    <Bar dataKey="hired_count" name="รับเข้าทำงาน" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected_count" name="ไม่ผ่าน/ปฏิเสธ" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending_count" name="รอดำเนินการ" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="interview_scheduled_count" name="นัดสัมภาษณ์" fill="#F97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Rejection Reasons */}
            <Card className="p-6 border border-slate-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-pink-500" />
                สัดส่วนสาเหตุที่ไม่รับเข้าทำงาน (Rejection Reasons)
              </h3>
              <div className="h-80">
                {rejectionReasons.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie
                        data={rejectionReasons}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="rejection_reason"
                      >
                        {rejectionReasons.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number, name: string) => {
                          const total = rejectionReasons.reduce((sum, entry) => sum + entry.count, 0);
                          const percent = ((value / total) * 100).toFixed(0);
                          return [`${value} รายการ (${percent}%)`, name];
                        }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full text-slate-400">
                    ไม่มีข้อมูลสาเหตุการปฏิเสธ
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Recruiter KPI Table */}
          <Card className="p-6 border border-slate-100 hover:shadow-md transition-shadow overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Recruiter KPI & Performance ( SLA / Time-to-Hire )
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">ผู้รับผิดชอบ (Assigned To)</th>
                    <th className="py-3 px-4 font-semibold text-center">เคสทั้งหมด</th>
                    <th className="py-3 px-4 font-semibold text-center">เคส Active</th>
                    <th className="py-3 px-4 font-semibold text-center text-red-600">เกิน SLA</th>
                    <th className="py-3 px-4 font-semibold text-center">สัมภาษณ์แล้ว</th>
                    <th className="py-3 px-4 font-semibold text-center text-emerald-600">รับเข้าทำงาน</th>
                    <th className="py-3 px-4 font-semibold text-center text-amber-600">Time-to-Hire เฉลี่ย (วัน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recruiterKpi.length > 0 ? (
                    recruiterKpi.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">{row.assigned_to || 'ไม่ได้ระบุผู้รับผิดชอบ'}</td>
                        <td className="py-3 px-4 text-center">{row.assigned_count}</td>
                        <td className="py-3 px-4 text-center">{row.active_count ?? '-'}</td>
                        <td className="py-3 px-4 text-center text-red-600 font-medium">{row.overdue_active_count ?? '-'}</td>
                        <td className="py-3 px-4 text-center">{row.interviewed_count}</td>
                        <td className="py-3 px-4 text-center text-emerald-600 font-medium">{row.hired_count}</td>
                        <td className="py-3 px-4 text-center font-medium">
                          {row.avg_days_to_hire !== null ? Math.round(row.avg_days_to_hire) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        ไม่มีข้อมูล KPI ในขณะนี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* SUB TAB 2: TALENT QUALITY & PROFILE ANALYTICS */}
      {subTab === 'talent_quality' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 border border-slate-100 bg-gradient-to-br from-indigo-50/50 to-white hover:shadow-sm transition-shadow flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-indigo-600/80 uppercase tracking-wider">ฐานข้อมูลผู้สมัครทั้งหมด</span>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                  {allAppsLoading ? '...' : talentMetrics.total} <span className="text-sm font-normal text-slate-500">ราย</span>
                </h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </Card>

            <Card className="p-5 border border-slate-100 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-sm transition-shadow flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-emerald-600/80 uppercase tracking-wider">เริ่มงานได้ทันที (ว่างงาน)</span>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                  {allAppsLoading ? '...' : talentMetrics.immediate}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    ({talentMetrics.total > 0 ? Math.round((talentMetrics.immediate / talentMetrics.total) * 100) : 0}%)
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
            </Card>

            <Card className="p-5 border border-slate-100 bg-gradient-to-br from-rose-50/50 to-white hover:shadow-sm transition-shadow flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-rose-600/80 uppercase tracking-wider">เคสว่าง (ยังไม่มี HR ดูแล)</span>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                  {allAppsLoading ? '...' : talentMetrics.unassigned}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    ({talentMetrics.total > 0 ? Math.round((talentMetrics.unassigned / talentMetrics.total) * 100) : 0}%)
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
            </Card>
          </div>

          {allAppsLoading ? (
            <div className="space-y-6">
              {/* Charts Skeleton (3 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 border border-slate-100 bg-white h-96 flex flex-col justify-between">
                    <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="flex-1 bg-slate-100/50 rounded-xl mb-4 flex items-end justify-around p-4">
                      <div className="w-10 bg-slate-200 rounded-t h-2/3"></div>
                      <div className="w-10 bg-slate-200 rounded-t h-1/2"></div>
                      <div className="w-10 bg-slate-200 rounded-t h-3/4"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  </Card>
                ))}
              </div>

              {/* Table Directory Skeleton */}
              <Card className="p-6 border border-slate-100 bg-white animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-12 bg-slate-100 rounded-lg w-full"></div>
                <div className="h-64 bg-slate-50/50 rounded-xl w-full border border-slate-100"></div>
              </Card>
            </div>
          ) : (
            <>
              {/* Interactive Charts Section (3 Columns Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Education Level Pie Chart */}
                <Card className="p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-500" />
                      ระดับการศึกษาสูงสุด (Education Levels)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                      คลิกเพื่อกรอง
                    </span>
                  </div>
                  <div className="h-72">
                    {chartsData.edu.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, bottom: 10 }}>
                          <Pie
                            data={chartsData.edu}
                            cx="50%"
                            cy="45%"
                            outerRadius={75}
                            innerRadius={35}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            onClick={(entry) => {
                              const lvl = entry.payload?.stdLevel || 'all';
                              setEduFilter(prev => prev === lvl ? 'all' : lvl);
                            }}
                            className="cursor-pointer"
                          >
                            {chartsData.edu.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                stroke={eduFilter === entry.stdLevel ? '#1E1B4B' : '#fff'}
                                strokeWidth={eduFilter === entry.stdLevel ? 2.5 : 1}
                              />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        ไม่มีข้อมูลสถิติการศึกษา
                      </div>
                    )}
                  </div>
                </Card>

                {/* 2. Top Institutes Bar Chart */}
                <Card className="p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                      5 สถาบันการศึกษายอดนิยม (Top Institutes)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                      คลิกเพื่อกรอง
                    </span>
                  </div>
                  <div className="h-72">
                    {chartsData.institute.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartsData.institute} 
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tickLine={false} 
                            axisLine={false}
                            width={145}
                            tick={{ fontSize: 10, fill: '#475569' }} 
                          />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar 
                            dataKey="count" 
                            name="จำนวนผู้สมัคร" 
                            radius={[0, 4, 4, 0]}
                            onClick={(entry) => {
                              const name = entry?.name || 'all';
                              setInstituteFilter(prev => prev === name ? 'all' : name);
                            }}
                            className="cursor-pointer"
                          >
                            {chartsData.institute.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[(index + 2) % COLORS.length]} 
                                opacity={instituteFilter === entry.name ? 1 : (instituteFilter === 'all' ? 0.85 : 0.45)}
                                stroke={instituteFilter === entry.name ? '#1E1B4B' : 'transparent'}
                                strokeWidth={instituteFilter === entry.name ? 2 : 0}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        ไม่มีข้อมูลสถิติสถาบันการศึกษา
                      </div>
                    )}
                  </div>
                </Card>

                {/* 3. GPA Groups Bar Chart */}
                <Card className="p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-500" />
                      ช่วงเกรดเฉลี่ยสะสม (GPA Groups)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                      คลิกเพื่อกรอง
                    </span>
                  </div>
                  <div className="h-72">
                    {chartsData.gpa.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartsData.gpa} 
                          margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar 
                            dataKey="count" 
                            name="ผู้สมัคร" 
                            radius={[4, 4, 0, 0]}
                            onClick={(entry) => {
                              const grp = entry?.name || 'all';
                              setGpaFilter(prev => prev === grp ? 'all' : grp);
                            }}
                            className="cursor-pointer"
                          >
                            {chartsData.gpa.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.name.includes('ดีเลิศ') ? '#10B981' : entry.name.includes('ดี') ? '#3B82F6' : entry.name.includes('ปานกลาง') ? '#F59E0B' : '#64748B'} 
                                opacity={gpaFilter === entry.name ? 1 : (gpaFilter === 'all' ? 0.85 : 0.45)}
                                stroke={gpaFilter === entry.name ? '#1E1B4B' : 'transparent'}
                                strokeWidth={gpaFilter === entry.name ? 2 : 0}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        ไม่มีข้อมูลเกรดเฉลี่ยสะสม
                      </div>
                    )}
                  </div>
                </Card>

                {/* 4. Language Skills Bar Chart */}
                <Card className="p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-pink-500" />
                      ระดับภาษาอังกฤษและจีน (Language Levels)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                      คลิกเพื่อกรอง
                    </span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartsData.lang} 
                        margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar 
                          dataKey="English" 
                          fill="#4F46E5" 
                          radius={[4, 4, 0, 0]} 
                          name="ภาษาอังกฤษ"
                          onClick={(entry) => {
                            const lvl = mapLangLabelToFilter(entry?.name || '');
                            setLangFilter(prev => prev === lvl ? 'all' : lvl);
                          }}
                          className="cursor-pointer"
                        >
                          {chartsData.lang.map((entry, index) => {
                            const lvl = mapLangLabelToFilter(entry.name);
                            const isSelected = langFilter === lvl;
                            return (
                              <Cell
                                key={`cell-eng-${index}`}
                                fill="#4F46E5"
                                opacity={isSelected ? 1 : (langFilter === 'all' ? 0.85 : 0.45)}
                                stroke={isSelected ? '#1E1B4B' : 'transparent'}
                                strokeWidth={isSelected ? 2 : 0}
                              />
                            );
                          })}
                        </Bar>
                        <Bar 
                          dataKey="Chinese" 
                          fill="#F43F5E" 
                          radius={[4, 4, 0, 0]} 
                          name="ภาษาจีน"
                          onClick={(entry) => {
                            const lvl = mapLangLabelToFilter(entry?.name || '');
                            setLangFilter(prev => prev === lvl ? 'all' : lvl);
                          }}
                          className="cursor-pointer"
                        >
                          {chartsData.lang.map((entry, index) => {
                            const lvl = mapLangLabelToFilter(entry.name);
                            const isSelected = langFilter === lvl;
                            return (
                              <Cell
                                key={`cell-chi-${index}`}
                                fill="#F43F5E"
                                opacity={isSelected ? 1 : (langFilter === 'all' ? 0.85 : 0.45)}
                                stroke={isSelected ? '#1E1B4B' : 'transparent'}
                                strokeWidth={isSelected ? 2 : 0}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* 5. Top Positions Bar Chart */}
                <Card className="p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      5 ตำแหน่งงานยอดนิยม (Top Positions)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                      คลิกเพื่อกรอง
                    </span>
                  </div>
                  <div className="h-72">
                    {chartsData.position.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartsData.position} 
                          layout="vertical"
                          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            tickLine={false} 
                            axisLine={false}
                            width={110}
                            tick={{ fontSize: 9, fill: '#475569' }} 
                          />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar 
                            dataKey="count" 
                            name="จำนวนผู้สมัคร" 
                            radius={[0, 4, 4, 0]}
                            onClick={(entry) => {
                              const name = entry?.name || 'all';
                              setPositionFilter(prev => prev === name ? 'all' : name);
                            }}
                            className="cursor-pointer"
                          >
                            {chartsData.position.map((entry, index) => (
                              <Cell 
                                key={`cell-pos-${index}`} 
                                fill={COLORS[(index + 4) % COLORS.length]} 
                                opacity={positionFilter === entry.name ? 1 : (positionFilter === 'all' ? 0.85 : 0.45)}
                                stroke={positionFilter === entry.name ? '#1E1B4B' : 'transparent'}
                                strokeWidth={positionFilter === entry.name ? 2 : 0}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        ไม่มีข้อมูลตำแหน่งงาน
                      </div>
                    )}
                  </div>
                </Card>

                {/* 6. BU Distribution Pie Chart */}
                <Card className="p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-violet-500" />
                      สัดส่วนตามหน่วยธุรกิจ (BU Distribution)
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded border">
                      คลิกเพื่อกรอง
                    </span>
                  </div>
                  <div className="h-72">
                    {chartsData.bu.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, bottom: 10 }}>
                          <Pie
                            data={chartsData.bu}
                            cx="50%"
                            cy="45%"
                            outerRadius={75}
                            innerRadius={35}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            onClick={(entry) => {
                              const name = entry?.name || 'all';
                              setBuFilter(prev => prev === name ? 'all' : name);
                            }}
                            className="cursor-pointer"
                          >
                            {chartsData.bu.map((entry, index) => (
                              <Cell 
                                key={`cell-bu-${index}`} 
                                fill={getBuColor(entry.name, index)}
                                stroke={buFilter === entry.name ? '#1E1B4B' : '#fff'}
                                strokeWidth={buFilter === entry.name ? 2.5 : 1}
                              />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        ไม่มีข้อมูลหน่วยธุรกิจ
                      </div>
                    )}
                  </div>
                </Card>

              </div>

              {/* CANDIDATE DRILL-DOWN TABLE */}
              <Card className="p-6 border border-slate-100">
                {/* Header Filter Controls */}
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        ทำเนียบข้อมูลผู้สมัครเชิงวิเคราะห์ (Talent Pool Directory)
                      </h3>
                      <p className="text-slate-500 text-sm mt-0.5">
                        แสดงข้อมูลและสถานะผู้สมัครอย่างละเอียด สามารถเจาะลึก (Drill-down) จากกราฟหรือใช้ฟิลเตอร์ด้านล่างได้
                      </p>
                    </div>
                    {/* Filter Status Reset */}
                    {(searchQuery || eduFilter !== 'all' || instituteFilter !== 'all' || gpaFilter !== 'all' || langFilter !== 'all' || claimFilter !== 'all' || availabilityFilter !== 'all' || buFilter !== 'all' || deptFilter !== 'all' || positionFilter !== 'all') && (
                      <Button
                        variant="secondary"
                        onClick={clearAllFilters}
                        className="flex items-center gap-1.5 text-xs text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 self-start lg:self-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        ล้างตัวกรองทั้งหมด
                      </Button>
                    )}
                  </div>

                  {/* Active Filters Badges */}
                  {(searchQuery || eduFilter !== 'all' || instituteFilter !== 'all' || gpaFilter !== 'all' || langFilter !== 'all' || claimFilter !== 'all' || availabilityFilter !== 'all' || buFilter !== 'all' || deptFilter !== 'all' || positionFilter !== 'all') && (
                    <div className="flex flex-wrap gap-2 items-center bg-indigo-50/20 p-2 rounded-xl border border-indigo-50/50">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-indigo-500" />
                        ตัวกรองที่เลือก:
                      </span>
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          ค้นหา: "{searchQuery}"
                          <button onClick={() => setSearchQuery('')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {buFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          หน่วยธุรกิจ: {buFilter}
                          <button onClick={() => setBuFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {deptFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          แผนก: {deptFilter}
                          <button onClick={() => setDeptFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {positionFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          ตำแหน่ง: {positionFilter}
                          <button onClick={() => setPositionFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {eduFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          การศึกษา: {getEduLabel(eduFilter)}
                          <button onClick={() => setEduFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {instituteFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          สถาบัน: {instituteFilter}
                          <button onClick={() => setInstituteFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {gpaFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          เกรด: {gpaFilter}
                          <button onClick={() => setGpaFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {langFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          ภาษา: {translateLangSkill(langFilter)}
                          <button onClick={() => setLangFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {availabilityFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          การเริ่มงาน: {availabilityFilter === 'immediate' ? 'เริ่มงานได้ทันที' : 'มีระยะเวลาแจ้งล่วงหน้า'}
                          <button onClick={() => setAvailabilityFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                      {claimFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                          สถานะเคส: {claimFilter === 'claimed' ? 'มีผู้ดูแลแล้ว' : 'ยังไม่มีผู้ดูแล'}
                          <button onClick={() => setClaimFilter('all')} className="hover:bg-indigo-200 rounded p-0.5 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Filter Dropdowns Grid (5 Columns Layout) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {/* Row 1: Text, BU, Dept (Searchable), Position (Searchable), Searchable Institute */}
                    {/* Search */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อ, รหัส..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      />
                    </div>

                    {/* BU Filter */}
                    <select
                      value={buFilter}
                      onChange={(e) => setBuFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                    >
                      <option value="all">หน่วยธุรกิจ (ทั้งหมด)</option>
                      {uniqueBUs.map((bu, idx) => (
                        <option key={idx} value={bu}>{bu}</option>
                      ))}
                    </select>

                    {/* Department Filter (Searchable Combobox) */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ค้นหาแผนก..."
                        value={deptSearchText}
                        onFocus={() => setIsDeptDropdownOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsDeptDropdownOpen(false), 200);
                        }}
                        onChange={(e) => {
                          setDeptSearchText(e.target.value);
                          setIsDeptDropdownOpen(true);
                          if (e.target.value === '') {
                            setDeptFilter('all');
                          }
                        }}
                        className="block w-full py-2 pl-3 pr-8 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                      />
                      {deptFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeptFilter('all');
                            setDeptSearchText('');
                          }}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      
                      {isDeptDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                          <div 
                            className="px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 font-semibold cursor-pointer border-b border-slate-100"
                            onMouseDown={() => {
                              setDeptFilter('all');
                              setDeptSearchText('');
                              setIsDeptDropdownOpen(false);
                            }}
                          >
                            -- แสดงทั้งหมด (All Departments) --
                          </div>
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map((dept, idx) => (
                              <div
                                key={idx}
                                className={`px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer ${
                                  deptFilter === dept ? 'bg-indigo-50/50 font-bold text-indigo-700' : 'text-slate-700'
                                }`}
                                onMouseDown={() => {
                                  setDeptFilter(dept);
                                  setDeptSearchText(dept);
                                  setIsDeptDropdownOpen(false);
                                }}
                              >
                                {dept}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                              ไม่พบชื่อแผนก
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Position Filter (Searchable Combobox) */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ค้นหาตำแหน่ง..."
                        value={posSearchText}
                        onFocus={() => setIsPosDropdownOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsPosDropdownOpen(false), 200);
                        }}
                        onChange={(e) => {
                          setPosSearchText(e.target.value);
                          setIsPosDropdownOpen(true);
                          if (e.target.value === '') {
                            setPositionFilter('all');
                          }
                        }}
                        className="block w-full py-2 pl-3 pr-8 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                      />
                      {positionFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setPositionFilter('all');
                            setPosSearchText('');
                          }}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      
                      {isPosDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                          <div 
                            className="px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 font-semibold cursor-pointer border-b border-slate-100"
                            onMouseDown={() => {
                              setPositionFilter('all');
                              setPosSearchText('');
                              setIsPosDropdownOpen(false);
                            }}
                          >
                            -- แสดงทั้งหมด (All Positions) --
                          </div>
                          {filteredPositions.length > 0 ? (
                            filteredPositions.map((pos, idx) => (
                              <div
                                key={idx}
                                className={`px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer ${
                                  positionFilter === pos ? 'bg-indigo-50/50 font-bold text-indigo-700' : 'text-slate-700'
                                }`}
                                onMouseDown={() => {
                                  setPositionFilter(pos);
                                  setPosSearchText(pos);
                                  setIsPosDropdownOpen(false);
                                }}
                              >
                                {pos}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                              ไม่พบชื่อตำแหน่ง
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Searchable Institute Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อสถานศึกษา..."
                        value={instSearchText}
                        onFocus={() => setIsInstDropdownOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsInstDropdownOpen(false), 200);
                        }}
                        onChange={(e) => {
                          setInstSearchText(e.target.value);
                          setIsInstDropdownOpen(true);
                          if (e.target.value === '') {
                            setInstituteFilter('all');
                          }
                        }}
                        className="block w-full py-2 pl-3 pr-8 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                      />
                      {instituteFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setInstituteFilter('all');
                            setInstSearchText('');
                          }}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      
                      {/* Search Options Dropdown */}
                      {isInstDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                          <div 
                            className="px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 font-semibold cursor-pointer border-b border-slate-100"
                            onMouseDown={() => {
                              setInstituteFilter('all');
                              setInstSearchText('');
                              setIsInstDropdownOpen(false);
                            }}
                          >
                            -- แสดงทั้งหมด (All Institutes) --
                          </div>
                          {filteredInstitutes.length > 0 ? (
                            filteredInstitutes.map((inst, idx) => (
                              <div
                                key={idx}
                                className={`px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer ${
                                  instituteFilter === inst ? 'bg-indigo-50/50 font-bold text-indigo-700' : 'text-slate-700'
                                }`}
                                onMouseDown={() => {
                                  setInstituteFilter(inst);
                                  setInstSearchText(inst);
                                  setIsInstDropdownOpen(false);
                                }}
                              >
                                {inst}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                              ไม่พบชื่อสถาบัน
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Row 2: Edu Level, GPA Groups, Languages, Availability, Claim Status */}
                    {/* Edu level */}
                    <select
                      value={eduFilter}
                      onChange={(e) => setEduFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                    >
                      <option value="all">ระดับการศึกษา (ทั้งหมด)</option>
                      <option value="doctor">ปริญญาเอก</option>
                      <option value="master">ปริญญาโท</option>
                      <option value="bachelor">ปริญญาตรี</option>
                      <option value="diploma">ปวส./ปวช./อนุปริญญา</option>
                      <option value="highschool">มัธยมศึกษาตอนปลาย</option>
                    </select>

                    {/* GPA Filter dropdown */}
                    <select
                      value={gpaFilter}
                      onChange={(e) => setGpaFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                    >
                      <option value="all">เกรดเฉลี่ย (ทั้งหมด)</option>
                      <option value="ดีเลิศ (3.50+)">ดีเลิศ (3.50+)</option>
                      <option value="ดี (3.00 - 3.49)">ดี (3.00-3.49)</option>
                      <option value="ปานกลาง (2.50 - 2.99)">ปานกลาง (2.50-2.99)</option>
                      <option value="ทั่วไป (< 2.50)">{"ทั่วไป (< 2.50)"}</option>
                      <option value="ไม่ระบุ">ไม่ระบุเกรด</option>
                    </select>

                    {/* Language skills */}
                    <select
                      value={langFilter}
                      onChange={(e) => setLangFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                    >
                      <option value="all">ทักษะภาษาอังกฤษ/จีน (ทั้งหมด)</option>
                      <option value="advanced">ระดับดีมาก (Advanced)</option>
                      <option value="good">ระดับดี (Good)</option>
                      <option value="fair">ระดับพอใช้ (Fair)</option>
                    </select>

                    {/* Availability */}
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                    >
                      <option value="all">ความพร้อมเริ่มงาน (ทั้งหมด)</option>
                      <option value="immediate">เริ่มงานได้ทันที (ว่างงาน)</option>
                      <option value="notice">มีระยะเวลาบอกกล่าวล่วงหน้า</option>
                    </select>

                    {/* Claim status */}
                    <select
                      value={claimFilter}
                      onChange={(e) => setClaimFilter(e.target.value)}
                      className="block w-full py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-xs"
                    >
                      <option value="all">สถานะการดูแล (ทั้งหมด)</option>
                      <option value="claimed">มีผู้รับผิดชอบดูแลแล้ว</option>
                      <option value="unassigned">เคสว่าง (ยังไม่มีผู้ดูแล)</option>
                    </select>
                  </div>
                </div>

                {/* ===== DESKTOP view: Table ===== */}
                <div className="hidden lg:block overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">ผู้สมัคร (Candidate)</th>
                        <th className="py-3.5 px-4 font-semibold">ตำแหน่ง & BU (Applied Position)</th>
                        <th className="py-3.5 px-4 font-semibold">การศึกษาล่าสุด (Education)</th>
                        <th className="py-3.5 px-4 font-semibold text-center">ภาษา (EN / CN)</th>
                        <th className="py-3.5 px-4 font-semibold text-center">พร้อมเริ่มงาน (Availability)</th>
                        <th className="py-3.5 px-4 font-semibold text-center">ผู้รับเคส (Claim Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {paginatedCandidates.length > 0 ? (
                        paginatedCandidates.map((app) => {
                          const fd = app.form_data || {};
                          const highestEdu = getHighestEdu(fd.education);
                          const availability = getAvailabilityStatus(app);
                          const isImmediate = availability === 'เริ่มงานได้ทันที';

                          return (
                            <tr 
                              key={app.id} 
                              onClick={() => setViewingApp(app)}
                              className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                            >
                              {/* Name & Photo */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 flex-shrink-0">
                                    {fd.photoUrl ? (
                                      <img 
                                        src={fd.photoUrl} 
                                        alt={app.full_name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800">{app.full_name}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{fd.nickname ? `(${fd.nickname})` : ''} • {app.phone}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Position & BU */}
                              <td className="py-3 px-4">
                                <div>
                                  <div className="font-semibold text-slate-800">{app.position}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{app.department}</div>
                                </div>
                                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-md font-bold mt-1.5 ${
                                  app.business_unit === 'NPS' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                  app.business_unit === 'ดั๊บเบิ้ล เอ' || app.business_unit === 'Double A' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}>
                                  {app.business_unit}
                                </span>
                              </td>

                              {/* Education */}
                              <td className="py-3 px-4">
                                {highestEdu ? (
                                  <div>
                                    <div className="font-medium text-slate-800">
                                      {getEduLabel(highestEdu.stdLevel)} • <span className="text-slate-500">{highestEdu.major || 'ไม่ระบุสาขา'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      {highestEdu.institute || 'สถาบันไม่ระบุ'} ({highestEdu.gpa ? `GPA: ${highestEdu.gpa}` : 'ไม่มี GPA'})
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">ไม่มีข้อมูลการศึกษา</span>
                                )}
                              </td>

                              {/* Languages (Horizontal Layout) */}
                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 ${getLangBadgeClass(fd.englishSkill)}`}>
                                    <span className="opacity-60 text-[9px]">EN:</span> {translateLangSkill(fd.englishSkill)}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 ${getLangBadgeClass(fd.chineseSkill)}`}>
                                    <span className="opacity-60 text-[9px]">CN:</span> {translateLangSkill(fd.chineseSkill)}
                                  </span>
                                </div>
                              </td>

                              {/* Availability */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${
                                  isImmediate 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {availability}
                                </span>
                              </td>

                              {/* Claim status / Recruiter with Avatar */}
                              <td className="py-3 px-4 text-center">
                                {app.assigned_to ? (
                                  <div className="flex items-center gap-1.5 bg-indigo-50/70 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100/80 w-fit mx-auto">
                                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                                      {app.assigned_user?.emp_id ? (
                                        <img
                                          src={`https://wms.advanceagro.net/WSVIS/api/Face/GetImage?CardID=${app.assigned_user.emp_id}`}
                                          alt=""
                                          className="w-full h-full object-cover"
                                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="flex items-center justify-center w-full h-full text-[9px] font-bold text-indigo-600">${(app.assigned_user?.full_name || '?').charAt(0)}</span>`); }}
                                        />
                                      ) : (
                                        <span className="flex items-center justify-center w-full h-full text-[9px] font-bold text-indigo-600">
                                          {(app.assigned_user?.full_name || '?').charAt(0)}
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-bold text-[10px] truncate max-w-[80px]">
                                      {app.assigned_user?.full_name || 'มีผู้ดูแล'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg border border-rose-100 w-fit mx-auto animate-pulse">
                                    <UserX className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="font-bold text-[10px]">ว่าง (ไม่มีผู้ดูแล)</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <AlertCircle className="w-6 h-6 text-slate-300" />
                              <span className="font-semibold text-slate-500">ไม่พบผู้สมัครที่ตรงกับเงื่อนไขในขณะนี้</span>
                              <span className="text-[10px]">ลองล้างตัวกรองหรือเปลี่ยนคำค้นหา</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ===== MOBILE view: Card List ===== */}
                <div className="lg:hidden border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
                  {paginatedCandidates.length > 0 ? (
                    paginatedCandidates.map((app) => {
                      const fd = app.form_data || {};
                      const highestEdu = getHighestEdu(fd.education);
                      const availability = getAvailabilityStatus(app);
                      const isImmediate = availability === 'เริ่มงานได้ทันที';

                      return (
                        <div 
                          key={app.id} 
                          onClick={() => setViewingApp(app)}
                          className="p-4 bg-white hover:bg-indigo-50/30 transition-colors flex flex-col gap-3 cursor-pointer"
                        >
                          {/* Top Row: Photo & Name & Claim status */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 flex-shrink-0">
                                {fd.photoUrl ? (
                                  <img 
                                    src={fd.photoUrl} 
                                    alt={app.full_name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{app.full_name}</div>
                                <div className="text-[10px] text-slate-400">{fd.nickname ? `(${fd.nickname})` : ''} • {app.phone}</div>
                              </div>
                            </div>
                            
                            {/* Claim Status Badge with Recruiter Avatar */}
                            {app.assigned_to ? (
                              <div className="flex items-center gap-1.5 bg-indigo-50/70 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100 flex-shrink-0 text-[9px] font-semibold">
                                <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                                  {app.assigned_user?.emp_id ? (
                                    <img
                                      src={`https://wms.advanceagro.net/WSVIS/api/Face/GetImage?CardID=${app.assigned_user.emp_id}`}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="flex items-center justify-center w-full h-full text-[8px] font-bold text-indigo-600">${(app.assigned_user?.full_name || '?').charAt(0)}</span>`); }}
                                    />
                                  ) : (
                                    <span className="flex items-center justify-center w-full h-full text-[8px] font-bold text-indigo-600">
                                      {(app.assigned_user?.full_name || '?').charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <span className="truncate max-w-[70px] font-bold">{app.assigned_user?.full_name || 'มีผู้ดูแล'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md border border-rose-100 flex-shrink-0 text-[9px] font-bold animate-pulse">
                                <UserX className="w-3 h-3" />
                                <span>ว่าง (ไม่มีผู้ดูแล)</span>
                              </div>
                            )}
                          </div>

                          {/* Applied Position */}
                          <div className="border-t border-slate-50 pt-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xs font-semibold text-slate-800">{app.position}</div>
                                <div className="text-[10px] text-slate-500">{app.department}</div>
                              </div>
                              <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                app.business_unit === 'NPS' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                app.business_unit === 'ดั๊บเบิ้ล เอ' || app.business_unit === 'Double A' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {app.business_unit}
                              </span>
                            </div>
                          </div>

                          {/* Education */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                            <div className="text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">การศึกษาล่าสุด:</div>
                            {highestEdu ? (
                              <div>
                                <div className="font-semibold text-slate-700">
                                  {getEduLabel(highestEdu.stdLevel)} ({highestEdu.gpa ? `GPA: ${highestEdu.gpa}` : 'ไม่มี GPA'})
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {highestEdu.institute || 'ไม่ระบุสถาบัน'} • {highestEdu.major || 'ไม่ระบุสาขา'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">ไม่มีข้อมูลการศึกษา</span>
                            )}
                          </div>

                          {/* Skills & Availability Row */}
                          <div className="flex items-center justify-between gap-3 text-xs border-t border-slate-50 pt-2">
                            {/* Languages (Horizontal Inline layout) */}
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 ${getLangBadgeClass(fd.englishSkill)}`}>
                                <span className="opacity-60 text-[9px]">EN:</span> {translateLangSkill(fd.englishSkill)}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 ${getLangBadgeClass(fd.chineseSkill)}`}>
                                <span className="opacity-60 text-[9px]">CN:</span> {translateLangSkill(fd.chineseSkill)}
                              </span>
                            </div>

                            {/* Availability */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isImmediate 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {availability}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 bg-white text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                      <span className="font-semibold text-slate-500">ไม่พบผู้สมัครที่ตรงกับเงื่อนไขในขณะนี้</span>
                      <span className="text-[10px]">ลองล้างตัวกรองหรือเปลี่ยนคำค้นหา</span>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>แสดง</span>
                    <select
                      className="border rounded px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>รายการ | แสดง {filteredCandidates.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} จาก {filteredCandidates.length} คน (ทั้งหมด {allApps.length} คน)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(searchQuery || eduFilter !== 'all' || instituteFilter !== 'all' || gpaFilter !== 'all' || langFilter !== 'all' || claimFilter !== 'all' || availabilityFilter !== 'all' || buFilter !== 'all' || deptFilter !== 'all' || positionFilter !== 'all') && (
                      <button 
                        onClick={clearAllFilters}
                        className="text-rose-600 hover:text-rose-800 font-semibold mr-4 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        ล้างตัวกรองทั้งหมด
                      </button>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none text-xs transition-colors cursor-pointer"
                      >
                        «
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none text-xs transition-colors cursor-pointer"
                      >
                        ‹
                      </button>
                      <span className="px-3 py-1 font-medium select-none">หน้า {currentPage} / {totalPages || 1}</span>
                      <button
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none text-xs transition-colors cursor-pointer"
                      >
                        ›
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none text-xs transition-colors cursor-pointer"
                      >
                        »
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};
