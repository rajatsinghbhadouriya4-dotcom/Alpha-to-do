import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import DecisionIntelligenceView from './components/DecisionIntelligenceView';
import DecisionComparisonView from './components/DecisionComparisonView';
import HospitalDetailsView from './components/HospitalDetailsView';
import RouteView from './components/RouteView';
import AmbulanceView from './components/AmbulanceView';
import LiveAmbulanceTracker from './components/LiveAmbulanceTracker';
import EmergencySummaryReceipt from './components/EmergencySummaryReceipt';
import EmergencyHistoryView from './components/EmergencyHistoryView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import ConsultantMeetingView from './components/ConsultantMeetingView';
import CallView from './components/CallView';
import SignInPage from './components/auth/SignInPage';
import SignUpPage from './components/auth/SignUpPage';
import UserDashboard from './components/UserDashboard';
import AuthModal from './components/AuthModal';
import DemoModeModal from './components/DemoModeModal';
import BookingModal from './components/BookingModal';
import { HeartPulse, PhoneCall, ShieldAlert, Sparkles } from 'lucide-react';

function PageRouter() {
  const { page } = useApp();

  switch (page) {
    case 'home':
      return <HomeView />;
    case 'signin':
      return <SignInPage />;
    case 'signup':
      return <SignUpPage />;
    case 'user-dashboard':
    case 'dashboard':
      return <UserDashboard />;
    case 'search':
      return <SearchView />;
    case 'decision':
    case 'results':
      return <DecisionIntelligenceView />;
    case 'compare':
      return <DecisionComparisonView />;
    case 'details':
      return <HospitalDetailsView />;
    case 'route':
      return <RouteView />;
    case 'ambulance':
      return <AmbulanceView />;
    case 'tracker':
      return <LiveAmbulanceTracker />;
    case 'summary':
      return <EmergencySummaryReceipt />;
    case 'history':
      return <EmergencyHistoryView />;
    case 'profile':
      return <ProfileView />;
    case 'admin':
      return <AdminView />;
    case 'consultant':
      return <ConsultantMeetingView />;
    case 'call':
      return <CallView />;
    default:
      return <HomeView />;
  }
}

function MainLayout() {
  const { navigate, bookingModalOpen, bookingHospital, closeBookingModal, generateEmergencySummary } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      
      <main className="flex-1">
        <PageRouter />
      </main>

      {/* Global Modals */}
      <AuthModal />
      <DemoModeModal />
      <BookingModal
        isOpen={bookingModalOpen}
        hospital={bookingHospital}
        onClose={closeBookingModal}
        onBookingComplete={(data) => generateEmergencySummary(data.hospital, null, data)}
      />

      {/* Modern Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 no-print">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-base text-slate-900">
                Emergency<span className="text-red-600">Care</span>
              </span>
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                DECISION INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              "EmergencyCare doesn't make the decision for the user. It transforms scattered emergency data into clear, explainable insights so the user can make a faster informed decision."
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <button onClick={() => navigate('home')} className="hover:text-red-600 transition-colors">Home</button>
            <button onClick={() => navigate('decision')} className="hover:text-red-600 transition-colors">Decision Engine</button>
            <button onClick={() => navigate('compare')} className="hover:text-red-600 transition-colors">Compare</button>
            <button onClick={() => navigate('ambulance')} className="hover:text-red-600 transition-colors">Ambulance</button>
            <button onClick={() => navigate('admin')} className="hover:text-red-600 transition-colors">Admin Portal</button>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
          © 2026 EmergencyCare Hackathon Edition • Integrated with Supabase Auth & PostgreSQL Backend.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
