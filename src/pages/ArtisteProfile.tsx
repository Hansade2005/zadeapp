import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { Music, Save, X, Plus, Upload, Video, Image as ImageIcon, Instagram, Facebook, Youtube, Globe, Twitter } from 'lucide-react';
import { toast } from 'react-toastify';

const ArtisteProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    stage_name: '',
    category: 'musician',
    bio: '',
    experience_years: 0,
    hourly_rate: 0,
    profile_image: '',
    video_urls: [] as string[],
    audio_urls: [] as string[],
    gallery_images: [] as string[],
    instagram_url: '',
    facebook_url: '',
    youtube_url: '',
    twitter_url: '',
    website_url: '',
    specialties: [] as string[],
    equipment_owned: [] as string[],
    travel_radius_km: 50
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('artiste_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormData({
          stage_name: data.stage_name || '',
          category: data.category || 'musician',
          bio: data.bio || '',
          experience_years: data.experience_years || 0,
          hourly_rate: data.hourly_rate || 0,
          profile_image: data.profile_image || '',
          video_urls: data.video_urls || [],
          audio_urls: data.audio_urls || [],
          gallery_images: data.gallery_images || [],
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          youtube_url: data.youtube_url || '',
          twitter_url: data.twitter_url || '',
          website_url: data.website_url || '',
          specialties: data.specialties || [],
          equipment_owned: data.equipment_owned || [],
          travel_radius_km: data.travel_radius_km || 50
        });
      } else {
        setEditing(true); // New profile, start in edit mode
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.stage_name.trim()) {
      toast.error('Please enter your stage name');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        user_id: user!.id,
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('artiste_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment_owned.includes(newEquipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment_owned: [...prev.equipment_owned, newEquipment.trim()]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment_owned: prev.equipment_owned.filter((_, i) => i !== index)
    }));
  };

  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        video_urls: [...prev.video_urls, newVideoUrl.trim()]
      }));
      setNewVideoUrl('');
    }
  };

  const removeVideoUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      video_urls: prev.video_urls.filter((_, i) => i !== index)
    }));
  };

  const addAudioUrl = () => {
    if (newAudioUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        audio_urls: [...prev.audio_urls, newAudioUrl.trim()]
      }));
      setNewAudioUrl('');
    }
  };

  const removeAudioUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      audio_urls: prev.audio_urls.filter((_, i) => i !== index)
    }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artiste Profile</h1>
              <p className="text-gray-600 mt-1">Showcase your talent and get booked for events</p>
            </div>
            {!editing && profile && (
              <button
                onClick={() => setEditing(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Basic Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage Name *
                  </label>
                  <input
                    type="text"
                    value={formData.stage_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage_name: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Your stage/professional name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="musician">Musician/Band</option>
                    <option value="dj">DJ</option>
                    <option value="model">Model</option>
                    <option value="usher">Usher/Event Staff</option>
                    <option value="event_organizer">Event Organizer</option>
                    <option value="venue_manager">Venue Manager</option>
                    <option value="decorator">Decorator</option>
                    <option value="stage_crew">Stage & Lighting Crew</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: Number(e.target.value) }))}
                    disabled={!editing}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (CAD$)
                  </label>
                  <input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: Number(e.target.value) }))}
                    disabled={!editing}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!editing}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  placeholder="Tell us about yourself, your experience, and what makes you unique..."
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  value={formData.profile_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, profile_image: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Specialties & Skills</h2>
              {editing && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add a specialty..."
                  />
                  <button
                    onClick={addSpecialty}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {specialty}
                    {editing && (
                      <button
                        onClick={() => removeSpecialty(index)}
                        className="hover:text-indigo-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Equipment Owned</h2>
              {editing && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add equipment..."
                  />
                  <button
                    onClick={addEquipment}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {formData.equipment_owned.map((equipment, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {equipment}
                    {editing && (
                      <button
                        onClick={() => removeEquipment(index)}
                        className="hover:text-gray-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Media Section */}
            <div className="mb-8 space-y-6">
              {/* Videos */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Portfolio
                </h2>
                {editing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="YouTube, Vimeo, or video URL..."
                    />
                    <button
                      onClick={addVideoUrl}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {formData.video_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Video className="w-4 h-4 text-indigo-600" />
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-indigo-600 hover:underline truncate">
                        {url}
                      </a>
                      {editing && (
                        <button
                          onClick={() => removeVideoUrl(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Audio/Music Samples
                </h2>
                {editing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newAudioUrl}
                      onChange={(e) => setNewAudioUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="SoundCloud, Spotify, or audio URL..."
                    />
                    <button
                      onClick={addAudioUrl}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {formData.audio_urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Music className="w-4 h-4 text-purple-600" />
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-purple-600 hover:underline truncate">
                        {url}
                      </a>
                      {editing && (
                        <button
                          onClick={() => removeAudioUrl(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Photo Gallery
                </h2>
                {editing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Image URL..."
                    />
                    <button
                      onClick={addImageUrl}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.gallery_images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {editing && (
                        <button
                          onClick={() => removeImageUrl(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Social Media & Web Links</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                    disabled={!editing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Instagram profile URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                    disabled={!editing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Facebook profile URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    disabled={!editing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="YouTube channel URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <input
                    type="url"
                    value={formData.twitter_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                    disabled={!editing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Twitter profile URL"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    disabled={!editing}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Personal website URL"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                {profile && (
                  <button
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ArtisteProfilePage;
