import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, CheckCircle, XCircle, Clock, AlertCircle, 
  LogOut, Shield, Download, Filter, Search, Home, UserCheck, 
  UserX, Loader2, Eye, Mail, Phone, Calendar, MapPin, FileText,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MoreVertical,
  TrendingUp, PieChart, Settings, Bell, UserPlus, Edit, Trash2,
  BarChart, Lock, Unlock, RefreshCw, Upload, FileDown, Grid, Heart
} from 'lucide-react';

const BASE_URL = 'https://family-community-registration-production.up.railway.app';

// Main Admin Panel Component
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Login state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    summary: {
      total_registrations: 0,
      approved: 0,
      pending: 0,
      hold: 0,
      rejected: 0
    },
    today: {
      new_registrations: 0,
      approvals: 0,
      rejections: 0
    }
  });

  // Pending users state
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingFilters, setPendingFilters] = useState({
    page: 1,
    size: 10,
    desired_name: '',
    state: '',
    district: '',
    mandal: '',
    gothram: '',
    surname: ''
  });
  const [pendingMeta, setPendingMeta] = useState({
    total_records: 0,
    total_pages: 1
  });

  // Approved users state
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [approvedFilters, setApprovedFilters] = useState({
    page: 1,
    size: 10,
    surname: '',
    gothram: '',
    state: '',
    district: '',
    mandal: '',
    registration_id: ''
  });
  const [approvedMeta, setApprovedMeta] = useState({
    total_records: 0,
    total_pages: 1
  });

  // Bulk action state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [actionReason, setActionReason] = useState('');

  // Modal states
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    if (token && user) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(user));
      fetchDashboardData();
    }
  }, []);

  // Fetch dashboard data when authenticated
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${BASE_URL}/api/v1/admin/dashboard/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/api/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_user', JSON.stringify({ username: loginForm.username }));
        setIsAuthenticated(true);
        setAdminUser({ username: loginForm.username });
        fetchDashboardData();
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsAuthenticated(false);
    setAdminUser(null);
    setActiveTab('dashboard');
  };

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      
      Object.entries(pendingFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${BASE_URL}/api/v1/admin/pending-users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data.data || []);
        setPendingMeta({
          total_records: data.total_records,
          total_pages: data.total_pages
        });
      }
    } catch (err) {
      console.error('Failed to fetch pending users:', err);
    }
  };

  // Fetch approved users
  const fetchApprovedUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams();
      
      Object.entries(approvedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`${BASE_URL}/api/v1/admin/approved-users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApprovedUsers(data.data || []);
        setApprovedMeta({
          total_records: data.total_records,
          total_pages: data.total_pages
        });
      }
    } catch (err) {
      console.error('Failed to fetch approved users:', err);
    }
  };

  // Fetch user detail
  const fetchUserDetail = async (userId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${BASE_URL}/api/v1/admin/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUserDetail(data);
        setShowUserDetail(true);
      }
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      setError('Please select users and an action');
      return;
    }

    if ((bulkAction === 'reject' || bulkAction === 'hold') && !actionReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('admin_token');
      let endpoint = '';
      
      switch (bulkAction) {
        case 'approve':
          endpoint = '/users/bulk-approve';
          break;
        case 'reject':
          endpoint = '/users/bulk-reject';
          break;
        case 'hold':
          endpoint = '/users/bulk-hold';
          break;
        default:
          throw new Error('Invalid action');
      }

      const response = await fetch(`${BASE_URL}/api/v1/admin${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_ids: selectedUsers,
          reason: actionReason
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setSelectedUsers([]);
        setBulkAction('');
        setActionReason('');
        setShowBulkModal(false);
        
        // Refresh data
        fetchDashboardData();
        if (activeTab === 'pending') {
          fetchPendingUsers();
        }
      } else {
        setError(data.detail || 'Action failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = async (type) => {
    try {
      const token = localStorage.getItem('admin_token');
      let endpoint = '';
      let filename = '';
      
      if (type === 'pending') {
        endpoint = '/export-pending-users';
        filename = 'pending_users.csv';
      } else if (type === 'approved') {
        endpoint = '/export-approved-users';
        filename = 'approved_users.csv';
      }

      const response = await fetch(`${BASE_URL}/api/v1/admin${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess(`${filename} downloaded successfully`);
        setShowExportModal(false);
      }
    } catch (err) {
      setError('Export failed. Please try again.');
    }
  };

  // Use effects for data fetching
  useEffect(() => {
    if (isAuthenticated && activeTab === 'pending') {
      fetchPendingUsers();
    }
  }, [isAuthenticated, activeTab, pendingFilters]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'approved') {
      fetchApprovedUsers();
    }
  }, [isAuthenticated, activeTab, approvedFilters]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login Screen - UPDATED: Removed duplicate header/logo
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-green-700 to-emerald-800 p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  {/* Heart symbol added */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-white">Kanagala Trust</h1>
                  <p className="text-green-100 text-sm">Admin Panel</p>
                </div>
              </div>
              <Shield className="w-12 h-12 text-white/80 mx-auto" />
            </div>
            
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleLogin}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Secure Access</p>
                    <p className="text-xs text-blue-600 mt-1">Restricted to authorized personnel only.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard - FIXED: Removed duplicate header, added heart symbol
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      {/* Admin Controls Bar - REPLACED the top navbar */}
      <div className="bg-white border-b border-gray-200 py-4 px-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Grid className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center relative">
                <Shield className="w-6 h-6 text-green-600" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Heart className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Kanagala Charitable Trust</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-green-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-gray-800">{adminUser?.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold relative">
                {adminUser?.username?.charAt(0).toUpperCase()}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Heart className="w-2 h-2 text-white" />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - FIXED: Adjusted height and positioning */}
      <aside className={`fixed left-0 top-20 h-[calc(100vh-200px)] bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden z-40`}>
        {sidebarOpen && (
          <div className="p-6 h-full overflow-y-auto">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-l-4 border-green-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-l-4 border-amber-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Pending Users</span>
                {dashboardData.summary.pending > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                    {dashboardData.summary.pending}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('approved')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'approved'
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Approved Users</span>
              </button>
              
              <button
                onClick={() => setActiveTab('hold')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'hold'
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-l-4 border-purple-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">On Hold</span>
                {dashboardData.summary.hold > 0 && (
                  <span className="ml-auto bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {dashboardData.summary.hold}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('rejected')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'rejected'
                    ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-l-4 border-red-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Rejected</span>
              </button>
              
              <div className="pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Export Data</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </aside>

      {/* Main Content - FIXED: Adjusted padding */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} p-6 pt-0`}>
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-5 rounded-r-lg shadow-sm flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-r-lg shadow-sm flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back, {adminUser?.username}!</p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Registrations</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.summary.total_registrations}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Today: +{dashboardData.today.new_registrations}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">Approved</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.summary.approved}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Today: +{dashboardData.today.approvals}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.summary.pending}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-amber-600 mt-4">Requires verification</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">On Hold</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.summary.hold}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-purple-600 mt-4">Requires attention</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('pending')}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center"
                >
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-800">Review Pending</p>
                  <p className="text-sm text-gray-500">Check new registrations</p>
                </button>
                
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                >
                  <UserCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-800">Bulk Actions</p>
                  <p className="text-sm text-gray-500">Approve/Reject multiple</p>
                </button>
                
                <button
                  onClick={() => setShowExportModal(true)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
                >
                  <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-800">Export Data</p>
                  <p className="text-sm text-gray-500">Download reports</p>
                </button>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">New Registrations</p>
                      <p className="text-sm text-gray-500">Users registered today</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">+{dashboardData.today.new_registrations}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Approvals</p>
                      <p className="text-sm text-gray-500">Users approved today</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">+{dashboardData.today.approvals}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Users Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Pending Users</h2>
                <p className="text-gray-600">Review and manage registration requests</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Bulk Actions</span>
                </button>
                <button
                  onClick={fetchPendingUsers}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name Search</label>
                  <input
                    type="text"
                    value={pendingFilters.desired_name}
                    onChange={(e) => setPendingFilters({...pendingFilters, desired_name: e.target.value, page: 1})}
                    placeholder="Search by desired name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={pendingFilters.state}
                    onChange={(e) => setPendingFilters({...pendingFilters, state: e.target.value, page: 1})}
                    placeholder="Filter by state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    value={pendingFilters.district}
                    onChange={(e) => setPendingFilters({...pendingFilters, district: e.target.value, page: 1})}
                    placeholder="Filter by district"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mandal</label>
                  <input
                    type="text"
                    value={pendingFilters.mandal}
                    onChange={(e) => setPendingFilters({...pendingFilters, mandal: e.target.value, page: 1})}
                    placeholder="Filter by mandal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gothram</label>
                  <input
                    type="text"
                    value={pendingFilters.gothram}
                    onChange={(e) => setPendingFilters({...pendingFilters, gothram: e.target.value, page: 1})}
                    placeholder="Filter by gothram"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Surname</label>
                  <input
                    type="text"
                    value={pendingFilters.surname}
                    onChange={(e) => setPendingFilters({...pendingFilters, surname: e.target.value, page: 1})}
                    placeholder="Filter by surname"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === pendingUsers.length && pendingUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(pendingUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedUsers.length} selected
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {pendingUsers.length} of {pendingMeta.total_records} users
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" className="w-4 h-4" />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Surname
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="w-4 h-4 text-green-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {user.registration_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.desired_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {user.surname}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{user.mobile_number}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm">{user.current_district}, {user.current_state}</p>
                            <p className="text-xs text-gray-500">{user.current_village_city}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm">{formatDate(user.created_at)}</p>
                            <p className="text-xs text-gray-500">{formatTime(user.created_at)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchUserDetail(user.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUsers([user.id]);
                                setBulkAction('approve');
                                handleBulkAction();
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUsers([user.id]);
                                setBulkAction('reject');
                                setShowBulkModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUsers([user.id]);
                                setBulkAction('hold');
                                setShowBulkModal(true);
                              }}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Hold"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {pendingFilters.page} of {pendingMeta.total_pages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPendingFilters({...pendingFilters, page: pendingFilters.page - 1})}
                    disabled={pendingFilters.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                    {pendingFilters.page}
                  </span>
                  <button
                    onClick={() => setPendingFilters({...pendingFilters, page: pendingFilters.page + 1})}
                    disabled={pendingFilters.page >= pendingMeta.total_pages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approved Users Tab */}
        {activeTab === 'approved' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Approved Users</h2>
                <p className="text-gray-600">Verified and approved members</p>
              </div>
              <button
                onClick={() => handleExport('approved')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Approved</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration ID</label>
                  <input
                    type="text"
                    value={approvedFilters.registration_id}
                    onChange={(e) => setApprovedFilters({...approvedFilters, registration_id: e.target.value, page: 1})}
                    placeholder="Search by registration ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Surname</label>
                  <input
                    type="text"
                    value={approvedFilters.surname}
                    onChange={(e) => setApprovedFilters({...approvedFilters, surname: e.target.value, page: 1})}
                    placeholder="Filter by surname"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gothram</label>
                  <input
                    type="text"
                    value={approvedFilters.gothram}
                    onChange={(e) => setApprovedFilters({...approvedFilters, gothram: e.target.value, page: 1})}
                    placeholder="Filter by gothram"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={approvedFilters.state}
                    onChange={(e) => setApprovedFilters({...approvedFilters, state: e.target.value, page: 1})}
                    placeholder="Filter by state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                  <input
                    type="text"
                    value={approvedFilters.district}
                    onChange={(e) => setApprovedFilters({...approvedFilters, district: e.target.value, page: 1})}
                    placeholder="Filter by district"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mandal</label>
                  <input
                    type="text"
                    value={approvedFilters.mandal}
                    onChange={(e) => setApprovedFilters({...approvedFilters, mandal: e.target.value, page: 1})}
                    placeholder="Filter by mandal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membership ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Surname
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {approvedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded text-green-800">
                            {user.membership_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {user.registration_id}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.desired_name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {user.surname}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{user.mobile_number}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm">{user.current_district}, {user.current_state}</p>
                            <p className="text-xs text-gray-500">{user.current_village_city}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm">{formatDate(user.approved_at)}</p>
                            <p className="text-xs text-gray-500">{formatTime(user.approved_at)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedUserDetail(user);
                              setShowUserDetail(true);
                            }}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {approvedFilters.page} of {approvedMeta.total_pages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setApprovedFilters({...approvedFilters, page: approvedFilters.page - 1})}
                    disabled={approvedFilters.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                    {approvedFilters.page}
                  </span>
                  <button
                    onClick={() => setApprovedFilters({...approvedFilters, page: approvedFilters.page + 1})}
                    disabled={approvedFilters.page >= approvedMeta.total_pages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User Detail Modal */}
      {showUserDetail && selectedUserDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">User Details</h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b pb-2">Personal Information</h4>
                  <DetailItem label="Full Name" value={selectedUserDetail.full_name} />
                  <DetailItem label="Desired Name" value={selectedUserDetail.desired_name} />
                  <DetailItem label="Mother's Maiden Name (Surname)" value={selectedUserDetail.surname} />
                  <DetailItem label="Father/Husband Name" value={selectedUserDetail.father_or_husband_name} />
                  <DetailItem label="Mother Name" value={selectedUserDetail.mother_name} />
                  <DetailItem label="Date of Birth" value={formatDate(selectedUserDetail.date_of_birth)} />
                  <DetailItem label="Gender" value={selectedUserDetail.gender} />
                  <DetailItem label="Blood Group" value={selectedUserDetail.blood_group} />
                  <DetailItem label="Marital Status" value={selectedUserDetail.marital_status} />
                </div>

                {/* Contact & Community */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b pb-2">Contact & Community</h4>
                  <DetailItem label="Email" value={selectedUserDetail.email} />
                  <DetailItem label="Mobile" value={selectedUserDetail.mobile_number} />
                  <DetailItem label="Gothram" value={selectedUserDetail.gothram} />
                  <DetailItem label="Education" value={selectedUserDetail.education} />
                  <DetailItem label="Occupation" value={selectedUserDetail.occupation} />
                  <DetailItem label="Verification Type" value={selectedUserDetail.verification_type} />
                  <DetailItem label="Registration ID" value={selectedUserDetail.registration_id} />
                  {selectedUserDetail.membership_id && (
                    <DetailItem label="Membership ID" value={selectedUserDetail.membership_id} />
                  )}
                </div>

                {/* Current Address */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b pb-2">Current Address</h4>
                  <DetailItem label="House Number" value={selectedUserDetail.current_house_number} />
                  <DetailItem label="Village/City" value={selectedUserDetail.current_village_city} />
                  <DetailItem label="Mandal" value={selectedUserDetail.current_mandal} />
                  <DetailItem label="District" value={selectedUserDetail.current_district} />
                  <DetailItem label="State" value={selectedUserDetail.current_state} />
                  <DetailItem label="Country" value={selectedUserDetail.current_country} />
                  <DetailItem label="PIN Code" value={selectedUserDetail.current_pin_code} />
                </div>

                {/* Native Address */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 border-b pb-2">Native Address</h4>
                  <DetailItem label="House Number" value={selectedUserDetail.native_house_number} />
                  <DetailItem label="Village/City" value={selectedUserDetail.native_village_city} />
                  <DetailItem label="Mandal" value={selectedUserDetail.native_mandal} />
                  <DetailItem label="District" value={selectedUserDetail.native_district} />
                  <DetailItem label="State" value={selectedUserDetail.native_state} />
                  <DetailItem label="Country" value={selectedUserDetail.native_country} />
                  <DetailItem label="PIN Code" value={selectedUserDetail.native_pin_code} />
                </div>

                {/* Photo */}
                {selectedUserDetail.photo_url && (
                  <div className="col-span-2">
                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">Photo</h4>
                    <div className="flex justify-center">
                      <img
                        src={selectedUserDetail.photo_url}
                        alt="User"
                        className="w-48 h-48 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                {!selectedUserDetail.membership_id && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedUsers([selectedUserDetail.id]);
                        setBulkAction('approve');
                        handleBulkAction();
                        setShowUserDetail(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve User
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUsers([selectedUserDetail.id]);
                        setBulkAction('reject');
                        setShowBulkModal(true);
                        setShowUserDetail(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject User
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Bulk Action</h3>
              <p className="text-gray-600 mt-1">
                {selectedUsers.length} users selected
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select action</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="hold">Hold</option>
                </select>
              </div>
              
              {(bulkAction === 'reject' || bulkAction === 'hold') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder={`Enter reason for ${bulkAction}...`}
                  />
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                  setActionReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={loading || !bulkAction}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Export Data</h3>
              <p className="text-gray-600 mt-1">Download user data as CSV</p>
            </div>
            
            <div className="p-6 space-y-4">
              <button
                onClick={() => handleExport('pending')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Export Pending Users</p>
                  <p className="text-sm text-gray-500">All pending registration requests</p>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('approved')}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Export Approved Users</p>
                  <p className="text-sm text-gray-500">All verified and approved members</p>
                </div>
              </button>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail items
function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm text-gray-900 text-right">{value || 'N/A'}</span>
    </div>
  );
}