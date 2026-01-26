import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, ArrowLeft, Ticket,
  CheckCircle, XCircle, RefreshCw, MessageCircle, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { ContactOrganizerModal } from '../components/ContactOrganizerModal';

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type: string;
  quantity: number;
  total_price: number;
  status: string | null;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  created_at: string;
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
    organizer?: {
      full_name: string;
    };
  };
}

const MyRegistrations: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    title: string;
    organizerId: string;
    organizerName: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRegistrations();
  }, [user, navigate]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events!event_registrations_event_id_fkey(
            id, title, description, start_date, end_date, start_time, end_time,
            location, venue, price, images, organizer_id,
            organizer:users!events_organizer_id_fkey(full_name)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
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

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'attended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const status = reg.status || 'pending';
    if (filter === 'all') return true;
    if (filter === 'upcoming') return reg.event && isUpcoming(reg.event.start_date) && status !== 'cancelled';
    if (filter === 'past') return reg.event && !isUpcoming(reg.event.start_date);
    if (filter === 'cancelled') return status === 'cancelled';
    return true;
  });

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) throw error;

      setRegistrations(registrations.map(reg =>
        reg.id === registrationId ? { ...reg, status: 'cancelled' as const } : reg
      ));
      toast.success('Registration cancelled successfully');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
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
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Event Registrations</h1>
                <p className="text-gray-600 mt-1">View and manage your event tickets</p>
              </div>
              <button
                onClick={fetchRegistrations}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: registrations.length, color: 'bg-gray-100' },
              { label: 'Upcoming', value: registrations.filter(r => r.event && isUpcoming(r.event.start_date) && (r.status || 'pending') !== 'cancelled').length, color: 'bg-purple-100' },
              { label: 'Paid', value: registrations.filter(r => r.payment_status === 'paid').length, color: 'bg-green-100' },
              { label: 'Cancelled', value: registrations.filter(r => (r.status || 'pending') === 'cancelled').length, color: 'bg-red-100' },
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
                { value: 'all', label: 'All Events' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past Events' },
                { value: 'cancelled', label: 'Cancelled' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    filter === f.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registrations List */}
          {filteredRegistrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't registered for any events yet."
                  : `No ${filter} registrations found.`}
              </p>
              <Link
                to="/events"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Event Image */}
                    <div className="md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                      {registration.event?.images?.[0] ? (
                        <img
                          src={registration.event.images[0]}
                          alt={registration.event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
                          <Calendar className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {registration.event && isUpcoming(registration.event.start_date) && (registration.status || 'pending') !== 'cancelled' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                Upcoming
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(registration.status || 'pending')}`}>
                              {(registration.status || 'pending').charAt(0).toUpperCase() + (registration.status || 'pending').slice(1)}
                            </span>
                          </div>
                          <Link
                            to={`/event/${registration.event?.id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-purple-600"
                          >
                            {registration.event?.title}
                          </Link>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">
                            {registration.quantity} {registration.quantity === 1 ? 'Ticket' : 'Tickets'}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${(registration.total_price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{registration.event ? formatDate(registration.event.start_date) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{registration.event ? formatTime(registration.event.start_time) : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <MapPin className="w-4 h-4" />
                          <span>{registration.event?.venue}, {registration.event?.location}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/event/${registration.event?.id}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View Event
                        </Link>
                        {registration.event?.organizer_id && (
                          <button
                            onClick={() => {
                              setSelectedEvent({
                                id: registration.event!.id,
                                title: registration.event!.title,
                                organizerId: registration.event!.organizer_id,
                                organizerName: registration.event!.organizer?.full_name || 'Event Organizer'
                              });
                              setShowContactModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Contact Organizer
                          </button>
                        )}
                        {registration.event && isUpcoming(registration.event.start_date) && (registration.status === 'confirmed' || registration.payment_status === 'paid') && (
                          <button
                            onClick={() => handleCancelRegistration(registration.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel Registration
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

      <Footer />
      <MobileBottomNav />

      {/* Contact Organizer Modal */}
      {showContactModal && selectedEvent && (
        <ContactOrganizerModal
          organizerId={selectedEvent.organizerId}
          organizerName={selectedEvent.organizerName}
          eventTitle={selectedEvent.title}
          eventId={selectedEvent.id}
          onClose={() => {
            setShowContactModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default MyRegistrations;
