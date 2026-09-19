import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Calendar,
  Users,
  FlaskConical,
  Scale,
  CreditCard,
  Info,
  Clock
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { role, activeFarmer, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  const roleNotifs = notifications.filter(n => {
    if (role === 'ADMIN') return n.role === 'ADMIN' || n.role === 'ALL' || n.type === 'system';
    if (role === 'OPERATOR') return n.role === 'OPERATOR' || n.role === 'ALL';
    return n.userId === activeFarmer.id || n.role === 'ALL';
  });

  const filteredNotifs = roleNotifs.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'slot': return <Calendar className="w-5 h-5 text-emerald-600" />;
      case 'queue': return <Users className="w-5 h-5 text-blue-600" />;
      case 'quality': return <FlaskConical className="w-5 h-5 text-purple-600" />;
      case 'weighing': return <Scale className="w-5 h-5 text-indigo-600" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-amber-600" />;
      default: return <Info className="w-5 h-5 text-slate-600" />;
    }
  };

  const tabs = role === 'ADMIN'
    ? [
        { id: 'all', label: 'All Statewide Alerts' },
        { id: 'system', label: 'Mandi Operations & DBT' }
      ]
    : [
        { id: 'all', label: 'All Alerts' },
        { id: 'slot', label: 'Slot Confirmations' },
        { id: 'queue', label: 'Queue Updates' },
        { id: 'payment', label: 'Payment Receipts' }
      ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-700" />
            <span>
              {role === 'ADMIN'
                ? 'Statewide Notifications & System Procurement Alerts'
                : 'SMS & App Notifications'}
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            {role === 'ADMIN'
              ? 'Real-time mandi intake alerts, capacity notifications, and DBT disbursal records.'
              : 'Real-time procurement alerts, queue updates, and DBT payment confirmations.'}
          </p>
        </div>

        {roleNotifs.some(n => !n.isRead) && (
          <button
            onClick={markAllNotificationsAsRead}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              markNotificationAsRead(n.id);
              if (n.actionUrl) navigate(n.actionUrl);
            }}
            className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-3.5 shadow-2xs hover:shadow-xs ${
              !n.isRead ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200'
            }`}
          >
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              !n.isRead ? 'bg-emerald-100 border-emerald-300' : 'bg-slate-50 border-slate-200'
            }`}>
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`text-sm ${!n.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                  {n.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {formatDateTime(n.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {n.message}
              </p>
            </div>

            {!n.isRead && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-2"></span>
            )}
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-200">
            No notifications found in this category.
          </div>
        )}
      </div>

    </div>
  );
};
