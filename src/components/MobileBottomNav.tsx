import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Briefcase, Calendar, Users } from 'lucide-react';
import { useLanguage } from '../i18n';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { name: t.nav.home, path: '/', icon: Home },
    { name: t.nav.marketplace, path: '/marketplace', icon: ShoppingBag },
    { name: t.nav.jobs, path: '/jobs', icon: Briefcase },
    { name: t.nav.events, path: '/events', icon: Calendar },
    { name: t.nav.freelancers, path: '/freelance', icon: Users }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 w-full overflow-hidden">
      <div className="flex items-center justify-around py-1.5 sm:py-2 min-w-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center py-1.5 sm:py-2 px-2 sm:px-3 min-w-0 flex-1 max-w-none"
            >
              <div className="relative flex-shrink-0">
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                />
                {isActive && (
                  <div
                    className="absolute -inset-1.5 sm:-inset-2 bg-indigo-100 rounded-lg -z-10"
                  />
                )}
              </div>
              <span
                className={`text-xs mt-0.5 sm:mt-1 text-center leading-tight ${
                  isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
