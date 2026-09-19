import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  UserCheck,
  Building2,
  ShieldCheck,
  Sprout,
  Clock,
  Calendar,
  Radio,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  FileCheck2
} from 'lucide-react';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, setActiveFarmerId, setActiveCentreId } = useAppState();
  const { t } = useLanguage();

  const handleSelectFarmer = () => {
    setActiveFarmerId('FRM-OD-2026-8812'); // Ramesh Kumar (PDC-1042)
    setRole('FARMER');
    navigate('/farmer/dashboard');
  };

  const handleSelectOperator = () => {
    setActiveCentreId('c-1'); // Digha Central Mandi
    setRole('OPERATOR');
    navigate('/centre/dashboard');
  };

  const handleSelectAdmin = () => {
    setRole('ADMIN');
    navigate('/admin/dashboard');
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 shadow-2xs">
          <Award className="w-4 h-4 text-emerald-700" />
          <span>Ministry of Agriculture & Farmers Welfare · Government of India</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          KISAN<span className="text-emerald-700">-Q</span> — Smart Crop Procurement Platform
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          Transforming agricultural mandi logistics with digital slot scheduling, transparent rule-based allocation, optical token QR passes, digital weighbridge integration, and real-time DBT disbursals.
        </p>
      </div>

      {/* SIH Core Value Proposition Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="text-center mb-6">
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
            Core Innovation Pillars
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Empowering Farmers & Streamlining Mandi Yards
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <strong className="text-sm text-white block">1. LESS WAITING</strong>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Reduces physical yard waiting time from 5+ hours to under 45 minutes through capacity-enforced slots.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <strong className="text-sm text-white block">2. BETTER SCHEDULING</strong>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Transparent rule-based scoring (Distance + Live Queue + Free Capacity) guarantees optimal mandi allocation.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Radio className="w-5 h-5" />
            </div>
            <strong className="text-sm text-white block">3. LIVE QUEUE TRACKING</strong>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Instant mobile notifications and visual position counters inform farmers exactly when to arrive.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <strong className="text-sm text-white block">4. TRANSPARENT STATUS</strong>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Real-time 9-stage audit trail from inspection and digital weighing to PFMS DBT payment credit.
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div>
        <div className="text-center mb-6">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Select Your Portal
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-0.5">
            Choose Role to Experience KrishiSetu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. FARMER PORTAL */}
          <div className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <UserCheck className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Primary User Portal
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Farmer Mobile Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Register crops, get transparent mandi recommendations, book slots, download QR passes, and track live queue and DBT payments.
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div>Active Profile: <strong>Ramesh Kumar</strong></div>
                <div className="text-slate-500">Active Token: <strong className="font-mono text-emerald-700">#PDC-1042</strong></div>
              </div>
            </div>

            <button
              onClick={handleSelectFarmer}
              className="mt-6 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Enter Farmer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. OPERATOR PORTAL */}
          <div className="bg-white rounded-3xl border-2 border-blue-500/40 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Mandi Operations
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                Centre Operator Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Scan tokens, call vehicles to gate, record moisture in Quality Lab, log electronic weighbridge scales, and issue J-Forms.
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div>Active Mandi: <strong>Digha Central Mandi</strong></div>
                <div className="text-slate-500">Node Code: <strong className="font-mono text-blue-700">DPC-01 (Khordha)</strong></div>
              </div>
            </div>

            <button
              onClick={handleSelectOperator}
              className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Enter Operator Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. ADMIN PORTAL */}
          <div className="bg-white rounded-3xl border-2 border-purple-500/40 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                State Administration
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                State Agri Admin Portal
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Statewide live monitoring, mandi capacity control, master farmer registry, audit trails, and interactive Recharts analytics.
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <div>Organization: <strong>OSAMB / Dept. of Agriculture</strong></div>
                <div className="text-slate-500">Coverage: <strong className="font-mono text-purple-700">5 Regional Mandis · 20+ Farmers</strong></div>
              </div>
            </div>

            <button
              onClick={handleSelectAdmin}
              className="mt-6 w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>Enter Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
