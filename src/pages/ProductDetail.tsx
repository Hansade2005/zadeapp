import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  MapPin,
  Package,
  Star,
  TrendingUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { ReviewList } from '../components/ReviewList';
import { ReviewForm } from '../components/ReviewForm';
import { ContactSellerModal } from '../components/ContactSellerModal';
import CartDrawer from '../components/CartDrawer';

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  tags: string[];
  location: string;
  is_active: boolean;
  discount_percentage: number;
  stock_quantity: number;
  created_at: string;
  seller?: {
    full_name: string;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      checkWishlistStatus();
    }
  }, [id]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch product with seller details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          seller:users!products_seller_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (productError) throw productError;

      setProduct(productData);

      // Fetch related products
      if (productData) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', productData.category)
          .eq('is_active', true)
          .neq('id', id)
          .limit(4);

        setRelatedProducts(relatedData || []);

        // Fetch review data
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('entity_type', 'product')
          .eq('entity_id', id);

        if (!reviewError && reviewData) {
          const totalReviews = reviewData.length;
          const average = totalReviews > 0 
            ? reviewData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
            : 0;
          
          setReviewCount(totalReviews);
          setAverageRating(average);
        }
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('entity_type', 'product')
        .eq('entity_id', id)
        .single();

      setIsWishlisted(!!data);
    } catch (error) {
      // Not in wishlist
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      if (isWishlisted) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', 'product')
          .eq('entity_id', id);

        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await supabase.from('wishlists').insert({
          user_id: user.id,
          entity_type: 'product',
          entity_id: id,
        });

        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const addToCart = () => {
    if (!product) return;

    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.images[0],
        quantity: quantity,
        seller_id: product.seller_id,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`Added ${quantity} item(s) to cart`);

    // Trigger storage event for cart update
    window.dispatchEvent(new Event('storage'));
  };

  const shareProduct = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User canceled share
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const nextImage = () => {
    if (product && currentImageIndex < product.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const discountedPrice = product?.discount_percentage
    ? product.price * (1 - product.discount_percentage / 100)
    : product?.price;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-indigo-600">
              Marketplace
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div>
              <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
                <img
                  src={product.images[currentImageIndex] || '/placeholder.png'}
                  alt={product.title}
                  className="w-full h-96 object-contain"
                />

                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-100"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === product.images.length - 1}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-100"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {product.discount_percentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                    {product.discount_percentage}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`border-2 rounded-lg overflow-hidden ${
                        currentImageIndex === index ? 'border-indigo-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={shareProduct}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={toggleWishlist}
                      className={`p-2 border rounded-lg ${
                        isWishlisted
                          ? 'bg-red-50 border-red-300 text-red-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

                <div className="flex items-center gap-4 mb-6">
                  {product.discount_percentage > 0 && (
                    <span className="text-2xl text-gray-400 line-through">
                      ${product.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-indigo-600">
                    ${discountedPrice?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{product.location}</span>
                  </div>
                  {product.stock_quantity !== null && (
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{product.stock_quantity} in stock</span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-gray-900 mb-2">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h2 className="font-semibold text-gray-900 mb-2">Quantity</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={addToCart}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                  <Link
                    to="/checkout"
                    onClick={addToCart}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                  >
                    Buy Now
                  </Link>
                </div>

                {/* Seller Info */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="font-semibold text-gray-900 mb-3">Seller Information</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.seller?.full_name}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
              <ReviewList 
                entityId={product.id} 
                entityType="product" 
                averageRating={averageRating}
                reviewCount={reviewCount}
              />
              {user && (
                <div className="mt-6">
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <ReviewForm 
                      entityId={product.id} 
                      entityType="product" 
                      entityName={product.title}
                      onClose={() => setShowReviewForm(false)}
                      onReviewSubmitted={() => {
                        setShowReviewForm(false);
                        fetchProduct(); // Refresh reviews
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img
                      src={relatedProduct.images[0] || '/placeholder.png'}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.title}</h3>
                      <p className="text-lg font-bold text-indigo-600">${relatedProduct.price.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
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
        }}
        onRemoveItem={(id) => {
          const newCart = cartItems.filter(item => item.id !== id);
          setCartItems(newCart);
          localStorage.setItem('cart', JSON.stringify(newCart));
        }}
      />

      {/* Contact Seller Modal */}
      {showContactModal && product && (
        <ContactSellerModal
          sellerId={product.seller_id}
          sellerName={product.seller?.full_name || 'Seller'}
          productTitle={product.title}
          productId={product.id}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
