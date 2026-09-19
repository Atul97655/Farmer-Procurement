import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Scale,
  FileCheck,
  Building2,
  BarChart3,
  UserCheck,
  ClipboardList
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { role, activeCentreId, setActiveCentreId, centres } = useAppState();

  const currentCentre = centres.find(c => c.id === activeCentreId) || centres[0];

  const operatorLinks = [
    { to: '/centre/dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { to: '/centre/queue', label: t.navQueue, icon: Users },
    { to: '/centre/quality-check', label: t.navQualityCheck, icon: FlaskConical },
    { to: '/centre/weighing', label: t.navWeighing, icon: Scale },
    { to: '/centre/procurement', label: t.navProcurement, icon: FileCheck }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { to: '/admin/centres', label: t.navCentres, icon: Building2 },
    { to: '/admin/farmers', label: t.navFarmers, icon: UserCheck },
    { to: '/admin/procurement', label: t.navProcurement, icon: ClipboardList },
    { to: '/admin/analytics', label: t.navAnalytics, icon: BarChart3 }
  ];

  const links = role === 'OPERATOR' ? operatorLinks : adminLinks;

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-105px)] p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
      <div>
        {/* Role Portal Header */}
        <div className="pb-4 mb-4 border-b border-slate-800">
          <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
            {role === 'OPERATOR' ? t.roleOperator : t.roleAdmin}
          </div>
          {role === 'OPERATOR' ? (
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Operating Centre:</label>
              <select
                value={activeCentreId}
                onChange={(e) => setActiveCentreId(e.target.value)}
                className="w-full bg-slate-800 text-white text-xs rounded border border-slate-700 px-2 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Queue: <strong className="text-emerald-400">{currentCentre.queueLength}</strong></span>
                <span>Load: <strong className="text-amber-400">{currentCentre.currentLoad}/{currentCentre.dailyCapacity} Qtl</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Statewide Procurement & Capacity Administration
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-400">KrishiSetu National Portal</div>
        <div>Ver 2.4 · Secure & Gov Verified</div>
      </div>
    </aside>
  );
};
