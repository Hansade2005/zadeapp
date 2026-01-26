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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/logo.svg"
              alt="ZadeApp Logo"
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200 whitespace-nowrap text-sm"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm xl:max-w-md mx-6 xl:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, jobs, events..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            {onCartClick ? (
              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                to="/marketplace"
                className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
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
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all duration-200 text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Collapsible */}
        {isMobileSearchOpen && (
          <div className="lg:hidden pb-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, jobs, events..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white text-sm transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-slide-up">
            <nav className="px-2 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-4 py-2.5 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-colors rounded-xl text-sm"
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
