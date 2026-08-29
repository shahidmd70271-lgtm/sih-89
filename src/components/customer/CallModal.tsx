import React, { useState, useEffect } from 'react';
import { X, Phone, PhoneOff, Mic, MicOff, Volume2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CallModal: React.FC = () => {
  const { activeBooking, isCallModalOpen, setIsCallModalOpen, t } = useApp();
  const [callStatus, setCallStatus] = useState<'Connecting' | 'Ringing' | 'Connected' | 'Ended'>('Connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isCallModalOpen) return;

    setCallStatus('Connecting');
    setCallDuration(0);

    const timer1 = setTimeout(() => {
      setCallStatus('Ringing');
    }, 1000);

    const timer2 = setTimeout(() => {
      setCallStatus('Connected');
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isCallModalOpen]);

  useEffect(() => {
    if (callStatus !== 'Connected') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isCallModalOpen || !activeBooking) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('Ended');
    setTimeout(() => {
      setIsCallModalOpen(false);
    }, 600);
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'Connecting':
        return t('callConnecting');
      case 'Ringing':
        return t('callRinging');
      case 'Connected':
        return t('callConnected');
      case 'Ended':
        return t('callEnded');
      default:
        return callStatus;
    }
  };

  const translatedSkill = t(`service_${activeBooking.workerSkill.replace(/[\s&]+/g, '')}`) || activeBooking.workerSkill;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-8 text-center space-y-6 border border-slate-800 shadow-2xl relative">
        {/* Worker Avatar with Calling Pulse */}
        <div className="relative mx-auto w-24 h-24">
          <img
            src={activeBooking.workerAvatar}
            alt={activeBooking.workerName}
            className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-xl"
          />
          {callStatus === 'Connected' && (
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
              🔊
            </span>
          )}
        </div>

        {/* Worker Name & Status */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">{activeBooking.workerName}</h3>
          <p className="text-xs text-emerald-400 font-semibold">
            {translatedSkill} • {activeBooking.workerPhone}
          </p>
          <div className="text-xs text-slate-400 font-mono pt-1">
            {callStatus === 'Connected' ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {t('inCall')} ({formatSeconds(callDuration)})
              </span>
            ) : (
              <span>{getStatusText()}...</span>
            )}
          </div>
        </div>

        {/* Masked Call Privacy Notice */}
        <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('numberMaskedPrivacy')}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsCallModalOpen(false)}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
