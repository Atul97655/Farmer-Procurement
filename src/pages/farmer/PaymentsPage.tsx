import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Printer,
  Landmark,
  FileText,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PaymentsPage: React.FC = () => {
  const { activeFarmer, procurements } = useAppState();
  const { t } = useLanguage();

  const farmerProcurements = procurements.filter(p => p.farmerId === activeFarmer.id);
  const completedOrProcessing = farmerProcurements.find(p => p.payment) || farmerProcurements[0];

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Direct Benefit Transfer (DBT) Payments
          </h1>
          <p className="text-sm text-slate-500">
            Automated MSP disbursals directly deposited into your Aadhaar-seeded bank account.
          </p>
        </div>

        {completedOrProcessing?.payment && (
          <button
            onClick={handlePrintVoucher}
            className="no-print bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Payment Voucher</span>
          </button>
        )}
      </div>

      {completedOrProcessing ? (
        <div className="space-y-6">
          
          {/* Main Amount Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/30">
                  Government Procurement Settlement
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-2">
                  {completedOrProcessing.payment
                    ? formatCurrency(completedOrProcessing.payment.netPayableAmount)
                    : formatCurrency(completedOrProcessing.declaredQuantity * 2300)}
                </div>
                <p className="text-xs text-emerald-100 mt-1 font-mono">
                  Token: {completedOrProcessing.tokenNumber} · {completedOrProcessing.cropType} ({completedOrProcessing.weighing?.netWeight || completedOrProcessing.declaredQuantity} Quintals)
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-200 block">Status</span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-emerald-900 mt-1 inline-block">
                  {completedOrProcessing.payment?.paymentStatus || 'Awaiting Weighbridge Sign-off'}
                </span>
              </div>
            </div>

            {/* Bank details bar */}
            <div className="mt-6 pt-4 border-t border-emerald-600/50 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-300" />
                <span>Credit Account: <strong>{activeFarmer.bankName} ({activeFarmer.bankAccountNumber})</strong></span>
              </div>
              <div>IFSC: <strong>{activeFarmer.ifscCode}</strong> (Aadhaar Seeded)</div>
            </div>
          </div>

          {/* Step-by-Step Simulated DBT Payment Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              DBT Payment Lifecycle Tracker
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: '1. Procurement Verified & Approved',
                  subtext: `Net verified weight ${completedOrProcessing.weighing?.netWeight || completedOrProcessing.declaredQuantity} Quintals logged.`,
                  done: completedOrProcessing.stage === 'PROCUREMENT_COMPLETE' || completedOrProcessing.stage === 'PAYMENT_INITIATED' || completedOrProcessing.stage === 'PAYMENT_COMPLETED'
                },
                {
                  title: '2. MSP Value Calculated',
                  subtext: `MSP @ ₹${completedOrProcessing.payment?.mspRate || 2300}/Qtl applied without quality deductions.`,
                  done: !!completedOrProcessing.payment
                },
                {
                  title: '3. PFMS DBT Batch Initiated',
                  subtext: `Batch #${completedOrProcessing.payment?.dbtBatchNo || 'DBT-OD-2026-PENDING'} pushed to Public Financial Management System.`,
                  done: completedOrProcessing.stage === 'PAYMENT_INITIATED' || completedOrProcessing.stage === 'PAYMENT_COMPLETED'
                },
                {
                  title: '4. Bank Network Processing',
                  subtext: `Bank Reference: ${completedOrProcessing.payment?.bankRefNo || 'PFMS-PENDING'}`,
                  done: completedOrProcessing.stage === 'PAYMENT_INITIATED' || completedOrProcessing.stage === 'PAYMENT_COMPLETED'
                },
                {
                  title: '5. Payment Credited to Account',
                  subtext: completedOrProcessing.payment?.utrNumber
                    ? `UTR No: ${completedOrProcessing.payment.utrNumber}`
                    : 'Directly credited within 24-48 hours of mandi weighment.',
                  done: completedOrProcessing.stage === 'PAYMENT_COMPLETED' || completedOrProcessing.payment?.paymentStatus === 'CREDITED'
                }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <strong className={`text-sm block ${step.done ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                      {step.title}
                    </strong>
                    <span className="text-xs text-slate-500 leading-relaxed block">
                      {step.subtext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculation Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Official Invoice & MSP Breakdown</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Declared Crop:</span>
                <strong className="text-slate-800">{completedOrProcessing.cropType}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Verified Net Weight:</span>
                <strong>{completedOrProcessing.weighing?.netWeight || completedOrProcessing.declaredQuantity} Quintals</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Official Support Price (MSP):</span>
                <strong>₹{completedOrProcessing.payment?.mspRate || 2300} / Quintal</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Quality Deductions / Bonuses:</span>
                <span className="text-emerald-700 font-bold">₹0 (Grade A Standards Met)</span>
              </div>
              <div className="flex justify-between py-2.5 text-sm bg-slate-50 px-3 rounded-xl">
                <span className="font-bold text-slate-900">Total Net Amount Payable:</span>
                <strong className="text-emerald-800 font-black text-base">
                  {formatCurrency(
                    completedOrProcessing.payment?.netPayableAmount ||
                    (completedOrProcessing.declaredQuantity * 2300)
                  )}
                </strong>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
          <p className="text-slate-500 text-sm">No payment records found.</p>
        </div>
      )}

    </div>
  );
};
