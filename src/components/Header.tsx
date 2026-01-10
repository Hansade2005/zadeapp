import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  onCartClick?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onCartClick,
  onProfileClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlistCount();
    }
    loadCartCount();
    
    // Listen for cart changes
    const handleStorageChange = () => loadCartCount();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const fetchWishlistCount = async () => {
    if (!user) return;

    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (!error && count !== null) {
      setWishlistCount(count);
    }
  };

  const loadCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartItemCount(totalItems);
  };

  const navItems = [
    { name: 'Shop', path: '/shop' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Events', path: '/events' },
    { name: 'Freelance', path: '/freelance' },
    { name: 'Artists', path: '/artistes' },

  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="ZadeApp Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, jobs, events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <NotificationBell />

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-700 hover:text-red-500 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            {onCartClick ? (
              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                to="/marketplace"
                className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth/Profile */}
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;