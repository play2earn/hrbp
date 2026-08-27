import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Flame,
  X,
  CheckCircle2,
  Building2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Users,
  Check,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../../services/api';
import { MasterPosition, WorkLocation, Language } from '../../types';
import { Button } from '../UIComponents';

interface JobExplorerSectionProps {
  lang: Language;
  onApplyPosition: (position: MasterPosition) => void;
  selectedLocationFilter?: number | string | null;
  onSelectLocationFilter?: (locId: number | string | null) => void;
}

const PAGE_SIZE = 9;

export const JobExplorerSection: React.FC<JobExplorerSectionProps> = ({
  lang,
  onApplyPosition,
  selectedLocationFilter = 'all',
  onSelectLocationFilter
}) => {
  const [positions, setPositions] = useState<MasterPosition[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string | number>('all');
  const [selectedLocId, setSelectedLocId] = useState<string | number>(selectedLocationFilter || 'all');
  const [isUrgentOnly, setIsUrgentOnly] = useState(false);
  const [selectedCategoryCluster, setSelectedCategoryCluster] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Searchable Department Dropdown state
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearchText, setDeptSearchText] = useState('');
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // Searchable Location Dropdown state
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [locSearchText, setLocSearchText] = useState('');
  const locDropdownRef = useRef<HTMLDivElement>(null);

  // Quick View Drawer State
  const [activeJobDetail, setActiveJobDetail] = useState<MasterPosition | null>(null);

  // Click Outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
      if (locDropdownRef.current && !locDropdownRef.current.contains(event.target as Node)) {
        setIsLocDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync external location filter prop
  useEffect(() => {
    if (selectedLocationFilter !== undefined && selectedLocationFilter !== null) {
      setSelectedLocId(selectedLocationFilter);
      setCurrentPage(1);
    }
  }, [selectedLocationFilter]);

  // Load Positions and Lookups
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [posData, deptData, locData] = await Promise.all([
          api.master.getAllPositions(true),
          api.master.getDepartments(),
          api.master.getWorkLocations(true)
        ]);
        setPositions(posData || []);
        setDepartments(deptData || []);
        setLocations(locData || []);
      } catch (err) {
        console.error('Failed to load jobs for explorer', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDeptId, selectedLocId, isUrgentOnly, selectedCategoryCluster]);

  // Curated Career Clusters Definition (High level groups that wrap nicely)
  const careerClusters = useMemo(() => [
    { id: 'all', labelTh: 'ทั้งหมด', labelEn: 'All Positions', icon: '✨', keywords: [] },
    { id: 'tech', labelTh: '💻 ไอที & ดิจิทัล', labelEn: 'IT & Digital', icon: '💻', keywords: ['it', 'digital', 'tech', 'software', 'developer', 'programmer', 'data', 'system', 'network', 'ai'] },
    { id: 'eng', labelTh: '🏭 วิศวกรรม & โรงงาน', labelEn: 'Engineering & Plant', icon: '🏭', keywords: ['engineer', 'maintenance', 'production', 'technician', 'quality', 'factory', 'plant', 'วิศวกร', 'ช่าง', 'ผลิต'] },
    { id: 'fin', labelTh: '📊 บัญชี & การเงิน', labelEn: 'Finance & Accounting', icon: '📊', keywords: ['account', 'finance', 'audit', 'tax', 'cost', 'การเงิน', 'บัญชี', 'ตรวจสอบ'] },
    { id: 'supply', labelTh: '📦 ซัพพลายเชน & ขนส่ง', labelEn: 'Supply Chain & Logistics', icon: '📦', keywords: ['logistics', 'warehouse', 'supply', 'procurement', 'shipping', 'ขนส่ง', 'คลัง', 'จัดซื้อ'] },
    { id: 'sales', labelTh: '📈 ขาย & การตลาด', labelEn: 'Sales & Marketing', icon: '📈', keywords: ['sales', 'marketing', 'business', 'commercial', 'brand', 'ขาย', 'การตลาด'] },
    { id: 'hr', labelTh: '🤝 บุคคล & บริหาร', labelEn: 'HR & Administration', icon: '🤝', keywords: ['hr', 'human', 'admin', 'training', 'legal', 'บุคคล', 'ธุรการ', 'ฝึกอบรม'] },
  ], []);

  // Filtered Department List for Searchable DDL
  const filteredDepartments = useMemo(() => {
    if (!deptSearchText.trim()) return departments;
    const q = deptSearchText.toLowerCase();
    return departments.filter(d => 
      (d.name_th && d.name_th.toLowerCase().includes(q)) ||
      (d.name_en && d.name_en.toLowerCase().includes(q))
    );
  }, [departments, deptSearchText]);

  // Filtered Location List for Searchable DDL
  const filteredLocations = useMemo(() => {
    if (!locSearchText.trim()) return locations;
    const q = locSearchText.toLowerCase();
    return locations.filter(l => 
      (l.name_th && l.name_th.toLowerCase().includes(q)) ||
      (l.name_en && l.name_en.toLowerCase().includes(q)) ||
      (l.code && l.code.toLowerCase().includes(q)) ||
      (l.province && l.province.toLowerCase().includes(q))
    );
  }, [locations, locSearchText]);

  // Selected Department Label
  const selectedDeptObj = useMemo(() => {
    if (selectedDeptId === 'all') return null;
    return departments.find(d => Number(d.id) === Number(selectedDeptId));
  }, [departments, selectedDeptId]);

  // Selected Location Label
  const selectedLocObj = useMemo(() => {
    if (selectedLocId === 'all') return null;
    return locations.find(l => Number(l.id) === Number(selectedLocId));
  }, [locations, selectedLocId]);

  // Filtered positions list
  const filteredPositions = useMemo(() => {
    return positions.filter(pos => {
      // Keyword match (name_th, name_en, department, skills)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const th = (pos.name_th || '').toLowerCase();
        const en = (pos.name_en || '').toLowerCase();
        const deptTh = (pos.departments?.name_th || '').toLowerCase();
        const deptEn = (pos.departments?.name_en || '').toLowerCase();
        const skills = Array.isArray(pos.skills) ? pos.skills.join(' ').toLowerCase() : '';
        const matchKeyword = th.includes(q) || en.includes(q) || deptTh.includes(q) || deptEn.includes(q) || skills.includes(q);
        if (!matchKeyword) return false;
      }

      // Department filter
      if (selectedDeptId !== 'all' && Number(pos.department_id) !== Number(selectedDeptId)) {
        return false;
      }

      // Location filter (Supports multiple locations per job)
      if (selectedLocId !== 'all') {
        const targetLocId = Number(selectedLocId);
        const posLocIds: number[] = Array.isArray(pos.location_ids) && pos.location_ids.length > 0
          ? pos.location_ids.map(Number)
          : (pos.location_id ? [Number(pos.location_id)] : []);

        if (!posLocIds.includes(targetLocId)) {
          return false;
        }
      }

      // Urgent filter
      if (isUrgentOnly && !pos.is_urgent) {
        return false;
      }

      // Career Cluster Filter
      if (selectedCategoryCluster !== 'all') {
        const cluster = careerClusters.find(c => c.id === selectedCategoryCluster);
        if (cluster && cluster.keywords.length > 0) {
          const titleTh = (pos.name_th || '').toLowerCase();
          const titleEn = (pos.name_en || '').toLowerCase();
          const deptTh = (pos.departments?.name_th || '').toLowerCase();
          const deptEn = (pos.departments?.name_en || '').toLowerCase();
          const combined = `${titleTh} ${titleEn} ${deptTh} ${deptEn}`;
          const matchesCluster = cluster.keywords.some(kw => combined.includes(kw));
          if (!matchesCluster) return false;
        }
      }

      return true;
    });
  }, [positions, searchQuery, selectedDeptId, selectedLocId, isUrgentOnly, selectedCategoryCluster, careerClusters]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredPositions.length / PAGE_SIZE));
  const paginatedPositions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPositions.slice(start, start + PAGE_SIZE);
  }, [filteredPositions, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Smooth scroll to top of job board
    const el = document.getElementById('job-explorer-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDeptId('all');
    setSelectedLocId('all');
    if (onSelectLocationFilter) onSelectLocationFilter('all');
    setIsUrgentOnly(false);
    setSelectedCategoryCluster('all');
    setCurrentPage(1);
  };

  return (
    <section id="job-explorer" className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/30 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with 3D Image Banner */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-200/60 text-indigo-700 text-xs sm:text-sm font-bold mb-4 shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              {lang === 'th' ? 'ร่วมเป็นส่วนหนึ่งของครอบครัวเรา' : 'Join Our Transformative Team'}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {lang === 'th' ? 'สำรวจตำแหน่งงานที่เปิดรับ' : 'Explore Open Opportunities'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
              {lang === 'th'
                ? 'ค้นหาตำแหน่งงานที่ตรงกับความฝันและศักยภาพของคุณ พร้อมร่วมสร้างอนาคตที่ยั่งยืนไปด้วยกัน'
                : 'Discover roles that match your ambition and skills to build a brighter, sustainable future together.'}
            </p>
          </div>

          <div className="w-full sm:w-80 lg:w-96 flex-shrink-0">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-700"></div>
              <img
                src="/job_hub_isometric.png"
                alt="Double A Career Hub 3D"
                className="relative w-full h-auto rounded-3xl shadow-xl border border-white/60 object-contain transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar Box */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-5 sm:p-7 mb-8 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            
            {/* 1. Keyword Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'th' ? 'พิมพ์ค้นหาชื่อตำแหน่ง หรือทักษะ...' : 'Search by job title or skills...'}
                className="w-full pl-11 pr-10 py-3 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 2. Searchable Department Dropdown (Combobox) */}
            <div className="md:col-span-3 relative" ref={deptDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsDeptDropdownOpen(!isDeptDropdownOpen);
                  setIsLocDropdownOpen(false);
                }}
                className={`w-full py-3 px-3.5 text-left text-sm bg-slate-50 hover:bg-slate-100/80 border rounded-2xl flex items-center justify-between transition font-medium ${
                  selectedDeptId !== 'all'
                    ? 'border-indigo-400 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-100'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Building2 className={`w-4 h-4 shrink-0 ${selectedDeptId !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">
                    {selectedDeptObj
                      ? (lang === 'th' ? (selectedDeptObj.name_th || selectedDeptObj.name_en) : (selectedDeptObj.name_en || selectedDeptObj.name_th))
                      : (lang === 'th' ? 'ทุกแผนก / ฝ่าย' : 'All Departments')}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedDeptId !== 'all' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeptId('all');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </div>
              </button>

              {/* Department Popover Menu */}
              {isDeptDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2.5 z-50 animate-fade-in max-h-80 flex flex-col">
                  {/* Inside Search Box */}
                  <div className="relative mb-2 shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      value={deptSearchText}
                      onChange={e => setDeptSearchText(e.target.value)}
                      placeholder={lang === 'th' ? 'ค้นหาชื่อแผนก...' : 'Search department...'}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Departments List */}
                  <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDeptId('all');
                        setIsDeptDropdownOpen(false);
                        setDeptSearchText('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        selectedDeptId === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>📂 {lang === 'th' ? 'ทุกแผนก (ทั้งหมด)' : 'All Departments'}</span>
                      <span className="text-[10px] opacity-70">({positions.length})</span>
                    </button>

                    {filteredDepartments.map(dept => {
                      const count = positions.filter(p => p.department_id === dept.id).length;
                      const isSelected = Number(selectedDeptId) === Number(dept.id);
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => {
                            setSelectedDeptId(dept.id);
                            setIsDeptDropdownOpen(false);
                            setDeptSearchText('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate pr-2">
                            {lang === 'th' ? (dept.name_th || dept.name_en) : (dept.name_en || dept.name_th)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Searchable Work Location Dropdown (Combobox) */}
            <div className="md:col-span-3 relative" ref={locDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsLocDropdownOpen(!isLocDropdownOpen);
                  setIsDeptDropdownOpen(false);
                }}
                className={`w-full py-3 px-3.5 text-left text-sm bg-slate-50 hover:bg-slate-100/80 border rounded-2xl flex items-center justify-between transition font-medium ${
                  selectedLocId !== 'all'
                    ? 'border-indigo-400 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-100'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MapPin className={`w-4 h-4 shrink-0 ${selectedLocId !== 'all' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">
                    {selectedLocObj
                      ? `${selectedLocObj.code.toUpperCase()} - ${lang === 'th' ? selectedLocObj.name_th.split(':')[0] : selectedLocObj.name_en.split(':')[0]}`
                      : (lang === 'th' ? 'ทุกสถานที่ / ไซต์งาน' : 'All Locations')}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedLocId !== 'all' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocId('all');
                        if (onSelectLocationFilter) onSelectLocationFilter('all');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLocDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </div>
              </button>

              {/* Location Popover Menu */}
              {isLocDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2.5 z-50 animate-fade-in max-h-80 flex flex-col">
                  {/* Inside Search Box */}
                  <div className="relative mb-2 shrink-0">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      value={locSearchText}
                      onChange={e => setLocSearchText(e.target.value)}
                      placeholder={lang === 'th' ? 'ค้นหาสถานที่หรือจังหวัด...' : 'Search location or province...'}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="overflow-y-auto space-y-1 flex-1 pr-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocId('all');
                        if (onSelectLocationFilter) onSelectLocationFilter('all');
                        setIsLocDropdownOpen(false);
                        setLocSearchText('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        selectedLocId === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>📍 {lang === 'th' ? 'ทุกสถานที่ปฏิบัติงาน' : 'All Work Locations'}</span>
                      <span className="text-[10px] opacity-70">({positions.length})</span>
                    </button>

                    {filteredLocations.map(loc => {
                      const count = positions.filter(p => Number(p.location_id) === Number(loc.id)).length;
                      const isSelected = Number(selectedLocId) === Number(loc.id);
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocId(loc.id);
                            if (onSelectLocationFilter) onSelectLocationFilter(loc.id);
                            setIsLocDropdownOpen(false);
                            setLocSearchText('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold mr-1.5 text-indigo-600">[{loc.code.toUpperCase()}]</span>
                            <span>{lang === 'th' ? loc.name_th : loc.name_en}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Urgent Toggle Button */}
            <div className="md:col-span-2 flex items-center">
              <button
                type="button"
                onClick={() => setIsUrgentOnly(!isUrgentOnly)}
                className={`w-full py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all duration-200 shadow-xs ${
                  isUrgentOnly
                    ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white border-transparent shadow-rose-200 shadow-md transform scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Flame className={`w-4 h-4 ${isUrgentOnly ? 'text-yellow-200 fill-yellow-200 animate-bounce' : 'text-slate-400'}`} />
                <span>{lang === 'th' ? 'รับด่วน' : 'Urgent Only'}</span>
              </button>
            </div>
          </div>

          {/* Clean Wrapping Career Clusters (No horizontal scrollbar!) */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                {lang === 'th' ? 'สายงานแนะนำ:' : 'Career Clusters:'}
              </span>
              {careerClusters.map(cluster => {
                const isSelected = selectedCategoryCluster === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    onClick={() => setSelectedCategoryCluster(cluster.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <span>{lang === 'th' ? cluster.labelTh : cluster.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count & Active Filter Indicator */}
        <div id="job-explorer-results" className="flex items-center justify-between mb-6 px-1">
          <div className="text-sm font-semibold text-slate-700">
            {lang === 'th' ? 'พบตำแหน่งที่เปิดรับ' : 'Showing'} <span className="text-indigo-600 font-bold">{filteredPositions.length}</span> {lang === 'th' ? 'ตำแหน่ง' : 'positions'}
            {filteredPositions.length > PAGE_SIZE && (
              <span className="text-xs text-slate-400 font-normal ml-2">
                (หน้า {currentPage} จาก {totalPages})
              </span>
            )}
          </div>
          {(searchQuery || selectedDeptId !== 'all' || selectedLocId !== 'all' || isUrgentOnly || selectedCategoryCluster !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1 rounded-full transition hover:bg-indigo-100"
            >
              <X className="w-3.5 h-3.5" /> {lang === 'th' ? 'ล้างตัวกรองทั้งหมด' : 'Reset Filters'}
            </button>
          )}
        </div>

        {/* Positions Cards Grid (Paginated 9 per page) */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredPositions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {lang === 'th' ? 'ไม่พบตำแหน่งงานที่ตรงกับเงื่อนไข' : 'No matching positions found'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {lang === 'th'
                ? 'ลองปรับเปลี่ยนคำค้นหา หรือเลือกดูทุกแผนก/ทุกสถานที่เพื่อดูตำแหน่งงานทั้งหมดที่กำลังเปิดรับ'
                : 'Try adjusting your search criteria or view all departments and locations to explore all available positions.'}
            </p>
            <Button onClick={clearFilters} variant="outline" size="sm">
              {lang === 'th' ? 'ดูตำแหน่งทั้งหมด' : 'View All Positions'}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPositions.map((job) => {
                const deptName = lang === 'th' 
                  ? (job.departments?.name_th || job.departments?.name_en || 'ไม่ระบุแผนก')
                  : (job.departments?.name_en || job.departments?.name_th || 'General');

                const locName = (() => {
                  const locIds: number[] = Array.isArray(job.location_ids) && job.location_ids.length > 0
                    ? job.location_ids.map(Number)
                    : (job.location_id ? [Number(job.location_id)] : []);

                  if (locIds.length > 0) {
                    const matched = locations.filter(l => locIds.includes(Number(l.id)));
                    if (matched.length > 0) {
                      return matched.map(l => l.code ? l.code.toUpperCase() : (lang === 'th' ? l.name_th.split(':')[0] : l.name_en.split(':')[0])).join(' • ');
                    }
                  }
                  if (job.work_locations) {
                    return lang === 'th' ? job.work_locations.name_th.split(':')[0] : job.work_locations.name_en.split(':')[0];
                  }
                  return lang === 'th' ? 'ทุกสาขา / ตามตกลง' : 'All Sites / Flexible';
                })();

                const hasSkills = Array.isArray(job.skills) && job.skills.length > 0;
                const displaySkills = hasSkills 
                  ? job.skills 
                  : [deptName.split(' ')[0]];

                return (
                  <div
                    key={job.id}
                    className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden transform hover:-translate-y-1"
                  >
                    {/* Top Badges */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                          <Building2 className="w-3 h-3" /> {deptName}
                        </span>

                        {job.is_urgent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs animate-pulse">
                            <Flame className="w-3 h-3" /> {lang === 'th' ? 'รับด่วน' : 'Urgent'}
                          </span>
                        )}
                      </div>

                      {/* Job Title */}
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1">
                        {lang === 'th' ? (job.name_th || job.name_en) : (job.name_en || job.name_th)}
                      </h3>
                      {job.name_en && job.name_th && (
                        <p className="text-xs text-slate-400 font-medium mb-4">
                          {lang === 'th' ? job.name_en : job.name_th}
                        </p>
                      )}

                      {/* Metadata Pill Row */}
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600 mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {locName}
                        </span>
                        {job.min_education && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {job.min_education}
                          </span>
                        )}
                        {job.job_level && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> {job.job_level.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      {/* Skill Tags Chips */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {displaySkills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveJobDetail(job)}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-slate-50"
                      >
                        {lang === 'th' ? 'ดูรายละเอียด' : 'Details'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onApplyPosition(job)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 group-hover:gap-2"
                      >
                        {lang === 'th' ? 'สมัครตำแหน่งนี้' : 'Apply Now'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm">
                <div className="text-xs sm:text-sm text-slate-500 font-medium">
                  {lang === 'th' ? 'แสดงรายการที่' : 'Showing'} <span className="font-bold text-slate-800">{(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredPositions.length)}</span> {lang === 'th' ? 'จาก' : 'of'} <span className="font-bold text-slate-800">{filteredPositions.length}</span> {lang === 'th' ? 'ตำแหน่ง' : 'positions'}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{lang === 'th' ? 'ก่อนหน้า' : 'Previous'}</span>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prevVal = arr[idx - 1];
                      const showEllipsis = prevVal && p - prevVal > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                          <button
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                              currentPage === p
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  {/* Next Button */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">{lang === 'th' ? 'ถัดไป' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER QUICK VIEW DRAWER                                              */}
      {/* ========================================================================= */}
      {activeJobDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setActiveJobDetail(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 relative bg-gradient-to-r from-indigo-50/50 to-white">
                <button
                  onClick={() => setActiveJobDetail(null)}
                  className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100/80 text-indigo-700">
                    {lang === 'th'
                      ? (activeJobDetail.departments?.name_th || activeJobDetail.departments?.name_en)
                      : (activeJobDetail.departments?.name_en || activeJobDetail.departments?.name_th)}
                  </span>
                  {activeJobDetail.is_urgent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                      🔥 {lang === 'th' ? 'รับด่วน' : 'Urgent'}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  {lang === 'th' ? (activeJobDetail.name_th || activeJobDetail.name_en) : (activeJobDetail.name_en || activeJobDetail.name_th)}
                </h3>
                {activeJobDetail.name_en && activeJobDetail.name_th && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {lang === 'th' ? activeJobDetail.name_en : activeJobDetail.name_th}
                  </p>
                )}
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">{lang === 'th' ? 'สถานที่ปฏิบัติงาน' : 'Location'}</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {(() => {
                        const locIds: number[] = Array.isArray(activeJobDetail.location_ids) && activeJobDetail.location_ids.length > 0
                          ? activeJobDetail.location_ids.map(Number)
                          : (activeJobDetail.location_id ? [Number(activeJobDetail.location_id)] : []);

                        if (locIds.length > 0) {
                          const matched = locations.filter(l => locIds.includes(Number(l.id)));
                          if (matched.length > 0) {
                            return matched.map(l => (lang === 'th' ? l.name_th : l.name_en)).join(', ');
                          }
                        }
                        return activeJobDetail.work_locations 
                          ? (lang === 'th' ? activeJobDetail.work_locations.name_th : activeJobDetail.work_locations.name_en)
                          : (lang === 'th' ? 'ทุกสาขา / ตามตกลง' : 'All Sites / Flexible');
                      })()}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block">{lang === 'th' ? 'วุฒิการศึกษาที่เปิดรับ' : 'Education Required'}</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 flex-wrap">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {activeJobDetail.min_education || (lang === 'th' ? 'ไม่จำกัดวุฒิ' : 'Any Degree')}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block">{lang === 'th' ? 'ระดับประสบการณ์' : 'Job Level'}</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {activeJobDetail.job_level || (lang === 'th' ? 'ทุกระดับประสบการณ์' : 'Open for All Levels')}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 font-medium block">{lang === 'th' ? 'ประเภทการจ้างงาน' : 'Employment Type'}</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      {lang === 'th' ? 'งานประจำ (Full-time)' : 'Full-time'}
                    </span>
                  </div>
                </div>

                {/* Job Overview */}
                <div>
                  <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    {lang === 'th' ? 'ภาพรวมหน้าที่และความรับผิดชอบ' : 'Job Overview'}
                  </h4>
                  <p className="text-slate-600 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
                    {activeJobDetail.job_overview || (lang === 'th'
                      ? `ร่วมเป็นส่วนหนึ่งในการขับเคลื่อนองค์กรกับฝ่าย ${activeJobDetail.departments?.name_th || ''} โดยพัฒนาและบริหารจัดการภารกิจสำคัญเพื่อเป้าหมายร่วมกัน`
                      : `Join the team in driving strategic initiatives within the ${activeJobDetail.departments?.name_en || 'department'} to achieve collective success.`)}
                  </p>
                </div>

                {/* Qualifications */}
                {activeJobDetail.qualifications && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      {lang === 'th' ? 'คุณสมบัติที่ต้องการ' : 'Qualifications'}
                    </h4>
                    <div className="text-slate-600 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs whitespace-pre-line">
                      {activeJobDetail.qualifications}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {Array.isArray(activeJobDetail.skills) && activeJobDetail.skills.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      {lang === 'th' ? 'ทักษะสำคัญ (Key Skills)' : 'Key Skills'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeJobDetail.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 font-medium text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits & Remuneration Policy */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/60 border border-indigo-100/70 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                      {lang === 'th' ? 'สวัสดิการและผลประโยชน์ตอบแทน' : 'Benefits & Remuneration'}
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                    <p>
                      {lang === 'th'
                        ? 'สวัสดิการและผลประโยชน์ตอบแทนเป็นไปตามโครงสร้างและนโยบายของแต่ละบริษัทในกลุ่มธุรกิจ (สอดคล้องตามสายงาน ระดับตำแหน่ง และสถานที่ปฏิบัติงาน)'
                        : 'Compensation, welfare, and benefits are aligned with the corporate structure and policies of each respective business unit (varying by role, level, and location).'}
                    </p>
                    <div className="flex items-start gap-2 pt-1 text-slate-500 border-t border-indigo-100/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                      <span>
                        {lang === 'th'
                          ? 'สำหรับรายละเอียดสิทธิประโยชน์และเงื่อนไขเพิ่มเติม เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล (HR) จะให้ข้อมูลและคำแนะนำอย่างครบถ้วนในขั้นตอนการสัมภาษณ์งาน'
                          : 'Additional details regarding benefits and conditions will be comprehensively provided and discussed by our HR team during the interview process.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer CTA */}
              <div className="p-5 border-t border-slate-100 bg-white flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveJobDetail(null)}
                  className="flex-1 rounded-2xl"
                >
                  {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
                </Button>
                <Button
                  onClick={() => {
                    const jobToApply = activeJobDetail;
                    setActiveJobDetail(null);
                    onApplyPosition(jobToApply);
                  }}
                  className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                >
                  {lang === 'th' ? 'สมัครตำแหน่งนี้เลย' : 'Apply for this Role'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
