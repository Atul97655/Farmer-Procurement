import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Phone,
  Radio,
  FlaskConical,
  Scale,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Building2,
  Filter
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QueueStatus } from '../../types';
import { GateCheckinScanner } from '../../components/centre/GateCheckinScanner';

export const CentreQueueManager: React.FC = () => {
  const { activeCentreId, centres, procurements, callFarmer, updateQueueStatus } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];
  const centreProcurements = procurements.filter(p => p.centreId === currentCentre.id);

  const filteredItems = centreProcurements.filter(item => {
    const matchesSearch =
      item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farmerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cropType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.queueStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">Operating Centre</span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {currentCentre.code}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Yard Queue & Inward Management Console
          </h1>
          <p className="text-xs text-slate-500">
            {currentCentre.name} · Direct action console for calling, laboratory routing and scale entries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.open('/display', '_blank')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Launch Mandi TV Kiosk
          </button>
        </div>
      </div>

      {/* Gate Arrival Scanner */}
      <GateCheckinScanner />

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: `All Tokens (${centreProcurements.length})` },
            { id: 'Waiting', label: `Waiting (${centreProcurements.filter(p => p.queueStatus === 'Waiting').length})` },
            { id: 'Called', label: `Called (${centreProcurements.filter(p => p.queueStatus === 'Called').length})` },
            { id: 'Quality Check', label: `Quality Lab (${centreProcurements.filter(p => p.queueStatus === 'Quality Check').length})` },
            { id: 'Weighing', label: `Weighbridge (${centreProcurements.filter(p => p.queueStatus === 'Weighing').length})` },
            { id: 'Completed', label: `Completed (${centreProcurements.filter(p => p.queueStatus === 'Completed').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search token, farmer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3.5 px-4">Token</th>
                <th className="py-3.5 px-4">Farmer Details</th>
                <th className="py-3.5 px-4">Crop & Declared Qty</th>
                <th className="py-3.5 px-4">Slot Time</th>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Queue Status</th>
                <th className="py-3.5 px-4 text-right">Yard Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                    {item.tokenNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900">{item.farmerName}</strong>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {item.farmerPhone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{item.cropType}</div>
                    <strong className="text-emerald-800">{item.declaredQuantity} Quintals</strong>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.slotTime}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {item.transportMode}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.queueStatus} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.queueStatus === 'Waiting' && (
                        <button
                          onClick={() => callFarmer(item.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Radio className="w-3 h-3" />
                          <span>Call Farmer</span>
                        </button>
                      )}

                      {item.queueStatus === 'Called' && (
                        <button
                          onClick={() => navigate('/centre/quality-check', { state: { token: item.tokenNumber } })}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FlaskConical className="w-3 h-3" />
                          <span>Quality Lab</span>
                        </button>
                      )}

                      {item.queueStatus === 'Quality Check' && (
                        <button
                          onClick={() => navigate('/centre/weighing', { state: { token: item.tokenNumber } })}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Weighbridge</span>
                        </button>
                      )}

                      {item.queueStatus === 'Weighing' && (
                        <button
                          onClick={() => navigate('/centre/procurement', { state: { token: item.tokenNumber } })}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}

                      {item.queueStatus === 'Completed' && (
                        <span className="text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                          ✓ Settled
                        </span>
                      )}

                      {item.queueStatus !== 'Completed' && item.queueStatus !== 'Cancelled' && (
                        <button
                          onClick={() => updateQueueStatus(item.id, 'Hold')}
                          title="Put on Hold"
                          className="text-amber-700 hover:bg-amber-100 p-1.5 rounded-md text-xs cursor-pointer"
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No tokens found matching this filter in {currentCentre.name}.
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
