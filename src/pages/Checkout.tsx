import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import StripeCheckout from '../components/StripeCheckout';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
  productId: string;
  sellerId: string;
}

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load cart items from localStorage (in a real app, this would be from a cart context or API)
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart:', error);
      }
    }

    setLoading(false);
  }, [user, navigate]);

  const handleOrderSuccess = (orderId: string) => {
    // Clear cart
    localStorage.removeItem('cart');
    setCartItems([]);

    // Navigate to order success page
    navigate(`/order-success?order_id=${orderId}`);
  };

  const handleCancel = () => {
    navigate('/marketplace');
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your order</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Sold by {item.vendor}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal:</span>
                  <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Shipping:</span>
                  <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50000 ? 0 : 2500}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50000 ? 0 : 2500)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <StripeCheckout
                cartItems={cartItems}
                onSuccess={handleOrderSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Checkout;