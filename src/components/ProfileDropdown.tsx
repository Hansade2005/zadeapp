import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, UserCheck, Briefcase, Calendar, Users, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  const menuItems = [
    {
      label: 'My Profile',
      href: '/profile',
      icon: User,
    },
    {
      label: 'My Products',
      href: '/my-products',
      icon: Briefcase,
    },
    {
      label: 'My Jobs',
      href: '/my-jobs',
      icon: UserCheck,
    },
    {
      label: 'My Events',
      href: '/my-events',
      icon: Calendar,
    },
    {
      label: 'My Inbox',
      href: '/messages',
      icon: MessageCircle,
    },
    {  label: 'Freelance Profile',
      href: '/freelance-profile',
      icon: Users,

    },
    {
      label: 'Artist Profile',
      href: '/artiste-profile',
      icon: Users,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-700 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50"
      >
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="hidden md:block text-sm font-medium">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;