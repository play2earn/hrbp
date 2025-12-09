
import React, { useState, useEffect } from 'react';
import { MOCK_BU } from '../constants';
import { Card, Button, Input, Select, Modal } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LucideIcon, Home, FileText, QrCode, Settings, LogOut, CheckCircle, XCircle, Search, Filter, Download, ExternalLink, Calendar, Menu, X, ChevronRight, User, Shield, Users, Copy, Check, Database, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Role } from '../types';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

interface DashboardProps {
  role: 'admin' | 'mod';
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ role, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'qr' | 'settings' | 'config'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [applications, setApplications] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null); // For Edit Modal
  const [stats, setStats] = useState({ total: 0, pending: 0, hired: 0, rejected: 0 });
  const [isConfirmingDisable, setIsConfirmingDisable] = useState(false);
  const [loading, setLoading] = useState(true);

  // QR Generator State
  const [qrParams, setQrParams] = useState({ bu: '', ch: '', tag: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchData();
    if (role === 'admin') {
      fetchPendingUsers();
      fetchActiveUsers();
    }
  }, [role]);

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

  const generateLink = () => {
    const baseUrl = window.location.href.split('?')[0]; // Current base
    const params = new URLSearchParams();
    if (qrParams.bu) params.append('bu', qrParams.bu);
    if (qrParams.ch) params.append('ch', qrParams.ch);
    if (qrParams.tag) params.append('tag', qrParams.tag);

    setGeneratedLink(`${baseUrl}?${params.toString()}`);
    setIsCopied(false);
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
    <div className="flex h-screen bg-gray-100 overflow-hidden">

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
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 hidden lg:block">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">N</div>
            NovaAdmin
          </h1>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold ml-10">{role} access</p>
        </div>

        <div className="lg:hidden p-6 bg-slate-800/50 mb-2 mt-14">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Current User</p>
          <p className="font-medium text-lg capitalize">{role}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <SidebarItem id="overview" label="Overview" icon={Users} />
          <SidebarItem id="qr" label="QR Generator" icon={QrCode} />
          <SidebarItem id="config" label="Master Data" icon={Database} />
          {role === 'admin' && <SidebarItem id="settings" label="Settings" icon={Settings} />}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900">
          <Button variant="secondary" className="w-full justify-start bg-slate-800 hover:bg-slate-700 border border-slate-700" onClick={onLogout}>
            Log Out
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
                <Card className="flex items-center p-6 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4"><FileText className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </Card>
                <Card className="flex items-center p-6 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4"><Users className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </Card>
                <Card className="flex items-center p-6 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 mr-4"><CheckCircle className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Hired (YTD)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
                  </div>
                </Card>
                <Card className="flex items-center p-6 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4"><XCircle className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                  </div>
                </Card>
              </div>

              {/* Recent Applications Table */}
              <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Applications</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.slice(0, 10).map((app: any) => (
                        <tr key={app.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.full_name || 'Unknown'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.position || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                                app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {app.status === 'Pending' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleAppAction(app.id, 'Hired')}>Accept</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAppAction(app.id, 'Rejected')}>Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {applications.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No applications found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="h-96">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Application Trends (Mock)</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
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
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
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
            <div className="max-w-3xl form-step-enter">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code & Link Generator</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* QR Content (Unchanged) */}
                <div className="lg:col-span-2">
                  <Card className="space-y-6 h-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Select label="Business Unit" options={MOCK_BU.map(b => ({ label: b, value: b }))} value={qrParams.bu} onChange={(e) => setQrParams(p => ({ ...p, bu: e.target.value }))} />
                      <Input label="Channel" value={qrParams.ch} onChange={(e) => setQrParams(p => ({ ...p, ch: e.target.value }))} />
                      <div className="col-span-1 sm:col-span-2">
                        <Input label="Campaign Tag" value={qrParams.tag} onChange={(e) => setQrParams(p => ({ ...p, tag: e.target.value }))} placeholder="e.g. SummerIntern2024" />
                      </div>
                    </div>
                    <Button onClick={generateLink} className="w-full sm:w-auto" size="lg">Generate QR Code</Button>
                  </Card>
                </div>
                <div className="lg:col-span-1">
                  {/* QR Display Logic */}
                  <Card className="flex flex-col items-center justify-center h-full bg-white border-2 border-dashed border-indigo-100">
                    {generatedLink ? (
                      <div className="text-center">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedLink)}`} alt="QR" className="mx-auto mb-4" />
                        <Button variant="outline" size="sm" onClick={handleCopy}>{isCopied ? 'Copied!' : 'Copy Link'}</Button>
                      </div>
                    ) : <span className="text-gray-400">Configure to generate</span>}
                  </Card>
                </div>
              </div>
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
                  <div className="border rounded-lg divide-y overflow-hidden">
                    {pendingUsers.map(user => (
                      <div key={user.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900">{user.full_name} <span className="text-xs text-gray-500">({user.role})</span></p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUserAction(user.id, 'Active')}>Approve</Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUserAction(user.id, 'Rejected')}>Reject</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-gray-800">Existing Users</h3>
                  <Button variant="outline" size="sm">Add New User</Button>
                </div>
                {activeUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4 text-center">No active users found.</p>
                ) : (
                  <div className="border rounded-lg divide-y overflow-hidden">
                    {activeUsers.map(user => (
                      <div key={user.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                            ${user.role === 'admin' ? 'bg-purple-600' : 'bg-indigo-600'}`}>
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.full_name} <span className="text-xs text-gray-500 capitalize">({user.role})</span></p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingUser(user); setIsConfirmingDisable(false); }}>Manage</Button>
                        </div>
                      </div>
                    ))}
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
            </div>
          )}

          {activeTab === 'config' && (
            <MasterDataConfig />
          )}
        </div>
      </main>
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

  const TABLES = [
    { id: 'departments', label: 'Departments' },
    { id: 'positions', label: 'Positions' },
    { id: 'business_units', label: 'Business Units' },
    { id: 'channels', label: 'Channels' },
    { id: 'universities', label: 'Universities' },
    { id: 'faculties', label: 'Colleges/Faculties' },
    { id: 'provinces', label: 'Provinces' },
    { id: 'districts', label: 'Districts' },
    { id: 'subdistricts', label: 'Subdistricts' },
  ];

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
        <Card className="col-span-1 p-2 h-fit">
          <nav className="space-y-1">
            {TABLES.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTable(t.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTable === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {t.label}
              </button>
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
