import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronRight,
  Brain,
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DEMO_STEPS = [
  {
    title: '1. Accident Emergency Selection',
    desc: 'Simulating severe accident case needing immediate triage response.',
    action: (ctx) => {
      ctx.setSearchCriteria(prev => ({
        ...prev,
        emergencyType: 'Accident Emergency',
        emergencyRequired: true,
      }));
      ctx.navigate('search');
    }
  },
  {
    title: '2. ICU & Critical Facility Check',
    desc: 'Flagging ICU and Ventilator requirement in search criteria.',
    action: (ctx) => {
      ctx.setSearchCriteria(prev => ({
        ...prev,
        icuRequired: true,
        facility: 'Ventilator',
        preferredCard: 'Ayushman Bharat (PM-JAY)',
      }));
      ctx.navigate('search');
    }
  },
  {
    title: '3. Decision Intelligence Analysis',
    desc: 'Running multi-factor analysis across beds, doctors, and distance.',
    action: (ctx) => {
      ctx.navigate('decision');
    }
  },
  {
    title: '4. Decision Insights Inspection',
    desc: 'Reviewing transparent contributing factors and cautions.',
    action: (ctx) => {
      ctx.navigate('decision');
    }
  },
  {
    title: '5. Compare Hospitals Matrix',
    desc: 'Side-by-side comparative table evaluating multiple hospitals.',
    action: (ctx) => {
      ctx.navigate('compare');
    }
  },
  {
    title: '6. Hospital Selection & Bed Inspection',
    desc: 'Selecting top matching hospital and reviewing live bed counts.',
    action: (ctx) => {
      ctx.setSelectedHospital(ctx.hospitals[0]);
      ctx.navigate('details');
    }
  },
  {
    title: '7. Request Emergency Ambulance',
    desc: 'Locating nearest Advanced Life Support (ALS) vehicle.',
    action: (ctx) => {
      ctx.navigate('ambulance');
    }
  },
  {
    title: '8. Live Demo Ambulance Tracking',
    desc: 'Simulating en-route telemetry: User -> Ambulance -> Hospital.',
    action: (ctx) => {
      ctx.navigate('tracker');
    }
  },
  {
    title: '9. Route Intelligence & Traffic Bypass',
    desc: 'Testing dynamic traffic warning and switching to Route B.',
    action: (ctx) => {
      ctx.navigate('route');
    }
  },
  {
    title: '10. Emergency Summary Receipt',
    desc: 'Generating official, printable emergency decision summary.',
    action: (ctx) => {
      ctx.generateEmergencySummary(ctx.hospitals[0]);
    }
  }
];

export default function DemoModeModal() {
  const ctx = useApp();
  const { demoModeActive, stopDemoMode } = ctx;
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!demoModeActive) return;

    // Execute current step action
    DEMO_STEPS[currentStep].action(ctx);

    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < DEMO_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [demoModeActive, currentStep, isPlaying]);

  if (!demoModeActive) return null;

  const step = DEMO_STEPS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / DEMO_STEPS.length) * 100);

  function handleNext() {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }

  function handleRestart() {
    setCurrentStep(0);
    setIsPlaying(true);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl animate-fade-in no-print demo-controls">
      <div className="overflow-hidden rounded-3xl border border-amber-400 bg-slate-950 p-4 shadow-2xl text-white ring-2 ring-amber-400/40 backdrop-blur-md">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-red-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-sm">
              {currentStep + 1}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Hackathon Judge Demo • Step {currentStep + 1} of {DEMO_STEPS.length}</span>
              </div>
              <h4 className="font-bold text-sm text-white leading-tight">{step.title}</h4>
              <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 p-2 text-xs font-bold text-white transition-colors"
              title={isPlaying ? 'Pause auto-play' : 'Resume auto-play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            </button>
            <button
              onClick={handleRestart}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 p-2 text-xs font-bold text-white transition-colors"
              title="Restart Demo"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep >= DEMO_STEPS.length - 1}
              className="flex items-center gap-1 rounded-xl bg-amber-400 hover:bg-amber-300 px-3 py-2 text-xs font-bold text-slate-950 transition-colors disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={stopDemoMode}
              className="rounded-xl bg-slate-800 hover:bg-red-900/60 p-2 text-slate-400 hover:text-white transition-colors"
              title="Exit Demo Mode"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
