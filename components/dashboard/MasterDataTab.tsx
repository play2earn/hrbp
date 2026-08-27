import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Edit,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  X,
  AlertCircle,
  Award,
  BookOpen,
  School,
  Navigation,
  Compass,
  Download
} from 'lucide-react';
import { Button, Card, Input, Modal, Select } from '../UIComponents';
import { api, EvaluationTemplate } from '../../services/api';
import { EvaluationTemplatesTab } from './EvaluationTemplatesTab';

interface MasterDataTabProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
  currentUser: any;
  initialTable?: string;
  initialViewMode?: 'hub' | 'table' | 'evaluations';
}

interface TableDef {
  id: string;
  label: string;
  labelTh: string;
  description: string;
  iconName: string;
  groupId: string;
}

interface GroupDef {
  id: string;
  label: string;
  labelTh: string;
  description: string;
  colorTheme: string;
  badgeBg: string;
  tables: TableDef[];
}

export const MasterDataTab: React.FC<MasterDataTabProps> = ({
  showToast,
  currentUser,
  initialTable = 'positions',
  initialViewMode = 'hub',
}) => {
  const [viewMode, setViewMode] = useState<'hub' | 'table' | 'evaluations'>(initialViewMode);
  const [activeTable, setActiveTable] = useState<string>(initialTable);
  const [hubSearch, setHubSearch] = useState('');

  // Table Data State
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Dependency lists for relational lookups
  const [deptList, setDeptList] = useState<any[]>([]);
  const [buList, setBuList] = useState<any[]>([]);
  const [provList, setProvList] = useState<any[]>([]);

  // Department Positions Preview Modal
  const [deptPositionsModal, setDeptPositionsModal] = useState<{ id: number; name: string } | null>(null);
  const [deptPositionsList, setDeptPositionsList] = useState<any[]>([]);
  const [isLoadingDeptPositions, setIsLoadingDeptPositions] = useState(false);

  // Duplicate Position Detection State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    found: boolean;
    item?: any;
    isArchived?: boolean;
  } | null>(null);

  // Master Data Group Configurations
  const TABLE_GROUPS: GroupDef[] = useMemo(() => [
    {
      id: 'recruitment',
      label: 'Recruitment & Positions',
      labelTh: 'ตำแหน่งและโครงสร้างรับสมัคร',
      description: 'จัดการตำแหน่งงานที่เปิดรับ, แผนก, หน่วยธุรกิจ และช่องทางการสรรหา',
      colorTheme: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      tables: [
        { id: 'positions', label: 'Open Positions', labelTh: 'ตำแหน่งที่เปิดรับ', description: 'รายชื่อตำแหน่งงานทั้งหมดที่เปิดรับสมัคร', iconName: 'Briefcase', groupId: 'recruitment' },
        { id: 'departments', label: 'Departments', labelTh: 'แผนกและฝ่าย', description: 'โครงสร้างแผนกและสังกัดในองค์กร', iconName: 'Building2', groupId: 'recruitment' },
        { id: 'business_units', label: 'Business Units', labelTh: 'หน่วยธุรกิจ (BU)', description: 'กลุ่มบริษัทและสายงานหลัก', iconName: 'Building', groupId: 'recruitment' },
        { id: 'channels', label: 'Channels', labelTh: 'ช่องทางรับสมัคร', description: 'ช่องทางและแหล่งที่มาของผู้สมัคร', iconName: 'Share2', groupId: 'recruitment' },
      ],
    },
    {
      id: 'evaluations',
      label: 'Evaluations & Rubrics',
      labelTh: 'แบบประเมินและเกณฑ์คะแนน',
      description: 'Rubrics แบบประเมินผู้สมัคร, เกณฑ์คะแนน, และผลการประเมินเสนอแนะ',
      colorTheme: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tables: [
        { id: 'evaluations', label: 'Evaluation Templates', labelTh: 'แบบประเมินผู้สมัคร', description: 'จัดการแบบประเมินและ Rubrics เกณฑ์คะแนนสัมภาษณ์', iconName: 'FileCheck2', groupId: 'evaluations' },
      ],
    },
    {
      id: 'education',
      label: 'Education & Academic',
      labelTh: 'ข้อมูลสถาบันการศึกษา',
      description: 'รายชื่อมหาวิทยาลัย, สถาบันอาชีวะ/วิทยาลัย และคณะวิชา',
      colorTheme: 'from-purple-600 to-pink-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      tables: [
        { id: 'universities', label: 'Universities', labelTh: 'มหาวิทยาลัย', description: 'รายชื่อมหาวิทยาลัยและสถาบันอุดมศึกษา', iconName: 'GraduationCap', groupId: 'education' },
        { id: 'colleges', label: 'Colleges', labelTh: 'วิทยาลัย / อาชีวะ', description: 'รายชื่อวิทยาลัย ปวช. และ ปวส.', iconName: 'School', groupId: 'education' },
        { id: 'faculties', label: 'Faculties', labelTh: 'คณะและสาขา', description: 'รายชื่อคณะและกลุ่มสาขาวิชา', iconName: 'BookOpen', groupId: 'education' },
      ],
    },
    {
      id: 'address',
      label: 'Locations & Geography',
      labelTh: 'ข้อมูลสถานที่และที่อยู่',
      description: 'จังหวัด, อำเภอ, ตำบล และรหัสไปรษณีย์สำหรับการกรอกที่อยู่',
      colorTheme: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      tables: [
        { id: 'provinces', label: 'Provinces', labelTh: 'จังหวัด', description: 'รายชื่อจังหวัดทั่วประเทศ 77 จังหวัด', iconName: 'MapPin', groupId: 'address' },
        { id: 'districts', label: 'Districts', labelTh: 'อำเภอ / เขต', description: 'รายชื่ออำเภอและเขต', iconName: 'Navigation', groupId: 'address' },
        { id: 'subdistricts', label: 'Subdistricts', labelTh: 'ตำบล / แขวง', description: 'รายชื่อตำบล แขวง และรหัสไปรษณีย์', iconName: 'Compass', groupId: 'address' },
      ],
    },
    {
      id: 'memo',
      label: 'HR Memo & Policies',
      labelTh: 'เอกสารและเงื่อนไขจ้างงาน',
      description: 'ตั้งค่าระบบออกเอกสาร Memo และเงื่อนไขค่าตอบแทนพิเศษ',
      colorTheme: 'from-cyan-600 to-blue-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      tables: [
        { id: 'memo_conditions', label: 'Memo Conditions', labelTh: 'เงื่อนไขค่าตอบแทนพิเศษ', description: 'เงื่อนไขค่าครองชีพ เบี้ยเลี้ยง และค่าเดินทาง', iconName: 'Award', groupId: 'memo' },
        { id: 'memo_calendars', label: 'Memo Calendars', labelTh: 'ปฏิทินปฏิบัติงาน', description: 'รอบปฏิทินการเริ่มงานและเอกสาร Memo', iconName: 'Calendar', groupId: 'memo' },
      ],
    },
  ], []);

  const ALL_TABLES = useMemo(() => TABLE_GROUPS.flatMap(g => g.tables), [TABLE_GROUPS]);

  // Load lookup dependencies
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [depts, bus, provs] = await Promise.all([
          api.master.getDepartments(),
          api.master.getBusinessUnits(),
          api.master.getProvinces(),
        ]);
        setDeptList(depts || []);
        setBuList(bus || []);
        setProvList(provs || []);
      } catch (err) {
        console.error('Failed to load master data lookups', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch Table Data
  const fetchTableData = async () => {
    if (activeTable === 'evaluations') return;
    setIsLoading(true);
    try {
      const response = await api.master.getAll(activeTable);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        showToast(response.error?.message || `โหลดข้อมูล ${activeTable} ไม่สำเร็จ`, 'error');
        setData([]);
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'table') {
      fetchTableData();
      setCurrentPage(1);
      setSearchQuery('');
      setDeptFilter('all');
      setStatusFilter('all');
    }
  }, [activeTable, viewMode]);

  // Real-time Duplicate Detection when typing in Position Modal
  useEffect(() => {
    if (!isModalOpen || activeTable !== 'positions') {
      setDuplicateWarning(null);
      return;
    }

    const nameTh = (formData.name_th || '').trim().toLowerCase();
    const nameEn = (formData.name_en || '').trim().toLowerCase();
    const deptId = Number(formData.department_id);

    if ((!nameTh && !nameEn) || !deptId) {
      setDuplicateWarning(null);
      return;
    }

    const matched = data.find(item => {
      // Exclude current editing item
      if (editingItem && item.id === editingItem.id) return false;
      if (Number(item.department_id) !== deptId) return false;

      const itemTh = (item.name_th || '').trim().toLowerCase();
      const itemEn = (item.name_en || '').trim().toLowerCase();

      return (nameTh && itemTh === nameTh) || (nameEn && itemEn === nameEn);
    });

    if (matched) {
      setDuplicateWarning({
        found: true,
        item: matched,
        isArchived: matched.is_active === false,
      });
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.name_th, formData.name_en, formData.department_id, isModalOpen, activeTable, data, editingItem]);

  // Open Add Modal
  const openAdd = () => {
    setEditingItem(null);
    setDuplicateWarning(null);
    if (activeTable === 'positions') {
      setFormData({ name_th: '', name_en: '', department_id: deptList[0]?.id || '', is_active: true });
    } else if (activeTable === 'departments') {
      setFormData({ name_th: '', name_en: '', is_active: true });
    } else if (activeTable === 'business_units') {
      setFormData({ name: '', is_active: true });
    } else if (activeTable === 'channels') {
      setFormData({ name: '', business_unit_id: buList[0]?.id || '', is_active: true });
    } else if (activeTable === 'memo_conditions') {
      setFormData({ title: '', code: '', description: '', is_active: true });
    } else if (activeTable === 'memo_calendars') {
      setFormData({ title: '', year: new Date().getFullYear(), is_active: true });
    } else {
      setFormData({ name: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEdit = (item: any) => {
    setEditingItem(item);
    setDuplicateWarning(null);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await api.master.updateItem(activeTable, editingItem.id, formData);
        if (res.success) {
          showToast('บันทึกการแก้ไขเรียบร้อย');
          setIsModalOpen(false);
          fetchTableData();
        } else {
          showToast(res.error?.message || 'แก้ไขไม่สำเร็จ', 'error');
        }
      } else {
        const res = await api.master.addItem(activeTable, formData);
        if (res.success) {
          showToast('เพิ่มข้อมูลใหม่เรียบร้อย');
          setIsModalOpen(false);
          fetchTableData();
        } else {
          showToast(res.error?.message || 'เพิ่มข้อมูลไม่สำเร็จ', 'error');
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  // Toggle Item Status
  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      const res = await api.master.toggleItem(activeTable, id, !currentStatus);
      if (res.success) {
        showToast(`อัปเดตสถานะเป็น ${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`);
        fetchTableData();
      } else {
        showToast(res.error?.message || 'อัปเดตสถานะไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', 'error');
    }
  };

  // 1-Click Reactivate Duplicate Archived Item
  const handleReactivateDuplicate = async (item: any) => {
    try {
      const res = await api.master.toggleItem(activeTable, item.id, true);
      if (res.success) {
        showToast(`เปิดรับสมัครตำแหน่ง "${item.name_th || item.name_en}" อีกครั้งเรียบร้อยแล้ว`);
        setIsModalOpen(false);
        fetchTableData();
      } else {
        showToast(res.error?.message || 'เปิดใช้งานตำแหน่งไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  // Open Department Positions List Modal
  const openDeptPositions = async (dept: any) => {
    setDeptPositionsModal({ id: dept.id, name: dept.name_th || dept.name });
    setIsLoadingDeptPositions(true);
    try {
      const posData = await api.master.getPositions(dept.id);
      setDeptPositionsList(posData || []);
    } catch (err) {
      console.error('Failed to load positions', err);
      setDeptPositionsList([]);
    } finally {
      setIsLoadingDeptPositions(false);
    }
  };

  // Render Icon dynamically
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'Building': return <Building className={className} />;
      case 'Share2': return <Share2 className={className} />;
      case 'FileCheck2': return <FileCheck2 className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'School': return <School className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Navigation': return <Navigation className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      default: return <Database className={className} />;
    }
  };

  // Filtered Table Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        item.name,
        item.name_th,
        item.name_en,
        item.code,
        item.title,
        item.description,
        item.id?.toString(),
      ].some(val => val && String(val).toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Status Filter
      if (statusFilter === 'active' && item.is_active === false) return false;
      if (statusFilter === 'inactive' && item.is_active !== false) return false;

      // 3. Department Filter (for Positions)
      if (activeTable === 'positions' && deptFilter !== 'all') {
        if (String(item.department_id) !== String(deptFilter)) return false;
      }

      return true;
    });
  }, [data, searchQuery, statusFilter, deptFilter, activeTable]);

  // Paginated Data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredData.length) {
      showToast('ไม่มีข้อมูลสำหรับส่งออก', 'error');
      return;
    }
    const headers = Object.keys(filteredData[0]).filter(k => typeof filteredData[0][k] !== 'object');
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `master_data_${activeTable}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('ส่งออกไฟล์ CSV เรียบร้อย');
  };

  // Quick switch between tables
  const handleSelectTable = (tableId: string) => {
    if (tableId === 'evaluations') {
      setViewMode('evaluations');
    } else {
      setActiveTable(tableId);
      setViewMode('table');
    }
  };

  // Find active table definition
  const currentTableDef = ALL_TABLES.find(t => t.id === activeTable) || ALL_TABLES[0];
  const currentGroupDef = TABLE_GROUPS.find(g => g.id === currentTableDef.groupId) || TABLE_GROUPS[0];

  // =========================================================================
  // VIEW MODE 1: EVALUATION TEMPLATES FULL-WIDTH VIEW
  // =========================================================================
  if (viewMode === 'evaluations') {
    return (
      <div className="space-y-4">
        {/* Quick Header Back to Master Data Hub */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('hub')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> กลับหน้า Hub
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-medium">แบบประเมินและเกณฑ์คะแนน</span>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>แบบประเมินผู้สมัคร (Evaluation Templates)</span>
            </div>
          </div>

          {/* Quick Dropdown to Switch to Other Tables */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 hidden md:inline">สลับตาราง:</span>
            <select
              value="evaluations"
              onChange={e => handleSelectTable(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="evaluations">📋 แบบประเมินผู้สมัคร (Evaluation Templates)</option>
              {TABLE_GROUPS.filter(g => g.id !== 'evaluations').map(g => (
                <optgroup key={g.id} label={`${g.labelTh} (${g.label})`}>
                  {g.tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.labelTh} ({t.label})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Embedded EvaluationTemplatesTab */}
        <EvaluationTemplatesTab showToast={showToast} onBackToHub={() => setViewMode('hub')} />
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: MASTER DATA HUB DIRECTORY (INDEX VIEW)
  // =========================================================================
  if (viewMode === 'hub') {
    // Filter groups and tables matching hub search
    const filteredGroups = TABLE_GROUPS.map(group => {
      const matchingTables = group.tables.filter(t =>
        !hubSearch ||
        t.label.toLowerCase().includes(hubSearch.toLowerCase()) ||
        t.labelTh.toLowerCase().includes(hubSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(hubSearch.toLowerCase())
      );
      return { ...group, matchingTables };
    }).filter(group => group.matchingTables.length > 0);

    return (
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                <Database className="w-3.5 h-3.5" /> Central Configuration & Catalogs
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Master Data Hub
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                ศูนย์กลางจัดการข้อมูลหลัก, โครงสร้างตำแหน่งงานที่เปิดรับ, แบบประเมินผู้สมัคร, และหมวดหมู่ระบบ
              </p>
            </div>

            {/* Quick KPI Counters */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center min-w-[100px]">
                <div className="text-xl font-black text-white">{deptList.length}</div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-0.5">แผนก/ฝ่าย</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center min-w-[100px]">
                <div className="text-xl font-black text-emerald-400">{buList.length}</div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-0.5">หน่วยธุรกิจ</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 text-center min-w-[100px]">
                <div className="text-xl font-black text-amber-300">5</div>
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-0.5">หมวดหมู่หลัก</div>
              </div>
            </div>
          </div>

          {/* Global Search Bar inside Hub */}
          <div className="relative mt-6 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={hubSearch}
              onChange={e => setHubSearch(e.target.value)}
              placeholder="ค้นหาหมวดหมู่ข้อมูลหลัก เช่น ตำแหน่งที่เปิดรับ, แผนก, แบบประเมิน, มหาวิทยาลัย..."
              className="w-full pl-11 pr-10 py-3 bg-white/10 hover:bg-white/15 focus:bg-white focus:text-slate-900 placeholder:text-slate-400 text-white rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition"
            />
            {hubSearch && (
              <button
                onClick={() => setHubSearch('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Directory Grid */}
        <div className="space-y-8">
          {filteredGroups.map(group => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${group.colorTheme}`} />
                  <h3 className="font-bold text-base text-slate-900">{group.labelTh}</h3>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">({group.label})</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {group.matchingTables.length} ตาราง
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.matchingTables.map(table => (
                  <div
                    key={table.id}
                    onClick={() => handleSelectTable(table.id)}
                    className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between select-none hover:-translate-y-0.5 duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                          {renderIcon(table.iconName, 'w-5 h-5')}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.badgeBg}`}>
                          {table.groupId}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition">
                          {table.labelTh}
                        </h4>
                        <div className="text-xs font-semibold text-slate-400 font-mono">
                          {table.label}
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {table.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                      <span>เปิดจัดการข้อมูล</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
              <Database className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-700">ไม่พบหมวดหมู่ที่ตรงกับการค้นหา</div>
              <p className="text-xs text-slate-400">ลองค้นหาด้วยคำอื่น หรือกด Clear เพื่อดูทั้งหมด</p>
              <Button onClick={() => setHubSearch('')} size="sm">ล้างการค้นหา</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 3: FULL-WIDTH WORKSTATION DATA TABLE
  // =========================================================================
  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode('hub')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> กลับหน้า Hub
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500 font-medium">{currentGroupDef.labelTh}</span>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/80">
            {renderIcon(currentTableDef.iconName, 'w-3.5 h-3.5 text-indigo-600')}
            <span>{currentTableDef.labelTh}</span>
          </div>
        </div>

        {/* Right: Sibling Segmented Tabs + Grouped Dropdown (Clean, No-Scroll) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Segmented Sibling Pills within the same category group (Max 2-4 pills) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 flex-wrap">
            {currentGroupDef.tables.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTable(t.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 select-none ${
                  t.id === activeTable
                    ? 'bg-white text-indigo-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title={t.description}
              >
                {renderIcon(t.iconName, 'w-3.5 h-3.5')}
                <span>{t.labelTh}</span>
              </button>
            ))}
          </div>

          {/* Quick Dropdown to jump to ANY other Category Group */}
          <select
            value={activeTable}
            onChange={e => handleSelectTable(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="" disabled>-- สลับไปหมวดหมู่อื่น --</option>
            {TABLE_GROUPS.map(g => (
              <optgroup key={g.id} label={`${g.labelTh} (${g.label})`}>
                {g.tables.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.labelTh} ({t.label})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Main Full-Width Table Card */}
      <Card className="p-6 space-y-5 rounded-3xl border-slate-200/80 shadow-sm bg-white">
        {/* Table Header Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-slate-900 tracking-tight">
                {currentTableDef.labelTh}
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {filteredData.length} รายการ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentTableDef.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExportCSV} title="ส่งออก CSV">
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchTableData} isLoading={isLoading} title="รีเฟรชข้อมูล">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={openAdd} className="shadow-md shadow-indigo-500/20">
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่ม{currentTableDef.labelTh}ใหม่
            </Button>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={`ค้นหาใน ${currentTableDef.labelTh}...`}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Department Filter (if viewing positions) */}
          {activeTable === 'positions' && (
            <div>
              <select
                value={deptFilter}
                onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">ทุกแผนก (All Departments)</option>
                {deptList.map(d => (
                  <option key={d.id} value={d.id}>{d.name_th || d.name_en}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">สถานะทั้งหมด (All Status)</option>
              <option value="active">เปิดใช้งาน (Active Only)</option>
              <option value="inactive">ปิดใช้งาน / คลังประวัติ (Inactive Only)</option>
            </select>
          </div>
        </div>

        {/* Full-Width Data Table */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm">กำลังโหลดข้อมูล...</div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
            <Database className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-base font-bold text-slate-700">ไม่พบรายการข้อมูล</div>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูลในตารางนี้'}
            </p>
            <Button onClick={openAdd} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> เพิ่มรายการแรก
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3 text-left w-16 uppercase tracking-wider">ID</th>
                  {activeTable === 'positions' && (
                    <>
                      <th className="px-4 py-3 text-left">ชื่อตำแหน่ง (ไทย)</th>
                      <th className="px-4 py-3 text-left">ชื่อตำแหน่ง (อังกฤษ)</th>
                      <th className="px-4 py-3 text-left">แผนก / สังกัด</th>
                    </>
                  )}
                  {activeTable === 'departments' && (
                    <>
                      <th className="px-4 py-3 text-left">ชื่อแผนก (ไทย)</th>
                      <th className="px-4 py-3 text-left">ชื่อแผนก (อังกฤษ)</th>
                      <th className="px-4 py-3 text-center">ตำแหน่งในแผนก</th>
                    </>
                  )}
                  {activeTable === 'channels' && (
                    <>
                      <th className="px-4 py-3 text-left">ชื่อช่องทาง</th>
                      <th className="px-4 py-3 text-left">Business Unit</th>
                    </>
                  )}
                  {activeTable !== 'positions' && activeTable !== 'departments' && activeTable !== 'channels' && (
                    <>
                      <th className="px-4 py-3 text-left">ชื่อ / Title</th>
                      {data[0]?.code !== undefined && <th className="px-4 py-3 text-left">Code</th>}
                      {data[0]?.description !== undefined && <th className="px-4 py-3 text-left">คำอธิบาย</th>}
                    </>
                  )}
                  <th className="px-4 py-3 text-center w-28">สถานะ</th>
                  <th className="px-4 py-3 text-right w-28">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedData.map(item => {
                  const dept = activeTable === 'positions' ? deptList.find(d => d.id === item.department_id) : null;
                  const bu = activeTable === 'channels' ? buList.find(b => b.id === item.business_unit_id) : null;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-400">#{item.id}</td>

                      {activeTable === 'positions' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {item.name_th || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {item.name_en || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {dept?.name_th || dept?.name_en || <span className="text-slate-400 italic">ไม่ระบุ</span>}
                          </td>
                        </>
                      )}

                      {activeTable === 'departments' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.name_th || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{item.name_en || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => openDeptPositions(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                            >
                              <Eye className="w-3 h-3" /> ดูตำแหน่ง
                            </button>
                          </td>
                        </>
                      )}

                      {activeTable === 'channels' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 text-slate-600">{bu?.name || '-'}</td>
                        </>
                      )}

                      {activeTable !== 'positions' && activeTable !== 'departments' && activeTable !== 'channels' && (
                        <>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {item.name_th || item.name || item.title || '-'}
                          </td>
                          {data[0]?.code !== undefined && (
                            <td className="px-4 py-3 font-mono text-slate-600">{item.code || '-'}</td>
                          )}
                          {data[0]?.description !== undefined && (
                            <td className="px-4 py-3 text-slate-500 line-clamp-1">{item.description || '-'}</td>
                          )}
                        </>
                      )}

                      {/* Status Toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id, item.is_active !== false)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            item.is_active !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="คลิกเพื่อสลับสถานะ"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {item.is_active !== false ? 'เปิดรับ' : 'ปิดอยู่'}
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="แก้ไขรายการ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>แสดงแถว:</span>
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-xs"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>จากทั้งหมด {filteredData.length} รายการ</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold text-slate-700">
                หน้า {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ===================================================================== */}
      {/* MODAL: ADD / EDIT MASTER DATA ITEM                                    */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingItem ? 'แก้ไข' : 'เพิ่ม'}${currentTableDef.labelTh}`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Duplicate Detection Warning Banner */}
          {duplicateWarning?.found && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-start gap-2 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">พบตำแหน่งนี้อยู่ในระบบแล้ว!</div>
                  <div className="text-amber-800 mt-0.5">
                    ตำแหน่ง "{duplicateWarning.item?.name_th || duplicateWarning.item?.name_en}" มีอยู่ในแผนกนี้แล้ว
                    ({duplicateWarning.isArchived ? 'สถานะ: ปิดรับอยู่ / ในคลังประวัติ' : 'สถานะ: เปิดรับอยู่'})
                  </div>
                </div>
              </div>

              {duplicateWarning.isArchived && (
                <button
                  type="button"
                  onClick={() => handleReactivateDuplicate(duplicateWarning.item)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 🔄 เปิดรับสมัครตำแหน่งเดิมนี้อีกครั้ง (Reopen)
                </button>
              )}
            </div>
          )}

          {activeTable === 'positions' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">แผนก / สังกัด (Department) *</label>
                <select
                  value={formData.department_id || ''}
                  onChange={e => setFormData({ ...formData, department_id: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  required
                >
                  <option value="">-- เลือกแผนก --</option>
                  {deptList.map(d => (
                    <option key={d.id} value={d.id}>{d.name_th || d.name_en}</option>
                  ))}
                </select>
              </div>

              <Input
                label="ชื่อตำแหน่ง (ภาษาไทย) *"
                value={formData.name_th || ''}
                onChange={e => setFormData({ ...formData, name_th: e.target.value })}
                placeholder="เช่น เจ้าหน้าที่สรรหาบุคลากร"
                required
              />

              <Input
                label="ชื่อตำแหน่ง (ภาษาอังกฤษ)"
                value={formData.name_en || ''}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="เช่น Talent Acquisition Specialist"
              />
            </>
          )}

          {activeTable === 'departments' && (
            <>
              <Input
                label="ชื่อแผนก (ภาษาไทย) *"
                value={formData.name_th || ''}
                onChange={e => setFormData({ ...formData, name_th: e.target.value })}
                placeholder="เช่น ทรัพยากรบุคคล"
                required
              />
              <Input
                label="ชื่อแผนก (ภาษาอังกฤษ)"
                value={formData.name_en || ''}
                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="เช่น Human Resources"
              />
            </>
          )}

          {activeTable === 'channels' && (
            <>
              <Input
                label="ชื่อช่องทาง *"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น JobsDB, Walk-in, Referral"
                required
              />
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Unit *</label>
                <select
                  value={formData.business_unit_id || ''}
                  onChange={e => setFormData({ ...formData, business_unit_id: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">-- เลือก Business Unit --</option>
                  {buList.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTable !== 'positions' && activeTable !== 'departments' && activeTable !== 'channels' && (
            <>
              <Input
                label="ชื่อ / Title *"
                value={formData.name_th || formData.name || formData.title || ''}
                onChange={e => {
                  const val = e.target.value;
                  if (formData.name_th !== undefined) setFormData({ ...formData, name_th: val });
                  else if (formData.name !== undefined) setFormData({ ...formData, name: val });
                  else setFormData({ ...formData, title: val });
                }}
                required
              />
              {formData.code !== undefined && (
                <Input
                  label="Code"
                  value={formData.code || ''}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
              )}
              {formData.description !== undefined && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คำอธิบาย</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="item_active"
              checked={formData.is_active !== false}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="item_active" className="text-xs font-bold text-slate-700 select-none">
              เปิดใช้งาน (Active / เปิดรับสมัคร)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">
              บันทึกข้อมูล
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL: PREVIEW POSITIONS IN DEPARTMENT                                */}
      {/* ===================================================================== */}
      <Modal
        isOpen={Boolean(deptPositionsModal)}
        onClose={() => setDeptPositionsModal(null)}
        title={`ตำแหน่งในแผนก: ${deptPositionsModal?.name || ''}`}
      >
        <div className="space-y-4">
          {isLoadingDeptPositions ? (
            <div className="text-center py-8 text-slate-400">กำลังโหลดตำแหน่ง...</div>
          ) : deptPositionsList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              ยังไม่มีตำแหน่งงานในแผนกนี้
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {deptPositionsList.map((pos, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{pos.name_th}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{pos.name_en || '-'}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pos.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {pos.is_active !== false ? 'เปิดรับ' : 'ปิดรับ'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button type="button" onClick={() => setDeptPositionsModal(null)}>
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
