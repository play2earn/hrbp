import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '../UIComponents';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  UserX,
  X,
  History,
  Users,
  Eye,
  Paperclip,
  Check,
  Calendar,
  Lock
} from 'lucide-react';
import { api } from '../../services/api';
import { BlacklistEntry, BlacklistAuditLog } from '../../types';

interface BlacklistTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
  currentUser: any;
}

export const BlacklistTab: React.FC<BlacklistTabProps> = ({ showToast, currentUser }) => {
  const [subTab, setSubTab] = useState<'roster' | 'audit'>('roster');
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<BlacklistAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BlacklistEntry | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<BlacklistEntry | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewingFilesEntry, setViewingFilesEntry] = useState<BlacklistEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<BlacklistEntry, 'id' | 'created_at' | 'updated_at'>>({
    first_name: '',
    last_name: '',
    national_id: '',
    passport_no: '',
    email: '',
    phone: '',
    reason_category: 'policy_violation',
    severity_level: 'high',
    description: '',
    original_bu: '',
    original_department: '',
    incident_date: '',
    status: 'active',
    attachment_url_1: '',
    attachment_name_1: '',
    attachment_url_2: '',
    attachment_name_2: ''
  });

  // Attachments loading state
  const [isUploading1, setIsUploading1] = useState(false);
  const [isUploading2, setIsUploading2] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (subTab === 'roster') {
      fetchEntries();
    } else {
      fetchAuditLogs();
    }
  }, [subTab]);

  const fetchEntries = async () => {
    setLoading(true);
    const result = await api.blacklist.getEntries();
    if (result.success && result.data) {
      setEntries(result.data);
    } else {
      showToast('ไม่สามารถดึงข้อมูล Blacklist ได้', 'error');
    }
    setLoading(false);
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    const result = await api.blacklist.getAuditLogs();
    if (result.success && result.data) {
      setAuditLogs(result.data);
    } else {
      showToast('ไม่สามารถดึงข้อมูลประวัติการตรวจสอบได้', 'error');
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      national_id: '',
      passport_no: '',
      email: '',
      phone: '',
      reason_category: 'policy_violation',
      severity_level: 'high',
      description: '',
      original_bu: '',
      original_department: '',
      incident_date: '',
      status: 'active',
      attachment_url_1: '',
      attachment_name_1: '',
      attachment_url_2: '',
      attachment_name_2: ''
    });
    setIsUploading1(false);
    setIsUploading2(false);
  };

  // Upload attachment file
  const handleFileUpload = async (file: File, slot: 1 | 2) => {
    if (slot === 1) setIsUploading1(true);
    else setIsUploading2(true);

    try {
      const url = await api.uploadFile(file, 'blacklist');
      if (url) {
        setFormData(prev => ({
          ...prev,
          [`attachment_url_${slot}`]: url,
          [`attachment_name_${slot}`]: file.name
        }));
        showToast(`อัปโหลดหลักฐานชิ้นที่ ${slot} เรียบร้อยแล้ว`, 'success');
      } else {
        showToast('อัปโหลดไฟล์ไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'อัปโหลดไฟล์ล้มเหลว', 'error');
    } finally {
      if (slot === 1) setIsUploading1(false);
      else setIsUploading2(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      showToast('กรุณากรอกชื่อและนามสกุล', 'error');
      return;
    }
    if (!formData.national_id && !formData.passport_no) {
      showToast('กรุณากรอกเลขบัตรประชาชน หรือเลขพาสปอร์ตอย่างใดอย่างหนึ่งเพื่อใช้ตรวจสอบสิทธิ์', 'error');
      return;
    }

    const payload = {
      ...formData,
      national_id: formData.national_id ? formData.national_id.trim() : null,
      passport_no: formData.passport_no ? formData.passport_no.trim() : null,
      email: formData.email ? formData.email.trim().toLowerCase() : null,
      phone: formData.phone ? formData.phone.trim() : null,
      incident_date: formData.incident_date || null,
      created_by: currentUser?.id || null
    };

    const result = await api.blacklist.addEntry(payload);
    if (result.success && result.data) {
      // Create Audit Log
      await api.blacklist.addAuditLog({
        performed_by: currentUser?.id || null,
        performed_by_name: currentUser?.full_name || 'HR Recruiter',
        action: 'create',
        blacklist_id: result.data.id,
        candidate_name: `${formData.first_name} ${formData.last_name}`,
        details: `เพิ่มข้อมูลประวัติเสียเข้าสู่ระบบ Blacklist (ระดับความรุนแรง: ${formData.severity_level})`
      });

      showToast('เพิ่มรายชื่อใน Blacklist เรียบร้อยแล้ว', 'success');
      setIsAddOpen(false);
      resetForm();
      fetchEntries();
    } else {
      showToast(result.error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    }
  };

  const handleEditClick = (entry: BlacklistEntry) => {
    setEditingEntry(entry);
    setFormData({
      first_name: entry.first_name,
      last_name: entry.last_name,
      national_id: entry.national_id || '',
      passport_no: entry.passport_no || '',
      email: entry.email || '',
      phone: entry.phone || '',
      reason_category: entry.reason_category,
      severity_level: entry.severity_level,
      description: entry.description || '',
      original_bu: entry.original_bu || '',
      original_department: entry.original_department || '',
      incident_date: entry.incident_date || '',
      status: entry.status,
      attachment_url_1: entry.attachment_url_1 || '',
      attachment_name_1: entry.attachment_name_1 || '',
      attachment_url_2: entry.attachment_url_2 || '',
      attachment_name_2: entry.attachment_name_2 || ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.id) return;

    if (!formData.first_name || !formData.last_name) {
      showToast('กรุณากรอกชื่อและนามสกุล', 'error');
      return;
    }

    const payload = {
      ...formData,
      national_id: formData.national_id ? formData.national_id.trim() : null,
      passport_no: formData.passport_no ? formData.passport_no.trim() : null,
      email: formData.email ? formData.email.trim().toLowerCase() : null,
      phone: formData.phone ? formData.phone.trim() : null,
      incident_date: formData.incident_date || null
    };

    const result = await api.blacklist.updateEntry(editingEntry.id, payload);
    if (result.success) {
      // Create Audit Log
      await api.blacklist.addAuditLog({
        performed_by: currentUser?.id || null,
        performed_by_name: currentUser?.full_name || 'HR Recruiter',
        action: 'update',
        blacklist_id: editingEntry.id,
        candidate_name: `${formData.first_name} ${formData.last_name}`,
        details: `อัปเดตรายละเอียดประวัติเสียของผู้สมัคร`
      });

      showToast('อัปเดตข้อมูลเรียบร้อยแล้ว', 'success');
      setEditingEntry(null);
      resetForm();
      fetchEntries();
    } else {
      showToast(result.error?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', 'error');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!isDeleteConfirmOpen?.id) return;
    const result = await api.blacklist.deleteEntry(isDeleteConfirmOpen.id);
    if (result.success) {
      // Create Audit Log
      await api.blacklist.addAuditLog({
        performed_by: currentUser?.id || null,
        performed_by_name: currentUser?.full_name || 'HR Recruiter',
        action: 'delete',
        blacklist_id: isDeleteConfirmOpen.id,
        candidate_name: `${isDeleteConfirmOpen.first_name} ${isDeleteConfirmOpen.last_name}`,
        details: `ลบรายชื่อผู้มีประวัติเสียออกจากระบบอย่างถาวร`
      });

      showToast('ลบรายชื่อออกจาก Blacklist เรียบร้อยแล้ว', 'success');
      setIsDeleteConfirmOpen(null);
      fetchEntries();
    } else {
      showToast('เกิดข้อผิดพลาดในการลบรายชื่อ', 'error');
    }
  };

  // CSV Import Parsing
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
        setImportHeaders(headers);

        const parsedData = lines.slice(1).map(line => {
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^["']|["']$/g, '').trim());
          const obj: any = {};
          headers.forEach((h, index) => {
            obj[h] = values[index] || '';
          });
          return obj;
        });
        setImportPreview(parsedData.slice(0, 5));
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (!csvFile) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length <= 1) {
          showToast('ไม่พบข้อมูลในไฟล์ CSV', 'error');
          setLoading(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
        
        let successCount = 0;
        let failCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^["']|["']$/g, '').trim());
          const row: any = {};
          headers.forEach((h, index) => {
            row[h] = values[index] || '';
          });

          const firstName = row.first_name || row['ชื่อ'] || row.firstname || '';
          const lastName = row.last_name || row['นามสกุล'] || row.lastname || '';
          const nationalId = row.national_id || row['เลขบัตรประชาชน'] || row.nationalid || null;
          const passportNo = row.passport_no || row['เลขพาสปอร์ต'] || row.passportno || null;
          
          if (!firstName || !lastName || (!nationalId && !passportNo)) {
            failCount++;
            continue;
          }

          const entryPayload = {
            first_name: firstName,
            last_name: lastName,
            national_id: nationalId ? nationalId.trim() : null,
            passport_no: passportNo ? passportNo.trim() : null,
            email: row.email || row['อีเมล'] || null,
            phone: row.phone || row['เบอร์โทร'] || null,
            reason_category: row.reason_category || row['หมวดหมู่ความผิด'] || 'policy_violation',
            severity_level: (row.severity_level || row['ระดับความรุนแรง'] || 'high').toLowerCase() as any,
            description: row.description || row['รายละเอียด'] || '',
            original_bu: row.original_bu || row['buเดิม'] || '',
            original_department: row.original_department || row['แผนกเดิม'] || '',
            incident_date: row.incident_date || row['วันที่เกิดเหตุ'] || null,
            status: row.status || 'active',
            created_by: currentUser?.id || null
          };

          const res = await api.blacklist.addEntry(entryPayload);
          if (res.success) {
            successCount++;
          } else {
            failCount++;
          }
        }

        // Audit Log for Import
        await api.blacklist.addAuditLog({
          performed_by: currentUser?.id || null,
          performed_by_name: currentUser?.full_name || 'HR Recruiter',
          action: 'create',
          details: `นำเข้าข้อมูลประวัติเสียแบบกลุ่ม (Bulk Import CSV) สำเร็จ ${successCount} รายการ, ข้าม ${failCount} รายการ`
        });

        showToast(`นำเข้าสำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ`, successCount > 0 ? 'success' : 'error');
        setIsImportOpen(false);
        setCsvFile(null);
        setImportPreview([]);
        fetchEntries();
      } catch (err) {
        console.error(err);
        showToast('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV', 'error');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // CSV Export
  const handleExport = async () => {
    if (entries.length === 0) {
      showToast('ไม่มีข้อมูลที่จะส่งออก', 'error');
      return;
    }

    const headers = [
      'first_name', 'last_name', 'national_id', 'passport_no', 'email', 'phone', 
      'reason_category', 'severity_level', 'description', 'original_bu', 
      'original_department', 'incident_date', 'status', 'created_at'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredEntries.map(entry => {
        return headers.map(header => {
          const val = (entry as any)[header] || '';
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',');
      })
    ];

    // Audit Log for Export
    await api.blacklist.addAuditLog({
      performed_by: currentUser?.id || null,
      performed_by_name: currentUser?.full_name || 'HR Recruiter',
      action: 'export',
      details: `ส่งออกไฟล์ข้อมูลประวัติเสียในระบบ (Exported CSV, ทั้งหมด ${filteredEntries.length} รายการ)`
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `blacklist_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', 'success');
  };

  const getReasonLabel = (cat: string) => {
    const maps: Record<string, string> = {
      theft: 'ขโมยทรัพย์สิน (Theft)',
      policy_violation: 'ผิดกฏระเบียบบริษัท (Policy Violation)',
      attendance: 'ขาดงาน/ละทิ้งหน้าที่ (Attendance Issues)',
      harassment: 'ล่วงละเมิด/ทะเลาะวิวาท (Harassment)',
      fraud: 'ทุจริต/ปลอมแปลงเอกสาร (Fraud)',
      other: 'อื่นๆ (Other)'
    };
    return maps[cat] || cat;
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">รุนแรงสูง (High)</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">ปานกลาง (Medium)</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">ต่ำ (Low)</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{level}</span>;
    }
  };

  // Filter Roster Entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      `${entry.first_name} ${entry.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.national_id || '').includes(searchTerm) ||
      (entry.passport_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.phone || '').includes(searchTerm);

    const matchesSeverity = severityFilter === 'all' || entry.severity_level === severityFilter;
    const matchesCategory = categoryFilter === 'all' || entry.reason_category === categoryFilter;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  // Filter Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.performed_by_name.toLowerCase().includes(term) ||
      (log.candidate_name || '').toLowerCase().includes(term) ||
      (log.details || '').toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term)
    );
  });

  // Calculate Metrics
  const totalActive = entries.filter(e => e.status === 'active').length;
  const highSeverityCount = entries.filter(e => e.status === 'active' && e.severity_level === 'high').length;
  const theftCount = entries.filter(e => e.status === 'active' && e.reason_category === 'theft').length;

  return (
    <div className="form-step-enter space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-600 animate-pulse" /> Blacklist Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            ระบบจัดเก็บประวัติและคัดกรองประวัติการทำงานของผู้สมัครเพื่อป้องกันความเสี่ยงขององค์กร
          </p>
        </div>
        
        {subTab === 'roster' && (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5 text-sm border-gray-300 hover:bg-gray-50"
              onClick={handleExport}
            >
              <Download className="w-4 h-4" /> ส่งออก CSV
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5 text-sm border-gray-300 hover:bg-gray-50"
              onClick={() => setIsImportOpen(true)}
            >
              <Upload className="w-4 h-4" /> นำเข้า CSV
            </Button>
            <Button 
              className="flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-700 text-white shadow-md"
              onClick={() => { resetForm(); setIsAddOpen(true); }}
            >
              <Plus className="w-4 h-4" /> บันทึกประวัติเสีย
            </Button>
          </div>
        )}
      </div>

      {/* Sub tabs Nav */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setSubTab('roster'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${subTab === 'roster' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4.5 h-4.5" /> รายชื่อประวัติ Blacklist
        </button>
        <button
          onClick={() => { setSubTab('audit'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${subTab === 'audit' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <History className="w-4.5 h-4.5" /> ประวัติการตรวจสอบ (Audit Logs)
        </button>
      </div>

      {subTab === 'roster' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4 bg-gradient-to-br from-red-50 to-white border border-red-100 p-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">บัญชี Blacklist เฝ้าระวัง</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalActive} คน</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ความรุนแรงสูง (High Severity)</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{highSeverityCount} เคส</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ประวัติลักทรัพย์/ทุจริต</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{theftCount} เคส</p>
              </div>
            </Card>
          </div>

          {/* Search & Filters */}
          <Card className="p-4 flex flex-col md:flex-row md:items-center gap-3 bg-white border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="ค้นหาด้วย ชื่อ-สกุล, บัตรประชาชน (13 หลัก), เลขพาสปอร์ต, อีเมล หรือเบอร์โทร..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-sm">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">ระดับความรุนแรง: ทั้งหมด</option>
                  <option value="high">รุนแรงสูง (High)</option>
                  <option value="medium">ปานกลาง (Medium)</option>
                  <option value="low">ต่ำ (Low)</option>
                </select>
              </div>

              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">หมวดหมู่ความผิด: ทั้งหมด</option>
                <option value="theft">ขโมยทรัพย์สิน</option>
                <option value="policy_violation">ผิดกฏระเบียบบริษัท</option>
                <option value="attendance">ขาดงาน/ละทิ้งหน้าที่</option>
                <option value="harassment">ล่วงละเมิด/ทะเลาะวิวาท</option>
                <option value="fraud">ทุจริต/ปลอมเอกสาร</option>
                <option value="other">อื่นๆ</option>
              </select>
            </div>
          </Card>

          {/* Roster list */}
          <Card className="overflow-hidden bg-white border">
            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-3">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <UserX className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">ไม่พบรายชื่อในระบบตรวจสอบ</p>
                <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">รายชื่อผู้มีประวัติ</th>
                      <th className="px-4 py-3 text-left">ข้อมูลระบุตัวตน</th>
                      <th className="px-4 py-3 text-left">หมวดหมู่ความผิด</th>
                      <th className="px-4 py-3 text-left">ระดับความรุนแรง</th>
                      <th className="px-4 py-3 text-left">หลักฐานประกอบ</th>
                      <th className="px-4 py-3 text-left">สถานะ</th>
                      <th className="px-4 py-3 text-center w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{entry.first_name} {entry.last_name}</div>
                          {entry.incident_date && (
                            <div className="text-xs text-gray-500 mt-0.5">วันที่เกิดเหตุ: {entry.incident_date}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 space-y-1">
                          {entry.national_id && <div>บัตรประชาชน: <span className="font-mono font-semibold">{entry.national_id}</span></div>}
                          {entry.passport_no && <div>พาสปอร์ต: <span className="font-mono font-semibold">{entry.passport_no}</span></div>}
                          {entry.phone && <div className="text-gray-400">เบอร์โทร: <span className="font-mono">{entry.phone}</span></div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{getReasonLabel(entry.reason_category)}</div>
                          {entry.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[200px]" title={entry.description}>
                              {entry.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">{getSeverityBadge(entry.severity_level)}</td>
                        <td className="px-4 py-3">
                          {(entry.attachment_url_1 || entry.attachment_url_2) ? (
                            <button
                              onClick={() => setViewingFilesEntry(entry)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>มีเอกสารแนบ ({(!!entry.attachment_url_1 ? 1 : 0) + (!!entry.attachment_url_2 ? 1 : 0)})</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">- ไม่มีหลักฐาน -</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${entry.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {entry.status === 'active' ? 'เฝ้าระวัง' : 'ปิดใช้งาน'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button 
                              className="p-1 hover:bg-gray-100 text-gray-600 rounded" 
                              onClick={() => handleEditClick(entry)}
                              title="แก้ไขประวัติ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-1 hover:bg-red-100 text-red-600 rounded" 
                              onClick={() => setIsDeleteConfirmOpen(entry)}
                              title="ลบออกจากระบบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Audit History Logs Subtab */
        <div className="space-y-4">
          <Card className="p-4 flex items-center gap-3 bg-white border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อผู้ตรวจสอบ (HR), ชื่อผู้สมัคร, การกระทำ หรือรายละเอียด..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
              ดึงข้อมูลล่าสุด
            </Button>
          </Card>

          <Card className="overflow-hidden bg-white border">
            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-gray-500 text-sm mt-3">กำลังโหลดประวัติการตรวจสอบ...</p>
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">ไม่พบประวัติการเข้าใช้งานระบบตรวจสอบ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-700 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left w-48">วันเวลาที่เข้าถึง</th>
                      <th className="px-4 py-3 text-left w-44">ผู้ดำเนินการ (HR)</th>
                      <th className="px-4 py-3 text-left w-36">การกระทำ</th>
                      <th className="px-4 py-3 text-left w-48">เป้าหมาย (ผู้สมัคร)</th>
                      <th className="px-4 py-3 text-left">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAuditLogs.map(log => {
                      const getActionBadge = (act: string) => {
                        switch (act) {
                          case 'create':
                            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">สร้างประวัติ</span>;
                          case 'update':
                            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">แก้ไขข้อมูล</span>;
                          case 'delete':
                            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">ลบข้อมูล</span>;
                          case 'export':
                            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">ส่งออกข้อมูล</span>;
                          case 'view_detail':
                            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">ตรวจสอบจับคู่</span>;
                          default:
                            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{act}</span>;
                        }
                      };

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            <span className="font-medium text-gray-700">
                              {new Date(log.created_at!).toLocaleDateString('th-TH')}
                            </span>{' '}
                            {new Date(log.created_at!).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                            {log.performed_by_name}
                          </td>
                          <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                            {log.candidate_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 leading-normal max-w-sm break-words">
                            {log.details}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Entry Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="บันทึกประวัติเสีย / Blacklist"
        footer={null}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อ (ภาษาไทย/อังกฤษ) *</label>
              <input
                type="text"
                name="first_name"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">นามสกุล (ภาษาไทย/อังกฤษ) *</label>
              <input
                type="text"
                name="last_name"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">เลขประจำตัวประชาชน (13 หลัก) *</label>
              <input
                type="text"
                name="national_id"
                maxLength={13}
                placeholder="110xxxxxxxxxx"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.national_id}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">เลขหนังสือเดินทาง (Passport No)</label>
              <input
                type="text"
                name="passport_no"
                placeholder="Axxxxxxx"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.passport_no}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">อีเมลติดต่อ (ทางเลือก)</label>
              <input
                type="email"
                name="email"
                placeholder="example@mail.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์ (ทางเลือก)</label>
              <input
                type="text"
                name="phone"
                placeholder="08xxxxxxxx"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="border-t pt-4 my-2">
            <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 animate-bounce" /> ข้อมูลประวัติความประพฤติเสีย
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">หมวดหมู่ความผิด</label>
              <select
                name="reason_category"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.reason_category}
                onChange={handleInputChange}
              >
                <option value="theft">ขโมยทรัพย์สิน (Theft)</option>
                <option value="policy_violation">ผิดกฏระเบียบบริษัท (Policy Violation)</option>
                <option value="attendance">ขาดงาน/ละทิ้งหน้าที่ (Attendance Issues)</option>
                <option value="harassment">ล่วงละเมิด/ทะเลาะวิวาท (Harassment)</option>
                <option value="fraud">ทุจริต/ปลอมแปลงเอกสาร (Fraud)</option>
                <option value="other">อื่นๆ (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ระดับความรุนแรง</label>
              <select
                name="severity_level"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.severity_level}
                onChange={handleInputChange}
              >
                <option value="high">รุนแรงสูง (High - ห้ามรับสมัครเด็ดขาด)</option>
                <option value="medium">ปานกลาง (Medium - เฝ้าระวังความซื่อสัตย์)</option>
                <option value="low">ต่ำ (Low - ละทิ้งงาน/ตักเตือน)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Business Unit (BU) เดิม</label>
              <input
                type="text"
                name="original_bu"
                placeholder="BU1, Food, Retail"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.original_bu}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">แผนกที่พบเหตุ</label>
              <input
                type="text"
                name="original_department"
                placeholder="การขนส่ง, คลังสินค้า"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.original_department}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่พ้นสภาพ/เกิดเหตุ</label>
              <input
                type="date"
                name="incident_date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.incident_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">สถานะของบัญชี</label>
              <select
                name="status"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">เปิดใช้งาน (เฝ้าระวัง)</option>
                <option value="inactive">ปิดใช้งาน (ละเว้นประวัติ)</option>
              </select>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="border-t pt-4 my-2">
            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-indigo-600" /> แนบเอกสารหลักฐาน (สูงสุด 2 ไฟล์)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">หลักฐาน 1 (รูปภาพ/PDF)</label>
                {formData.attachment_url_1 ? (
                  <div className="flex items-center justify-between border rounded-lg p-2 bg-gray-50 text-xs">
                    <span className="truncate max-w-[120px] font-medium" title={formData.attachment_name_1}>
                      {formData.attachment_name_1}
                    </span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setFormData(p => ({ ...p, attachment_url_1: '', attachment_name_1: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed rounded-lg p-2 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      disabled={isUploading1}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 1);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {isUploading1 ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ 1'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">หลักฐาน 2 (รูปภาพ/PDF)</label>
                {formData.attachment_url_2 ? (
                  <div className="flex items-center justify-between border rounded-lg p-2 bg-gray-50 text-xs">
                    <span className="truncate max-w-[120px] font-medium" title={formData.attachment_name_2}>
                      {formData.attachment_name_2}
                    </span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setFormData(p => ({ ...p, attachment_url_2: '', attachment_name_2: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed rounded-lg p-2 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      disabled={isUploading2}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 2);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {isUploading2 ? 'กำลังอัปโหลด...' : 'เลือกไฟล์ 2'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">รายละเอียดพฤติกรรม</label>
            <textarea
              name="description"
              rows={3}
              placeholder="รายละเอียดเหตุการณ์เชิงลึกที่เกิดขึ้น..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white shadow" 
              type="submit"
              disabled={isUploading1 || isUploading2}
            >
              บันทึกข้อมูล
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Entry Modal */}
      <Modal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="แก้ไขประวัติเสีย / Blacklist"
        footer={null}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อ *</label>
              <input
                type="text"
                name="first_name"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">นามสกุล *</label>
              <input
                type="text"
                name="last_name"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">เลขประจำตัวประชาชน *</label>
              <input
                type="text"
                name="national_id"
                maxLength={13}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.national_id}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">เลขหนังสือเดินทาง (Passport No)</label>
              <input
                type="text"
                name="passport_no"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.passport_no}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">อีเมลติดต่อ</label>
              <input
                type="email"
                name="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                name="phone"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="border-t pt-4 my-2">
            <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> ประวัติความประพฤติเสีย
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">หมวดหมู่ความผิด</label>
              <select
                name="reason_category"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.reason_category}
                onChange={handleInputChange}
              >
                <option value="theft">ขโมยทรัพย์สิน (Theft)</option>
                <option value="policy_violation">ผิดกฏระเบียบบริษัท (Policy Violation)</option>
                <option value="attendance">ขาดงาน/ละทิ้งหน้าที่ (Attendance Issues)</option>
                <option value="harassment">ล่วงละเมิด/ทะเลาะวิวาท (Harassment)</option>
                <option value="fraud">ทุจริต/ปลอมแปลงเอกสาร (Fraud)</option>
                <option value="other">อื่นๆ (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ระดับความรุนแรง</label>
              <select
                name="severity_level"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.severity_level}
                onChange={handleInputChange}
              >
                <option value="high">รุนแรงสูง (High - ห้ามรับสมัครเด็ดขาด)</option>
                <option value="medium">ปานกลาง (Medium - เฝ้าระวังความซื่อสัตย์)</option>
                <option value="low">ต่ำ (Low - ละทิ้งงาน/เตือนก่อนดำเนินการ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Business Unit (BU) เดิม</label>
              <input
                type="text"
                name="original_bu"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.original_bu}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">แผนกที่พบเหตุ</label>
              <input
                type="text"
                name="original_department"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.original_department}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่พ้นสภาพ/เกิดเหตุ</label>
              <input
                type="date"
                name="incident_date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.incident_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">สถานะของบัญชี</label>
              <select
                name="status"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">เปิดใช้งาน (เฝ้าระวัง)</option>
                <option value="inactive">ปิดใช้งาน (ละเว้นประวัติ)</option>
              </select>
            </div>
          </div>

          {/* Edit Attachments Section */}
          <div className="border-t pt-4 my-2">
            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-indigo-600" /> เอกสารหลักฐานประกอบประวัติเสีย
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">หลักฐาน 1 (รูปภาพ/PDF)</label>
                {formData.attachment_url_1 ? (
                  <div className="flex items-center justify-between border rounded-lg p-2 bg-gray-50 text-xs">
                    <a 
                      href={formData.attachment_url_1} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate max-w-[100px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {formData.attachment_name_1 || 'คลิกเพื่อเปิดดู'}
                    </a>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setFormData(p => ({ ...p, attachment_url_1: '', attachment_name_1: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed rounded-lg p-2 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      disabled={isUploading1}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 1);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {isUploading1 ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์ 1'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">หลักฐาน 2 (รูปภาพ/PDF)</label>
                {formData.attachment_url_2 ? (
                  <div className="flex items-center justify-between border rounded-lg p-2 bg-gray-50 text-xs">
                    <a 
                      href={formData.attachment_url_2} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="truncate max-w-[100px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {formData.attachment_name_2 || 'คลิกเพื่อเปิดดู'}
                    </a>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setFormData(p => ({ ...p, attachment_url_2: '', attachment_name_2: '' }))}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed rounded-lg p-2 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.png,.pdf"
                      disabled={isUploading2}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 2);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-medium">
                      {isUploading2 ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์ 2'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">รายละเอียดพฤติกรรม</label>
            <textarea
              name="description"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => setEditingEntry(null)}>ยกเลิก</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white shadow" 
              type="submit"
              disabled={isUploading1 || isUploading2}
            >
              บันทึกการเปลี่ยนแปลง
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(null)}
        title="ลบประวัติ Blacklist"
        footer={null}
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">ต้องการลบประวัตินี้ใช่หรือไม่?</h3>
            <p className="text-gray-500 text-sm">
              คุณกำลังจะลบประวัติของ <strong>{isDeleteConfirmOpen?.first_name} {isDeleteConfirmOpen?.last_name}</strong> ออกจากระบบ Blacklist อย่างถาวร
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(null)}>ยกเลิก</Button>
            <Button variant="danger" onClick={handleDeleteSubmit}>ใช่, ลบประวัติออก</Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => { setIsImportOpen(false); setCsvFile(null); setImportPreview([]); }}
        title="นำเข้าข้อมูล Blacklist ผ่านไฟล์ CSV"
        footer={null}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-gray-50">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleCsvChange}
            />
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">คลิกที่นี่หรือลากไฟล์ CSV มาเพื่ออัปโหลด</p>
            <p className="text-xs text-gray-400 mt-1">ขนาดสูงสุด 5MB เฉพาะไฟล์สกุล .csv</p>
            {csvFile && (
              <div className="mt-3 px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full inline-flex items-center gap-1">
                {csvFile.name} <X className="w-3.5 h-3.5 cursor-pointer hover:bg-red-200 rounded-full" onClick={(e) => { e.stopPropagation(); setCsvFile(null); setImportPreview([]); }} />
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg leading-relaxed">
            <p className="font-bold text-gray-700 mb-1">💡 รูปแบบหัวตารางคอลัมน์ (Headers) ที่ระบบรองรับ:</p>
            <p><code className="bg-white px-1 py-0.5 rounded border">first_name</code>, <code className="bg-white px-1 py-0.5 rounded border">last_name</code>, <code className="bg-white px-1 py-0.5 rounded border">national_id</code>, <code className="bg-white px-1 py-0.5 rounded border">passport_no</code>, <code className="bg-white px-1 py-0.5 rounded border">reason_category</code>, <code className="bg-white px-1 py-0.5 rounded border">severity_level</code></p>
          </div>

          {importPreview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1">ตัวอย่างข้อมูล (5 แถวแรก):</p>
              <div className="border rounded-lg overflow-x-auto text-[11px] max-h-40">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {importHeaders.slice(0, 5).map((h, i) => <th key={i} className="px-2 py-1.5 border-b">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {importPreview.map((row, i) => (
                      <tr key={i}>
                        {importHeaders.slice(0, 5).map((h, idx) => (
                          <td key={idx} className="px-2 py-1 border-b text-gray-600 truncate max-w-[120px]">{row[h] || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => { setIsImportOpen(false); setCsvFile(null); setImportPreview([]); }}>ยกเลิก</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1" 
              onClick={handleImportSubmit}
              disabled={!csvFile}
            >
              <CheckCircle className="w-4 h-4" /> เริ่มนำเข้าข้อมูล
            </Button>
          </div>
        </div>
      </Modal>

      {/* Viewing Files Modal */}
      <Modal
        isOpen={!!viewingFilesEntry}
        onClose={() => setViewingFilesEntry(null)}
        title="เอกสารหลักฐานของ Blacklist"
        footer={null}
      >
        {viewingFilesEntry && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">
              <p className="font-semibold text-gray-900">{viewingFilesEntry.first_name} {viewingFilesEntry.last_name}</p>
              <p className="text-xs text-gray-500 mt-1">ข้อหา: {getReasonLabel(viewingFilesEntry.reason_category)}</p>
            </div>
            
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-700">รายการไฟล์แนบ:</label>
              
              {viewingFilesEntry.attachment_url_1 && (
                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span className="truncate max-w-[200px]" title={viewingFilesEntry.attachment_name_1}>
                      {viewingFilesEntry.attachment_name_1 || 'ไฟล์หลักฐาน 1'}
                    </span>
                  </div>
                  <a
                    href={viewingFilesEntry.attachment_url_1}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors border border-indigo-200"
                  >
                    <Eye className="w-3.5 h-3.5" /> เปิดอ่าน
                  </a>
                </div>
              )}

              {viewingFilesEntry.attachment_url_2 && (
                <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span className="truncate max-w-[200px]" title={viewingFilesEntry.attachment_name_2}>
                      {viewingFilesEntry.attachment_name_2 || 'ไฟล์หลักฐาน 2'}
                    </span>
                  </div>
                  <a
                    href={viewingFilesEntry.attachment_url_2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors border border-indigo-200"
                  >
                    <Eye className="w-3.5 h-3.5" /> เปิดอ่าน
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setViewingFilesEntry(null)}>ปิดหน้าต่าง</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
