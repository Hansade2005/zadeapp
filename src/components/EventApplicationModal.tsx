import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

interface EventApplicationModalProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  onClose: () => void;
  onApplicationSubmitted: () => void;
}

export const EventApplicationModal: React.FC<EventApplicationModalProps> = ({
  eventId,
  eventTitle,
  eventDate,
  onClose,
  onApplicationSubmitted,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [artisteProfile, setArtisteProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    role_applied: '',
    proposal: '',
    quoted_price: '',
  });

  const roles = [
    'Musician/Band',
    'DJ',
    'Model',
    'Usher',
    'Event Organizer',
    'Venue Manager',
    'Decorator',
    'Stage Crew',
    'Photographer',
    'Videographer',
    'Caterer',
    'MC/Host',
    'Security',
    'Other',
  ];

  React.useEffect(() => {
    fetchArtisteProfile();
  }, [user]);

  const fetchArtisteProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('artiste_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching artiste profile:', error);
    }

    setArtisteProfile(data);
    setLoadingProfile(false);

    // Pre-fill role if profile has category
    if (data?.category) {
      const categoryToRole: Record<string, string> = {
        musician: 'Musician/Band',
        dj: 'DJ',
        model: 'Model',
        usher: 'Usher',
        event_organizer: 'Event Organizer',
        venue_manager: 'Venue Manager',
        decorator: 'Decorator',
        stage_crew: 'Stage Crew',
      };
      setFormData((prev) => ({
        ...prev,
        role_applied: categoryToRole[data.category] || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to apply');
      return;
    }

    if (!formData.role_applied || !formData.proposal) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const applicationData: any = {
        event_id: eventId,
        artiste_id: user.id,
        role_applied: formData.role_applied,
        proposal: formData.proposal,
        quoted_price: formData.quoted_price ? parseFloat(formData.quoted_price) : null,
        status: 'pending',
      };

      // Add artiste_profile_id if profile exists
      if (artisteProfile) {
        applicationData.artiste_profile_id = artisteProfile.id;
      }

      const { error } = await supabase
        .from('event_applications')
        .insert(applicationData);

      if (error) throw error;

      toast.success('Application submitted successfully!');
      onApplicationSubmitted();
      onClose();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply to Event</h2>
            <p className="text-sm text-gray-600 mt-1">{eventTitle}</p>
            <p className="text-xs text-gray-500">{new Date(eventDate).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Artiste Profile Notice */}
          {!artisteProfile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Create an{' '}
                <a href="/artiste-profile" className="text-blue-600 underline">
                  Artiste Profile
                </a>{' '}
                to increase your chances! Event organizers prefer applicants with complete
                portfolios.
              </p>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Applying For <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role_applied}
              onChange={(e) =>
                setFormData({ ...formData, role_applied: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a role...</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Proposal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Proposal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.proposal}
              onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
              required
              rows={6}
              placeholder="Tell the organizer why you're perfect for this event. Include your relevant experience, what you'll bring, and any special equipment or services you offer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.proposal.length}/1000 characters
            </p>
          </div>

          {/* Quoted Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rate (CAD$) <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="number"
              value={formData.quoted_price}
              onChange={(e) =>
                setFormData({ ...formData, quoted_price: e.target.value })
              }
              placeholder="e.g., 50000"
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if you prefer to negotiate or work on commission
            </p>
          </div>

          {/* Profile Preview (if exists) */}
          {artisteProfile && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Your Artiste Profile
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Stage Name:</strong> {artisteProfile.stage_name}
                </p>
                <p>
                  <strong>Category:</strong>{' '}
                  {artisteProfile.category?.replace('_', ' ').toUpperCase()}
                </p>
                {artisteProfile.rating > 0 && (
                  <p>
                    <strong>Rating:</strong> ⭐ {artisteProfile.rating.toFixed(1)} (
                    {artisteProfile.total_reviews} reviews)
                  </p>
                )}
                {artisteProfile.completed_events > 0 && (
                  <p>
                    <strong>Events Completed:</strong> {artisteProfile.completed_events}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
