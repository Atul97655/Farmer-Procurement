import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { CROPS_CATALOGUE } from '../../data/mockData';
import confetti from 'canvas-confetti';
import {
  FileCheck2,
  CheckCircle,
  Building2,
  Wheat,
  Scale,
  FlaskConical,
  CreditCard,
  Printer,
  ShieldCheck,
  Award,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';

export const ProcurementCompletePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCentreId, centres, procurements, completeProcurement } = useAppState();
  const { t } = useLanguage();

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];
  const pendingCompleteProcurements = procurements.filter(
    p => p.centreId === currentCentre.id && p.queueStatus !== 'Cancelled'
  );

  const initialToken = location.state?.token || pendingCompleteProcurements.find(p => p.stage === 'WEIGHING')?.tokenNumber || pendingCompleteProcurements[0]?.tokenNumber || '';
  const [selectedToken, setSelectedToken] = useState<string>(initialToken);

  const targetProcurement = procurements.find(p => p.tokenNumber === selectedToken) || pendingCompleteProcurements[0];

  const [officerRemarks, setOfficerRemarks] = useState<string>('Certified FAQ standard procurement. All weight and moisture limits verified.');
  const [isCompleted, setIsCompleted] = useState(false);

  const cropInfo = CROPS_CATALOGUE.find(c => c.name === targetProcurement?.cropType) || CROPS_CATALOGUE[0];
  const netWeight = targetProcurement?.weighing?.netWeight || targetProcurement?.declaredQuantity || 45;
  const totalAmount = netWeight * cropInfo.mspRatePerQuintal;

  const handleFinalize = () => {
    if (!targetProcurement) return;

    completeProcurement(targetProcurement.id, officerRemarks);
    setIsCompleted(true);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handlePrintJForm = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400">Final Procurement Authorization</span>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
            {currentCentre.name}
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Issue J-Form Procurement Certificate & DBT Dispatch
        </h1>
        <p className="text-xs text-slate-500">
          Sign off on verified grain weight, calculate final MSP disbursal, and push to statewide central records.
        </p>
      </div>

      {/* Select Token */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <FileCheck2 className="w-4 h-4 text-emerald-700" />
          <span>Select Token for Final Invoicing:</span>
        </div>

        <select
          value={targetProcurement?.tokenNumber || ''}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          {pendingCompleteProcurements.map((p) => (
            <option key={p.id} value={p.tokenNumber}>
              {p.tokenNumber} — {p.farmerName} ({p.cropType}, {p.weighing?.netWeight || p.declaredQuantity} Qtl)
            </option>
          ))}
        </select>
      </div>

      {targetProcurement ? (
        <div className="space-y-6">
          
          {/* Official J-Form Certificate Preview */}
          <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-8 shadow-md space-y-6">
            
            {/* Gov Header */}
            <div className="text-center border-b border-slate-200 pb-5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Odisha State Agricultural Marketing Board (OSAMB)</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                FORM 'J' — PROCUREMENT SALE CERTIFICATE
              </h2>
              <p className="text-xs text-slate-500">
                Issued under Section 19 of the Agricultural Produce Markets Act · Mandi Yard {currentCentre.code}
              </p>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Token Number</span>
                <strong className="text-sm font-mono text-slate-900">{targetProcurement.tokenNumber}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Farmer Name</span>
                <strong className="text-sm text-slate-900">{targetProcurement.farmerName}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Farmer ID</span>
                <span className="text-xs font-mono font-bold text-slate-800">{targetProcurement.farmerId}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Settlement Date</span>
                <strong className="text-xs text-slate-900">{new Date().toLocaleDateString('en-IN')}</strong>
              </div>
            </div>

            {/* Quality & Weight Inspection Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Commodity / Crop</th>
                    <th className="py-2.5 px-4">Quality Grade</th>
                    <th className="py-2.5 px-4">Verified Net Weight</th>
                    <th className="py-2.5 px-4">MSP Rate</th>
                    <th className="py-2.5 px-4 text-right">Total Disbursal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {targetProcurement.cropType}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                        {targetProcurement.qualityInspection?.grade || 'Grade A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black font-mono text-indigo-900">
                      {netWeight} Quintals
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      ₹{cropInfo.mspRatePerQuintal} / Qtl
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-800 text-sm">
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quality Lab Readings Summary */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs flex flex-wrap justify-between gap-2 text-slate-600">
              <span>Moisture Content: <strong>{targetProcurement.qualityInspection?.moisturePercentage || 14.8}%</strong></span>
              <span>Foreign Matter: <strong>{targetProcurement.qualityInspection?.foreignMatterPercentage || 0.6}%</strong></span>
              <span>Weigh Slip: <strong className="font-mono">{targetProcurement.weighing?.tareWeightSlipNo || 'WB-SLIP-882190'}</strong></span>
              <span>Gunny Bags: <strong>{targetProcurement.weighing?.bagCount || (netWeight * 2)}</strong></span>
            </div>

            {/* Officer Remarks */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Mandi Superintendent Authorization Remarks</label>
              <input
                type="text"
                value={officerRemarks}
                onChange={(e) => setOfficerRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Bar */}
            <div className="no-print pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              {targetProcurement.stage !== 'PROCUREMENT_COMPLETE' && targetProcurement.stage !== 'PAYMENT_COMPLETED' ? (
                <button
                  onClick={handleFinalize}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Authorize & Complete Procurement (Disburse {formatCurrency(totalAmount)})</span>
                </button>
              ) : (
                <div className="flex-1 bg-emerald-50 border border-emerald-300 text-emerald-900 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Procurement Successfully Completed & Transferred to State Central Depot</span>
                  </span>
                  <button
                    onClick={handlePrintJForm}
                    className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print J-Form</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No tokens available for procurement completion.</p>
        </div>
      )}

    </div>
  );
};
