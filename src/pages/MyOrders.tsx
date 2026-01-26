import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft,
  MapPin, Calendar, CreditCard, MessageCircle, Eye, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivery_fee: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  delivery_address: {
    street: string;
    city: string;
    state: string;
    postal_code?: string;
    country: string;
  };
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    title: string;
    images: string[];
    price: number;
  };
  seller?: {
    id: string;
    full_name: string;
    email: string;
  };
}

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products!orders_product_id_fkey(id, title, images, price),
          seller:users!orders_seller_id_fkey(id, full_name, email)
        `)
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending' || order.status === 'confirmed';
    return order.status === filter;
  });

  const handleContactSeller = (sellerId: string) => {
    navigate('/messages', { state: { recipientId: sellerId } });
  };

  const formatAddress = (address: Order['delivery_address']) => {
    if (!address) return 'Address not available';
    return `${address.street}, ${address.city}, ${address.state} ${address.postal_code || ''}, ${address.country}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">Track and manage your purchases</p>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Orders' },
                { value: 'pending', label: 'Pending' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    filter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't placed any orders yet."
                  : `No ${filter} orders found.`}
              </p>
              <Link
                to="/marketplace"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status === 'paid' ? 'Paid' : order.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Product Info */}
                      <div className="flex gap-4 flex-1">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {order.product?.images?.[0] ? (
                            <img
                              src={order.product.images[0]}
                              alt={order.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {order.product?.title || 'Product'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Quantity: {order.quantity} x ${order.unit_price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Seller: {order.seller?.full_name || 'Seller'}
                          </p>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="md:text-right">
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          ${order.total_price.toLocaleString()}
                        </p>
                        {order.tracking_number && (
                          <p className="text-sm text-gray-600">
                            Tracking: {order.tracking_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium text-gray-900">
                          {order.status === 'pending' && 'Order is pending confirmation'}
                          {order.status === 'confirmed' && 'Order confirmed, preparing for shipment'}
                          {order.status === 'shipped' && 'Your order is on the way!'}
                          {order.status === 'delivered' && 'Order delivered successfully'}
                          {order.status === 'cancelled' && 'Order has been cancelled'}
                          {order.status === 'refunded' && 'Order has been refunded'}
                        </span>
                      </div>

                      {/* Delivery Address */}
                      {order.delivery_address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{formatAddress(order.delivery_address)}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {order.seller && (
                          <button
                            onClick={() => handleContactSeller(order.seller!.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Contact Seller
                          </button>
                        )}
                        {order.product && (
                          <Link
                            to={`/product/${order.product.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Buy Again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{selectedOrder.id.slice(-8).toUpperCase()}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                    {selectedOrder.product?.images?.[0] && (
                      <img
                        src={selectedOrder.product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedOrder.product?.title}</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.quantity} x ${selectedOrder.unit_price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${(selectedOrder.unit_price * selectedOrder.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>${selectedOrder.delivery_fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${selectedOrder.total_price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.delivery_address && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                    {formatAddress(selectedOrder.delivery_address)}
                  </p>
                </div>
              )}

              {/* Tracking */}
              {selectedOrder.tracking_number && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tracking Number</h3>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-lg font-mono">
                    {selectedOrder.tracking_number}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Placed</span>
                    <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span>{new Date(selectedOrder.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MyOrders;
