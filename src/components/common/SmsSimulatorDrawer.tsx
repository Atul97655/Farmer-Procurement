import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Smartphone, MessageSquare, X, ShieldCheck, RefreshCw, Send, BellRing, Volume2 } from 'lucide-react';
import { api, SmsLogItem } from '../../services/api';
import { useAppState } from '../../context/AppStateContext';

/**
 * Play subtle synthesized audio ping for incoming SMS delivery
 */
const playSmsNotificationBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Pleasant dual chime: 587Hz (D5) -> 880Hz (A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be restricted before user gesture
  }
};

export const SmsSimulatorDrawer: React.FC = () => {
  const { activeFarmer, smsLogs } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'farmer' | 'all'>('farmer');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Clean active farmer phone for matching
  const cleanActivePhone = useMemo(() => {
    return (activeFarmer?.phone || '').replace(/[^0-9]/g, '');
  }, [activeFarmer?.phone]);

  // Merge context smsLogs with any fetched server logs
  const [serverSms, setServerSms] = useState<SmsLogItem[]>([]);

  const fetchServerSms = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await api.getSmsLogs();
      if (logs && logs.length > 0) {
        setServerSms(logs);
      }
    } catch {
      // Backend offline, fallback to context
    } finally {
      setLoading(false);
    }
  }, []);

  // Combined and sorted SMS list
  const allMergedSms = useMemo(() => {
    const map = new Map<string, SmsLogItem>();
    // Context local/synced logs first
    (smsLogs || []).forEach(item => map.set(item.id, item));
    // Server logs
    serverSms.forEach(item => map.set(item.id, item));

    const list = Array.from(map.values());
    return list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [smsLogs, serverSms]);

  // Filtered by active registered farmer or all
  const displayedSms = useMemo(() => {
    if (filterMode === 'all') return allMergedSms;

    return allMergedSms.filter(item => {
      const itemPhone = (item.recipientPhone || '').replace(/[^0-9]/g, '');
      const matchesPhone = cleanActivePhone && (itemPhone.includes(cleanActivePhone) || cleanActivePhone.includes(itemPhone));
      const matchesFarmerId = item.meta?.farmerId && item.meta.farmerId === activeFarmer.id;
      const matchesFarmerName = activeFarmer.name && item.message.toLowerCase().includes(activeFarmer.name.toLowerCase());
      return matchesPhone || matchesFarmerId || matchesFarmerName;
    });
  }, [allMergedSms, filterMode, cleanActivePhone, activeFarmer]);

  // Initial fetch and real-time listeners
  useEffect(() => {
    fetchServerSms();

    const handleIncomingSms = (record: SmsLogItem) => {
      if (!record) return;
      if (soundEnabled) {
        playSmsNotificationBeep();
      }
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {}
      }
      setUnreadCount(c => c + 1);
    };

    // 1. Listen for backend SSE SMS
    const unsubscribe = api.subscribeEvents((event) => {
      if (event.type === 'SMS_DELIVERED') {
        const record = event.payload as SmsLogItem;
        handleIncomingSms(record);
      }
    });

    // 2. Listen for custom window event (dispatched immediately upon slot booking in frontend)
    const handleCustomWindowSms = (e: Event) => {
      const customEvent = e as CustomEvent<SmsLogItem>;
      if (customEvent.detail) {
        handleIncomingSms(customEvent.detail);
      }
    };

    // 3. Listen for command to open SMS drawer
    const handleOpenDrawer = () => {
      setIsOpen(true);
      setUnreadCount(0);
      fetchServerSms();
    };

    window.addEventListener('SMS_DELIVERED', handleCustomWindowSms);
    window.addEventListener('OPEN_SMS_DRAWER', handleOpenDrawer);

    return () => {
      unsubscribe();
      window.removeEventListener('SMS_DELIVERED', handleCustomWindowSms);
      window.removeEventListener('OPEN_SMS_DRAWER', handleOpenDrawer);
    };
  }, [fetchServerSms, soundEnabled]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    fetchServerSms();
  };

  return (
    <>
      {/* Floating Mobile Phone Drawer Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-900/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer border border-emerald-400/30"
        title="Open Simulated Farmer Mobile Phone (SMS Inbox)"
      >
        <div className="relative">
          <Smartphone className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-xs font-black tracking-wide flex items-center gap-1">
            Farmer Mobile SMS
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            )}
          </span>
          <span className="text-[10px] text-emerald-200 truncate max-w-[140px]">
            {activeFarmer.name}
          </span>
        </div>
      </button>

      {/* Slide-over Realistic Smartphone Device Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-[2.8rem] p-3.5 border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[670px] max-h-[94vh] animate-in slide-in-from-bottom-6 duration-200">
            {/* Phone Speaker & Front Camera Notch */}
            <div className="w-28 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center gap-2 shrink-0">
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800"></div>
            </div>

            {/* Phone Screen Container */}
            <div className="flex-1 bg-slate-100 rounded-[2rem] flex flex-col overflow-hidden text-slate-900 shadow-inner">
              
              {/* Phone System Status Bar */}
              <div className="bg-emerald-900 text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-mono shrink-0">
                <span className="font-bold">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span>Jio 5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Messaging App Bar */}
              <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between shadow-xs shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    KQ
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-black text-slate-800 tracking-tight">VM-KISANQ</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Govt of Odisha • Dept of Food & PD
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <BellRing className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  <button
                    onClick={fetchServerSms}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Refresh SMS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Farmer Recipient Banner */}
              <div className="bg-emerald-50/90 border-b border-emerald-200/60 px-3 py-1.5 flex items-center justify-between text-[11px] text-emerald-900 shrink-0">
                <div className="truncate">
                  <span className="text-emerald-700 font-medium">Recipient: </span>
                  <strong className="text-emerald-950 font-bold">{activeFarmer.name}</strong>
                  <span className="text-emerald-600 font-mono text-[10px] ml-1">({activeFarmer.phone})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => setFilterMode('farmer')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      filterMode === 'farmer'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    My SMS
                  </button>
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      filterMode === 'all'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    All ({allMergedSms.length})
                  </button>
                </div>
              </div>

              {/* SMS Chat Feed */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50">
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-200/80 text-slate-600 font-mono inline-block">
                    Official Govt DLT Registry: GOV-FCI-SMS
                  </span>
                </div>

                {displayedSms.length > 0 ? (
                  displayedSms.map((item) => {
                    const isForCurrentFarmer = activeFarmer.name && item.message.toLowerCase().includes(activeFarmer.name.toLowerCase());

                    return (
                      <div key={item.id} className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl rounded-tl-xs p-3.5 border shadow-2xs text-xs leading-relaxed font-sans transition-all ${
                            isForCurrentFarmer
                              ? 'bg-white border-emerald-300 text-slate-900 ring-1 ring-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          {/* Recipient Tag */}
                          <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-100 text-[10px]">
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {item.meta?.farmerName ? String(item.meta.farmerName) : (activeFarmer.name || 'Registered Farmer')}
                            </span>
                            <span className="font-mono text-slate-400">{item.recipientPhone}</span>
                          </div>

                          <p className="font-medium whitespace-pre-wrap">{item.message}</p>
                        </div>

                        {/* Meta footer */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                          <span>DLT: {item.templateId || 'DLT_SLOT_BOOKED'}</span>
                          <span>
                            {new Date(item.sentAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-40" />
                    <p className="font-medium">No SMS messages found for {activeFarmer.name}.</p>
                    <p className="text-[11px] text-slate-400">
                      Book a procurement slot to receive an instant official SMS confirmation.
                    </p>
                  </div>
                )}
              </div>

              {/* Phone SIM Footer */}
              <div className="bg-white p-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-mono shrink-0">
                <span className="truncate">SIM 1: {activeFarmer.phone}</span>
                <span className="text-emerald-700 flex items-center gap-1 font-bold shrink-0">
                  <Send className="w-3 h-3" /> Verified Live
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
