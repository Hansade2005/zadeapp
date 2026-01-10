import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  avatar_url: string;
  is_freelancer: boolean;
  created_at: string;
  updated_at: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
        })
        .eq('id', user?.id);

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
      });
    }
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                  <p className="text-gray-600 mt-1">Manage your personal information</p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture & Basic Info */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-16 h-16 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {profile?.full_name || 'Anonymous User'}
                    </h2>
                    <p className="text-gray-600">Member</p>
                    {profile && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Joined {formatDate(profile.created_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile?.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your location"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profile?.location || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.bio || 'No bio provided yet.'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Profile;