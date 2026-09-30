import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Ambulance,
  Home,
  Brain,
  BarChart3,
  FileText,
  Settings,
  User,
  LogOut,
  Play,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function Header() {
  const {
    page,
    navigate,
    user,
    profile,
    openAuthModal,
    handleLogout,
    startDemoMode,
    demoModeActive,
    searchCriteria,
  } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top micro-bar for Demo Mode / Location Indicator */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-red-600/30 text-red-400 px-1.5 py-0.2 font-semibold ring-1 ring-red-500/40 animate-pulse">
            🚨 24/7 TRIAGE
          </span>
          <span className="hidden sm:inline text-slate-400">Current Area:</span>
          <span className="text-white font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-red-400" />
            {searchCriteria.locationLabel || 'Bengaluru Central'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 rounded px-1.5 py-0.5">
            DEMO DATA MODE
          </span>
          <button
            onClick={startDemoMode}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold transition-all ${
              demoModeActive
                ? 'bg-amber-400 text-slate-900 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110'
            }`}
          >
            <Play className="h-3 w-3 fill-current" />
            🎬 DEMO MODE
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 shadow-md shadow-red-500/30">
            <Ambulance className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Emergency<span className="text-red-600">Care</span>
              </span>
              <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-700 ring-1 ring-red-200">
                AI DECISION
              </span>
            </div>
            <p className="text-[11px] leading-tight text-slate-500 font-medium">
              Smarter Decisions When Every Minute Matters.
            </p>
          </div>
        </button>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          <NavButton
            active={page === 'home'}
            onClick={() => navigate('home')}
            icon={<Home className="h-4 w-4" />}
            label="Home"
          />
          <NavButton
            active={page === 'decision' || page === 'results'}
            onClick={() => navigate('decision')}
            icon={<Brain className="h-4 w-4 text-rose-600" />}
            label="Decision Intelligence"
            badge="Core"
          />
          <NavButton
            active={page === 'compare'}
            onClick={() => navigate('compare')}
            icon={<BarChart3 className="h-4 w-4" />}
            label="Compare"
          />
          <NavButton
            active={page === 'ambulance' || page === 'tracker'}
            onClick={() => navigate('ambulance')}
            icon={<Ambulance className="h-4 w-4" />}
            label="Ambulance"
          />
          <NavButton
            active={page === 'history'}
            onClick={() => navigate('history')}
            icon={<Clock className="h-4 w-4" />}
            label="History"
          />
          {user && (
            <NavButton
              active={page === 'user-dashboard' || page === 'dashboard'}
              onClick={() => navigate('user-dashboard')}
              icon={<User className="h-4 w-4 text-emerald-600" />}
              label="Dashboard"
            />
          )}
          <NavButton
            active={page === 'admin'}
            onClick={() => navigate('admin')}
            icon={<Settings className="h-4 w-4 text-purple-600" />}
            label="Admin"
            badge={user?.role === 'admin' ? 'ADMIN' : null}
          />
        </nav>

        {/* Auth / Profile Area */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('user-dashboard')}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                title="View Dashboard & Profile"
              >
                <div className={`h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                  user.role === 'admin' ? 'bg-purple-600' : 'bg-red-600'
                }`}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : (profile.name ? profile.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-900 leading-tight flex items-center gap-1">
                    {user.full_name || profile.name || user.email?.split('@')[0]}
                    {user.role === 'admin' && (
                      <span className="rounded bg-purple-100 text-purple-800 text-[9px] px-1 py-0.2 font-bold uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{user.email || profile.phone}</div>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('signin')}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('signup')}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-red-500/20 hover:bg-red-700 transition-colors flex items-center gap-1"
              >
                <User className="h-3.5 w-3.5" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 bg-white px-2 py-2 text-xs">
        <button
          onClick={() => navigate('home')}
          className={`flex flex-col items-center gap-0.5 ${page === 'home' ? 'text-red-600 font-bold' : 'text-slate-600'}`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => navigate('decision')}
          className={`flex flex-col items-center gap-0.5 ${page === 'decision' ? 'text-red-600 font-bold' : 'text-slate-600'}`}
        >
          <Brain className="h-4 w-4" />
          <span>Decision</span>
        </button>
        <button
          onClick={() => navigate('compare')}
          className={`flex flex-col items-center gap-0.5 ${page === 'compare' ? 'text-red-600 font-bold' : 'text-slate-600'}`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Compare</span>
        </button>
        <button
          onClick={() => navigate('ambulance')}
          className={`flex flex-col items-center gap-0.5 ${page === 'ambulance' ? 'text-red-600 font-bold' : 'text-slate-600'}`}
        >
          <Ambulance className="h-4 w-4" />
          <span>Ambulance</span>
        </button>
        <button
          onClick={() => navigate('history')}
          className={`flex flex-col items-center gap-0.5 ${page === 'history' ? 'text-red-600 font-bold' : 'text-slate-600'}`}
        >
          <Clock className="h-4 w-4" />
          <span>History</span>
        </button>
        {user && (
          <button
            onClick={() => navigate(user.role === 'admin' ? 'admin' : 'user-dashboard')}
            className={`flex flex-col items-center gap-0.5 ${page === 'user-dashboard' || page === 'admin' ? 'text-purple-600 font-bold' : 'text-slate-600'}`}
          >
            {user.role === 'admin' ? <Settings className="h-4 w-4 text-purple-600" /> : <User className="h-4 w-4 text-emerald-600" />}
            <span>{user.role === 'admin' ? 'Admin' : 'Dashboard'}</span>
          </button>
        )}
      </div>
    </header>
  );
}

function NavButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
        active
          ? 'bg-red-50 text-red-700 shadow-sm shadow-red-500/10'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold uppercase text-rose-800">
          {badge}
        </span>
      )}
    </button>
  );
}
