import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { searchLocation } from '../lib/geoUtils';
import {
  Flame,
  Ambulance,
  ArrowRight,
  Brain,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  HeartPulse,
  BarChart3,
  Play,
  Navigation,
  Compass,
  Search,
  CheckCircle,
  Loader2
} from 'lucide-react';

const POPULAR_LOCATIONS = [
  { label: 'MG Road Metro Station, Bengaluru', lat: 12.9716, lng: 77.5946 },
  { label: 'Indiranagar 100ft Road, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { label: 'Koramangala 5th Block, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { label: 'Whitefield ITPL, Bengaluru', lat: 12.9856, lng: 77.7317 },
  { label: 'Bannerghatta Main Road, Bengaluru', lat: 12.8984, lng: 77.5994 },
  { label: 'Saket District Centre, New Delhi', lat: 28.5245, lng: 77.2066 },
  { label: 'Connaught Place, Central Delhi', lat: 28.6315, lng: 77.2167 },
  { label: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { label: 'Hitec City Cyber Towers, Hyderabad', lat: 17.4483, lng: 78.3915 },
];

export default function HomeView() {
  const { navigate, updateLocation, searchCriteria, startDemoMode, openBookingModal, hospitals } = useApp();
  const [detectingGps, setDetectingGps] = useState(false);
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState('');

  function handleQuickSearch() {
    navigate('decision');
  }

  function handleAmbulance() {
    navigate('ambulance');
  }

  // Robust Live GPS Detection with Reverse Geocoding
  async function handleDetectGps() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingGps(true);
    setGpsSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await updateLocation(latitude, longitude);
          setGpsSuccessMsg('Live GPS location locked & distances recalculated!');
          setTimeout(() => setGpsSuccessMsg(''), 4000);
        } catch (e) {
          console.warn('Geocoding error:', e);
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        let msg = 'Location set to Central Emergency Hub.';
        if (error.code === error.PERMISSION_DENIED) {
           msg = 'GPS Permission Denied. Using Central Hub.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
           msg = 'GPS Position Unavailable. Using Central Hub.';
        } else if (error.code === error.TIMEOUT) {
           msg = 'GPS Request Timed Out. Using Central Hub.';
        }
        console.warn('GPS error, falling back to central hub:', error.message);
        
        // Fallback to central hub
        updateLocation(12.9716, 77.5946, 'MG Road Metro Station, Bengaluru (Central Hub)');
        setDetectingGps(false);
        setGpsSuccessMsg(msg);
        setTimeout(() => setGpsSuccessMsg(''), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function handleSearchQueryChange(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length >= 3) {
      setSearching(true);
      const results = await searchLocation(q);
      setSearchResults(results);
      setSearching(false);
    } else {
      setSearchResults([]);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6">
      {/* Demo Warning Banner */}
      <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 shadow-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-amber-950">Notice: Decision Intelligence Demo Environment</p>
          <p className="mt-0.5 text-amber-800">
            Availability, bed counts, doctor status, traffic, and ETA are for demonstration and informed decision support.
            Please confirm critical dispatch directly with the hospital or 108 emergency services.
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center rounded-md bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-900">
          DEMO MODE
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 px-6 py-16 sm:px-12 sm:py-24 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_60%)]" />
        
        <div className="relative z-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-1.5 text-xs font-semibold text-red-300 ring-1 ring-red-500/30">
            <Flame className="h-4 w-4 animate-pulse text-red-400" />
            Emergency Ready 24/7 • Decision Intelligence Engine
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Emergency<span className="text-red-400">Care</span>
          </h1>

          <p className="mt-3 text-lg font-medium text-slate-200 sm:text-xl">
            "Smarter Decisions When Every Minute Matters."
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
            EmergencyCare doesn't make the decision for you. It transforms scattered hospital, bed, doctor,
            and ambulance data into clear, explainable insights so you can make a faster, informed decision.
          </p>

          {/* 📍 Interactive Location Bar with Live Tracking */}
          <div className="mx-auto mt-6 max-w-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 text-xs text-white shadow-lg">
              <div className="flex items-center gap-2 px-3 py-1 flex-1 text-left w-full sm:w-auto">
                <MapPin className="h-4 w-4 text-red-400 shrink-0 animate-bounce" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block">Your Pickup Location:</span>
                  <span className="font-bold text-white text-xs truncate">
                    {searchCriteria.locationLabel || 'Bengaluru Central'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <button
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-3.5 py-2 font-bold text-white transition-all shadow-md shadow-red-600/30 disabled:opacity-50"
                  title="Detect Current GPS Location with High Accuracy"
                >
                  <Compass className={`h-4 w-4 ${detectingGps ? 'animate-spin' : ''}`} />
                  {detectingGps ? 'Locating...' : 'Live GPS'}
                </button>
                <button
                  onClick={() => setLocationSelectorOpen(!locationSelectorOpen)}
                  className="rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 font-semibold text-white transition-colors"
                >
                  Change Area
                </button>
              </div>
            </div>

            {gpsSuccessMsg && (
              <div className="mt-2 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1 animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" />
                {gpsSuccessMsg}
              </div>
            )}
          </div>

          {/* Location Selector & Search Modal */}
          {locationSelectorOpen && (
            <div className="mx-auto mt-3 max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-4 text-left shadow-2xl animate-fade-in text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Choose Emergency Pickup Area</span>
                <button
                  onClick={() => setLocationSelectorOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close ✕
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city, neighborhood, or landmark (e.g. Indiranagar, Saket)..."
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Dynamic search results */}
              {searching && (
                <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching locations...
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-1 mb-3 pb-3 border-b border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Search Results:</p>
                  {searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateLocation(res.lat, res.lng, res.label);
                        setLocationSelectorOpen(false);
                      }}
                      className="w-full text-left rounded-lg p-2 text-xs hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2"
                    >
                      <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span className="truncate">{res.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Hubs */}
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Select Major Emergency Hubs:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs max-h-48 overflow-y-auto">
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc.label}
                    onClick={() => {
                      updateLocation(loc.lat, loc.lng, loc.label);
                      setLocationSelectorOpen(false);
                    }}
                    className="rounded-lg px-2.5 py-2 text-left hover:bg-slate-800 text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{loc.label.split(',')[0]}</span>
                    <span className="text-[10px] text-slate-400">{loc.label.split(',')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fast CTA */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleQuickSearch}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-600/30 hover:brightness-110 hover:-translate-y-0.5 transition-all"
            >
              <Brain className="h-4 w-4" />
              Launch Decision Intelligence
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={startDemoMode}
              className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-3.5 text-sm font-bold text-slate-900 shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              Run Judge Demo Flow
            </button>
          </div>
        </div>
      </section>

      {/* Primary Feature Cards Grid */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Emergency Hospital Search */}
        <button
          onClick={() => navigate('search')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-6 text-left shadow-lg shadow-red-500/20 transition-all hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5"
        >
          <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Find Emergency Hospital</h2>
            <p className="mt-1 text-xs text-red-100">
              Filter by trauma, ICU beds, oxygen ports, and verified insurance acceptance.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white">
              Configure Criteria
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        {/* Card 2: Ambulance Dispatch */}
        <button
          onClick={handleAmbulance}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-left shadow-lg shadow-sky-500/20 transition-all hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
        >
          <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Ambulance className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Request Ambulance</h2>
            <p className="mt-1 text-xs text-sky-100">
              Locate nearby ALS / BLS units with real-time ETA and traffic intelligence.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white">
              View Fleet & Tracker
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>

        {/* Card 3: Decision Intelligence Comparison */}
        <button
          onClick={() => navigate('compare')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-left shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 border border-slate-700 sm:col-span-2 lg:col-span-1"
        >
          <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 ring-1 ring-red-500/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Decision Comparison</h2>
            <p className="mt-1 text-xs text-slate-300">
              Compare multiple hospitals side-by-side across beds, ETA, doctors, and health schemes.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-red-400">
              Open Comparison Matrix
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </button>
      </section>
    </div>
  );
}
