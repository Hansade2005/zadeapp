import React, { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { nigerianCities } from '../lib/locationUtils';

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilters) => void;
  categories?: string[];
  showLocationFilter?: boolean;
}

export interface ProductFilters {
  searchQuery: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  city: string;
  state: string;
  radiusKm: number;
  userLat?: number;
  userLon?: number;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'boosted' | 'distance';
}

const defaultCategories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Beauty & Health',
  'Books & Media',
  'Toys & Games',
  'Automotive',
  'Food & Beverages',
  'Other',
];

export const ProductFilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  categories = defaultCategories,
  showLocationFilter = true,
}) => {
  const [showFilters, setShowFilters] = useState(false);
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

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newFilters = {
            ...filters,
            userLat: position.coords.latitude,
            userLon: position.coords.longitude,
            sortBy: 'distance' as const,
          };
          setFilters(newFilters);
          onFilterChange(newFilters);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const clearFilters = () => {
    const defaultFilters: ProductFilters = {
      searchQuery: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      state: '',
      radiusKm: 50,
      sortBy: 'newest',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.category ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.city ||
    filters.state;

  const fieldClasses =
    'w-full px-3.5 py-2.5 bg-background border border-stone-200 rounded-xl text-stone-800 focus:ring-2 focus:ring-clay-500/40 focus:border-clay-400 transition-colors';
  const labelClasses =
    'block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5';

  return (
    <div className="bg-card rounded-2xl shadow-lg shadow-stone-900/5 border border-stone-200/70 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 sm:p-5">
        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-clay-500" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Search products..."
              className="w-full pl-12 pr-4 py-3 bg-background border border-stone-200 rounded-xl text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-clay-500/40 focus:border-clay-400 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 sm:px-5 py-3 rounded-xl border font-semibold transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-clay-500 text-white border-clay-500 shadow-md shadow-clay-500/25'
                : 'bg-card text-stone-700 border-stone-200 hover:border-clay-300 hover:text-clay-600'
            } flex items-center gap-2`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-white text-clay-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                •
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="border-t border-stone-200/70 p-4 sm:p-5 bg-stone-50/60 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className={labelClasses}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className={fieldClasses}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClasses}>
                  Min Price (CAD$)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className={fieldClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>
                  Max Price (CAD$)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Any"
                  className={fieldClasses}
                />
              </div>
            </div>

            {/* Location Filter */}
            {showLocationFilter && (
              <div>
                <label className={labelClasses}>
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => {
                    const city = nigerianCities.find((c) => c.name === e.target.value);
                    handleFilterChange('city', e.target.value);
                    if (city) handleFilterChange('state', city.state);
                  }}
                  className={fieldClasses}
                >
                  <option value="">All Cities</option>
                  {nigerianCities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className={labelClasses}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange('sortBy', e.target.value as ProductFilters['sortBy'])
                }
                className={fieldClasses}
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="boosted">Featured</option>
                {filters.userLat && <option value="distance">Nearest First</option>}
              </select>
            </div>

            {/* Radius Filter (if location enabled) */}
            {showLocationFilter && (
              <div className="col-span-full">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-stone-700">
                    Search Radius: <span className="text-clay-600">{filters.radiusKm}km</span>
                  </label>
                  <button
                    onClick={handleGetLocation}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Use My Location
                  </button>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={filters.radiusKm}
                  onChange={(e) => handleFilterChange('radiusKm', parseInt(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-clay-500"
                />
                <div className="flex justify-between text-xs text-stone-500 mt-1">
                  <span>5km</span>
                  <span>200km</span>
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-stone-200/70">
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-clay-600 hover:text-clay-700 flex items-center gap-1.5 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
