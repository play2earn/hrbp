
import React, { useState, useEffect } from 'react';
import { MOCK_BU } from '../constants';
import { Card, Button, Input, Select, Modal } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LucideIcon, Home, FileText, QrCode, Settings, LogOut, CheckCircle, XCircle, Search, Filter, Download, ExternalLink, Calendar, Menu, X, ChevronRight, ChevronLeft, ChevronDown, User, Shield, Users, Copy, Check, Database, Plus, Edit, Trash2, Building2, Tag, GraduationCap, MapPin, Phone, UserPlus, UserCheck, History, Clock, ArrowRightLeft, BarChart2 } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../supabaseClient';
import { Role } from '../types';
import type { ApplicationStatus } from '../services/api';
import { ReportsTab } from './ReportsTab';

import type { DashboardProps } from './dashboard/dashboardTypes';
import {
  COLORS, BU_COLOR_MAP, BU_FALLBACK_COLORS, BU_COLORS,
  LOG_LABELS, STATUS_LABELS,
  getBuChartColor, getBuColor, getStatusLabel, getStatusBadgeClass,
  isInterviewScheduledStatus, isClosedStatus, getMilitaryStatusLabel
} from './dashboard/dashboardConstants';
import { ApplicationDetailModal } from './dashboard/ApplicationDetailModal';
import { ApplicationEditModal } from './dashboard/ApplicationEditModal';
import { ApplicationActionModals } from './dashboard/ApplicationActionModals';
import { OverviewTab } from './dashboard/OverviewTab';
import { QRGeneratorTab } from './dashboard/QRGeneratorTab';
import { UserManagementTab } from './dashboard/UserManagementTab';


