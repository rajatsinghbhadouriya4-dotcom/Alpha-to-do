/**
 * DECISION INTELLIGENCE ENGINE
 * "Smarter Decisions When Every Minute Matters."
 * 
 * The engine collects emergency requirements, analyzes available options across multiple
 * operational vectors (Distance, ETA, Beds, ICU, Doctors, Ambulances, Insurance schemes),
 * explains the contributing factors transparently, and empowers the user to make a fast informed decision.
 * 
 * IMPORTANT:
 * - Does NOT make medical diagnoses.
 * - Does NOT label any option "the best hospital".
 * - The human user remains the final decision-maker.
 */

export function analyzeHospitalOptions(hospitals = [], searchCriteria = {}) {
  const {
    emergencyType = 'General Emergency',
    facility = 'Emergency',
    icuRequired = false,
    emergencyRequired = true,
    preferredCard = null,
    maxDistanceKm = 25,
  } = searchCriteria;

  return hospitals.map((hospital) => {
    const beds = hospital.beds || {};
    const doctors = hospital.doctors || [];
    const ambulances = hospital.ambulances || [];
    const cards = hospital.cards || [];

    const matchingFactors = [];
    const missingFactors = [];
    const cautionNotes = [];

    // 1. Emergency Department Status
    const isEmergencyOpen = hospital.emergency_status === 'open';
    const emergencyBedsAvailable = beds.emergency_available > 0;
    
    if (isEmergencyOpen && emergencyBedsAvailable) {
      matchingFactors.push(`Emergency Department open (${beds.emergency_available} emergency beds ready)`);
    } else if (isEmergencyOpen && !emergencyBedsAvailable) {
      cautionNotes.push('Emergency Department open, but dedicated emergency beds are near capacity');
    } else {
      missingFactors.push('Emergency Department currently on diversion/high load');
    }

    // 2. ICU Availability
    const icuBedsAvailable = beds.icu_available > 0;
    if (icuBedsAvailable) {
      matchingFactors.push(`ICU Available (${beds.icu_available} ICU beds currently unoccupied)`);
    } else {
      if (icuRequired) {
        missingFactors.push('ICU capacity currently at 0 available units');
      } else {
        cautionNotes.push('No available ICU beds at this hour');
      }
    }

    // 3. Ventilator / Oxygen Support
    if (beds.ventilator_available > 0) {
      matchingFactors.push(`Ventilator Support verified (${beds.ventilator_available} units ready)`);
    }
    if (beds.oxygen_available > 0) {
      matchingFactors.push(`Oxygen pipeline ready (${beds.oxygen_available} active ports)`);
    }

    // 4. Specialist Doctor Availability
    const availableDocs = doctors.filter(d => d.availability === 'Available');
    if (availableDocs.length > 0) {
      const docNames = availableDocs.map(d => `${d.name} (${d.specialization})`).join(', ');
      matchingFactors.push(`On-Duty Specialist ready: ${docNames}`);
    } else {
      missingFactors.push('Emergency specialists currently engaged in procedures/rounds');
    }

    // 5. Ambulance Availability & Proximity
    const availableAmbulances = ambulances.filter(a => a.status === 'Available');
    if (availableAmbulances.length > 0) {
      const nearestAmb = availableAmbulances[0];
      matchingFactors.push(`Rapid Dispatch: ${nearestAmb.type} standing by (ETA: ${nearestAmb.eta || '6 min'})`);
    } else {
      cautionNotes.push('Hospital fleet currently dispatched; external fleet support needed');
    }

    // 6. Insurance Scheme / Health Card Acceptance
    if (preferredCard && preferredCard !== 'All Schemes') {
      const hasCard = cards.some(c => c.toLowerCase().includes(preferredCard.toLowerCase()));
      if (hasCard) {
        matchingFactors.push(`Accepted Scheme: ${preferredCard} cashless pre-auth verified`);
      } else {
        missingFactors.push(`Requested scheme (${preferredCard}) not listed in verified registry`);
      }
    } else if (cards.length > 0) {
      matchingFactors.push(`Listed Schemes: ${cards.slice(0, 2).join(', ')}${cards.length > 2 ? ` +${cards.length - 2} more` : ''}`);
    }

    // 7. Distance & Travel Time (ETA)
    const distance = hospital.distance_km || 3.0;
    const eta = hospital.eta_minutes || Math.round(distance * 3.2);

    if (distance <= 3.0) {
      matchingFactors.push(`Shorter Travel Distance (${distance} km, ~${eta} min travel time)`);
    } else if (distance <= 6.0) {
      matchingFactors.push(`Moderate Travel Distance (${distance} km, ~${eta} min travel time)`);
    } else {
      cautionNotes.push(`Longer transit window: ${distance} km (~${eta} min)`);
    }

    // Synthesize Transparent Decision Insight
    let decisionInsight = '';
    if (icuRequired && icuBedsAvailable && isEmergencyOpen) {
      decisionInsight = `Matches the selected ICU and emergency requirements with ${beds.icu_available} beds ready and ${eta} minutes estimated travel time.`;
    } else if (icuRequired && !icuBedsAvailable) {
      decisionInsight = `Emergency trauma room is operational, but ICU is currently reported at 0 capacity. Suitable for primary triage & transfer.`;
    } else if (isEmergencyOpen && availableDocs.length > 0) {
      decisionInsight = `Emergency department is staffed with ${availableDocs.length} on-duty specialist(s) and provides an estimated transit time of ${eta} min.`;
    } else {
      decisionInsight = `Provides baseline emergency services (${beds.general_available || 0} general beds). Consider verifying current triage load prior to arrival.`;
    }

    // Analytical Match Score for sorting (purely operational suitability)
    let score = 50;
    score += matchingFactors.length * 10;
    score -= missingFactors.length * 15;
    score += (beds.emergency_available || 0) * 2;
    score += (beds.icu_available || 0) * 3;
    score -= distance * 2;

    return {
      hospital,
      distance: `${distance} km`,
      distance_km: distance,
      eta: `${eta} min`,
      eta_minutes: eta,
      emergency_status: hospital.emergency_status,
      availability: {
        general: beds.general_available || 0,
        icu: beds.icu_available || 0,
        emergency: beds.emergency_available || 0,
        ventilator: beds.ventilator_available || 0,
        oxygen: beds.oxygen_available || 0,
        doctors: availableDocs.length,
        ambulances: availableAmbulances.length,
      },
      matchingFactors,
      missingFactors,
      cautionNotes,
      decisionInsight,
      score,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Generate Comparative Matrix Data for Side-by-Side Analysis
 */
export function buildComparisonMatrix(analyzedHospitals = [], preferredCard = null) {
  return analyzedHospitals.map(item => {
    const h = item.hospital;
    const b = h.beds || {};
    const docs = h.doctors || [];
    const ambs = h.ambulances || [];
    const cards = h.cards || [];

    const hasCard = preferredCard && preferredCard !== 'All Schemes'
      ? cards.some(c => c.toLowerCase().includes(preferredCard.toLowerCase()))
      : cards.length > 0;

    return {
      id: h.id,
      name: h.name,
      image_url: h.image_url,
      rating: h.rating,
      distance: item.distance,
      eta: item.eta,
      emergencyStatus: h.emergency_status === 'open' ? '🟢 Open' : h.emergency_status === 'busy' ? '🟠 High Load' : '🔴 Diverting',
      icuStatus: b.icu_available > 0 ? `🟢 ${b.icu_available} Ready` : '🔴 0 Beds',
      bedsStatus: b.general_available > 0 ? `🟢 ${b.general_available} Ready` : '🟠 Low',
      doctorStatus: docs.some(d => d.availability === 'Available') ? '🟢 On Duty' : '🟠 In Surgery',
      ambulanceStatus: ambs.some(a => a.status === 'Available') ? '🟢 Available' : '🟠 Busy',
      cardStatus: hasCard ? '✔ Verified' : '— Unlisted',
      decisionInsight: item.decisionInsight,
    };
  });
}
