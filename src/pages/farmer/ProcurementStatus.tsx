import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { StepTimeline } from '../../components/common/StepTimeline';
import {
  Wheat,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Scale,
  FlaskConical,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export const ProcurementStatus: React.FC = () => {
  const { activeFarmer, procurements } = useAppState();
  const { t } = useLanguage();

  const farmerRecords = procurements.filter(p => p.farmerId === activeFarmer.id);
  const activeRecord = farmerRecords.find(p => p.queueStatus !== 'Cancelled') || farmerRecords[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Live Procurement Status & Audit Trail
        </h1>
        <p className="text-sm text-slate-500">
          Transparent 9-stage tracking from digital registration to DBT bank account credit.
        </p>
      </div>

      {activeRecord ? (
        <div className="space-y-6">
          
          {/* Main Record Header */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Current Token</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {activeRecord.tokenNumber}
                  </span>
                  <StatusBadge status={activeRecord.queueStatus} size="sm" />
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Crop & Quantity</span>
                <strong className="text-base text-emerald-800 block">{activeRecord.cropType}</strong>
                <span className="text-xs text-slate-700 font-semibold">{activeRecord.declaredQuantity} Quintals</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Procurement Mandi</span>
                <strong className="text-slate-800">{activeRecord.centreName}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Slot Date</span>
                <strong className="text-slate-800">{formatDate(activeRecord.slotDate)}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Vehicle / Transport</span>
                <strong className="text-slate-800">{activeRecord.transportMode}</strong>
              </div>
            </div>
          </div>

          {/* 9-Stage Progress Timeline */}
          <StepTimeline procurement={activeRecord} />

          {/* Verified Quality & Weight Verification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Quality Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-sm mb-3">
                <FlaskConical className="w-4 h-4" />
                <span>Quality Inspection Results</span>
              </div>

              {activeRecord.qualityInspection ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Quality Grade:</span>
                    <strong className="text-purple-900">{activeRecord.qualityInspection.grade}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Moisture Content:</span>
                    <strong>{activeRecord.qualityInspection.moisturePercentage}% (Limit: 17%)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Foreign Matter:</span>
                    <strong>{activeRecord.qualityInspection.foreignMatterPercentage}%</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Inspector Decision:</span>
                    <StatusBadge status={activeRecord.qualityInspection.result} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1">
                    Remarks: <em>"{activeRecord.qualityInspection.remarks}"</em>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  Quality check pending vehicle arrival in yard.
                </div>
              )}
            </div>

            {/* Weighbridge Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm mb-3">
                <Scale className="w-4 h-4" />
                <span>Digital Weighbridge Readings</span>
              </div>

              {activeRecord.weighing ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Gross Weight:</span>
                    <strong>{activeRecord.weighing.grossWeight} Quintals</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tare (Empty Vehicle):</span>
                    <strong>{activeRecord.weighing.tareWeight} Quintals</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Net Verified Weight:</span>
                    <strong className="text-indigo-900 text-sm font-black">{activeRecord.weighing.netWeight} Quintals</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Standard Gunny Bags:</span>
                    <strong>{activeRecord.weighing.bagCount} Bags</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 font-mono">
                    Weight Slip No: {activeRecord.weighing.tareWeightSlipNo}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  Weighbridge measurement will be recorded after passing Quality Lab.
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-sm">No active procurement record to track.</p>
        </div>
      )}

    </div>
  );
};
