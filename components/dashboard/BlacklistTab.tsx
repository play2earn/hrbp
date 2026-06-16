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
  Lock,
  ChevronLeft,
  ChevronRight
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
  const [importRows, setImportRows] = useState<any[]>([]);

  // Business Units from master data
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);

  // Pagination State
  const [rosterPage, setRosterPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  // Fetch Business Units on mount
  useEffect(() => {
    const fetchBUs = async () => {
      const data = await api.master.getBusinessUnits();
      if (data) {
        setBusinessUnits(data);
      }
    };
    fetchBUs();
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setRosterPage(1);
  }, [searchTerm, severityFilter, categoryFilter]);

  useEffect(() => {
    setAuditPage(1);
  }, [searchTerm]);

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

  // Download CSV template
  const downloadCsvTemplate = () => {
    const headers = [
      'first_name', 'last_name', 'national_id', 'passport_no', 'email', 'phone', 
      'reason_category', 'severity_level', 'original_bu', 'original_department', 
      'incident_date', 'description'
    ];
    const sampleRows = [
      ['สมชาย', 'ใจดี', '1100100000000', '', 'somchai@email.com', '0812345678', 'policy_violation', 'high', 'DoubleA', 'Warehouse', '2026-05-15', 'ทำผิดกฎระเบียบร้ายแรง'],
      ['John', 'Doe', '', 'A12345678', 'john.doe@email.com', '0899999999', 'theft', 'high', 'NPS', 'Sales', '2026-06-01', 'ขโมยทรัพย์สินบริษัท']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Add UTF-8 BOM so Excel opens it with correct Thai encoding
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'blacklist_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลด Template เรียบร้อยแล้ว', 'success');
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
        const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
        setImportHeaders(headers);

        const parsedData = lines.slice(1).map((line, idx) => {
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^["']|["']$/g, '').trim());
          const obj: any = { id: `temp-${idx}-${Date.now()}` };
          headers.forEach((h, index) => {
            obj[h] = values[index] || '';
          });

          // Normalize / Guess reason_category
          let catRaw = (obj.reason_category || obj['หมวดหมู่ความผิด'] || '').toLowerCase().trim();
          let guessedCat = 'policy_violation';
          if (catRaw.includes('theft') || catRaw.includes('ขโมย') || catRaw.includes('ลักทรัพย์')) {
            guessedCat = 'theft';
          } else if (catRaw.includes('policy') || catRaw.includes('ระเบียบ') || catRaw.includes('กฎ')) {
            guessedCat = 'policy_violation';
          } else if (catRaw.includes('attend') || catRaw.includes('ขาดงาน') || catRaw.includes('ละทิ้ง')) {
            guessedCat = 'attendance';
          } else if (catRaw.includes('harass') || catRaw.includes('ล่วงละเมิด') || catRaw.includes('ทะเลาะ') || catRaw.includes('วิวาท')) {
            guessedCat = 'harassment';
          } else if (catRaw.includes('fraud') || catRaw.includes('ทุจริต') || catRaw.includes('โกง') || catRaw.includes('ปลอม')) {
            guessedCat = 'fraud';
          } else if (catRaw.includes('other') || catRaw.includes('อื่น')) {
            guessedCat = 'other';
          } else if (catRaw) {
            guessedCat = 'unmapped'; // Show highlighted warning for unrecognized values
          }
          obj.reason_category = guessedCat;

          // Normalize / Guess severity_level
          let sevRaw = (obj.severity_level || obj['ระดับความรุนแรง'] || '').toLowerCase().trim();
          let guessedSev = 'high';
          if (sevRaw.includes('high') || sevRaw.includes('สูง') || sevRaw.includes('ห้าม')) {
            guessedSev = 'high';
          } else if (sevRaw.includes('med') || sevRaw.includes('กลาง')) {
            guessedSev = 'medium';
          } else if (sevRaw.includes('low') || sevRaw.includes('ต่ำ')) {
            guessedSev = 'low';
          } else if (sevRaw) {
            guessedSev = 'unmapped';
          }
          obj.severity_level = guessedSev;

          // Normalize basic information columns
          obj.first_name = obj.first_name || obj['ชื่อ'] || obj.firstname || '';
          obj.last_name = obj.last_name || obj['นามสกุล'] || obj.lastname || '';
          obj.national_id = obj.national_id || obj['เลขบัตรประชาชน'] || obj.nationalid || '';
          obj.passport_no = obj.passport_no || obj['เลขพาสปอร์ต'] || obj.passportno || '';
          obj.email = obj.email || obj['อีเมล'] || '';
          obj.phone = obj.phone || obj['เบอร์โทร'] || '';
          obj.original_bu = obj.original_bu || obj['buเดิม'] || '';
          obj.original_department = obj.original_department || obj['แผนกเดิม'] || '';
          obj.incident_date = obj.incident_date || obj['วันที่เกิดเหตุ'] || '';
          obj.description = obj.description || obj['รายละเอียด'] || '';

          return obj;
        });

        setImportRows(parsedData);
      }
    };
    reader.readAsText(file);
  };

  const handleImportRowChange = (id: string, field: string, value: string) => {
    setImportRows(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleRemoveImportRow = (id: string) => {
    setImportRows(prev => prev.filter(row => row.id !== id));
  };

  const handleImportSubmit = async () => {
    if (importRows.length === 0) {
      showToast('ไม่มีข้อมูลที่จะนำเข้า', 'error');
      return;
    }

    // Validate no unmapped selectors
    const hasUnmapped = importRows.some(row => row.reason_category === 'unmapped' || row.severity_level === 'unmapped');
    if (hasUnmapped) {
      showToast('กรุณาระบุหมวดหมู่ความผิดและระดับความรุนแรงให้ถูกต้องทุกแถวก่อนทำการนำเข้า', 'error');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of importRows) {
      if (!row.first_name || !row.last_name || (!row.national_id && !row.passport_no)) {
        failCount++;
        continue;
      }

      const entryPayload = {
        first_name: row.first_name,
        last_name: row.last_name,
        national_id: row.national_id ? row.national_id.trim() : null,
        passport_no: row.passport_no ? row.passport_no.trim().toUpperCase() : null,
        email: row.email ? row.email.trim().toLowerCase() : null,
        phone: row.phone ? row.phone.trim() : null,
        reason_category: row.reason_category as any,
        severity_level: row.severity_level as any,
        description: row.description,
        original_bu: row.original_bu,
        original_department: row.original_department,
        incident_date: row.incident_date || null,
        status: 'active' as const,
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
      details: `นำเข้าข้อมูลประวัติเสียแบบกลุ่ม (Smart Bulk Import CSV) สำเร็จ ${successCount} รายการ, ข้าม ${failCount} รายการ`
    });

    showToast(`นำเข้าสำเร็จ ${successCount} รายการ, ล้มเหลว ${failCount} รายการ`, successCount > 0 ? 'success' : 'error');
    setIsImportOpen(false);
    setCsvFile(null);
    setImportRows([]);
    fetchEntries();
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
              <>
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
                      {filteredEntries.slice((rosterPage - 1) * 25, rosterPage * 25).map(entry => (
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

                {/* Pagination Controls */}
                {Math.ceil(filteredEntries.length / 25) > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <Button
                        variant="outline"
                        onClick={() => setRosterPage(p => Math.max(p - 1, 1))}
                        disabled={rosterPage === 1}
                        className="text-xs"
                      >
                        ก่อนหน้า
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setRosterPage(p => Math.min(p + 1, Math.ceil(filteredEntries.length / 25)))}
                        disabled={rosterPage === Math.ceil(filteredEntries.length / 25)}
                        className="text-xs"
                      >
                        ถัดไป
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-700">
                          แสดงรายการที่ <span className="font-semibold">{(rosterPage - 1) * 25 + 1}</span> ถึง <span className="font-semibold">{Math.min(rosterPage * 25, filteredEntries.length)}</span> จากทั้งหมด <span className="font-semibold">{filteredEntries.length}</span> รายการ
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setRosterPage(p => Math.max(p - 1, 1))}
                            disabled={rosterPage === 1}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          {Array.from({ length: Math.ceil(filteredEntries.length / 25) }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setRosterPage(i + 1)}
                              className={`relative inline-flex items-center px-3.5 py-2 text-sm font-semibold border ${
                                rosterPage === i + 1
                                  ? 'z-10 bg-red-600 text-white border-red-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setRosterPage(p => Math.min(p + 1, Math.ceil(filteredEntries.length / 25)))}
                            disabled={rosterPage === Math.ceil(filteredEntries.length / 25)}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
              <>
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
                      {filteredAuditLogs.slice((auditPage - 1) * 25, auditPage * 25).map(log => {
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

                {/* Audit Logs Pagination Controls */}
                {Math.ceil(filteredAuditLogs.length / 25) > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <Button
                        variant="outline"
                        onClick={() => setAuditPage(p => Math.max(p - 1, 1))}
                        disabled={auditPage === 1}
                        className="text-xs"
                      >
                        ก่อนหน้า
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setAuditPage(p => Math.min(p + 1, Math.ceil(filteredAuditLogs.length / 25)))}
                        disabled={auditPage === Math.ceil(filteredAuditLogs.length / 25)}
                        className="text-xs"
                      >
                        ถัดไป
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs text-gray-700">
                          แสดงรายการที่ <span className="font-semibold">{(auditPage - 1) * 25 + 1}</span> ถึง <span className="font-semibold">{Math.min(auditPage * 25, filteredAuditLogs.length)}</span> จากทั้งหมด <span className="font-semibold">{filteredAuditLogs.length}</span> รายการ
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setAuditPage(p => Math.max(p - 1, 1))}
                            disabled={auditPage === 1}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          {Array.from({ length: Math.ceil(filteredAuditLogs.length / 25) }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setAuditPage(i + 1)}
                              className={`relative inline-flex items-center px-3.5 py-2 text-sm font-semibold border ${
                                auditPage === i + 1
                                  ? 'z-10 bg-red-600 text-white border-red-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setAuditPage(p => Math.min(p + 1, Math.ceil(filteredAuditLogs.length / 25)))}
                            disabled={auditPage === Math.ceil(filteredAuditLogs.length / 25)}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
              <select
                name="original_bu"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                value={formData.original_bu}
                onChange={handleInputChange}
              >
                <option value="">-- เลือก Business Unit --</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id || bu.name} value={bu.name}>
                    {bu.name}
                  </option>
                ))}
              </select>
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
              <select
                name="original_bu"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                value={formData.original_bu}
                onChange={handleInputChange}
              >
                <option value="">-- เลือก Business Unit --</option>
                {businessUnits.map((bu) => (
                  <option key={bu.id || bu.name} value={bu.name}>
                    {bu.name}
                  </option>
                ))}
              </select>
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
        onClose={() => { setIsImportOpen(false); setCsvFile(null); setImportRows([]); }}
        title="นำเข้าข้อมูล Blacklist ผ่านไฟล์ CSV"
        size="2xl"
        footer={null}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">คู่มือการนำเข้าไฟล์ข้อมูล</p>
                <p className="text-xs text-red-700 leading-normal mt-0.5">
                  กรุณาเตรียมโครงสร้างคอลัมน์ของไฟล์ CSV ให้ตรงตามที่ระบบกำหนดเพื่อหลีกเลี่ยงข้อผิดพลาด
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs text-red-700 border-red-200 hover:bg-red-100 bg-white"
              onClick={downloadCsvTemplate}
            >
              <Download className="w-3.5 h-3.5" /> โหลด CSV Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-gray-50">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleCsvChange}
            />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">คลิกที่นี่หรือลากไฟล์ CSV มาเพื่อโหลดข้อมูล</p>
            <p className="text-xs text-gray-400 mt-1">ขนาดสูงสุด 5MB เฉพาะไฟล์สกุล .csv</p>
            {csvFile && (
              <div className="mt-3 px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs rounded-full inline-flex items-center gap-1">
                {csvFile.name} 
                <X 
                  className="w-3.5 h-3.5 cursor-pointer hover:bg-red-200 rounded-full" 
                  onClick={(e) => { e.stopPropagation(); setCsvFile(null); setImportRows([]); }} 
                />
              </div>
            )}
          </div>

          {importRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">ตรวจสอบความถูกต้องและตั้งค่าตัวเลือก (ทั้งหมด {importRows.length} รายการ):</p>
                <button
                  type="button"
                  onClick={() => setImportRows([])}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-0.5"
                >
                  <X className="w-3.5 h-3.5" /> ล้างข้อมูลทั้งหมด
                </button>
              </div>

              <div className="border rounded-xl overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 sticky top-0 border-b text-gray-700 font-semibold z-10">
                    <tr>
                      <th className="px-3 py-2 border-b w-12 text-center">#</th>
                      <th className="px-3 py-2 border-b">ชื่อ-นามสกุล</th>
                      <th className="px-3 py-2 border-b">ข้อมูลระบุตัวตน (ID/Passport)</th>
                      <th className="px-3 py-2 border-b w-44">หมวดหมู่ความผิด *</th>
                      <th className="px-3 py-2 border-b w-44">ระดับความรุนแรง *</th>
                      <th className="px-3 py-2 border-b w-12 text-center">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {importRows.map((row, idx) => {
                      const hasIdentityError = !row.first_name || !row.last_name || (!row.national_id && !row.passport_no);
                      const isCatUnmapped = row.reason_category === 'unmapped';
                      const isSevUnmapped = row.severity_level === 'unmapped';

                      return (
                        <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors ${hasIdentityError ? 'bg-red-50/30' : ''}`}>
                          <td className="px-3 py-2 text-center text-gray-500 font-medium">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="font-semibold text-gray-900">{row.first_name || '-'} {row.last_name || '-'}</div>
                            {hasIdentityError && (
                              <div className="text-[10px] text-red-600 font-semibold mt-0.5">⚠️ ข้อมูลประจำตัวไม่ครบถ้วน (ต้องการชื่อ-สกุล และ ID หรือ Passport)</div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.national_id && <div>บัตรประชาชน: <span className="font-mono">{row.national_id}</span></div>}
                            {row.passport_no && <div>พาสปอร์ต: <span className="font-mono">{row.passport_no}</span></div>}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.reason_category}
                              onChange={(e) => handleImportRowChange(row.id, 'reason_category', e.target.value)}
                              className={`w-full border rounded px-2 py-1 bg-white text-xs ${
                                isCatUnmapped ? 'border-red-500 bg-red-50 text-red-900 font-bold focus:ring-red-500' : 'border-gray-300'
                              }`}
                            >
                              {isCatUnmapped && <option value="unmapped">⚠️ เลือกความผิด... *</option>}
                              <option value="theft">ขโมยทรัพย์สิน (Theft)</option>
                              <option value="policy_violation">ผิดกฏระเบียบบริษัท (Policy)</option>
                              <option value="attendance">ขาดงาน/ละทิ้งหน้าที่ (Attendance)</option>
                              <option value="harassment">ล่วงละเมิด/ทะเลาะวิวาท (Harassment)</option>
                              <option value="fraud">ทุจริต/ปลอมเอกสาร (Fraud)</option>
                              <option value="other">อื่นๆ (Other)</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.severity_level}
                              onChange={(e) => handleImportRowChange(row.id, 'severity_level', e.target.value)}
                              className={`w-full border rounded px-2 py-1 bg-white text-xs ${
                                isSevUnmapped ? 'border-red-500 bg-red-50 text-red-900 font-bold focus:ring-red-500' : 'border-gray-300'
                              }`}
                            >
                              {isSevUnmapped && <option value="unmapped">⚠️ เลือกระดับ... *</option>}
                              <option value="high">รุนแรงสูง (High)</option>
                              <option value="medium">ปานกลาง (Medium)</option>
                              <option value="low">ต่ำ (Low)</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImportRow(row.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => { setIsImportOpen(false); setCsvFile(null); setImportRows([]); }}>ยกเลิก</Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1" 
              onClick={handleImportSubmit}
              disabled={importRows.length === 0}
            >
              <CheckCircle className="w-4 h-4" /> เริ่มนำเข้าข้อมูล ({importRows.length} รายการ)
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
