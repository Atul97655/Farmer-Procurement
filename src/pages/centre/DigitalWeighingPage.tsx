import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Scale,
  CheckCircle,
  Truck,
  Building2,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatWeight } from '../../utils/formatters';

export const DigitalWeighingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeCentreId, centres, procurements, submitWeighing } = useAppState();
  const { t } = useLanguage();

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];
  const pendingWeighProcurements = procurements.filter(
    p => p.centreId === currentCentre.id && p.queueStatus !== 'Cancelled' && p.queueStatus !== 'Completed'
  );

  const initialToken = location.state?.token || pendingWeighProcurements[0]?.tokenNumber || '';
  const [selectedToken, setSelectedToken] = useState<string>(initialToken);

  const targetProcurement = procurements.find(p => p.tokenNumber === selectedToken) || pendingWeighProcurements[0];

  // Weighbridge Inputs
  const declaredQty = targetProcurement?.declaredQuantity || 45;
  const [grossWeight, setGrossWeight] = useState<number>(declaredQty + 18.5);
  const [tareWeight, setTareWeight] = useState<number>(18.5);
  const [bagCount, setBagCount] = useState<number>(declaredQty * 2);
  const [vehicleNumber, setVehicleNumber] = useState<string>('OD-02-AK-9812');
  const [operatorName, setOperatorName] = useState<string>('Alok Nanda (Weighbridge Master)');
  const [submittedMessage, setSubmittedMessage] = useState('');

  // Auto calculated Net Weight = Gross - Tare
  const netWeight = Math.max(0, Math.round((grossWeight - tareWeight) * 100) / 100);
  const variance = Math.round((netWeight - declaredQty) * 100) / 100;

  const handleSaveWeighing = () => {
    if (!targetProcurement) return;

    submitWeighing(targetProcurement.id, {
      grossWeight,
      tareWeight,
      bagCount,
      vehicleNumber,
      operatorName
    });

    setSubmittedMessage(`Weighbridge Slip recorded: Net ${netWeight} Qtl (${bagCount} bags) for Token #${targetProcurement.tokenNumber}`);

    setTimeout(() => {
      navigate('/centre/procurement', { state: { token: targetProcurement.tokenNumber } });
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold text-slate-400">Electronic Weighbridge</span>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
            {currentCentre.name}
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
          Digital Weighbridge Gross & Tare Logger
        </h1>
        <p className="text-xs text-slate-500">
          Automated weighbridge interface calculating Net Crop Weight = Gross Weight - Tare Weight.
        </p>
      </div>

      {submittedMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{submittedMessage} — Redirecting to Final Settlement...</span>
        </div>
      )}

      {/* Select Token Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Scale className="w-4 h-4 text-indigo-700" />
          <span>Select Token for Weighbridge Measurement:</span>
        </div>

        <select
          value={targetProcurement?.tokenNumber || ''}
          onChange={(e) => setSelectedToken(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          {pendingWeighProcurements.map((p) => (
            <option key={p.id} value={p.tokenNumber}>
              {p.tokenNumber} — {p.farmerName} ({p.cropType}, {p.declaredQuantity} Qtl)
            </option>
          ))}
        </select>
      </div>

      {targetProcurement ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          {/* Target Banner */}
          <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-800">Weighbridge Bay 1</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                {targetProcurement.tokenNumber}
              </div>
              <span className="text-xs text-indigo-700">
                Farmer: <strong>{targetProcurement.farmerName}</strong> ({targetProcurement.farmerId})
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500 block">Declared Quantity</span>
              <strong className="text-slate-900 text-sm">{targetProcurement.declaredQuantity} Quintals</strong>
              <div className="text-emerald-700 font-bold">{targetProcurement.cropType}</div>
            </div>
          </div>

          {/* Weighbridge Electronic Reading Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Gross Weight */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                1. Gross Weight (Vehicle + Crop)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-black text-xl focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Qtl</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Tractor + Loaded Produce</span>
            </div>

            {/* Tare Weight */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                2. Tare Weight (Empty Vehicle)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={tareWeight}
                  onChange={(e) => setTareWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-black text-xl focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Qtl</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Vehicle Tare Calibration</span>
            </div>

            {/* Net Verified Weight Display */}
            <div className="bg-indigo-900 text-white p-4 rounded-2xl border border-indigo-800 flex flex-col justify-between shadow-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                3. Calculated Net Weight
              </span>
              <div className="text-3xl font-black text-amber-300 font-mono my-1">
                {netWeight} Qtl
              </div>
              <span className="text-[11px] text-indigo-200">
                Net = Gross ({grossWeight}) - Tare ({tareWeight})
              </span>
            </div>

          </div>

          {/* Vehicle and Bag Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Vehicle Plate Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Standard Gunny Bags (50kg)</label>
              <input
                type="number"
                value={bagCount}
                onChange={(e) => setBagCount(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Weighbridge Operator</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Variance Analysis */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Declared vs Net Verified Variance:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <strong className="text-slate-900">Declared: {declaredQty} Qtl</strong>
                <span className="text-slate-400">→</span>
                <strong className="text-indigo-900">Verified: {netWeight} Qtl</strong>
                <span className={`px-2 py-0.5 rounded font-bold ${variance >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {variance >= 0 ? `+${variance} Qtl` : `${variance} Qtl`}
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveWeighing}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>Save & Issue Weigh Slip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No tokens waiting for weighing in this Mandi.</p>
        </div>
      )}

    </div>
  );
};
