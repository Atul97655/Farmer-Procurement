import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';
import { Language } from '../../types';
import { Sprout, Globe, Wifi, WifiOff, RefreshCw, Bell, LogOut, LogIn, User, BookOpen, X } from 'lucide-react';
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
    markNotificationAsRead,
    markAllNotificationsAsRead,
    connectionStatus,
    setConnectionStatus,
    lastSyncTime,
    syncNow
  } = useAppState();
  const navigate = useNavigate();

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };
    if (showNotificationsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotificationsDropdown]);

  const roleNotifications = notifications.filter(n => {
    if (!isAuthenticated || !currentUser) return false;
    if (role === 'FARMER') return n.userId === currentUser.id || n.role === 'ALL';
    if (role === 'OPERATOR') return n.role === 'OPERATOR' || n.role === 'ALL';
    return n.role === 'ADMIN' || n.role === 'ALL' || n.type === 'system';
  });

  const unreadCount = roleNotifications.filter(n => !n.isRead).length;

  const secondsAgo = Math.max(0, Math.floor((new Date().getTime() - lastSyncTime.getTime()) / 1000));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = currentUser?.name || '';
  const displayPhone = currentUser?.phone || undefined;

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

          {/* User Manual Link */}
          <Link
            to="/user-manual"
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-700 hover:border-amber-400/50 transition-all"
            title="Farmer User Manual & Registration Guide"
          >
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span>{language === 'or' ? 'ମାନୁଆଲ' : language === 'hi' ? 'गाइड' : 'User Manual'}</span>
          </Link>

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
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotificationsDropdown(prev => !prev)}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Notifications"
              aria-expanded={showNotificationsDropdown}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Interactive Notifications Popover */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">
                      {role === 'ADMIN' ? 'Statewide Procurement Alerts' : 'Notifications & Alerts'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[10px] bg-emerald-700/80 hover:bg-emerald-600 px-2 py-0.5 rounded text-emerald-100 font-semibold cursor-pointer transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {roleNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    roleNotifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          if (n.actionUrl) {
                            navigate(n.actionUrl);
                            setShowNotificationsDropdown(false);
                          }
                        }}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                          !n.isRead ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-emerald-600 transition-opacity"
                          style={{ opacity: n.isRead ? 0 : 1 }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-900 flex items-center justify-between gap-1">
                            <span className="truncate">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      if (role === 'FARMER') navigate('/farmer/notifications');
                      else if (role === 'ADMIN') navigate('/admin/notifications');
                      else navigate('/centre/dashboard');
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    View All Notifications & Ledger →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account Info Chip or Sign In button */}
          {isAuthenticated && currentUser ? (
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
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer ml-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
