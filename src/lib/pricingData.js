/**
 * Transparent Hospital Charges & Booking Amount Registry
 */

export const HOSPITAL_PRICING = {
  // Default tariff structure (INR)
  defaultTariff: {
    doctorConsultation: 800,
    erTriageEntry: 450,
    generalBedPerDay: 2500,
    icuBedPerDay: 9500,
    ventilatorPerDay: 3500,
    oxygenPerHour: 250,
    ambulanceBls: 800,
    ambulanceAcls: 1800,
    ambulancePerKm: 30,
    advanceDepositGeneral: 2000,
    advanceDepositIcu: 5000,
  },

  // Hospital specific pricing adjustments
  'a0000000-0000-0000-0000-000000000001': {
    name: 'CityCare Apex Trauma & Emergency Hospital',
    doctorConsultation: 750,
    erTriageEntry: 400,
    generalBedPerDay: 2200,
    icuBedPerDay: 8500,
    ventilatorPerDay: 3000,
    oxygenPerHour: 200,
    ambulanceBls: 750,
    ambulanceAcls: 1600,
    ambulancePerKm: 25,
    advanceDepositGeneral: 1800,
    advanceDepositIcu: 4500,
  },
  'a0000000-0000-0000-0000-000000000002': {
    name: 'Apollo Speciality & Critical Care Center',
    doctorConsultation: 1200,
    erTriageEntry: 600,
    generalBedPerDay: 3500,
    icuBedPerDay: 12500,
    ventilatorPerDay: 4500,
    oxygenPerHour: 300,
    ambulanceBls: 1000,
    ambulanceAcls: 2200,
    ambulancePerKm: 35,
    advanceDepositGeneral: 2500,
    advanceDepositIcu: 6000,
  },
  'a0000000-0000-0000-0000-000000000003': {
    name: 'Fortis Heart & Emergency Institute',
    doctorConsultation: 1100,
    erTriageEntry: 550,
    generalBedPerDay: 3200,
    icuBedPerDay: 11000,
    ventilatorPerDay: 4000,
    oxygenPerHour: 280,
    ambulanceBls: 900,
    ambulanceAcls: 2000,
    ambulancePerKm: 32,
    advanceDepositGeneral: 2200,
    advanceDepositIcu: 5500,
  },
};

export function getHospitalTariff(hospitalId) {
  return HOSPITAL_PRICING[hospitalId] || HOSPITAL_PRICING.defaultTariff;
}

export function calculateBookingEstimate({
  hospitalId,
  bedType = 'general', // 'general' | 'icu'
  needAmbulance = true,
  ambulanceType = 'ALS Ambulance',
  distanceKm = 2.5,
  scheme = 'Ayushman Bharat (PM-JAY)',
}) {
  const tariff = getHospitalTariff(hospitalId);

  const consultation = tariff.doctorConsultation;
  const erEntry = tariff.erTriageEntry;
  const bedCost = bedType === 'icu' ? tariff.icuBedPerDay : tariff.generalBedPerDay;
  const ventilatorCost = bedType === 'icu' ? tariff.ventilatorPerDay : 0;

  let ambulanceCost = 0;
  if (needAmbulance) {
    const base = ambulanceType.includes('ALS') || ambulanceType.includes('Cardiac')
      ? tariff.ambulanceAcls
      : tariff.ambulanceBls;
    const distanceCost = Math.round(distanceKm * tariff.ambulancePerKm);
    ambulanceCost = base + distanceCost;
  }

  const subtotalEstimate = consultation + erEntry + bedCost + ventilatorCost + ambulanceCost;
  
  // Base advance deposit required if self-paying
  const baseDeposit = bedType === 'icu' ? tariff.advanceDepositIcu : tariff.advanceDepositGeneral;

  // Check if scheme provides Cashless coverage
  const isCashlessScheme =
    scheme.includes('Ayushman Bharat') ||
    scheme.includes('PM-JAY') ||
    scheme.includes('CGHS') ||
    scheme.includes('Star Health') ||
    scheme.includes('HDFC ERGO');

  const finalPayableAdvance = isCashlessScheme ? 0 : baseDeposit;

  return {
    tariff,
    consultation,
    erEntry,
    bedCost,
    ventilatorCost,
    ambulanceCost,
    subtotalEstimate,
    baseDeposit,
    isCashlessScheme,
    finalPayableAdvance,
    insuranceCoverageNote: isCashlessScheme
      ? `100% Cashless Pre-Authorization under ${scheme}. Zero upfront deposit required.`
      : 'Standard emergency deposit (adjusted against final discharge bill).',
  };
}
