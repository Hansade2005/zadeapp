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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-clay-200/60 z-50 w-full overflow-hidden shadow-[0_-4px_20px_-4px_rgba(120,53,15,0.1)]">
      <div className="motif-band h-0.5 w-full" />
      <div className="flex items-center justify-around py-1.5 sm:py-2 min-w-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex flex-col items-center py-1.5 sm:py-2 px-2 sm:px-3 min-w-0 flex-1 max-w-none"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-clay-500 to-marigold-400" />
              )}
              <div className="relative flex-shrink-0">
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                    isActive ? 'text-clay-600 scale-110' : 'text-stone-500 group-active:scale-90'
                  }`}
                />
                {isActive && (
                  <div
                    className="absolute -inset-2 sm:-inset-2.5 bg-gradient-to-br from-clay-100 to-marigold-100/60 rounded-2xl -z-10"
                  />
                )}
              </div>
              <span
                className={`text-xs mt-0.5 sm:mt-1 text-center leading-tight transition-colors ${
                  isActive ? 'text-clay-700 font-bold' : 'text-stone-500 font-medium'
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
