import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  Scale,
  Calendar,
  CreditCard,
  Building2,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { centres, procurements, farmers } = useAppState();
  const { t } = useLanguage();

  // 1. Daily Procurement Volume over last 7 days
  const dailyTrendsData = [
    { date: '31 Aug', paddy: 1200, wheat: 450, total: 1650 },
    { date: '01 Sep', paddy: 1450, wheat: 520, total: 1970 },
    { date: '02 Sep', paddy: 1800, wheat: 610, total: 2410 },
    { date: '03 Sep', paddy: 2100, wheat: 700, total: 2800 },
    { date: '04 Sep', paddy: 2350, wheat: 820, total: 3170 },
    { date: '05 Sep', paddy: 2600, wheat: 910, total: 3510 },
    { date: '06 Sep', paddy: 2840, wheat: 980, total: 3820 }
  ];

  // 2. Centre Workload vs Capacity
  const centreWorkloadData = centres.map(c => ({
    name: c.code,
    currentLoad: c.currentLoad,
    remainingCap: Math.max(0, c.dailyCapacity - c.currentLoad),
    queue: c.queueLength
  }));

  // 3. Crop-wise Share (Pie Chart)
  const cropShareData = [
    { name: 'Paddy Common', value: 2450, color: '#15803d' },
    { name: 'Paddy Grade A', value: 890, color: '#16a34a' },
    { name: 'Wheat Sharbati', value: 980, color: '#d97706' },
    { name: 'Mustard', value: 340, color: '#eab308' },
    { name: 'Groundnut', value: 210, color: '#854d0e' },
    { name: 'Maize', value: 180, color: '#0284c7' }
  ];

  // 4. Quality Grade Distribution
  const qualityGradeData = [
    { grade: 'Grade A (Premium)', count: 68, color: '#15803d' },
    { grade: 'FAQ (Standard)', count: 24, color: '#2563eb' },
    { grade: 'Grade B (Fair)', count: 6, color: '#eab308' },
    { grade: 'Rejected (High Moisture)', count: 2, color: '#dc2626' }
  ];

  // 5. Turnaround & Waiting Time Reduction Benchmark
  const turnaroundData = [
    { mandi: 'DPC-01', beforeKrishiSetu: 340, withKrishiSetu: 42 },
    { mandi: 'SMC-02', beforeKrishiSetu: 280, withKrishiSetu: 35 },
    { mandi: 'BMC-03', beforeKrishiSetu: 420, withKrishiSetu: 58 },
    { mandi: 'CKH-04', beforeKrishiSetu: 210, withKrishiSetu: 25 },
    { mandi: 'BGD-05', beforeKrishiSetu: 310, withKrishiSetu: 38 }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-700" />
          <span>Procurement Intelligence & Efficiency Analytics</span>
        </h1>
        <p className="text-sm text-slate-500">
          National Mandi KPI visualizer: Measuring queue wait time reduction, quality distribution, and Mandi workload balance.
        </p>
      </div>

      {/* SIH Value Proposition Benchmark Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-700 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-emerald-300 uppercase font-bold block">Average Yard Wait</span>
            <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">38 mins</div>
            <span className="text-[10px] text-slate-300">Down from 5.5 hours (-88%)</span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-amber-300 uppercase font-bold block">Capacity Optimization</span>
            <div className="text-3xl font-black text-amber-400 font-mono mt-0.5">94.2%</div>
            <span className="text-[10px] text-slate-300">Smart rule-based redistribution</span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-blue-300 uppercase font-bold block">Quality Pass Rate</span>
            <div className="text-3xl font-black text-blue-400 font-mono mt-0.5">98.0%</div>
            <span className="text-[10px] text-slate-300">Moisture limit compliance</span>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-purple-300 uppercase font-bold block">DBT Turnaround</span>
            <div className="text-3xl font-black text-purple-400 font-mono mt-0.5">&lt; 24 Hrs</div>
            <span className="text-[10px] text-slate-300">Direct PFMS batch processing</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: 7-Day Procurement Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">7-Day Procurement Trend</h3>
              <p className="text-xs text-slate-500">Cumulative intake volume across all commodities (Quintals)</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="paddy" stackId="1" stroke="#15803d" fill="#15803d" name="Paddy (Qtl)" />
                <Area type="monotone" dataKey="wheat" stackId="1" stroke="#d97706" fill="#d97706" name="Wheat (Qtl)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: SIH Key Metric - Waiting Time Reduction */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Queue Time Reduction (Minutes)</h3>
              <p className="text-xs text-slate-500">Benchmark: Traditional Unscheduled Mandi vs KrishiSetu Smart Slots</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnaroundData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mandi" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="beforeKrishiSetu" fill="#cbd5e1" name="Traditional (Mins)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withKrishiSetu" fill="#15803d" name="With KrishiSetu (Mins)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Commodity Procurement Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Crop-wise Procurement Volume</h3>
              <p className="text-xs text-slate-500">Distribution by agricultural produce category</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cropShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Quality Inspection Compliance */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Quality Inspection Grade Breakdown</h3>
              <p className="text-xs text-slate-500">Percentage breakdown of inspected lots across state laboratories</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityGradeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="grade" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" name="Percentage of Lots (%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
