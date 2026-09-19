import React from 'react';
import { QueueStatus, CentreStatus, QualityGrade, QualityResult, PaymentStatus, ProcurementStage } from '../../types';

interface StatusBadgeProps {
  status: QueueStatus | CentreStatus | QualityGrade | QualityResult | PaymentStatus | ProcurementStage | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';

  switch (status) {
    // Queue statuses
    case 'Waiting':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'Called':
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-400 animate-pulse font-bold';
      break;
    case 'Quality Check':
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-300';
      break;
    case 'Weighing':
      colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-300';
      break;
    case 'Completed':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-semibold';
      break;
    case 'Hold':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-300';
      break;
    case 'Cancelled':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-300';
      break;

    // Centre statuses
    case 'NORMAL':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      break;
    case 'BUSY':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-300';
      break;
    case 'NEAR CAPACITY':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-400 font-bold';
      break;
    case 'FULL':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-400 font-bold';
      break;
    case 'CLOSED':
      colorClasses = 'bg-slate-200 text-slate-800 border-slate-400';
      break;

    // Quality Results & Grades
    case 'PASS':
    case 'Grade A':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold';
      break;
    case 'FAQ (Fair Average Quality)':
    case 'Grade B':
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-400 font-semibold';
      break;
    case 'FAIL':
    case 'Rejected':
      colorClasses = 'bg-rose-100 text-rose-800 border-rose-400 font-bold';
      break;
    case 'HOLD':
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-400 font-bold';
      break;

    // Payments
    case 'CREDITED':
      colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold';
      break;
    case 'PROCESSING':
    case 'INITIATED':
      colorClasses = 'bg-blue-100 text-blue-800 border-blue-400 font-medium';
      break;
    case 'CALCULATED':
      colorClasses = 'bg-amber-100 text-amber-800 border-amber-400';
      break;

    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  }

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full border ${sizeClasses} ${colorClasses} whitespace-nowrap`}>
      {status}
    </span>
  );
};
