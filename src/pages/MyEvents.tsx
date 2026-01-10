import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import EventForm from '../components/EventForm';
import { BoostManager } from '../components/BoostManager';
import { Calendar, MapPin, Users, Clock, Trash2, Plus, Edit, Zap } from 'lucide-react';

interface Event {
  id: string;
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
  organizer_id: string;
  is_active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const MyEvents: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [boostingEvent, setBoostingEvent] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleCloseEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleEventFormSuccess = () => {
    fetchEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
                  <p className="text-gray-600 mt-1">Manage your organized events</p>
                </div>
                <button
                  onClick={handleCreateEvent}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Event
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="px-8 py-6">
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-600 mb-6">Create your first event to get started</p>
                  <button
                    onClick={handleCreateEvent}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-indigo-600 hover:text-indigo-800 p-1"
                            title="Edit event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button                            onClick={() => setBoostingEvent(event.id)}
                            className="text-purple-600 hover:text-purple-800 p-1"
                            title="Boost this event"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.location}{event.venue && ` • ${event.venue}`}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{event.current_attendees}{event.max_attendees ? `/${event.max_attendees}` : ''} attendees</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-indigo-600">
                            ${event.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {event.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      <EventForm
        isOpen={showEventForm}
        onClose={handleCloseEventForm}
        onSuccess={handleEventFormSuccess}
        initialData={editingEvent ? {
          title: editingEvent.title,
          description: editingEvent.description,
          category: editingEvent.category,
          start_date: editingEvent.start_date,
          end_date: editingEvent.end_date,
          start_time: editingEvent.start_time,
          end_time: editingEvent.end_time,
          location: editingEvent.location,
          venue: editingEvent.venue || '',
          price: editingEvent.price,
          max_attendees: editingEvent.max_attendees,
          tags: editingEvent.tags,
          images: editingEvent.images,
        } : undefined}
        isEditing={!!editingEvent}
        eventId={editingEvent?.id}
      />

      {boostingEvent && (
        <BoostManager
          entityType="event"
          entityId={boostingEvent}
          entityTitle={events.find(e => e.id === boostingEvent)?.title || 'Event'}
          onClose={() => setBoostingEvent(null)}
          onBoostSuccess={() => {
            setBoostingEvent(null);
            toast.success('Event boosted successfully!');
          }}
        />
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MyEvents;