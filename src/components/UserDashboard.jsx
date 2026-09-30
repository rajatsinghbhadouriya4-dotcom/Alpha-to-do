import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  CheckCircle,
  LogOut,
  Brain,
  Ambulance,
  Navigation,
  Clock,
  Sparkles,
  HeartPulse,
  Settings,
  ChevronRight,
  Hospital,
  AlertCircle
} from 'lucide-react';

export default function UserDashboard() {
  const { authUser, handleLogout, navigate, selectedHospital, openBookingModal } = useApp();

  if (!authUser) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Session Required</h2>
        <p className="text-xs text-slate-500">
          Please sign in to access your personal EmergencyCare dashboard.
        </p>
        <button
          onClick={() => navigate('signin')}
          className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const isAdministrator = authUser.role === 'admin';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                <CheckCircle className="h-3.5 w-3.5" />
                Active Account
              </span>
              {isAdministrator && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 ring-1 ring-purple-500/30">
                  <Shield className="h-3.5 w-3.5" />
                  System Administrator
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, <span className="text-rose-400">{authUser.full_name}</span>!
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Your verified emergency profile is ready. You have instant access to real-time hospital bed availability, priority ambulance dispatch, and cashless insurance pre-authorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdministrator && (
              <button
                onClick={() => navigate('admin')}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-rose-900/40 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. Grid: User Profile Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Profile Card */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-red-600" />
              Profile Details
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
              {authUser.role}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Full Name</div>
                <div className="font-semibold text-slate-800 text-sm">{authUser.full_name}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Email Address</div>
                <div className="font-semibold text-slate-800">{authUser.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Registered Mobile</div>
                <div className="font-semibold text-slate-800">{authUser.mobile || 'Not specified'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Account Status</div>
                <div className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {authUser.status?.toUpperCase() || 'ACTIVE'}
                </div>
              </div>
            </div>

            {authUser.created_at && (
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100">
                Member since: {new Date(authUser.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Emergency Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-red-600" />
              Emergency Care Features
            </h3>
            <span className="text-xs text-slate-500">Instant Navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Feature 1: Decision Intelligence */}
            <button
              onClick={() => navigate('decision')}
              className="flex items-start gap-4 p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white hover:border-red-300 hover:shadow-md transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-red-600 text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  Decision Intelligence
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Compare real-time hospital capacities, ICU beds, triage status, and nearest verified facilities.
                </p>
              </div>
            </button>

            {/* Feature 2: Ambulance Dispatch */}
            <button
              onClick={() => navigate('ambulance')}
              className="flex items-start gap-4 p-5 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-white hover:border-sky-300 hover:shadow-md transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-sky-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Ambulance className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  Ambulance Dispatch
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Dispatch ALS / BLS cardiac ambulances with live GPS telemetry and green corridor routing.
                </p>
              </div>
            </button>

            {/* Feature 3: Smart Route & Traffic */}
            <button
              onClick={() => navigate('route')}
              className="flex items-start gap-4 p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white hover:border-emerald-300 hover:shadow-md transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Navigation className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  Traffic Navigation
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Analyze shortest distance, fastest emergency corridor, and traffic signals in real-time.
                </p>
              </div>
            </button>

            {/* Feature 4: Emergency Receipts */}
            <button
              onClick={() => navigate('history')}
              className="flex items-start gap-4 p-5 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white hover:border-purple-300 hover:shadow-md transition-all text-left group"
            >
              <div className="p-3 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                  Emergency Receipts
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  View past hospital pre-authorizations, printable appointment letters, and tariff breakdowns.
                </p>
              </div>
            </button>
          </div>

          {/* Quick Pre-Book Shortcut */}
          <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                <Hospital className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Pre-Book Verified Emergency Bed</div>
                <div className="text-[11px] text-slate-500">Transparent tariffs with Ayushman Bharat & cashless insurance support.</div>
              </div>
            </div>
            <button
              onClick={() => openBookingModal(selectedHospital)}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Pre-Book Bed Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
