import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import { ServiceType, Worker } from '../../types';
import { WorkerCard } from './WorkerCard';
import { ServiceIcon } from '../common/ServiceIcon';

type SortOption = 'nearest' | 'highest-rated' | 'lowest-price' | 'available-now';

export const ServiceSearchCatalog: React.FC = () => {
  const {
    workers,
    selectedServiceFilter,
    setSelectedServiceFilter,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // in km
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available Now' | 'Available Today'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('nearest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const resetFilters = () => {
    setSelectedServiceFilter('All');
    setSearchQuery('');
    setMaxDistance(10);
    setMinRating(0);
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

  const totalVerifiedCount = useMemo(() => {
    return workers.filter(isAvailableVerifiedWorker).length;
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return workers
      .filter((w) => {
        // Customer Find Services must show ONLY registered, admin approved, active, available workers
        if (!isAvailableVerifiedWorker(w)) return false;

        // Service Type filter
        if (selectedServiceFilter !== 'All' && w.skill !== selectedServiceFilter) {
          return false;
        }

        // Search query (worker name, skill, location, cooperative)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            w.name.toLowerCase().includes(q) ||
            w.skill.toLowerCase().includes(q) ||
            w.location.toLowerCase().includes(q) ||
            w.cooperativeName.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Distance filter
        if (w.distanceKm > maxDistance) return false;

        // Rating filter
        if (w.rating < minRating) return false;

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
          case 'highest-rated':
            return b.rating - a.rating;
          case 'lowest-price':
            return a.basePricePerHour - b.basePricePerHour;
          case 'available-now':
            if (a.availability === 'Available Now' && b.availability !== 'Available Now') return -1;
            if (b.availability === 'Available Now' && a.availability !== 'Available Now') return 1;
            return a.distanceKm - b.distanceKm;
          default:
            return 0;
        }
      });
  }, [
    workers,
    selectedServiceFilter,
    searchQuery,
    maxDistance,
    minRating,
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
            <span>{t('customerPortalBreadcrumb')}</span>
            <span>/</span>
            <span>{t('verifiedDirectoryBreadcrumb')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('findCooperativeWorkers')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('findWorkersSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
              title={t('gridView')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
              title={t('listView')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t('filters')}</span>
          </button>
        </div>
      </div>

      {/* Quick Category Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedServiceFilter('All')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedServiceFilter === 'All'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          {t('allTrades')} ({totalVerifiedCount})
        </button>
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = selectedServiceFilter === cat.id;
          const serviceKey = `service_${cat.id.replace(/[\s&]+/g, '')}`;
          const translatedName = t(serviceKey);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedServiceFilter(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
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
        {/* Left Filter Sidebar (Desktop & Mobile Drawer) */}
        <div
          className={`lg:col-span-3 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs ${
            isMobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>{t('filters')}</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('reset')}</span>
            </button>
          </div>

          {/* Search Input Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">{t('keywordSearch')}</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('keywordSearchPlaceholder')}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pl-8 focus:outline-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">{t('distanceRadius')}</label>
              <span className="font-mono text-emerald-800 font-bold">{t('withinKm', { distance: maxDistance })}</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>1 km</span>
              <span>5 km</span>
              <span>10 km</span>
              <span>15 km</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">{t('minimumRating')}</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 4.0, 4.5, 4.8].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setMinRating(rate)}
                  className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-colors ${
                    minRating === rate
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {rate === 0 ? t('anyRating') : `${rate}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Price Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">{t('maxHourlyRate')}</label>
              <span className="font-mono text-emerald-800 font-bold">{t('upToPerHour', { price: maxPrice })}</span>
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
            <label className="text-xs font-bold text-slate-700">{t('availabilityLabel')}</label>
            <div className="space-y-1.5 text-xs">
              {(['All', 'Available Now', 'Available Today'] as const).map((avail) => {
                const labelText =
                  avail === 'All'
                    ? t('allAvailability')
                    : avail === 'Available Now'
                    ? t('availableNowOnly')
                    : t('availableTodayOnly');
                return (
                  <label
                    key={avail}
                    className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-emerald-800"
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityFilter === avail}
                      onChange={() => setAvailabilityFilter(avail)}
                      className="accent-emerald-600"
                    />
                    <span>{labelText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Listing Column */}
        <div className="lg:col-span-9 space-y-4">
          {/* Top Sort & Results Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 font-medium">
              {t('showingVerifiedWorkers', { count: filteredWorkers.length })}
            </div>

            {/* Sort by dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                {t('sortByLabel')}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-emerald-500"
              >
                <option value="nearest">{t('sortNearestDistance')}</option>
                <option value="highest-rated">{t('sortHighestRating')}</option>
                <option value="lowest-price">{t('sortLowestPrice')}</option>
                <option value="available-now">{t('sortAvailableFirst')}</option>
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
                No verified workers are currently available.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                All Sahaayak trade workers are registered and verified by affiliated Labour Cooperative Societies. New verified workers will appear here once authorized by cooperative officers.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{t('noMatchingWorkers')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('noMatchingWorkersSub')}
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {t('resetFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
