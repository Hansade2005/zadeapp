import React, { useState, useEffect } from 'react';
import { Grid, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { ProductFilterPanel } from '../components/ProductFilterPanel';
import type { ProductFilters } from '../components/ProductFilterPanel';
import { filterByRadius, calculateDistance } from '../lib/locationUtils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
}

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ProductFilters>({
    searchQuery: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    city: '',
    state: '',
    radiusKm: 50,
    sortBy: 'newest',
  });

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

  // Fetch user's wishlisted products
  useEffect(() => {
    if (user) {
      fetchWishlists();
    }
  }, [user]);

  const fetchWishlists = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('entity_id')
        .eq('user_id', user.id)
        .eq('entity_type', 'product');

      if (error) {
        console.error('Error fetching wishlists:', error);
        return;
      }

      setWishlistedProducts(new Set(data.map(w => w.entity_id)));
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select('*, users!products_seller_id_fkey(full_name)')
          .eq('is_active', true);

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Advanced filtering based on all filter criteria
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((product) => product.category === filters.category);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter((product) => product.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((product) => product.price <= parseFloat(filters.maxPrice));
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter((product) => product.city === filters.city);
    }

    // Location radius filter
    if (filters.userLat && filters.userLon) {
      filtered = filterByRadius(filtered, filters.userLat, filters.userLon, filters.radiusKm);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'boosted':
        filtered.sort((a, b) => {
          // Prioritize boosted items
          if (a.is_boosted && !b.is_boosted) return -1;
          if (!a.is_boosted && b.is_boosted) return 1;
          return (b.boost_score || 0) - (a.boost_score || 0);
        });
        break;
      case 'distance':
        // Already sorted by distance if using filterByRadius
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
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
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please login to save to wishlist');
      return;
    }

    try {
      const isWishlisted = wishlistedProducts.has(productId);

      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', 'product')
          .eq('entity_id', productId);

        if (error) throw error;

        setWishlistedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            entity_type: 'product',
            entity_id: productId,
          });

        if (error) throw error;

        setWishlistedProducts(prev => new Set(prev).add(productId));
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.message || 'Failed to update wishlist');
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
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
              <p className="text-xl text-indigo-100">
                Discover amazing products from trusted Canadian vendors
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductFilterPanel onFilterChange={setFilters} showLocationFilter={true} />
          </div>
        </section>

        {/* View Controls */}
        <section className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${filteredProducts.length} products found`}
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your filters</p>
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      city: '',
                      state: '',
                      radiusKm: 50,
                      sortBy: 'newest',
                    })
                  }
                  className="mt-4 text-blue-600 hover:text-blue-700 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <ProductCard
                      id={product.id}
                      name={product.title}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.images?.[0] || 'https://placehold.co/400x400'}
                      rating={product.average_rating || 0}
                      reviewCount={product.review_count || 0}
                      vendor={product.users?.full_name || 'Vendor'}
                      isWishlisted={wishlistedProducts.has(product.id)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                    />
                    {product.is_boosted && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        FEATURED
                      </div>
                    )}
                    {product.distance && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {product.distance.toFixed(1)}km away
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

export default Marketplace;