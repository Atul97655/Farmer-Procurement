import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Search, ShieldCheck } from 'lucide-react';
import { useAppState } from '../../context/AppStateContext';

interface GateCheckinScannerProps {
  onCheckinSuccess?: (tokenNumber: string) => void;
}

export const GateCheckinScanner: React.FC<GateCheckinScannerProps> = ({ onCheckinSuccess }) => {
  const { procurements, gateCheckin } = useAppState();
  const [inputToken, setInputToken] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Filter procurements waiting for gate arrival
  const eligibleForGate = procurements.filter(
    p => p.stage === 'SLOT_ASSIGNED' && p.queueStatus !== 'Cancelled'
  );

  const handleCheckin = async (token: string) => {
    if (!token.trim()) return;
    setStatusMessage(null);

    const success = await gateCheckin(token.trim());
    if (success) {
      setStatusMessage({
        type: 'success',
        text: `Gate Inward Verified for ${token.toUpperCase()}! Farmer entered Mandi Yard.`
      });
      setInputToken('');
      if (onCheckinSuccess) onCheckinSuccess(token);
    } else {
      setStatusMessage({
        type: 'error',
        text: `Invalid or unassigned token: ${token}. Please check slot booking.`
      });
    }
  };

  const simulateQrScan = (token: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      handleCheckin(token);
    }, 600);
  };

  return (
    <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Mandi Gate Inward & QR Check-In</h3>
            <p className="text-xs text-slate-500">Scan farmer entry pass / QR code to log physical vehicle arrival</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Gate 1 Active
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter Token (e.g. PDC-1043) or scan QR code..."
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckin(inputToken)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
          />
        </div>

        <button
          onClick={() => handleCheckin(inputToken)}
          disabled={!inputToken.trim()}
          className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Verify Inward
        </button>
      </div>

      {statusMessage && (
        <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Quick Demo Scan Shortcuts */}
      {eligibleForGate.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 mb-2">Simulate Gate Arrival (Quick 1-Click Scan):</p>
          <div className="flex flex-wrap gap-2">
            {eligibleForGate.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => simulateQrScan(p.tokenNumber)}
                disabled={isScanning}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                <QrCode className="w-3 h-3 text-emerald-600" />
                <span>Scan {p.tokenNumber} ({p.farmerName.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
