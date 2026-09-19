import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { QrCode, Search, Sparkles } from 'lucide-react';
import { ProcurementRecord } from '../../types';

interface QRScannerSimulatorProps {
  onTokenSelected: (procurement: ProcurementRecord) => void;
}

export const QRScannerSimulator: React.FC<QRScannerSimulatorProps> = ({ onTokenSelected }) => {
  const { procurements, activeCentreId } = useAppState();
  const [inputToken, setInputToken] = useState('');
  const [error, setError] = useState('');

  const activeCentreProcurements = procurements.filter(p => p.centreId === activeCentreId);

  const handleSearch = (tokenToFind: string) => {
    const trimmed = tokenToFind.trim().toUpperCase();
    const found = procurements.find(p => p.tokenNumber.toUpperCase() === trimmed);
    if (found) {
      setError('');
      onTokenSelected(found);
    } else {
      setError(`Token "${trimmed}" not found in current procurement records.`);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Gate / Weighbridge Token Lookup</h3>
            <p className="text-xs text-slate-400">Simulate optical QR scan or enter Token number manually</p>
          </div>
        </div>
        <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Ready
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="e.g. PDC-1042, PDC-1038..."
            value={inputToken}
            onChange={(e) => {
              setInputToken(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(inputToken)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500 uppercase"
          />
          {inputToken && (
            <button
              onClick={() => setInputToken('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={() => handleSearch(inputToken)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0 shadow-md cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Lookup</span>
        </button>
      </div>

      {error && (
        <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800 rounded-lg p-2.5 mb-3">
          {error}
        </div>
      )}

      {/* Quick Click Simulation Tokens */}
      <div>
        <label className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
          ⚡ Quick Simulated Scans (Live Queue Tokens):
        </label>
        <div className="flex flex-wrap gap-1.5">
          {activeCentreProcurements.slice(0, 6).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setInputToken(p.tokenNumber);
                handleSearch(p.tokenNumber);
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 flex items-center gap-1.5 transition-all hover:border-emerald-500 cursor-pointer"
            >
              <span className="font-bold text-emerald-400">{p.tokenNumber}</span>
              <span className="text-slate-400 text-[10px]">({p.farmerName.split(' ')[0]})</span>
              <span className="text-[10px] text-amber-400">· {p.queueStatus}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
