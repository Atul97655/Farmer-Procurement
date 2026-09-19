import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  Radio,
  Building2,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { KishanSahayakVoice } from '../../components/farmer/KishanSahayakVoice';

export const LiveQueuePage: React.FC = () => {
  const { activeFarmer, activeCentreId, centres, procurements, syncNow, lastSyncTime } = useAppState();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Find current farmer's active record
  const currentFarmerProc = procurements.find(
    p => p.farmerId === activeFarmer.id && p.queueStatus !== 'Cancelled'
  );

  const centreIdToUse = currentFarmerProc?.centreId || activeCentreId;
  const currentCentre = centres.find(c => c.id === centreIdToUse) || centres[0];

  // All active queue items for this Mandi
  const yardQueue = procurements.filter(
    p => p.centreId === currentCentre.id && p.queueStatus !== 'Cancelled'
  );

  // Determine currently serving token
  const currentlyServing = yardQueue.find(
    p => p.queueStatus === 'Weighing' || p.queueStatus === 'Quality Check' || p.queueStatus === 'Called'
  ) || yardQueue[0];

  // Filtered queue items
  const filteredQueue = yardQueue.filter(p =>
    p.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.cropType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              Live Mandi Queue Broadcast
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {currentCentre.name}
          </h1>
          <p className="text-xs text-slate-500">
            Real-time yard tracking · Auto-refreshed with digital scale and lab updates
          </p>
        </div>

        <button
          onClick={syncNow}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Your Token */}
        <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-300 shadow-xs">
          <span className="text-xs uppercase font-bold text-amber-800 block">
            {t.yourToken}
          </span>
          <div className="text-3xl font-black text-amber-950 font-mono tracking-wider mt-1">
            {currentFarmerProc ? currentFarmerProc.tokenNumber : 'No Token'}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            {currentFarmerProc ? `${currentFarmerProc.cropType} (${currentFarmerProc.declaredQuantity} Qtl)` : 'Register crop to get token'}
          </span>
        </div>

        {/* 2. Currently Serving */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 shadow-xs">
          <span className="text-xs uppercase font-bold text-blue-800 flex items-center gap-1">
            <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
            {t.currentlyServing}
          </span>
          <div className="text-3xl font-black text-blue-950 font-mono tracking-wider mt-1">
            {currentlyServing ? currentlyServing.tokenNumber : 'None'}
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">
            Status: <strong>{currentlyServing?.queueStatus || 'Idle'}</strong>
          </span>
        </div>

        {/* 3. Farmers Ahead */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-500 block">
            Farmers Ahead of You
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {currentFarmerProc
              ? (currentFarmerProc.queueStatus === 'Completed' ? 0 : currentFarmerProc.queuePosition)
              : yardQueue.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Total {yardQueue.length} vehicles in yard
          </span>
        </div>

        {/* 4. Dynamic Estimated Wait */}
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-xs">
          <span className="text-xs uppercase font-bold text-emerald-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            {t.estimatedWait}
          </span>
          <div className="text-3xl font-black text-emerald-950 mt-1">
            {currentFarmerProc
              ? (currentFarmerProc.queueStatus === 'Completed' ? '0 min' : `~${currentFarmerProc.estimatedWaitMinutes} min`)
              : `~${yardQueue.length * 7} min`}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            Avg {currentCentre.avgProcessingTimeMinutes} mins per farmer
          </span>
        </div>

      </div>

      {/* Kishan Sahayak AI Voice Assistant */}
      <KishanSahayakVoice
        procurement={currentFarmerProc}
        centreName={currentCentre.name}
        queuePosition={currentFarmerProc ? currentFarmerProc.queuePosition : 4}
        estimatedWaitMinutes={currentFarmerProc ? currentFarmerProc.estimatedWaitMinutes : 35}
      />

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Token Number, Farmer Name or Crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Highlighted row = Your Token</span>
        </div>
      </div>

      {/* Live Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Pos</th>
                <th className="py-3.5 px-4">Token</th>
                <th className="py-3.5 px-4">Farmer Name</th>
                <th className="py-3.5 px-4">Crop & Quantity</th>
                <th className="py-3.5 px-4">Slot Time</th>
                <th className="py-3.5 px-4">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item, index) => {
                const isCurrentFarmer = item.farmerId === activeFarmer.id;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isCurrentFarmer
                        ? 'bg-emerald-50/90 font-semibold text-emerald-950 border-l-4 border-l-emerald-600'
                        : 'hover:bg-slate-50/70 text-slate-800'
                    }`}
                  >
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      #{index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-black text-sm">
                        <span className={isCurrentFarmer ? 'text-emerald-900' : 'text-slate-900'}>
                          {item.tokenNumber}
                        </span>
                        {isCurrentFarmer && (
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-sans font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.farmerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.farmerId}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-slate-800">{item.cropType}</div>
                      <div className="text-xs text-emerald-700 font-bold">{item.declaredQuantity} Quintals</div>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600">
                      {item.slotTime}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={item.queueStatus} size="sm" />
                    </td>
                  </tr>
                );
              })}

              {filteredQueue.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    No active tokens matching your filter in this Mandi yard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
