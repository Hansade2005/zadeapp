import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Briefcase, Calendar, Users } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/marketplace', icon: ShoppingBag },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Freelance', path: '/freelance', icon: Users }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className="relative flex flex-col items-center py-2 px-3 min-w-0 flex-1"
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`} 
                />
                {isActive && (
                  <div
                    className="absolute -inset-2 bg-indigo-100 rounded-lg -z-10"
                  />
                )}
              </div>
              <span 
                className={`text-xs mt-1 ${
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