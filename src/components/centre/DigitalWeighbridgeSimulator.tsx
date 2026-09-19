import React, { useState, useEffect } from 'react';
import { Scale, Cpu, RefreshCw, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

interface DigitalWeighbridgeSimulatorProps {
  initialDeclaredWeight?: number;
  onApplyWeights: (gross: number, tare: number) => void;
}

export const DigitalWeighbridgeSimulator: React.FC<DigitalWeighbridgeSimulatorProps> = ({
  initialDeclaredWeight = 50,
  onApplyWeights
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [tareWeight, setTareWeight] = useState(22.4);
  const [currentReading, setCurrentReading] = useState(
    Math.round((initialDeclaredWeight + 22.4) * 100) / 100
  );
  const [isStable, setIsStable] = useState(true);
  const [mode, setMode] = useState<'GROSS' | 'TARE'>('GROSS');

  // Simulate micro-fluctuations in load-cell sensor stream
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 0.04;
      const base = mode === 'GROSS' ? initialDeclaredWeight + tareWeight : tareWeight;
      const newReading = Math.round((base + jitter) * 100) / 100;
      setCurrentReading(newReading);
      setIsStable(Math.abs(jitter) < 0.015);
    }, 1200);

    return () => clearInterval(interval);
  }, [isConnected, mode, initialDeclaredWeight, tareWeight]);

  const handlePushToSlip = () => {
    const gross = Math.round((initialDeclaredWeight + tareWeight) * 100) / 100;
    onApplyWeights(gross, tareWeight);
  };

  const calculatedNet = Math.max(0, Math.round((currentReading - tareWeight) * 100) / 100);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-md mb-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100 tracking-wide">FCI Smart Weighbridge Indicator (IoT)</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                COM3: 9600 Baud
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Direct telemetry stream from 60-Tonne Pitless Electronic Weighbridge</p>
          </div>
        </div>

        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
            isConnected
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-red-950 text-red-300 border border-red-800'
          }`}
        >
          <Cpu className="w-3 h-3" />
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </button>
      </div>

      {/* Digital LED Terminal Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-2 bg-black rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-amber-400">
              <Zap className="w-3 h-3" />
              LIVE LOAD-CELL SENSOR
            </span>
            <span className={isStable ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {isStable ? '● STABLE' : '○ MOTION'}
            </span>
          </div>

          <div className="flex items-baseline justify-between py-1">
            <span className="text-4xl sm:text-5xl font-mono font-black text-amber-400 tracking-tight">
              {currentReading.toFixed(2)}
            </span>
            <span className="text-base font-mono text-slate-400 font-semibold">QUINTALS</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-400">
            <span>Tare: {tareWeight.toFixed(2)} Qtl</span>
            <span className="text-emerald-400 font-bold">Verified Net: {calculatedNet.toFixed(2)} Qtl</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col justify-between gap-2 bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-slate-300">Weighbridge Automation:</div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setMode('GROSS')}
                className={`flex-1 py-1 text-xs font-mono rounded border transition-colors ${
                  mode === 'GROSS'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Gross Mode
              </button>
              <button
                type="button"
                onClick={() => setMode('TARE')}
                className={`flex-1 py-1 text-xs font-mono rounded border transition-colors ${
                  mode === 'TARE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Tare Mode
              </button>
            </div>
            <button
              type="button"
              onClick={() => setTareWeight(Math.round((20 + Math.random() * 5) * 10) / 10)}
              className="w-full py-1 text-[11px] font-mono text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded border border-slate-600 flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Re-Tare Empty Tractor
            </button>
          </div>

          <button
            type="button"
            onClick={handlePushToSlip}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Capture Weight from Scale
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded border border-slate-800">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        <span>Govt Anti-Tamper Shield: Weighment values are cryptographically sealed from load-cell serial bus.</span>
      </div>
    </div>
  );
};
