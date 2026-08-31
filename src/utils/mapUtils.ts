export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  zone: string;
}

// Preset verified municipal service hubs for instant testing & selection
export const PRESET_SERVICE_LOCATIONS: ServiceLocation[] = [
  {
    id: 'loc-south-ext',
    name: 'South Extension Part II',
    address: 'Block E, South Extension Part II, New Delhi',
    lat: 28.5700,
    lng: 77.2200,
    zone: 'South Urban Zone',
  },
  {
    id: 'loc-cp',
    name: 'Connaught Place (Central Hub)',
    address: 'Inner Circle, Connaught Place, New Delhi',
    lat: 28.6315,
    lng: 77.2167,
    zone: 'Central Business Hub',
  },
  {
    id: 'loc-saket',
    name: 'Saket District Centre',
    address: 'Press Enclave Road, Saket, New Delhi',
    lat: 28.5245,
    lng: 77.2177,
    zone: 'South Urban Zone',
  },
  {
    id: 'loc-dwarka',
    name: 'Dwarka Sector 12',
    address: 'Main Market, Sector 12, Dwarka, New Delhi',
    lat: 28.5921,
    lng: 77.0460,
    zone: 'West Zone (Dwarka & NCR)',
  },
  {
    id: 'loc-gurugram',
    name: 'Gurugram Cyber City',
    address: 'DLF Phase 2, Gurugram, Haryana',
    lat: 28.4906,
    lng: 77.0910,
    zone: 'Gurugram Urban Hub',
  },
  {
    id: 'loc-noida',
    name: 'Noida Sector 18',
    address: 'Atta Market, Sector 18, Noida, Uttar Pradesh',
    lat: 28.5708,
    lng: 77.3271,
    zone: 'Noida Industrial Hub',
  },
];

/**
 * Validates coordinate numbers rigorously:
 * - Must be finite numbers
 * - Latitude between -90 and 90
 * - Longitude between -180 and 180
 */
export const isValidCoordinate = (lat?: number | null, lng?: number | null): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Calculates great-circle distance between two geographic coordinates in kilometers
 * using the rigorous mathematical Haversine formula:
 * d = 2R * arcsin(sqrt(sin^2(dlat/2) + cos(lat1)*cos(lat2)*sin^2(dlon/2)))
 *
 * @param lat1 Customer latitude
 * @param lon1 Customer longitude
 * @param lat2 Worker latitude
 * @param lon2 Worker longitude
 * @returns Distance in kilometers rounded to 1 decimal place (e.g. 1.8)
 */
export function calculateHaversineDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return 1.5; // Safe default baseline if either coordinate is not yet set
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2! - lat1!) * Math.PI) / 180;
  const dLon = ((lon2! - lon1!) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1! * Math.PI) / 180) *
      Math.cos((lat2! * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Default fallback coordinates for Delhi NCR (South Extension)
 */
export const DEFAULT_DELHI_COORDINATES: Coordinates = {
  lat: 28.5700,
  lng: 77.2200,
};

/**
 * Builds a valid, safe OpenStreetMap navigation or location URL.
 * - Never produces empty/incomplete coordinates, nulls, or ',' errors.
 * - If both worker origin and customer destination are valid: constructs route URL (lon,lat;lon,lat).
 * - If worker origin is unavailable: opens customer location with map marker.
 */
export const buildOpenStreetMapUrl = (
  destination?: { lat?: number | null; lng?: number | null } | null,
  origin?: { lat?: number | null; lng?: number | null } | null
): { url: string; hasRoute: boolean } | null => {
  if (!destination || !isValidCoordinate(destination.lat, destination.lng)) {
    return null;
  }

  const destLat = destination.lat!;
  const destLng = destination.lng!;

  if (origin && isValidCoordinate(origin.lat, origin.lng)) {
    const originLat = origin.lat!;
    const originLng = origin.lng!;

    const oLng = originLng.toFixed(5);
    const oLat = originLat.toFixed(5);
    const dLng = destLng.toFixed(5);
    const dLat = destLat.toFixed(5);

    return {
      url: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${oLng}%2C${oLat}%3B${dLng}%2C${dLat}`,
      hasRoute: true,
    };
  }

  // Worker origin unavailable -> Safely open customer location with marker
  const dLat = destLat.toFixed(5);
  const dLng = destLng.toFixed(5);
  return {
    url: `https://www.openstreetmap.org/?mlat=${dLat}&mlon=${dLng}#map=16/${dLat}/${dLng}`,
    hasRoute: false,
  };
};
