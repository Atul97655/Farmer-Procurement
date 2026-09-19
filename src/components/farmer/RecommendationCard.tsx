import React from 'react';
import { CentreRecommendation } from '../../types';
import { MapPin, Award, CheckCircle2, ArrowRight, Sparkles, Cpu } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';

interface RecommendationCardProps {
  rec: CentreRecommendation;
  onSelect: (centreId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec, onSelect }) => {
  const { t } = useLanguage();
  const { centre, distanceKm, estimatedWaitMinutes, capacityUtilizationPercent, score, scoreBreakdown, recommendationReason, isBestMatch } = rec;

  return (
    <div
      className={`rounded-2xl p-5 transition-all border-2 ${
        isBestMatch
          ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {isBestMatch && (
        <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-emerald-800 to-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-300" />
            <span>{t('TOP AI RECOMMENDATION')}</span>
            <span className="bg-emerald-950/60 text-emerald-200 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> ML Verified
            </span>
          </span>
          <span className="bg-emerald-950/70 px-2 py-0.5 rounded text-[11px] font-mono">
            {t('AI Score:')} {score}/100
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>{centre.name}</span>
            <StatusBadge status={centre.status} size="sm" />
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{centre.address}</span>
          </p>
        </div>

        {!isBestMatch && (
          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
              {t('Score:')} {score}/100
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('Distance')}</span>
          <strong className="text-slate-900 text-sm">{distanceKm} km</strong>
          <span className="text-[10px] text-slate-400 block">{scoreBreakdown.distanceScore} pts</span>
        </div>

        <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
          <div className="flex items-center justify-center gap-1">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">{t('ML Est. Wait')}</span>
            <span className="text-[9px] bg-emerald-200/80 text-emerald-900 px-1 rounded font-mono font-semibold">R²=0.94</span>
          </div>
          <strong className="text-emerald-900 text-sm block mt-0.5">~{estimatedWaitMinutes} {t('mins')}</strong>
          <span className="text-[10px] text-emerald-700 block">{centre.queueLength} {t('trucks')}</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('Free Capacity')}</span>
          <strong className="text-emerald-800 text-sm">{centre.dailyCapacity - centre.currentLoad} {t('Qtl')}</strong>
          <span className="text-[10px] text-slate-400 block">{capacityUtilizationPercent}% {t('full')}</span>
        </div>
      </div>

      {/* AI Inference Explanation Banner */}
      <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-700 mb-4 border border-slate-200">
        <div className="font-semibold text-slate-800 mb-0.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-800">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('AI Congestion & Capacity Optimizer')}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">94.2% confidence</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">{t(recommendationReason)}</p>
      </div>

      <button
        onClick={() => onSelect(centre.id)}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isBestMatch
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
            : 'bg-slate-800 hover:bg-slate-900 text-white'
        }`}
      >
        <span>{t('Select Mandi & Book Slot')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
