import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Users, Activity, User, PlusCircle, CreditCard, Bell, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmerMobileNav: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/farmer/dashboard', label: t.navDashboard, icon: Home },
    { to: '/farmer/my-slot', label: t.navMySlot, icon: Calendar },
    { to: '/farmer/register-crop', label: t.navRegisterCrop, icon: PlusCircle, isPrimary: true },
    { to: '/farmer/queue', label: t.navQueue, icon: Users },
    { to: '/farmer/status', label: t.navStatus, icon: Activity },
    { to: '/farmer/profile', label: t.navProfile, icon: User }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.isPrimary) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-4 border-white hover:bg-emerald-700 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                    {item.label}
                  </span>
                </NavLink>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                    isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Desktop Secondary Subheader Nav for Farmer */}
      <div className="no-print hidden md:block bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 h-12">
            {[
              { to: '/farmer/dashboard', label: t.navDashboard, icon: Home },
              { to: '/farmer/register-crop', label: t.navRegisterCrop, icon: PlusCircle },
              { to: '/farmer/my-slot', label: t.navMySlot, icon: Calendar },
              { to: '/farmer/queue', label: t.navQueue, icon: Users },
              { to: '/farmer/status', label: t.navStatus, icon: Activity },
              { to: '/farmer/payments', label: t.navPayments, icon: CreditCard },
              { to: '/farmer/notifications', label: t.navNotifications, icon: Bell },
              { to: '/farmer/profile', label: t.navProfile, icon: User },
              { to: '/farmer/user-manual', label: t.navUserManual || 'User Manual', icon: BookOpen }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-emerald-600 text-emerald-700 font-semibold'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
