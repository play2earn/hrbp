
import React, { useState, useEffect } from 'react';
import { MOCK_BU } from '../constants';
import { Card, Button, Input, Select, Modal } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LucideIcon, Home, FileText, QrCode, Settings, LogOut, CheckCircle, XCircle, Search, Filter, Download, ExternalLink, Calendar, Menu, X, ChevronRight, ChevronLeft, User, Shield, Users, Copy, Check, Database, Plus, Edit, Trash2, Building2, Tag, GraduationCap, MapPin, Phone } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../supabaseClient';
import { Role } from '../types';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

interface DashboardProps {
  role: 'admin' | 'mod';
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'settings' | 'config' | 'profile'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Current User Info
  const [currentUser, setCurrentUser] = useState<{ full_name: string; email: string; role: string; emp_id?: string } | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);

  // Data State
  const [applications, setApplications] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null); // For Edit Modal
  const [stats, setStats] = useState({ total: 0, pending: 0, hired: 0, rejected: 0 });
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

  // Applications Table State
  const [appFilters, setAppFilters] = useState({
    search: '',
    position: '',
    bu: '',
    channel: '',
    status: 'all'
  });
  const [appPage, setAppPage] = useState(1);
  const [appPerPage, setAppPerPage] = useState(25);
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [rejectingApp, setRejectingApp] = useState<any | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [approvingApp, setApprovingApp] = useState<any | null>(null);
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    position: '',
    department: '',
    departmentId: 0,
    expectedSalary: '',
    phone: '',
    email: '',
    status: 'Pending',
    businessUnit: '',
    sourceChannel: '',
    campaignTag: '',
    height: '',
    weight: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFilteredPositions, setEditFilteredPositions] = useState<any[]>([]);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
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

    // Fetch profile photo from IDMS
    const empId = storedUser ? (() => { try { return JSON.parse(storedUser).emp_id; } catch { return null; } })() : null;
    if (empId) {
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
          console.warn('Profile photo unavailable, using default avatar:', err.message);
          setProfilePhotoUrl(null);
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
    const hired = data.filter((a: any) => a.status === 'Hired').length;
    const rejected = data.filter((a: any) => a.status === 'Rejected').length;

    setStats({ total, pending, hired, rejected });
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
    await api.updateApplicationStatus(id, status);
    fetchData(); // Refresh list
  };

  const fetchQrLogs = async () => {
    const logs = await api.getQrLogs(25);
    setQrLogs(logs);
  };

  const generateLink = async () => {
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

  // Prepare chart data from real applications
  const deptData = MOCK_BU.map(bu => ({
    name: bu,
    value: applications.filter(a => a.department === bu || a.form_data?.businessUnit === bu).length
  })).filter(d => d.value > 0);

  const mockChartData = [
    { name: 'Jan', applications: 40 },
    { name: 'Feb', applications: 30 },
    { name: 'Mar', applications: 55 },
    { name: 'Apr', applications: 80 },
    { name: 'May', applications: 65 },
  ];

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
                <img src={profilePhotoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50 shadow-md flex-shrink-0" onError={() => setProfilePhotoUrl(null)} />
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
                <img src={profilePhotoUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/50 shadow-md" onError={() => setProfilePhotoUrl(null)} />
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

          {activeTab === 'overview' && (
            <div className="space-y-6 form-step-enter">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={fetchData}>Refresh Data</Button>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border hidden sm:flex items-center">Last updated: Just now</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/25 card-hover">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Total Applications</p>
                      <p className="text-4xl font-bold mt-2">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl"><FileText className="w-6 h-6" /></div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/25 card-hover">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-50 text-sm font-medium">Pending Review</p>
                      <p className="text-4xl font-bold mt-2">{stats.pending}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl"><Users className="w-6 h-6" /></div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 card-hover">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-50 text-sm font-medium">Hired (YTD)</p>
                      <p className="text-4xl font-bold mt-2">{stats.hired}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                  </div>
                </div>
                <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-6 text-white shadow-xl shadow-red-500/25 card-hover">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-rose-50 text-sm font-medium">Rejected</p>
                      <p className="text-4xl font-bold mt-2">{stats.rejected}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl"><XCircle className="w-6 h-6" /></div>
                  </div>
                </div>
              </div>

              {/* Recent Applications Table */}
              <Card>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Applications</h3>
                  <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 lg:flex-initial">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อ, เบอร์โทร..."
                        className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full lg:w-56 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={appFilters.search}
                        onChange={(e) => { setAppFilters(f => ({ ...f, search: e.target.value })); setAppPage(1); }}
                      />
                    </div>
                    {/* Position Filter */}
                    <select
                      className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                      className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                      className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
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
                      className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={appFilters.status}
                      onChange={(e) => { setAppFilters(f => ({ ...f, status: e.target.value })); setAppPage(1); }}
                    >
                      <option value="all">สถานะทั้งหมด</option>
                      <option value="Pending">รอดำเนินการ</option>
                      <option value="Hired">รับเข้าทำงาน</option>
                      <option value="Rejected">ไม่ผ่าน</option>
                    </select>
                  </div>
                </div>

                {/* Filtered & Paginated Data */}
                {(() => {
                  const filtered = applications.filter((app: any) => {
                    if (appFilters.status !== 'all' && app.status !== appFilters.status) return false;
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
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">ลำดับ</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / วันที่</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้สมัคร (ติดต่อ)</th>
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
                                  
                                  {/* ID / วันที่ */}
                                  <td className="px-4 py-3">
                                    <div
                                      className="text-xs font-mono font-medium text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors mb-1 inline-block"
                                      title={`Click to copy: ${app.id}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(app.id);
                                        const target = e.currentTarget;
                                        const original = target.innerText;
                                        target.innerText = 'Copied!';
                                        target.style.color = '#059669';
                                        setTimeout(() => {
                                          target.innerText = original;
                                          target.style.color = '';
                                        }, 1000);
                                      }}
                                    >
                                      {app.id?.slice(-5).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">
                                      {new Date(app.created_at).toLocaleDateString('th-TH')}
                                    </div>
                                  </td>

                                  {/* ผู้สมัคร (ติดต่อ) */}
                                  <td className="px-4 py-3">
                                    <div
                                      className="text-sm font-semibold text-indigo-700 whitespace-nowrap cursor-pointer hover:text-indigo-900 hover:underline transition-colors"
                                      onClick={() => setViewingApp(app)}
                                      title="คลิกเพื่อดูรายละเอียด"
                                    >
                                      {fullName}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center mt-0.5 whitespace-nowrap">
                                      <Phone className="w-3 h-3 mr-1" /> {phone}
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
                                      {bu ? <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-50 text-indigo-700 font-medium whitespace-nowrap border border-indigo-100 placeholder-transparent" title="Business Unit">BU: {bu}</span> : null}
                                      {ch ? <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-50 text-blue-700 font-medium whitespace-nowrap border border-blue-100 placeholder-transparent" title="Channel">CH: {ch}</span> : null}
                                      {!bu && !ch && <span className="text-gray-400 text-xs">-</span>}
                                    </div>
                                  </td>

                                  {/* สถานะ */}
                                  <td className="px-4 py-3 w-28 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                                      app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                      {app.status === 'Pending' ? 'รอดำเนินการ' : app.status === 'Hired' ? 'รับแล้ว' : 'ไม่ผ่าน'}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="px-4 py-3 w-28 text-center whitespace-nowrap">
                                    <div className="flex justify-center gap-1.5 flex-nowrap">
                                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => setViewingApp(app)} title="ดูรายละเอียด">
                                        <ExternalLink className="w-5 h-5 text-indigo-600" />
                                      </Button>
                                      {app.status === 'Pending' && (
                                        <>
                                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => setApprovingApp(app)} title="รับเข้าทำงาน">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                          </Button>
                                          <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => { setRejectingApp(app); setRejectComment(''); }} title="ไม่รับ">
                                            <XCircle className="w-5 h-5 text-red-500" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
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
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Application Trends (Mock)</h3>
                  <div className="h-72 w-full" style={{ minWidth: '200px', minHeight: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                      <BarChart data={mockChartData}>
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
          )}

          {activeTab === 'qr' && (
            <div className="max-w-4xl form-step-enter">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code & Link Generator</h2>
              <p className="text-gray-500 mb-6">สร้าง QR Code และ Link สำหรับติดตามช่องทางการรับสมัคร</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Panel */}
                <Card className="space-y-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" /> Configuration
                  </h3>
                  <div className="space-y-5">
                    <Select
                      label="Business Unit"
                      options={businessUnits.map(b => ({ label: b.name, value: b.name }))}
                      value={qrParams.bu}
                      onChange={(e) => setQrParams(p => ({ ...p, bu: e.target.value }))}
                    />
                    <Select
                      label="Channel (ช่องทางรับสมัคร)"
                      options={channels.filter(c => c.is_active !== false).map(c => ({
                        label: c.name_th || c.name || c.name_en,
                        value: c.name_th || c.name || c.name_en
                      }))}
                      value={qrParams.ch}
                      onChange={(e) => setQrParams(p => ({ ...p, ch: e.target.value }))}
                    />
                    <Input
                      label="Campaign Tag (Optional)"
                      value={qrParams.tag}
                      onChange={(e) => setQrParams(p => ({ ...p, tag: e.target.value }))}
                      placeholder="e.g. SummerIntern2024, JobFair2025"
                    />
                  </div>
                  <Button onClick={generateLink} className="w-full" size="lg">
                    <QrCode className="w-5 h-5 mr-2" /> Generate QR Code
                  </Button>
                </Card>

                {/* QR Display Panel */}
                <Card className={`flex flex-col items-center justify-center min-h-[350px] transition-all ${generatedLink
                  ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-200'
                  : 'bg-gray-50 border-dashed border-2 border-gray-200'
                  }`}>
                  {generatedLink ? (
                    <div className="text-center space-y-4 p-4 w-full">
                      <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedLink)}`}
                          alt="QR Code"
                          className="mx-auto"
                        />
                      </div>

                      {/* Link Preview */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-left">
                        <p className="text-xs text-gray-400 mb-1 font-medium">Generated Link:</p>
                        <p className="text-sm text-indigo-600 break-all font-mono bg-indigo-50 p-2 rounded">
                          {generatedLink}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant={isCopied ? 'primary' : 'outline'}
                          size="sm"
                          onClick={handleCopy}
                          className={isCopied ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                        >
                          {isCopied ? <><Check className="w-4 h-4 mr-1" /> Copied!</> : <><Copy className="w-4 h-4 mr-1" /> Copy Link</>}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generatedLink, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" /> Open Link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="font-medium">No QR Code Generated</p>
                      <p className="text-sm">Configure options and click Generate</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Recent Transactions Log */}
              <Card className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" /> Recent Transactions
                  </h3>
                  <Button size="sm" variant="outline" onClick={fetchQrLogs}>Refresh</Button>
                </div>
                {qrLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg text-center">ยังไม่มีประวัติการสร้าง QR Code</p>
                ) : (
                  <div className="space-y-3">
                    {qrLogs.map((log: any) => {
                      const urlObj = (() => { try { return new URL(log.generated_url); } catch { return null; } })();
                      const params = urlObj ? Object.fromEntries(urlObj.searchParams.entries()) : {};
                      return (
                        <div key={log.id} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-white">
                          <div className="flex items-start gap-4">
                            {/* QR Thumbnail */}
                            <div
                              onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(log.generated_url)}`, '_blank')}
                              title="คลิกเพื่อเปิด QR ขนาดเต็ม"
                              className="group flex-shrink-0 w-14 h-14 bg-white border-2 border-gray-100 rounded-xl cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all overflow-hidden flex items-center justify-center"
                            >
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(log.generated_url)}`}
                                alt="QR"
                                className="w-11 h-11 object-contain transition-transform group-hover:scale-110"
                              />
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                  {log.business_unit || '-'}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                  {log.channel || '-'}
                                </span>
                                {log.campaign_tag && (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    🏷️ {log.campaign_tag}
                                  </span>
                                )}
                              </div>

                              {/* Compact meta row */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{new Date(log.created_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-gray-300">|</span>
                                <span title={log.created_by}>{log.created_by || '-'}</span>
                              </div>
                            </div>

                            {/* Copy URL Button */}
                            <button
                              onClick={async () => {
                                await navigator.clipboard.writeText(log.generated_url);
                                showToast('คัดลอก URL แล้ว!', 'success');
                              }}
                              title={log.generated_url}
                              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy URL
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'settings' && role === 'admin' && (
            <div className="max-w-4xl form-step-enter">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>

              {/* Pending Users Management */}
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Pending Registrations
                  </h3>
                  <Button size="sm" variant="outline" onClick={fetchPendingUsers}>Refresh</Button>
                </div>

                {pendingUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">No pending account requests.</p>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">วันที่สร้าง</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">เบอร์โทร</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pendingUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-600">{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                            <td className="px-4 py-3 text-gray-600">{user.email}</td>
                            <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
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
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Existing Users</h3>
                  <Button variant="outline" size="sm" onClick={() => setIsAddUserOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add New User
                  </Button>
                </div>
                {activeUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 text-center">No active users found.</p>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">วันที่สร้าง</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">เบอร์โทร</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-600">{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{user.full_name}</td>
                            <td className="px-4 py-3 text-gray-600">{user.email}</td>
                            <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                {user.role === 'admin' ? 'Admin' : 'Moderator'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingUser(user); setIsConfirmingDisable(false); }}>Manage</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Edit User Modal */}
              <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title={isConfirmingDisable ? "Confirm Action" : "Manage User"}
                footer={null}
              >
                {editingUser && (
                  <div className="space-y-4">
                    {!isConfirmingDisable ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">User Details</label>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-semibold text-gray-900">{editingUser.full_name}</p>
                            <p className="text-gray-500">{editingUser.email}</p>
                            <p className="text-gray-500 capitalize">Role: {editingUser.role}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
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
                            Disabled users will be moved to the Rejected/Pending list and cannot log in.
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

              {/* Add New User Modal */}
              <Modal
                isOpen={isAddUserOpen}
                onClose={() => { setIsAddUserOpen(false); setNewUserForm({ full_name: '', email: '', phone: '', role: 'mod', emp_id: '', hrms_username: '' }); }}
                title="Add New User"
                footer={null}
              >
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsCreatingUser(true);
                  try {
                    const result = await api.auth.registerHrmsUser(newUserForm);
                    if (result.success) {
                      showToast('สร้างผู้ใช้สำเร็จ!', 'success');
                      setIsAddUserOpen(false);
                      setNewUserForm({ full_name: '', email: '', phone: '', role: 'mod', emp_id: '', hrms_username: '' });
                      fetchPendingUsers();
                      fetchActiveUsers();
                    } else {
                      throw result.error;
                    }
                  } catch (err: any) {
                    showToast('สร้างผู้ใช้ล้มเหลว: ' + (err.message || 'Unknown error'), 'error');
                  } finally {
                    setIsCreatingUser(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={newUserForm.full_name}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="ชื่อ นามสกุล"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        required
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                      <input
                        type="tel"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="081-XXX-XXXX"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      >
                        <option value="mod">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emp ID <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newUserForm.emp_id}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, emp_id: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. 12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HRMS Username <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newUserForm.hrms_username}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, hrms_username: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. somchai_ka"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button variant="outline" type="button" onClick={() => setIsAddUserOpen(false)}>ยกเลิก</Button>
                    <Button type="submit" isLoading={isCreatingUser}>
                      <Plus className="w-4 h-4 mr-1" /> สร้างผู้ใช้
                    </Button>
                  </div>
                </form>
              </Modal>
            </div>
          )}

          {activeTab === 'config' && (
            <MasterDataConfig />
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl form-step-enter">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h2>
              <p className="text-gray-500 mb-6">ข้อมูลบัญชีผู้ใช้งานของคุณ</p>

              <Card>
                {currentUser ? (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 pb-6 border-b">
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200 shadow-lg flex-shrink-0" onError={() => setProfilePhotoUrl(null)} />
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

      {/* View Application Modal - Comprehensive View */}
      <Modal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title="รายละเอียดผู้สมัคร"
        size="full"
        footer={null}
      >
        {viewingApp && (() => {
          const fd = viewingApp.form_data || {};
          const SectionHeader = ({ title, icon: Icon }: { title: string; icon?: any }) => (
            <div className="bg-gray-100 border-y border-gray-300 py-2 px-3 -mx-1 mt-4 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />} {title}
              </h4>
            </div>
          );
          const InfoRow = ({ label, value, className = '' }: { label: string; value: any; className?: string }) => (
            <div className={`text-sm py-1 ${className}`}>
              <span className="text-gray-500">{label}:</span> <span className="font-medium text-gray-900">{value || '-'}</span>
            </div>
          );
          return (
            <div className="max-h-[80vh] overflow-y-auto px-1">
              {/* Header with Photo */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200 mb-4">
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                  {fd.photoUrl ? (
                    <img src={fd.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {fd.title || fd.prefix || ''} {fd.firstName || viewingApp.full_name?.split(' ')[0] || ''} {fd.lastName || viewingApp.full_name?.split(' ')[1] || ''}
                  </h3>
                  <p className="text-sm text-gray-600">{fd.nickname || fd.nicknameEn ? `(${[fd.nickname, fd.nicknameEn].filter(Boolean).join(' / ')})` : ''}</p>
                  <p className="text-sm text-indigo-600 font-medium mt-1">{fd.position || viewingApp.position || 'ไม่ระบุตำแหน่ง'}</p>
                  <p className="text-sm text-gray-500">{fd.department || viewingApp.department || ''}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${viewingApp.status === 'Hired' ? 'bg-green-100 text-green-800' :
                      viewingApp.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{viewingApp.status === 'Pending' ? 'รอดำเนินการ' : viewingApp.status === 'Hired' ? 'รับแล้ว' : 'ไม่ผ่าน'}</span>
                    <span className="text-xs text-gray-400">สมัคร: {new Date(viewingApp.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* 1. Position Applied */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-indigo-50 p-3 rounded-lg mb-4">
                <InfoRow label="ตำแหน่งที่สมัคร" value={fd.position || viewingApp.position} />
                <InfoRow label="เงินเดือนที่ต้องการ" value={fd.expectedSalary ? `${fd.expectedSalary} ${fd.isSalaryNegotiable ? '(ต่อรองได้)' : ''}` : '-'} />
                <InfoRow label="แผนก/ฝ่าย" value={fd.department} />
                <InfoRow label="วันที่สามารถเริ่มงาน" value={fd.availability} />
              </div>

              {/* 2. Personal Info */}
              <SectionHeader title="ข้อมูลส่วนตัว" icon={User} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <InfoRow label="คำนำหน้า" value={fd.title || fd.prefix} />
                <InfoRow label="ชื่อเล่น (ไทย)" value={fd.nickname} />
                <InfoRow label="ชื่อเล่น (อังกฤษ)" value={fd.nicknameEn} />
                <InfoRow label="ชื่อ" value={fd.firstName} />
                <InfoRow label="นามสกุล" value={fd.lastName} />
                <InfoRow label="สัญชาติ" value={fd.isThaiNational ? 'ไทย' : 'ต่างชาติ'} />
                <InfoRow label={fd.isThaiNational ? 'เลขบัตรประชาชน' : 'หมายเลขหนังสือเดินทาง'} value={fd.isThaiNational ? fd.nationalId : fd.passportNo} />
                <InfoRow label="วันเกิด" value={fd.dateOfBirth} />
                <InfoRow label="อายุ" value={fd.age ? `${fd.age} ปี` : '-'} />
                <InfoRow label="ส่วนสูง" value={fd.height ? `${fd.height} ซม.` : '-'} />
                <InfoRow label="น้ำหนัก" value={fd.weight ? `${fd.weight} กก.` : '-'} />
                <InfoRow label="สถานะทางทหาร" value={fd.militaryStatus} />
                <InfoRow label="เบอร์โทร" value={fd.phone || viewingApp.phone} />
                <InfoRow label="อีเมล" value={fd.email || viewingApp.email} className="col-span-2" />
              </div>

              {/* 3. Contact Address */}
              <SectionHeader title="ที่อยู่" icon={MapPin} />
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">ที่อยู่ตามทะเบียนบ้าน:</span>
                  <p className="text-gray-900">{fd.registeredAddress || '-'} {fd.registeredSubDistrict ? `ต.${fd.registeredSubDistrict}` : ''} {fd.registeredDistrict ? `อ.${fd.registeredDistrict}` : ''} {fd.registeredProvince ? `จ.${fd.registeredProvince}` : ''} {fd.registeredPostcode || ''}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">ที่อยู่ปัจจุบัน:</span>
                  <p className="text-gray-900">{fd.currentAddress || '-'} {fd.currentSubDistrict ? `ต.${fd.currentSubDistrict}` : ''} {fd.currentDistrict ? `อ.${fd.currentDistrict}` : ''} {fd.currentProvince ? `จ.${fd.currentProvince}` : ''} {fd.currentPostcode || ''}</p>
                </div>
              </div>

              {/* 4. Family Info */}
              <SectionHeader title="ข้อมูลครอบครัว" icon={Users} />
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-3">
                <InfoRow label="สถานภาพ" value={fd.maritalStatus} />
                <InfoRow label="จำนวนบุตร" value={fd.childrenCount} />
                <InfoRow label="จำนวนพี่น้อง" value={fd.siblingCount} />
              </div>
              {fd.maritalStatus === 'สมรส' && (
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 mb-3 bg-gray-50 p-2 rounded">
                  <InfoRow label="ชื่อคู่สมรส" value={fd.spouseName} />
                  <InfoRow label="อาชีพคู่สมรส" value={fd.spouseOccupation} />
                  <InfoRow label="อายุคู่สมรส" value={fd.spouseAge} />
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ความสัมพันธ์</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ชื่อ-สกุล</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">อายุ</th>
                      <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">อาชีพ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 px-3 font-medium">บิดา</td>
                      <td className="py-2 px-3">{fd.fatherName || '-'}</td>
                      <td className="py-2 px-3">{fd.fatherAge || '-'}</td>
                      <td className="py-2 px-3">{fd.fatherOccupation || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">มารดา</td>
                      <td className="py-2 px-3">{fd.motherName || '-'}</td>
                      <td className="py-2 px-3">{fd.motherAge || '-'}</td>
                      <td className="py-2 px-3">{fd.motherOccupation || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 5. Education */}
              <SectionHeader title="การศึกษา" icon={GraduationCap} />
              {fd.education ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-1/5">ระดับ</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-1/3">สถาบัน</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">สาขา</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-16">GPA</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-20">ปี</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {['highSchool', 'vocational', 'bachelor', 'master'].map((key) => {
                        const edu = fd.education?.[key];
                        if (!edu?.institute) return null;
                        const levelNames: Record<string, string> = {
                          highSchool: 'มัธยม',
                          vocational: 'ปวช./ปวส.',
                          bachelor: 'ปริญญาตรี',
                          master: 'ปริญญาโท'
                        };
                        return (
                          <tr key={key}>
                            <td className="py-2 px-3 font-medium">{levelNames[key]}</td>
                            <td className="py-2 px-3">{edu.institute || '-'}</td>
                            <td className="py-2 px-3">{edu.major || '-'}</td>
                            <td className="py-2 px-3">{edu.gpa || '-'}</td>
                            <td className="py-2 px-3 text-xs">{edu.startDate && edu.endDate ? `${edu.startDate}-${edu.endDate}` : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">ไม่มีข้อมูล</p>
              )}

              {/* 6. Work Experience */}
              <SectionHeader title="ประสบการณ์ทำงาน" icon={Building2} />
              {fd.experience && fd.experience.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-24">ช่วงเวลา</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">บริษัท</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ตำแหน่ง</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600 w-20">เงินเดือน</th>
                        <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">หน้าที่</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fd.experience.map((exp: any, i: number) => (
                        <tr key={i}>
                          <td className="py-2 px-3 text-xs">{exp.from}<br />{exp.to || 'ปัจจุบัน'}</td>
                          <td className="py-2 px-3 font-medium">{exp.company || '-'}</td>
                          <td className="py-2 px-3">{exp.position || '-'}</td>
                          <td className="py-2 px-3">{exp.salary || '-'}</td>
                          <td className="py-2 px-3 text-xs">{exp.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">ไม่มีประสบการณ์ทำงาน</p>
              )}

              {/* 7. Skills */}
              <SectionHeader title="ทักษะ" />
              <div className="grid grid-cols-2 gap-4">
                {/* Languages */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">ภาษา</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">ภาษาอังกฤษ:</span><span className="font-medium">{fd.englishSkill || '-'} {fd.englishScore ? `(${fd.englishScore})` : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">ภาษาจีน:</span><span className="font-medium">{fd.chineseSkill || '-'} {fd.chineseScore ? `(${fd.chineseScore})` : ''}</span></div>
                  </div>
                </div>
                {/* Driving */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">การขับขี่</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">มอเตอร์ไซค์:</span><span className="font-medium">{fd.driving?.motorcycle ? 'ได้' : 'ไม่ได้'} {fd.driving?.motorcycleLicense ? '(มีใบขับขี่)' : ''}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">รถยนต์:</span><span className="font-medium">{fd.driving?.car ? 'ได้' : 'ไม่ได้'} {fd.driving?.carLicense ? '(มีใบขับขี่)' : ''}</span></div>
                    {fd.driving?.licenseClasses?.length > 0 && <div className="text-xs text-gray-500">ประเภท: {fd.driving.licenseClasses.join(', ')}</div>}
                  </div>
                </div>
                {/* Computer Skills */}
                {fd.computerSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">คอมพิวเตอร์</h5>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      {Object.entries(fd.computerSkills).map(([k, v]) => (
                        <div key={k} className="flex justify-between"><span className="text-gray-600 capitalize">{k}:</span><span className="font-medium text-xs">{v as string}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Graphics Skills */}
                {fd.graphicsSkills && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-semibold text-sm text-gray-700 mb-2 border-b pb-1">กราฟิก/มีเดีย</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">Canva:</span><span className="font-medium">{fd.graphicsSkills.canva || '-'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Video Editor:</span><span className="font-medium">{fd.graphicsSkills.videoEditor || '-'}</span></div>
                    </div>
                  </div>
                )}
              </div>
              {/* Special Skills & Hobbies */}
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="text-sm"><span className="text-gray-500 font-medium">ความสามารถพิเศษ:</span> <span className="text-gray-900">{fd.specialAbility || '-'}</span></div>
                <div className="text-sm"><span className="text-gray-500 font-medium">งานอดิเรก:</span> <span className="text-gray-900">{fd.hobbies || '-'}</span></div>
              </div>

              {/* 8. Questionnaire */}
              <SectionHeader title="แบบสอบถามเพิ่มเติม" />
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">สามารถทำงานต่างจังหวัดได้:</span>
                  <span className="text-gray-900">{fd.upcountryLocations?.length > 0 ? fd.upcountryLocations.join(', ') : '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="text-gray-500 font-medium block mb-1">จุดเด่น:</span>
                    <span className="text-gray-900">{fd.strength || '-'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="text-gray-500 font-medium block mb-1">จุดด้อย:</span>
                    <span className="text-gray-900">{fd.weakness || '-'}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">งานที่ไม่ถนัด:</span>
                  <span className="text-gray-900">{fd.lessFitTask || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">หลักการทำงาน:</span>
                  <span className="text-gray-900">{fd.principles || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">วิธีแก้ปัญหา:</span>
                  <span className="text-gray-900">{fd.troubleResolve || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">เกณฑ์เลือกงาน:</span>
                  <span className="text-gray-900">{fd.jobCriteria || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">สิ่งที่สนใจ:</span>
                  <span className="text-gray-900">{fd.interests || '-'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-500 font-medium block mb-1">ความคิดเห็น Digital Transformation:</span>
                  <span className="text-gray-900">{fd.digitalTransformOpinion || '-'}</span>
                </div>
              </div>

              {/* 9. Health & Emergency */}
              <SectionHeader title="สุขภาพและผู้ติดต่อฉุกเฉิน" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-blue-800 mb-2">ผู้ติดต่อฉุกเฉิน</h5>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">ชื่อ:</span> <span className="font-medium">{fd.emergencyContactName || '-'}</span></div>
                    <div><span className="text-gray-600">ความสัมพันธ์:</span> <span className="font-medium">{fd.emergencyContactRelation || '-'}</span></div>
                    <div><span className="text-gray-600">เบอร์โทร:</span> <span className="font-medium">{fd.emergencyContactPhone || '-'}</span></div>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h5 className="font-semibold text-sm text-red-800 mb-2">ประวัติสุขภาพ</h5>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-600">โรคประจำตัว:</span> <span className="font-medium">{fd.hasChronicDisease ? fd.chronicDiseaseDetail : 'ไม่มี'}</span></div>
                    <div><span className="text-gray-600">ประวัติผ่าตัด:</span> <span className="font-medium">{fd.hasSurgery ? fd.surgeryDetail : 'ไม่มี'}</span></div>
                    <div><span className="text-gray-600">ประวัติการรักษา:</span> <span className="font-medium">{fd.hasMedicalRecord ? fd.medicalRecordDetail : 'ไม่มี'}</span></div>
                  </div>
                </div>
              </div>

              {/* Source Tags */}
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> ช่องทางที่มา
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(fd.businessUnit || viewingApp.business_unit) && <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">BU: {fd.businessUnit || viewingApp.business_unit}</span>}
                  {(fd.sourceChannel || viewingApp.source_channel) && <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">Channel: {fd.sourceChannel || viewingApp.source_channel}</span>}
                  {(fd.campaignTag || viewingApp.campaign_tag) && <span className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">Tag: {fd.campaignTag || viewingApp.campaign_tag}</span>}
                </div>
              </div>

              {/* Attachments */}
              {(fd.resumeUrl || fd.certificateUrl || fd.profileLinks) && (
                <div className="mt-4 pt-3 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">ไฟล์แนบ & Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {fd.resumeUrl && (
                      <a href={fd.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                        <FileText className="w-4 h-4" /> Resume
                      </a>
                    )}
                    {fd.certificateUrl && (
                      <a href={fd.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition">
                        <FileText className="w-4 h-4" /> เอกสารแนบ
                      </a>
                    )}
                    {fd.profileLinks && (
                      <a href={fd.profileLinks} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 rounded text-sm text-blue-700 transition">
                        <ExternalLink className="w-4 h-4" /> Profile Link
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t sticky bottom-0 bg-white pb-2">
                <Button variant="outline" onClick={() => {
                  // Store form_data in localStorage and open print.html
                  const fd = viewingApp.form_data ? { ...viewingApp.form_data } : {};
                  fd.created_at = viewingApp.created_at;
                  fd.id = viewingApp.id;
                  localStorage.setItem('printPreviewData', JSON.stringify(fd));
                  window.open('/print.html', '_blank');
                }}>
                  <ExternalLink className="w-4 h-4 mr-2" /> เปิด Preview เต็มจอ
                </Button>
                <Button variant="outline" onClick={() => { setEditingApp(viewingApp); setViewingApp(null); }}>
                  <Edit className="w-4 h-4 mr-2" /> แก้ไขข้อมูล
                </Button>
                {viewingApp.status === 'Pending' && (
                  <>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setApprovingApp(viewingApp); setViewingApp(null); }}>
                      <CheckCircle className="w-4 h-4 mr-2" /> รับเข้าทำงาน
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setRejectingApp(viewingApp); setViewingApp(null); setRejectComment(''); }}>
                      <XCircle className="w-4 h-4 mr-2" /> ไม่รับ
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setViewingApp(null)} className="ml-auto">ปิด</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

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
                  await api.updateApplicationStatus(approvingApp.id, 'Hired');
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
              <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผล/หมายเหตุ (ถ้ามี)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
                placeholder="ระบุเหตุผลในการปฏิเสธ..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setRejectingApp(null)}>ยกเลิก</Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await api.updateApplicationStatus(rejectingApp.id, 'Rejected', rejectComment);
                  setRejectingApp(null);
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
      <Modal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        title="แก้ไขข้อมูลผู้สมัคร"
        size="lg"
        footer={null}
      >
        {editingApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">แผนก <span className="text-red-500">*</span></label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editForm.department}
                  onChange={(e) => {
                    const selectedDept = departments.find((d: any) => (d.name_th || d.name) === e.target.value);
                    setEditForm(prev => ({
                      ...prev,
                      department: e.target.value,
                      departmentId: selectedDept?.id || 0,
                      position: '' // Clear position when department changes
                    }));
                  }}
                >
                  <option value="">-- เลือกแผนกก่อน --</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.name_th || d.name}>{d.name_th || d.name}</option>
                  ))}
                  {editForm.department && !departments.find((d: any) => (d.name_th || d.name) === editForm.department) && (
                    <option value={editForm.department}>{editForm.department} (ข้อมูลเดิม)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง <span className="text-red-500">*</span></label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={editForm.position}
                  onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                  disabled={!editForm.departmentId && !editForm.position}
                >
                  <option value="">{editForm.departmentId ? '-- เลือกตำแหน่ง --' : '-- เลือกแผนกก่อน --'}</option>
                  {editFilteredPositions.map((p: any) => (
                    <option key={p.id} value={p.name_th || p.name}>{p.name_th || p.name}</option>
                  ))}
                  {editForm.position && !editFilteredPositions.find((p: any) => (p.name_th || p.name) === editForm.position) && (
                    <option value={editForm.position}>{editForm.position} (ข้อมูลเดิม)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เงินเดือนที่คาดหวัง</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.expectedSalary}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expectedSalary: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Pending">รอดำเนินการ</option>
                  <option value="Hired">รับแล้ว</option>
                  <option value="Rejected">ไม่ผ่าน</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ส่วนสูง (ซม.)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.height || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนัก (กก.)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editForm.weight || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">ข้อมูลช่องทาง</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={editForm.businessUnit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, businessUnit: e.target.value }))}
                  >
                    <option value="">-- เลือก BU --</option>
                    {businessUnits.map((bu: any) => (
                      <option key={bu.id} value={bu.name_th || bu.name}>{bu.name_th || bu.name}</option>
                    ))}
                    {editForm.businessUnit && !businessUnits.find((bu: any) => (bu.name_th || bu.name) === editForm.businessUnit) && (
                      <option value={editForm.businessUnit}>{editForm.businessUnit} (ข้อมูลเดิม)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={editForm.sourceChannel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sourceChannel: e.target.value }))}
                  >
                    <option value="">-- เลือก Channel --</option>
                    {channels.map((ch: any) => (
                      <option key={ch.id} value={ch.name_th || ch.name}>{ch.name_th || ch.name}</option>
                    ))}
                    {editForm.sourceChannel && !channels.find((ch: any) => (ch.name_th || ch.name) === editForm.sourceChannel) && (
                      <option value={editForm.sourceChannel}>{editForm.sourceChannel} (ข้อมูลเดิม)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editForm.campaignTag}
                    onChange={(e) => setEditForm(prev => ({ ...prev, campaignTag: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingApp(null)}>ยกเลิก</Button>
              <Button
                onClick={async () => {
                  setIsSavingEdit(true);
                  try {
                    const updatedFormData = {
                      ...editingApp.form_data,
                      position: editForm.position,
                      department: editForm.department,
                      expectedSalary: editForm.expectedSalary,
                      phone: editForm.phone,
                      email: editForm.email,
                      businessUnit: editForm.businessUnit,
                      sourceChannel: editForm.sourceChannel,
                      campaignTag: editForm.campaignTag,
                      height: editForm.height,
                      weight: editForm.weight,
                    };
                    // Only update columns that definitely exist in the database
                    const { error } = await supabase
                      .from('applications')
                      .update({
                        position: editForm.position,
                        department: editForm.department,
                        phone: editForm.phone,
                        email: editForm.email,
                        status: editForm.status,
                        business_unit: editForm.businessUnit,
                        source_channel: editForm.sourceChannel,
                        campaign_tag: editForm.campaignTag,
                        form_data: updatedFormData,
                      })
                      .eq('id', editingApp.id);
                    if (error) throw error;
                    showToast('บันทึกสำเร็จ!', 'success');
                    setEditingApp(null);
                    fetchData();
                  } catch (err: any) {
                    console.error('Save error:', err);
                    showToast('บันทึกไม่สำเร็จ: ' + (err.message || 'Unknown error'), 'error');
                  } finally {
                    setIsSavingEdit(false);
                  }
                }}
                isLoading={isSavingEdit}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> บันทึกการแก้ไข
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
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
      )}
    </div>
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
    await api.master.toggleActive(activeTable, confirmAction.id, confirmAction.current);
    fetchTableData();
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Master Data Configuration</h2>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add New</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 p-0 h-fit overflow-hidden">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
            </div>
          )}

          {/* Pagination Controls */}
          <div className="mt-auto pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
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
              <span>
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
          {['business_units', 'universities', 'faculties', 'channels'].includes(activeTable) && (
            <Input label="Name" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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

      {/* Confirmation Modal */}
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
