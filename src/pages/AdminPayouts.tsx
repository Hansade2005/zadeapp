import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, CheckCircle, XCircle, Clock, Search,
  RefreshCw, Eye, AlertTriangle, Building2, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface PayoutRequest {
  id: string;
  seller_id: string;
  amount: number;
  payment_method: string;
  bank_details: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  } | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  created_at: string;
  processed_at?: string;
  seller?: {
    full_name: string;
    email: string;
  };
}

const AdminPayouts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalCompleted: 0,
    totalAmount: 0
  });

  useEffect(() => {
    // Check if user is admin
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const { data } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!data?.is_admin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }

    fetchPayouts();
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select(`
          *,
          seller:users!payout_requests_seller_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayouts(data || []);

      // Calculate stats
      const pending = (data || []).filter(p => p.status === 'pending');
      const approved = (data || []).filter(p => p.status === 'approved');
      const completed = (data || []).filter(p => p.status === 'completed');

      setStats({
        totalPending: pending.length,
        totalApproved: approved.length,
        totalCompleted: completed.length,
        totalAmount: completed.reduce((sum, p) => sum + p.amount, 0)
      });

    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (payoutId: string, newStatus: 'approved' | 'rejected' | 'completed') => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          processed_at: new Date().toISOString()
        })
        .eq('id', payoutId);

      if (error) throw error;

      toast.success(`Payout ${newStatus} successfully`);
      setSelectedPayout(null);
      setAdminNotes('');
      fetchPayouts();
    } catch (error: any) {
      console.error('Error updating payout:', error);
      toast.error(error.message || 'Failed to update payout');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesFilter = filter === 'all' || payout.status === filter;
    const matchesSearch = searchQuery === '' ||
      payout.seller?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.seller?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-white rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
              <p className="text-sm text-gray-600">Review and process seller payout requests</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin-dashboard')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
              <button
                onClick={fetchPayouts}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalPending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalApproved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Paid Out</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by seller name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'completed', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    filter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payout requests found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Seller</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map(payout => (
                  <tr key={payout.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{payout.seller?.full_name}</p>
                        <p className="text-sm text-gray-500">{payout.seller?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">${payout.amount.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600 capitalize">{payout.payment_method.replace('_', ' ')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-600">{new Date(payout.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedPayout(payout)}
                        className="flex items-center gap-1 px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payout Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Payout Request Details</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Seller Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedPayout.seller?.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedPayout.seller?.email}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Requested Amount</p>
                <p className="text-3xl font-bold text-gray-900">${selectedPayout.amount.toFixed(2)} CAD</p>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Payment Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Method:</span>{' '}
                    <span className="font-medium capitalize">{selectedPayout.payment_method.replace('_', ' ')}</span>
                  </p>
                  {selectedPayout.bank_details && (
                    <>
                      <p className="text-sm">
                        <span className="text-gray-600">Account Holder:</span>{' '}
                        <span className="font-medium">{selectedPayout.bank_details.accountName}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Bank:</span>{' '}
                        <span className="font-medium">{selectedPayout.bank_details.bankName}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Account:</span>{' '}
                        <span className="font-medium">****{selectedPayout.bank_details.accountNumber?.slice(-4)}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayout.status)}`}>
                  {getStatusIcon(selectedPayout.status)}
                  {selectedPayout.status}
                </span>
              </div>

              {/* Admin Notes */}
              {selectedPayout.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add notes for the seller..."
                  />
                </div>
              )}

              {selectedPayout.admin_notes && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">Admin Notes:</p>
                  <p className="text-sm text-blue-800">{selectedPayout.admin_notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setSelectedPayout(null);
                    setAdminNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                {selectedPayout.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedPayout.id, 'rejected')}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedPayout.id, 'approved')}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  </>
                )}

                {selectedPayout.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPayout.id, 'completed')}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayouts;
