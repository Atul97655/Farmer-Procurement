import React from 'react';
import { ProcurementRecord } from '../../types';
import { generateQRCodeMatrix } from '../../utils/qrGenerator';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface QRModalProps {
  procurement: ProcurementRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ procurement, isOpen, onClose }) => {
  if (!isOpen) return null;

  const qrMatrix = generateQRCodeMatrix(procurement.qrData, 25);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Pass Header */}
        <div className="bg-emerald-800 text-white p-4 relative text-center">
          <button
            onClick={onClose}
            className="no-print absolute top-3 right-3 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Government of Odisha · Dept. of Agriculture</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">KrishiSetu e-Gate Pass</h2>
          <p className="text-xs text-emerald-100">Official Slot Confirmation & Digital Mandi Entry Voucher</p>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 space-y-5">
          
          {/* Token Highlight Box */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 text-center">
            <span className="text-xs uppercase tracking-wider text-amber-800 font-bold block">
              Official Token Number
            </span>
            <span className="text-3xl font-black text-amber-950 font-mono tracking-wider">
              {procurement.tokenNumber}
            </span>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified & Scheduled</span>
            </div>
          </div>

          {/* SVG QR Code Display */}
          <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
            <svg
              viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
              className="w-44 h-44 border-4 border-white"
              shapeRendering="crispEdges"
            >
              {qrMatrix.map((row, r) =>
                row.map((cell, c) =>
                  cell ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width={1}
                      height={1}
                      fill="#0f172a"
                    />
                  ) : null
                )
              )}
            </svg>
            <p className="text-[10px] text-slate-400 font-mono mt-1 text-center truncate max-w-xs">
              SCAN AT MANDI GATE 1 FOR INSTANT INWARD
            </p>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Farmer Name</span>
              <strong className="text-slate-800 text-sm">{procurement.farmerName}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Farmer ID</span>
              <span className="text-slate-800 font-mono text-[11px] font-bold">{procurement.farmerId}</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Crop & Quantity</span>
              <strong className="text-emerald-800">{procurement.cropType}</strong>
              <div className="text-slate-700 font-semibold">{procurement.declaredQuantity} Quintals</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Slot Window</span>
              <strong className="text-slate-800">{formatDate(procurement.slotDate)}</strong>
              <div className="text-amber-700 font-bold">{procurement.slotTime}</div>
            </div>

            <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-500 block">Procurement Mandi / Yard</span>
              <strong className="text-slate-900">{procurement.centreName}</strong>
              <div className="text-[11px] text-slate-500">Transport: {procurement.transportMode}</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
            <strong>Mandatory Guidelines:</strong> Please carry original Aadhaar Card and Land Record (Patta/Khatian) copy. Arrive 15 minutes before slot time.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print bg-slate-50 border-t border-slate-200 p-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
