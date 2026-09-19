import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { CROPS_CATALOGUE } from '../../data/mockData';
import { CropType } from '../../types';
import { calculateCentreRecommendations } from '../../utils/recommendationEngine';
import { RecommendationCard } from '../../components/farmer/RecommendationCard';
import {
  UserCheck,
  Wheat,
  MapPin,
  Building2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Info,
  Calendar,
  Truck,
  BookOpen
} from 'lucide-react';
import { UserManualModal } from '../../components/farmer/UserManualModal';

export const CropRegistration: React.FC = () => {
  const { activeFarmer, centres, registerAndBookSlot } = useAppState();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    cropType: 'Paddy (Common)' as CropType,
    variety: 'Swarna (MTU 7029)',
    quantity: 40,
    harvestDate: new Date().toISOString().split('T')[0],
    transportMode: 'Tractor Trolley',
    district: activeFarmer.district,
    block: activeFarmer.block,
    village: activeFarmer.village,
    pincode: activeFarmer.pincode,
    selectedCentreId: centres[0].id
  });

  const [validationError, setValidationError] = useState('');

  // Selected crop info
  const selectedCropInfo = CROPS_CATALOGUE.find(c => c.name === formData.cropType) || CROPS_CATALOGUE[0];

  // Calculate recommendations
  const recommendations = calculateCentreRecommendations(centres, activeFarmer, formData.quantity);

  const handleNextStep = () => {
    setValidationError('');
    if (step === 2) {
      if (!formData.quantity || formData.quantity <= 0 || formData.quantity > 500) {
        setValidationError('Please enter a valid quantity between 1 and 500 Quintals.');
        return;
      }
      if (!formData.variety.trim()) {
        setValidationError('Please enter crop variety name.');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1) as any);
  };

  const handlePrevStep = () => {
    setValidationError('');
    setStep((prev) => Math.max(1, prev - 1) as any);
  };

  const handleSelectCentreAndProceed = (centreId: string) => {
    setFormData(prev => ({ ...prev, selectedCentreId: centreId }));
    // Navigate to slot booking with pre-filled state
    navigate('/farmer/book-slot', {
      state: {
        registrationData: {
          ...formData,
          selectedCentreId: centreId
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Crop Procurement Registration
          </h1>
          <p className="text-sm text-slate-500">
            Register your harvest details and receive a transparent rule-based Mandi recommendation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-center shrink-0"
          title="Open Farmer User Manual & Registration Guide"
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>{language === 'or' ? 'ମାର୍ଗଦର୍ଶିକା (Manual)' : language === 'hi' ? 'पुस्तिका (Manual)' : 'User Manual'}</span>
        </button>
      </div>

      {/* 4-Step Visual Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: 1, title: 'Farmer Profile', icon: UserCheck },
            { num: 2, title: 'Crop Details', icon: Wheat },
            { num: 3, title: 'Location', icon: MapPin },
            { num: 4, title: 'Mandi Scoring', icon: Building2 }
          ].map((s) => {
            const Icon = s.icon;
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div
                key={s.num}
                className={`p-2.5 rounded-xl text-center border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                    : isDone
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-white border-dashed border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{t('Step')} {s.num}</span>
                </div>
                <div className="text-[11px] truncate mt-0.5">{t(s.title)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
          {validationError}
        </div>
      )}

      {/* STEP 1: Farmer & Land Details */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Step 1: Farmer & Land Ownership Verification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">Farmer Full Name</label>
              <input
                type="text"
                disabled
                value={activeFarmer.name}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">Farmer Registration ID</label>
              <input
                type="text"
                disabled
                value={activeFarmer.id}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">Aadhaar (Masked)</label>
              <input
                type="text"
                disabled
                value={activeFarmer.aadhaarNumber}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">PM-KISAN ID</label>
              <input
                type="text"
                disabled
                value={activeFarmer.pmKisanId}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">Khatian / RoR Number</label>
              <input
                type="text"
                disabled
                value={activeFarmer.khatianNumber}
                className="w-full bg-emerald-50/60 border border-emerald-200 rounded-xl px-3 py-2 text-emerald-900 font-mono font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold block mb-1">Registered Land Area (Acres)</label>
              <input
                type="text"
                disabled
                value={`${activeFarmer.landAreaAcres} Acres`}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Land records and Aadhaar linkage are automatically validated against the Odisha Bhulekh Portal database.
            </span>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNextStep}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm cursor-pointer"
            >
              <span>Next: Crop Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Crop Details */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wheat className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Step 2: Crop Variety & Harvest Quantity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Select Crop Type</label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value as CropType })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {CROPS_CATALOGUE.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} — MSP: ₹{c.mspRatePerQuintal}/Qtl ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Crop Variety</label>
              <input
                type="text"
                placeholder="e.g. Swarna, Pooja, Sharbati, etc."
                value={formData.variety}
                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Declared Quantity (Quintals)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-lg focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Qtl</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">1 Quintal = 100 Kilograms</span>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Harvest Completion Date</label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Transport Vehicle Type</label>
              <select
                value={formData.transportMode}
                onChange={(e) => setFormData({ ...formData, transportMode: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Tractor Trolley">Tractor Trolley (Standard)</option>
                <option value="Commercial Mini Truck (Tata Ace / Pickup)">Commercial Mini Truck (Tata Ace / Pickup)</option>
                <option value="Medium Goods Vehicle (6 Wheeler)">Medium Goods Vehicle (6 Wheeler)</option>
                <option value="Bullock Cart / Local Trailer">Bullock Cart / Local Trailer</option>
              </select>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex flex-col justify-center">
              <span className="text-xs text-amber-800 font-bold">Estimated MSP Value:</span>
              <span className="text-xl font-black text-amber-950">
                ₹{(formData.quantity * selectedCropInfo.mspRatePerQuintal).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-amber-700">
                (@ ₹{selectedCropInfo.mspRatePerQuintal}/Qtl for {formData.cropType})
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNextStep}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm cursor-pointer"
            >
              <span>Next: Location Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location Details */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Step 3: Farm Origin Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">State</label>
              <input
                type="text"
                disabled
                value="Odisha"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Block / Tehsil</label>
              <input
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">Village / Gram Panchayat</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNextStep}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-sm cursor-pointer"
            >
              <span>Calculate Smart Recommendations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Smart Transparent Recommendation */}
      {step === 4 && (
        <div className="space-y-4">
          
          {/* Transparent Algorithm Banner */}
          <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-md border border-emerald-700">
            <div className="flex items-center gap-2 font-black text-amber-300 text-sm mb-1">
              <span>⚡ KISAN-Q Deterministic Allocation Engine</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Rule-Based Procurement Centre Recommendation
            </h2>
            <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
              Centres are evaluated on 3 transparent factors: <strong>Proximity Distance (35%)</strong>, <strong>Live Yard Queue Time (35%)</strong>, and <strong>Available Mandi Capacity (30%)</strong>. 100% deterministic, zero hidden bias.
            </p>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.centre.id}
                rec={rec}
                onSelect={handleSelectCentreAndProceed}
              />
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handlePrevStep}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Crop Details</span>
            </button>
          </div>
        </div>
      )}

      {/* User Manual Modal */}
      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultStep={step === 1 ? 1 : step === 2 ? 3 : 4}
      />

    </div>
  );
};
