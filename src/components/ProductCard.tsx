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
      className="bg-card rounded-2xl shadow-sm ring-1 ring-stone-200/70 overflow-hidden group hover:shadow-xl hover:-translate-y-1 hover:ring-clay-200 transition-all duration-300"
    >
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer bg-stone-100"
        onClick={() => navigate(`/product/${id}`)}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-clay-600 text-white text-xs font-display font-bold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wide">
            -{discount}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'text-clay-600 fill-current' : 'text-stone-600'
            }`}
          />
        </button>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(id);
            }}
            className="w-full bg-clay-600 text-white py-2 rounded-xl flex items-center justify-center space-x-2 hover:bg-clay-700 transition-colors shadow-md"
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
        <p className="text-xs font-semibold uppercase tracking-widest text-clay-600 mb-1.5">{vendor}</p>

        {/* Product Name */}
        <h3 className="font-display font-semibold text-stone-900 mb-2 line-clamp-2 leading-tight group-hover:text-clay-700 transition-colors">
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
                    ? 'text-marigold-400 fill-current'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-stone-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-display font-bold text-stone-900">
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-stone-400 line-through">
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Always visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart?.(id);
          }}
          className="w-full bg-clay-600 text-white py-2.5 rounded-xl flex items-center justify-center space-x-2 font-medium hover:bg-clay-700 active:scale-[0.98] transition-all shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-medium">Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;