import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, DollarSign, Users, ArrowLeft,
  Share2, Bookmark, Ticket, CheckCircle, Globe, Music
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import EventRegistrationModal from '../components/EventRegistrationModal';

interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  venue?: string;
  price: number;
  max_attendees?: number;
  current_attendees: number;
  images: string[];
  tags: string[];
  is_active: boolean;
  featured: boolean;
  is_boosted?: boolean;
  created_at: string;
  organizer?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchEvent();
      checkIfRegistered();
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:users!events_organizer_id_fkey(full_name, email, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);

      // Fetch similar events
      if (data) {
        const { data: similar } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .neq('id', id)
          .eq('category', data.category)
          .gte('start_date', new Date().toISOString().split('T')[0])
          .limit(3);

        setSimilarEvents(similar || []);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfRegistered = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      setIsRegistered(!!data);
    } catch (error) {
      // No registration found
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from saved events' : 'Event saved!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const isSoldOut = event?.max_attendees && event.current_attendees >= event.max_attendees;
  const spotsLeft = event?.max_attendees ? event.max_attendees - event.current_attendees : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-6">This event may have been cancelled or doesn't exist.</p>
            <Link
              to="/events"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              Browse All Events
            </Link>
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
        {/* Hero Image */}
        <div className="relative h-[400px] bg-gray-900">
          {event.images && event.images.length > 0 ? (
            <img
              src={event.images[selectedImage]}
              alt={event.title}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600">
              <Calendar className="w-24 h-24 text-white opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-2 text-white mb-4 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </button>

              {event.is_boosted && (
                <span className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                  FEATURED EVENT
                </span>
              )}

              <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {event.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue}, {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Thumbnails */}
        {event.images && event.images.length > 1 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {event.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-purple-600' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Date & Time</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatDate(event.start_date)}</p>
                      {event.end_date !== event.start_date && (
                        <p className="text-gray-600">to {formatDate(event.end_date)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </p>
                      <p className="text-gray-600">Local time</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.venue}</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Registration Card */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {event.price === 0 ? 'Free' : `$${event.price.toLocaleString()}`}
                    </p>
                    <p className="text-gray-600 text-sm">per ticket</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBookmark}
                      className={`p-2 rounded-full ${isBookmarked ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'} hover:bg-purple-100`}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {event.max_attendees && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.current_attendees} / {event.max_attendees} attendees
                      </span>
                      {spotsLeft && spotsLeft <= 20 && !isSoldOut && (
                        <span className="text-orange-600 font-medium">
                          Only {spotsLeft} spots left!
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isSoldOut ? 'bg-red-600' : 'bg-purple-600'}`}
                        style={{ width: `${(event.current_attendees / event.max_attendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {isRegistered ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">You're registered!</p>
                    <p className="text-green-600 text-sm">Check your email for details.</p>
                  </div>
                ) : isSoldOut ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-800 font-medium">Sold Out</p>
                    <p className="text-red-600 text-sm">This event is at full capacity.</p>
                  </div>
                ) : user ? (
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Register Now
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      Login to Register
                    </Link>
                    <p className="text-center text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-purple-600 hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Organizer Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {event.organizer?.full_name || 'Event Organizer'}
                    </p>
                    <p className="text-sm text-gray-600">Event Host</p>
                  </div>
                </div>
              </div>

              {/* Similar Events */}
              {similarEvents.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Similar Events</h3>
                  <div className="space-y-4">
                    {similarEvents.map((similarEvent) => (
                      <Link
                        key={similarEvent.id}
                        to={`/event/${similarEvent.id}`}
                        className="block p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{similarEvent.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(similarEvent.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-purple-600">
                          {similarEvent.price === 0 ? 'Free' : `$${similarEvent.price}`}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Registration Modal */}
      <EventRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        eventId={event.id}
        eventTitle={event.title}
        eventDate={formatDate(event.start_date)}
        eventTime={`${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
        eventLocation={`${event.venue}, ${event.location}`}
        eventPrice={event.price}
        maxAttendees={event.max_attendees || 0}
        currentAttendees={event.current_attendees}
        onRegistrationSuccess={() => {
          setIsRegistered(true);
          toast.success('Registration successful!');
        }}
      />
    </div>
  );
};

export default EventDetail;
