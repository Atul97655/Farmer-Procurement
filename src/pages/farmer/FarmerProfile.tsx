import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  User,
  ShieldCheck,
  Landmark,
  MapPin,
  FileCheck2,
  Phone,
  Globe,
  Wheat,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../../types';

export const FarmerProfile: React.FC = () => {
  const { activeFarmer, farmers, setActiveFarmerId } = useAppState();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Farmer Digital Profile & Land Records
        </h1>
        <p className="text-sm text-slate-500">
          Verified agricultural identity linked with Odisha Bhulekh & PM-KISAN database.
        </p>
      </div>

      {/* Switch Farmer Profile */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-400">Switch Verified Farmer Account</span>
          <p className="text-xs text-slate-300">Select any registered farmer to view their linked land records, quota, and history:</p>
        </div>

        <select
          value={activeFarmer.id}
          onChange={(e) => setActiveFarmerId(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          {farmers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} — {f.district} ({f.id})
            </option>
          ))}
        </select>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        {/* Top Identification */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {activeFarmer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{activeFarmer.name}</h2>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Aadhaar KYC Verified</span>
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Farmer ID: <strong>{activeFarmer.id}</strong> · PM-KISAN: {activeFarmer.pmKisanId}
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-slate-400 block">Registered Phone</span>
            <strong className="text-slate-800 text-sm font-mono flex items-center justify-end gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {activeFarmer.phone}
            </strong>
          </div>
        </div>

        {/* Land Holdings Information */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <FileCheck2 className="w-4 h-4 text-emerald-700" />
            <span>Land Parcel & RoR Holdings (Bhulekh Integration)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Khatian / Khata No.</span>
              <strong className="text-slate-900 text-sm font-mono block mt-0.5">{activeFarmer.khatianNumber}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Plot / Dag Numbers</span>
              <strong className="text-slate-900 text-sm font-mono block mt-0.5">{activeFarmer.plotNumber}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Total Cultivable Area</span>
              <strong className="text-emerald-800 text-sm font-black block mt-0.5">{activeFarmer.landAreaAcres} Acres</strong>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 text-emerald-700" />
            <span>Aadhaar Seeded Primary Bank Account</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Bank Name</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{activeFarmer.bankName}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">Account Number</span>
              <strong className="text-slate-900 text-sm font-mono block mt-0.5">{activeFarmer.bankAccountNumber}</strong>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-500 block">IFSC Code</span>
              <strong className="text-slate-900 text-sm font-mono block mt-0.5">{activeFarmer.ifscCode}</strong>
            </div>
          </div>
        </div>

        {/* Location & Language Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 font-bold block mb-1">Residence Location</span>
            <p className="text-slate-800">
              {activeFarmer.village}, {activeFarmer.block}, {activeFarmer.district}, Odisha — {activeFarmer.pincode}
            </p>
          </div>

          <div>
            <span className="text-slate-500 font-bold block mb-1">Preferred Portal Language</span>
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' }
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
