import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getEmergencyHistory } from '../lib/supabase';
import {
  Clock,
  Building2,
  Ambulance,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function EmergencyHistoryView() {
  const { user, openAuthModal, generateEmergencySummary, hospitals, navigate } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const data = await getEmergencyHistory(user?.id);
        if (data && data.length > 0) {
          setHistory(data);
        } else {
          // If no past records, provide sample completed emergency record
          setHistory([
            {
              id: 'req-demo-1',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              emergency_type: 'Accident Emergency',
              status: 'Completed',
              hospital_name: 'CityCare Apex Trauma & Emergency Hospital',
              hospital_address: '45 Hospital Boulevard, Central Ring Rd',
              ambulance_type: 'ALS Ambulance (Advanced Life Support)',
            }
          ]);
        }
      } catch (e) {
        console.warn('Failed to load history:', e);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user]);

  function handleViewSummary(req) {
    const hosp = hospitals.find(h => h.id === req.hospital_id || h.name === req.hospital_name) || hospitals[0];
    generateEmergencySummary(hosp);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-800 px-3 py-1 text-xs font-bold mb-2">
          <Clock className="h-4 w-4 text-red-600" />
          Patient Records
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Emergency History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical log of requested triage dispatches, selected hospitals, and generated summaries.
        </p>
      </div>

      {!user && (
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Sign in to access your permanent Supabase emergency triage logs across devices.</span>
          </div>
          <button
            onClick={() => openAuthModal('signin')}
            className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0 ml-2"
          >
            Sign In
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500">Loading emergency history...</div>
      ) : (
        <div className="space-y-4">
          {history.map((req) => (
            <div
              key={req.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400">
                    {new Date(req.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {req.status || 'Completed'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{req.emergency_type}</h3>

                <div className="mt-2 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Hospital: <strong>{req.hospital?.name || req.hospital_name || 'CityCare Apex Trauma'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ambulance className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span>Ambulance: <strong>{req.ambulance?.type || req.ambulance_type || 'ALS Ambulance'}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleViewSummary(req)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs shrink-0"
              >
                <FileText className="h-3.5 w-3.5 text-red-400" />
                View Summary
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
