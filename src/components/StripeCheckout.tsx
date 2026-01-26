import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe('pk_live_51SX9vD3dj2RERxFr1rm2CXfovXAzlkOx9aL2ciRo94bmSbRkKQo4lRiI8Y2MpC2CetMexpolKnZFcRDPZyY5uPIT00QmTRViwP');

// Stripe minimum amount in dollars
const STRIPE_MINIMUM_AMOUNT = 0.50;

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

interface StripeCheckoutProps {
  cartItems: CartItem[];
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  cartItems,
  onSuccess,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // No delivery cost
  const total = subtotal + shipping;

  // Check if total meets Stripe minimum
  const isBelowMinimum = total < STRIPE_MINIMUM_AMOUNT;

  // Create payment intent when component mounts
  React.useEffect(() => {
    const createPaymentIntent = async () => {
      // Don't create payment intent if below minimum
      if (isBelowMinimum) {
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            items: cartItems,
            total: total,
          },
        });

        if (error) throw error;
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast.error('Failed to initialize payment. Please try again.');
      }
    };

    if (cartItems.length > 0) {
      createPaymentIntent();
    }
  }, [cartItems, total, isBelowMinimum]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Complete Your Order</h2>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>${shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        {isBelowMinimum && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Minimum Order Amount</h3>
                <p className="text-sm text-amber-700 mt-1">
                  The minimum order amount is ${STRIPE_MINIMUM_AMOUNT.toFixed(2)}.
                  Please add more items to your cart to proceed with checkout.
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="mt-4 w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!isBelowMinimum && clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm
              cartItems={cartItems}
              total={total}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        )}

        {!isBelowMinimum && !clientSecret && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Preparing payment...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StripeCheckout;