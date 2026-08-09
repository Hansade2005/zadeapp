import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Briefcase, Calendar, Users, Star, TrendingUp, Smartphone, Shirt, Utensils, Home as HomeIcon, Sparkles, Trophy } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../i18n';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [boostedProducts, setBoostedProducts] = useState<any[]>([]);
  const [loadingBoosted, setLoadingBoosted] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchBoostedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(4);

      if (error) {
        console.error('Error fetching featured products:', error);
        return;
      }

      if (data) {
        const mappedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.title,
          price: product.price,
          originalPrice: product.original_price,
          image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          rating: 0, // Will be calculated from reviews when review system is implemented
          reviewCount: 0, // Will be counted from reviews when review system is implemented
          vendor: 'Featured Vendor', // Could be enhanced to fetch seller info
          sellerId: product.seller_id
        }));
        setFeaturedProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchBoostedProducts = async () => {
    try {
      // Get products that are currently boosted (have active boost_purchases)
      const { data: boostData, error: boostError } = await supabase
        .from('boost_purchases')
        .select('entity_id')
        .eq('entity_type', 'product')
        .gte('boost_end_date', new Date().toISOString())
        .limit(8);

      if (boostError) {
        console.error('Error fetching boost data:', boostError);
        return;
      }

      if (boostData && boostData.length > 0) {
        const boostedProductIds = boostData.map(boost => boost.entity_id);

        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', boostedProductIds)
          .eq('is_active', true);

        if (productsError) {
          console.error('Error fetching boosted products:', productsError);
          return;
        }

        if (productsData) {
          const mappedProducts = productsData.map((product: any) => ({
            id: product.id,
            name: product.title,
            price: product.price,
            originalPrice: product.original_price,
            image: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
            rating: 0,
            reviewCount: 0,
            vendor: 'Boosted Vendor',
            sellerId: product.seller_id
          }));
          setBoostedProducts(mappedProducts);
        }
      }
    } catch (error) {
      console.error('Error fetching boosted products:', error);
    } finally {
      setLoadingBoosted(false);
    }
  };

  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetchCategoriesAndStats();
  }, []);

  const fetchCategoriesAndStats = async () => {
    try {
      // Fetch category counts
      const { data: products } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);

      const categoryCounts: Record<string, number> = {};
      products?.forEach(p => {
        if (p.category) {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        }
      });

      setCategories([
        { name: 'Electronics', icon: Smartphone, count: (categoryCounts['Electronics'] || 0).toLocaleString() },
        { name: 'Fashion', icon: Shirt, count: (categoryCounts['Fashion'] || 0).toLocaleString() },
        { name: 'Food & Drinks', icon: Utensils, count: (categoryCounts['Food & Drinks'] || 0).toLocaleString() },
        { name: 'Home & Garden', icon: HomeIcon, count: (categoryCounts['Home & Garden'] || 0).toLocaleString() },
        { name: 'Beauty', icon: Sparkles, count: (categoryCounts['Beauty'] || 0).toLocaleString() },
        { name: 'Sports', icon: Trophy, count: (categoryCounts['Sports'] || 0).toLocaleString() }
      ]);

      // Fetch real stats
      const [usersCount, productsCount, jobsCount, eventsCount] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      setStats([
        { label: 'Active Users', value: (usersCount.count || 0).toLocaleString(), icon: Users },
        { label: 'Products Listed', value: (productsCount.count || 0).toLocaleString(), icon: ShoppingBag },
        { label: 'Jobs Posted', value: (jobsCount.count || 0).toLocaleString(), icon: Briefcase },
        { label: 'Events Hosted', value: (eventsCount.count || 0).toLocaleString(), icon: Calendar }
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddToCart = (productId: string) => {
    // Search in both featured and boosted products
    const product = featuredProducts.find(p => p.id === productId) ||
                    boostedProducts.find(p => p.id === productId);
    if (product) {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === productId);
        let newCart;
        if (existing) {
          newCart = prev.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newCart = [...prev, {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            vendor: product.vendor,
            productId: product.id,
            sellerId: product.sellerId || ''
          }];
        }
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    let newCart;
    if (quantity === 0) {
      newCart = cartItems.filter(item => item.id !== id);
    } else {
      newCart = cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
    }
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleRemoveItem = (id: string) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-stone-950 text-white">
          <div className="absolute inset-0 bg-gradient-mesh opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-clay-950/80 to-stone-950"></div>
          {/* Decorative floating shapes */}
          <div className="pointer-events-none absolute -top-24 -right-16 w-96 h-96 rounded-full bg-clay-500/30 blur-3xl"></div>
          <div className="pointer-events-none absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-marigold-500/20 blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <span
                  className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-marigold-200 text-sm font-medium mb-8"
                  style={{ animationDelay: '0ms' }}
                >
                  <Sparkles className="w-4 h-4" />
                  Zaideapp — on good business
                </span>
                <h1
                  className="animate-slide-up font-display text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6"
                  style={{ animationDelay: '80ms' }}
                >
                  {t.home.heroTitle}
                  <span className="block font-serif italic font-normal text-marigold-300 mt-3 text-4xl md:text-6xl">
                    built for everyone.
                  </span>
                </h1>
                <p
                  className="animate-slide-up text-lg md:text-xl mb-10 text-stone-200/90 max-w-xl leading-relaxed"
                  style={{ animationDelay: '160ms' }}
                >
                  {t.home.heroSubtitle}
                </p>
                <div
                  className="animate-slide-up flex flex-col sm:flex-row gap-4"
                  style={{ animationDelay: '240ms' }}
                >
                  <Link
                    to="/marketplace"
                    className="group bg-clay-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-clay-900/40 hover:bg-clay-400 hover:-translate-y-0.5 transition-all flex items-center justify-center"
                  >
                    {t.home.exploreMarketplace}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-stone-900 transition-colors flex items-center justify-center"
                  >
                    {t.home.findJobs}
                  </Link>
                </div>
              </div>
              <div
                className="lg:col-span-5 relative animate-scale-in"
                style={{ animationDelay: '320ms' }}
              >
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-clay-500/40 to-marigold-400/40 blur-2xl"></div>
                <img
                  src="/flyer.jpg"
                  onError={(e) => {
                    // Fall back to a stock photo until public/flyer.jpg is uploaded
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600';
                  }}
                  alt="Zaideapp — buy, sell, get business info"
                  className="relative rounded-[2rem] shadow-2xl ring-1 ring-white/10 rotate-2 hover:rotate-0 transition-transform duration-500 bg-white"
                />
                <div className="absolute -bottom-6 -left-6 bg-background text-stone-900 rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 rotate-[-3deg]">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                  </div>
                  <div>
                    <div className="font-display font-bold leading-none">Trusted vendors</div>
                    <div className="text-xs text-stone-500">around the world</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* curved divider */}
          <div className="motif-band h-3 w-full"></div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="animate-slide-up text-center bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-6"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-clay-100 rounded-2xl mb-4">
                    <stat.icon className="w-7 h-7 text-clay-600" />
                  </div>
                  <div className="font-display text-4xl font-extrabold text-stone-900 mb-1">{stat.value}</div>
                  <div className="text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <p className="font-serif italic text-clay-600 text-lg mb-2">A whole continent of choice</p>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-stone-900 mb-4">Shop by Category</h2>
              <p className="text-stone-600">
                Discover thousands of products from trusted Canadian vendors across all categories
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  className="animate-scale-in bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="mb-4 inline-flex p-3 rounded-xl bg-marigold-100 group-hover:bg-clay-100 transition-colors">
                    <category.icon className="w-8 h-8 text-clay-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-display font-bold text-stone-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-stone-500">{category.count} items</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div>
                <p className="font-serif italic text-clay-600 text-lg mb-2">Hand-picked for you</p>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold text-stone-900 mb-3">{t.home.featuredProducts}</h2>
                <p className="text-stone-600 max-w-lg">{t.home.heroSubtitle}</p>
              </div>
              <Link
                to="/marketplace"
                className="group text-clay-600 hover:text-clay-700 font-semibold flex items-center"
              >
                {t.home.viewAll}
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingProducts ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                featuredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ProductCard
                      {...product}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Boosted Products */}
        {boostedProducts.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-marigold-50 via-background to-clay-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
                <div>
                  <h2 className="font-display text-4xl md:text-5xl font-extrabold text-stone-900 mb-3 flex items-center">
                    <span className="inline-flex p-2.5 rounded-xl bg-marigold-200 mr-4">
                      <TrendingUp className="w-7 h-7 text-clay-600" />
                    </span>
                    Boosted Products
                  </h2>
                  <p className="text-stone-600">Premium listings with enhanced visibility</p>
                </div>
                <Link
                  to="/marketplace"
                  className="group text-clay-600 hover:text-clay-700 font-semibold flex items-center"
                >
                  {t.home.viewAll}
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingBoosted ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="aspect-square bg-gray-200 animate-pulse"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  boostedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="relative animate-slide-up"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      {/* Boost Badge */}
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-marigold-400 to-clay-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        ⭐ BOOSTED
                      </div>
                      <ProductCard
                        {...product}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* Services Overview */}
        <section className="py-24 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <p className="font-serif italic text-clay-600 text-lg mb-2">Beyond the marketplace</p>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-stone-900 mb-4">More Than Just Shopping</h2>
              <p className="text-stone-600">
                ZadeApp connects you to opportunities, events, and services across the continent
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/jobs"
                className="animate-slide-up group relative overflow-hidden rounded-3xl bg-stone-900 text-white p-8 min-h-[18rem] flex flex-col justify-between hover:-translate-y-1 transition-transform"
                style={{ animationDelay: '0ms' }}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-clay-500/30 blur-2xl group-hover:bg-clay-500/50 transition-colors"></div>
                <div className="relative w-14 h-14 bg-clay-500 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="relative">
                  <h3 className="font-display text-2xl font-bold mb-3">Find Your Dream Job</h3>
                  <p className="text-stone-300 mb-5">
                    Browse thousands of job opportunities from top companies
                  </p>
                  <span className="inline-flex items-center text-marigold-300 font-semibold">
                    Explore Jobs
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link
                to="/events"
                className="animate-slide-up group relative overflow-hidden rounded-3xl bg-emerald-700 text-white p-8 min-h-[18rem] flex flex-col justify-between hover:-translate-y-1 transition-transform"
                style={{ animationDelay: '120ms' }}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-400/30 blur-2xl group-hover:bg-emerald-400/50 transition-colors"></div>
                <div className="relative w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-7 h-7" />
                </div>
                <div className="relative">
                  <h3 className="font-display text-2xl font-bold mb-3">Discover Events</h3>
                  <p className="text-emerald-50/90 mb-5">
                    Join exciting events, conferences, and networking opportunities
                  </p>
                  <span className="inline-flex items-center text-marigold-200 font-semibold">
                    Browse Events
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>

              <Link
                to="/freelance"
                className="animate-slide-up group relative overflow-hidden rounded-3xl bg-marigold-500 text-stone-900 p-8 min-h-[18rem] flex flex-col justify-between hover:-translate-y-1 transition-transform"
                style={{ animationDelay: '240ms' }}
              >
                <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/30 blur-2xl group-hover:bg-white/50 transition-colors"></div>
                <div className="relative w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
                  <Users className="w-7 h-7" />
                </div>
                <div className="relative">
                  <h3 className="font-display text-2xl font-bold mb-3">Hire Freelancers</h3>
                  <p className="text-stone-800 mb-5">
                    Connect with skilled professionals for your projects and business needs
                  </p>
                  <span className="inline-flex items-center text-clay-700 font-semibold">
                    Find Talent
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA Band */}
        <section className="relative overflow-hidden bg-stone-950 text-white">
          <div className="absolute inset-0 bg-gradient-mesh opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-clay-950/70 via-stone-950 to-emerald-950/60"></div>
          <div className="pointer-events-none absolute -top-24 left-1/3 w-96 h-96 rounded-full bg-clay-500/30 blur-3xl"></div>
          <div className="motif-band h-3 w-full"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="animate-fade-in font-serif italic text-marigold-300 text-lg mb-4">Your continent. Your marketplace.</p>
            <h2 className="animate-slide-up font-display text-4xl md:text-6xl font-extrabold leading-[0.95] tracking-tight mb-6" style={{ animationDelay: '80ms' }}>
              Ready to start
              <span className="block gradient-text font-serif italic font-normal mt-2">your Zade journey?</span>
            </h2>
            <p className="animate-slide-up text-lg text-stone-200/90 max-w-2xl mx-auto mb-10" style={{ animationDelay: '160ms' }}>
              {t.home.heroSubtitle}
            </p>
            <div className="animate-slide-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '240ms' }}>
              <Link
                to="/marketplace"
                className="group bg-clay-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-clay-900/40 hover:bg-clay-400 hover:-translate-y-0.5 transition-all flex items-center justify-center"
              >
                {t.home.exploreMarketplace}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/jobs"
                className="border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-stone-900 transition-colors flex items-center justify-center"
              >
                {t.home.findJobs}
              </Link>
            </div>
          </div>
          <div className="motif-band h-3 w-full"></div>
        </section>

      </main>

      <Footer />
      <MobileBottomNav />
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
};

export default Home;
