import api from './api';

// Known kitchen locality coordinates used purely to compute real Haversine distance
// when a customer shares live GPS or searches an address with coordinates.
const KITCHEN_LOCALITY_COORDS = {
  koramangala: { lat: 12.9352, lng: 77.6245 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  'hsr layout': { lat: 12.9116, lng: 77.6473 },
  whitefield: { lat: 12.9698, lng: 77.7499 },
  'mg road': { lat: 12.9756, lng: 77.6066 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  marathahalli: { lat: 12.9591, lng: 77.6974 },
  malleshwaram: { lat: 13.0055, lng: 77.5692 },
  'frazer town': { lat: 12.9968, lng: 77.613 },
  'church street': { lat: 12.9752, lng: 77.6044 },
  bellandur: { lat: 12.926, lng: 77.6762 },
  domlur: { lat: 12.961, lng: 77.6387 },
  sadashivanagar: { lat: 13.0068, lng: 77.5813 },
  'lavelle road': { lat: 12.9718, lng: 77.5964 },
  'kalyan nagar': { lat: 13.028, lng: 77.64 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  pune: { lat: 18.5204, lng: 73.8567 },
  chennai: { lat: 13.0827, lng: 80.2707 },
};

/**
 * Normalize raw OpenStreetMap Nominatim result into structured Foodix location fields.
 */
export function normalizeNominatimPlace(raw) {
  if (!raw) return null;
  const addr = raw.address || {};
  const area =
    addr.neighbourhood ||
    addr.suburb ||
    addr.residential ||
    addr.quarter ||
    addr.hamlet ||
    addr.road ||
    raw.name ||
    '';
  const locality =
    addr.suburb ||
    addr.city_district ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    area ||
    '';
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.state_district ||
    addr.county ||
    addr.state ||
    '';
  const state = addr.state || addr.region || '';
  const pincode = addr.postcode || '';
  const country = addr.country || '';

  const primary = area || locality || city || 'Current Location';
  const displayName =
    city && primary.toLowerCase() !== city.toLowerCase()
      ? `${primary}, ${city}`
      : primary || raw.display_name || 'Detected Location';

  return {
    id: String(raw.place_id || `${raw.lat}_${raw.lon}`),
    displayName,
    area: area || locality || primary,
    locality: locality || area || city,
    city: city || state || primary,
    state,
    pincode,
    country,
    fullAddress: raw.display_name || [primary, city, state, pincode].filter(Boolean).join(', '),
    lat: raw.lat != null ? Number(raw.lat) : null,
    lng: raw.lon != null ? Number(raw.lon) : null,
  };
}

/**
 * Reverse geocode browser coordinates into real area, locality, and city.
 */
export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) {
    throw new Error('Coordinates are required for reverse geocoding.');
  }

  // Try local Vite proxy endpoint first (avoids browser User-Agent restrictions)
  try {
    const res = await api.get(`/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`, {
      timeout: 8000,
    });
    if (res?.data?.data && !res.data.error) {
      const normalized = normalizeNominatimPlace(res.data.data);
      if (normalized) return { ...normalized, lat: Number(lat), lng: Number(lng), source: 'gps' };
    }
  } catch {
    // Fallback to direct browser fetch below
  }

  try {
    const directRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`,
      { headers: { Accept: 'application/json' } }
    );
    if (!directRes.ok) {
      throw new Error('Geocoding service returned an error');
    }
    const raw = await directRes.json();
    const normalized = normalizeNominatimPlace(raw);
    if (normalized) {
      return { ...normalized, lat: Number(lat), lng: Number(lng), source: 'gps' };
    }
  } catch {
    // Graceful coordinate-only fallback when reverse geocoding network is offline
  }

  return {
    id: `gps_${lat}_${lng}`,
    displayName: `${Number(lat).toFixed(3)}, ${Number(lng).toFixed(3)}`,
    area: 'GPS Coordinates Detected',
    locality: `Lat ${Number(lat).toFixed(4)}, Lng ${Number(lng).toFixed(4)}`,
    city: 'Current GPS Area',
    state: '',
    pincode: '',
    country: '',
    fullAddress: `GPS Position (${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}) — Reverse geocoding offline`,
    lat: Number(lat),
    lng: Number(lng),
    source: 'gps',
    geocodeFallback: true,
  };
}

/**
 * Search real addresses via Nominatim search endpoint.
 */
export async function searchAddressSuggestions(query) {
  const clean = (query || '').trim();
  if (clean.length < 2) return [];

  try {
    const res = await api.get(`/geocode/search?q=${encodeURIComponent(clean)}`, {
      timeout: 8000,
    });
    if (Array.isArray(res?.data?.data)) {
      return res.data.data.map(normalizeNominatimPlace).filter(Boolean);
    }
  } catch {
    // Fallback to direct fetch below
  }

  const directRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(clean)}&addressdetails=1&limit=6`,
    { headers: { Accept: 'application/json' } }
  );
  if (!directRes.ok) {
    throw new Error('Unable to reach address search service. Check your connection.');
  }
  const rawList = await directRes.json();
  return Array.isArray(rawList) ? rawList.map(normalizeNominatimPlace).filter(Boolean) : [];
}

/**
 * Promisified wrapper over browser Geolocation API with explicit error categorization.
 */
export function detectCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({
        code: 'UNSUPPORTED',
        message: 'Geolocation is not supported by your browser. Please search your delivery address manually.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (err) => {
        if (err.code === 1) {
          reject({
            code: 'PERMISSION_DENIED',
            message:
              'Location permission was denied. Please enable location access in your browser settings or search your address manually.',
          });
        } else if (err.code === 2) {
          reject({
            code: 'POSITION_UNAVAILABLE',
            message:
              'Your device location is unavailable right now. Please check GPS/network connectivity or enter your address manually.',
          });
        } else if (err.code === 3) {
          reject({
            code: 'TIMEOUT',
            message:
              'Location detection timed out. Tap Refresh to try again or search your delivery address manually.',
          });
        } else {
          reject({
            code: 'UNKNOWN',
            message: err.message || 'Could not detect current location.',
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Exact Haversine distance in kilometers between two coordinates.
 */
export function calculateHaversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v == null || Number.isNaN(Number(v)))) {
    return null;
  }
  const toRad = (deg) => (Number(deg) * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(Number(lat2) - Number(lat1));
  const dLon = toRad(Number(lng2) - Number(lng1));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Derive coordinate pair for a restaurant using explicit coords or its locality label.
 */
export function resolveRestaurantCoords(restaurant) {
  if (!restaurant) return null;
  if (restaurant.lat != null && restaurant.lng != null) {
    return { lat: Number(restaurant.lat), lng: Number(restaurant.lng) };
  }
  const locText = `${restaurant.location || ''} ${restaurant.address || ''}`.toLowerCase();
  for (const [key, coords] of Object.entries(KITCHEN_LOCALITY_COORDS)) {
    if (locText.includes(key)) {
      return coords;
    }
  }
  return null;
}

/**
 * Evaluate proximity, zone status, and dynamic ETA for a restaurant vs customer's liveLocation.
 */
export function getRestaurantGeoMeta(restaurant, liveLocation) {
  if (!liveLocation) {
    return {
      distanceKm: null,
      zone: 'unset',
      isNearby: true,
      sameCityMatch: false,
      zoneLabel: restaurant?.location?.split(',')[0] || 'Partner Kitchen',
      effectiveDeliveryFee: restaurant?.deliveryFee ?? 35,
      effectiveEta: restaurant?.deliveryTime || '30-40 mins',
    };
  }

  const restCoords = resolveRestaurantCoords(restaurant);
  const hasCoords = liveLocation.lat != null && liveLocation.lng != null && restCoords;
  const distanceKm = hasCoords
    ? calculateHaversineKm(liveLocation.lat, liveLocation.lng, restCoords.lat, restCoords.lng)
    : null;

  const restText = `${restaurant?.location || ''} ${restaurant?.address || ''}`.toLowerCase();
  const cityToken = (liveLocation.city || '').trim().toLowerCase();
  const areaToken = (liveLocation.area || '').trim().toLowerCase();
  const sameCityMatch =
    (areaToken.length > 2 && restText.includes(areaToken)) ||
    (cityToken.length > 2 && restText.includes(cityToken));

  const baseFee = restaurant?.deliveryFee ?? 35;

  if (distanceKm !== null) {
    if (distanceKm <= 12) {
      const minEta = Math.max(15, Math.round(16 + distanceKm * 1.5));
      return {
        distanceKm,
        zone: 'nearby',
        isNearby: true,
        sameCityMatch: true,
        zoneLabel: `${distanceKm} km away`,
        effectiveDeliveryFee: baseFee,
        effectiveEta: `${minEta}-${minEta + 10} mins`,
      };
    }
    if (distanceKm <= 35) {
      const minEta = Math.round(28 + distanceKm * 1.1);
      return {
        distanceKm,
        zone: 'extended',
        isNearby: true,
        sameCityMatch,
        zoneLabel: `${distanceKm} km • Extended`,
        effectiveDeliveryFee: baseFee + 15,
        effectiveEta: `${minEta}-${minEta + 10} mins`,
      };
    }
    return {
      distanceKm,
      zone: 'remote',
      isNearby: false,
      sameCityMatch,
      zoneLabel: `${Math.round(distanceKm)} km • Express Intercity`,
      effectiveDeliveryFee: baseFee + 35,
      effectiveEta: restaurant?.deliveryTime || '45-60 mins',
    };
  }

  if (sameCityMatch) {
    return {
      distanceKm: null,
      zone: 'nearby',
      isNearby: true,
      sameCityMatch: true,
      zoneLabel: 'In your city',
      effectiveDeliveryFee: baseFee,
      effectiveEta: restaurant?.deliveryTime || '25-35 mins',
    };
  }

  return {
    distanceKm: null,
    zone: 'remote',
    isNearby: false,
    sameCityMatch: false,
    zoneLabel: `${restaurant?.location || 'Remote Kitchen'} • Express`,
    effectiveDeliveryFee: baseFee + 25,
    effectiveEta: restaurant?.deliveryTime || '40-55 mins',
  };
}
