import React, { useState, useEffect } from 'react';
import { X, Check, Clock, User, Star, MessageCircle, Ban } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface Application {
  id: string;
  event_id: string;
  artiste_id: string;
  artiste_profile_id?: string;
  role_applied: string;
  proposal: string;
  quoted_price?: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  artiste_profile?: {
    full_name: string;
    stage_name?: string;
    category: string;
    bio?: string;
    average_rating?: number;
    review_count?: number;
    portfolio_images?: string[];
  };
  user?: {
    full_name: string;
    email: string;
  };
}

interface EventApplicationsManagerProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

export const EventApplicationsManager: React.FC<EventApplicationsManagerProps> = ({
  eventId,
  eventTitle,
  onClose,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [eventId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('event_applications')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        return;
      }

      // Fetch artiste profile and user details for each application
      const applicationsWithDetails = await Promise.all(
        (data || []).map(async (app) => {
          const details: any = { ...app };

          // Fetch artiste profile if exists
          if (app.artiste_profile_id) {
            const { data: profileData } = await supabase
              .from('artiste_profiles')
              .select('*')
              .eq('id', app.artiste_profile_id)
              .single();

            if (profileData) {
              details.artiste_profile = profileData;
            }
          }

          // Fetch user details
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', app.artiste_id)
            .single();

          if (userData) {
            details.user = userData;
          }

          return details;
        })
      );

      setApplications(applicationsWithDetails);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: 'reviewed' | 'accepted' | 'rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('event_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast.success(`Application ${newStatus}!`);
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Error updating application:', error);
      toast.error(error.message || 'Failed to update application');
    }
  };

  const filteredApplications = applications.filter((app) =>
    filter === 'all' ? true : app.status === filter
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: MessageCircle },
      accepted: { color: 'bg-green-100 text-green-800', icon: Check },
      rejected: { color: 'bg-red-100 text-red-800', icon: Ban },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Event Applications</h2>
            <p className="text-sm text-gray-600 mt-1">{eventTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
          {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map((f) => {
            const count = f === 'all' ? applications.length : applications.filter(app => app.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-lg">
                          {(app.artiste_profile?.stage_name || app.user?.full_name || 'A')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {app.artiste_profile?.stage_name || app.user?.full_name || 'Unknown Artiste'}
                        </p>
                        <p className="text-sm text-gray-600">{app.role_applied}</p>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Rating */}
                  {app.artiste_profile?.average_rating && (
                    <div className="flex items-center gap-2 mb-3">
                      {renderStars(Math.round(app.artiste_profile.average_rating))}
                      <span className="text-sm text-gray-600">
                        {app.artiste_profile.average_rating.toFixed(1)} ({app.artiste_profile.review_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Proposal Excerpt */}
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {app.proposal}
                  </p>

                  {/* Price & Date */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    {app.quoted_price && (
                      <span className="font-medium">${app.quoted_price.toLocaleString()}</span>
                    )}
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'accepted')}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedApplication.artiste_profile?.stage_name || selectedApplication.user?.full_name}
                    </h3>
                    <p className="text-gray-600">{selectedApplication.role_applied}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Profile Info */}
                {selectedApplication.artiste_profile && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Profile</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Category:</strong> {selectedApplication.artiste_profile.category}
                      </p>
                      {selectedApplication.artiste_profile.bio && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Bio:</strong> {selectedApplication.artiste_profile.bio}
                        </p>
                      )}
                      {selectedApplication.artiste_profile.average_rating && (
                        <div className="flex items-center gap-2">
                          {renderStars(Math.round(selectedApplication.artiste_profile.average_rating))}
                          <span className="text-sm text-gray-600">
                            {selectedApplication.artiste_profile.average_rating.toFixed(1)} ({selectedApplication.artiste_profile.review_count} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Proposal */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Proposal</h4>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                    {selectedApplication.proposal}
                  </p>
                </div>

                {/* Price */}
                {selectedApplication.quoted_price && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Quoted Price</h4>
                    <p className="text-2xl font-bold text-indigo-600">
                      ${selectedApplication.quoted_price.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Accept Application
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
