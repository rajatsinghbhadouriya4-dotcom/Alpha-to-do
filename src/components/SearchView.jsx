import React from 'react';
import { useApp } from '../context/AppContext';
import { Brain, Flame, HeartPulse, Activity, AlertCircle, Shield, ArrowRight, MapPin } from 'lucide-react';

const EMERGENCY_TYPES = [
  { id: 'Accident Emergency', label: 'Accident & Trauma', icon: '🚨', desc: 'Fractures, lacerations, bleeding, impact injuries' },
  { id: 'Cardiac Emergency', label: 'Cardiac / Chest Pain', icon: '❤️', desc: 'Heart attack symptoms, severe palpitations, sudden chest tightness' },
  { id: 'Respiratory Emergency', label: 'Respiratory Distress', icon: '🫁', desc: 'Acute asthma, breathing difficulty, low SPO2' },
  { id: 'Stroke / Neuro', label: 'Stroke / Neurological', icon: '🧠', desc: 'Sudden weakness, facial droop, slurred speech, seizures' },
  { id: 'General Emergency', label: 'General Acute Emergency', icon: '🏥', desc: 'High fever, poisoning, acute abdomen, pediatric emergencies' },
];

const SCHEMES = [
  'Ayushman Bharat (PM-JAY)',
  'CGHS (Central Govt Health Scheme)',
  'Star Health Allied Insurance',
  'HDFC ERGO Health Suraksha',
  'ECHS (Armed Forces)',
  'All Schemes',
];

export default function SearchView() {
  const { searchCriteria, setSearchCriteria, navigate } = useApp();

  function handleSubmit(e) {
    e.preventDefault();
    navigate('decision');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-red-950 p-6 sm:p-8 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 ring-1 ring-red-500/30 mb-2">
            <Brain className="h-3.5 w-3.5" />
            Decision Intelligence Intake
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Select Emergency Requirements</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Input the patient's critical requirements. The Decision Intelligence engine will analyze
            real-time bed availability, distance, traffic, and specialist readiness to assist your choice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Emergency Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              1. Type of Medical Emergency
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {EMERGENCY_TYPES.map((type) => {
                const selected = searchCriteria.emergencyType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSearchCriteria({ ...searchCriteria, emergencyType: type.id })}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-red-500 bg-red-50/60 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{type.icon}</span>
                    <div>
                      <div className={`font-bold text-sm ${selected ? 'text-red-900' : 'text-slate-900'}`}>
                        {type.label}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Critical Facilities Needed */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              2. Specific Clinical Facilities Required
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label
                className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                  searchCriteria.emergencyRequired
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={searchCriteria.emergencyRequired}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, emergencyRequired: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-xs font-bold">Emergency ER Ready</span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                  searchCriteria.icuRequired
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={searchCriteria.icuRequired}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, icuRequired: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-xs font-bold">ICU Bed Required</span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                  searchCriteria.facility === 'Ventilator'
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={searchCriteria.facility === 'Ventilator'}
                  onChange={(e) =>
                    setSearchCriteria({
                      ...searchCriteria,
                      facility: e.target.checked ? 'Ventilator' : 'Emergency',
                    })
                  }
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
                <span className="text-xs font-bold">Ventilator / Oxygen</span>
              </label>
            </div>
          </div>

          {/* Insurance Scheme Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              3. Health Insurance / Government Scheme
            </label>
            <select
              value={searchCriteria.preferredCard || 'Ayushman Bharat (PM-JAY)'}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, preferredCard: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {SCHEMES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Location details */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600 shrink-0" />
              <span>Current Search Origin: <strong>{searchCriteria.locationLabel}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="text-red-600 font-semibold hover:underline"
            >
              Edit Origin
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-4 text-base font-bold text-white shadow-xl shadow-red-500/25 hover:brightness-105 hover:-translate-y-0.5 transition-all"
            >
              <Brain className="h-5 w-5" />
              Analyze With Decision Intelligence
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
