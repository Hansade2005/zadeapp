import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, UserCheck, Briefcase, Calendar, Users, MessageCircle, Package, FileText, Ticket, Music, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
    navigate('/login');
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
      label: 'My Orders',
      href: '/my-orders',
      icon: Package,
    },
    {
      label: 'Seller Wallet',
      href: '/seller-wallet',
      icon: Wallet,
    },
    {
      label: 'My Jobs',
      href: '/my-jobs',
      icon: UserCheck,
    },
    {
      label: 'My Applications',
      href: '/my-applications',
      icon: FileText,
    },
    {
      label: 'My Events',
      href: '/my-events',
      icon: Calendar,
    },
    {
      label: 'My Registrations',
      href: '/my-registrations',
      icon: Ticket,
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
      label: 'My Event Applications',
      href: '/my-artiste-applications',
      icon: Music,
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
        className="flex items-center space-x-2 p-1.5 pr-2.5 text-stone-700 hover:text-clay-700 transition-all duration-200 rounded-2xl hover:bg-clay-50 ring-1 ring-transparent hover:ring-clay-200/60"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-clay-500 to-marigold-400 rounded-full flex items-center justify-center shadow-sm shadow-clay-500/30">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="hidden md:block text-sm font-semibold">
          {user.user_metadata?.full_name || user.email?.split('@')[0]}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-background rounded-2xl shadow-lg shadow-clay-900/10 border border-clay-200/60 py-2 z-50 overflow-hidden animate-slide-up">
          <div className="motif-band h-1 w-full -mt-2 mb-2" />
          {/* User Info */}
          <div className="px-4 py-3 border-b border-clay-100/80">
            <p className="text-sm font-bold text-stone-900 font-display">
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-stone-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1 max-h-[60vh] overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center mx-1.5 px-3 py-2 rounded-xl text-sm text-stone-700 hover:bg-clay-50 hover:text-clay-700 transition-colors"
              >
                <item.icon className="w-4 h-4 mr-3 text-stone-400 group-hover:text-clay-500 transition-colors" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-clay-100/80 pt-1 mt-1">
            <button
              onClick={handleSignOut}
              className="group flex items-center w-full mx-1.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              style={{ width: 'calc(100% - 0.75rem)' }}
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