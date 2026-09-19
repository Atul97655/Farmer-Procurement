import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Building2,
  Clock,
  Wheat,
  Scale,
  Calendar,
  Radio
} from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

export const MandiKioskDisplay: React.FC = () => {
  const { centres, procurements, activeCentreId } = useAppState();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeForCentre = procurements.filter(p => p.centreId === currentCentre.id);
  const calledTokens = activeForCentre.filter(p => p.queueStatus === 'Called');
  const waitingTokens = activeForCentre.filter(p => p.queueStatus === 'Waiting');
  const currentlyServing = calledTokens[0] || activeForCentre.find(p => p.queueStatus === 'Quality Check' || p.queueStatus === 'Weighing');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const playVoiceAnnouncement = (token: string, name: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    const text = `Attention please. Token Number ${token}, Farmer ${name}. Please proceed immediately to Inspection Bay 1.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8">
      {/* Top Banner Header */}
      <header className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE MANDI DISPLAY
              </span>
              <span className="flex items-center gap-1 text-xs text-rose-400 font-mono">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                PUBLIC BROADCAST
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
              {currentCentre.name} ({currentCentre.code})
            </h1>
            <p className="text-xs text-slate-400">{currentCentre.district}, Odisha • Operating Hours: {currentCentre.operatingHours}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Clock */}
          <div className="text-right bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <div className="text-xl font-black font-mono text-amber-400 tracking-wider">
              {currentTime.toLocaleTimeString('en-IN', { hour12: true })}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Controls */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              audioEnabled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle Voice Announcements"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Col: NOW CALLING (Hero Section) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase font-mono tracking-widest bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 animate-pulse">
                  <Radio className="w-4 h-4" />
                  Now Calling to Bay
                </span>

                {currentlyServing && (
                  <button
                    onClick={() => playVoiceAnnouncement(currentlyServing.tokenNumber, currentlyServing.farmerName)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    Announce Again
                  </button>
                )}
              </div>

              {currentlyServing ? (
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
                      TOKEN NUMBER
                    </div>
                    <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(52,211,153,0.3)]">
                      {currentlyServing.tokenNumber}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 block">Farmer Name</span>
                      <span className="text-lg sm:text-xl font-bold text-white">{currentlyServing.farmerName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Vehicle / Transport</span>
                      <span className="text-sm sm:text-base font-semibold text-emerald-300 font-mono">
                        {currentlyServing.transportMode || 'Tractor Trolley'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Commodity</span>
                      <span className="text-base font-semibold text-amber-400">{currentlyServing.cropType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Declared Lot</span>
                      <span className="text-base font-bold text-white">{currentlyServing.declaredQuantity} Quintals</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <Scale className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-xl font-bold text-slate-400">All Active Tokens Cleared</h3>
                  <p className="text-xs text-slate-500">Awaiting arrivals for next time slot.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Est. Turnaround per Trolley: {currentCentre.avgProcessingTimeMinutes} minutes
              </span>
              <span className="font-mono text-emerald-400">Report to: Bay 1 / Electronic Scale</span>
            </div>
          </div>
        </div>

        {/* Right Col: UPCOMING IN LINE */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Next Tokens in Line
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {waitingTokens.length} Waiting
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px]">
              {waitingTokens.length > 0 ? (
                waitingTokens.slice(0, 6).map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-mono font-bold text-sm text-white">{item.tokenNumber}</div>
                        <div className="text-xs text-slate-400">{item.farmerName} • {item.declaredQuantity} Qtl</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        ~{item.estimatedWaitMinutes || (idx + 1) * 7} mins
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No further tokens waiting in queue for this window.
                </div>
              )}
            </div>
          </div>

          {/* Mandi Metrics Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Daily Capacity</span>
              <span className="text-base font-bold text-white">{currentCentre.dailyCapacity} Qtl</span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Today's Load</span>
              <span className="text-base font-bold text-emerald-400">{currentCentre.currentLoad} Qtl</span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">MSP Benchmark</span>
              <span className="text-base font-bold text-amber-400 font-mono">₹2,300/Q</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <footer className="mt-6 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Wheat className="w-3.5 h-3.5" />
            Paddy MSP (Common): ₹2,300/Qtl | Grade A: ₹2,320/Qtl
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline">Max Permissible Moisture: 17.0%</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-500 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Smart Mandi Automation System • SIH26032</span>
        </div>
      </footer>
    </div>
  );
};
