import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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

interface CheckoutFormProps {
  cartItems: CartItem[];
  total: number;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  cartItems,
  total,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Canada'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setLoading(true);

    try {
      // Create orders for each cart item
      const orderPromises = cartItems.map(async (item) => {
        const orderData = {
          buyer_id: user.id,
          seller_id: item.sellerId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          delivery_fee: total > 50000 ? 0 : 2500, // Free shipping over $50,000
          delivery_address: shippingAddress,
          status: 'pending',
          payment_status: 'processing'
        };

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) throw orderError;
        return order;
      });

      const orders = await Promise.all(orderPromises);

      // Confirm payment with Stripe
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?order_ids=${orders.map(o => o.id).join(',')}`,
        },
        redirect: 'if_required'
      });

      if (paymentError) {
        // Update all orders to failed status
        await Promise.all(orders.map(order =>
          supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'failed'
            })
            .eq('id', order.id)
        ));

        throw paymentError;
      } else {
        // Update all orders to confirmed and paid status
        await Promise.all(orders.map(order =>
          supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_status: 'paid'
            })
            .eq('id', order.id)
        ));

        toast.success('Payment successful! Orders placed.');
        onSuccess(orders[0].id); // Return first order ID for navigation
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Shipping Address</h3>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Street Address"
            value={shippingAddress.street}
            onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />

            <input
              type="text"
              placeholder="State"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ZIP Code"
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />

            <select
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="Canada">Canada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Information</h3>
        <PaymentElement />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay $${total.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;