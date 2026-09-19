import React from 'react';
import { CentreRecommendation } from '../../types';
import { MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface RecommendationCardProps {
  rec: CentreRecommendation;
  onSelect: (centreId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ rec, onSelect }) => {
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
        <div className="flex items-center justify-between mb-3 bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-300" />
            RECOMMENDED MANDI (Lowest Waiting Time)
          </span>
          <span className="bg-emerald-900/60 px-2 py-0.5 rounded text-[11px]">
            Score: {score}/100
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
              Score: {score}/100
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Distance</span>
          <strong className="text-slate-900 text-sm">{distanceKm} km</strong>
          <span className="text-[10px] text-slate-400 block">{scoreBreakdown.distanceScore} pts</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Est. Wait</span>
          <strong className="text-amber-800 text-sm">~{estimatedWaitMinutes} mins</strong>
          <span className="text-[10px] text-slate-400 block">{centre.queueLength} in queue</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[10px] text-slate-500 font-semibold uppercase block">Free Capacity</span>
          <strong className="text-emerald-800 text-sm">{centre.dailyCapacity - centre.currentLoad} Qtl</strong>
          <span className="text-[10px] text-slate-400 block">{capacityUtilizationPercent}% full</span>
        </div>
      </div>

      {/* Transparent Logic Banner */}
      <div className="bg-slate-100/80 rounded-lg p-2.5 text-xs text-slate-700 mb-4 border border-slate-200">
        <div className="font-semibold text-slate-800 mb-0.5 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent Rule Factor:</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">{recommendationReason}</p>
      </div>

      <button
        onClick={() => onSelect(centre.id)}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isBestMatch
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
            : 'bg-slate-800 hover:bg-slate-900 text-white'
        }`}
      >
        <span>Select Mandi & Book Slot</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
