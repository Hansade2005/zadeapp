import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Music, Users as UsersIcon, Briefcase, Star, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import ArtisteCard from '../components/ArtisteCard';

const Artistes: React.FC = () => {
  const navigate = useNavigate();
  const [artistes, setArtistes] = useState<any[]>([]);
  const [filteredArtistes, setFilteredArtistes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const categories = [
    { value: 'all', label: 'All Categories', icon: UsersIcon },
    { value: 'musician', label: 'Musicians & Bands', icon: Music },
    { value: 'dj', label: 'DJs', icon: Music },
    { value: 'model', label: 'Models', icon: UsersIcon },
    { value: 'usher', label: 'Ushers & Event Staff', icon: UsersIcon },
    { value: 'event_organizer', label: 'Event Organizers', icon: Briefcase },
    { value: 'venue_manager', label: 'Venue Managers', icon: Briefcase },
    { value: 'decorator', label: 'Decorators', icon: Star },
    { value: 'stage_crew', label: 'Stage & Lighting Crew', icon: Briefcase }
  ];

  useEffect(() => {
    fetchArtistes();
  }, []);

  const fetchArtistes = async () => {
    try {
      const { data, error } = await supabase
        .from('artiste_profiles')
        .select(`
          *,
          users (
            full_name,
            location,
            avatar_url
          )
        `)
        .order('rating', { ascending: false });

      if (error) throw error;

      const mappedArtistes = data.map((artiste: any) => ({
        id: artiste.id,
        userId: artiste.user_id,
        name: artiste.stage_name,
        category: artiste.category,
        location: artiste.users?.location || 'Canada',
        rating: artiste.rating || 0,
        reviewCount: artiste.total_reviews || 0,
        hourlyRate: artiste.hourly_rate || 0,
        profileImage: artiste.profile_image || artiste.users?.avatar_url,
        isVerified: artiste.is_verified,
        completedEvents: artiste.completed_events || 0,
        specialties: artiste.specialties || [],
        hasVideo: artiste.video_urls && artiste.video_urls.length > 0,
        hasAudio: artiste.audio_urls && artiste.audio_urls.length > 0,
        hasGallery: artiste.gallery_images && artiste.gallery_images.length > 0,
        bio: artiste.bio,
        experienceYears: artiste.experience_years,
        instagramUrl: artiste.instagram_url,
        facebookUrl: artiste.facebook_url,
        youtubeUrl: artiste.youtube_url,
        websiteUrl: artiste.website_url
      }));

      setArtistes(mappedArtistes);
      setFilteredArtistes(mappedArtistes);
    } catch (error) {
      console.error('Error fetching artistes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = artistes;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(artiste => artiste.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(artiste =>
        artiste.name.toLowerCase().includes(query) ||
        artiste.specialties.some((s: string) => s.toLowerCase().includes(query)) ||
        artiste.location.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationFilter.trim()) {
      filtered = filtered.filter(artiste =>
        artiste.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredArtistes(filtered);
  }, [artistes, selectedCategory, searchQuery, locationFilter]);

  const handleViewProfile = (id: string) => {
    navigate(`/artiste/${id}`);
  };

  const handleContact = (id: string) => {
    const artiste = artistes.find(a => a.id === id);
    if (artiste) {
      navigate('/messages', { state: { recipientId: artiste.userId } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find the Perfect Artiste</h1>
            <p className="text-lg opacity-90">Book talented performers for your next event</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artistes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredArtistes.length} {filteredArtistes.length === 1 ? 'Artiste' : 'Artistes'} Found
            </h2>
          </div>

          {/* Artiste Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArtistes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Artistes Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtistes.map(artiste => (
                <ArtisteCard
                  key={artiste.id}
                  {...artiste}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Artistes;
