import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getReviews, submitHospitalReview } from '../lib/supabase';
import { getHospitalTariff } from '../lib/pricingData';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  HeartPulse,
  Star,
  CheckCircle,
  AlertCircle,
  Navigation,
  Ambulance,
  FileText,
  User,
  ShieldCheck,
  Send,
  Loader2,
  ArrowLeft,
  CreditCard
} from 'lucide-react';

export default function HospitalDetailsView() {
  const {
    selectedHospital,
    navigate,
    user,
    openAuthModal,
    openBookingModal,
    generateEmergencySummary,
  } = useApp();

  const h = selectedHospital;
  const [imgError, setImgError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // New review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!h) return;
    async function loadReviews() {
      setLoadingReviews(true);
      try {
        const revs = await getReviews(h.id);
        setReviews(revs);
      } catch (err) {
        console.warn('Failed loading reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadReviews();
  }, [h]);

  if (!h) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-slate-600">No hospital selected.</p>
        <button
          onClick={() => navigate('decision')}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white"
        >
          View Hospitals
        </button>
      </div>
    );
  }

  const beds = h.beds || {};
  const doctors = h.doctors || [];
  const ambulances = h.ambulances || [];
  const cards = h.cards || [];
  const tariff = getHospitalTariff(h.id);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!user) {
      openAuthModal('signin');
      return;
    }
    if (!comment.trim()) {
      setReviewError('Please write a short comment about your emergency experience.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const newRev = await submitHospitalReview({
        hospital_id: h.id,
        user_id: user.id,
        rating,
        comment: comment.trim(),
      });

      setReviews([newRev, ...reviews]);
      setComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24">
      {/* Back button */}
      <button
        onClick={() => navigate('decision')}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Decision Intelligence
      </button>

      {/* Main Details Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Banner with Hospital Image or Safe Fallback */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900 overflow-hidden">
          {!imgError && h.image_url ? (
            <img
              src={h.image_url}
              alt={h.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-800">
              <Building2 className="h-16 w-16 text-slate-500 mb-2" />
              <span className="text-base font-bold text-white">🏥 Hospital Image Unavailable</span>
              <span className="text-xs text-slate-400 mt-1">Verified infrastructure live record</span>
            </div>
          )}

          {/* Gradients and Details Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase shadow-sm ${
                    h.emergency_status === 'open' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {h.emergency_status === 'open' ? '● ER Open 24/7' : '● High Triage Load'}
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold">
                  ⭐ {h.rating} Rating
                </span>
                <span className="rounded-full bg-red-600/80 px-2.5 py-0.5 text-xs font-bold">
                  NABH Accredited
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold">{h.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                {h.address}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={`tel:${h.emergency_phone || h.phone}`}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                Call ER Desk
              </a>
              <button
                onClick={() => openBookingModal(h)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2.5 text-xs font-bold text-white hover:brightness-105 shadow-md transition-all"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Book ER Slot
              </button>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-10 space-y-10">
          {/* Bed & Critical Care Capacity */}
          <section>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-red-600" />
              Real-Time Bed & Resource Availability
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500 block mb-1">General Beds</span>
                <span className="text-2xl font-extrabold text-slate-900">{beds.general_available || 0}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Available</span>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4">
                <span className="text-xs text-red-800 font-semibold block mb-1">ICU Beds</span>
                <span className="text-2xl font-extrabold text-red-950">{beds.icu_available || 0}</span>
                <span className="text-[10px] text-red-700 font-bold block mt-1">
                  {beds.icu_available > 0 ? 'Ready For Admission' : 'Capacity 0'}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500 block mb-1">ER Trauma Bays</span>
                <span className="text-2xl font-extrabold text-slate-900">{beds.emergency_available || 0}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Active</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500 block mb-1">Ventilators</span>
                <span className="text-2xl font-extrabold text-slate-900">{beds.ventilator_available || 0}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Operational</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 block mb-1">Oxygen Pipeline</span>
                <span className="text-2xl font-extrabold text-slate-900">{beds.oxygen_available || 0}</span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Pressure OK</span>
              </div>
            </div>
          </section>

          {/* 💰 Transparent Charges & Tariffs Section */}
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-red-600" />
                  Transparent Emergency Tariff & Treatment Charges
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Published emergency rates. Cashless pre-authorization available for verified schemes.
                </p>
              </div>
              <button
                onClick={() => openBookingModal(h)}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors shrink-0"
              >
                Book Admission Slot
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <span className="text-slate-500 block mb-1">Doctor Consultation</span>
                <div className="text-lg font-bold text-slate-900">₹{tariff.doctorConsultation}</div>
                <span className="text-[10px] text-slate-400">Emergency physician assessment</span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <span className="text-slate-500 block mb-1">General Bed (24h)</span>
                <div className="text-lg font-bold text-slate-900">₹{tariff.generalBedPerDay}</div>
                <span className="text-[10px] text-slate-400">Nursing care & monitoring</span>
              </div>

              <div className="rounded-2xl bg-white border border-red-200 p-4 bg-red-50/30">
                <span className="text-red-800 font-semibold block mb-1">ICU Bed with Ventilator (24h)</span>
                <div className="text-lg font-bold text-red-950">₹{tariff.icuBedPerDay}</div>
                <span className="text-[10px] text-red-700 font-medium">Critical care monitoring</span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <span className="text-slate-500 block mb-1">Ambulance Base Fare</span>
                <div className="text-lg font-bold text-slate-900">₹{tariff.ambulanceBls}</div>
                <span className="text-[10px] text-slate-400">+ ₹{tariff.ambulancePerKm}/km distance</span>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <span className="text-slate-500 block mb-1">Oxygen Pipeline</span>
                <div className="text-lg font-bold text-slate-900">₹{tariff.oxygenPerHour}/hr</div>
                <span className="text-[10px] text-slate-400">High-flow cannula support</span>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                <span className="text-emerald-800 font-bold block mb-1">Cashless Admission Advance</span>
                <div className="text-lg font-black text-emerald-950">₹0 (100% Cashless)</div>
                <span className="text-[10px] text-emerald-700 font-medium">Ayushman Bharat & Star Health</span>
              </div>
            </div>
          </section>

          {/* Doctors On Duty */}
          <section>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-red-600" />
              On-Duty Specialists in Emergency Wing
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {doctors.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      doc.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.availability || 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Accepted Health Schemes */}
          <section>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Verified Cashless Health Schemes & Cards
            </h3>
            <div className="flex flex-wrap gap-2">
              {cards.map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-900"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Hospital Reviews Section */}
          <section className="border-t border-slate-200 pt-8">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Patient & Family Verified Reviews
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Saved directly to the Supabase database. Only authenticated emergency patients can submit reviews.
            </p>

            {/* Review submission form */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 mb-8">
              <h4 className="font-bold text-sm text-slate-900 mb-2">Leave a Triage Review</h4>

              {reviewSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-100 p-3 text-xs text-emerald-800">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Review successfully saved to Supabase database!</span>
                </div>
              )}

              {reviewError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-100 p-3 text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        className="text-lg transition-transform hover:scale-110"
                      >
                        {s <= rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe triage response time, doctor availability, and bed setup..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {user ? `Posting as ${user.email}` : 'Sign in required to publish'}
                  </span>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Submit Review
                  </button>
                </div>
              </form>
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="text-center py-6 text-xs text-slate-500">Loading reviews from Supabase...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No patient reviews yet for this hospital. Be the first to share emergency feedback.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          P
                        </div>
                        <span className="text-xs font-bold text-slate-900">{r.user_name || 'Verified Patient'}</span>
                      </div>
                      <span className="text-xs text-amber-500">{'⭐'.repeat(r.rating || 5)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
