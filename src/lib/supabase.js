import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qkrswbisbchznjgvzrwm.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcnN3YmlzYmNoem5qZ3Z6cndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyOTgzNTAsImV4cCI6MjEwMDg3NDM1MH0.n798itOmhCSOwh87NnoOq4U-WA7A-WOyE8rO30kwhq0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Fallback demo hospitals in case of network disconnect
export const FALLBACK_HOSPITALS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'CityCare Apex Trauma & Emergency Hospital',
    image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
    address: '45 Hospital Boulevard, Central Ring Rd',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '+91 80 4912 3000',
    emergency_phone: '+91 80 4912 3999',
    rating: 4.8,
    emergency_status: 'open',
    distance_km: 2.1,
    eta_minutes: 7,
    last_updated: new Date().toISOString(),
    beds: {
      general_available: 18,
      icu_available: 5,
      emergency_available: 8,
      ventilator_available: 4,
      oxygen_available: 12,
    },
    doctors: [
      { id: 'd1', name: 'Dr. Priya Sharma, MD', specialization: 'Emergency Medicine & Triage Specialist', availability: 'Available' },
      { id: 'd2', name: 'Dr. Rajesh Nair, MS', specialization: 'Trauma & Orthopaedic Surgeon', availability: 'Available' },
    ],
    ambulances: [
      { id: 'amb1', type: 'Advanced Cardiac Life Support (ACLS)', status: 'Available', eta: '5 min', distance: '1.4 km' },
      { id: 'amb2', type: 'Basic Life Support (BLS)', status: 'Available', eta: '7 min', distance: '2.0 km' },
    ],
    cards: ['Ayushman Bharat (PM-JAY)', 'CGHS (Central Govt Health Scheme)', 'Star Health Allied Insurance']
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Apollo Speciality & Critical Care Center',
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    address: '154/11 Bannerghatta Main Rd, Opposite IIMB',
    latitude: 12.8984,
    longitude: 77.5994,
    phone: '+91 80 2630 4050',
    emergency_phone: '+91 80 1066',
    rating: 4.9,
    emergency_status: 'open',
    distance_km: 3.8,
    eta_minutes: 12,
    last_updated: new Date().toISOString(),
    beds: {
      general_available: 24,
      icu_available: 7,
      emergency_available: 10,
      ventilator_available: 6,
      oxygen_available: 15,
    },
    doctors: [
      { id: 'd3', name: 'Dr. Amitav Roy, DM', specialization: 'Interventional Cardiologist', availability: 'Available' },
      { id: 'd4', name: 'Dr. Sunita Kulkarni, MD', specialization: 'Critical Care & Pulmonology', availability: 'Available' },
    ],
    ambulances: [
      { id: 'amb3', type: 'ICU on Wheels / Mobile Ventilator', status: 'Available', eta: '6 min', distance: '1.9 km' },
    ],
    cards: ['Ayushman Bharat (PM-JAY)', 'Star Health Allied Insurance', 'HDFC ERGO Health Suraksha']
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Fortis Heart & Emergency Institute',
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    address: '14 Cunningham Road, Vasanth Nagar',
    latitude: 12.9866,
    longitude: 77.5983,
    phone: '+91 80 4022 5555',
    emergency_phone: '+91 80 4022 5911',
    rating: 4.7,
    emergency_status: 'open',
    distance_km: 4.5,
    eta_minutes: 14,
    last_updated: new Date().toISOString(),
    beds: {
      general_available: 12,
      icu_available: 3,
      emergency_available: 4,
      ventilator_available: 2,
      oxygen_available: 8,
    },
    doctors: [
      { id: 'd5', name: 'Dr. Vikramaditya Rao, MS', specialization: 'Cardiothoracic Emergency Surgeon', availability: 'Available' },
    ],
    ambulances: [
      { id: 'amb4', type: 'Advanced Life Support (ALS)', status: 'Available', eta: '8 min', distance: '2.5 km' },
    ],
    cards: ['Star Health Allied Insurance', 'HDFC ERGO Health Suraksha']
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    name: 'Manipal Multi-Speciality Emergency Hospital',
    image_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    address: '98 HAL Old Airport Rd, Kodihalli',
    latitude: 12.9592,
    longitude: 77.6547,
    phone: '+91 80 2502 4444',
    emergency_phone: '+91 80 2502 3333',
    rating: 4.6,
    emergency_status: 'busy',
    distance_km: 5.2,
    eta_minutes: 17,
    last_updated: new Date().toISOString(),
    beds: {
      general_available: 15,
      icu_available: 0,
      emergency_available: 5,
      ventilator_available: 1,
      oxygen_available: 6,
    },
    doctors: [
      { id: 'd6', name: 'Dr. Neha Verma, MD', specialization: 'Neuro Emergency & Stroke Care', availability: 'Busy' },
    ],
    ambulances: [
      { id: 'amb5', type: 'Basic Life Support (BLS)', status: 'Busy', eta: '15 min', distance: '4.8 km' },
    ],
    cards: ['CGHS (Central Govt Health Scheme)', 'Star Health Allied Insurance']
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    name: 'Max Super Care & Trauma Center',
    image_url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    address: '22 Outer Ring Road, Marathahalli Junction',
    latitude: 12.9569,
    longitude: 77.7011,
    phone: '+91 80 6610 8000',
    emergency_phone: '+91 80 6610 8100',
    rating: 4.5,
    emergency_status: 'open',
    distance_km: 6.4,
    eta_minutes: 21,
    last_updated: new Date().toISOString(),
    beds: {
      general_available: 20,
      icu_available: 4,
      emergency_available: 7,
      ventilator_available: 3,
      oxygen_available: 10,
    },
    doctors: [
      { id: 'd7', name: 'Dr. Sanjay Gupta, MS', specialization: 'General & Laparoscopic Trauma', availability: 'Available' },
    ],
    ambulances: [
      { id: 'amb6', type: 'Rapid Response Neonatal/Trauma', status: 'Available', eta: '9 min', distance: '3.1 km' },
    ],
    cards: ['Ayushman Bharat (PM-JAY)', 'ECHS (Ex-Servicemen Contributory Health)']
  }
];

