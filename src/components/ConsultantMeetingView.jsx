import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, Video, PhoneCall, UserCheck, MapPin, Building2, ExternalLink } from 'lucide-react';

export default function ConsultantMeetingView() {
  const { navigate, selectedHospital, activeEmergencySummary } = useApp();

  const data = activeEmergencySummary || {
    hospitalName: selectedHospital?.name || 'CityCare Apex Trauma & Emergency Hospital',
    hospitalAddress: selectedHospital?.address || '45 Hospital Boulevard, Central Ring Rd',
    hospitalPhone: selectedHospital?.emergency_phone || '+91 80 4912 3999',
    doctorName: 'Dr. Priya Sharma, MD',
    doctorRole: 'Head of Emergency & Critical Care'
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => navigate('summary')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Emergency Summary
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-slate-100 pb-8 mb-8">
          <div className="h-24 w-24 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <UserCheck className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {data.doctorName || 'Dr. Priya Sharma, MD'}
            </h1>
            <p className="text-lg font-medium text-purple-700 mb-2">
              {data.doctorRole || 'Head of Emergency & Critical Care'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-slate-600 text-sm">
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Building2 className="h-4 w-4 text-slate-400" />
                {data.hospitalName}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <MapPin className="h-4 w-4 text-slate-400" />
                {data.hospitalAddress}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Available Meeting Timings
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-purple-600 bg-purple-50">
                <div className="flex flex-col">
                  <span className="font-bold text-purple-900">Immediate ER Consult</span>
                  <span className="text-sm text-purple-700">Usually responds within 2 mins</span>
                </div>
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  AVAILABLE NOW
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-colors cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">Today, 4:30 PM</span>
                  <span className="text-sm text-slate-500">Scheduled Audio/Video Call</span>
                </div>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-colors cursor-pointer">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">Tomorrow, 10:00 AM</span>
                  <span className="text-sm text-slate-500">In-person at {data.hospitalName}</span>
                </div>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Connect Options</h2>
            
            <div className="space-y-4">
              <a 
                href="tel:112"
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md group"
              >
                <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-lg">Direct Phone Call</span>
                  <span className="text-purple-100 text-sm font-medium">112</span>
                </div>
              </a>

              <button 
                onClick={() => navigate('call')}
                className="w-full flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-purple-400 hover:text-purple-700 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                    <Video className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-lg">Start Video Consult</span>
                    <span className="text-slate-500 text-sm font-medium">Join secure meeting room</span>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 opacity-50 group-hover:opacity-100" />
              </button>
            </div>

            <div className="mt-8 text-sm text-slate-500 bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800">
              <span className="font-bold text-amber-900 block mb-1">Note:</span>
              For life-threatening emergencies, please proceed immediately to the hospital. Do not wait for a scheduled consultation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
