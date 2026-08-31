import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Navigation,
  ExternalLink,
  Loader2,
  Locate,
  AlertCircle,
} from 'lucide-react';
import { Worker } from '../../types';
import { buildOpenStreetMapUrl, isValidCoordinate } from '../../utils/mapUtils';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: string;
}

interface OpenStreetMapViewProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  selectedLocation?: LocationCoordinates | null;
  onLocationSelect?: (loc: LocationCoordinates) => void;
  interactiveSelect?: boolean;
  searchable?: boolean;
  workers?: Worker[];
  originLocation?: LocationCoordinates | null;
  destinationLocation?: LocationCoordinates | null;
  destinationLabel?: string;
  showDirectionsButton?: boolean;
  height?: string;
  className?: string;
}

// Custom Leaflet DivIcon Creators (Clean SVG pins, avoiding broken asset URLs)
const createPinIcon = (color = '#059669', label = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          background: ${color};
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2.5px solid #ffffff;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        ${
          label
            ? `<div style="
                background: #0f172a;
                color: #ffffff;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 6px;
                margin-top: 2px;
                white-space: nowrap;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              ">${label}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const createWorkerIcon = (skill: string) => {
  return L.divIcon({
    className: 'custom-leaflet-worker-marker',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translate(-50%, -100%);
      ">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          background: #0284c7;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          border: 2px solid #ffffff;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          background: #0369a1;
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          margin-top: 1px;
          white-space: nowrap;
        ">${skill}</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

export const OpenStreetMapView: React.FC<OpenStreetMapViewProps> = ({
  initialCenter,
  initialZoom = 15,
  selectedLocation,
  onLocationSelect,
  interactiveSelect = false,
  searchable = true,
  workers = [],
  originLocation,
  destinationLocation,
  destinationLabel = 'Service Destination',
  showDirectionsButton = false,
  height = '320px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mainMarkerRef = useRef<L.Marker | null>(null);
  const workerMarkersRef = useRef<L.Marker[]>([]);

  const [currentCoords, setCurrentCoords] = useState<LocationCoordinates | null>(
    selectedLocation || destinationLocation || (initialCenter ? { lat: initialCenter.lat, lng: initialCenter.lng } : null)
  );
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    selectedLocation?.address || destinationLocation?.address || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  // Reverse Geocoding with OpenStreetMap Nominatim API
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          const addr = data.display_name;
          setResolvedAddress(addr);
          if (onLocationSelect) {
            onLocationSelect({ lat, lng, address: addr });
          }
          return;
        }
      }
    } catch {
      // Ignore network / rate limit errors gracefully
    } finally {
      setIsGeocoding(false);
    }

    const fallbackAddr = `Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`;
    setResolvedAddress(fallbackAddr);
    if (onLocationSelect) {
      onLocationSelect({ lat, lng, address: fallbackAddr });
    }
  }, [onLocationSelect]);

  // Request Real Browser Geolocation
  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice('Location access is unavailable. Please search for your service address or select a location on the map.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const realCoords: LocationCoordinates = { lat: latitude, lng: longitude };
        setCurrentCoords(realCoords);
        setIsLocating(false);
        setLocationNotice(null);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          if (mainMarkerRef.current) {
            mainMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = L.marker([latitude, longitude], {
              draggable: interactiveSelect,
              icon: createPinIcon('#059669', destinationLabel),
            }).addTo(mapInstanceRef.current);
            mainMarkerRef.current = marker;
          }
        }

        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Browser geolocation error:', error.message);
        setLocationNotice('Location access is unavailable. Please search for your service address or select a location on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [interactiveSelect, destinationLabel, reverseGeocode]);

  // OpenStreetMap Nominatim Address Search
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&countrycodes=in&limit=5`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results || []);
        setIsSearchOpen(true);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    const addr = res.display_name;

    setCurrentCoords({ lat, lng, address: addr });
    setResolvedAddress(addr);
    setIsSearchOpen(false);
    setSearchQuery('');
    setLocationNotice(null);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      if (mainMarkerRef.current) {
        mainMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          draggable: interactiveSelect,
          icon: createPinIcon('#059669', destinationLabel),
        }).addTo(mapInstanceRef.current);
        mainMarkerRef.current = marker;
      }
    }

    if (onLocationSelect) {
      onLocationSelect({ lat, lng, address: addr });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy any existing map instance on container
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const hasInitialCoords = selectedLocation || destinationLocation || initialCenter;
    // Default country overview if no coordinates provided yet
    const centerLat = hasInitialCoords ? hasInitialCoords.lat : 20.5937;
    const centerLng = hasInitialCoords ? hasInitialCoords.lng : 78.9629;
    const initialMapZoom = hasInitialCoords ? initialZoom : 5;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: initialMapZoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Standard OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Primary Service Location Pin (if coordinates exist)
    if (hasInitialCoords) {
      const marker = L.marker([centerLat, centerLng], {
        draggable: interactiveSelect,
        icon: createPinIcon('#059669', destinationLabel),
      }).addTo(map);

      if (interactiveSelect) {
        marker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          setCurrentCoords({ lat: newPos.lat, lng: newPos.lng });
          reverseGeocode(newPos.lat, newPos.lng);
        });
      }

      mainMarkerRef.current = marker;
    }

    if (interactiveSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setCurrentCoords({ lat, lng });
        setLocationNotice(null);

        if (mainMarkerRef.current) {
          mainMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], {
            draggable: true,
            icon: createPinIcon('#059669', destinationLabel),
          }).addTo(map);

          marker.on('dragend', (ev) => {
            const newPos = ev.target.getLatLng();
            setCurrentCoords({ lat: newPos.lat, lng: newPos.lng });
            reverseGeocode(newPos.lat, newPos.lng);
          });

          mainMarkerRef.current = marker;
        }

        reverseGeocode(lat, lng);
      });

      // Auto-trigger browser geolocation if no explicit coordinate was passed
      if (!selectedLocation && !destinationLocation && !initialCenter) {
        requestBrowserLocation();
      }
    }

    mapInstanceRef.current = map;

    // Render Nearby Active Workers with Real Coordinates
    workerMarkersRef.current.forEach((m) => m.remove());
    workerMarkersRef.current = [];

    if (workers && workers.length > 0) {
      workers.forEach((w) => {
        if (typeof w.latitude === 'number' && typeof w.longitude === 'number') {
          const wMarker = L.marker([w.latitude, w.longitude], {
            icon: createWorkerIcon(w.skill),
          }).addTo(map);

          wMarker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #0f172a; font-size: 12px; display: block;">${w.name}</strong>
              <span style="font-size: 11px; color: #059669; font-weight: bold;">${w.skill} • ₹${w.basePricePerHour}/hr</span>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${w.experienceYears || 3} yrs exp • Cooperative Verified</div>
            </div>
          `);

          workerMarkersRef.current.push(wMarker);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [interactiveSelect, destinationLabel]);

  // Directions URL using OpenStreetMap / GPS universal route
  const targetLat = destinationLocation?.lat ?? selectedLocation?.lat ?? currentCoords?.lat;
  const targetLng = destinationLocation?.lng ?? selectedLocation?.lng ?? currentCoords?.lng;

  const destCoords = isValidCoordinate(targetLat, targetLng)
    ? { lat: targetLat!, lng: targetLng! }
    : null;

  const origCoords =
    originLocation && isValidCoordinate(originLocation.lat, originLocation.lng)
      ? { lat: originLocation.lat, lng: originLocation.lng }
      : null;

  const osmNavigation = buildOpenStreetMapUrl(destCoords, origCoords);
  const directionsUrl = osmNavigation?.url;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 ${className}`}>
      {/* Geolocation Notice Banner */}
      {locationNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-xs text-amber-900 flex items-start gap-2 z-10 relative">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="font-medium leading-tight">{locationNotice}</span>
        </div>
      )}

      {/* Search Input Bar & Locate Button (for OpenStreetMap) */}
      {searchable && interactiveSelect && (
        <div className="absolute top-3 left-3 right-3 z-1000 flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 shadow-md rounded-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locality, street, or landmark..."
              className="w-full bg-white/95 backdrop-blur-md border border-slate-300 rounded-xl px-3 py-2 pl-9 pr-16 text-xs font-medium text-slate-900 shadow-sm focus:outline-emerald-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
            </button>
          </form>

          {/* Real Browser Geolocation Button */}
          <button
            type="button"
            onClick={requestBrowserLocation}
            disabled={isLocating}
            title="Use My Current GPS Location"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-md transition-colors cursor-pointer shrink-0 flex items-center justify-center"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <Locate className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        </div>
      )}

      {/* Search Dropdown Results */}
      {isSearchOpen && searchResults.length > 0 && (
        <div className="absolute top-14 left-3 right-3 z-1000 bg-white rounded-xl shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
          {searchResults.map((res, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSearchResult(res)}
              className="w-full p-2.5 text-left hover:bg-emerald-50 transition-colors flex items-start gap-2 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-800 line-clamp-2 leading-tight">{res.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Leaflet OpenStreetMap Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height }} className="z-0" />

      {/* Bottom Info & Directions Action Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 block truncate">
              {isGeocoding
                ? 'Resolving address from OpenStreetMap...'
                : isLocating
                ? 'Detecting browser GPS location...'
                : resolvedAddress
                ? resolvedAddress
                : currentCoords
                ? `${currentCoords.lat.toFixed(5)}° N, ${currentCoords.lng.toFixed(5)}° E`
                : 'Click map or search to select your service address'}
            </span>
          </div>
        </div>

        {(showDirectionsButton || destinationLocation) && directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={
              osmNavigation?.hasRoute
                ? 'Open route directions from worker location to customer'
                : 'Worker location is unavailable. Opening customer location on OpenStreetMap instead.'
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Directions</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
