
import React, { useState, useEffect } from 'react';
import { MOCK_BU } from '../constants';
import { Card, Button, Input, Select, Modal } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LucideIcon, Home, FileText, QrCode, Settings, LogOut, CheckCircle, XCircle, Search, Filter, Download, ExternalLink, Calendar, Menu, X, ChevronRight, ChevronLeft, ChevronDown, User, Shield, Users, Copy, Check, Database, Plus, Edit, Trash2, Building2, Tag, GraduationCap, MapPin, Phone, UserPlus, UserCheck, History, Clock, ArrowRightLeft, BarChart2, ShieldAlert, Save, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../supabaseClient';
import { Role, BlacklistEntry } from '../types';
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
import { BlacklistTab } from './dashboard/BlacklistTab';
import { CalendarTab } from './dashboard/CalendarTab';
import { SystemLogsTab } from './dashboard/SystemLogsTab';


export const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'qr' | 'settings' | 'config' | 'profile' | 'blacklist' | 'calendar' | 'logs'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Feature Release Announcement State
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [dontShowReleaseAgain, setDontShowReleaseAgain] = useState(false);

  const handleCloseReleaseModal = React.useCallback((shouldRedirect: boolean = false) => {
    const currentVersion = "v1.1.2-talent-analytics";
    if (dontShowReleaseAgain || shouldRedirect) {
      localStorage.setItem("last_seen_release_version", currentVersion);
    }
    setShowReleaseModal(false);
    if (shouldRedirect) {
      setActiveTab("reports");
    }
  }, [dontShowReleaseAgain]);

  // Current User Info
  const [currentUser, setCurrentUser] = useState<{ id?: string; full_name: string; email: string; role: string; emp_id?: string } | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [profileEmpId, setProfileEmpId] = useState<string | null>(null);

  // Data State
  const [applications, setApplications] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [calendarApplications, setCalendarApplications] = useState<any[]>([]);
  const [statsApplications, setStatsApplications] = useState<any[]>([]);
  const [blacklistEntries, setBlacklistEntries] = useState<BlacklistEntry[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null); // For Edit Modal
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewing: 0, interviewing: 0, hired: 0, rejected: 0 });
  const [isConfirmingDisable, setIsConfirmingDisable] = useState(false);
  const [loading, setLoading] = useState(true);



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
  const [qrPage, setQrPage] = useState<number>(1);
  const [qrTotalCount, setQrTotalCount] = useState<number>(0);
  const [qrLogCreators, setQrLogCreators] = useState<string[]>([]);
  const [confirmQrAction, setConfirmQrAction] = useState<'empty' | 'filled' | null>(null);

  const [appFilters, setAppFilters] = useState({
    search: '',
    position: '',
    department: '',
    bu: '',
    channel: '',
    status: 'all',
    assignment: 'all',
    blacklist: 'all'
  });
  const [appPage, setAppPage] = useState(1);
  const [appPerPage, setAppPerPage] = useState(25);
  const [viewingAppState, setViewingAppState] = useState<any | null>(null);
  const viewingApp = viewingAppState;
  const setViewingApp = React.useCallback(async (app: any | null) => {
    if (!app) {
      setViewingAppState(null);
      return;
    }
    setViewingAppState(app);
    if (app.form_data && (app.form_data.resumeUrl !== undefined || app.form_data.transcriptUrl !== undefined)) {
      return;
    }
    try {
      const fullApp = await api.getApplicationById(app.id);
      if (fullApp) {
        setViewingAppState(fullApp);
      }
    } catch (err) {
      console.error("Failed to fetch full application:", err);
    }
  }, []);
  const [viewingBlacklistDetail, setViewingBlacklistDetail] = useState<any | null>(null);
  const [claimingApp, setClaimingApp] = useState<any | null>(null);
  const [evaluatingApp, setEvaluatingApp] = useState<any | null>(null);
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
  const openActionMenu = React.useCallback((appId: string, e: React.MouseEvent) => {
    if (actionMenu?.id === appId) { setActionMenu(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const openUp = rect.bottom + 250 > window.innerHeight;
    setActionMenu({ id: appId, x: rect.right, y: openUp ? rect.top : rect.bottom + 4, openUp });
  }, [actionMenu]);

  const [appLogs, setAppLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [editingAppState, setEditingAppState] = useState<any | null>(null);
  const editingApp = editingAppState;
  const setEditingApp = React.useCallback(async (app: any | null) => {
    if (!app) {
      setEditingAppState(null);
      return;
    }
    setEditingAppState(app);
    if (app.form_data && (app.form_data.resumeUrl !== undefined || app.form_data.transcriptUrl !== undefined)) {
      return;
    }
    try {
      const fullApp = await api.getApplicationById(app.id);
      if (fullApp) {
        setEditingAppState(fullApp);
      }
    } catch (err) {
      console.error("Failed to fetch full application for editing:", err);
    }
  }, []);
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
    photoUrl: '',
    firstName: '',
    lastName: '',
    firstNameEn: '',
    lastNameEn: '',
    title: '',
    titleEn: '',
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
        firstName: fd.firstName || editingApp.first_name || '',
        lastName: fd.lastName || editingApp.last_name || '',
        firstNameEn: fd.firstNameEn || '',
        lastNameEn: fd.lastNameEn || '',
        title: fd.title || editingApp.title || '',
        titleEn: fd.titleEn || '',
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

  // Fetch activity logs and record profile view in system logs
  useEffect(() => {
    if (viewingApp?.id) {
      setIsLoadingLogs(true);
      api.getApplicationLogs(viewingApp.id).then(logs => {
        setAppLogs(logs);
        setIsLoadingLogs(false);
      });

      // Record profile view action
      if (currentUser) {
        api.systemLogs.addLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_role: currentUser.role,
          action: 'view_candidate_profile',
          target_id: viewingApp.id,
          target_name: viewingApp.full_name,
          metadata: {
            position: viewingApp.position || '',
            department: viewingApp.department || '',
            business_unit: viewingApp.business_unit || viewingApp.form_data?.businessUnit || 'ไม่ระบุ BU',
            status: viewingApp.status || ''
          }
        });
      }
    } else {
      setAppLogs([]);
    }
  }, [viewingApp?.id, currentUser]);

  // Log tab navigation clicks (excluding Overview tab to avoid redundant logging on load)
  useEffect(() => {
    if (currentUser && activeTab) {
      const tabActions: Record<string, { action: string, label: string }> = {
        calendar: { action: 'view_tab_calendar', label: 'Calendar' },
        qr: { action: 'view_tab_qr', label: 'QR Generator' },
        reports: { action: 'view_tab_reports', label: 'Reports' },
        config: { action: 'view_tab_config', label: 'Master Data Config' },
        blacklist: { action: 'view_tab_blacklist', label: 'Blacklist' },
        settings: { action: 'view_tab_settings', label: 'Settings (User Management)' },
        profile: { action: 'view_tab_profile', label: 'My Profile' },
        logs: { action: 'view_tab_system_logs', label: 'System Logs' },
      };

      const mapped = tabActions[activeTab];
      if (mapped) {
        api.systemLogs.addLog({
          user_id: currentUser.id,
          user_name: currentUser.full_name,
          user_role: currentUser.role,
          action: mapped.action,
          target_name: mapped.label,
          metadata: { tab: activeTab }
        });
      }
    }
  }, [activeTab, currentUser]);

  // Helper to open full preview in new tab
  const openFullPreview = (app: any) => {
    const fd = app.form_data || {};
    const previewData = JSON.stringify(fd);
    localStorage.setItem('previewData', previewData);
    window.open('/preview', '_blank');
  };



  const fetchQrMasterData = React.useCallback(async () => {
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
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch Blacklist Entries (needed for table marking and filters)
    const blacklistRes = await api.blacklist.getEntries();
    let currentBlacklist: any[] = [];
    if (blacklistRes.success && blacklistRes.data) {
      currentBlacklist = blacklistRes.data.filter(e => e.status === 'active');
      setBlacklistEntries(currentBlacklist);
    }

    // 2. Fetch stats payload (lightweight list of all rows)
    const statsData = await api.getApplicationsStats();
    setStatsApplications(statsData);

    // Calculate simple stats
    const total = statsData.length;
    const pending = statsData.filter((a: any) => a.status === 'Pending').length;
    const reviewing = statsData.filter((a: any) => a.status === 'Reviewing').length;
    const interviewing = statsData.filter((a: any) => isInterviewScheduledStatus(a.status) || a.status === 'Interviewed' || a.status === 'Offer').length;
    const hired = statsData.filter((a: any) => a.status === 'Hired').length;
    const rejected = statsData.filter((a: any) => a.status === 'Rejected' || a.status === 'Withdrawn' || a.status === 'NoShow').length;
    setStats({ total, pending, reviewing, interviewing, hired, rejected });

    // 3. Fetch current page of applications
    try {
      const result = await api.getApplicationsPaginated({
        page: appPage,
        limit: appPerPage,
        search: appFilters.search,
        status: appFilters.status,
        position: appFilters.position,
        department: appFilters.department,
        bu: appFilters.bu,
        channel: appFilters.channel,
        assignment: appFilters.assignment,
        currentUserId: currentUserId,
        blacklist: appFilters.blacklist,
        blacklistEntries: currentBlacklist
      });
      setApplications(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [appPage, appPerPage, appFilters, currentUserId]);

  const fetchPaginatedApplications = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getApplicationsPaginated({
        page: appPage,
        limit: appPerPage,
        search: appFilters.search,
        status: appFilters.status,
        position: appFilters.position,
        department: appFilters.department,
        bu: appFilters.bu,
        channel: appFilters.channel,
        assignment: appFilters.assignment,
        currentUserId: currentUserId,
        blacklist: appFilters.blacklist,
        blacklistEntries: blacklistEntries
      });
      setApplications(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error("Failed to fetch paginated applications:", err);
    } finally {
      setLoading(false);
    }
  }, [appPage, appPerPage, appFilters, currentUserId, blacklistEntries]);

  // Effect to refetch when pagination/filters change (after initial mount)
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchPaginatedApplications();
  }, [appPage, appPerPage, appFilters]);

  // Effect to refetch calendar interviews when tab changes to calendar
  useEffect(() => {
    if (activeTab === 'calendar') {
      api.getCalendarInterviews().then(setCalendarApplications);
    }
  }, [activeTab]);

  const fetchPendingUsers = React.useCallback(async () => {
    const { data } = await api.auth.getPendingUsers();
    if (data) setPendingUsers(data);
  }, []);

  const fetchActiveUsers = React.useCallback(async () => {
    const { data } = await api.auth.getActiveUsers();
    if (data) setActiveUsers(data);
  }, []);


  const handleUserAction = React.useCallback(async (id: string, status: 'Active' | 'Rejected' | 'Inactive') => {
    await api.auth.updateUserStatus(id, status);
    fetchPendingUsers();
    fetchActiveUsers();
  }, [fetchPendingUsers, fetchActiveUsers]);

  const handleUpdateUser = React.useCallback(async (status: 'Active' | 'Rejected' | 'Inactive') => {
    if (!editingUser) return;
    await api.auth.updateUserStatus(editingUser.id, status);
    setEditingUser(null);
    setIsConfirmingDisable(false);
    fetchActiveUsers();
    fetchPendingUsers();
  }, [editingUser, fetchActiveUsers, fetchPendingUsers]);


  const handleAppAction = React.useCallback(async (id: string, status: string) => {
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
  }, [currentUserId, fetchData]);

  const handleDeleteApplication = React.useCallback(async () => {
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
  }, [deletingApp, fetchData]);

  const fetchQrLogs = React.useCallback(async (page: number = 1, filter?: string) => {
    const filterToUse = filter !== undefined ? filter : qrLogCreatorFilter;
    const result = await api.getQrLogs(page, 30, filterToUse);
    setQrLogs(result.data);
    setQrTotalCount(result.count);
    setQrPage(page);
  }, [qrLogCreatorFilter]);

  const fetchQrLogCreatorsList = React.useCallback(async () => {
    const creators = await api.getQrLogCreators();
    setQrLogCreators(creators);
  }, []);

  const filteredQrLogs = qrLogs;


  const generateLink = React.useCallback(() => {
    if (!qrParams.bu || !qrParams.ch) {
      setConfirmQrAction('empty');
    } else {
      setConfirmQrAction('filled');
    }
  }, [qrParams.bu, qrParams.ch]);

  const executeGenerateLink = React.useCallback(async () => {
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
    fetchQrLogCreatorsList();
    fetchQrLogs(1);
  }, [qrParams, currentUser, fetchQrLogs, fetchQrLogCreatorsList]);

  const handleCopy = React.useCallback(async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [generatedLink]);


  useEffect(() => {
    // Load current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    let defaultFilter = 'all';
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        if (user.full_name && user.email) {
          defaultFilter = `${user.full_name} (${user.email})`;
          setQrLogCreatorFilter(defaultFilter);
        }
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
    fetchQrLogCreatorsList();
    fetchQrLogs(1, defaultFilter);
    if (role === 'admin') {
      fetchPendingUsers();
      fetchActiveUsers();
    }

    // Check if user has seen new release feature announcement
    const currentVersion = "v1.1.2-talent-analytics";
    const lastSeen = localStorage.getItem("last_seen_release_version");
    if (lastSeen !== currentVersion) {
      const timer = setTimeout(() => {
        setShowReleaseModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    statsApplications.forEach(app => {
      const bu = app.business_unit || app.department || 'ไม่ระบุ BU';
      counts[bu] = (counts[bu] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [statsApplications]);

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

    statsApplications.forEach(app => {
      if (!app.created_at) return;
      const d = new Date(app.created_at);
      const targetTarget = result.find(r => r.month === d.getMonth() && r.year === d.getFullYear());
      if (targetTarget) {
        targetTarget.applications += 1;
      }
    });

    return result;
  }, [statsApplications]);

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
            onClick={() => { setActiveTab('calendar'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="Calendar"
          >
            <Calendar className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Calendar</span>}
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
          <button
            onClick={() => { setActiveTab('blacklist'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'blacklist' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            title="Blacklist"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Blacklist</span>}
          </button>
          {role === 'admin' && (
            <>
              <button
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                title="Settings"
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">Settings</span>}
              </button>
              <button
                onClick={() => { setActiveTab('logs'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                title="System Logs"
              >
                <History className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">System Logs</span>}
              </button>
            </>
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

          {activeTab === 'reports' && (
            <ReportsTab
              setViewingApp={setViewingApp}
              currentUserId={currentUserId}
              activeUsers={activeUsers}
              businessUnits={businessUnits}
              departments={departments}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab
              applications={calendarApplications}
              activeUsers={activeUsers}
              businessUnits={businessUnits}
              setViewingApp={setViewingApp}
              currentUser={currentUser}
            />
          )}

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
              blacklistEntries={blacklistEntries}
              onViewBlacklistDetail={setViewingBlacklistDetail}
              loading={loading}
              totalCount={totalCount}
              statsApplications={statsApplications}
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
              setQrLogCreatorFilter={(val) => {
                setQrLogCreatorFilter(val);
                fetchQrLogs(1, val);
              }}
              qrLogCreators={qrLogCreators}
              fetchQrLogs={fetchQrLogs}
              showToast={showToast}
              qrPage={qrPage}
              setQrPage={setQrPage}
              qrTotalCount={qrTotalCount}
              qrPerPage={30}
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
            />
          )}

          {activeTab === 'logs' && role === 'admin' && (
            <SystemLogsTab
              showToast={showToast}
              currentUser={currentUser}
              onViewCandidate={async (appId) => {
                const found = applications.find(a => a.id === appId);
                if (found) {
                  setViewingApp(found);
                  return;
                }
                // Fallback to fetch from database if not in memory
                try {
                  const { data, error } = await supabase
                    .from('applications')
                    .select('*')
                    .eq('id', appId)
                    .maybeSingle();
                  if (error || !data) {
                    showToast('ไม่พบข้อมูลผู้สมัครรายนี้แล้ว (อาจถูกลบหรือไม่มีในระบบ)', 'error');
                  } else {
                    setViewingApp(data);
                  }
                } catch (err) {
                  showToast('เกิดข้อผิดพลาดในการดึงข้อมูลผู้สมัคร', 'error');
                }
              }}
            />
          )}

          {activeTab === 'config' && (
            <MasterDataConfig showToast={showToast} currentUser={currentUser} />
          )}

          {activeTab === 'blacklist' && (
            <BlacklistTab showToast={showToast} currentUser={currentUser} />
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
        blacklistEntries={blacklistEntries}
        onViewBlacklistDetail={setViewingBlacklistDetail}
        setEvaluatingApp={setEvaluatingApp}
      />

      {/* Blacklist Details Modal */}
      <Modal
        isOpen={!!viewingBlacklistDetail}
        onClose={() => setViewingBlacklistDetail(null)}
        title="รายละเอียดประวัติเสีย (Blacklist Case Details)"
        size="lg"
        footer={null}
      >
        {viewingBlacklistDetail && (
          <div className="space-y-4 text-sm">
            <div className="bg-red-50 border border-red-150 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800 text-base">⚠️ สถานะเฝ้าระวัง (Blacklist Detected)</h4>
                <p className="text-xs text-red-700 leading-relaxed mt-1">
                  ผู้สมัครรายนี้ตรงกับข้อมูลประวัติเสียในฐานข้อมูลของฝ่ายบุคคล กรุณาดำเนินการด้วยความระมัดระวัง
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-3.5">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">ชื่อ-นามสกุล</span>
                <span className="font-semibold text-gray-900 text-sm">
                  {viewingBlacklistDetail.first_name} {viewingBlacklistDetail.last_name}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">สถานะบัญชีดำ</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-0.5 ${viewingBlacklistDetail.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                  {viewingBlacklistDetail.status === 'active' ? 'เฝ้าระวัง' : 'ปิดใช้งาน'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-3.5">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">เลขบัตรประชาชน (ID)</span>
                <span className="font-mono text-gray-900 font-semibold">{viewingBlacklistDetail.national_id || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">เลขพาสปอร์ต (Passport)</span>
                <span className="font-mono text-gray-900 font-semibold">{viewingBlacklistDetail.passport_no || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-3.5">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">เบอร์โทรศัพท์</span>
                <span className="font-mono text-gray-900">{viewingBlacklistDetail.phone || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">อีเมล</span>
                <span className="text-gray-900 truncate block">{viewingBlacklistDetail.email || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b pb-3.5">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">หมวดหมู่ความผิด</span>
                <span className="font-semibold text-gray-900">
                  {viewingBlacklistDetail.reason_category === 'theft' ? 'ขโมยทรัพย์สิน (Theft)' :
                   viewingBlacklistDetail.reason_category === 'policy_violation' ? 'ผิดกฏระเบียบบริษัท (Policy)' :
                   viewingBlacklistDetail.reason_category === 'attendance' ? 'ขาดงาน/ละทิ้งหน้าที่ (Attendance)' :
                   viewingBlacklistDetail.reason_category === 'harassment' ? 'ล่วงละเมิด/ทะเลาะวิวาท (Harassment)' :
                   viewingBlacklistDetail.reason_category === 'fraud' ? 'ทุจริต/ปลอมเอกสาร (Fraud)' : 'อื่นๆ (Other)'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">ระดับความรุนแรง</span>
                <span className="inline-block mt-0.5">
                  {viewingBlacklistDetail.severity_level === 'high' ? (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded font-bold text-xs">สูง (High)</span>
                  ) : viewingBlacklistDetail.severity_level === 'medium' ? (
                    <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded font-bold text-xs">กลาง (Medium)</span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold text-xs">ต่ำ (Low)</span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b pb-3.5">
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">BU เดิม</span>
                <span className="text-gray-900 font-medium">{viewingBlacklistDetail.original_bu || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">แผนกที่พบเหตุ</span>
                <span className="text-gray-900 font-medium">{viewingBlacklistDetail.original_department || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">วันที่เกิดเหตุ</span>
                <span className="text-gray-900 font-medium">{viewingBlacklistDetail.incident_date || '-'}</span>
              </div>
            </div>

            {viewingBlacklistDetail.description && (
              <div className="border-b pb-3.5">
                <span className="block text-xs font-semibold text-gray-400 uppercase">รายละเอียดพฤติกรรม</span>
                <p className="mt-1 bg-gray-50 border rounded-lg p-3 text-xs text-gray-750 leading-relaxed font-mono">
                  {viewingBlacklistDetail.description}
                </p>
              </div>
            )}

            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase mb-2">เอกสารหลักฐานประกอบ</span>
              {(viewingBlacklistDetail.attachment_url_1 || viewingBlacklistDetail.attachment_url_2) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingBlacklistDetail.attachment_url_1 && (
                    <a
                      href={viewingBlacklistDetail.attachment_url_1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-slate-50 hover:border-gray-300 transition-colors text-xs text-indigo-600 font-semibold bg-white"
                    >
                      <span className="truncate max-w-[180px] text-gray-700">{viewingBlacklistDetail.attachment_name_1 || 'หลักฐานแนบ 1'}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  )}
                  {viewingBlacklistDetail.attachment_url_2 && (
                    <a
                      href={viewingBlacklistDetail.attachment_url_2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-slate-50 hover:border-gray-300 transition-colors text-xs text-indigo-600 font-semibold bg-white"
                    >
                      <span className="truncate max-w-[180px] text-gray-700">{viewingBlacklistDetail.attachment_name_2 || 'หลักฐานแนบ 2'}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400 font-medium">- ไม่มีหลักฐานแนบประกอบกรณี -</span>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setViewingBlacklistDetail(null)}>ปิดหน้าต่าง</Button>
            </div>
          </div>
        )}
      </Modal>

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
              <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={async () => {
                  const fd = app.form_data ? { ...app.form_data } : {};
                  fd.created_at = app.created_at;
                  fd.id = app.id;
                  fd.interview_date = app.interview_date;
                  fd.position = app.position;
                  fd.department = app.department;
                  fd.business_unit = app.business_unit;
                  
                  // Fetch master conditions & calendars for memo.html DDL
                  try {
                    const [condsRes, calsRes] = await Promise.all([
                      api.master.getAll('memo_conditions'),
                      api.master.getAll('memo_calendars')
                    ]);
                    fd.masterConditions = condsRes.data || [];
                    fd.masterCalendars = calsRes.data || [];
                  } catch (e) {
                    console.error("Failed to prefetch memo master data", e);
                  }

                  localStorage.setItem('memoPreviewData', JSON.stringify(fd));
                  window.open('/memo.html', '_blank');
                  setActionMenu(null);
                }}
              >
                <FileText className="w-4 h-4 text-emerald-500" /> สร้าง Memo
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
        evaluatingApp={evaluatingApp} setEvaluatingApp={setEvaluatingApp}
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

      {/* Feature Release Announcement Modal */}
      <Modal
        isOpen={showReleaseModal}
        onClose={() => handleCloseReleaseModal(false)}
        title="✨ อัปเดตระบบวิเคราะห์ผู้สมัคร"
        footer={null}
      >
        <div className="relative overflow-hidden text-slate-700">
          {/* Header & Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Release v1.1.2
              </span>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                เปิดตัวแท็บวิเคราะห์ประวัติและรายงานใหม่!
              </h4>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-600 space-y-3 mb-6 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="font-semibold text-slate-700">ฟังก์ชันใหม่ที่เปิดใช้งานให้คุณแล้ว:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] text-slate-500">
              <li>วิเคราะห์ระดับการศึกษา เกรดเฉลี่ยสะสม และทักษะภาษาแบบไดนามิก</li>
              <li>เจาะลึก (Drill-down) จากกราฟสถิติเพื่อคัดกรองข้อมูลผู้สมัครได้ทันที</li>
              <li>ฟิลเตอร์ค้นหาชื่อแผนก ตำแหน่ง และสถาบันแบบ Searchable รวดเร็ว</li>
              <li>คัดกรองประวัติพร้อมเริ่มงานทันทีและตรวจสอบผู้รับเคส</li>
            </ul>
          </div>

          {/* Controls & Footer */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 select-none">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowReleaseAgain}
                onChange={(e) => setDontShowReleaseAgain(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="dontShowAgain" className="text-xs text-slate-500 cursor-pointer">
                ฉันเข้าใจแล้ว ไม่ต้องแสดงหน้าจอนี้อีกในครั้งถัดไป
              </label>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => handleCloseReleaseModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer border border-slate-200"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => handleCloseReleaseModal(true)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 cursor-pointer flex items-center justify-center gap-1"
              >
                เปิดใช้งานทันที
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </div >
  );
};

// --- Sub-component for Master Data Configuration ---
const MasterDataConfig = ({ showToast, currentUser }: { showToast: (message: string, type?: 'success' | 'error') => void; currentUser: any }) => {
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
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  // Redesign State: Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Department Positions Modal State
  const [deptPositionsModal, setDeptPositionsModal] = useState<{ id: number; name: string } | null>(null);
  const [deptPositionsList, setDeptPositionsList] = useState<any[]>([]);
  const [isLoadingDeptPositions, setIsLoadingDeptPositions] = useState(false);

  const openDeptPositions = async (dept: any) => {
    setDeptPositionsModal({ id: dept.id, name: dept.name_th || dept.name });
    setIsLoadingDeptPositions(true);
    try {
      const posData = await api.master.getPositions(dept.id);
      setDeptPositionsList(posData || []);
    } catch (err) {
      console.error("Failed to load positions", err);
      setDeptPositionsList([]);
    }
    setIsLoadingDeptPositions(false);
  };

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
    {
      id: 'memo',
      label: 'Memo Configs',
      icon: 'FileText',
      description: 'ตั้งค่าระบบเอกสาร Memo',
      tables: [
        { id: 'memo_conditions', label: 'Memo Conditions', labelTh: 'เงื่อนไขค่าตอบแทนพิเศษ' },
        { id: 'memo_calendars', label: 'Memo Calendars', labelTh: 'ปฏิทินปฏิบัติงาน' },
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
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || item.condition_text || '').toLowerCase().includes(q);
      const matchId = String(item.id).includes(q);
      return matchName || matchNameTh || matchNameEn || matchTitle || matchDesc || matchId;
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
      const targetItem = data.find(item => item.id === confirmAction.id);
      const targetName = targetItem 
        ? (targetItem.name_th || targetItem.name || targetItem.title || `ID ${confirmAction.id}`) 
        : `ID ${confirmAction.id}`;
        
      const result = await api.master.toggleActive(activeTable, confirmAction.id, confirmAction.current);
      if (!result.success) {
        alert(`Failed to update: ${result.error?.message || 'Unknown error'}`);
      } else {
        // Log toggling master data action
        await api.systemLogs.addLog({
          user_id: currentUser?.id,
          user_name: currentUser?.full_name || 'System / Unknown',
          user_role: currentUser?.role || 'mod',
          action: 'toggle_master_data',
          target_id: String(confirmAction.id),
          target_name: targetName,
          metadata: {
            table: activeTable,
            new_status: !confirmAction.current ? 'Active' : 'Inactive',
            item_id: confirmAction.id
          }
        }).catch(err => console.error("Logging toggle_master_data failed:", err));
      }
      fetchTableData();
    } catch (err: any) {
      alert(`Error: ${err.message || 'Unknown error'}`);
    }
    setConfirmAction(null);
  };

  const handleSave = () => {
    console.log("Validating before save...", formData);
    // Enhanced Validation
    const isMemo = ['memo_conditions', 'memo_calendars'].includes(activeTable);
    const hasAnyName = isMemo 
      ? formData.title 
      : (formData.name || formData.name_th || formData.name_en);

    if (!hasAnyName) {
      alert(isMemo ? "Please enter a title." : "Please enter a name.");
      return;
    }

    setIsConfirmSaveOpen(true);
  };

  const executeSave = async () => {
    setIsConfirmSaveOpen(false);
    try {
      if (editingItem) {
        console.log("Updating item:", editingItem.id);
        const result = await api.master.updateItem(activeTable, editingItem.id, formData);
        if (result.error) throw result.error;
        
        // Log master data update
        const targetName = result.data 
          ? (result.data.name_th || result.data.name || result.data.title || `ID ${editingItem.id}`)
          : `ID ${editingItem.id}`;
          
        await api.systemLogs.addLog({
          user_id: currentUser?.id,
          user_name: currentUser?.full_name || 'System / Unknown',
          user_role: currentUser?.role || 'mod',
          action: 'update_master_data',
          target_id: String(editingItem.id),
          target_name: targetName,
          metadata: {
            table: activeTable,
            payload: formData,
            item_id: editingItem.id
          }
        }).catch(err => console.error("Logging update_master_data failed:", err));
      } else {
        console.log("Adding new item");
        const result = await api.master.addItem(activeTable, formData);
        if (result.error) throw result.error;
        
        // Log master data creation
        const targetName = result.data 
          ? (result.data.name_th || result.data.name || result.data.title || `ID ${result.data.id}`)
          : `New Item`;
          
        await api.systemLogs.addLog({
          user_id: currentUser?.id,
          user_name: currentUser?.full_name || 'System / Unknown',
          user_role: currentUser?.role || 'mod',
          action: 'create_master_data',
          target_id: result.data ? String(result.data.id) : undefined,
          target_name: targetName,
          metadata: {
            table: activeTable,
            payload: formData,
            item_id: result.data ? result.data.id : undefined
          }
        }).catch(err => console.error("Logging create_master_data failed:", err));
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({});
      fetchTableData();
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast(`เกิดข้อผิดพลาดในการบันทึก: ${err.message || 'Unknown error'}`, 'error');
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
                  {group.icon === 'FileText' && <FileText className="w-3.5 h-3.5" />}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {activeTable === 'memo_conditions' || activeTable === 'memo_calendars' ? 'Title' : 'Name (TH/Main)'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {activeTable === 'memo_conditions' ? 'Category / Details' : (activeTable === 'memo_calendars' ? 'Description' : 'Name (EN)')}
                    </th>
                    {activeTable === 'positions' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.is_active === false ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {activeTable === 'departments' ? (
                          <button 
                            className="text-indigo-600 hover:text-indigo-800 hover:underline text-left font-semibold"
                            onClick={() => openDeptPositions(item)}
                          >
                            {item.name_th || item.name}
                          </button>
                        ) : (
                          item.name_th || item.name || item.title || '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {activeTable === 'memo_conditions' ? (
                          <div>
                            <span className="font-semibold text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mr-2 uppercase">{item.category}</span>
                            {item.education_level && (
                              <span className="font-semibold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mr-2 uppercase">{item.education_level}</span>
                            )}
                            <span className="text-gray-600 font-bold text-xs bg-slate-100 px-2 py-0.5 rounded">Amount: {parseFloat(item.amount || 0).toLocaleString('th-TH')} บาท</span>
                            <div className="text-[11px] text-gray-400 mt-1 max-w-sm truncate" title={item.condition_text}>{item.condition_text}</div>
                          </div>
                        ) : activeTable === 'memo_calendars' ? (
                          <div>
                            {item.education_level && (
                              <span className="font-semibold text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded mr-2 uppercase">{item.education_level}</span>
                            )}
                            <div className="text-xs text-gray-500 max-w-sm truncate inline-block" title={item.description}>{item.description}</div>
                          </div>
                        ) : (
                          item.name_en || '-'
                        )}
                      </td>
                      {activeTable === 'positions' && (
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {deptList.find(d => d.id === item.department_id)?.name_th || '-'}
                        </td>
                      )}
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
                        {activeTable === 'departments' ? (
                          <button 
                            className="font-bold text-base text-indigo-600 hover:text-indigo-800 hover:underline mt-1 text-left"
                            onClick={() => openDeptPositions(item)}
                          >
                            {item.name_th || item.name}
                          </button>
                        ) : (
                          <div className="font-bold text-base text-gray-900 mt-1">{item.name_th || item.name || item.title || '-'}</div>
                        )}
                        {activeTable === 'memo_conditions' && (
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <div>
                              <span className="font-semibold text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded mr-1.5 uppercase">{item.category}</span>
                              {item.education_level && (
                                <span className="font-semibold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5 uppercase">{item.education_level}</span>
                              )}
                              <span className="font-bold text-gray-700">{parseFloat(item.amount || 0).toLocaleString('th-TH')} บาท</span>
                            </div>
                            <div className="text-[11px] text-gray-400 line-clamp-2">{item.condition_text}</div>
                          </div>
                        )}
                        {activeTable === 'memo_calendars' && (
                          <div className="text-xs text-gray-400 mt-1">
                            {item.education_level && (
                              <span className="font-semibold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mr-1.5 uppercase">{item.education_level}</span>
                            )}
                            <span className="line-clamp-2">{item.description}</span>
                          </div>
                        )}
                        {!['memo_conditions', 'memo_calendars'].includes(activeTable) && item.name_en && (
                          <div className="text-sm text-gray-500">{item.name_en}</div>
                        )}
                        {activeTable === 'positions' && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium text-gray-500">Dept:</span> {deptList.find(d => d.id === item.department_id)?.name_th || '-'}
                          </div>
                        )}
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

          {activeTable === 'memo_conditions' && (
            <>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">หมวดหมู่ (Category)</label>
                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="academic">Academic (เกียรตินิยม/เรียนดี)</option>
                  <option value="location">Location (ค่าต่างจังหวัด)</option>
                  <option value="language">Language (ค่าภาษา)</option>
                  <option value="institute">Institute (ค่าสถาบัน/วิชาชีพ)</option>
                  <option value="other">Other (อื่นๆ)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">ระดับการศึกษา (Education Level)</label>
                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.education_level || ''}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value || null })}
                >
                  <option value="">ทั้งหมด (All)</option>
                  <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                  <option value="vocational">ปวส. (Vocational)</option>
                </select>
              </div>
              <Input label="ชื่อเงื่อนไขย่อ (Title)" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input label="จำนวนเงิน (Amount)" type="number" value={formData.amount ?? ''} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">ข้อความเงื่อนไขเต็ม (Condition Text)</label>
                <textarea
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="ระบุข้อความเงื่อนไขที่จะแสดงเต็มใน Memo..."
                  value={formData.condition_text || ''}
                  onChange={(e) => setFormData({ ...formData, condition_text: e.target.value })}
                />
              </div>
            </>
          )}

          {activeTable === 'memo_calendars' && (
            <>
              <Input label="ชื่อปฏิทินย่อ (Title)" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">ระดับการศึกษา (Education Level)</label>
                <select
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.education_level || ''}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value || null })}
                >
                  <option value="">ทั้งหมด (All)</option>
                  <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                  <option value="vocational">ปวส. (Vocational)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">รายละเอียดช่วงเวลาทำงาน (Description)</label>
                <textarea
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                  placeholder="ระบุตารางและเวลาการทำงาน..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </>
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

      <Modal
        isOpen={isConfirmSaveOpen}
        onClose={() => setIsConfirmSaveOpen(false)}
        title="ยืนยันการบันทึกข้อมูล"
        footer={null}
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Save className="w-6 h-6" />
          </div>
          <p className="mb-6 text-gray-600">
            คุณยืนยันที่จะบันทึกการเปลี่ยนแปลงนี้ใช่หรือไม่?
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setIsConfirmSaveOpen(false)}>ยกเลิก</Button>
            <Button onClick={executeSave}>ยืนยัน</Button>
          </div>
        </div>
      </Modal>

      {/* Department Positions Modal */}
      <Modal
        isOpen={!!deptPositionsModal}
        onClose={() => setDeptPositionsModal(null)}
        title={`ตำแหน่งในแผนก: ${deptPositionsModal?.name}`}
        size="md"
        footer={(
          <Button onClick={() => setDeptPositionsModal(null)} className="w-full">ปิดหน้าต่าง</Button>
        )}
      >
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoadingDeptPositions ? (
            <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : deptPositionsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">ไม่พบตำแหน่งในแผนกนี้</div>
          ) : (
            <div className="space-y-2">
              {deptPositionsList.map(pos => (
                <div key={pos.id} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">{pos.name_th || pos.name}</div>
                    {pos.name_en && <div className="text-xs text-gray-500">{pos.name_en}</div>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${pos.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pos.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};
