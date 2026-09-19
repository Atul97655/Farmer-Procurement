import React, { useState, useEffect } from 'react';
import { Smartphone, MessageSquare, X, ShieldCheck, RefreshCw, Send } from 'lucide-react';
import { api, SmsLogItem } from '../../services/api';
import { useAppState } from '../../context/AppStateContext';

export const SmsSimulatorDrawer: React.FC = () => {
  const { activeFarmer } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [smsList, setSmsList] = useState<SmsLogItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchSms = async () => {
    setLoading(true);
    try {
      const logs = await api.getSmsLogs();
      if (logs && logs.length > 0) {
        setSmsList(logs);
      }
    } catch {
      // Local fallback
      setSmsList(prev => prev.length > 0 ? prev : [
        {
          id: 'SMS-DEMO-01',
          recipientPhone: activeFarmer?.phone || '+91 98765 43210',
          senderId: 'VM-KRISHI',
          templateId: 'DLT_SLOT_BOOKED',
          message: `Dear ${activeFarmer?.name || 'Farmer'}, your mandi procurement slot is CONFIRMED. Token: PDC-1042 at Digha Central Procurement Centre. Arrive 15 mins early. - Dept of Food & Public Distribution`,
          status: 'DELIVERED',
          sentAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSms();

    // Listen for live SMS delivery over SSE
    const unsubscribe = api.subscribeEvents((event) => {
      if (event.type === 'SMS_DELIVERED') {
        const record = event.payload as SmsLogItem;
        if (record) {
          setSmsList(prev => [record, ...prev]);
          setUnreadCount(c => c + 1);
        }
      }
    });

    return () => unsubscribe();
  }, [activeFarmer]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    fetchSms();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-700/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
        title="Simulated Mobile Phone SMS Inbox"
      >
        <div className="relative">
          <Smartphone className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Farmer Mobile SMS ({smsList.length})
        </span>
      </button>

      {/* Slide-over Phone Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-[2.5rem] p-3.5 border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[92vh]">
            {/* Phone Speaker & Notch */}
            <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Phone Screen */}
            <div className="flex-1 bg-slate-100 rounded-[1.8rem] flex flex-col overflow-hidden text-slate-900">
              {/* Phone Status Bar */}
              <div className="bg-emerald-800 text-white px-4 py-2 flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold">09:42</span>
                <div className="flex items-center gap-2">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* SMS App Header */}
              <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    VK
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-slate-800">VM-KRISHI</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[10px] text-slate-500">Govt of India • Dept of Food & PD</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={fetchSms}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                    title="Refresh SMS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SMS Chat Feed */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50">
                <div className="text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-mono">
                    Official DLT Registry: GOV-FCI-SMS
                  </span>
                </div>

                {smsList.length > 0 ? (
                  smsList.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="bg-white rounded-2xl rounded-tl-sm p-3 border border-slate-200 shadow-sm text-xs text-slate-800 leading-relaxed font-sans">
                        <p>{item.message}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
                        <span>DLT: {item.templateId || 'DLT_GOV_ALERT'}</span>
                        <span>{new Date(item.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No SMS messages received yet.
                  </div>
                )}
              </div>

              {/* Simulated reply bar (read-only info) */}
              <div className="bg-white p-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>SIM 1: Jio 5G • Verified</span>
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <Send className="w-3 h-3" /> Auto-Synced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
