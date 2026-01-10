import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { Bell, Moon, Sun, Globe, Shield, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    theme: 'light', // 'light', 'dark', 'system'
    language: 'en',
    timezone: 'UTC',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save these to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
                  <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-600 mt-1">Manage your account preferences</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="px-8 py-6 space-y-8">
              {/* Notifications */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                      <p className="text-sm text-gray-600">Receive emails about new features and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => updateSetting('marketingEmails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  {settings.theme === 'dark' ? (
                    <Moon className="w-6 h-6 text-indigo-600" />
                  ) : (
                    <Sun className="w-6 h-6 text-indigo-600" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900">Appearance</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Theme</h3>
                    <div className="flex space-x-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Globe },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('theme', value)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                            settings.theme === value
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language & Region */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Globe className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Language & Region</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Account Security</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Keep your account secure by regularly updating your password and enabling two-factor authentication.
                    </p>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Change Password
                      </button>
                      <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Data & Privacy</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Manage how your data is used and control your privacy settings.
                    </p>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Download My Data
                      </button>
                      <button className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                        Delete Account
                      </button>
                    </div>
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

export default Settings;