import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
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
      setUnreadCount(0);
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

      const deletedNotif = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);

    // Navigate based on entity type from metadata
    if (notification.metadata?.entity_type && notification.metadata?.entity_id) {
      switch (notification.metadata.entity_type) {
        case 'product':
          navigate(`/marketplace`); // Could navigate to product detail page
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
      case 'application':
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

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />

          {/* Notification Panel */}
          <div className="absolute top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-[32rem] overflow-hidden flex flex-col
                         w-80 right-0
                         sm:w-96 sm:right-0
                         left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
                         mx-2 sm:mx-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-gray-500">
                              {formatTime(notification.created_at)}
                            </p>
                            {!notification.is_read && (
                              <span className="h-2 w-2 bg-indigo-600 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/notifications');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
