import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';

// Layout
import { GovHeader } from './components/layout/GovHeader';
import { RoleSwitcherBar } from './components/layout/RoleSwitcherBar';
import { FarmerMobileNav } from './components/layout/FarmerMobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { SmsSimulatorDrawer } from './components/common/SmsSimulatorDrawer';

// Landing & Auth
import { RoleSelectionPage } from './pages/auth/RoleSelectionPage';
import { LoginPage } from './pages/auth/LoginPage';

// Farmer
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { CropRegistration } from './pages/farmer/CropRegistration';
import { SlotBooking } from './pages/farmer/SlotBooking';
import { MySlotPage } from './pages/farmer/MySlotPage';
import { LiveQueuePage } from './pages/farmer/LiveQueuePage';
import { ProcurementStatus } from './pages/farmer/ProcurementStatus';
import { NotificationsPage } from './pages/farmer/NotificationsPage';
import { PaymentsPage } from './pages/farmer/PaymentsPage';
import { FarmerProfile } from './pages/farmer/FarmerProfile';
import { UserManualPage } from './pages/farmer/UserManualPage';

// Centre Operator
import { CentreDashboard } from './pages/centre/CentreDashboard';
import { CentreQueueManager } from './pages/centre/CentreQueueManager';
import { QualityCheckPage } from './pages/centre/QualityCheckPage';
import { DigitalWeighingPage } from './pages/centre/DigitalWeighingPage';
import { ProcurementCompletePage } from './pages/centre/ProcurementCompletePage';
import { MandiKioskDisplay } from './pages/centre/MandiKioskDisplay';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CentreMonitoring } from './pages/admin/CentreMonitoring';
import { FarmerRegistry } from './pages/admin/FarmerRegistry';
import { ProcurementMaster } from './pages/admin/ProcurementMaster';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { role: _role } = useAppState();

  const isDisplayRoute = location.pathname === '/display' || location.pathname === '/centre/kiosk';
  const isFarmerRoute = location.pathname.startsWith('/farmer');
  const isOperatorRoute = location.pathname.startsWith('/centre') && !isDisplayRoute;
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isDisplayRoute) {
    return <MandiKioskDisplay />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <GovHeader />
      <RoleSwitcherBar />

      {isFarmerRoute && <FarmerMobileNav />}

      <div className="flex-1 flex w-full">
        {(isOperatorRoute || isAdminRoute) && <Sidebar />}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/user-manual" element={<UserManualPage />} />
            <Route path="/portals" element={<RoleSelectionPage />} />

            {/* Farmer Routes */}
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/user-manual" element={<UserManualPage />} />
            <Route path="/farmer/register-crop" element={<CropRegistration />} />
            <Route path="/farmer/book-slot" element={<SlotBooking />} />
            <Route path="/farmer/my-slot" element={<MySlotPage />} />
            <Route path="/farmer/queue" element={<LiveQueuePage />} />
            <Route path="/farmer/status" element={<ProcurementStatus />} />
            <Route path="/farmer/notifications" element={<NotificationsPage />} />
            <Route path="/farmer/payments" element={<PaymentsPage />} />
            <Route path="/farmer/profile" element={<FarmerProfile />} />

            {/* Centre Operator Routes */}
            <Route path="/centre/dashboard" element={<CentreDashboard />} />
            <Route path="/centre/queue" element={<CentreQueueManager />} />
            <Route path="/centre/quality-check" element={<QualityCheckPage />} />
            <Route path="/centre/weighing" element={<DigitalWeighingPage />} />
            <Route path="/centre/procurement" element={<ProcurementCompletePage />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/centres" element={<CentreMonitoring />} />
            <Route path="/admin/farmers" element={<FarmerRegistry />} />
            <Route path="/admin/procurement" element={<ProcurementMaster />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />

            {/* Mandi Display Route */}
            <Route path="/display" element={<MandiKioskDisplay />} />
            <Route path="/centre/kiosk" element={<MandiKioskDisplay />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating Government SMS Simulator Drawer */}
      <SmsSimulatorDrawer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppStateProvider>
          <AppLayout />
        </AppStateProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
