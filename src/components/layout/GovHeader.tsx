import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';
import { Language } from '../../types';
import { Sprout, Globe, Wifi, WifiOff, RefreshCw, Bell, LogOut, LogIn, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const GovHeader: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const {
    role,
    activeFarmer,
    currentUser,
    isAuthenticated,
    logout,
    notifications,
    connectionStatus,
    setConnectionStatus,
    lastSyncTime,
    syncNow
  } = useAppState();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => {
    if (role === 'FARMER') return n.userId === activeFarmer.id && !n.isRead;
    if (role === 'OPERATOR') return n.role === 'OPERATOR' && !n.isRead;
    return !n.isRead;
  }).length;

  const secondsAgo = Math.max(0, Math.floor((new Date().getTime() - lastSyncTime.getTime()) / 1000));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = currentUser?.name || (role === 'FARMER' ? activeFarmer.name : role === 'OPERATOR' ? 'Mandi Operator' : 'State Agri Admin');
  const displayPhone = currentUser?.phone || (role === 'FARMER' ? activeFarmer.phone : undefined);

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Indian National Tricolor Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      {/* Top Gov Info Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400">🏛️ {t.govState}</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-slate-400">{t.govDepartment}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Connectivity Pill */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            {connectionStatus === 'online' ? (
              <span className="flex items-center text-emerald-400 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden md:inline">{t.connectionLive}</span>
              </span>
            ) : connectionStatus === 'weak' ? (
              <span className="flex items-center text-amber-400 gap-1">
                <Wifi className="w-3 h-3" />
                <span className="hidden md:inline">{t.connectionWeak}</span>
              </span>
            ) : (
              <span className="flex items-center text-rose-400 gap-1">
                <WifiOff className="w-3 h-3" />
                <span className="hidden md:inline">{t.connectionOffline}</span>
              </span>
            )}
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 text-[10px]">{secondsAgo}s</span>
            <button
              onClick={syncNow}
              title="Force Sync"
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Simulate connection toggle */}
          <select
            value={connectionStatus}
            onChange={(e) => setConnectionStatus(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px] cursor-pointer"
            title="Simulate Network Condition"
          >
            <option value="online">🟢 Live Sync</option>
            <option value="weak">🟡 2G Network</option>
            <option value="offline">🔴 Offline</option>
          </select>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-800 rounded px-2 py-0.5">
            <Globe className="w-3 h-3 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-800 text-white">English</option>
              <option value="hi" className="bg-slate-800 text-white">हिन्दी (Hindi)</option>
              <option value="or" className="bg-slate-800 text-white">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Branding Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-800 transition-colors">
            <Sprout className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                KISAN<span className="text-emerald-700">-Q</span>
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                {language === 'hi' ? 'किसान-क्यू' : language === 'or' ? 'କିଷାନ-କ୍ୟୁ' : 'Smart Queue'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t.portalSubtitle}
            </p>
          </div>
        </Link>

        {/* Right side user session & controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => {
              if (role === 'FARMER') navigate('/farmer/notifications');
              else if (role === 'OPERATOR') navigate('/centre/dashboard');
              else navigate('/admin/dashboard');
            }}
            className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Account Info Chip */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300 shadow-2xs">
              <User className="w-4 h-4" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 line-clamp-1">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500">
                {displayPhone ? `+91 ${displayPhone}` : role === 'OPERATOR' ? 'Mandi Operator' : 'State Agri Admin'}
              </span>
            </div>

            {/* Logout / Switch Button */}
            <button
              onClick={handleLogout}
              title="Logout / Change User"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
