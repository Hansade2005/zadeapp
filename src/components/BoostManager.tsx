import React, { useState, useEffect } from 'react';
import { TrendingUp, X, Zap, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface BoostManagerProps {
  entityType: 'product' | 'job' | 'event' | 'artiste';
  entityId: string;
  entityTitle: string;
  onClose: () => void;
  onBoostSuccess: () => void;
}

interface BoostPlan {
  duration_days: number;
  credits_cost: number;
  name: string;
  description: string;
  benefits: string[];
}

const boostPlans: BoostPlan[] = [
  {
    duration_days: 7,
    credits_cost: 100,
    name: '7-Day Boost',
    description: 'Perfect for short-term visibility',
    benefits: ['7 days featured placement', 'Top of search results', '2x visibility'],
  },
  {
    duration_days: 14,
    credits_cost: 180,
    name: '14-Day Boost',
    description: 'Best value for steady growth',
    benefits: ['14 days featured placement', 'Top of search results', '2x visibility', '10% discount'],
  },
  {
    duration_days: 30,
    credits_cost: 300,
    name: '30-Day Boost',
    description: 'Maximum exposure and ROI',
    benefits: ['30 days featured placement', 'Top of search results', '3x visibility', '25% discount'],
  },
];

export const BoostManager: React.FC<BoostManagerProps> = ({
  entityType,
  entityId,
  entityTitle,
  onClose,
  onBoostSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<BoostPlan | null>(null);
  const [currentBoost, setCurrentBoost] = useState<any>(null);

  useEffect(() => {
    fetchUserCredits();
    checkExistingBoost();
  }, [user]);

  const fetchUserCredits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching credits:', error);
    }

    setUserCredits(data?.balance || 0);
    setLoadingCredits(false);
  };

  const checkExistingBoost = async () => {
    const { data } = await supabase
      .from('boost_purchases')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_active', true)
      .single();

    if (data) {
      setCurrentBoost(data);
    }
  };

  const handlePurchaseBoost = async () => {
    if (!user || !selectedPlan) return;

    if (userCredits < selectedPlan.credits_cost) {
      toast.error('Insufficient credits. Please purchase more credits.');
      return;
    }

    if (currentBoost) {
      toast.error('This item is already boosted. Wait for the current boost to expire.');
      return;
    }

    setLoading(true);

    try {
      // Calculate boost end date
      const boostStartDate = new Date();
      const boostEndDate = new Date();
      boostEndDate.setDate(boostEndDate.getDate() + selectedPlan.duration_days);

      // Start a transaction: deduct credits, create boost, update entity
      const { data: creditData, error: creditError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (creditError) throw creditError;

      const newBalance = (creditData?.balance || 0) - selectedPlan.credits_cost;

      if (newBalance < 0) {
        throw new Error('Insufficient credits');
      }

      // Update credit balance
      const { error: updateCreditError } = await supabase
        .from('credits')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateCreditError) throw updateCreditError;

      // Create credit transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'boost',
          amount: -selectedPlan.credits_cost,
          balance_after: newBalance,
          description: `Boost ${entityType} "${entityTitle}" for ${selectedPlan.duration_days} days`,
        });

      if (transactionError) throw transactionError;

      // Create boost purchase
      const { error: boostError } = await supabase
        .from('boost_purchases')
        .insert({
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId,
          credits_spent: selectedPlan.credits_cost,
          boost_duration_days: selectedPlan.duration_days,
          boost_start_date: boostStartDate.toISOString(),
          boost_end_date: boostEndDate.toISOString(),
          is_active: true,
        });

      if (boostError) throw boostError;

      // Update entity with boost info
      const tableName = `${entityType}${entityType === 'artiste' ? '_profiles' : 's'}`;
      const { error: updateEntityError } = await supabase
        .from(tableName)
        .update({
          is_boosted: true,
          boost_expires_at: boostEndDate.toISOString(),
          boost_score: selectedPlan.duration_days * 10,
        })
        .eq('id', entityId);

      if (updateEntityError) throw updateEntityError;

      toast.success(`Successfully boosted ${entityType} for ${selectedPlan.duration_days} days!`);
      setUserCredits(newBalance);
      onBoostSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error purchasing boost:', error);
      toast.error(error.message || 'Failed to purchase boost');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Boost Your {entityType}</h2>
              <p className="text-sm text-yellow-100">{entityTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-yellow-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Current Boost Status */}
          {currentBoost && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                <CheckCircle className="h-5 w-5" />
                Currently Boosted
              </div>
              <p className="text-sm text-green-700">
                Expires on {formatDate(currentBoost.boost_end_date)}
              </p>
            </div>
          )}

          {/* Credits Balance */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Credits Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loadingCredits ? '...' : `${userCredits} Credits`}
                </p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Buy More Credits
              </button>
            </div>
          </div>

          {/* Boost Plans */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Boost Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {boostPlans.map((plan) => (
                <div
                  key={plan.duration_days}
                  onClick={() => !currentBoost && setSelectedPlan(plan)}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan?.duration_days === plan.duration_days
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  } ${currentBoost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {plan.duration_days === 14 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h4 className="font-bold text-gray-900 text-lg">{plan.name}</h4>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-yellow-600">
                      {plan.credits_cost}
                    </div>
                    <div className="text-sm text-gray-500">Credits</div>
                  </div>

                  <ul className="space-y-2">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Boost Benefits
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Appear at the top of search results</li>
              <li>• Display "FEATURED" badge on your listing</li>
              <li>• Increased visibility to potential customers</li>
              <li>• Priority placement in category listings</li>
              <li>• Higher click-through rates and conversions</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchaseBoost}
              disabled={loading || !selectedPlan || currentBoost || userCredits < (selectedPlan?.credits_cost || 0)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                'Processing...'
              ) : currentBoost ? (
                'Already Boosted'
              ) : !selectedPlan ? (
                'Select a Plan'
              ) : userCredits < selectedPlan.credits_cost ? (
                'Insufficient Credits'
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Boost Now - {selectedPlan.credits_cost} Credits
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
