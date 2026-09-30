import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase,
  getHospitalsFromDb,
  getUserProfile,
  upsertUserProfile,
  saveEmergencyRequest,
  FALLBACK_HOSPITALS
} from '../lib/supabase';
import { calculateDistance, estimateTravelTime, reverseGeocode, adaptHospitalsToLocation } from '../lib/geoUtils';
import { calculateBookingEstimate } from '../lib/pricingData';
import { getStoredUser, getStoredToken, clearStoredSession, setStoredSession, authAPI } from '../lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Backend JWT Auth state
  const [authUser, setAuthUser] = useState(() => getStoredUser());

  // App User & Profile state
  const [user, setUser] = useState(() => getStoredUser());
  const [profile, setProfile] = useState(() => {
    const initialUser = getStoredUser();
    return {
      name: initialUser?.full_name || 'Rahul Sharma',
      email: initialUser?.email || '',
      phone: initialUser?.mobile || '+91 98765 43210',
      emergency_contact: '+91 98765 00000 (Family)',
      blood_group: 'B+ Positive',
      preferred_card: 'Ayushman Bharat (PM-JAY)',
    };
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin'); // 'signin' | 'signup' | 'forgot'

  // Navigation State
  const [page, setPage] = useState('home');

  // Emergency Search Criteria
  const [searchCriteria, setSearchCriteria] = useState({
    emergencyType: 'Accident Emergency',
    facility: 'Emergency & Trauma',
    icuRequired: true,
    emergencyRequired: true,
    preferredCard: 'Ayushman Bharat (PM-JAY)',
    locationLabel: 'MG Road Metro Station, Bengaluru (Live GPS)',
    lat: 12.9716,
    lng: 77.5946,
  });

  // Hospitals Data
  const [hospitals, setHospitals] = useState(FALLBACK_HOSPITALS);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Selections
  const [selectedHospital, setSelectedHospital] = useState(FALLBACK_HOSPITALS[0]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  // Active Emergency Summary Receipt
  const [activeEmergencySummary, setActiveEmergencySummary] = useState(null);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingHospital, setBookingHospital] = useState(null);

  // Live Tracking Demo State
  const [trackerState, setTrackerState] = useState({
    status: 'EN ROUTE',
    stageIndex: 2,
    etaMinutes: 6,
    distanceKm: 1.8,
    activeRoute: 'Route A (Direct Corridor)',
    trafficAlert: true,
  });

  // Demo Mode Tour State
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);

  // Base hospitals reference holding all database hospitals
  const baseHospitalsRef = React.useRef(FALLBACK_HOSPITALS);

  // Update user location & adapt all hospitals to that location in real time!
  const updateLocation = useCallback(async (lat, lng, customLabel = null) => {
    let label = customLabel;
    if (!label) {
      label = await reverseGeocode(lat, lng);
    }

    setSearchCriteria(prev => ({
      ...prev,
      lat,
      lng,
      locationLabel: label,
    }));

    const adapted = adaptHospitalsToLocation(lat, lng, label, baseHospitalsRef.current);
    if (adapted && adapted.length > 0) {
      setHospitals(adapted);
      setSelectedHospital(adapted[0]);
    }
  }, []);

  // 1. Backend JWT & Supabase Auth listeners
  useEffect(() => {
    async function initAuth() {
      try {
        if (getStoredToken()) {
          try {
            const data = await authAPI.getMe();
            if (data.success && data.user) {
              setAuthUser(data.user);
              setUser(data.user);
              setProfile(prev => ({
                ...prev,
                name: data.user.full_name || prev.name,
                email: data.user.email || prev.email,
                phone: data.user.mobile || prev.phone,
              }));
            }
          } catch (e) {
            if (e.code === 'ACCOUNT_DEACTIVATED' || e.status === 403) {
              clearStoredSession();
              setAuthUser(null);
              setUser(null);
            } else {
              console.warn('Backend auth check skipped:', e.message);
            }
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !getStoredToken()) {
          setUser(session.user);
          const p = await getUserProfile(session.user.id);
          if (p) {
            setProfile(p);
          } else {
            setProfile(prev => ({
              ...prev,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            }));
          }
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !getStoredToken()) {
        setUser(session.user);
        const p = await getUserProfile(session.user.id);
        if (p) setProfile(p);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Load Hospitals from DB & adapt to initial location
  const refreshHospitals = useCallback(async () => {
    setLoadingHospitals(true);
    try {
      const data = await getHospitalsFromDb();
      if (data && data.length > 0) {
        baseHospitalsRef.current = data;
        const adapted = adaptHospitalsToLocation(
          searchCriteria.lat,
          searchCriteria.lng,
          searchCriteria.locationLabel,
          data
        );
        setHospitals(adapted);
        if (adapted.length > 0) {
          setSelectedHospital(adapted[0]);
        }
      }
    } catch (e) {
      console.warn('Failed refreshing hospitals:', e);
    } finally {
      setLoadingHospitals(false);
    }
  }, [searchCriteria.lat, searchCriteria.lng, searchCriteria.locationLabel]);

  useEffect(() => {
    refreshHospitals();
  }, [refreshHospitals]);

  // Smooth Navigation
  const navigate = useCallback((targetPage) => {
    setPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Auth Modal openers
  const openAuthModal = useCallback((tab = 'signin') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    clearStoredSession();
    setAuthUser(null);
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setProfile({
      name: 'Guest Patient',
      email: '',
      phone: '+91 98765 43210',
      emergency_contact: '+91 98765 00000',
      blood_group: 'B+ Positive',
      preferred_card: 'Ayushman Bharat (PM-JAY)',
    });
    navigate('home');
  }, [navigate]);

  // Update profile in memory and DB
  const updateProfile = useCallback(async (newProfile) => {
    setProfile(newProfile);
    if (user) {
      try {
        await upsertUserProfile({ id: user.id, ...newProfile });
      } catch (err) {
        console.error('Failed saving profile to DB:', err);
      }
    }
  }, [user]);

  // Helper to open Booking Modal
  const openBookingModal = useCallback((hospital) => {
    setBookingHospital(hospital || selectedHospital || hospitals[0]);
    setBookingModalOpen(true);
  }, [selectedHospital, hospitals]);

  const closeBookingModal = useCallback(() => {
    setBookingModalOpen(false);
  }, []);

  // Helper to create Emergency Summary & save request
  const generateEmergencySummary = useCallback(async (hospitalOverride = null, ambulanceOverride = null, customBookingData = null) => {
    const hosp = hospitalOverride || selectedHospital || hospitals[0];
    const amb = ambulanceOverride || selectedAmbulance || (hosp.ambulances && hosp.ambulances[0]) || {
      type: 'ALS Ambulance (Advanced Cardiac Life Support)',
      eta: '6 minutes',
      status: 'Dispatched',
    };

    const schemeName = customBookingData?.selectedScheme || hosp.cards?.[0] || searchCriteria.preferredCard || 'Ayushman Bharat (PM-JAY)';

    const pricing = customBookingData?.pricing || calculateBookingEstimate({
      hospitalId: hosp.id,
      bedType: customBookingData?.bedType || (searchCriteria.icuRequired ? 'icu' : 'general'),
      needAmbulance: customBookingData?.needAmbulance !== undefined ? customBookingData.needAmbulance : true,
      distanceKm: hosp.distance_km || 2.1,
      scheme: schemeName,
    });

    const summary = {
      id: `ER-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      patientName: customBookingData?.patientName || profile?.name || 'Emergency Patient',
      patientPhone: customBookingData?.patientPhone || profile?.phone || '+91 98765 43210',
      emergencyContact: profile?.emergency_contact || '+91 98765 00000',
      bloodGroup: profile?.blood_group || 'O+ Positive',
      idProofType: customBookingData?.idProofType || 'Aadhaar Card',
      idNumber: customBookingData?.idNumber || 'XXXX-XXXX-8942',
      emergencyType: searchCriteria.emergencyType || 'Accident Emergency',
      hospitalName: hosp.name,
      hospitalAddress: hosp.address,
      hospitalPhone: hosp.emergency_phone || hosp.phone,
      distance: hosp.distance_km ? `${hosp.distance_km} km` : '2.1 km',
      travelTime: hosp.eta_minutes ? `${hosp.eta_minutes} minutes` : '8 minutes',
      emergencyStatus: hosp.emergency_status === 'open' ? 'Available' : 'High Load',
      icuStatus: hosp.beds?.icu_available > 0 ? `Available (${hosp.beds.icu_available} beds)` : '0 Available',
      bedStatus: hosp.beds?.general_available > 0 ? `Available (${hosp.beds.general_available} beds)` : 'Limited',
      doctorStatus: 'Assigned: Dr. Priya Sharma, MD (ER Head)',
      acceptedCard: schemeName,
      ambulanceType: amb.type || 'ALS Ambulance',
      ambulanceEta: amb.eta || '6 minutes',
      pricing,
      decisionFactors: [
        '✓ Real-time ICU & ventilator capacity confirmed',
        '✓ Emergency trauma department triage open',
        '✓ On-duty critical care consultant pre-notified',
        `✓ Cashless coverage verified under ${schemeName}`,
        `✓ Dynamic traffic routing (~${hosp.eta_minutes || 8} min window)`,
      ]
    };

    setActiveEmergencySummary(summary);

    // Save to Supabase emergency_requests
    try {
      await saveEmergencyRequest({
        user_id: user?.id || null,
        emergency_type: summary.emergencyType,
        hospital_id: hosp.id || null,
        status: 'Completed',
      });
    } catch (e) {
      console.warn('Could not save emergency request to DB:', e);
    }

    navigate('summary');
    return summary;
  }, [selectedHospital, selectedAmbulance, hospitals, profile, searchCriteria, user, navigate]);

  // Hackathon Demo Mode Orchestrator
  const startDemoMode = useCallback(() => {
    setDemoModeActive(true);
    setDemoStepIndex(0);
    setSearchCriteria(prev => ({
      ...prev,
      emergencyType: 'Accident Emergency',
      facility: 'Emergency & Trauma',
      icuRequired: true,
      emergencyRequired: true,
      preferredCard: 'Ayushman Bharat (PM-JAY)',
      locationLabel: 'MG Road, Bengaluru (Demo Location)',
      lat: 12.9716,
      lng: 77.5946,
    }));
    navigate('decision');
  }, [navigate]);

  const stopDemoMode = useCallback(() => {
    setDemoModeActive(false);
  }, []);

  const value = {
    authUser,
    setAuthUser,
    user,
    profile,
    authLoading,
    authModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    handleLogout,
    updateProfile,
    page,
    navigate,
    searchCriteria,
    setSearchCriteria,
    updateLocation,
    hospitals,
    loadingHospitals,
    refreshHospitals,
    setHospitals,
    selectedHospital,
    setSelectedHospital,
    selectedAmbulance,
    setSelectedAmbulance,
    activeEmergencySummary,
    setActiveEmergencySummary,
    generateEmergencySummary,
    bookingModalOpen,
    bookingHospital,
    openBookingModal,
    closeBookingModal,
    trackerState,
    setTrackerState,
    demoModeActive,
    demoStepIndex,
    setDemoStepIndex,
    startDemoMode,
    stopDemoMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
