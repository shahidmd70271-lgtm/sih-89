import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  MapPin,
  ShieldCheck,
  RotateCcw,
  ArrowUpDown,
  CheckCircle2,
  Navigation,
  Locate,
  Map as MapIcon,
  Compass,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import { ServiceType, Worker } from '../../types';
import { WorkerCard } from './WorkerCard';
import { ServiceIcon } from '../common/ServiceIcon';
import {
  calculateHaversineDistanceKm,
  PRESET_SERVICE_LOCATIONS,
  ServiceLocation,
  DEFAULT_DELHI_COORDINATES,
} from '../../utils/mapUtils';
import { OpenStreetMapView } from '../maps/OpenStreetMapView';

type SortOption = 'nearest' | 'most-experienced' | 'lowest-price' | 'available-now';

export const ServiceSearchCatalog: React.FC = () => {
  const {
    workers,
    selectedServiceFilter,
    setSelectedServiceFilter,
    openBookingForWorker,
    openWorkerProfile,
    t,
  } = useApp();

  // Customer Location State (Defaults to South Extension hub)
  const [currentLocation, setCurrentLocation] = useState<ServiceLocation>(PRESET_SERVICE_LOCATIONS[0]);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [showMapToggle, setShowMapToggle] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(15); // in km
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available Now' | 'Available Today'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Detect GPS location using browser geolocation API
  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(6));
        const detectedLng = Number(pos.coords.longitude.toFixed(6));
        setCurrentLocation({
          id: 'loc-gps',
          name: 'Current Detected GPS Location',
          address: `GPS (${detectedLat}, ${detectedLng})`,
          lat: detectedLat,
          lng: detectedLng,
          zone: 'Local Area',
        });
        setIsDetectingGps(false);
      },
      (err) => {
        console.warn('GPS location detection failed:', err);
        alert('Could not detect GPS location. Using preset cooperative hub location.');
        setIsDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const resetFilters = () => {
    setSelectedServiceFilter('All');
    setSearchQuery('');
    setMaxDistance(15);
    setMaxPrice(600);
    setAvailabilityFilter('All');
    setSortBy('nearest');
  };

  const isAvailableVerifiedWorker = (w: Worker) => {
    return Boolean(
      w.isVerified &&
      (w.verificationStatus === 'Verified' || w.verificationStatus === 'approved') &&
      !(w as any).is_removed &&
      (w as any).status !== 'removed' &&
      (w as any).status !== 'inactive'
    );
  };

  // Re-calculate real mathematical Haversine distance for all workers relative to current customer location
  const workersWithRealDistance = useMemo(() => {
    return workers.map((w) => {
      const wLat = w.latitude != null ? w.latitude : DEFAULT_DELHI_COORDINATES.lat;
      const wLng = w.longitude != null ? w.longitude : DEFAULT_DELHI_COORDINATES.lng;
      const computedDistance = calculateHaversineDistanceKm(
        currentLocation.lat,
        currentLocation.lng,
        wLat,
        wLng
      );

      return {
        ...w,
        latitude: wLat,
        longitude: wLng,
        distanceKm: computedDistance,
      };
    });
  }, [workers, currentLocation]);

  const totalVerifiedCount = useMemo(() => {
    return workersWithRealDistance.filter(isAvailableVerifiedWorker).length;
  }, [workersWithRealDistance]);

  // Top Nearby Verified Workers (Filtered strictly for closest distance & active availability)
  const nearbyVerifiedWorkers = useMemo(() => {
    return workersWithRealDistance
      .filter((w) => {
        if (!isAvailableVerifiedWorker(w)) return false;
        if (selectedServiceFilter !== 'All' && w.skill !== selectedServiceFilter) return false;
        return w.availability !== 'Offline';
      })
      .sort((a, b) => {
        // Primary: Distance ascending (nearest first)
        if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
        // Secondary: Experience descending
        return (b.experienceYears || 3) - (a.experienceYears || 3);
      })
      .slice(0, 4);
  }, [workersWithRealDistance, selectedServiceFilter]);

  // Filtered Workers for Main Catalog
  const filteredWorkers = useMemo(() => {
    return workersWithRealDistance
      .filter((w) => {
        if (!isAvailableVerifiedWorker(w)) return false;

        // Service Type filter
        if (selectedServiceFilter !== 'All' && w.skill !== selectedServiceFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            w.name.toLowerCase().includes(q) ||
            w.skill.toLowerCase().includes(q) ||
            w.location.toLowerCase().includes(q) ||
            w.cooperativeName.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Real distance filter
        if (w.distanceKm > maxDistance) return false;

        // Price filter
        if (w.basePricePerHour > maxPrice) return false;

        // Availability filter
        if (availabilityFilter === 'Available Now' && w.availability !== 'Available Now') {
          return false;
        }
        if (
          availabilityFilter === 'Available Today' &&
          w.availability !== 'Available Now' &&
          w.availability !== 'Available Today'
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'nearest':
            return a.distanceKm - b.distanceKm;
          case 'most-experienced':
            return (b.experienceYears || 0) - (a.experienceYears || 0);
          case 'lowest-price':
            return a.basePricePerHour - b.basePricePerHour;
          case 'available-now':
            if (a.availability === 'Available Now' && b.availability !== 'Available Now') return -1;
            if (b.availability === 'Available Now' && a.availability !== 'Available Now') return 1;
            return a.distanceKm - b.distanceKm;
          default:
            return a.distanceKm - b.distanceKm;
        }
      });
  }, [
    workersWithRealDistance,
    selectedServiceFilter,
    searchQuery,
    maxDistance,
    maxPrice,
    availabilityFilter,
    sortBy,
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('customerPortalBreadcrumb') || 'Customer Portal'}</span>
            <span>/</span>
            <span>{t('verifiedDirectoryBreadcrumb') || 'Geo-Matched Shramik Directory'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-emerald-600" />
            <span>{t('findCooperativeWorkers') || 'Find Cooperative Workers Near You'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time Haversine geolocation matching connecting you with verified, union-attested shramiks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Map Toggle Button */}
          <button
            onClick={() => setShowMapToggle(!showMapToggle)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showMapToggle
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{showMapToggle ? 'Hide Map' : 'View Proximity Map'}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
              title={t('gridView') || 'Grid View'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
              title={t('listView') || 'List View'}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t('filters') || 'Filters'}</span>
          </button>
        </div>
      </div>

      {/* Customer Service Location Selector Bar */}
      <div className="bg-linear-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 border border-emerald-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
              Your Current Service Location
            </span>
            <h3 className="text-base font-bold text-white truncate">{currentLocation.name}</h3>
            <p className="text-xs text-slate-300 truncate">
              {currentLocation.address} ({currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)})
            </p>
          </div>
        </div>

        {/* Location Change & GPS Detect Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Quick Hub Dropdown */}
          <select
            value={currentLocation.id}
            onChange={(e) => {
              const selected = PRESET_SERVICE_LOCATIONS.find((l) => l.id === e.target.value);
              if (selected) setCurrentLocation(selected);
            }}
            className="text-xs font-bold bg-slate-800/90 text-white border border-emerald-600/50 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer shadow-xs"
          >
            {PRESET_SERVICE_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                📍 {loc.name} ({loc.zone})
              </option>
            ))}
          </select>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleDetectGpsLocation}
            disabled={isDetectingGps}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Locate className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span>{isDetectingGps ? 'Detecting GPS...' : 'Detect GPS'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Map View (Collapsible) */}
      {showMapToggle && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">Live Worker Proximity Map</h3>
              <span className="text-xs text-slate-500 font-normal">
                (Emerald Pin: You | Colored Pins: Verified Shramiks)
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {filteredWorkers.length} Shramiks in Area
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <OpenStreetMapView
              initialCenter={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              initialZoom={13}
              height="340px"
              selectedLocation={{
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                address: currentLocation.name,
              }}
              workers={filteredWorkers}
            />
          </div>
        </div>
      )}

      {/* Nearby Verified Workers Section */}
      {nearbyVerifiedWorkers.length > 0 && (
        <div className="bg-emerald-50/60 rounded-3xl p-5 sm:p-6 border border-emerald-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Nearby Verified Workers</span>
                  <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Closest First
                  </span>
                </h2>
                <p className="text-xs text-slate-600">
                  Instant geo-matched shramiks within your immediate neighborhood
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs self-start sm:self-auto">
              📍 Proximity: {nearbyVerifiedWorkers[0]?.distanceKm} km – {nearbyVerifiedWorkers[nearbyVerifiedWorkers.length - 1]?.distanceKm} km
            </span>
          </div>

          {/* Nearby Workers Horizontal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyVerifiedWorkers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="relative">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                        <ShieldCheck className="w-3 h-3" />
                      </div>
                    </div>

                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      📍 {worker.distanceKm} km away
                    </span>
                  </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{worker.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <ServiceIcon name={worker.skill} className="w-3 h-3 text-emerald-600" />
                        <span>{worker.skill}</span>
                        <span>•</span>
                        <span>{worker.experienceYears || 3} yrs exp</span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        🏛️ {worker.cooperativeName}
                      </p>
                    </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900">
                    ₹{worker.basePricePerHour}<span className="text-[10px] font-normal text-slate-500">/hr</span>
                  </span>

                  <button
                    onClick={() => openBookingForWorker(worker)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Category Filter Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedServiceFilter('All')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
            selectedServiceFilter === 'All'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          {t('allTrades') || 'All Trades'} ({totalVerifiedCount})
        </button>
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedServiceFilter === cat.id;
          const serviceKey = `service_${cat.id.replace(/[\s&]+/g, '')}`;
          const translatedName = t(serviceKey) || cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedServiceFilter(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              <ServiceIcon
                name={cat.id}
                className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`}
              />
              <span>{translatedName}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Sidebar Filters + Worker Listing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div
          className={`lg:col-span-3 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs ${
            isMobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>{t('filters') || 'Filters'}</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('reset') || 'Reset'}</span>
            </button>
          </div>

          {/* Search Input Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('keywordSearch') || 'Search by Name / Trade'}</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('keywordSearchPlaceholder') || 'e.g. Plumber, Electrician...'}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pl-8 focus:outline-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Real Distance Radius Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">{t('distanceRadius') || 'Distance Radius'}</label>
              <span className="font-mono text-emerald-800 font-bold">Within {maxDistance} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 km</span>
              <span>8 km</span>
              <span>15 km</span>
              <span>25 km</span>
            </div>
          </div>

          {/* Maximum Price Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">{t('maxHourlyRate') || 'Max Price per Hour'}</label>
              <span className="font-mono text-emerald-800 font-bold">Up to ₹{maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min={150}
              max={600}
              step={25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>₹150</span>
              <span>₹350</span>
              <span>₹600</span>
            </div>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">{t('availabilityLabel') || 'Availability'}</label>
            <div className="space-y-1.5 text-xs">
              {(['All', 'Available Now', 'Available Today'] as const).map((avail) => (
                <label
                  key={avail}
                  className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-emerald-800"
                >
                  <input
                    type="radio"
                    name="availability"
                    checked={availabilityFilter === avail}
                    onChange={() => setAvailabilityFilter(avail)}
                    className="accent-emerald-600 cursor-pointer"
                  />
                  <span>{avail}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Listing Column */}
        <div className="lg:col-span-9 space-y-4">
          {/* Top Sort & Results Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 font-medium">
              Showing <strong>{filteredWorkers.length}</strong> verified shramiks sorted by geographic proximity to <strong>{currentLocation.name}</strong>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort by:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-emerald-500 cursor-pointer"
              >
                <option value="nearest">📍 Nearest Distance First</option>
                <option value="most-experienced">🏆 Most Experienced First</option>
                <option value="lowest-price">💰 Lowest Hourly Rate</option>
                <option value="available-now">⚡ Available Now First</option>
              </select>
            </div>
          </div>

          {/* Results Grid / List */}
          {filteredWorkers.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {filteredWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} layout={viewMode} />
              ))}
            </div>
          ) : totalVerifiedCount === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                No verified workers are currently available in this radius.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                All Sahaayak trade workers are registered and verified by affiliated Labour Cooperative Societies. Expand your distance radius to view verified workers in adjacent urban zones.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t('noMatchingWorkers') || 'No matching workers found'}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your distance radius or selecting a different service category.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {t('resetFilters') || 'Reset All Filters'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
