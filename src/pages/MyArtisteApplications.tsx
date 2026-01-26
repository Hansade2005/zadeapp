import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Music, Calendar, MapPin, Clock, DollarSign, CheckCircle, XCircle,
  ArrowLeft, Eye, MessageCircle, RefreshCw, Star, Ban
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface ArtisteApplication {
  id: string;
  event_id: string;
  artiste_id: string;
  artiste_profile_id?: string;
  role_applied: string;
  proposal: string;
  quoted_price?: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
  event?: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    location: string;
    venue?: string;
    price: number;
    images?: string[];
    organizer_id: string;
  };
}

const MyArtisteApplications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ArtisteApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<ArtisteApplication | null>(null);
  const [hasArtisteProfile, setHasArtisteProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchApplications();
    checkArtisteProfile();
  }, [user, navigate]);

  const checkArtisteProfile = async () => {
    const { data } = await supabase
      .from('artiste_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    setHasArtisteProfile(!!data);
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          event:events!event_applications_event_id_fkey(
            id, title, description, start_date, end_date, start_time, end_time,
            location, venue, price, images, organizer_id
          )
        `)
        .eq('artiste_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'reviewed':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is being reviewed by the organizer';
      case 'reviewed':
        return 'The organizer has viewed your application';
      case 'accepted':
        return 'Congratulations! You have been accepted for this event!';
      case 'rejected':
        return 'Unfortunately, your application was not selected';
      default:
        return 'Application submitted';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleWithdrawApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const { error } = await supabase
        .from('event_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.filter(app => app.id !== applicationId));
      toast.success('Application withdrawn successfully');
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
                  <div className="h-32 bg-gray-200 rounded"></div>
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
              className="flex items-center gap-2 text-pink-600 hover:text-pink-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Event Applications</h1>
                <p className="text-gray-600 mt-1">Track your applications to perform at events</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchApplications}
                  className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <Link
                  to="/events"
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  <Music className="w-4 h-4" />
                  Find Events
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Notice */}
          {!hasArtisteProfile && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <strong>Tip:</strong> Create an{' '}
                <Link to="/artiste-profile" className="text-pink-600 underline font-medium">
                  Artist Profile
                </Link>{' '}
                to increase your chances of getting accepted! Organizers prefer applicants with complete portfolios.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: applications.length, color: 'bg-gray-100' },
              { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: 'bg-yellow-100' },
              { label: 'Accepted', value: applications.filter(a => a.status === 'accepted').length, color: 'bg-green-100' },
              { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'bg-red-100' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} rounded-lg p-4 text-center`}>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Applications' },
                { value: 'pending', label: 'Pending' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    filter === f.value
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't applied to any events yet."
                  : `No ${filter} applications found.`}
              </p>
              <Link
                to="/events"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors inline-block"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    <div className="md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                      {application.event?.images?.[0] ? (
                        <img
                          src={application.event.images[0]}
                          alt={application.event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-600 to-purple-600">
                          <Music className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Application Info */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          <Link
                            to={`/event/${application.event?.id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-pink-600 block"
                          >
                            {application.event?.title}
                          </Link>
                          <p className="text-pink-600 font-medium">{application.role_applied}</p>
                        </div>
                        {application.quoted_price && (
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${application.quoted_price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">Quoted Rate</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{application.event ? formatDate(application.event.start_date) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{application.event ? formatTime(application.event.start_time) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2 md:col-span-1">
                          <MapPin className="w-4 h-4" />
                          <span>{application.event?.venue}, {application.event?.location}</span>
                        </div>
                      </div>

                      {/* Status Message */}
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                        {getStatusIcon(application.status)}
                        <span className="text-sm text-gray-700">{getStatusMessage(application.status)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View Application
                        </button>
                        {application.event?.organizer_id && (
                          <button
                            onClick={() => navigate('/messages', { state: { recipientId: application.event?.organizer_id } })}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Contact Organizer
                          </button>
                        )}
                        {application.status === 'pending' && (
                          <button
                            onClick={() => handleWithdrawApplication(application.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Withdraw
                          </button>
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

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Event</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{selectedApplication.event?.title}</p>
                  <p className="text-gray-600">{selectedApplication.event?.venue}</p>
                  <p className="text-sm text-gray-500">{selectedApplication.event?.location}</p>
                </div>
              </div>

              {/* Role Applied */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Role Applied For</h3>
                <p className="text-pink-600 font-medium bg-pink-50 px-4 py-2 rounded-lg inline-block">
                  {selectedApplication.role_applied}
                </p>
              </div>

              {/* Proposal */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Your Proposal</h3>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                  {selectedApplication.proposal}
                </p>
              </div>

              {/* Quoted Price */}
              {selectedApplication.quoted_price && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quoted Rate</h3>
                  <p className="text-2xl font-bold text-pink-600">
                    ${selectedApplication.quoted_price.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)}
                  <span className="font-medium">
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied</span>
                    <span>{new Date(selectedApplication.created_at).toLocaleString()}</span>
                  </div>
                  {selectedApplication.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span>{new Date(selectedApplication.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedApplication(null)}
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

export default MyArtisteApplications;
