import React from 'react';
import { ProcurementRecord, ProcurementStage } from '../../types';
import { CheckCircle2, Clock } from 'lucide-react';

interface StepTimelineProps {
  procurement: ProcurementRecord;
}

interface StageConfig {
  stage: ProcurementStage;
  label: string;
  subtext: string;
}

const STAGES: StageConfig[] = [
  { stage: 'REGISTRATION_COMPLETED', label: '1. Registration', subtext: 'Crop details submitted' },
  { stage: 'APPLICATION_APPROVED', label: '2. Approval', subtext: 'Land & crop verified' },
  { stage: 'SLOT_ASSIGNED', label: '3. Slot Assigned', subtext: 'Token & gate pass issued' },
  { stage: 'FARMER_ARRIVED', label: '4. Gate Arrival', subtext: 'Vehicle inward & called' },
  { stage: 'QUALITY_CHECK', label: '5. Quality Check', subtext: 'Lab testing & moisture' },
  { stage: 'WEIGHING', label: '6. Digital Weighing', subtext: 'Weighbridge gross/tare' },
  { stage: 'PROCUREMENT_COMPLETE', label: '7. Procurement Done', subtext: 'J-Form certificate issued' },
  { stage: 'PAYMENT_INITIATED', label: '8. Payment Initiated', subtext: 'PFMS DBT batch created' },
  { stage: 'PAYMENT_COMPLETED', label: '9. Payment Credited', subtext: 'Credited to Bank Account' }
];

export const StepTimeline: React.FC<StepTimelineProps> = ({ procurement }) => {
  const getStageIndex = (stage: ProcurementStage): number => {
    switch (stage) {
      case 'REGISTRATION_COMPLETED': return 0;
      case 'APPLICATION_APPROVED': return 1;
      case 'SLOT_ASSIGNED': return 2;
      case 'FARMER_ARRIVED': return 3;
      case 'QUALITY_CHECK': return 4;
      case 'WEIGHING': return 5;
      case 'PROCUREMENT_COMPLETE': return 6;
      case 'PAYMENT_INITIATED': return 7;
      case 'PAYMENT_COMPLETED': return 8;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(procurement.stage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Procurement Progress Tracker</h3>
          <p className="text-xs text-slate-500">Token: <strong className="text-emerald-700 font-mono">{procurement.tokenNumber}</strong> · {procurement.cropType}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Current Stage</span>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
            Stage {currentIndex + 1} of 9
          </span>
        </div>
      </div>

      {/* Stepper Flow */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {STAGES.map((s, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && procurement.stage === 'PAYMENT_COMPLETED');
          const isCurrent = idx === currentIndex && procurement.stage !== 'PAYMENT_COMPLETED';

          const timelineEntry = procurement.timeline.find(t => t.stage === s.stage);

          return (
            <div key={s.stage} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <span className="text-[10px]">{idx + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className={`p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                  : isCompleted
                  ? 'bg-slate-50/80 border-slate-200'
                  : 'bg-white border-dashed border-slate-200 opacity-60'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <span>{s.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        In Progress
                      </span>
                    )}
                  </div>
                  {timelineEntry && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {timelineEntry.timestamp}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-0.5">
                  {timelineEntry?.description || s.subtext}
                </p>

                {/* Additional metrics if available */}
                {s.stage === 'QUALITY_CHECK' && procurement.qualityInspection && (
                  <div className="mt-2 text-xs bg-white rounded p-2 border border-purple-200 flex flex-wrap gap-3">
                    <span>Grade: <strong className="text-purple-700">{procurement.qualityInspection.grade}</strong></span>
                    <span>Moisture: <strong className="text-purple-700">{procurement.qualityInspection.moisturePercentage}%</strong></span>
                    <span>Foreign Matter: <strong>{procurement.qualityInspection.foreignMatterPercentage}%</strong></span>
                    <span>Result: <strong className="text-emerald-700">{procurement.qualityInspection.result}</strong></span>
                  </div>
                )}

                {s.stage === 'WEIGHING' && procurement.weighing && (
                  <div className="mt-2 text-xs bg-white rounded p-2 border border-indigo-200 flex flex-wrap gap-3">
                    <span>Gross: <strong>{procurement.weighing.grossWeight} Qtl</strong></span>
                    <span>Tare: <strong>{procurement.weighing.tareWeight} Qtl</strong></span>
                    <span>Net Weight: <strong className="text-indigo-700">{procurement.weighing.netWeight} Quintals</strong></span>
                    <span>Bags: <strong>{procurement.weighing.bagCount}</strong></span>
                  </div>
                )}

                {s.stage === 'PAYMENT_INITIATED' && procurement.payment && (
                  <div className="mt-2 text-xs bg-white rounded p-2 border border-emerald-200 flex flex-wrap gap-3">
                    <span>Amount: <strong className="text-emerald-700">₹{procurement.payment.netPayableAmount.toLocaleString('en-IN')}</strong></span>
                    <span>Batch: <span className="font-mono text-[11px]">{procurement.payment.dbtBatchNo}</span></span>
                    <span>Status: <strong className="text-blue-700">{procurement.payment.paymentStatus}</strong></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
