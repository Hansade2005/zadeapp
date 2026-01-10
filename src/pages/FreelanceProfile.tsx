import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { User, Star, Mail, Phone, MapPin, Briefcase, Plus, X } from 'lucide-react';

interface FreelancerProfile {
  id: string;
  user_id: string;
  title?: string;
  full_name: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  portfolio_url: string;
  hourly_rate: number;
  experience_years: number;
  rating: number;
  completed_projects: number;
  created_at: string;
  updated_at: string;
}

const FreelanceProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    portfolio_url: '',
    hourly_rate: 0,
    experience_years: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          title: data.title || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          skills: data.skills || [],
          portfolio_url: data.portfolio_url || '',
          hourly_rate: data.hourly_rate || 0,
          experience_years: data.experience_years || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title for your profile.');
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        user_id: user?.id,
        title: formData.title.trim(),
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        portfolio_url: formData.portfolio_url,
        hourly_rate: formData.hourly_rate,
        experience_years: formData.experience_years,
        updated_at: new Date().toISOString()
      };

      // Use upsert with onConflict to handle user_id uniqueness
      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      await fetchProfile();
      setEditing(false);
      alert('Profile saved successfully!');
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
        title: profile.title || '',
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        portfolio_url: profile.portfolio_url || '',
        hourly_rate: profile.hourly_rate || 0,
        experience_years: profile.experience_years || 0,
      });
    }
    setEditing(false);
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
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
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Freelance Profile</h1>
                  <p className="text-gray-600 mt-1">Showcase your skills and attract clients</p>
                </div>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <span>{profile ? 'Edit Profile' : 'Create Profile'}</span>
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
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Picture & Basic Info */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profile?.full_name || 'Anonymous Freelancer'}
                      </h2>
                      <p className="text-gray-600">Freelancer</p>
                      {profile && (
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            ({profile.completed_projects} projects completed)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g. Full Stack Developer, UX Designer"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.title || 'Not provided'}</p>
                      )}
                    </div>

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
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.full_name || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{user?.email}</span>
                      </div>
                    </div>

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
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profile?.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

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
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profile?.location || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hourly Rate
                      </label>
                      {editing ? (
                        <input
                          type="number"
                          value={formData.hourly_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          ${profile?.hourly_rate?.toLocaleString() || 'Not set'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      {editing ? (
                        <input
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{profile?.experience_years || 0} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio, Skills & Portfolio */}
                <div className="space-y-6">
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
                        placeholder="Tell clients about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.bio || 'No bio provided yet.'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills
                    </label>
                    {editing ? (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Add a skill..."
                          />
                          <button
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                            >
                              <span>{skill}</span>
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-1 text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No skills added yet</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio URL
                    </label>
                    {editing ? (
                      <input
                        type="url"
                        value={formData.portfolio_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      profile?.portfolio_url ? (
                        <a
                          href={profile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 underline"
                        >
                          {profile.portfolio_url}
                        </a>
                      ) : (
                        <span className="text-gray-500">No portfolio link provided</span>
                      )
                    )}
                  </div>

                  {/* Stats */}
                  {profile && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Freelance Stats</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600">{profile.completed_projects}</div>
                          <div className="text-sm text-gray-600">Projects Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-2xl font-bold text-gray-900">{profile.rating.toFixed(1)}</span>
                          </div>
                          <div className="text-sm text-gray-600">Average Rating</div>
                        </div>
                      </div>
                    </div>
                  )}
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

export default FreelanceProfile;