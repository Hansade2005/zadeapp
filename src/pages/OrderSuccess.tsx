import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { CheckCircle, Package, Truck, MessageCircle } from 'lucide-react';

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivery_fee: number;
  status: string;
  payment_status: string;
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
  products: {
    name: string;
    price: number;
    image: string;
  }[];
}

const OrderSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const orderIds = searchParams.get('order_ids')?.split(',') || [];
  const singleOrderId = searchParams.get('order_id');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Handle both single order_id and multiple order_ids
    const idsToFetch = singleOrderId ? [singleOrderId] : orderIds;

    if (idsToFetch.length === 0) {
      navigate('/marketplace');
      return;
    }

    fetchOrderDetails(idsToFetch);
  }, [user, orderIds, singleOrderId, navigate]);

  const fetchOrderDetails = async (orderIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          buyer_id,
          seller_id,
          product_id,
          quantity,
          unit_price,
          total_price,
          delivery_fee,
          status,
          payment_status,
          delivery_address,
          tracking_number,
          notes,
          created_at,
          updated_at,
          products (
            name,
            price,
            image
          )
        `)
        .in('id', orderIds)
        .eq('buyer_id', user!.id);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Not Found</h2>
              <p className="text-gray-600 mb-6">The orders you're looking for don't exist or you don't have permission to view them.</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
              </button>
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
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order{orders.length > 1 ? 's' : ''} have been successfully placed.
            </p>
            <p className="text-sm text-gray-500">
              Order ID{orders.length > 1 ? 's' : ''}: <span className="font-mono">{orders.map(o => o.id).join(', ')}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                {orders.map((order) => (
                  order.products && order.products.length > 0 && (
                    <div key={order.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={order.products[0].image}
                        alt={order.products[0].name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{order.products[0].name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${(order.unit_price * order.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total:</span>
                  <span>${orders.reduce((sum, order) => sum + order.total_price, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping & Status */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
                <div className="text-gray-700">
                  <p>{orders[0].delivery_address.street}</p>
                  <p>{orders[0].delivery_address.city}, {orders[0].delivery_address.state}</p>
                  <p>{orders[0].delivery_address.postal_code || orders[0].delivery_address.country}</p>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Order Status</h2>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 capitalize">{orders[0].status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Ordered on {new Date(orders[0].created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">What's Next?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Shipping</h3>
                      <p className="text-sm text-gray-600">
                        We'll send you tracking information once your order ships.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Contact Seller</h3>
                      <p className="text-sm text-gray-600">
                        You can message the seller directly for any questions about your order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/messages')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Contact Seller
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default OrderSuccess;