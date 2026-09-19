import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertTriangle,
  Search,
  Building2,
  Wheat,
  Scale,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { QualityGrade, QualityResult } from '../../types';
import { AIQualityAssistanceModal } from '../../components/centre/AIQualityAssistanceModal';

export const QualityCheckPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCentreId, centres, procurements, submitQualityCheck } = useAppState();
  const { t } = useLanguage();

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];
  const pendingQualityProcurements = procurements.filter(
    p => p.centreId === currentCentre.id && p.queueStatus !== 'Completed' && p.queueStatus !== 'Cancelled'
  );

  const initialToken = location.state?.token || pendingQualityProcurements[0]?.tokenNumber || '';
  const [selectedToken, setSelectedToken] = useState<string>(initialToken);

  const targetProcurement = procurements.find(p => p.tokenNumber === selectedToken) || pendingQualityProcurements[0];

  // Form parameters
  const [moisture, setMoisture] = useState<number>(14.5);
  const [foreignMatter, setForeignMatter] = useState<number>(0.6);
  const [damagedGrain, setDamagedGrain] = useState<number>(1.2);
  const [immatureGrain, setImmatureGrain] = useState<number>(1.8);
  const [remarks, setRemarks] = useState<string>('Standard quality grain conforming to FAQ specifications.');
  const [inspectorName, setInspectorName] = useState<string>(currentCentre.officerInCharge.split(' ')[0] + ' ' + currentCentre.officerInCharge.split(' ')[1] || 'Quality Inspector');
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Auto calculate grade based on parameters
  const getCalculatedGrade = (): { grade: QualityGrade; result: QualityResult } => {
    if (moisture > 17.0 || foreignMatter > 2.0 || damagedGrain > 5.0) {
      return { grade: 'Rejected', result: 'FAIL' };
    }
    if (moisture <= 15.0 && foreignMatter <= 0.8 && damagedGrain <= 2.0) {
      return { grade: 'Grade A', result: 'PASS' };
    }
    if (moisture <= 16.5 && foreignMatter <= 1.2 && damagedGrain <= 3.5) {
      return { grade: 'FAQ (Fair Average Quality)', result: 'PASS' };
    }
    return { grade: 'Grade B', result: 'PASS' };
  };

  const calculated = getCalculatedGrade();

  const handleSubmit = (actionResult: QualityResult) => {
    if (!targetProcurement) return;

    submitQualityCheck(targetProcurement.id, {
      moisturePercentage: moisture,
      foreignMatterPercentage: foreignMatter,
      damagedGrainPercentage: damagedGrain,
      immatureGrainPercentage: immatureGrain,
      grade: actionResult === 'FAIL' ? 'Rejected' : calculated.grade,
      result: actionResult,
      remarks,
      inspectorName
    });

    setSubmittedMessage(`Quality check recorded for Token #${targetProcurement.tokenNumber}: ${actionResult} (${calculated.grade})`);

    if (actionResult === 'PASS') {
      setTimeout(() => {
        navigate('/centre/weighing', { state: { token: targetProcurement.tokenNumber } });
      }, 700);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400">Quality Assessment Bay</span>
          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
            {currentCentre.name}
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Grain Quality Inspection & Grading Station
        </h1>
        <p className="text-xs text-slate-500">
          Digital laboratory entry for moisture content, admixture analysis, and FAQ compliance testing.
        </p>
      </div>

      {submittedMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{submittedMessage} — Redirecting to Weighbridge...</span>
        </div>
      )}

      {/* Select Token to Inspect */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <FlaskConical className="w-4 h-4 text-purple-700" />
          <span>Select Token for Laboratory Testing:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI Grain Inspection Assist
          </button>

          <select
            value={targetProcurement?.tokenNumber || ''}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            {pendingQualityProcurements.map((p) => (
              <option key={p.id} value={p.tokenNumber}>
                {p.tokenNumber} — {p.farmerName} ({p.cropType}, {p.declaredQuantity} Qtl)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Computer Vision Assistant Modal */}
      <AIQualityAssistanceModal
        cropType={targetProcurement?.cropType || 'Paddy (Common)'}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApply={(aiData) => {
          setMoisture(aiData.moisturePercentage);
          setForeignMatter(aiData.foreignMatterPercentage);
          setDamagedGrain(aiData.damagedGrainPercentage);
          setImmatureGrain(aiData.immatureGrainPercentage);
          setRemarks(aiData.remarks);
        }}
      />

      {targetProcurement ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          {/* Target Summary Banner */}
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-purple-800">Token Under Test</span>
              <div className="text-2xl font-black text-purple-950 font-mono">
                {targetProcurement.tokenNumber}
              </div>
              <span className="text-xs text-purple-700">
                Farmer: <strong>{targetProcurement.farmerName}</strong> ({targetProcurement.farmerId})
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500 block">Declared Crop</span>
              <strong className="text-slate-900 text-sm">{targetProcurement.cropType}</strong>
              <div className="text-purple-800 font-bold">{targetProcurement.declaredQuantity} Quintals</div>
            </div>
          </div>

          {/* Test Parameters Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            
            {/* Moisture Content */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">Moisture Content (%)</label>
                <span className="text-[11px] text-slate-500 font-semibold">Max Limit: 17.0%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="5"
                max="30"
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-lg focus:ring-2 focus:ring-purple-500"
              />
              <span className={`text-[11px] font-semibold mt-1 block ${moisture <= 17 ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                {moisture <= 17 ? '✓ Within permissible limit' : '⚠️ Exceeds permissible moisture limit (Rejection risk)'}
              </span>
            </div>

            {/* Foreign Matter / Admixture */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">Foreign Matter / Dust (%)</label>
                <span className="text-[11px] text-slate-500 font-semibold">Max Limit: 1.0%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={foreignMatter}
                onChange={(e) => setForeignMatter(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-lg focus:ring-2 focus:ring-purple-500"
              />
              <span className={`text-[11px] font-semibold mt-1 block ${foreignMatter <= 1.0 ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                {foreignMatter <= 1.0 ? '✓ Within acceptable FAQ limit' : '⚠️ Excess admixture detected'}
              </span>
            </div>

            {/* Damaged / Discoloured Grain */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">Damaged & Discoloured (%)</label>
                <span className="text-[11px] text-slate-500 font-semibold">Max Limit: 4.0%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={damagedGrain}
                onChange={(e) => setDamagedGrain(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Immature / Shrunken Grain */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-800">Immature / Shrunken Grain (%)</label>
                <span className="text-[11px] text-slate-500 font-semibold">Limit: 3.0%</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={immatureGrain}
                onChange={(e) => setImmatureGrain(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-800 block mb-1">Inspector Quality Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Auto Computed Grade Badge */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Auto-Calculated Quality Grade:
              </span>
              <div className="text-xl font-black text-amber-400 flex items-center gap-2 mt-0.5">
                <span>{calculated.grade}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${calculated.result === 'PASS' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {calculated.result}
                </span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              Inspector: <strong className="text-white">{inspectorName}</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleSubmit('PASS')}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>PASS & Send to Digital Weighbridge</span>
            </button>

            <button
              onClick={() => handleSubmit('HOLD')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Put on Hold (Re-drying)</span>
            </button>

            <button
              onClick={() => handleSubmit('FAIL')}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>FAIL / Reject Batch</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No tokens waiting for quality inspection in this Mandi.</p>
        </div>
      )}

    </div>
  );
};
