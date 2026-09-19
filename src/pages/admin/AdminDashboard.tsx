import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Wheat,
  CreditCard,
  Scale,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Clock
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { farmers, centres, procurements } = useAppState();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Summary Metrics
  const totalFarmersCount = farmers.length;
  const activeCentresCount = centres.length;

  const totalProcuredQuintals = procurements
    .filter(p => p.stage === 'PROCUREMENT_COMPLETE' || p.stage === 'PAYMENT_INITIATED' || p.stage === 'PAYMENT_COMPLETED')
    .reduce((sum, p) => sum + (p.weighing?.netWeight || p.declaredQuantity), 0);

  const totalDisbursedValue = procurements
    .filter(p => p.payment)
    .reduce((sum, p) => sum + (p.payment?.netPayableAmount || 0), 0);

  const pendingApprovalsCount = procurements.filter(p => p.stage === 'REGISTRATION_COMPLETED').length;
  const pendingPaymentsCount = procurements.filter(p => p.stage === 'PAYMENT_INITIATED' || p.payment?.paymentStatus === 'PROCESSING').length;

  // Chart data: Today's Hourly Intake Trend
  const hourlyData = [
    { hour: '08 AM', quintals: 120, farmers: 6 },
    { hour: '09 AM', quintals: 280, farmers: 14 },
    { hour: '10 AM', quintals: 490, farmers: 22 },
    { hour: '11 AM', quintals: 620, farmers: 28 },
    { hour: '12 PM', quintals: 510, farmers: 20 },
    { hour: '01 PM', quintals: 310, farmers: 12 },
    { hour: '02 PM', quintals: 440, farmers: 18 },
    { hour: '03 PM', quintals: 380, farmers: 15 }
  ];

  // Mandi capacity load data
  const centreLoadData = centres.map(c => ({
    name: c.code,
    currentLoad: c.currentLoad,
    dailyCapacity: c.dailyCapacity,
    queue: c.queueLength
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* State Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                🏛️ State Agricultural Marketing Command Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Statewide Crop Procurement & Logistics Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Odisha State Agricultural Marketing Board (OSAMB) · Live Mandi Monitoring & Queue Dispatch
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/analytics')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Full Analytics Suite</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Statewide KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Registered Farmers"
          value={totalFarmersCount}
          subtitle="PM-KISAN / Bhulekh KYC Verified"
          icon={Users}
          color="emerald"
          trend="+12% this week"
        />
        <StatCard
          title="Active Procurement Mandis"
          value={activeCentresCount}
          subtitle="Regional Grain Depots"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Total Procured Volume"
          value={`${totalProcuredQuintals.toLocaleString('en-IN')} Qtl`}
          subtitle="Verified Net Weighment"
          icon={Scale}
          color="purple"
          trend="Paddy & Wheat"
        />
        <StatCard
          title="Total Disbursed Value"
          value={formatCurrency(totalDisbursedValue || 354000)}
          subtitle="Direct DBT to Bank Accounts"
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="Active Queue Tokens"
          value={procurements.filter(p => p.queueStatus !== 'Completed' && p.queueStatus !== 'Cancelled').length}
          subtitle="Inward Yard Vehicles"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Pending Payments"
          value={pendingPaymentsCount}
          subtitle="PFMS DBT Processing Batches"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly Procurement Volume Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Today's Statewide Inflow Trend</h3>
              <p className="text-xs text-slate-500">Hourly intake in Quintals across all 5 procurement yards</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              Live Feed
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="quintals" stroke="#15803d" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mandi Capacity & Workload Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Mandi Capacity vs Current Load</h3>
              <p className="text-xs text-slate-500">Daily intake quota vs allocated farmer slots (Qtl)</p>
            </div>
            <button
              onClick={() => navigate('/admin/centres')}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Manage Capacity →
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={centreLoadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="currentLoad" fill="#15803d" name="Current Load (Qtl)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dailyCapacity" fill="#cbd5e1" name="Max Capacity (Qtl)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Procurement Centres Real-time Monitoring Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Regional Procurement Mandis Overview</h3>
            <p className="text-xs text-slate-500">Live operational status, queue bottlenecks, and capacity thresholds</p>
          </div>

          <button
            onClick={() => navigate('/admin/centres')}
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>Adjust Mandi Capacities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-4">Centre Code</th>
                <th className="py-3 px-4">Mandi Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Capacity Utilization</th>
                <th className="py-3 px-4">Queue Length</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {centres.map((c) => {
                const util = Math.round((c.currentLoad / c.dailyCapacity) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 text-slate-600">{c.district}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${util > 85 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                            style={{ width: `${Math.min(100, util)}%` }}
                          ></div>
                        </div>
                        <span className="font-bold">{c.currentLoad}/{c.dailyCapacity} Qtl ({util}%)</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{c.queueLength} vehicles</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
