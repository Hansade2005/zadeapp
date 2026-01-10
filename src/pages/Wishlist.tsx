import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Package, Briefcase, Calendar, Music, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

interface WishlistItem {
  id: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  item?: any;
}

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all wishlist entries
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (wishlistError) throw wishlistError;

      // Fetch full details for each item
      const itemsWithDetails = await Promise.all(
        (wishlistData || []).map(async (item) => {
          let itemDetails = null;
          let table = '';

          switch (item.entity_type) {
            case 'product':
              table = 'products';
              break;
            case 'job':
              table = 'jobs';
              break;
            case 'event':
              table = 'events';
              break;
            case 'artiste':
              table = 'artiste_profiles';
              break;
            case 'freelancer':
              table = 'freelancer_profiles';
              break;
          }

          if (table) {
            const { data } = await supabase
              .from(table)
              .select('*')
              .eq('id', item.entity_id)
              .single();

            itemDetails = data;
          }

          return {
            ...item,
            item: itemDetails,
          };
        })
      );

      setWishlistItems(itemsWithDetails.filter((item) => item.item !== null));
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const { error } = await supabase.from('wishlists').delete().eq('id', wishlistId);

      if (error) throw error;

      toast.success('Removed from wishlist');
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="h-5 w-5" />;
      case 'job':
        return <Briefcase className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'artiste':
        return <Music className="h-5 w-5" />;
      case 'freelancer':
        return <Users className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getItemLink = (type: string, id: string) => {
    switch (type) {
      case 'product':
        return `/product/${id}`;
      case 'job':
        return `/jobs#${id}`;
      case 'event':
        return `/events#${id}`;
      case 'artiste':
        return `/artistes#${id}`;
      case 'freelancer':
        return `/freelance#${id}`;
      default:
        return '/marketplace';
    }
  };

  const filteredItems =
    filter === 'all' ? wishlistItems : wishlistItems.filter((item) => item.entity_type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>
            <p className="text-gray-600">Items you've saved for later</p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Items', icon: Heart },
              { id: 'product', label: 'Products', icon: Package },
              { id: 'job', label: 'Jobs', icon: Briefcase },
              { id: 'event', label: 'Events', icon: Calendar },
              { id: 'artiste', label: 'Artistes', icon: Music },
              { id: 'freelancer', label: 'Freelancers', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 ${
                    filter === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="text-xs opacity-75">
                    ({wishlistItems.filter((i) => tab.id === 'all' || i.entity_type === tab.id).length})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Wishlist Items */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">
                Start adding items you love by clicking the heart icon
              </p>
              <Link
                to="/marketplace"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((wishlistItem) => {
                const item = wishlistItem.item;
                const type = wishlistItem.entity_type;

                return (
                  <div
                    key={wishlistItem.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {(item?.images?.[0] || item?.image_url) && (
                        <img
                          src={item.images?.[0] || item.image_url}
                          alt={item.title || item.name || item.event_name || item.full_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-white bg-opacity-90 rounded-full text-xs font-medium flex items-center gap-1 capitalize">
                          {getItemIcon(type)}
                          {type}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromWishlist(wishlistItem.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {item?.title || item?.job_title || item?.event_name || item?.full_name || item?.stage_name}
                      </h3>

                      {item?.price && (
                        <p className="text-lg font-bold text-indigo-600 mb-3">
                          ${item.price.toLocaleString()}
                        </p>
                      )}

                      {item?.salary_min && item?.salary_max && (
                        <p className="text-sm text-gray-600 mb-3">
                          ${item.salary_min.toLocaleString()} - ${item.salary_max.toLocaleString()}
                        </p>
                      )}

                      {item?.category && (
                        <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                      )}

                      <div className="flex gap-2">
                        <Link
                          to={getItemLink(type, item.id)}
                          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => removeFromWishlist(wishlistItem.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {filteredItems.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total Items in Wishlist</p>
                  <p className="text-3xl font-bold text-gray-900">{wishlistItems.length}</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/marketplace"
                    className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Wishlist;
