import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateBookingEstimate } from '../lib/pricingData';
import {
  X,
  CreditCard,
  ShieldCheck,
  Building2,
  Ambulance,
  HeartPulse,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Phone,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function BookingModal({ isOpen, onClose, hospital, onBookingComplete }) {
  const { profile, searchCriteria, generateEmergencySummary } = useApp();

  const [bedType, setBedType] = useState(searchCriteria.icuRequired ? 'icu' : 'general');
  const [needAmbulance, setNeedAmbulance] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(
    profile?.preferred_card || searchCriteria.preferredCard || 'Ayushman Bharat (PM-JAY)'
  );
  const [patientName, setPatientName] = useState(profile?.name || 'Rahul Sharma');
  const [patientPhone, setPatientPhone] = useState(profile?.phone || '+91 98765 43210');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('XXXX-XXXX-8942');

  if (!isOpen || !hospital) return null;

  const estimate = calculateBookingEstimate({
    hospitalId: hospital.id,
    bedType,
    needAmbulance,
    distanceKm: hospital.distance_km || 2.1,
    scheme: selectedScheme,
  });

  function handleConfirmBooking() {
    // Generate official summary with pricing & token
    const summary = {
      hospital,
      bedType,
      needAmbulance,
      patientName,
      patientPhone,
      idProofType,
      idNumber,
      selectedScheme,
      pricing: estimate,
      consultant: {
        name: 'Dr. Priya Sharma, MD',
        specialty: 'Head of Emergency & Critical Care',
        desk: 'Triage Room 102 (Gate 2)',
        contact: hospital.emergency_phone || hospital.phone,
      }
    };

    if (onBookingComplete) {
      onBookingComplete(summary);
    } else {
      generateEmergencySummary(hospital);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-bold ring-1 ring-red-200 mb-2">
            <CreditCard className="h-3.5 w-3.5" />
            Transparent Emergency Booking & Triage Registration
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Emergency Admission & Booking Charges
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hospital: <strong>{hospital.name}</strong> • Address: {hospital.address}
          </p>
        </div>

        {/* Patient Details Summary */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-5 text-xs space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
            Patient & ID Verification
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Contact Phone</label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Govt ID Proof Type</label>
              <select
                value={idProofType}
                onChange={(e) => setIdProofType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option>Aadhaar Card</option>
                <option>ABHA Health ID</option>
                <option>Voter ID</option>
                <option>Driving License</option>
                <option>Passport</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">ID Document Number</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Service Options: Bed & Ambulance */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Required Bed Type:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBedType('general')}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  bedType === 'general'
                    ? 'border-red-500 bg-red-50/60 ring-2 ring-red-500/20 text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold">General Emergency Bed</div>
                <div className="text-[11px] text-slate-500 mt-0.5">₹{estimate.tariff.generalBedPerDay} / 24 hrs</div>
              </button>

              <button
                type="button"
                onClick={() => setBedType('icu')}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  bedType === 'icu'
                    ? 'border-red-500 bg-red-50/60 ring-2 ring-red-500/20 text-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-red-900">Critical ICU Bed</div>
                <div className="text-[11px] text-slate-500 mt-0.5">₹{estimate.tariff.icuBedPerDay} / 24 hrs (Ventilator Port)</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 bg-slate-50 text-xs">
            <div className="flex items-center gap-2.5">
              <Ambulance className="h-4 w-4 text-sky-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Dispatch Dedicated Ambulance</span>
                <span className="text-[11px] text-slate-500">ALS Rapid cardiac life support with paramedic</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={needAmbulance}
              onChange={(e) => setNeedAmbulance(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Health Scheme / Cashless Card:
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option>Ayushman Bharat (PM-JAY)</option>
              <option>CGHS (Central Govt Health Scheme)</option>
              <option>Star Health Allied Insurance</option>
              <option>HDFC ERGO Health Suraksha</option>
              <option>ECHS (Armed Forces)</option>
              <option>Self-Paying (No Insurance)</option>
            </select>
          </div>
        </div>

        {/* 💰 ITEM-WISE CHARGES BREAKDOWN */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-700 text-xs mb-3 flex items-center justify-between">
            <span>Itemized Emergency Tariff Breakdown</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
              Verified Rates
            </span>
          </h4>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Doctor ER Consultation:</span>
              <span className="font-semibold text-slate-900">₹{estimate.consultation}</span>
            </div>
            <div className="flex justify-between">
              <span>ER Triage / Trauma Entry:</span>
              <span className="font-semibold text-slate-900">₹{estimate.erEntry}</span>
            </div>
            <div className="flex justify-between">
              <span>{bedType === 'icu' ? 'ICU Bed (Per 24h):' : 'General Emergency Bed (Per 24h):'}</span>
              <span className="font-semibold text-slate-900">₹{estimate.bedCost}</span>
            </div>
            {estimate.ventilatorCost > 0 && (
              <div className="flex justify-between">
                <span>Advanced Ventilator Port:</span>
                <span className="font-semibold text-slate-900">₹{estimate.ventilatorCost}</span>
              </div>
            )}
            {needAmbulance && (
              <div className="flex justify-between">
                <span>Ambulance Dispatch (~{hospital.distance_km || 2.1} km):</span>
                <span className="font-semibold text-slate-900">₹{estimate.ambulanceCost}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-900">
            <span>Estimated 24h Treatment Subtotal:</span>
            <span>₹{estimate.subtotalEstimate}</span>
          </div>

          {/* Booking Advance / Deposit Box */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 p-3.5 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
                Booking Amount / Advance Payable Now:
              </span>
              <div className="text-xl font-black text-amber-400">
                {estimate.isCashlessScheme ? '₹0 (100% Cashless)' : `₹${estimate.finalPayableAdvance}`}
              </div>
              <span className="text-[10px] text-slate-300 mt-0.5 block">
                {estimate.insuranceCoverageNote}
              </span>
            </div>

            {estimate.isCashlessScheme && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleConfirmBooking}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-500/25 hover:brightness-105 transition-all"
        >
          <FileText className="h-4 w-4" />
          Confirm Admission & Generate Appointment Token
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
