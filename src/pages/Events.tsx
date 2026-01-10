import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, Calendar, MapPin, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import EventCard from '../components/EventCard';
import EventRegistrationModal from '../components/EventRegistrationModal';
import { EventApplicationModal } from '../components/EventApplicationModal';

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [registering, setRegistering] = useState<string | null>(null);
  const [registrationModal, setRegistrationModal] = useState({
    isOpen: false,
    eventId: '',
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventPrice: 0,
    maxAttendees: 0,
    currentAttendees: 0
  });
  const [applicationModal, setApplicationModal] = useState({
    isOpen: false,
    eventId: '',
    eventTitle: '',
    eventDate: '',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching events:', error);
          return;
        }

        // Map database fields to component expected format
        const mappedEvents = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: `${event.start_time} - ${event.end_time}`,
          location: `${event.venue}, ${event.location}`,
          price: event.price,
          attendees: event.current_attendees,
          maxAttendees: event.max_attendees,
          image: event.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
          category: event.category,
          organizer: 'Event Organizer' // Could be derived from organizer_id in future
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search and category
  useEffect(() => {
    let filtered = events;

    // Filter by category
    if (selectedCategory !== 'All Events') {
      filtered = filtered.filter(event =>
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, searchQuery]);

  const handleRegister = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setRegistrationModal({
        isOpen: true,
        eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        eventPrice: event.price,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.attendees
      });
    }
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCategoryCounts();
  }, [events]);

  const fetchCategoryCounts = () => {
    const counts: Record<string, number> = { 'All Events': events.length };
    events.forEach(event => {
      const category = event.category || 'Other';
      counts[category] = (counts[category] || 0) + 1;
    });
    setCategoryCounts(counts);
  };

  const eventCategories = [
    { name: 'All Events', count: events.length },
    { name: 'Technology', count: events.filter(e => e.category === 'Technology' || e.title?.toLowerCase().includes('tech') || e.title?.toLowerCase().includes('developer')).length },
    { name: 'Business', count: events.filter(e => e.category === 'Business' || e.title?.toLowerCase().includes('business') || e.title?.toLowerCase().includes('conference')).length },
    { name: 'Fashion', count: events.filter(e => e.category === 'Fashion' || e.title?.toLowerCase().includes('fashion') || e.title?.toLowerCase().includes('style')).length },
    { name: 'Music', count: events.filter(e => e.category === 'Music' || e.title?.toLowerCase().includes('music') || e.title?.toLowerCase().includes('concert')).length },
    { name: 'Food & Drink', count: events.filter(e => e.category === 'Food & Drink' || e.title?.toLowerCase().includes('food') || e.title?.toLowerCase().includes('drink') || e.title?.toLowerCase().includes('restaurant')).length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Discover Amazing Events</h1>
              <p className="text-xl text-purple-100 mb-8">
                Connect, learn, and have fun at events happening across Canada
              </p>
              
              {/* Event Search */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Location"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      Find Events
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Event Categories */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Browse Events</h2>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
            
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {eventCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery || selectedCategory !== 'All Events' ? 'Search Results' : 'Upcoming Events'}
              </h2>
              <p className="text-gray-600">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg">No events found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Events');
                    }}
                    className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    {...event}
                    onRegister={handleRegister}
                  />
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Load More Events
              </button>
            </div>
          </div>
        </section>

        {/* Create Event CTA */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Host Your Own Event</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Create memorable experiences and connect with your audience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                Create Event
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-indigo-600 transition-colors font-medium">
                Learn More
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Event Registration Modal */}
      <EventRegistrationModal
        isOpen={registrationModal.isOpen}
        onClose={() => setRegistrationModal(prev => ({ ...prev, isOpen: false }))}
        eventId={registrationModal.eventId}
        eventTitle={registrationModal.eventTitle}
        eventDate={registrationModal.eventDate}
        eventTime={registrationModal.eventTime}
        eventLocation={registrationModal.eventLocation}
        eventPrice={registrationModal.eventPrice}
        maxAttendees={registrationModal.maxAttendees}
        currentAttendees={registrationModal.currentAttendees}
        onRegistrationSuccess={() => {
          // Refresh events to show updated attendee count
          window.location.reload();
        }}
      />

      {/* Event Application Modal (for artistes) */}
      {applicationModal.isOpen && (
        <EventApplicationModal
          eventId={applicationModal.eventId}
          eventTitle={applicationModal.eventTitle}
          eventDate={applicationModal.eventDate}
          onClose={() => setApplicationModal({ isOpen: false, eventId: '', eventTitle: '', eventDate: '' })}
          onApplicationSubmitted={() => {
            // Optionally refresh or show success
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Events;