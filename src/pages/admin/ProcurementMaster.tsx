import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ClipboardList,
  Search,
  Download,
  Filter,
  Wheat,
  Scale,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ProcurementMaster: React.FC = () => {
  const { procurements, centres } = useAppState();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [centreFilter, setCentreFilter] = useState('ALL');
  const [cropFilter, setCropFilter] = useState('ALL');

  const filteredRecords = procurements.filter(p => {
    const matchesSearch =
      p.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmerId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCentre = centreFilter === 'ALL' || p.centreId === centreFilter;
    const matchesCrop = cropFilter === 'ALL' || p.cropType === cropFilter;

    return matchesSearch && matchesCentre && matchesCrop;
  });

  const handleExportCSV = () => {
    const headers = ['Token,Farmer Name,Farmer ID,Centre,Crop,Quantity (Qtl),Slot Date,Status,Payment Amount (INR)\n'];
    const rows = filteredRecords.map(p => {
      const amt = p.payment?.netPayableAmount || (p.declaredQuantity * 2300);
      return `"${p.tokenNumber}","${p.farmerName}","${p.farmerId}","${p.centreName}","${p.cropType}",${p.declaredQuantity},"${p.slotDate}","${p.queueStatus}",${amt}\n`;
    });

    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `KISAN-Q_Procurements_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Procurement Master Ledger & J-Form Audit Log
          </h1>
          <p className="text-sm text-slate-500">
            Consolidated record of statewide transactions, laboratory inspections, and digital scale slips.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger to CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Token, Farmer Name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={centreFilter}
            onChange={(e) => setCentreFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Mandis ({centres.length})</option>
            {centres.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Crops</option>
            <option value="Paddy (Common)">Paddy (Common)</option>
            <option value="Paddy (Grade A)">Paddy (Grade A)</option>
            <option value="Wheat (Sharbati)">Wheat (Sharbati)</option>
            <option value="Mustard">Mustard</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3.5 px-4">Token</th>
                <th className="py-3.5 px-4">Farmer Details</th>
                <th className="py-3.5 px-4">Mandi Centre</th>
                <th className="py-3.5 px-4">Crop & Verified Qty</th>
                <th className="py-3.5 px-4">Slot Date</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item) => {
                const verifiedNet = item.weighing?.netWeight || item.declaredQuantity;
                const mspAmount = item.payment?.netPayableAmount || (verifiedNet * 2300);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                      {item.tokenNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="text-slate-900">{item.farmerName}</strong>
                      <div className="text-[11px] text-slate-500 font-mono">{item.farmerId}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.centreName}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">{item.cropType}</div>
                      <strong className="text-emerald-800 font-black">{verifiedNet} Qtl</strong>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(item.slotDate)}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] font-mono text-slate-600">
                      {item.stage.replace(/_/g, ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.queueStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right font-black text-emerald-800 text-sm font-mono">
                      {formatCurrency(mspAmount)}
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No procurement records match your search criteria.
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
