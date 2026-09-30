import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeHospitalOptions } from '../lib/decisionIntelligence';
import { getHospitalTariff } from '../lib/pricingData';
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Clock,
  HeartPulse,
  Navigation,
  Ambulance,
  FileText,
  BarChart3,
  Building2,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';

export default function DecisionIntelligenceView() {
  const {
    hospitals,
    searchCriteria,
    setSelectedHospital,
    navigate,
    generateEmergencySummary,
    openBookingModal,
  } = useApp();

  const [imgErrors, setImgErrors] = useState({});

  // Run the Decision Intelligence Engine
  const analyzedResults = analyzeHospitalOptions(hospitals, searchCriteria);

  function handleSelectHospital(hospital, targetPage = 'details') {
    setSelectedHospital(hospital);
    navigate(targetPage);
  }

  function handleImageError(id) {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24">
      {/* 1. Header & Centerpiece Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-100 text-red-700 px-3.5 py-1 text-xs font-bold ring-1 ring-red-200 mb-2">
          <Brain className="h-4 w-4" />
          AI & Decision Intelligence Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          🧠 Emergency Decision Intelligence
        </h1>
        <p className="text-sm font-semibold text-red-600 mt-1">
          "Turn emergency information into actionable insights."
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-500 leading-relaxed">
          The analysis below synthesizes clinical bed readiness, doctor duty status, transit time, and scheme coverage.
          No hospital is labeled "the best" — the data provides transparent factors so you can decide with confidence.
        </p>
      </div>

      {/* 2. Visual Decision Pipeline Component */}
      <section className="mb-10 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4 relative">
          {/* Step 1: User Needs */}
          <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
              1. User Needs
            </span>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {searchCriteria.emergencyType || 'Accident Emergency'}
              </div>
              <div className="text-[11px] text-slate-600">
                • {searchCriteria.icuRequired ? 'ICU Bed Required' : 'ICU Optional'}
              </div>
              <div className="text-[11px] text-slate-600">
                • {searchCriteria.emergencyRequired ? 'Emergency ER Needed' : 'Standard Admission'}
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                • Scheme: {searchCriteria.preferredCard || 'Ayushman Bharat'}
              </div>
            </div>
          </div>

          {/* Step 2: Available Information */}
          <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
              2. Live Backend Data
            </span>
            <div className="space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span>🏥 Hospitals:</span>
                <span className="font-bold">{hospitals.length} Tracked</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🛏 Beds & ICU:</span>
                <span className="font-bold text-emerald-700">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span>👨⚕️ Doctors:</span>
                <span className="font-bold">On-Duty Roster</span>
              </div>
              <div className="flex items-center justify-between">
                <span>🚑 Ambulances:</span>
                <span className="font-bold">Fleet Standby</span>
              </div>
            </div>
          </div>

          {/* Step 3: Decision Insights */}
          <div className="rounded-2xl bg-purple-50/70 border border-purple-100 p-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
              3. Decision Insights
            </span>
            <p className="text-xs text-slate-700 leading-snug">
              Multivariate matching across transit distance, specialized ICU ports, verified doctor readiness, and cashless scheme acceptance.
            </p>
            <div className="mt-2 text-[10px] font-bold text-purple-700 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Transparent Explanations
            </div>
          </div>

          {/* Step 4: User Decision */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-white px-2 py-0.5 rounded shadow-xs inline-block mb-2">
                4. User Decision
              </span>
              <p className="text-xs text-slate-700 leading-tight">
                Review analyzed options, inspect transparent tariffs, or reserve emergency admission.
              </p>
            </div>
            <button
              onClick={() => navigate('compare')}
              className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Compare All
            </button>
          </div>
        </div>
      </section>

      {/* 3. Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>Analyzed Results:</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-800">
            {analyzedResults.length} Hospital Options
          </span>
          <span className="text-slate-400 font-normal">
            (From: {searchCriteria.locationLabel || 'Bengaluru'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('home')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Change Origin Area
          </button>
          <button
            onClick={() => navigate('compare')}
            className="flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Decision Comparison Matrix
          </button>
        </div>
      </div>

      {/* 4. Analyzed Hospital Cards List */}
      <div className="space-y-6">
        {analyzedResults.map((item, index) => {
          const h = item.hospital;
          const beds = h.beds || {};
          const isFirst = index === 0;
          const tariff = getHospitalTariff(h.id);

          return (
            <div
              key={h.id}
              className={`overflow-hidden rounded-3xl border transition-all hover:shadow-xl ${
                isFirst
                  ? 'border-red-300 bg-white shadow-md ring-1 ring-red-200/50'
                  : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <div className="grid md:grid-cols-12 gap-0">
                {/* Hospital Photo with Safe Fallback */}
                <div className="md:col-span-4 relative bg-slate-100 min-h-[220px] md:min-h-full">
                  {!imgErrors[h.id] && h.image_url ? (
                    <img
                      src={h.image_url}
                      alt={h.name}
                      onError={() => handleImageError(h.id)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-100">
                      <Building2 className="h-10 w-10 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-slate-700">🏥 Hospital Image Unavailable</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Facility records active</span>
                    </div>
                  )}

                  {/* Status Overlay Pill */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md ${
                        h.emergency_status === 'open'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      {h.emergency_status === 'open' ? 'ER Open 24/7' : 'ER High Load'}
                    </span>
                  </div>

                  {/* Distance / ETA pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-slate-900/85 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-red-400" />
                      {item.distance}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-300">
                      <Clock className="h-3.5 w-3.5" />
                      ~{item.eta} transit
                    </span>
                  </div>
                </div>

                {/* Hospital Details & Decision Insights */}
                <div className="md:col-span-8 p-6 flex flex-col justify-between">
                  <div>
                    {/* Header: Name, Rating, Address */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900">{h.name}</h2>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                            ⭐ {h.rating || 4.7}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          {h.address}
                        </p>
                      </div>

                      {/* Cashless badge */}
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Cashless PM-JAY / Star
                      </span>
                    </div>

                    {/* 🧠 Highlighted Decision Insight Box */}
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-red-50/80 to-amber-50/80 border border-red-100 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-800 mb-1">
                        <Brain className="h-4 w-4 text-red-600 shrink-0" />
                        <span>Decision Insight</span>
                      </div>
                      <blockquote className="text-xs font-medium text-slate-800 italic leading-relaxed">
                        "{item.decisionInsight}"
                      </blockquote>
                    </div>

                    {/* Matching Factors Checklist */}
                    <div className="mt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Contributing Factors Verified:
                      </p>
                      <div className="grid gap-1 sm:grid-cols-2 text-xs">
                        {item.matchingFactors.map((factor, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-[11px] font-medium truncate">{factor}</span>
                          </div>
                        ))}
                      </div>

                      {item.missingFactors.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.missingFactors.map((miss, mIdx) => (
                            <div key={mIdx} className="flex items-center gap-1.5 text-amber-800 text-[11px]">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span>{miss}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 💰 Transparent Charges & Booking Amount Bar */}
                    <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-slate-700">
                        <div className="flex items-center gap-3">
                          <span>Doctor ER: <strong>₹{tariff.doctorConsultation}</strong></span>
                          <span>General Bed: <strong>₹{tariff.generalBedPerDay}/d</strong></span>
                          <span>ICU Bed: <strong>₹{tariff.icuBedPerDay}/d</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Booking Advance:</span>
                          <span className="font-extrabold text-emerald-700">
                            ₹0 (Cashless Pre-Auth) / ₹{tariff.advanceDepositGeneral}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Bed Counters */}
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        <span className="text-[10px] text-slate-500 block">General</span>
                        <span className="font-bold text-sm text-slate-900">{beds.general_available || 0}</span>
                      </div>
                      <div className="rounded-xl border border-red-200 bg-red-50 p-2">
                        <span className="text-[10px] text-red-700 font-semibold block">ICU Beds</span>
                        <span className="font-bold text-sm text-red-900">{beds.icu_available || 0}</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        <span className="text-[10px] text-slate-500 block">ER Ready</span>
                        <span className="font-bold text-sm text-slate-900">{beds.emergency_available || 0}</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        <span className="text-[10px] text-slate-500 block">Ventilators</span>
                        <span className="font-bold text-sm text-slate-900">{beds.ventilator_available || 0}</span>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-2 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-500 block">Oxygen</span>
                        <span className="font-bold text-sm text-slate-900">{beds.oxygen_available || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* USER DECISION Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleSelectHospital(h, 'details')}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Hospital Details
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSelectHospital(h, 'route')}
                        className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Navigate
                      </button>

                      <button
                        onClick={() => {
                          setSelectedHospital(h);
                          navigate('tracker');
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                      >
                        <Ambulance className="h-3.5 w-3.5" />
                        Dispatch Ambulance
                      </button>

                      {/* 💰 BOOK ADMISSION SLOT BUTTON */}
                      <button
                        onClick={() => openBookingModal(h)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-red-500/25 hover:brightness-105 transition-all"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Book ER Slot / Admission
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
