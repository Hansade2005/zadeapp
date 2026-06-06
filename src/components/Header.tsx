import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ProfileDropdown from './ProfileDropdown';
import { NotificationBell } from './NotificationBell';
import { useLanguage } from '../i18n';

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
  const { t } = useLanguage();

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
    { name: t.nav.marketplace, path: '/shop' },
    { name: t.nav.jobs, path: '/jobs' },
    { name: t.nav.events, path: '/events' },
    { name: t.nav.freelancers, path: '/freelance' },
    { name: t.nav.artistes, path: '/artistes' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-clay-200/60 w-full shadow-md shadow-clay-900/5">
      <div className="motif-band h-1 w-full" />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo */}
          <Link to="/" className="group flex items-center flex-shrink-0 gap-2.5">
            <span className="relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-clay-500/10 to-marigold-400/10 p-1.5 ring-1 ring-clay-200/50 transition-all duration-300 group-hover:ring-clay-400/60 group-hover:shadow-md group-hover:shadow-clay-500/20">
              <img
                src="/logo.svg"
                alt="ZadeApp Logo"
                className="h-8 sm:h-9 w-auto transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
            </span>
            <span className="hidden sm:inline-flex flex-col leading-none">
              <span className="font-display font-extrabold text-xl tracking-tight gradient-text">
                Zade
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Marketplace
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="group relative px-3 py-2 text-stone-600 hover:text-clay-700 font-semibold transition-colors duration-200 whitespace-nowrap text-sm rounded-lg hover:bg-clay-50"
              >
                {item.name}
                <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-clay-500 to-marigold-400 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm xl:max-w-md mx-6 xl:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t.common.search + '...'}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100/70 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-clay-500/25 focus:border-clay-500 focus:bg-white text-sm transition-all duration-200 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-clay-700 hover:bg-clay-50 rounded-xl transition-colors"
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
                className="relative p-2 text-stone-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            {onCartClick ? (
              <button
                onClick={onCartClick}
                className="relative p-2 text-stone-600 hover:text-clay-700 hover:bg-clay-50 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-clay-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
            ) : (
              <Link
                to="/marketplace"
                className="relative p-2 text-stone-600 hover:text-clay-700 hover:bg-clay-50 rounded-xl transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-clay-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm">
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
                className="px-4 py-2 bg-gradient-to-r from-clay-600 to-clay-500 text-white rounded-2xl hover:from-clay-700 hover:to-clay-600 transition-all duration-200 text-sm font-semibold whitespace-nowrap shadow-md shadow-clay-500/25 hover:shadow-lg hover:-translate-y-0.5"
              >
                {t.nav.signIn}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-clay-700 hover:bg-clay-50 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Collapsible */}
        {isMobileSearchOpen && (
          <div className="lg:hidden pb-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t.common.search + '...'}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100/70 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-clay-500/25 focus:border-clay-500 focus:bg-white text-sm transition-all duration-200 placeholder:text-stone-400"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-background/95 border-t border-clay-200/60 animate-slide-up">
            <nav className="px-2 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-4 py-2.5 text-stone-700 hover:text-clay-700 hover:bg-clay-50 font-semibold transition-colors rounded-xl text-sm"
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
