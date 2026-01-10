import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Plus, History, Zap, Package, Briefcase, Calendar, Music, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import CreditPaymentForm from '../components/CreditPaymentForm';

const stripePromise = loadStripe('pk_live_51SX9vD3dj2RERxFr1rm2CXfovXAzlkOx9aL2ciRo94bmSbRkKQo4lRiI8Y2MpC2CetMexpolKnZFcRDPZyY5uPIT00QmTRViwP');

interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: 'purchase' | 'deduction';
  description: string;
  created_at: string;
}

interface BoostPurchase {
  id: string;
  entity_type: string;
  boost_duration: number;
  credits_spent: number;
  expires_at: string;
  created_at: string;
}

const MyCredits: React.FC = () => {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [boosts, setBoosts] = useState<BoostPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);

  const creditPackages = [
    { credits: 10, price: 1000, popular: false },
    { credits: 50, price: 4500, popular: true, discount: '10% OFF' },
    { credits: 100, price: 8000, popular: false, discount: '20% OFF' },
    { credits: 500, price: 35000, popular: false, discount: '30% OFF' },
  ];

  useEffect(() => {
    if (user) {
      fetchCreditData();
    }
  }, [user]);

  const fetchCreditData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch credit balance
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      setCreditBalance(userData?.credits || 0);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);

      // Fetch active boosts
      const { data: boostData, error: boostError } = await supabase
        .from('boost_purchases')
        .select('*')
        .eq('user_id', user.id)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (boostError) throw boostError;
      setBoosts(boostData || []);
    } catch (error: any) {
      console.error('Error fetching credit data:', error);
      toast.error('Failed to load credit information');
    } finally {
      setLoading(false);
    }
  };

  const initiateCreditPurchase = async (credits: number, price: number) => {
    if (!user) {
      toast.error('Please login to purchase credits');
      return;
    }

    setPurchasing(true);
    try {
      // Create payment intent via edge function
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          items: [{
            id: `credit-package-${credits}`,
            name: `${credits} Credits Package`,
            price: price,
            quantity: 1,
            productId: `credits-${credits}`,
            credits: credits // Include credits in the item
          }],
          total: price,
          type: 'credit_purchase',
          credits: credits
        },
      });

      if (error) throw error;
      
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePaymentSuccess = async (credits: number, price: number) => {
    if (!user) return;
    
    try {
      // Get current credits
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      const currentCredits = userData?.credits || 0;

      // Update credits
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: currentCredits + credits })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: credits,
          transaction_type: 'purchase',
          description: `Purchased ${credits} credits for $${price.toLocaleString()}`,
        });

      if (txError) throw txError;

      toast.success(`Successfully purchased ${credits} credits!`);
      setSelectedPackage(null);
      setShowPayment(false);
      setClientSecret('');
      fetchCreditData();
    } catch (error: any) {
      console.error('Error updating credits:', error);
      toast.error('Payment succeeded but failed to update credits. Please contact support.');
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'artiste':
        return <Music className="h-4 w-4" />;
      case 'freelancer':
        return <Users className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Credits</h1>
            <p className="text-gray-600">Manage your credits and boost your visibility</p>
          </div>

          {/* Credit Balance Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 mb-2">Available Credits</p>
                <p className="text-5xl font-bold">{creditBalance}</p>
                <p className="text-indigo-100 mt-2">Use credits to boost your listings</p>
              </div>
              <div className="bg-white bg-opacity-20 p-6 rounded-full">
                <DollarSign className="h-12 w-12" />
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Purchase Credits</h2>
                <p className="text-sm text-gray-600">Choose a package that suits your needs</p>
              </div>
              <CreditCard className="h-8 w-8 text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditPackages.map((pkg, index) => (
                <div
                  key={index}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPackage === index
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  } ${pkg.popular ? 'ring-2 ring-indigo-600' : ''}`}
                  onClick={() => setSelectedPackage(index)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Popular
                      </span>
                    </div>
                  )}
                  {pkg.discount && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {pkg.discount}
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{pkg.credits}</div>
                    <div className="text-sm text-gray-600 mb-4">Credits</div>
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      ${pkg.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${(pkg.price / pkg.credits).toFixed(0)} per credit
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPackage !== null && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      You're purchasing {creditPackages[selectedPackage].credits} credits
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: ${creditPackages[selectedPackage].price.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      initiateCreditPurchase(
                        creditPackages[selectedPackage].credits,
                        creditPackages[selectedPackage].price
                      )
                    }
                    disabled={purchasing}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {purchasing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Preparing Payment...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Purchase with Card
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Boosts */}
          {boosts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Active Boosts</h2>
              </div>

              <div className="space-y-3">
                {boosts.map((boost) => (
                  <div
                    key={boost.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 text-white p-2 rounded-lg">
                        {getEntityIcon(boost.entity_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{boost.entity_type} Boost</p>
                        <p className="text-sm text-gray-600">
                          {boost.boost_duration} days • {boost.credits_spent} credits
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Expires</p>
                      <p className="font-medium text-gray-900">
                        {new Date(boost.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Purchase credits to boost your listings and get more visibility
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              tx.transaction_type === 'purchase'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`font-medium ${
                              tx.transaction_type === 'purchase' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {tx.transaction_type === 'purchase' ? '+' : '-'}
                            {tx.amount}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{tx.description}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Stripe Payment Modal */}
      {showPayment && clientSecret && selectedPackage !== null && (
        <Elements options={{ clientSecret, appearance: { theme: 'stripe' as const } }} stripe={stripePromise}>
          <CreditPaymentForm
            credits={creditPackages[selectedPackage].credits}
            price={creditPackages[selectedPackage].price}
            onSuccess={(credits, price) => handlePaymentSuccess(credits, price)}
            onCancel={() => {
              setShowPayment(false);
              setClientSecret('');
              setSelectedPackage(null);
            }}
          />
        </Elements>
      )}
    </div>
  );
};

export default MyCredits;
