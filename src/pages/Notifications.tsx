import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCheck, X, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    entity_type?: string;
    entity_id?: string;
  };
}

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, filter, typeFilter]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply read status filter
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      let filteredData = data || [];

      // Apply type filter
      if (typeFilter !== 'all') {
        filteredData = filteredData.filter(n => n.type === typeFilter);
      }

      setNotifications(filteredData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) {
        console.error('Error deleting read notifications:', error);
        return;
      }

      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on entity type from metadata
    if (notification.metadata?.entity_type && notification.metadata?.entity_id) {
      switch (notification.metadata.entity_type) {
        case 'product':
          navigate(`/marketplace`);
          break;
        case 'job':
          navigate(`/jobs`);
          break;
        case 'event':
          navigate(`/events`);
          break;
        case 'message':
          navigate(`/messages`);
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'order':
        return '🛍️';
      case 'job_application':
        return '📋';
      case 'review':
        return '⭐';
      case 'event':
        return '🎉';
      case 'system':
        return '🔔';
      default:
        return '📬';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const uniqueTypes = ['all', ...Array.from(new Set(notifications.map(n => n.type)))];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please login to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-600 mt-1">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark all read
                    </button>
                  )}
                  {notifications.some(n => n.is_read) && (
                    <button
                      onClick={deleteAllRead}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear read
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === 'all'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === 'unread'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === 'read'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Read ({notifications.filter(n => n.is_read).length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notification List */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No notifications found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {filter === 'unread' ? 'You have no unread notifications' :
                     filter === 'read' ? 'You have no read notifications' :
                     'You haven\'t received any notifications yet'}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.is_read && (
                              <span className="h-3 w-3 bg-indigo-600 rounded-full"></span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}