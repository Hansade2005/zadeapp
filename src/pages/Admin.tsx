import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Briefcase, Calendar, TrendingUp, Settings, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  location?: string;
  created_at: string;
  is_active: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  created_at: string;
  status: string;
}

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  attendees_count: number;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalJobs: number;
  totalEvents: number;
  totalProducts: number;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    totalEvents: 0,
    totalProducts: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const ADMIN_CREDENTIALS = {
    username: 'zadeadmin',
    password: 'Mnbvcxzl@5'
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_CREDENTIALS.username &&
        loginForm.password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, jobsRes, eventsRes, productsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalJobs: jobsRes.count || 0,
        totalEvents: eventsRes.count || 0,
        totalProducts: productsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [usersData, jobsData, eventsData, productsData] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('events').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      setUsers(usersData.data || []);
      setJobs(jobsData.data || []);
      setEvents(eventsData.data || []);
      setProducts(productsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u)
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'products', label: 'Products', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                    <p className="text-sm text-gray-600">Total Events</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <Settings className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">New user registered</p>
                  <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Job posted: Software Engineer</p>
                  <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Event created: Tech Conference 2024</p>
                  <span className="text-xs text-gray-400 ml-auto">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Users Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            user.is_active
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Jobs Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.salary || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Events Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.attendees_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Products Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;