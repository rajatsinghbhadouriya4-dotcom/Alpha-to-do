import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Ambulance,
  Phone,
  Clock,
  MapPin,
  ShieldCheck,
  Radio,
  ArrowRight,
  HeartPulse
} from 'lucide-react';

export default function AmbulanceView() {
  const { hospitals, setSelectedAmbulance, setSelectedHospital, navigate } = useApp();

  // Aggregate ambulances across all hospitals
  const allAmbulances = hospitals.flatMap((h) =>
    (h.ambulances || []).map((amb) => ({
      ...amb,
      hospital: h,
    }))
  );

  function handleBookAmbulance(amb) {
    setSelectedAmbulance(amb);
    setSelectedHospital(amb.hospital);
    navigate('tracker');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-bold ring-1 ring-sky-200 mb-2">
          <Ambulance className="h-4 w-4" />
          Emergency Response Fleet
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Request Emergency Ambulance
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
          Nearby ALS, BLS, and Mobile ICU units with real-time transit telemetry and traffic intelligence.
        </p>
      </div>

      {/* Fleet Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {allAmbulances.map((amb, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{amb.type}</h3>
                    <p className="text-xs text-slate-500">{amb.hospital?.name}</p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    amb.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {amb.status || 'Available'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block">Estimated Arrival</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-red-500" />
                    ~{amb.eta || '6 min'}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block">Distance Away</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-sky-500" />
                    {amb.distance || '1.8 km'}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                Driver: <strong>{amb.driver_name || 'Emergency Paramedic'}</strong> • Registration: {amb.vehicle_number || 'KA-01-EA-9911'}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Driver
              </a>
              <button
                onClick={() => handleBookAmbulance(amb)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-red-500/20 hover:brightness-105"
              >
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Dispatch & Live Track
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
