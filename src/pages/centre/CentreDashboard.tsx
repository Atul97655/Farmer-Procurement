import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Wheat,
  Scale,
  FlaskConical,
  CheckCircle2,
  Building2,
  Phone,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRScannerSimulator } from '../../components/common/QRScannerSimulator';
import { ProcurementRecord } from '../../types';

export const CentreDashboard: React.FC = () => {
  const { activeCentreId, centres, procurements, callFarmer } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];
  const centreProcurements = procurements.filter(p => p.centreId === currentCentre.id);

  const waitingCount = centreProcurements.filter(p => p.queueStatus === 'Waiting').length;
  const processingCount = centreProcurements.filter(p => p.queueStatus === 'Called' || p.queueStatus === 'Quality Check' || p.queueStatus === 'Weighing').length;
  const completedCount = centreProcurements.filter(p => p.queueStatus === 'Completed').length;

  const totalQuantityProcured = centreProcurements
    .filter(p => p.queueStatus === 'Completed')
    .reduce((sum, p) => sum + (p.weighing?.netWeight || p.declaredQuantity), 0);

  const capacityUtilization = Math.min(100, Math.round((currentCentre.currentLoad / currentCentre.dailyCapacity) * 100));

  const handleTokenSelected = (proc: ProcurementRecord) => {
    if (proc.stage === 'SLOT_ASSIGNED' || proc.stage === 'FARMER_ARRIVED') {
      navigate('/centre/quality-check', { state: { token: proc.tokenNumber } });
    } else if (proc.stage === 'QUALITY_CHECK') {
      navigate('/centre/weighing', { state: { token: proc.tokenNumber } });
    } else {
      navigate('/centre/procurement', { state: { token: proc.tokenNumber } });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Mandi Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-600/30 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                Operating Mandi Node: {currentCentre.code}
              </span>
              <StatusBadge status={currentCentre.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {currentCentre.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentCentre.address} · Officer: {currentCentre.officerInCharge}
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-right">
            <span className="text-xs text-slate-400 block font-semibold">Today's Operating Hours</span>
            <strong className="text-sm text-amber-400 font-mono block mt-0.5">{currentCentre.operatingHours}</strong>
            <span className="text-xs text-slate-400 mt-1 block">Helpdesk: {currentCentre.contactNumber}</span>
          </div>
        </div>

        {/* Real-time Capacity Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
            <span className="text-slate-300">Daily Intake Capacity Utilization</span>
            <span className={capacityUtilization > 85 ? 'text-rose-400' : 'text-emerald-400'}>
              {currentCentre.currentLoad} / {currentCentre.dailyCapacity} Quintals ({capacityUtilization}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityUtilization >= 90
                  ? 'bg-rose-500'
                  : capacityUtilization >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${capacityUtilization}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Waiting in Yard"
          value={waitingCount}
          subtitle="Vehicles in queue"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="In Processing"
          value={processingCount}
          subtitle="Quality Lab & Scales"
          icon={FlaskConical}
          color="blue"
        />
        <StatCard
          title="Completed Today"
          value={completedCount}
          subtitle="Settled procurements"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Procured Volume"
          value={`${totalQuantityProcured} Qtl`}
          subtitle="Verified Net Weight"
          icon={Scale}
          color="purple"
        />
      </div>

      {/* Optical Scanner & Token Lookup Simulator */}
      <QRScannerSimulator onTokenSelected={handleTokenSelected} />

      {/* Live Yard Operations Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Today's Active Yard Queue</h2>
            <p className="text-xs text-slate-500">Call farmers, update inspection results, and weigh goods</p>
          </div>

          <button
            onClick={() => navigate('/centre/queue')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Full Queue Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Crop & Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {centreProcurements.slice(0, 6).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                    {item.tokenNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <div>{item.farmerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.farmerPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <strong className="text-slate-900">{item.cropType}</strong>
                    <div className="text-emerald-700 font-bold">{item.declaredQuantity} Qtl</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.queueStatus} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.queueStatus === 'Waiting' && (
                      <button
                        onClick={() => callFarmer(item.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Call to Gate
                      </button>
                    )}
                    {item.queueStatus === 'Called' && (
                      <button
                        onClick={() => navigate('/centre/quality-check', { state: { token: item.tokenNumber } })}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Start Quality Lab
                      </button>
                    )}
                    {item.queueStatus === 'Quality Check' && (
                      <button
                        onClick={() => navigate('/centre/weighing', { state: { token: item.tokenNumber } })}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Start Weighbridge
                      </button>
                    )}
                    {item.queueStatus === 'Weighing' && (
                      <button
                        onClick={() => navigate('/centre/procurement', { state: { token: item.tokenNumber } })}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Complete Procurement
                      </button>
                    )}
                    {item.queueStatus === 'Completed' && (
                      <span className="text-emerald-700 font-bold text-xs">✓ J-Form Issued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
