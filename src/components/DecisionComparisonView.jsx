import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeHospitalOptions, buildComparisonMatrix } from '../lib/decisionIntelligence';
import {
  BarChart3,
  Brain,
  Building2,
  Navigation,
  Ambulance,
  FileText,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export default function DecisionComparisonView() {
  const { hospitals, searchCriteria, setSelectedHospital, navigate, generateEmergencySummary } = useApp();
  const [imgErrors, setImgErrors] = useState({});

  const analyzed = analyzeHospitalOptions(hospitals, searchCriteria);
  const matrix = buildComparisonMatrix(analyzed, searchCriteria.preferredCard);

  function handleImageError(id) {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  }

  function handleChooseHospital(h) {
    setSelectedHospital(h);
    navigate('details');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-bold ring-1 ring-red-200 mb-2">
          <BarChart3 className="h-4 w-4" />
          Multi-Hospital Analytical Matrix
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Decision Comparison Table
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">
          Side-by-side factor matrix comparing clinical availability, distance, transit windows, and scheme acceptance.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-bold text-slate-900 w-44 sticky left-0 bg-slate-50 z-10">
                  Factor
                </th>
                {matrix.map((h) => (
                  <th key={h.id} className="p-4 min-w-[200px] text-center font-bold text-slate-900 border-l border-slate-100">
                    <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 mb-2 relative">
                      {!imgErrors[h.id] && h.image_url ? (
                        <img
                          src={h.image_url}
                          alt={h.name}
                          onError={() => handleImageError(h.id)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 text-[10px] p-2">
                          <Building2 className="h-6 w-6 mb-1 text-slate-300" />
                          <span>🏥 Image Unavailable</span>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-slate-900 text-xs leading-tight line-clamp-2">
                      {h.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">⭐ {h.rating} rating</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Distance */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  Distance
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-semibold text-slate-800 border-l border-slate-100">
                    {h.distance}
                  </td>
                ))}
              </tr>

              {/* ETA */}
              <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  Estimated Travel Time (ETA)
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold text-amber-700 border-l border-slate-100">
                    ~{h.eta}
                  </td>
                ))}
              </tr>

              {/* Emergency Department */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  Emergency Department
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold border-l border-slate-100">
                    {h.emergencyStatus}
                  </td>
                ))}
              </tr>

              {/* ICU Availability */}
              <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  ICU Bed Availability
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold border-l border-slate-100">
                    {h.icuStatus}
                  </td>
                ))}
              </tr>

              {/* General Beds */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  General Bed Capacity
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold border-l border-slate-100">
                    {h.bedsStatus}
                  </td>
                ))}
              </tr>

              {/* Doctor Availability */}
              <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  Emergency Doctor
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold border-l border-slate-100">
                    {h.doctorStatus}
                  </td>
                ))}
              </tr>

              {/* Ambulance Availability */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  Ambulance Fleet
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold border-l border-slate-100">
                    {h.ambulanceStatus}
                  </td>
                ))}
              </tr>

              {/* Health Scheme Card */}
              <tr className="hover:bg-slate-50/50 bg-slate-50/30">
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  {searchCriteria.preferredCard || 'Health Scheme'}
                </td>
                {matrix.map((h) => (
                  <td key={h.id} className="p-4 text-center font-bold border-l border-slate-100">
                    {h.cardStatus}
                  </td>
                ))}
              </tr>

              {/* Actions row */}
              <tr>
                <td className="p-4 font-bold text-slate-700 sticky left-0 bg-white z-10 shadow-xs">
                  Select Decision
                </td>
                {analyzed.map((item) => (
                  <td key={item.hospital.id} className="p-4 text-center border-l border-slate-100 space-y-2">
                    <button
                      onClick={() => handleChooseHospital(item.hospital)}
                      className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-2 px-3 text-xs font-bold text-white hover:brightness-105 shadow-sm"
                    >
                      Select Hospital
                    </button>
                    <button
                      onClick={() => generateEmergencySummary(item.hospital)}
                      className="w-full rounded-xl border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Generate Summary
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🧠 Why this information matters Section */}
        <div className="border-t border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-red-400" />
            <h3 className="text-base font-bold">🧠 Why this information matters</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed max-w-4xl">
            <p>
              • <strong>Transit Time vs. Critical Capability:</strong> While proximity reduces travel duration, arriving at a facility without an unoccupied ICU bed requires secondary inter-hospital transfer, which historically adds 45–90 critical minutes.
            </p>
            <p>
              • <strong>Specialist Staffing:</strong> Facilities marked 🟢 On Duty have active emergency surgeons or critical care physicians present in the triage bay, eliminating round-call delays.
            </p>
            <p>
              • <strong>Scheme Pre-Authorization:</strong> Verified scheme acceptance ensures emergency admission without upfront financial deposit friction at the billing desk.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Data source: Live Supabase Triage Database</span>
            <span>Final triage decision remains with the patient & attending crew</span>
          </div>
        </div>
      </div>
    </div>
  );
}
