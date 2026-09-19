import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  Search,
  ShieldCheck,
  MapPin,
  Landmark,
  FileText,
  Phone,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const FarmerRegistry: React.FC = () => {
  const { farmers, procurements } = useAppState();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const districts = Array.from(new Set(farmers.map(f => f.district)));

  const filteredFarmers = farmers.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery) ||
      f.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = districtFilter === 'ALL' || f.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Farmer Master Registry & KYC Verification
        </h1>
        <p className="text-sm text-slate-500">
          Statewide repository of registered agricultural producers with authenticated RoR land holdings.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Farmer Name, ID, Phone, Village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Districts ({farmers.length})</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Farmers */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3.5 px-4">Farmer Name & ID</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Land Holding</th>
                <th className="py-3.5 px-4">Bank Account</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Active Slots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFarmers.map((f) => {
                const farmerSlots = procurements.filter(p => p.farmerId === f.id);
                return (
                  <tr key={f.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4">
                      <strong className="text-sm text-slate-900 block">{f.name}</strong>
                      <span className="font-mono text-[11px] text-slate-500">{f.id}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {f.phone}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{f.village}, {f.block}</div>
                      <div className="text-[11px] text-slate-500">{f.district} — {f.pincode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-emerald-800 font-bold">{f.landAreaAcres} Acres</strong>
                      <div className="text-[11px] text-slate-500 font-mono">Khata: {f.khatianNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{f.bankName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{f.bankAccountNumber}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        <span>Verified</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {farmerSlots.length > 0 ? (
                        <span className="text-emerald-700 font-mono">
                          {farmerSlots[0].tokenNumber} ({farmerSlots[0].cropType.split(' ')[0]})
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredFarmers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No farmers found matching this criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
