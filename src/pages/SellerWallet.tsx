import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, DollarSign, TrendingUp, Clock, CheckCircle, XCircle,
  ArrowUpRight, ArrowDownRight, RefreshCw, CreditCard, Building2,
  AlertTriangle, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface WalletStats {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalWithdrawn: number;
}

interface OrderEarning {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  payment_status: string;
  product: {
    title: string;
  } | null;
  buyer: {
    full_name: string;
  } | null;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payment_method: string;
  created_at: string;
  processed_at?: string;
  admin_notes?: string;
}

const COMMISSION_RATE = 0.10; // 10% platform commission
const MIN_PAYOUT_AMOUNT = 50; // Minimum $50 CAD for payout

const SellerWallet: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WalletStats>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0
  });
  const [orders, setOrders] = useState<OrderEarning[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'payouts'>('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWalletData();
  }, [user, navigate]);

  const fetchWalletData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch orders where user is seller
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, created_at, total_price, status, payment_status,
          product:products!orders_product_id_fkey(title),
          buyer:users!orders_buyer_id_fkey(full_name)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Transform data to handle Supabase join format
      const transformedOrders = (ordersData || []).map(order => ({
        ...order,
        product: Array.isArray(order.product) ? order.product[0] : order.product,
        buyer: Array.isArray(order.buyer) ? order.buyer[0] : order.buyer
      }));
      setOrders(transformedOrders);

      // Calculate stats from orders
      const paidOrders = transformedOrders.filter(o => o.payment_status === 'paid');
      const pendingOrders = transformedOrders.filter(o => o.payment_status === 'pending' && o.status !== 'cancelled');

      const totalEarnings = paidOrders.reduce((sum, o) => sum + (o.total_price * (1 - COMMISSION_RATE)), 0);
      const pendingBalance = pendingOrders.reduce((sum, o) => sum + (o.total_price * (1 - COMMISSION_RATE)), 0);

      // Fetch payout requests
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (payoutsError && payoutsError.code !== 'PGRST116') {
        // Table might not exist yet, that's ok
        console.log('Payout requests table may not exist yet');
      }

      const payouts = payoutsData || [];
      setPayoutRequests(payouts);

      const totalWithdrawn = payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const pendingPayouts = payouts
        .filter(p => p.status === 'pending' || p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalEarnings,
        availableBalance: totalEarnings - totalWithdrawn - pendingPayouts,
        pendingBalance,
        totalWithdrawn
      });

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < MIN_PAYOUT_AMOUNT) {
      toast.error(`Minimum payout amount is $${MIN_PAYOUT_AMOUNT} CAD`);
      return;
    }

    if (amount > stats.availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (payoutMethod === 'bank_transfer' && (!bankDetails.accountName || !bankDetails.bankName || !bankDetails.accountNumber)) {
      toast.error('Please fill in all bank details');
      return;
    }

    setSubmittingPayout(true);

    try {
      const { error } = await supabase.from('payout_requests').insert({
        seller_id: user?.id,
        amount,
        payment_method: payoutMethod,
        bank_details: payoutMethod === 'bank_transfer' ? bankDetails : null,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Payout request submitted successfully!');
      setShowPayoutModal(false);
      setPayoutAmount('');
      setBankDetails({ accountName: '', bankName: '', accountNumber: '', routingNumber: '' });
      fetchWalletData();
    } catch (error: any) {
      console.error('Error submitting payout request:', error);
      toast.error(error.message || 'Failed to submit payout request');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-indigo-600" />
                  Seller Wallet
                </h1>
                <p className="text-gray-600 mt-1">Track your earnings and manage payouts</p>
              </div>
              <button
                onClick={fetchWalletData}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Available Balance</span>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.availableBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ready for withdrawal</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Pending Balance</span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.pendingBalance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting payment confirmation</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Earnings</span>
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalEarnings.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">After {COMMISSION_RATE * 100}% commission</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Withdrawn</span>
                <ArrowUpRight className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalWithdrawn.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Successfully paid out</p>
            </div>
          </div>

          {/* Request Payout Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={stats.availableBalance < MIN_PAYOUT_AMOUNT}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium ${
                stats.availableBalance >= MIN_PAYOUT_AMOUNT
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              Request Payout
            </button>
            {stats.availableBalance < MIN_PAYOUT_AMOUNT && (
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Minimum payout amount is ${MIN_PAYOUT_AMOUNT} CAD
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'earnings', label: 'Earnings History' },
                  { id: 'payouts', label: 'Payout Requests' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="font-semibold text-indigo-900 mb-2">How it works</h3>
                    <ul className="text-sm text-indigo-800 space-y-1">
                      <li>- When a customer purchases your product, the order amount is added to your pending balance</li>
                      <li>- Once payment is confirmed, funds move to your available balance (minus {COMMISSION_RATE * 100}% platform fee)</li>
                      <li>- Request a payout when your available balance reaches ${MIN_PAYOUT_AMOUNT} or more</li>
                      <li>- Payouts are processed within 3-5 business days after approval</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    {orders.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No orders yet</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{order.product?.title}</p>
                              <p className="text-sm text-gray-500">
                                {order.buyer?.full_name} - {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${(order.total_price * (1 - COMMISSION_RATE)).toFixed(2)}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.payment_status)}`}>
                                {order.payment_status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Earnings Tab */}
              {activeTab === 'earnings' && (
                <div>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No earnings yet</p>
                      <p className="text-sm text-gray-500 mt-1">Start selling to see your earnings here</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Buyer</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order Total</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Your Earnings</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">{order.product?.title}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{order.buyer?.full_name}</td>
                              <td className="py-3 px-4 text-sm text-gray-900">${order.total_price.toFixed(2)}</td>
                              <td className="py-3 px-4 text-sm font-medium text-green-600">
                                ${(order.total_price * (1 - COMMISSION_RATE)).toFixed(2)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.payment_status)}`}>
                                  {order.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Payouts Tab */}
              {activeTab === 'payouts' && (
                <div>
                  {payoutRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No payout requests yet</p>
                      <p className="text-sm text-gray-500 mt-1">Request a payout when your balance reaches ${MIN_PAYOUT_AMOUNT}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Method</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payoutRequests.map(payout => (
                            <tr key={payout.id} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(payout.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                ${payout.amount.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                                {payout.payment_method.replace('_', ' ')}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payout.status)}`}>
                                  {payout.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {payout.admin_notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
              <p className="text-sm text-gray-600 mt-1">
                Available balance: <span className="font-semibold">${stats.availableBalance.toFixed(2)}</span>
              </p>
            </div>

            <form onSubmit={handleRequestPayout} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (CAD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min={MIN_PAYOUT_AMOUNT}
                    max={stats.availableBalance}
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Min $${MIN_PAYOUT_AMOUNT}`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="interac">Interac e-Transfer</option>
                </select>
              </div>

              {payoutMethod === 'bank_transfer' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bank Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing/Transit Number
                    </label>
                    <input
                      type="text"
                      value={bankDetails.routingNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important</p>
                  <p>Payout requests are reviewed within 1-2 business days. Funds will be transferred within 3-5 business days after approval.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  {submittingPayout ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerWallet;
