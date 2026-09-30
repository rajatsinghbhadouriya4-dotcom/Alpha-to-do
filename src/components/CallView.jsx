import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { callsAPI } from '../lib/api';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ArrowLeft, Loader2, UserCheck } from 'lucide-react';

export default function CallView() {
  const { navigate, user, selectedHospital } = useApp();
  const [callState, setCallState] = useState('Idle'); // Idle, Calling, Connecting, Connected, Ended, Error
  const [callData, setCallData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const timerRef = useRef(null);

  // Auto-start call when component mounts
  useEffect(() => {
    startCall();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (callState === 'Connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [callState]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    if (!user) {
      setCallState('Error');
      setErrorMsg('You must be logged in to make a call.');
      return;
    }

    try {
      setCallState('Calling');
      // For demo, we mock the receiver ID based on hospital name or a fallback string
      const receiverId = selectedHospital?.id || 'consultant-id-123';
      
      const res = await callsAPI.createCall(receiverId, 'audio');
      if (res.success) {
        setCallData(res.call);
        // Simulate network delay and auto-accept
        setTimeout(() => setCallState('Connecting'), 1500);
        setTimeout(() => simulateReceiverAccept(res.call.id), 3500);
      } else {
        setCallState('Error');
        setErrorMsg(res.error || 'Failed to initiate call');
      }
    } catch (err) {
      setCallState('Error');
      setErrorMsg(err.message || 'Network error');
    }
  };

  const simulateReceiverAccept = async (callId) => {
    try {
      const res = await callsAPI.acceptCall(callId);
      if (res.success) {
        setCallData(res.call);
        setCallState('Connected');
      }
    } catch (err) {
      console.warn('Simulation failed', err);
    }
  };

  const handleEndCall = async () => {
    if (callData && callData.id && callState !== 'Ended') {
      try {
        await callsAPI.endCall(callData.id);
      } catch (err) {
        console.error('Failed to update call status', err);
      }
    }
    setCallState('Ended');
  };

  const receiverName = selectedHospital?.name ? `Consultant at ${selectedHospital.name}` : 'Emergency Consultant';

  return (
    <div className="mx-auto max-w-md px-4 py-8 h-[calc(100vh-100px)] flex flex-col justify-center">
      <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center border-4 border-slate-800 h-[600px] max-h-full">
        
        {/* Back button (only show when ended or error) */}
        {(callState === 'Ended' || callState === 'Error') && (
          <button 
            onClick={() => navigate('consultant')}
            className="absolute top-8 left-8 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}

        <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
          
          {/* Avatar Area */}
          <div className="relative mb-8">
            <div className={`h-32 w-32 rounded-full bg-purple-600 flex items-center justify-center shadow-lg ${
              (callState === 'Calling' || callState === 'Connecting') ? 'animate-pulse' : ''
            }`}>
              <UserCheck className="h-14 w-14 text-white" />
            </div>
            
            {callState === 'Connected' && (
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
            )}
          </div>

          {/* Contact Name & Status */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide px-4 text-center line-clamp-2">
              {receiverName}
            </h2>
            
            {callState === 'Error' ? (
              <p className="text-red-400 text-sm font-medium">{errorMsg}</p>
            ) : callState === 'Ended' ? (
              <p className="text-slate-400 text-sm font-medium">Call Ended</p>
            ) : callState === 'Connected' ? (
              <p className="text-emerald-400 font-mono text-lg">{formatDuration(callDuration)}</p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-purple-300 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                {callState}...
              </div>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="w-full flex items-center justify-center gap-6 pb-6 z-10">
          {/* Only show Mute/Speaker if active call */}
          {callState !== 'Ended' && callState !== 'Error' && (
            <>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>

              <button 
                onClick={handleEndCall}
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="h-7 w-7" />
              </button>

              <button 
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                  isSpeakerOn ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </button>
            </>
          )}

          {/* Show a Return button if ended/error */}
          {(callState === 'Ended' || callState === 'Error') && (
            <button 
              onClick={() => navigate('consultant')}
              className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:bg-slate-100 transition-colors"
            >
              Return to Previous
            </button>
          )}
        </div>
        
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
