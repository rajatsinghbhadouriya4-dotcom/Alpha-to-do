import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  CheckCircle,
  AlertTriangle,
  Building2,
  Ambulance,
  Phone,
  ShieldCheck,
  ArrowLeft,
  CreditCard,
  QrCode,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function EmergencySummaryReceipt() {
  const { activeEmergencySummary, selectedHospital, profile, navigate } = useApp();

  const data = activeEmergencySummary || {
    id: 'ER-982142',
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    patientName: profile?.name || 'Rahul Sharma',
    patientPhone: profile?.phone || '+91 98765 43210',
    emergencyContact: profile?.emergency_contact || '+91 98765 00000',
    bloodGroup: profile?.blood_group || 'O+ Positive',
    idProofType: 'Aadhaar Card',
    idNumber: 'XXXX-XXXX-8942',
    emergencyType: 'Accident Emergency',
    hospitalName: selectedHospital?.name || 'CityCare Apex Trauma & Emergency Hospital',
    hospitalAddress: selectedHospital?.address || '45 Hospital Boulevard, Central Ring Rd',
    hospitalPhone: selectedHospital?.emergency_phone || '+91 80 4912 3999',
    distance: selectedHospital?.distance_km ? `${selectedHospital.distance_km} km` : '2.1 km',
    travelTime: selectedHospital?.eta_minutes ? `${selectedHospital.eta_minutes} minutes` : '8 minutes',
    emergencyStatus: 'Available',
    icuStatus: 'Available (5 beds ready)',
    bedStatus: 'Available (18 beds ready)',
    doctorStatus: 'Assigned: Dr. Priya Sharma, MD (ER Head)',
    acceptedCard: 'Ayushman Bharat (PM-JAY)',
    ambulanceType: 'ALS Ambulance (Advanced Cardiac Life Support)',
    ambulanceEta: '6 minutes',
    pricing: {
      consultation: 750,
      erEntry: 400,
      bedCost: 8500,
      ambulanceCost: 850,
      subtotalEstimate: 10500,
      isCashlessScheme: true,
      finalPayableAdvance: 0,
      insuranceCoverageNote: '100% Cashless Pre-Authorization under Ayushman Bharat (PM-JAY). Zero upfront deposit.',
    },
    decisionFactors: [
      '✓ ICU capacity verified in real time',
      '✓ Emergency trauma department open',
      '✓ On-duty critical care consultant pre-notified',
      '✓ Required health card listed in verified registry',
      '✓ Shortest estimated travel time corridor selected',
    ]
  };

  const pricing = data.pricing || {
    consultation: 750,
    erEntry: 400,
    bedCost: 8500,
    ambulanceCost: 850,
    subtotalEstimate: 10500,
    isCashlessScheme: true,
    finalPayableAdvance: 0,
    insuranceCoverageNote: '100% Cashless Pre-Authorization under Ayushman Bharat. Zero upfront deposit required.',
  };

  function handlePrint() {
    window.print();
  }

  function handleDownloadText() {
    const content = `
=====================================================
EMERGENCYCARE — DECISION INTELLIGENCE EMERGENCY SUMMARY & APPOINTMENT LETTER
Document Ref: ${data.id}
Date & Time: ${data.timestamp}
=====================================================

PATIENT INFORMATION:
Name: ${data.patientName}
Phone: ${data.patientPhone}
Emergency Contact: ${data.emergencyContact}
Blood Group: ${data.bloodGroup || 'Not Specified'}
ID Proof: ${data.idProofType || 'Aadhaar'} (${data.idNumber || 'Verified'})

EMERGENCY LOGISTICS:
Category: ${data.emergencyType}
Selected Hospital: ${data.hospitalName}
Hospital Address: ${data.hospitalAddress}
Hospital ER Desk: ${data.hospitalPhone}
Transit Window: ${data.travelTime} (${data.distance})

ASSIGNED EMERGENCY CONSULTANT:
Physician: Dr. Priya Sharma, MD (Head of Emergency & Critical Care)
Location: Triage Bay 102, Gate 2 (Trauma Wing)

RESOURCE AVAILABILITY:
Emergency Department: ${data.emergencyStatus}
ICU Bed: ${data.icuStatus}
General Bed: ${data.bedStatus}
Assigned Ambulance: ${data.ambulanceType} (ETA: ${data.ambulanceEta})

TRANSPARENT TARIFF & BOOKING CHARGES BREAKDOWN:
- Doctor ER Consultation: ₹${pricing.consultation}
- ER Triage Registration: ₹${pricing.erEntry}
- Bed / Critical Care: ₹${pricing.bedCost}
- Ambulance Dispatch: ₹${pricing.ambulanceCost}
- Estimated Initial Subtotal: ₹${pricing.subtotalEstimate}
- Cashless Health Scheme: ${data.acceptedCard}
- BOOKING ADVANCE PAYABLE: ${pricing.isCashlessScheme ? '₹0 (100% Cashless Admission)' : '₹' + pricing.finalPayableAdvance}
- Note: ${pricing.insuranceCoverageNote}

DECISION FACTORS VERIFIED:
${data.decisionFactors.join('\n')}

IMPORTANT NOTICE:
Information may change due to real-time traffic and fluctuating emergency triage loads.
Please confirm directly with the hospital upon departure.
* This document is an INFORMATION & TRIAGE ADMISSION SUMMARY, not a payment invoice.
=====================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EmergencySummary_${data.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={() => navigate('decision')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decision Intelligence
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadText}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Download Summary
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Official Emergency Summary Document Layout */}
      <div className="print-only-container overflow-hidden rounded-3xl border border-slate-300 bg-white p-8 sm:p-12 shadow-xl text-slate-900 font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                EMERGENCY<span className="text-red-600">CARE</span>
              </span>
              <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Official Appointment & Summary Letter
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-600 mt-0.5">
              Emergency Decision Intelligence & Triage Token
            </h2>
            <p className="text-[11px] text-slate-500">
              Token ID: <strong className="font-mono text-red-600 font-bold">{data.id}</strong> • Generated: {data.timestamp}
            </p>
          </div>

          <div className="text-right sm:block hidden">
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Cashless Pre-Auth Active
            </div>
          </div>
        </div>

        {/* Core Information Grid */}
        <div className="space-y-6 text-xs">
          {/* Patient Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2">
              Patient / User Information & ID Proof
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">Name:</span>
                <strong className="text-slate-900 text-sm">{data.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Phone:</span>
                <strong className="text-slate-900">{data.patientPhone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Group:</span>
                <strong className="text-red-600 font-bold">{data.bloodGroup || 'O+ Positive'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">ID Verification:</span>
                <strong className="text-slate-900">{data.idProofType || 'Aadhaar'} ({data.idNumber || 'Verified'})</strong>
              </div>
            </div>
          </div>

          {/* Emergency & Destination */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-2xl">
              <span className="text-slate-500 block font-semibold text-[10px] uppercase">
                Emergency Category:
              </span>
              <strong className="text-red-700 text-sm block mt-0.5">{data.emergencyType}</strong>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl">
              <span className="text-slate-500 block font-semibold text-[10px] uppercase">
                Accepted Health Scheme:
              </span>
              <strong className="text-emerald-800 text-sm block mt-0.5">{data.acceptedCard}</strong>
            </div>
          </div>

          {/* Assigned Consultant Box */}
          <div className="border border-purple-200 bg-purple-50/50 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-200 text-purple-800 font-bold">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                  Assigned Emergency Consultant & Triage Doctor
                </span>
                <div className="font-bold text-sm text-purple-950">
                  Dr. Priya Sharma, MD — Head of Emergency & Critical Care
                </div>
                <div className="text-[11px] text-purple-700">
                  Arrival Desk: Gate 2, Trauma Room 102 • Direct ER Ext: {data.hospitalPhone}
                </div>
              </div>
            </div>
            <a
              href="tel:112"
              className="no-print rounded-xl bg-purple-700 text-white font-bold px-3 py-1.5 text-xs hover:bg-purple-800 transition-colors cursor-pointer"
            >
              Call Consultant
            </a>
          </div>

          {/* Hospital Logistics */}
          <div className="border border-slate-200 p-5 rounded-2xl space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
              Selected Hospital Destination
            </h3>
            <div>
              <div className="text-base font-bold text-slate-900">{data.hospitalName}</div>
              <div className="text-slate-600 mt-0.5">{data.hospitalAddress}</div>
              <div className="text-red-600 font-bold mt-1">ER Desk: {data.hospitalPhone}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div>
                <span className="text-slate-400 block">Distance:</span>
                <strong className="text-slate-800">{data.distance}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Travel Time:</span>
                <strong className="text-amber-700">~{data.travelTime}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Emergency ER:</span>
                <strong className="text-emerald-700">{data.emergencyStatus}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">ICU Bed:</span>
                <strong className="text-emerald-700">{data.icuStatus}</strong>
              </div>
            </div>
          </div>

          {/* 💰 ITEM-WISE CHARGES & BOOKING AMOUNT BREAKDOWN */}
          <div className="border border-slate-200 p-5 rounded-2xl bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-red-600" />
                Transparent Emergency Tariff & Booking Receipt
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                NABH Tariff Benchmark
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Emergency Doctor Consultation:</span>
                <span className="font-semibold text-slate-900">₹{pricing.consultation}</span>
              </div>
              <div className="flex justify-between">
                <span>ER Trauma & Triage Entry:</span>
                <span className="font-semibold text-slate-900">₹{pricing.erEntry}</span>
              </div>
              <div className="flex justify-between">
                <span>Emergency Bed / ICU Charge (24h):</span>
                <span className="font-semibold text-slate-900">₹{pricing.bedCost}</span>
              </div>
              {pricing.ambulanceCost > 0 && (
                <div className="flex justify-between">
                  <span>Ambulance Dispatch Charge (~{data.distance}):</span>
                  <span className="font-semibold text-slate-900">₹{pricing.ambulanceCost}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-xs">
              <span>Estimated 24-Hour Initial Treatment:</span>
              <span>₹{pricing.subtotalEstimate}</span>
            </div>

            {/* Booking Advance Banner */}
            <div className="rounded-xl bg-slate-900 text-white p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
                  Initial Booking Advance Amount Required:
                </span>
                <div className="text-xl font-black text-amber-400">
                  {pricing.isCashlessScheme ? '₹0 (100% Cashless Admission)' : `₹${pricing.finalPayableAdvance}`}
                </div>
                <span className="text-[10px] text-slate-300 mt-0.5 block">
                  {pricing.insuranceCoverageNote}
                </span>
              </div>
              <div className="text-right">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center font-mono text-[9px] text-white">
                  QR CODE
                </div>
              </div>
            </div>
          </div>

          {/* Decision Factors Checklist */}
          <div className="border-t border-b border-slate-200 py-4">
            <h3 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] mb-2.5">
              Verified Decision Intelligence Factors:
            </h3>
            <div className="grid sm:grid-cols-2 gap-1.5 text-xs text-slate-800">
              {data.decisionFactors.map((f, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Prompt Disclaimer */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[11px] text-amber-900 leading-relaxed">
            <p className="font-bold text-amber-950 uppercase tracking-wide mb-1">
              ⚠ IMPORTANT NOTICE & DISCLAIMER:
            </p>
            <p>
              Information may change due to real-time traffic and fluctuating emergency department triage loads.
              Please confirm directly with the hospital or emergency medical services upon departure.
            </p>
            <p className="mt-1 font-semibold text-amber-950">
              * This document is an <u>INFORMATION SUMMARY & APPOINTMENT LETTER</u>, not a medical or final payment receipt.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
          EmergencyCare Decision Intelligence Engine • Powered by Supabase Backend • Save Time. Save Lives.
        </div>
      </div>
    </div>
  );
}
