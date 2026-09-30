import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getMultiRoutes } from '../lib/geoUtils';
import L from 'leaflet';
import {
  Navigation,
  Brain,
  MapPin,
  Clock,
  Phone,
  Ambulance,
  FileText,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Activity,
  Zap,
  Gauge
} from 'lucide-react';

export default function RouteView() {
  const {
    selectedHospital,
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

  const userLat = searchCriteria.lat || 12.9716;
  const userLng = searchCriteria.lng || 77.5946;
  const hospLat = h.latitude || (userLat + 0.015);
  const hospLng = h.longitude || (userLng + 0.018);

  // Compute 3 multi-routes: Shortest Route, Fastest Route (Green Wave), Bypass Route
  const routes = getMultiRoutes(userLat, userLng, hospLat, hospLng);
  const [selectedRouteId, setSelectedRouteId] = useState('fastest'); // Default to fastest green corridor

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylinesRef = useRef({});

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

      // User Pickup Marker
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`<b>Pickup Location (Origin)</b><br/>${searchCriteria.locationLabel}`);

      // Hospital Destination Marker
      const hospIcon = L.divIcon({
        className: 'hosp-marker',
        html: `<div style="background-color: #10b981; width: 26px; height: 26px; border-radius: 8px; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);">🏥</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([hospLat, hospLng], { icon: hospIcon })
        .addTo(map)
        .bindPopup(`<b>${h.name}</b><br/>Emergency Trauma Desk`);

      // Draw all 3 routes on map
      routes.forEach((r) => {
        const isSelected = r.id === selectedRouteId;
        const poly = L.polyline(r.waypoints, {
          color: r.trafficColor,
          weight: isSelected ? 6 : 3,
          opacity: isSelected ? 0.95 : 0.45,
          dashArray: r.id === 'shortest' ? '6, 6' : null,
        }).addTo(map);

        polylinesRef.current[r.id] = poly;
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLng, hospLat, hospLng]);

  // Update polyline weights when selected route changes
  useEffect(() => {
    routes.forEach((r) => {
      const poly = polylinesRef.current[r.id];
      if (poly) {
        const isSelected = r.id === selectedRouteId;
        poly.setStyle({
          weight: isSelected ? 6 : 3,
          opacity: isSelected ? 0.95 : 0.4,
        });
        if (isSelected) {
          poly.bringToFront();
        }
      }
    });
  }, [selectedRouteId, routes]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Navigation Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30 mb-2">
                <Navigation className="h-3.5 w-3.5" />
                Dynamic Route Navigation & Live Traffic Telemetry
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{h.name}</h1>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                Destination: {h.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-md"
              >
                <Phone className="h-3.5 w-3.5" />
                Call ER Ahead
              </a>
              <button
                onClick={() => openBookingModal(h)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-bold text-white hover:brightness-105 shadow-md"
              >
                Book ER Slot
              </button>
              <button
                onClick={() => generateEmergencySummary(h)}
                className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 shadow-md"
              >
                <FileText className="h-3.5 w-3.5 text-red-600" />
                Summary Receipt
              </button>
            </div>
          </div>
        </div>

        {/* 🧠 Live Route Decision Intelligence & Traffic Analysis */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-purple-50/90 to-amber-50/90 p-5">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                🧠 Route Decision Intelligence: Shortest vs. Fastest Route Comparison
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed">
                <strong>Route 1 (Shortest Route)</strong> covers <strong>{routes[0].distanceKm} km</strong> but encounters 2 urban traffic signals adding <strong>+2 min delay</strong> (~{routes[0].etaMinutes} min ETA).
                Conversely, <strong>Route 2 (Fastest Route)</strong> utilizes the elevated corridor with smart green light synchronization, reducing total transit to <strong>~{routes[1].etaMinutes} minutes</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* 🚦 Real-time Route Options Selector (Shortest Route vs Fastest Route vs Bypass) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-red-600" />
                Select Route (Color-Coded Traffic Telemetry):
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Live Traffic Updated 30s ago
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {routes.map((r) => {
                const isSelected = r.id === selectedRouteId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`rounded-2xl border p-4 text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-md'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Top Tag */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-2xs"
                        style={{ backgroundColor: r.trafficColor }}
                      >
                        {r.tag}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          Active
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-900 leading-snug">{r.name}</div>
                    
                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Distance:</span>
                        <strong className="text-slate-900">{r.distanceKm} km</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Transit Time:</span>
                        <strong className="text-amber-700 text-sm">~{r.etaMinutes} min</strong>
                      </div>
                    </div>

                    {/* Traffic delay indicator */}
                    <div className="mt-2 text-[10px] flex items-center justify-between font-semibold" style={{ color: r.trafficColor }}>
                      <span>{r.trafficStatus}</span>
                      <span>{r.congestionIndex}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Leaflet Map Canvas with Traffic Routes */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-inner relative">
            <div
              ref={mapContainerRef}
              className="h-80 sm:h-96 w-full z-0 bg-slate-100"
              style={{ minHeight: '340px' }}
            />

            {/* Map Overlay Badge */}
            <div className="absolute top-3 left-3 z-10 rounded-2xl bg-slate-900/90 backdrop-blur-md px-4 py-2.5 text-white text-xs shadow-lg max-w-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full animate-ping" style={{ backgroundColor: activeRoute.trafficColor }} />
                <span className="font-bold">{activeRoute.name}</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                {activeRoute.description}
              </p>
            </div>

            {/* Traffic Legend */}
            <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-slate-800 shadow-md flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Clear Flow</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Moderate (Shortest)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Choke Point</span>
            </div>
          </div>

          {/* Turn-by-Turn Emergency Directions */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Turn-by-Turn Route Guidance ({activeRoute.name})</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                {activeRoute.trafficDelay}
              </span>
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Depart from {searchCriteria.locationLabel || 'Pickup Location'} towards main avenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>
                  {activeRoute.id === 'fastest'
                    ? 'Merge onto Emergency Flyover Ramp (Green Signal Synchronization Active)'
                    : 'Continue along Central Arterial (Caution: moderate choke point near circle)'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Arrive at {h.name} — Gate 2 (Emergency Trauma Wing Triage Desk)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('details')}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Hospital Details
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('ambulance')}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                <Ambulance className="h-4 w-4" />
                Dispatch Ambulance
              </button>
              <button
                onClick={() => openBookingModal(h)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:brightness-105"
              >
                Book Admission Slot (₹0 Cashless)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
