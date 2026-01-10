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
        
        // Reverse geocode to get location name
        const locationName = await reverseGeocode(latitude, longitude);
        
        resolve({
          latitude,
          longitude,
          ...locationName,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Reverse geocode coordinates to get location details using Nominatim API
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ location_name?: string; city?: string; state?: string; country?: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ZadeApp/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    const address = data.address || {};

    return {
      location_name: data.display_name,
      city: address.city || address.town || address.village || address.suburb,
      state: address.state,
      country: address.country || 'Canada',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {};
  }
}

/**
 * Search for locations using Nominatim geocoding API
 */
export async function searchLocation(
  query: string
): Promise<Array<Location & { display_name: string }>> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=ca&addressdetails=1&limit=5`,
      {
        headers: {
          'User-Agent': 'ZadeApp/1.0',
        },
      }
    );

    if (!response.ok) throw new Error('Search failed');

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
  } catch (error) {
    console.error('Location search error:', error);
    return [];
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
