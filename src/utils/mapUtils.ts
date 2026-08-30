export interface Coordinates {
  lat: number;
  lng: number;
}

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
