import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  CreditCard,
  PlusCircle,
  QrCode,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Wheat,
  Activity
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRModal } from '../../components/common/QRModal';
import { formatDate } from '../../utils/formatters';

export const FarmerDashboard: React.FC = () => {
  const { activeFarmer, procurements } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedQRRecord, setSelectedQRRecord] = useState<any | null>(null);

  // Get current active procurement for this farmer
  const farmerProcurements = procurements.filter(p => p.farmerId === activeFarmer.id);
  const activeProcurement = farmerProcurements.find(p => p.queueStatus !== 'Cancelled') || farmerProcurements[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/30">
              🌾 PM-KISAN Verified Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 text-white">
              {activeFarmer.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-mono mt-0.5">
              Farmer ID: {activeFarmer.id} · {activeFarmer.village}, {activeFarmer.district}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/farmer/register-crop"
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.navRegisterCrop}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Upcoming Procurement Card */}
      {activeProcurement ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-600/30 shadow-md p-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Wheat className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  {t.upcomingProcurement}
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  {activeProcurement.cropType} — {activeProcurement.declaredQuantity} Quintals
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={activeProcurement.queueStatus} size="md" />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Token Box */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center flex flex-col justify-center">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                {t.tokenNumber}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono mt-0.5">
                {activeProcurement.tokenNumber}
              </span>
              <button
                onClick={() => setSelectedQRRecord(activeProcurement)}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold mt-2 flex items-center justify-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{t.viewPass}</span>
              </button>
            </div>

            {/* Centre & Slot */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {t('Mandi / Date')}
              </span>
              <strong className="text-slate-800 text-sm block mt-1 leading-tight">
                {activeProcurement.centreName}
              </strong>
              <span className="text-xs text-slate-600 mt-1 block">
                {formatDate(activeProcurement.slotDate)} · <strong className="text-emerald-700">{activeProcurement.slotTime}</strong>
              </span>
            </div>

            {/* Queue Position */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {t.queuePosition}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  {activeProcurement.queueStatus === 'Completed' ? '0' : activeProcurement.queuePosition}
                </span>
                <span className="text-xs text-slate-500">
                  {activeProcurement.queueStatus === 'Completed' ? t('Processed') : t.farmersAhead}
                </span>
              </div>
              <Link to="/farmer/queue" className="text-xs text-emerald-700 hover:underline font-bold mt-1 inline-block">
                {t('View Mandi Live Queue →')}
              </Link>
            </div>

            {/* Estimated Waiting Time */}
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {t.estimatedWait}
              </span>
              <span className="text-2xl font-black text-emerald-950 mt-1 block">
                {activeProcurement.queueStatus === 'Completed'
                  ? `0 ${t('mins')}`
                  : `~${activeProcurement.estimatedWaitMinutes} ${t('mins')}`}
              </span>
              <span className="text-[11px] text-emerald-700 mt-1 block">
                {activeProcurement.queueStatus === 'Called'
                  ? `🚀 ${t('Called to Gate Now!')}`
                  : activeProcurement.queueStatus === 'Completed'
                  ? `✓ ${t('Procurement Done')}`
                  : t('Based on current weighing rate')}
              </span>
            </div>

          </div>

          {/* Quick Action Footer inside hero card */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-semibold">
                {t('Procurement Stage:')}
              </span>
              <span className="text-xs font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {t(activeProcurement.stage.replace(/_/g, ' '))}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedQRRecord(activeProcurement)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{t('Show QR Pass')}</span>
              </button>
              <button
                onClick={() => navigate('/farmer/status')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t('Track Progress')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Slot Banner */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wheat className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t.noActiveSlot}</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {t.noActiveSlotDesc}
          </p>
          <Link
            to="/farmer/register-crop"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-md transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('Register Crop & Book Mandi Slot')}</span>
          </Link>
        </div>
      )}

      {/* Quick Services Navigation Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">{t.quickActions}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <Link
            to="/farmer/register-crop"
            className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <strong className="text-sm text-slate-900 block">{t.navRegisterCrop}</strong>
            <span className="text-xs text-slate-500">{t('Smart Recommendation')}</span>
          </Link>

          <Link
            to="/farmer/my-slot"
            className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <strong className="text-sm text-slate-900 block">{t.navMySlot}</strong>
            <span className="text-xs text-slate-500">{t('View Pass & QR')}</span>
          </Link>

          <Link
            to="/farmer/queue"
            className="bg-white hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-2xs transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <strong className="text-sm text-slate-900 block">{t.navQueue}</strong>
            <span className="text-xs text-slate-500">{t('Live Yard Tracking')}</span>
          </Link>

          <Link
            to="/farmer/payments"
            className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-2xs transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <strong className="text-sm text-slate-900 block">{t.navPayments}</strong>
            <span className="text-xs text-slate-500">{t('Direct DBT Disbursal')}</span>
          </Link>

        </div>
      </div>

      {/* QR Pass Dialog */}
      {selectedQRRecord && (
        <QRModal
          procurement={selectedQRRecord}
          isOpen={true}
          onClose={() => setSelectedQRRecord(null)}
        />
      )}
    </div>
  );
};
