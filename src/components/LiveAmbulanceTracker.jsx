import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getHospitalTariff } from '../lib/pricingData';
import L from 'leaflet';
import {
  Ambulance,
  Brain,
  MapPin,
  Clock,
  Navigation,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Building2,
  ShieldCheck,
  Radio,
  CreditCard,
  Zap,
  Gauge
} from 'lucide-react';

const STAGES = ['Searching', 'Assigned', 'EN ROUTE', 'Nearby', 'Arrived'];

export default function LiveAmbulanceTracker() {
  const {
    selectedHospital,
    selectedAmbulance,
    searchCriteria,
    generateEmergencySummary,
    navigate,
    openBookingModal,
  } = useApp();

  const h = selectedHospital || {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'CityCare Apex Trauma & Emergency Hospital',
    address: '45 Hospital Boulevard',
    phone: '+91 80 4912 3999',
    latitude: 12.9716,
    longitude: 77.5946,
  };

  const amb = selectedAmbulance || {
    type: 'ALS Ambulance (Advanced Cardiac Life Support)',
    vehicle_number: 'KA-01-EA-9911',
    driver_name: 'Suresh Kumar (Senior Paramedic)',
    phone: '+91 98765 11223',
    eta: '6 min',
  };

  const userLat = searchCriteria.lat || 12.9716;
  const userLng = searchCriteria.lng || 77.5946;
  const hospLat = h.latitude || (userLat + 0.015);
  const hospLng = h.longitude || (userLng + 0.018);

  const [stageIdx, setStageIdx] = useState(2); // EN ROUTE
  const [eta, setEta] = useState(6);
  const [distance, setDistance] = useState(1.8);
  const [speed, setSpeed] = useState(48);
  const [activeRoute, setActiveRoute] = useState('Route A (Direct Corridor)');
  const [trafficAlert, setTrafficAlert] = useState(true);

  // Map ref
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Pricing calculation
  const tariff = getHospitalTariff(h.id);
  const isAcls = amb.type?.includes('ALS') || amb.type?.includes('Cardiac');
  const baseAmbulanceFare = isAcls ? tariff.ambulanceAcls : tariff.ambulanceBls;
  const perKmRate = tariff.ambulancePerKm;
  const distanceFare = Math.round(distance * perKmRate);
  const totalAmbulanceBookingAmount = baseAmbulanceFare + distanceFare;

  // Initialize interactive Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const midLat = (userLat + hospLat) / 2;
      const midLng = (userLng + hospLng) / 2;

      const map = L.map(mapContainerRef.current, {
        center: [midLat, midLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // User Marker
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Pickup Location (User)</b><br/>${searchCriteria.locationLabel}`);

      // Hospital Marker
      const hospIcon = L.divIcon({
        className: 'custom-hosp-pin',
        html: `<div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 8px; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 13px; box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);">🏥</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([hospLat, hospLng], { icon: hospIcon })
        .addTo(map)
        .bindPopup(`<b>${h.name}</b><br/>Emergency Trauma Wing`);

      // Initial Ambulance position (between user and hospital)
      const ambLat = userLat + (hospLat - userLat) * 0.45;
      const ambLng = userLng + (hospLng - userLng) * 0.45;

      const ambIcon = L.divIcon({
        className: 'custom-amb-pin',
        html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 0 15px rgba(245, 158, 11, 0.9);">🚑</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const ambMarker = L.marker([ambLat, ambLng], { icon: ambIcon })
        .addTo(map)
        .bindPopup(`<b>${amb.type}</b><br/>Status: EN ROUTE<br/>ETA: ${eta} min`);

      // Route Polyline
      const routePoints = [
        [userLat, userLng],
        [userLat + 0.005, userLng + 0.006],
        [ambLat, ambLng],
        [hospLat - 0.004, hospLng - 0.005],
        [hospLat, hospLng],
      ];
      const poly = L.polyline(routePoints, {
        color: '#ef4444',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      mapInstanceRef.current = map;
      ambulanceMarkerRef.current = ambMarker;
      routePolylineRef.current = poly;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLng, hospLat, hospLng]);

  // Live telemetry ticker: move ambulance towards user
  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
      setDistance((prev) => (prev > 0.4 ? parseFloat((prev - 0.2).toFixed(1)) : 0.3));
      setSpeed(Math.floor(45 + Math.random() * 12));

      // Animate marker on Leaflet map if present
      if (ambulanceMarkerRef.current && mapInstanceRef.current) {
        const curLatLng = ambulanceMarkerRef.current.getLatLng();
        const stepLat = curLatLng.lat + (userLat - curLatLng.lat) * 0.15;
        const stepLng = curLatLng.lng + (userLng - curLatLng.lng) * 0.15;
        ambulanceMarkerRef.current.setLatLng([stepLat, stepLng]);
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [userLat, userLng]);

  function handleSwitchRoute() {
    if (activeRoute.includes('Route A')) {
      setActiveRoute('Route B (Green Wave Bypass)');
      setEta((prev) => Math.max(2, prev - 2));
      setDistance((prev) => parseFloat((prev * 0.85).toFixed(1)));
      setTrafficAlert(false);

      if (routePolylineRef.current) {
        routePolylineRef.current.setStyle({ color: '#10b981', dashArray: null });
      }
    } else {
      setActiveRoute('Route A (Direct Corridor)');
      setTrafficAlert(true);
      setEta(6);
      setDistance(1.8);

      if (routePolylineRef.current) {
        routePolylineRef.current.setStyle({ color: '#ef4444', dashArray: '8, 8' });
      }
    }
  }

  function advanceStage() {
    setStageIdx((prev) => (prev < STAGES.length - 1 ? prev + 1 : 0));
  }

  const currentStatus = STAGES[stageIdx];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      {/* 🎬 DEMO LIVE TRACKING Notice */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-500 text-slate-950 px-4 py-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
          <Radio className="h-4 w-4 animate-pulse text-red-950" />
          <span>🎬 DEMO LIVE TRACKING — Real GPS Telemetry Simulation</span>
        </div>
        <button
          onClick={advanceStage}
          className="rounded-lg bg-slate-950 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors"
        >
          Advance Status: ({currentStatus})
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Tracker Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30 mb-2">
                <Ambulance className="h-3.5 w-3.5" />
                Live Emergency Ambulance Telemetry
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{amb.type || 'ALS Ambulance'}</h1>
              <p className="text-xs text-slate-300 mt-1">
                Vehicle: <strong>{amb.vehicle_number || 'KA-01-EA-9911'}</strong> • Driver: {amb.driver_name || 'Paramedic On Duty'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Driver
              </a>
              <button
                onClick={() => generateEmergencySummary(h, amb)}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-100 shadow-md"
              >
                <FileText className="h-3.5 w-3.5 text-red-600" />
                Emergency Summary
              </button>
            </div>
          </div>
        </div>

        {/* 🧠 Route Decision Intelligence Banner */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-purple-50/90 to-amber-50/90 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Brain className="h-5 w-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                  🧠 Route Insight & Traffic Intelligence
                </h4>
                {trafficAlert ? (
                  <p className="text-xs text-slate-800 mt-1">
                    ⚠ Traffic increased on <strong>Route A</strong>. Alternative <strong>Route B (Green Wave Bypass)</strong>: ETA reduced from 14 min → 11 min.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-900 mt-1 font-semibold">
                    ✔ "The current selected route has the shortest displayed ETA among the available demo routes."
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSwitchRoute}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 px-4 py-2 text-xs font-bold text-white shadow-sm shrink-0 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Switch Route
            </button>
          </div>
        </div>

        {/* Real Interactive Leaflet GPS Map Canvas */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Telemetry Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 block font-semibold">Live Status</span>
              <span className="text-sm font-extrabold text-red-600 animate-pulse">{currentStatus}</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 block font-semibold">Estimated Arrival</span>
              <span className="text-sm font-extrabold text-amber-700">~{eta} minutes</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 block font-semibold">Distance Away</span>
              <span className="text-sm font-extrabold text-slate-900">{distance} km</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 block font-semibold">Transit Speed</span>
              <span className="text-sm font-extrabold text-emerald-700">{speed} km/h (Siren On)</span>
            </div>
          </div>

          {/* Interactive OpenStreetMap Container */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-inner relative">
            <div
              ref={mapContainerRef}
              className="h-80 sm:h-96 w-full z-0 bg-slate-100"
              style={{ minHeight: '340px' }}
            />
            {/* Live route overlay card */}
            <div className="absolute top-3 left-3 z-10 rounded-2xl bg-slate-900/90 backdrop-blur-md px-3.5 py-2 text-white text-xs shadow-lg">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold">Active Track: {activeRoute}</span>
              </div>
            </div>
          </div>

          {/* 💰 TRANSPARENT AMBULANCE BOOKING AMOUNT & CHARGES */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ambulance Dispatch Fare & Booking Amount
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Itemized Transit Charges Breakdown
                </h3>
                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Base Emergency Dispatch Fee:</span>
                    <strong className="text-slate-900">₹{baseAmbulanceFare}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Distance Rate ({distance} km @ ₹{perKmRate}/km):</span>
                    <strong className="text-slate-900">₹{distanceFare}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <span>Onboard Life Support & Paramedic Crew:</span>
                    <span>Included</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-4 text-center sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  Total Ambulance Fare:
                </span>
                <div className="text-2xl font-black text-red-600">
                  ₹{totalAmbulanceBookingAmount}
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  ✓ 100% Cashless for Ayushman & Star Health
                </span>
              </div>
            </div>
          </div>

          {/* Stage Stepper: Searching -> Assigned -> En Route -> Nearby -> Arrived */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              {STAGES.map((s, idx) => {
                const isDone = idx < stageIdx;
                const isCurrent = idx === stageIdx;
                return (
                  <div
                    key={s}
                    className={`flex flex-col items-center gap-1.5 ${
                      isCurrent
                        ? 'text-amber-600 font-black'
                        : isDone
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30'
                          : isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className="hidden sm:inline text-[11px]">{s}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('decision')}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Decision Intelligence
            </button>

            <button
              onClick={() => openBookingModal(h)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-105"
            >
              <CreditCard className="h-4 w-4" />
              Book Hospital Admission Bed (₹0 Advance Cashless)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
