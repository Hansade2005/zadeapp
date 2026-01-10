import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, Package, Briefcase, Calendar, TrendingUp, DollarSign,
  Shield, AlertTriangle, CheckCircle, XCircle, Ban, Eye, Lock, Trash2, UserX, Music, Palette, Plus, Minus, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Admin credentials
const ADMIN_USERNAME = '@zadeadmin';
const ADMIN_PASSWORD = 'Mnbvcxzl@5';

interface PlatformStats {
  totalUsers: number;
  totalProducts: number;
  totalJobs: number;
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
  activeBoosts: number;
  pendingReviews: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: string;
  is_admin: boolean;
  is_disabled?: boolean;
  credit_balance?: number;
  created_at: string;
}

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'credits' | 'analytics'>('overview');
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeBoosts: 0,
    pendingReviews: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [artistes, setArtistes] = useState<any[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<any[]>([]);
  const [contentType, setContentType] = useState<'products' | 'jobs' | 'events' | 'freelancers' | 'artistes'>('products');
  const [contentFilter, setContentFilter] = useState('all');
  const [contentSort, setContentSort] = useState('newest');
  const [analyticsData, setAnalyticsData] = useState<Array<{
    date: string;
    users: number;
    products: number;
    jobs: number;
    events: number;
    revenue: number;
  }>>([]);
  const [boostCampaigns, setBoostCampaigns] = useState<any[]>([]);
  const [creditModalUser, setCreditModalUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditAction, setCreditAction] = useState<'add' | 'deduct'>('add');
  const [creditReason, setCreditReason] = useState('');

  useEffect(() => {
    // Check if admin session exists
    const adminSession = localStorage.getItem('zade_admin_session');
    if (adminSession === 'authenticated') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlatformStats();
      fetchUsers();
      fetchProducts();
      fetchJobs();
      fetchEvents();
      fetchFreelancers();
      fetchArtistes();
      fetchCreditTransactions();
      fetchAnalyticsData();
      fetchBoostCampaigns();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('zade_admin_session', 'authenticated');
      setIsAuthenticated(true);
      toast.success('Admin login successful!');
      setUsername('');
      setPassword('');
    } else {
      toast.error('Invalid admin credentials');
      setPassword('');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('zade_admin_session');
    setIsAuthenticated(false);
    toast.success('Admin logged out');
  };

  const fetchPlatformStats = async () => {
    try {
      const [usersRes, productsRes, jobsRes, eventsRes, ordersRes, boostsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_price', { count: 'exact' }),
        supabase.from('boost_purchases').select('id', { count: 'exact', head: true }).gte('boost_end_date', new Date().toISOString()),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalJobs: jobsRes.count || 0,
        totalEvents: eventsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        activeBoosts: boostsRes.count || 0,
        pendingReviews: 0, // Can be implemented later
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // First get users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, user_type, is_admin, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }

      // Then get credits for these users
      const userIds = usersData?.map(user => user.id) || [];
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('user_id, balance')
        .in('user_id', userIds);

      if (creditsError) {
        console.error('Error fetching credits:', creditsError);
        // Continue without credits data
      }

      // Create a map of user_id to balance
      const creditsMap = new Map();
      creditsData?.forEach(credit => {
        creditsMap.set(credit.user_id, credit.balance);
      });

      // Transform data to include credit_balance
      const usersWithCredits = usersData?.map(user => ({
        ...user,
        credit_balance: creditsMap.get(user.id) || 0
      })) || [];

      setUsers(usersWithCredits);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, users!products_seller_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, users!jobs_employer_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, users!events_organizer_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchFreelancers = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching freelancers:', error);
        return;
      }

      setFreelancers(data || []);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    }
  };

  const fetchArtistes = async () => {
    try {
      const { data, error } = await supabase
        .from('artiste_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching artistes:', error);
        return;
      }

      setArtistes(data || []);
    } catch (error) {
      console.error('Error fetching artistes:', error);
    }
  };

  const fetchCreditTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*, users!credit_transactions_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching credit transactions:', error);
        return;
      }

      setCreditTransactions(data || []);
    } catch (error) {
      console.error('Error fetching credit transactions:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Get data for the last 7 days
      const days = 7;
      const data: Array<{
        date: string;
        users: number;
        products: number;
        jobs: number;
        events: number;
        revenue: number;
      }> = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Get counts up to this date
        const [users, products, jobs, events, revenue] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }).lte('created_at', `${dateStr}T23:59:59.999Z`),
          supabase.from('products').select('id', { count: 'exact', head: true }).lte('created_at', `${dateStr}T23:59:59.999Z`),
          supabase.from('jobs').select('id', { count: 'exact', head: true }).lte('created_at', `${dateStr}T23:59:59.999Z`),
          supabase.from('events').select('id', { count: 'exact', head: true }).lte('created_at', `${dateStr}T23:59:59.999Z`),
          supabase.from('orders').select('total_price').lte('created_at', `${dateStr}T23:59:59.999Z`),
        ]);

        const totalRevenue = revenue.data?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: users.count || 0,
          products: products.count || 0,
          jobs: jobs.count || 0,
          events: events.count || 0,
          revenue: totalRevenue,
        });
      }

      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  const fetchBoostCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('boost_purchases')
        .select('*, users!boost_purchases_user_id_fkey(full_name, email)')
        .gte('boost_end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching boost campaigns:', error);
        return;
      }

      setBoostCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching boost campaigns:', error);
    }
  };

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const disableUserAccount = async (userId: string, isDisabled: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_disabled: !isDisabled })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User account ${!isDisabled ? 'disabled' : 'enabled'}`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const deleteUserAccount = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleManageCredits = async () => {
    if (!creditModalUser || creditAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Get current credit balance from credits table
      const { data: currentCredit, error: fetchError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', creditModalUser.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const currentBalance = currentCredit?.balance || 0;
      const amount = creditAction === 'add' ? creditAmount : -creditAmount;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        toast.error('Cannot deduct more credits than user has');
        return;
      }

      // Update or insert credit balance in credits table
      const { error: updateError } = await supabase
        .from('credits')
        .upsert({
          user_id: creditModalUser.id,
          balance: newBalance,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: creditModalUser.id,
          transaction_type: 'admin_adjustment',
          amount: Math.abs(creditAmount),
          balance_after: newBalance,
          description: creditReason || `Admin ${creditAction === 'add' ? 'added' : 'deducted'} credits`,
        });

      if (transactionError) throw transactionError;

      toast.success(`Credits ${creditAction === 'add' ? 'added to' : 'deducted from'} user successfully`);

      // Reset modal state
      setCreditModalUser(null);
      setCreditAmount(0);
      setCreditReason('');

      // Refresh data
      fetchUsers();
      fetchCreditTransactions();
    } catch (error: any) {
      console.error('Error managing credits:', error);
      toast.error(error.message || 'Failed to manage credits');
    }
  };

  const toggleContentStatus = async (contentId: string, currentStatus: boolean, table: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', contentId);

      if (error) throw error;

      toast.success(`${table.slice(0, -1)} ${!currentStatus ? 'activated' : 'deactivated'}`);
      
      // Refresh the appropriate list
      if (table === 'products') fetchProducts();
      else if (table === 'jobs') fetchJobs();
      else if (table === 'events') fetchEvents();
      else if (table === 'freelancer_profiles') fetchFreelancers();
      else if (table === 'artiste_profiles') fetchArtistes();
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast.error(error.message || 'Failed to update content');
    }
  };

  const deleteContent = async (contentId: string, table: string) => {
    if (!confirm(`Are you sure you want to delete this ${table.slice(0, -1)}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast.success(`${table.slice(0, -1)} deleted successfully`);
      
      // Refresh the appropriate list
      if (table === 'products') fetchProducts();
      else if (table === 'jobs') fetchJobs();
      else if (table === 'events') fetchEvents();
      else if (table === 'freelancer_profiles') fetchFreelancers();
      else if (table === 'artiste_profiles') fetchArtistes();
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast.error(error.message || 'Failed to delete content');
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    toggleContentStatus(productId, currentStatus, 'products');
  };

  // Helper function to get and filter content based on selected type
  const getFilteredContent = () => {
    let content: any[] = [];
    let tableName = '';
    
    switch (contentType) {
      case 'products':
        content = products;
        tableName = 'products';
        break;
      case 'jobs':
        content = jobs;
        tableName = 'jobs';
        break;
      case 'events':
        content = events;
        tableName = 'events';
        break;
      case 'freelancers':
        content = freelancers;
        tableName = 'freelancer_profiles';
        break;
      case 'artistes':
        content = artistes;
        tableName = 'artiste_profiles';
        break;
    }
    
    // Apply filter
    if (contentFilter === 'all') {
      content = content;
    } else if (contentFilter === 'active') {
      content = content.filter(item => item.is_active !== false);
    } else if (contentFilter === 'inactive') {
      content = content.filter(item => item.is_active === false);
    }
    
    // Apply sort
    if (contentSort === 'newest') {
      content = [...content].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (contentSort === 'oldest') {
      content = [...content].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (contentSort === 'price-high') {
      content = [...content].sort((a, b) => (b.price || b.salary_max || b.budget || 0) - (a.price || a.salary_max || a.budget || 0));
    } else if (contentSort === 'price-low') {
      content = [...content].sort((a, b) => (a.price || a.salary_min || a.budget || 0) - (b.price || b.salary_min || b.budget || 0));
    }
    
    return { content, tableName };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show admin login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
              <p className="text-gray-600">Enter your admin credentials to continue</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter admin username"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter admin password"
                  required
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Lock className="h-5 w-5" />
                Login to Admin Panel
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                🔒 This is a protected admin area. Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">Manage users, content, and platform analytics</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'content', label: 'Content', icon: Package },
                { id: 'credits', label: 'Credits', icon: DollarSign },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-600">Users</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-8 w-8 text-green-600" />
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase className="h-8 w-8 text-purple-600" />
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                  <p className="text-sm text-gray-600">Jobs</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="h-8 w-8 text-orange-600" />
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                  <p className="text-sm text-gray-600">Events</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-8 w-8 text-yellow-600" />
                    <span className="text-sm text-gray-500">Active</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeBoosts}</p>
                  <p className="text-sm text-gray-600">Boost Purchases</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="h-8 w-8 text-indigo-600" />
                    <span className="text-sm text-gray-500">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-600">Orders</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Health</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-900">All systems operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-gray-900">{stats.activeBoosts} active boost campaigns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{u.full_name}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full capitalize">
                            {u.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-900">{u.credit_balance || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {u.is_admin ? (
                            <Shield className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => toggleUserAdmin(u.id, u.is_admin)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => setCreditModalUser(u)}
                              className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                              <DollarSign className="h-3 w-3" />
                              Credits
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => disableUserAccount(u.id, u.is_disabled || false)}
                              className="text-sm font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
                            >
                              <UserX className="h-3 w-3" />
                              {u.is_disabled ? 'Enable' : 'Disable'}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => deleteUserAccount(u.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Content Moderation</h2>
                    <p className="text-sm text-gray-600">Review and manage platform content</p>
                  </div>
                </div>

                {/* Content Type Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: 'products', label: 'Products', icon: Package, count: products.length },
                    { id: 'jobs', label: 'Jobs', icon: Briefcase, count: jobs.length },
                    { id: 'events', label: 'Events', icon: Calendar, count: events.length },
                    { id: 'freelancers', label: 'Freelancers', icon: Users, count: freelancers.length },
                    { id: 'artistes', label: 'Artistes', icon: Music, count: artistes.length },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setContentType(tab.id as typeof contentType)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                          contentType === tab.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          contentType === tab.id ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filters and Sort */}
                <div className="flex gap-4 mt-4">
                  <select
                    value={contentFilter}
                    onChange={(e) => setContentFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  
                  <select
                    value={contentSort}
                    onChange={(e) => setContentSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                {(() => {
                  const { content, tableName } = getFilteredContent();
                  
                  return (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner/Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {contentType === 'products' ? 'Price' : contentType === 'jobs' ? 'Salary' : contentType === 'events' ? 'Budget' : 'Rate'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {content.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              No {contentType} found
                            </td>
                          </tr>
                        ) : (
                          content.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {(item.images?.[0] || item.image_url) && (
                                    <img
                                      src={item.images?.[0] || item.image_url || 'https://placehold.co/100'}
                                      alt={item.title || item.name || item.event_name}
                                      className="h-12 w-12 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {item.title || item.job_title || item.event_name || item.full_name || item.stage_name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {item.category || item.job_type || item.event_type || item.specialty || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {item.users?.full_name || item.user_id || item.location || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {contentType === 'products' && `$${item.price?.toLocaleString() || 0}`}
                                {contentType === 'jobs' && `$${item.salary_min?.toLocaleString() || 0} - $${item.salary_max?.toLocaleString() || 0}`}
                                {contentType === 'events' && `$${item.budget?.toLocaleString() || 0}`}
                                {contentType === 'freelancers' && `$${item.hourly_rate?.toLocaleString() || 0}/hr`}
                                {contentType === 'artistes' && (item.rate ? `$${item.rate?.toLocaleString()}` : 'N/A')}
                              </td>
                              <td className="px-6 py-4">
                                {item.is_active !== false ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                                ) : (
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Inactive</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleContentStatus(item.id, item.is_active !== false, tableName)}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                  >
                                    {item.is_active !== false ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => deleteContent(item.id, tableName)}
                                    className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Credits Tab */}
          {activeTab === 'credits' && (
            <div className="space-y-6">
              {/* Active Boost Campaigns */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Active Boost Campaigns</h2>
                  <p className="text-sm text-gray-600">{boostCampaigns.length} active boost{boostCampaigns.length === 1 ? '' : 's'} running</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits Spent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {boostCampaigns.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No active boost campaigns at the moment
                          </td>
                        </tr>
                      ) : (
                        boostCampaigns.map((boost) => (
                          <tr key={boost.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{boost.users?.full_name}</p>
                                <p className="text-sm text-gray-500">{boost.users?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                                {boost.entity_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {boost.boost_duration} days
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {boost.credits_spent} credits
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(boost.boost_end_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Credit Transactions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Credit Transactions</h2>
                  <p className="text-sm text-gray-600">Monitor platform credit activity</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {creditTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No credit transactions yet
                          </td>
                        </tr>
                      ) : (
                        creditTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{tx.users?.full_name}</p>
                                <p className="text-sm text-gray-500">{tx.users?.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                tx.transaction_type === 'purchase'
                                  ? 'bg-green-100 text-green-800'
                                  : tx.transaction_type === 'admin_adjustment' && (tx.description?.includes('added') || tx.description?.includes('add'))
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-medium ${
                                tx.transaction_type === 'purchase'
                                  ? 'text-green-600'
                                  : tx.transaction_type === 'admin_adjustment' && (tx.description?.includes('added') || tx.description?.includes('add'))
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {tx.transaction_type === 'purchase' || (tx.transaction_type === 'admin_adjustment' && (tx.description?.includes('added') || tx.description?.includes('add')))
                                  ? '+' 
                                  : '-'
                                }{tx.amount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {tx.description}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Growth Charts */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Platform Growth (Last 7 Days)</h2>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" name="Users" strokeWidth={2} />
                      <Line type="monotone" dataKey="products" stroke="#82ca9d" name="Products" strokeWidth={2} />
                      <Line type="monotone" dataKey="jobs" stroke="#ffc658" name="Jobs" strokeWidth={2} />
                      <Line type="monotone" dataKey="events" stroke="#ff7c7c" name="Events" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h2>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Pie Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Content Distribution</h2>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Products', value: stats.totalProducts, color: '#8884d8' },
                            { name: 'Jobs', value: stats.totalJobs, color: '#82ca9d' },
                            { name: 'Events', value: stats.totalEvents, color: '#ffc658' },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Products', value: stats.totalProducts, color: '#8884d8' },
                            { name: 'Jobs', value: stats.totalJobs, color: '#82ca9d' },
                            { name: 'Events', value: stats.totalEvents, color: '#ffc658' },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Platform Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Users</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-xs text-green-600 mt-2">📈 Active user base</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-xs text-green-600 mt-2">💰 Platform earnings</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Active Boosts</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.activeBoosts}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-xs text-purple-600 mt-2">⚡ Promotional campaigns</p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                        <Package className="h-8 w-8 text-yellow-600" />
                      </div>
                      <p className="text-xs text-yellow-600 mt-2">📦 Completed transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Credit Management Modal */}
      {creditModalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Manage Credits</h3>
                <button
                  onClick={() => setCreditModalUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {creditModalUser.full_name} ({creditModalUser.email})
              </p>
              <p className="text-sm font-medium text-gray-900 mt-2">
                Current Balance: <span className="text-green-600">{creditModalUser.credit_balance || 0} credits</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCreditAction('add')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      creditAction === 'add'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    Add Credits
                  </button>
                  <button
                    onClick={() => setCreditAction('deduct')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      creditAction === 'deduct'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Minus className="h-4 w-4" />
                    Deduct Credits
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={creditAmount || ''}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                <textarea
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Enter reason for this action"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">New balance will be:</p>
                <p className="text-lg font-bold text-gray-900">
                  {creditAction === 'add'
                    ? (creditModalUser.credit_balance || 0) + creditAmount
                    : (creditModalUser.credit_balance || 0) - creditAmount
                  } credits
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setCreditModalUser(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleManageCredits}
                disabled={creditAmount <= 0}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  creditAmount <= 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : creditAction === 'add'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {creditAction === 'add' ? 'Add Credits' : 'Deduct Credits'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
