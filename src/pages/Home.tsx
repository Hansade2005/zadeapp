import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Briefcase, Calendar, Users, Star, TrendingUp, Smartphone, Shirt, Utensils, Home as HomeIcon, Sparkles, Trophy } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
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
    const product = featuredProducts.find(p => p.id === productId);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Canada's Premier
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Multi-Marketplace
                  </span>
                </h1>
                <p className="text-xl mb-8 text-gray-200">
                  Shop, work, connect, and grow with millions across Canada and beyond. 
                  Your one-stop platform for everything you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/marketplace"
                    className="bg-white text-indigo-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Start Shopping
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-indigo-900 transition-colors flex items-center justify-center"
                  >
                    Find Jobs
                  </Link>
                </div>
              </div>
              <div
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                  alt="Canadian marketplace"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}

                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                    <stat.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover thousands of products from trusted Canadian vendors across all categories
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <div
                  key={category.name}

                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    <category.icon className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} items</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                <p className="text-gray-600">Handpicked items from our top-rated vendors</p>
              </div>
              <Link
                to="/marketplace"
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                View All
                <ArrowRight className="ml-1 w-4 h-4" />
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
          <section className="py-16 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-8 h-8 text-yellow-600 mr-3" />
                    Boosted Products
                  </h2>
                  <p className="text-gray-600">Premium listings with enhanced visibility</p>
                </div>
                <Link
                  to="/marketplace"
                  className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                >
                  View All
                  <ArrowRight className="ml-1 w-4 h-4" />
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
                      className="relative"
                    >
                      {/* Boost Badge */}
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
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
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">More Than Just Shopping</h2>
              <p className="text-indigo-100 max-w-2xl mx-auto">
                ZadeApp connects you to opportunities, events, and services across Canada
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div

                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Find Your Dream Job</h3>
                <p className="text-indigo-100 mb-6">
                  Browse thousands of job opportunities from top Canadian companies
                </p>
                <Link
                  to="/jobs"
                  className="inline-flex items-center text-white hover:text-indigo-200 font-medium"
                >
                  Explore Jobs
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>

              <div

                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Discover Events</h3>
                <p className="text-indigo-100 mb-6">
                  Join exciting events, conferences, and networking opportunities
                </p>
                <Link
                  to="/events"
                  className="inline-flex items-center text-white hover:text-indigo-200 font-medium"
                >
                  Browse Events
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>

              <div

                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Hire Freelancers</h3>
                <p className="text-indigo-100 mb-6">
                  Connect with skilled professionals for your projects and business needs
                </p>
                <Link
                  to="/freelance"
                  className="inline-flex items-center text-white hover:text-indigo-200 font-medium"
                >
                  Find Talent
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
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
      />
    </div>
  );
};

export default Home;