// Supabase API services
export async function getHospitalsFromDb() {
  try {
    const { data: hospitals, error: hErr } = await supabase
      .from('hospitals')
      .select('*')
      .order('distance_km', { ascending: true });

    if (hErr || !hospitals || hospitals.length === 0) {
      console.warn('Using fallback hospital data (Supabase empty or error):', hErr);
      return FALLBACK_HOSPITALS;
    }

    // Fetch relational data in parallel
    const [bedsRes, docsRes, ambRes, cardMapRes, allCardsRes] = await Promise.all([
      supabase.from('beds').select('*'),
      supabase.from('doctors').select('*'),
      supabase.from('ambulances').select('*'),
      supabase.from('hospital_cards').select('*'),
      supabase.from('insurance_cards').select('*'),
    ]);

    const beds = bedsRes.data || [];
    const doctors = docsRes.data || [];
    const ambulances = ambRes.data || [];
    const hospitalCards = cardMapRes.data || [];
    const insuranceCards = allCardsRes.data || [];

    const cardLookup = {};
    insuranceCards.forEach(c => {
      cardLookup[c.id] = c.name;
    });

    return hospitals.map(h => {
      const hBeds = beds.find(b => b.hospital_id === h.id) || {
        general_available: 10,
        icu_available: 2,
        emergency_available: 4,
        ventilator_available: 1,
        oxygen_available: 5,
      };

      const hDoctors = doctors.filter(d => d.hospital_id === h.id);
      const hAmbulances = ambulances.filter(a => a.hospital_id === h.id);
      const hCardNames = hospitalCards
        .filter(hc => hc.hospital_id === h.id && hc.verified)
        .map(hc => cardLookup[hc.card_id])
        .filter(Boolean);

      return {
        ...h,
        beds: hBeds,
        doctors: hDoctors.length > 0 ? hDoctors : [
          { id: `doc-${h.id}-1`, name: 'Dr. On Duty Specialist', specialization: 'Emergency & Critical Care', availability: 'Available' }
        ],
        ambulances: hAmbulances.length > 0 ? hAmbulances : [
          { id: `amb-${h.id}-1`, type: 'Advanced Life Support (ALS)', status: 'Available', eta: `${h.eta_minutes || 8} min` }
        ],
        cards: hCardNames.length > 0 ? hCardNames : ['Ayushman Bharat (PM-JAY)', 'Star Health Allied Insurance'],
      };
    });
  } catch (err) {
    console.error('Error fetching hospitals from Supabase:', err);
    return FALLBACK_HOSPITALS;
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('getUserProfile exception:', err);
    return null;
  }
}

export async function upsertUserProfile(profile) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('upsertUserProfile error:', err);
    throw err;
  }
}

export async function getReviews(hospitalId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('getReviews error:', err);
    return [];
  }
}

export async function submitHospitalReview({ hospital_id, user_id, rating, comment }) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        hospital_id,
        user_id,
        rating,
        comment,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('submitHospitalReview error:', err);
    throw err;
  }
}

export async function getEmergencyHistory(userId) {
  try {
    const query = supabase
      .from('emergency_requests')
      .select('*, hospital:hospitals(*), ambulance:ambulances(*)')
      .order('created_at', { ascending: false });

    if (userId) {
      query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('getEmergencyHistory error:', err);
    return [];
  }
}

export async function saveEmergencyRequest(requestData) {
  try {
    const { data, error } = await supabase
      .from('emergency_requests')
      .insert({
        ...requestData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('saveEmergencyRequest error:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      status: err.status,
      operation: 'insert emergency_requests'
    });
    throw err;
  }
}

export async function updateBedsInDb(bedsId, hospitalId, bedUpdates) {
  try {
    let res;
    if (bedsId) {
      res = await supabase
        .from('beds')
        .update({ ...bedUpdates, last_updated: new Date().toISOString() })
        .eq('id', bedsId)
        .select()
        .single();
    } else {
      res = await supabase
        .from('beds')
        .update({ ...bedUpdates, last_updated: new Date().toISOString() })
        .eq('hospital_id', hospitalId)
        .select()
        .single();
    }
    return res.data;
  } catch (err) {
    console.error('updateBedsInDb error:', err);
    throw err;
  }
}
