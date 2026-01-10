import React from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  vendor: string;
  isWishlisted?: boolean;
  onAddToCart?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  vendor,
  isWishlisted = false,
  onAddToCart,
  onToggleWishlist
}) => {
  const navigate = useNavigate();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image Container */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(id);
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${
              isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'
            }`} 
          />
        </button>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(id);
            }}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => navigate(`/product/${id}`)}
      >
        {/* Vendor */}
        <p className="text-xs text-gray-500 mb-1">{vendor}</p>

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;