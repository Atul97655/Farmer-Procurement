import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Building2, ShieldCheck, RotateCcw, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { role, setRole, activeFarmer, setActiveFarmerId, activeCentreId, setActiveCentreId, resetDemoData } = useAppState();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSelectFarmer = (farmerId: string) => {
    setActiveFarmerId(farmerId);
    setRole('FARMER');
    navigate('/farmer/dashboard');
  };

  const handleSelectOperator = (centreId: string) => {
    setActiveCentreId(centreId);
    setRole('OPERATOR');
    navigate('/centre/dashboard');
  };

  const handleSelectAdmin = () => {
    setRole('ADMIN');
    navigate('/admin/dashboard');
  };

  if (isCollapsed) {
    return (
      <div className="no-print bg-slate-900 border-b border-slate-800 px-4 py-1 flex justify-end">
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
        >
          <Sliders className="w-3 h-3 text-emerald-400" />
          <span>{t('Quick Role Switcher')}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="no-print bg-slate-800 text-white border-b border-slate-700 px-3 py-1.5 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('Quick Role Switcher:')}</span>
          </span>
          <span className="text-slate-400 hidden lg:inline text-[11px]">
            {t('Switch roles to test real-time synchronization across the procurement lifecycle')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Farmer 1: Ramesh Kumar */}
          <button
            onClick={() => handleSelectFarmer('FRM-OD-2026-8812')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium cursor-pointer ${
              role === 'FARMER' && activeFarmer.id === 'FRM-OD-2026-8812'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-800'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>{t('Farmer')} (Ramesh #PDC-1042)</span>
          </button>

          {/* Farmer 2: Sunita Devi */}
          <button
            onClick={() => handleSelectFarmer('FRM-OD-2026-8813')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium cursor-pointer ${
              role === 'FARMER' && activeFarmer.id === 'FRM-OD-2026-8813'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-800'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>{t('Farmer')} (Sunita #WHT-2019)</span>
          </button>

          {/* Operator 1: Digha Mandi */}
          <button
            onClick={() => handleSelectOperator('c-1')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium cursor-pointer ${
              role === 'OPERATOR' && activeCentreId === 'c-1'
                ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-800'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>{t('Operator')} (Digha)</span>
          </button>

          {/* Admin */}
          <button
            onClick={handleSelectAdmin}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium cursor-pointer ${
              role === 'ADMIN'
                ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-800'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{t('State Admin')}</span>
          </button>

          {/* Reset Platform Data button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all platform records, queues and capacity back to initial state?')) {
                resetDemoData();
              }
            }}
            title="Reset to default dataset"
            className="flex items-center gap-1 px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 transition-colors ml-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{t('Reset')}</span>
          </button>

          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(true)}
            title="Hide switcher bar"
            className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
