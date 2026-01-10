import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { searchLocation, getCurrentLocation, nigerianCities } from '../lib/locationUtils';

// Import Leaflet CSS via string to avoid TypeScript module resolution issues
// Note: Ensure leaflet.css is properly loaded in your app
const leafletCSS = 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Webpack/Vite
// Using base64 data URIs for marker icons to avoid module resolution issues
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialLat?: number;
  initialLon?: number;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    location_name: string;
    city?: string;
    state?: string;
  }) => void;
  showMap?: boolean;
  className?: string;
}

interface LocationMarkerProps {
  position: LatLng | null;
  onPositionChange: (lat: number, lng: number) => void;
}

// Separate component for map marker to use hooks
function LocationMarker({ position, onPositionChange }: LocationMarkerProps) {
  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLat,
  initialLon,
  onLocationSelect,
  showMap = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [position, setPosition] = useState<LatLng | null>(
    initialLat && initialLon ? new LatLng(initialLat, initialLon) : null
  );
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const handleLocationSelect = (result: any) => {
    const newPosition = new LatLng(result.latitude, result.longitude);
    setPosition(newPosition);
    setSelectedLocation(result.display_name);
    setSearchQuery('');
    setShowResults(false);

    onLocationSelect({
      latitude: result.latitude,
      longitude: result.longitude,
      location_name: result.display_name,
      city: result.city,
      state: result.state,
    });
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const newPosition = new LatLng(lat, lng);
    setPosition(newPosition);

    // Reverse geocode to get location name
    const { reverseGeocode } = await import('../lib/locationUtils');
    const locationInfo = await reverseGeocode(lat, lng);

    setSelectedLocation(locationInfo.location_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);

    onLocationSelect({
      latitude: lat,
      longitude: lng,
      location_name: locationInfo.location_name || '',
      city: locationInfo.city,
      state: locationInfo.state,
    });
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    const location = await getCurrentLocation();

    if (location) {
      const newPosition = new LatLng(location.latitude, location.longitude);
      setPosition(newPosition);
      setSelectedLocation(location.location_name || 'Current Location');

      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: location.location_name || 'Current Location',
        city: location.city,
        state: location.state,
      });
    }

    setIsGettingLocation(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Quick Select */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Location</label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search for a location..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-start gap-2 border-b last:border-b-0"
                  >
                    <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.display_name}
                      </p>
                      {result.city && (
                        <p className="text-xs text-gray-500">
                          {result.city}, {result.state}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGettingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Use My Location</span>
          </button>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="truncate">{selectedLocation}</span>
          </div>
        )}

        {/* Quick City Select */}
        <div className="flex flex-wrap gap-2">
          {nigerianCities.slice(0, 6).map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() =>
                handleLocationSelect({
                  latitude: city.latitude,
                  longitude: city.longitude,
                  display_name: `${city.name}, ${city.state}`,
                  city: city.name,
                  state: city.state,
                })
              }
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={position || new LatLng(56.1304, -106.3468)} // Center of Canada
            zoom={position ? 13 : 6}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} onPositionChange={handleMapClick} />
          </MapContainer>
        </div>
      )}
    </div>
  );
};