export const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'qr' | 'settings' | 'config' | 'profile'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Current User Info
  const [currentUser, setCurrentUser] = useState<{ id?: string; full_name: string; email: string; role: string; emp_id?: string } | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profileEmpId, setProfileEmpId] = useState<string | null>(null);

  // Data State
  const [applications, setApplications] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null); // For Edit Modal
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewing: 0, interviewing: 0, hired: 0, rejected: 0 });
  const [isConfirmingDisable, setIsConfirmingDisable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add New User State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ full_name: '', email: '', phone: '', role: 'mod', emp_id: '', hrms_username: '' });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // QR Generator State
  const [qrParams, setQrParams] = useState({ bu: '', ch: '', tag: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [qrLogs, setQrLogs] = useState<any[]>([]);
  const [qrLogCreatorFilter, setQrLogCreatorFilter] = useState<string>('all');
  const [confirmQrAction, setConfirmQrAction] = useState<'empty' | 'filled' | null>(null);

  // Applications Table State
  const [appFilters, setAppFilters] = useState({
    search: '',
    position: '',
    bu: '',
    channel: '',
    status: 'all',
    assignment: 'all'
  });
  const [appPage, setAppPage] = useState(1);
  const [appPerPage, setAppPerPage] = useState(25);
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [claimingApp, setClaimingApp] = useState<any | null>(null);
  const [unassigningApp, setUnassigningApp] = useState<any | null>(null);
  const [transferringApp, setTransferringApp] = useState<any | null>(null);
  const [transferTarget, setTransferTarget] = useState('');
  const [rejectingApp, setRejectingApp] = useState<any | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [closeReasons, setCloseReasons] = useState<any[]>([]);
  const [approvingApp, setApprovingApp] = useState<any | null>(null);
  const [interviewingApp, setInterviewingApp] = useState<any | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [deletingApp, setDeletingApp] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMenu, setActionMenu] = useState<{ id: string; x: number; y: number; openUp: boolean } | null>(null);
  const openActionMenu = (appId: string, e: React.MouseEvent) => {
    if (actionMenu?.id === appId) { setActionMenu(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const openUp = rect.bottom + 250 > window.innerHeight;
    setActionMenu({ id: appId, x: rect.right, y: openUp ? rect.top : rect.bottom + 4, openUp });
  };
  const [appLogs, setAppLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    position: '',
    department: '',
    departmentId: 0,
    expectedSalary: '',
    phone: '',
    email: '',
    status: '',
    businessUnit: '',
    sourceChannel: '',
    campaignTag: '',
    height: '',
    weight: '',
    dateOfBirth: '',
    age: '',
    photoUrl: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFilteredPositions, setEditFilteredPositions] = useState<any[]>([]);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  // Helper: current user display name & ID
  const currentUserName = currentUser?.full_name || 'Unknown';
  const currentUserId = currentUser?.id || (() => {
    try {
      const stored = localStorage.getItem('currentUser');
      return stored ? JSON.parse(stored).id : null;
    } catch { return null; }
  })();

  // Profile photo fallback chain: IDMS API → Intranet empimages → WMS Face API → Initials
  const handleProfilePhotoError = () => {
    if (!profileEmpId) { setProfilePhotoUrl(null); return; }
    const fallbackUrls = [
      `https://wms.advanceagro.net/WSVIS/api/Face/GetImage?CardID=${profileEmpId}`,
    ];
    const nextUrl = fallbackUrls.find(url => url !== profilePhotoUrl && !profilePhotoUrl?.startsWith('blob:'));
    if (nextUrl && profilePhotoUrl !== nextUrl) {
      // Check if we already tried a fallback that's earlier in the list
      const currentIndex = fallbackUrls.indexOf(profilePhotoUrl || '');
      const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
      if (nextIndex < fallbackUrls.length) {
        setProfilePhotoUrl(fallbackUrls[nextIndex]);
      } else {
        setProfilePhotoUrl(null);
      }
    } else {
      setProfilePhotoUrl(null);
    }
  };

  // Initialize edit form when editingApp changes
  useEffect(() => {
    if (editingApp) {
      const fd = editingApp.form_data || {};
      // Find department ID from name
      const dept = departments.find((d: any) => (d.name_th || d.name) === (fd.department || editingApp.department));
      setEditForm({
        position: fd.position || editingApp.position || '',
        department: fd.department || editingApp.department || '',
        departmentId: dept?.id || 0,
        expectedSalary: fd.expectedSalary || '',
        phone: fd.phone || editingApp.phone || '',
        email: fd.email || editingApp.email || '',
        status: editingApp.status || 'Pending',
        businessUnit: fd.businessUnit || editingApp.business_unit || '',
        sourceChannel: fd.sourceChannel || editingApp.source_channel || '',
        campaignTag: fd.campaignTag || editingApp.campaign_tag || '',
        height: fd.height || '',
        weight: fd.weight || '',
        dateOfBirth: fd.dateOfBirth || '',
        age: fd.age || '',
        photoUrl: fd.photoUrl || editingApp.photo_url || '',
      });
    }
  }, [editingApp, departments]);

  // Load positions when department changes in edit form
  useEffect(() => {
    const loadFilteredPositions = async () => {
      if (editForm.departmentId > 0) {
        const posData = await api.master.getPositions(editForm.departmentId);
        setEditFilteredPositions(posData || []);
      } else {
        setEditFilteredPositions([]);
      }
    };
    loadFilteredPositions();
  }, [editForm.departmentId]);

  // Fetch activity logs when viewing an application
  useEffect(() => {
    if (viewingApp) {
      setIsLoadingLogs(true);
      api.getApplicationLogs(viewingApp.id).then(logs => {
        setAppLogs(logs);
        setIsLoadingLogs(false);
      });
    } else {
      setAppLogs([]);
    }
  }, [viewingApp]);

  // Helper to open full preview in new tab
  const openFullPreview = (app: any) => {
    const fd = app.form_data || {};
    const previewData = JSON.stringify(fd);
    localStorage.setItem('previewData', previewData);
    window.open('/preview', '_blank');
  };

  useEffect(() => {
    // Load current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }

    fetchData();
    fetchQrMasterData();
    api.reports.getCloseReasons().then(setCloseReasons);

    // Fetch profile photo from IDMS, fallback to intranet empimages
    const empId = storedUser ? (() => { try { return JSON.parse(storedUser).emp_id; } catch { return null; } })() : null;
    if (empId) {
      setProfileEmpId(empId);
      fetch(`https://api-idms.advanceagro.net/hrms/employee/${empId}/photocard/?size=120`)
        .then(res => {
          if (!res.ok) throw new Error('Photo not found');
          return res.blob();
        })
        .then(blob => {
          // Validate: must be an image and have actual content (> 500 bytes to filter empty/error responses)
          if (blob.size < 500) throw new Error('Photo too small, likely invalid');
          const imageBlob = blob.type && blob.type.startsWith('image/')
            ? blob
            : new Blob([blob], { type: 'image/jpeg' }); // Force MIME if server doesn't set it
          const url = URL.createObjectURL(imageBlob);
          setProfilePhotoUrl(url);
        })
        .catch(err => {
          console.warn('IDMS photo unavailable, trying WMS fallback:', err.message);
          // Fallback #2: WMS Face API
          setProfilePhotoUrl(`https://wms.advanceagro.net/WSVIS/api/Face/GetImage?CardID=${empId}`);
        });
    }
    fetchQrLogs();
    if (role === 'admin') {
      fetchPendingUsers();
      fetchActiveUsers();
    }
  }, [role]);

  const fetchQrMasterData = async () => {
    const [chData, buData, posData, deptData] = await Promise.all([
      api.master.getAll('channels'),
      api.master.getBusinessUnits(),
      api.master.getAll('positions'),
      api.master.getAll('departments')
    ]);
    setChannels(chData.data || []);
    setBusinessUnits(buData || []);
    setPositions(posData.data || []);
    setDepartments(deptData.data || []);
  };

  const fetchData = async () => {
    setLoading(true);
    const data = await api.getApplications();
    setApplications(data);

    // Calculate simple stats
    const total = data.length;
    const pending = data.filter((a: any) => a.status === 'Pending').length;
    const reviewing = data.filter((a: any) => a.status === 'Reviewing').length;
    const interviewing = data.filter((a: any) => isInterviewScheduledStatus(a.status) || a.status === 'Interviewed' || a.status === 'Offer').length;
    const hired = data.filter((a: any) => a.status === 'Hired').length;
    const rejected = data.filter((a: any) => a.status === 'Rejected' || a.status === 'Withdrawn' || a.status === 'NoShow').length;

    setStats({ total, pending, reviewing, interviewing, hired, rejected });
    setLoading(false);
  };

  const fetchPendingUsers = async () => {
    const { data } = await api.auth.getPendingUsers();
    if (data) setPendingUsers(data);
  };

  const fetchActiveUsers = async () => {
    const { data } = await api.auth.getActiveUsers();
    if (data) setActiveUsers(data);
  };

  const handleUserAction = async (id: string, status: 'Active' | 'Rejected' | 'Inactive') => {
    await api.auth.updateUserStatus(id, status);
    fetchPendingUsers();
    fetchActiveUsers();
  };

  const handleUpdateUser = async (status: 'Active' | 'Rejected' | 'Inactive') => {
    if (!editingUser) return;
    await api.auth.updateUserStatus(editingUser.id, status);
    await api.auth.updateUserStatus(editingUser.id, status);
    setEditingUser(null);
    setIsConfirmingDisable(false);
    fetchActiveUsers();
    fetchPendingUsers();
  };

  const handleAppAction = async (id: string, status: string) => {
    if (!currentUserId) {
      showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
      return;
    }
    const result = await api.updateApplicationStatus(id, status as any, { performedByUserId: currentUserId });
    if (!result.success) {
      showToast(result.error?.message || 'อัปเดตสถานะไม่สำเร็จ', 'error');
      return;
    }
    fetchData(); // Refresh list
  };

  const handleDeleteApplication = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    const result = await api.deleteApplication(deletingApp.id);
    setIsDeleting(false);
    setDeletingApp(null);

    if (result.success) {
      showToast('Application deleted successfully');
      fetchData(); // Refresh list
    } else {
      showToast(result.error?.message || 'Failed to delete application', 'error');
    }
  };

  const fetchQrLogs = async () => {
    const logs = await api.getQrLogs(50);
    setQrLogs(logs);
  };

  // Derived: unique creators from logs + filtered logs
  const qrLogCreators = Array.from(new Set(qrLogs.map(l => l.created_by).filter(Boolean)));
  const filteredQrLogs = qrLogCreatorFilter === 'all'
    ? qrLogs
    : qrLogs.filter(l => l.created_by === qrLogCreatorFilter);

  const generateLink = () => {
    if (!qrParams.bu || !qrParams.ch) {
      setConfirmQrAction('empty');
    } else {
      setConfirmQrAction('filled');
    }
  };

  const executeGenerateLink = async () => {
    setConfirmQrAction(null);
    const baseUrl = window.location.href.split('?')[0]; // Current base
    const params = new URLSearchParams();
    if (qrParams.bu) params.append('bu', qrParams.bu);
    if (qrParams.ch) params.append('ch', qrParams.ch);
    if (qrParams.tag) params.append('tag', qrParams.tag);

    const url = `${baseUrl}?${params.toString()}`;
    setGeneratedLink(url);
    setIsCopied(false);

    // Save to database
    await api.logQrGeneration({
      business_unit: qrParams.bu || undefined,
      channel: qrParams.ch || undefined,
      campaign_tag: qrParams.tag || undefined,
      generated_url: url,
      created_by: currentUser ? `${currentUser.full_name} (${currentUser.email})` : 'Unknown'
    });

    // Refresh logs
    fetchQrLogs();
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 mb-2 ${activeTab === id
        ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  // Prepare chart data from real applications dynamically
  const deptData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(app => {
      const bu = app.business_unit || app.form_data?.businessUnit || app.department || 'ไม่ระบุ BU';
      counts[bu] = (counts[bu] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [applications]);

  // Prepare real application trend data for the last 6 months
  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { name: string; applications: number; month: number; year: number }[] = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        name: months[d.getMonth()],
        applications: 0,
        month: d.getMonth(),
        year: d.getFullYear()
      });
    }

    applications.forEach(app => {
      if (!app.created_at) return;
      const d = new Date(app.created_at);
      const targetTarget = result.find(r => r.month === d.getMonth() && r.year === d.getFullYear());
      if (targetTarget) {
        targetTarget.applications += 1;
      }
    });

    return result;
  }, [applications]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden">

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-slate-900 text-white z-40 px-4 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">N</div>
          <span className="font-bold text-lg tracking-tight">NovaAdmin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out transform shadow-2xl
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-indigo-600 rounded-full items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors z-50"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`p-6 hidden lg:block ${sidebarCollapsed ? 'px-4' : 'p-8'}`}>
          <h1 className={`font-bold tracking-tight flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 text-2xl'}`}>
            <div className="w-10 h-10 animated-gradient rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30 shrink-0">N</div>
            {!sidebarCollapsed && <span className="text-gradient bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">NovaAdmin</span>}
          </h1>
          {!sidebarCollapsed && <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold ml-10">{role} access</p>}
        </div>

        <div className="lg:hidden p-6 bg-slate-800/50 mb-2 mt-14">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Current User</p>
          <p className="font-medium text-lg capitalize">{role}</p>
        </div>

        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <button
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="Overview"
          >
            <Users className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Overview</span>}
          </button>
          <button
            onClick={() => { setActiveTab('qr'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'qr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="QR Generator"
          >
            <QrCode className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">QR Generator</span>}
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="Reports"
          >
            <BarChart2 className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Reports</span>}
          </button>
          <button
            onClick={() => { setActiveTab('config'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="Master Data"
          >
            <Database className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Master Data</span>}
          </button>
          {role === 'admin' && (
            <button
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Settings</span>}
            </button>
          )}
          <button
            onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="Profile"
          >
            <User className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Profile</span>}
          </button>
        </nav>

        <div className={`border-t border-slate-800 bg-slate-900/80 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {/* User Info Card */}
          {currentUser && !sidebarCollapsed && (
            <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-800/60">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50 shadow-md flex-shrink-0" onError={handleProfilePhotoError} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentUser.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>
          )}
          {currentUser && sidebarCollapsed && (
            <div className="flex justify-center mb-2">
              {profilePhotoUrl ? (
                <img src={profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/50 shadow-md" onError={handleProfilePhotoError} />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          )}
          <Button
            variant="secondary"
            className={`${sidebarCollapsed ? 'w-full p-2 justify-center' : 'w-full justify-start'} bg-slate-800 hover:bg-slate-700 border border-slate-700`}
            onClick={onLogout}
            title="Log Out"
          >
            {sidebarCollapsed ? <LogOut className="w-5 h-5" /> : 'Log Out'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 w-full">
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">

          {activeTab === 'reports' && <ReportsTab />}

          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              fetchData={fetchData}
              applications={applications}
              positions={positions}
              departments={departments}
              businessUnits={businessUnits}
              channels={channels}
              appFilters={appFilters}
              setAppFilters={setAppFilters}
              appPage={appPage}
              setAppPage={setAppPage}
              appPerPage={appPerPage}
              setAppPerPage={setAppPerPage}
              actionMenu={actionMenu}
              setActionMenu={setActionMenu}
              openActionMenu={openActionMenu}
              setViewingApp={setViewingApp}
              setEditingApp={setEditingApp}
              setClaimingApp={setClaimingApp}
              setTransferringApp={setTransferringApp}
              setUnassigningApp={setUnassigningApp}
              setInterviewingApp={setInterviewingApp}
              setRejectingApp={setRejectingApp}
              setApprovingApp={setApprovingApp}
              currentUserId={currentUserId}
            />
          )}

          {activeTab === 'qr' && (
            <QRGeneratorTab
              qrParams={qrParams}
              setQrParams={setQrParams}
              businessUnits={businessUnits}
              channels={channels}
              generateLink={generateLink}
              generatedLink={generatedLink}
              isCopied={isCopied}
              handleCopy={handleCopy}
              qrLogs={qrLogs}
              filteredQrLogs={filteredQrLogs}
              qrLogCreatorFilter={qrLogCreatorFilter}
              setQrLogCreatorFilter={setQrLogCreatorFilter}
              qrLogCreators={qrLogCreators}
              fetchQrLogs={fetchQrLogs}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && role === 'admin' && (
            <UserManagementTab
              pendingUsers={pendingUsers}
              activeUsers={activeUsers}
              fetchPendingUsers={fetchPendingUsers}
              fetchActiveUsers={fetchActiveUsers}
              showToast={showToast}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
              isConfirmingDisable={isConfirmingDisable}
              setIsConfirmingDisable={setIsConfirmingDisable}
              isAddUserOpen={isAddUserOpen}
              setIsAddUserOpen={setIsAddUserOpen}
              newUserForm={newUserForm}
              setNewUserForm={setNewUserForm}
              isCreatingUser={isCreatingUser}
              setIsCreatingUser={setIsCreatingUser}
            />
          )}

          {activeTab === 'config' && (
            <MasterDataConfig />
          )}

          {activeTab === 'profile' && (
            <div className="form-step-enter">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
              <p className="text-gray-500 mb-6">ข้อมูลบัญชีผู้ใช้งานของคุณ</p>

              <Card>
                {currentUser ? (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 pb-6 border-b">
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200 shadow-lg flex-shrink-0" onError={handleProfilePhotoError} />
                      ) : (
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl text-white shadow-lg
                          ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'}`}>
                          {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{currentUser.full_name}</h3>
                        <span className={`inline-block mt-1 text-sm font-semibold px-3 py-1 rounded-full
                          ${currentUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {currentUser.role === 'admin' ? 'Administrator' : 'Moderator'}
                        </span>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อ-นามสกุล</label>
                        <p className="text-lg font-semibold text-gray-900">{currentUser.full_name || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">อีเมล</label>
                        <p className="text-lg font-semibold text-gray-900">{currentUser.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{currentUser.role}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">สถานะ</label>
                        <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-6 border-t">
                      <Button variant="danger" onClick={onLogout}>
                        <LogOut className="w-4 h-4 mr-2" /> ออกจากระบบ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">ไม่พบข้อมูลผู้ใช้</p>
                    <p className="text-sm">กรุณา logout และ login ใหม่อีกครั้ง</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        viewingApp={viewingApp}
        setViewingApp={setViewingApp}
        appLogs={appLogs}
        isLoadingLogs={isLoadingLogs}
        setEditingApp={setEditingApp}
        setClaimingApp={setClaimingApp}
        setTransferringApp={setTransferringApp}
        setUnassigningApp={setUnassigningApp}
        setInterviewingApp={setInterviewingApp}
        setInterviewDate={setInterviewDate}
        setRejectingApp={setRejectingApp}
        setRejectComment={setRejectComment}
        setRejectionReason={setRejectionReason}
        setApprovingApp={setApprovingApp}
        onApplicationUpdated={(updatedApp) => {
          setApplications(prev => prev.map(app => app.id === updatedApp.id ? updatedApp : app));
        }}
      />

      {/* Action Menu Portal (fixed position, never clipped) */}
      {actionMenu && (() => {
        const app = applications.find((a: any) => a.id === actionMenu.id);
        if (!app) return null;
        return (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setActionMenu(null)} />
            <div
              className="fixed z-[61] bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 min-w-[170px]"
              style={{
                left: `${Math.min(actionMenu.x, window.innerWidth - 180)}px`,
                ...(actionMenu.openUp
                  ? { bottom: `${window.innerHeight - actionMenu.y}px` }
                  : { top: `${actionMenu.y}px` }
                )
              }}
            >
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => { setViewingApp(app); setActionMenu(null); }}>
                <ExternalLink className="w-4 h-4 text-indigo-500" /> ดูรายละเอียด
              </button>
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => { setEditingApp(app); setActionMenu(null); }}>
                <Edit className="w-4 h-4 text-blue-500" /> แก้ไขข้อมูล
              </button>
              {/* Pending: only Claim */}
              {app.status === 'Pending' && !app.assigned_to && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-indigo-700 hover:bg-indigo-50 transition-colors" onClick={() => { setClaimingApp(app); setActionMenu(null); }}>
                    <UserPlus className="w-4 h-4" /> รับดูแลเคส
                  </button>
                </>
              )}
              {/* Reviewing: Interview + Reject */}
              {app.status === 'Reviewing' && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-yellow-700 hover:bg-yellow-50 transition-colors" onClick={() => { setInterviewingApp(app); setInterviewDate(''); setActionMenu(null); }}>
                    <Calendar className="w-4 h-4" /> นัดสัมภาษณ์
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors" onClick={() => { setRejectingApp(app); setRejectComment(''); setRejectionReason(''); setActionMenu(null); }}>
                    <XCircle className="w-4 h-4" /> ไม่รับ
                  </button>
                </>
              )}
              {/* Interview or later shortlist: Hire + Reject */}
              {(isInterviewScheduledStatus(app.status) || app.status === 'Interviewed' || app.status === 'Offer') && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  {isInterviewScheduledStatus(app.status) && (
                    <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-yellow-700 hover:bg-yellow-50 transition-colors" onClick={() => { setInterviewingApp(app); setInterviewDate(app.interview_date || ''); setActionMenu(null); }}>
                      <Calendar className="w-4 h-4" /> เปลี่ยน/เลื่อนวันสัมภาษณ์
                    </button>
                  )}
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-green-700 hover:bg-green-50 transition-colors" onClick={() => { setApprovingApp(app); setActionMenu(null); }}>
                    <CheckCircle className="w-4 h-4" /> ผ่านสัมภาษณ์ (รับทำงาน)
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors" onClick={() => { setRejectingApp(app); setRejectComment(''); setRejectionReason(''); setActionMenu(null); }}>
                    <XCircle className="w-4 h-4" /> ไม่ผ่านสัมภาษณ์
                  </button>
                </>
              )}
              {role === 'admin' && (
                <>
                  <div className="border-t border-gray-100 my-1" />
                  <button className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-red-500 hover:bg-red-50 transition-colors" onClick={() => { setDeletingApp(app); setActionMenu(null); }}>
                    <Trash2 className="w-4 h-4" /> ลบข้อมูล
                  </button>
                </>
              )}
            </div>
          </>
        );
      })()}

      {/* Approve Application Dialog */}
      <Modal
        isOpen={!!approvingApp}
        onClose={() => setApprovingApp(null)}
        title="รับผู้สมัครเข้าทำงาน"
        footer={null}
      >
        {approvingApp && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-700">
                คุณต้องการรับ <strong>{approvingApp.full_name || approvingApp.form_data?.firstName}</strong> เข้าทำงานใช่หรือไม่?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ตำแหน่ง: {approvingApp.position || approvingApp.form_data?.position || '-'}
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setApprovingApp(null)}>ยกเลิก</Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  if (!currentUserId) {
                    showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                    return;
                  }
                  const result = await api.updateApplicationStatus(approvingApp.id, 'Hired', {
                    performedByUserId: currentUserId,
                    performedByName: currentUserName,
                  });
                  if (!result.success) {
                    showToast(result.error?.message || 'รับผู้สมัครไม่สำเร็จ', 'error');
                    return;
                  }
                  setApprovingApp(null);
                  showToast('รับผู้สมัครเข้าทำงานเรียบร้อย!', 'success');
                  fetchData();
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> ยืนยันรับเข้าทำงาน
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!interviewingApp}
        onClose={() => setInterviewingApp(null)}
        title="นัดสัมภาษณ์ผู้สมัคร"
        footer={null}
      >
        {interviewingApp && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-gray-700">
                นัดสัมภาษณ์ <strong>{interviewingApp.full_name || interviewingApp.form_data?.firstName}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ตำแหน่ง: {interviewingApp.position || interviewingApp.form_data?.position || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่นัดสัมภาษณ์ <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setInterviewingApp(null)}>ยกเลิก</Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={!interviewDate}
                onClick={async () => {
                  if (!currentUserId) {
                    showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                    return;
                  }
                  const result = await api.updateApplicationStatus(interviewingApp.id, 'InterviewScheduled', {
                    performedByUserId: currentUserId,
                    performedByName: currentUserName,
                    interviewDate,
                  });
                  if (!result.success) {
                    showToast(result.error?.message || 'นัดสัมภาษณ์ไม่สำเร็จ', 'error');
                    return;
                  }
                  setInterviewingApp(null);
                  setInterviewDate('');
                  showToast('นัดสัมภาษณ์เรียบร้อย!', 'success');
                  fetchData();
                }}
              >
                <Calendar className="w-4 h-4 mr-2" /> ยืนยันนัดสัมภาษณ์
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Application Dialog */}
      <Modal
        isOpen={!!rejectingApp}
        onClose={() => setRejectingApp(null)}
        title="ปฏิเสธผู้สมัคร"
        footer={null}
      >
        {rejectingApp && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-700">
                คุณต้องการปฏิเสธ <strong>{rejectingApp.full_name || rejectingApp.form_data?.firstName}</strong> ใช่หรือไม่?
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สาเหตุหลัก <span className="text-red-500">*</span></label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="">-- เลือกสาเหตุ --</option>
                {(closeReasons.length > 0 ? closeReasons : [
                  { code: 'failed_interview', label_th: 'ไม่ผ่านสัมภาษณ์', category: 'rejected' },
                  { code: 'qualification_mismatch', label_th: 'คุณสมบัติไม่ตรง', category: 'rejected' },
                  { code: 'salary_over_budget', label_th: 'เรียกเงินเดือนสูงเกินงบ', category: 'rejected' },
                  { code: 'candidate_withdrew', label_th: 'ผู้สมัครยกเลิกเอง', category: 'withdrawn' },
                  { code: 'no_show', label_th: 'ไม่มาตามนัดสัมภาษณ์', category: 'no_show' },
                  { code: 'cannot_contact', label_th: 'ติดต่อไม่ได้', category: 'rejected' },
                  { code: 'other', label_th: 'อื่นๆ', category: 'rejected' },
                ]).map((reason: any) => (
                  <option key={reason.code || reason.label_th} value={reason.label_th} data-category={reason.category}>
                    {reason.label_th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
                placeholder="ระบุรายละเอียดเพิ่มเติม..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setRejectingApp(null)}>ยกเลิก</Button>
              <Button
                variant="danger"
                disabled={!rejectionReason}
                onClick={async () => {
                  if (!currentUserId) {
                    showToast('ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่', 'error');
                    return;
                  }
                  const selectedReason = closeReasons.find((reason: any) => reason.label_th === rejectionReason);
                  const closeStatus: ApplicationStatus = selectedReason?.category === 'withdrawn' ? 'Withdrawn' : selectedReason?.category === 'no_show' ? 'NoShow' : 'Rejected';
                  const result = await api.updateApplicationStatus(rejectingApp.id, closeStatus, {
                    comment: rejectComment,
                    performedByUserId: currentUserId,
                    performedByName: currentUserName,
                    rejectionReason,
                  });
                  if (!result.success) {
                    showToast(result.error?.message || 'ปฏิเสธผู้สมัครไม่สำเร็จ', 'error');
                    return;
                  }
                  setRejectingApp(null);
                  setRejectionReason('');
                  setRejectComment('');
                  showToast('ปฏิเสธผู้สมัครเรียบร้อย', 'success');
                  fetchData();
                }}
              >
                ยืนยันปฏิเสธ
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Application Modal */}
      <ApplicationEditModal
        editingApp={editingApp}
        setEditingApp={setEditingApp}
        editForm={editForm}
        setEditForm={setEditForm}
        departments={departments}
        positions={positions}
        businessUnits={businessUnits}
        channels={channels}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        showToast={showToast}
        fetchData={fetchData}
      />

      {/* Application Actions Modals (Approve, Reject, Interview, Claim, Transfer, Unassign, Delete, QR) */}
      <ApplicationActionModals
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        activeUsers={activeUsers}
        closeReasons={closeReasons}
        showToast={showToast}
        fetchData={fetchData}
        claimingApp={claimingApp} setClaimingApp={setClaimingApp}
        unassigningApp={unassigningApp} setUnassigningApp={setUnassigningApp}
        transferringApp={transferringApp} setTransferringApp={setTransferringApp}
        transferTarget={transferTarget} setTransferTarget={setTransferTarget}
        rejectingApp={rejectingApp} setRejectingApp={setRejectingApp}
        rejectionReason={rejectionReason} setRejectionReason={setRejectionReason}
        rejectComment={rejectComment} setRejectComment={setRejectComment}
        approvingApp={approvingApp} setApprovingApp={setApprovingApp}
        interviewingApp={interviewingApp} setInterviewingApp={setInterviewingApp}
        interviewDate={interviewDate} setInterviewDate={setInterviewDate}
        deletingApp={deletingApp} setDeletingApp={setDeletingApp}
        isDeleting={isDeleting} handleDeleteApplication={handleDeleteApplication}
        confirmQrAction={confirmQrAction} setConfirmQrAction={setConfirmQrAction}
        executeGenerateLink={executeGenerateLink}
      />

      {
        toast.show && (
          <div className={`fixed top-20 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-300 ${toast.type === 'success'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-white/20' : 'bg-white/20'
              }`}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-2 p-1 rounded-full hover:bg-white/20 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      }

      <Modal
        isOpen={!!confirmQrAction}
        onClose={() => setConfirmQrAction(null)}
        title="ยืนยันการสร้าง QR Code"
        footer={null}
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <QrCode className="w-6 h-6" />
          </div>
          <p className="mb-6 text-gray-600">
            {confirmQrAction === 'empty'
              ? 'คุณยังไม่ได้เลือก Business Unit หรือ Channel ยืนยันที่จะสร้าง QR Code แบบไม่ระบุช่องทางหรือไม่?'
              : 'ยืนยันการสร้าง QR Code ด้วยข้อมูลที่เลือก?'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setConfirmQrAction(null)}>ยกเลิก</Button>
            <Button onClick={executeGenerateLink}>ยืนยัน</Button>
          </div>
        </div>
      </Modal>

    </div >
  );
};

// --- Sub-component for Master Data Configuration ---
const MasterDataConfig = () => {
  const [activeTable, setActiveTable] = useState('departments');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Generic form state for add/edit
  const [formData, setFormData] = useState<any>({});

  // Dependency State
  const [deptList, setDeptList] = useState<any[]>([]);
  const [buList, setBuList] = useState<any[]>([]);
  const [provList, setProvList] = useState<any[]>([]);

  // Confirmation State
  const [confirmAction, setConfirmAction] = useState<{ type: 'toggle', id: number, current: boolean } | null>(null);

  // Redesign State: Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Grouped Tables Configuration
  const TABLE_GROUPS = [
    {
      id: 'organization',
      label: 'Organization',
      icon: 'Building2',
      description: 'โครงสร้างองค์กร',
      tables: [
        { id: 'departments', label: 'Departments', labelTh: 'แผนก' },
        { id: 'positions', label: 'Positions', labelTh: 'ตำแหน่ง' },
      ]
    },
    {
      id: 'tags',
      label: 'Tags & Sources',
      icon: 'Tag',
      description: 'แหล่งที่มาและช่องทาง',
      tables: [
        { id: 'business_units', label: 'Business Units', labelTh: 'หน่วยธุรกิจ' },
        { id: 'channels', label: 'Channels', labelTh: 'ช่องทางรับสมัคร' },
      ]
    },
    {
      id: 'education',
      label: 'Education',
      icon: 'GraduationCap',
      description: 'ข้อมูลการศึกษา',
      tables: [
        { id: 'universities', label: 'Universities', labelTh: 'มหาวิทยาลัย' },
        { id: 'colleges', label: 'Colleges', labelTh: 'วิทยาลัย/ปวช/ปวส' },
        { id: 'faculties', label: 'Faculties', labelTh: 'คณะ' },
      ]
    },
    {
      id: 'address',
      label: 'Address',
      icon: 'MapPin',
      description: 'ที่อยู่',
      tables: [
        { id: 'provinces', label: 'Provinces', labelTh: 'จังหวัด' },
        { id: 'districts', label: 'Districts', labelTh: 'อำเภอ/เขต' },
        { id: 'subdistricts', label: 'Subdistricts', labelTh: 'ตำบล/แขวง' },
      ]
    },
  ];

  // Flat tables list for lookups
  const TABLES = TABLE_GROUPS.flatMap(g => g.tables);

  useEffect(() => {
    fetchTableData();
    // Pre-fetch dependencies if needed
    if (activeTable === 'positions') loadDepts();
    if (activeTable === 'channels') loadBUs();
    if (activeTable === 'districts') loadProvinces(); // Assume loadProvinces exists or reuse fetch logic
  }, [activeTable]);

  const loadDepts = async () => {
    const { data } = await api.master.getAll('departments');
    setDeptList(data || []);
  }

  const loadBUs = async () => {
    const { data } = await api.master.getAll('business_units');
    setBuList(data || []);
  }

  const loadProvinces = async () => {
    const { data } = await api.master.getAll('provinces');
    setProvList(data || []);
  }

  const fetchTableData = async () => {
    setIsLoading(true);
    const { data: res } = await api.master.getAll(activeTable);
    setData(res || []);
    setIsLoading(false);
    setCurrentPage(1); // Reset to page 1 on table change
  };

  // --- Filtering and Pagination Logic ---
  const filteredData = data.filter(item => {
    // Status Filter
    if (statusFilter === 'active' && item.is_active === false) return false;
    if (statusFilter === 'inactive' && item.is_active !== false) return false;

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || '').toLowerCase().includes(q);
      const matchNameTh = (item.name_th || '').toLowerCase().includes(q);
      const matchNameEn = (item.name_en || '').toLowerCase().includes(q);
      const matchId = String(item.id).includes(q);
      return matchName || matchNameTh || matchNameEn || matchId;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleActive = async (id: number, current: boolean) => {
    setConfirmAction({ type: 'toggle', id, current });
  };

  const confirmToggle = async () => {
    if (!confirmAction) return;
    try {
      const result = await api.master.toggleActive(activeTable, confirmAction.id, confirmAction.current);
      if (!result.success) {
        alert(`Failed to update: ${result.error?.message || 'Unknown error'}`);
      }
      fetchTableData();
    } catch (err: any) {
      alert(`Error: ${err.message || 'Unknown error'}`);
    }
    setConfirmAction(null);
  };

  const handleSave = async () => {
    console.log("Saving...", formData);
    // Enhanced Validation
    const hasName = formData.name || (formData.name_th && formData.name_en);
    // Some tables might only have name_th, so let's be flexible
    const hasAnyName = formData.name || formData.name_th || formData.name_en;

    if (!hasAnyName) {
      alert("Please enter a name.");
      return;
    }

    try {
      if (editingItem) {
        console.log("Updating item:", editingItem.id);
        const { error } = await api.master.updateItem(activeTable, editingItem.id, formData);
        if (error) throw error;
      } else {
        console.log("Adding new item");
        const { error } = await api.master.addItem(activeTable, formData);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({});
      fetchTableData();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save. check console.");
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item }); // Pre-fill
    setIsModalOpen(true);
  };

  return (
    <div className="form-step-enter max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Master Data Configuration</h2>
        <Button onClick={openAdd} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Add New</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Mobile Nav Select */}
        <div className="md:hidden">
          <select
            className="w-full border-2 border-indigo-100 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 outline-none"
            value={activeTable}
            onChange={(e) => setActiveTable(e.target.value)}
          >
            {TABLE_GROUPS.map(group => (
              <optgroup key={group.id} label={group.label}>
                {group.tables.map(t => (
                  <option key={t.id} value={t.id}>{t.label} ({t.labelTh})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Desktop Sidebar Nav */}
        <Card className="hidden md:block col-span-1 p-0 h-fit overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Database className="w-4 h-4" /> Data Categories
            </h3>
          </div>
          <nav className="p-2 space-y-3">
            {TABLE_GROUPS.map(group => (
              <div key={group.id} className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.icon === 'Building2' && <Building2 className="w-3.5 h-3.5" />}
                  {group.icon === 'Tag' && <Tag className="w-3.5 h-3.5" />}
                  {group.icon === 'GraduationCap' && <GraduationCap className="w-3.5 h-3.5" />}
                  {group.icon === 'MapPin' && <MapPin className="w-3.5 h-3.5" />}
                  {group.label}
                </div>
                {group.tables.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTable(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${activeTable === t.id
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-500">{t.labelTh}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </Card>

        <Card className="col-span-1 md:col-span-3 min-h-[500px] flex flex-col">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
            <div>
              <h3 className="font-bold text-lg capitalize flex items-center gap-2">
                {TABLES.find(t => t.id === activeTable)?.label}
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {filteredData.length} records
                </span>
              </h3>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full sm:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto w-full">
              {/* Desktop Table */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (TH/Main)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name (EN)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.is_active === false ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name_th || item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.name_en || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm rounded-full transition-all" onClick={() => openEdit(item)}>
                          <Edit className="w-5 h-5 text-blue-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-white hover:shadow-sm rounded-full transition-all" onClick={() => handleToggleActive(item.id, item.is_active !== false)}>
                          {item.is_active !== false ? <Trash2 className="w-5 h-5 text-red-500" /> : <Check className="w-5 h-5 text-green-500" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card List */}
              <div className="sm:hidden space-y-3 p-1">
                {paginatedData.map(item => (
                  <div key={item.id} className={`border rounded-xl p-4 relative flex flex-col gap-3 shadow-sm ${item.is_active === false ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-400 font-mono">ID: {item.id}</div>
                        <div className="font-bold text-base text-gray-900 mt-1">{item.name_th || item.name}</div>
                        {item.name_en && <div className="text-sm text-gray-500">{item.name_en}</div>}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold ${item.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {item.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                      <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => openEdit(item)}>
                        <Edit className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className={`h-8 px-3 text-xs ${item.is_active !== false ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`} onClick={() => handleToggleActive(item.id, item.is_active !== false)}>
                        {item.is_active !== false ? <><Trash2 className="w-3.5 h-3.5 mr-1.5 text-red-500" /> Disable</> : <><Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Enable</>}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="mt-auto pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  className="border rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <span className="text-xs sm:text-sm">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded border ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div >

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); setFormData({}); }}
        title={editingItem ? `Edit ${TABLES.find(t => t.id === activeTable)?.label.slice(0, -1)}` : `Add New ${TABLES.find(t => t.id === activeTable)?.label.slice(0, -1)}`}
        size="full"
        footer={(
          <>
            <Button
              variant="outline"
              onClick={() => { setIsModalOpen(false); setEditingItem(null); setFormData({}); }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          {/* Dynamic Form Fields based on table columns roughly */}
          {/* Most tables have name_th/name_en OR name. Some have parent IDs. */}

          {/* Generic Name Field (for tables with 'name') */}
          {['business_units', 'channels'].includes(activeTable) && (
            <Input label="Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          )}

          {/* Name/Name_EN Fields (where TH is name and EN is name_en) */}
          {['universities', 'colleges', 'faculties'].includes(activeTable) && (
            <>
              <Input label="Name (TH)" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input label="Name (EN)" value={formData.name_en || ''} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
            </>
          )}

          {/* TH/EN Fields */}
          {['departments', 'provinces', 'districts', 'subdistricts', 'positions'].includes(activeTable) && (
            <>
              <Input label="Name (TH)" value={formData.name_th || ''} onChange={(e) => setFormData({ ...formData, name_th: e.target.value })} />
              <Input label="Name (EN)" value={formData.name_en || ''} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
            </>
          )}

          {/* Parent IDs (Simplified: Text Input for ID for now, or fetch List? Fetching list is better but complex for single file. 
               User asked for "config", I'll provide ID input with label or simple assumption. 
               Ideally should be a dropdown. Let's try to be smart about it.) 
            */}

          {/* Parent Dropdowns */}
          {(activeTable === 'positions') && (
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Department</label>
              <select
                className="border border-gray-300 rounded-lg p-2"
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: parseInt(e.target.value) })}
              >
                <option value="">Select Department</option>
                {deptList.map(d => <option key={d.id} value={d.id}>{d.name_en} / {d.name_th}</option>)}
              </select>
            </div>
          )}
          {(activeTable === 'channels') && (
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 mb-1">Channel Name</label>
              <Input
                placeholder="Channel Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}    {(activeTable === 'subdistricts') && (
            <Input label="District ID" type="number" value={formData.district_id || ''} onChange={(e) => setFormData({ ...formData, district_id: e.target.value })} />
          )}

          {activeTable === 'subdistricts' && (
            <Input label="Postcode" value={formData.postcode || ''} onChange={(e) => setFormData({ ...formData, postcode: e.target.value })} />
          )}


          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title="Confirm Action"
        footer={null}
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Shield className="w-6 h-6" />
          </div>
          <p className="mb-6 text-gray-600">
            Are you sure you want to {confirmAction?.current ? 'deactivate' : 'activate'} this item?
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button onClick={confirmToggle}>{confirmAction?.current ? 'Deactivate' : 'Activate'}</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
