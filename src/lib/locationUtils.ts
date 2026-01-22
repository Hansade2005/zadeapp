/**
 * Location utilities for GPS and distance calculations
 * Uses Haversine formula for accurate distance calculations
 */

export interface Location {
  latitude: number;
  longitude: number;
  location_name?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface LocationWithDistance extends Location {
  distance?: number; // in kilometers
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get user's current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get location name with improved error handling
          const locationName = await reverseGeocode(latitude, longitude);

          resolve({
            latitude,
            longitude,
            ...locationName,
          });
        } catch (error) {
          console.warn('Reverse geocoding failed, using coordinates only:', error);

          // Still return location even if geocoding fails
          resolve({
            latitude,
            longitude,
            location_name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            country: 'Canada',
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);

        // Provide user-friendly error messages
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        console.error(errorMessage);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 } // Increased timeout and cache
    );
  });
}

/**
 * Cache for geocoding results to reduce API calls
 */
const geocodingCache = new Map<string, any>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Sleep function for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000; // Add jitter
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Reverse geocode coordinates to get location details using Nominatim API
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ location_name?: string; city?: string; state?: string; country?: string }> {
  const cacheKey = `reverse_${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const cached = geocodingCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const result = await retryWithBackoff(async () => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ZadeApp/1.0 (contact@zadeapp.com)',
          },
        }
      );

      if (response.status === 403) {
        throw new Error('Rate limited - please try again later');
      }

      if (!response.ok) {
        throw new Error(`Geocoding failed with status ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        location_name: data.display_name,
        city: address.city || address.town || address.village || address.suburb,
        state: address.state,
        country: address.country || 'Canada',
      };
    });

    // Cache the result
    geocodingCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Reverse geocoding error:', error);

    // Return basic location info as fallback
    return {
      location_name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city: undefined,
      state: undefined,
      country: 'Canada',
    };
  }
}

/**
 * Search for locations using Nominatim geocoding API
 */
export async function searchLocation(
  query: string
): Promise<Array<Location & { display_name: string }>> {
  const cacheKey = `search_${query.toLowerCase().trim()}`;
  const cached = geocodingCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const result = await retryWithBackoff(async () => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=ca&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'ZadeApp/1.0 (contact@zadeapp.com)',
          },
        }
      );

      if (response.status === 403) {
        throw new Error('Rate limited - please try again later');
      }

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();

      return data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        location_name: item.display_name,
        display_name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country || 'Canada',
      }));
    });

    // Cache the result
    geocodingCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Location search error:', error);

    // Try to match with predefined cities as fallback
    const lowerQuery = query.toLowerCase();
    const cityMatches = nigerianCities.filter(city =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.state.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    return cityMatches.map(city => ({
      latitude: city.latitude,
      longitude: city.longitude,
      location_name: `${city.name}, ${city.state}`,
      display_name: `${city.name}, ${city.state}`,
      city: city.name,
      state: city.state,
      country: 'Canada',
    }));
  }
}

/**
 * Filter items by distance from a reference point
 */
export function filterByRadius<T extends { latitude?: number; longitude?: number }>(
  items: T[],
  centerLat: number,
  centerLon: number,
  radiusKm: number
): Array<T & { distance: number }> {
  return items
    .map((item) => {
      if (!item.latitude || !item.longitude) return null;

      const distance = calculateDistance(
        centerLat,
        centerLon,
        item.latitude,
        item.longitude
      );

      return { ...item, distance };
    })
    .filter((item): item is T & { distance: number } => {
      return item !== null && item.distance <= radiusKm;
    })
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Canadian major cities for quick location selection
 */
export const nigerianCities = [
  { name: 'Toronto', state: 'Ontario', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Vancouver', state: 'British Columbia', latitude: 49.2827, longitude: -123.1207 },
  { name: 'Montreal', state: 'Quebec', latitude: 45.5017, longitude: -73.5673 },
  { name: 'Calgary', state: 'Alberta', latitude: 51.0447, longitude: -114.0719 },
  { name: 'Edmonton', state: 'Alberta', latitude: 53.5444, longitude: -113.4909 },
  { name: 'Ottawa', state: 'Ontario', latitude: 45.4215, longitude: -75.6972 },
  { name: 'Winnipeg', state: 'Manitoba', latitude: 49.8951, longitude: -97.1384 },
  { name: 'Quebec City', state: 'Quebec', latitude: 46.8139, longitude: -71.2080 },
  { name: 'Hamilton', state: 'Ontario', latitude: 43.2557, longitude: -79.8711 },
  { name: 'Kitchener', state: 'Ontario', latitude: 43.4516, longitude: -80.4925 },
];
