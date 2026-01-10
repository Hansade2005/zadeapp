import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Upload, Camera,
  TrendingUp, Package, Briefcase, Star, Link as LinkIcon, 
  Instagram, Twitter, Linkedin, Globe, Heart
} from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { LocationPicker } from '../components/LocationPicker';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  city?: string;
  state?: string;
  country?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  user_type: string;
  created_at: string;
}

interface UserStats {
  products: number;
  jobs: number;
  events: number;
  wishlists: number;
  reviews: number;
}

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ products: 0, jobs: 0, events: 0, wishlists: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    location_name: '',
    city: '',
    state: '',
    country: '',
    social_links: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: '',
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        bio: data.bio || '',
        latitude: data.latitude,
        longitude: data.longitude,
        location_name: data.location_name || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        social_links: data.social_links || {
          instagram: '',
          twitter: '',
          linkedin: '',
          website: '',
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [productsRes, jobsRes, eventsRes, wishlistsRes, reviewsRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('employer_id', user.id),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('organizer_id', user.id),
        supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setStats({
        products: productsRes.count || 0,
        jobs: jobsRes.count || 0,
        events: eventsRes.count || 0,
        wishlists: wishlistsRes.count || 0,
        reviews: reviewsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully!');
      fetchProfile();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          latitude: formData.latitude,
          longitude: formData.longitude,
          location_name: formData.location_name,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          social_links: formData.social_links,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    }
  };

  const handleLocationSelect = (locationData: any) => {
    setFormData(prev => ({
      ...prev,
      latitude: locationData.lat,
      longitude: locationData.lon,
      location_name: locationData.location_name,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
    }));
    setShowLocationPicker(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-16 w-16 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <Camera className="h-4 w-4" />
                    </label>
                  )}
                </div>

                {/* Profile Info */}
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{profile.user_type}</p>
                </div>

                {/* Edit Button */}
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                <div className="text-center">
                  <Package className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
                <div className="text-center">
                  <Briefcase className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.jobs}</p>
                  <p className="text-sm text-gray-600">Jobs</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
                  <p className="text-sm text-gray-600">Events</p>
                </div>
                <div className="text-center">
                  <Heart className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.wishlists}</p>
                  <p className="text-sm text-gray-600">Wishlists</p>
                </div>
                <div className="text-center">
                  <Star className="h-6 w-6 text-indigo-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{stats.reviews}</p>
                  <p className="text-sm text-gray-600">Reviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 123 456 7890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{profile.bio || 'No bio yet'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {editing ? (
                      <div>
                        <button
                          onClick={() => setShowLocationPicker(true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {formData.location_name || 'Select location on map...'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {profile.location_name || `${profile.city || ''}, ${profile.state || ''}`.trim() || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Social Links</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={formData.social_links.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, instagram: e.target.value }
                        })}
                        placeholder="https://instagram.com/username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      profile.social_links?.instagram ? (
                        <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                          {profile.social_links.instagram}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not set</p>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={formData.social_links.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, twitter: e.target.value }
                        })}
                        placeholder="https://twitter.com/username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      profile.social_links?.twitter ? (
                        <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                          {profile.social_links.twitter}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not set</p>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={formData.social_links.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, linkedin: e.target.value }
                        })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      profile.social_links?.linkedin ? (
                        <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                          {profile.social_links.linkedin}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not set</p>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={formData.social_links.website}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, website: e.target.value }
                        })}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      profile.social_links?.website ? (
                        <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                          {profile.social_links.website}
                        </a>
                      ) : (
                        <p className="text-gray-500">Not set</p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Account Info</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="text-gray-900 font-medium">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="text-gray-900 font-medium capitalize">{profile.user_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Joined</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <a href="/my-products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    My Products
                  </a>
                  <a href="/my-jobs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    My Jobs
                  </a>
                  <a href="/my-events" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    My Events
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">Select Your Location</h3>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <LocationPicker
              initialLat={formData.latitude}
              initialLon={formData.longitude}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
