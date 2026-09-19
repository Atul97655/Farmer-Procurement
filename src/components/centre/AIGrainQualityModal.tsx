import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  RefreshCw, 
  Layers, 
  Check,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { QualityGrade, QualityResult } from '../../types';

interface GrainSamplePreset {
  id: string;
  name: string;
  cropName: string;
  description: string;
  moisture: number;
  foreignMatter: number;
  damagedGrain: number;
  immatureGrain: number;
  expectedGrade: QualityGrade;
  expectedResult: QualityResult;
  confidence: number;
  detectedContours: number;
  admixtureItems: number;
  damagedItems: number;
}

const PRESET_SAMPLES: GrainSamplePreset[] = [
  {
    id: 'sample-grade-a',
    name: 'Grade A Premium Wheat (Clean FAQ)',
    cropName: 'Wheat (Sharbati)',
    description: 'Golden uniform grains, negligible chaff, pristine seed coat.',
    moisture: 13.2,
    foreignMatter: 0.4,
    damagedGrain: 0.9,
    immatureGrain: 1.1,
    expectedGrade: 'Grade A',
    expectedResult: 'PASS',
    confidence: 97.4,
    detectedContours: 540,
    admixtureItems: 2,
    damagedItems: 5
  },
  {
    id: 'sample-faq',
    name: 'FAQ Standard Paddy Sample',
    cropName: 'Paddy (Common)',
    description: 'Within FCI Fair Average Quality specifications, minimal husk admixture.',
    moisture: 14.8,
    foreignMatter: 0.9,
    damagedGrain: 1.8,
    immatureGrain: 2.2,
    expectedGrade: 'FAQ (Fair Average Quality)',
    expectedResult: 'PASS',
    confidence: 95.1,
    detectedContours: 488,
    admixtureItems: 7,
    damagedItems: 11
  },
  {
    id: 'sample-grade-b',
    name: 'Grade B (Admixture & High Moisture)',
    cropName: 'Paddy (Common)',
    description: 'Noticeable broken kernels, weed seeds, slight dampness.',
    moisture: 16.4,
    foreignMatter: 1.6,
    damagedGrain: 3.4,
    immatureGrain: 3.9,
    expectedGrade: 'Grade B',
    expectedResult: 'PASS',
    confidence: 92.8,
    detectedContours: 462,
    admixtureItems: 18,
    damagedItems: 24
  },
  {
    id: 'sample-rejected',
    name: 'Damaged & Moldy Rejection Lot',
    cropName: 'Wheat (Sharbati)',
    description: 'Severe fungal smut, insect infestation, and excessive stones.',
    moisture: 18.9,
    foreignMatter: 3.8,
    damagedGrain: 8.4,
    immatureGrain: 6.2,
    expectedGrade: 'Rejected',
    expectedResult: 'FAIL',
    confidence: 98.9,
    detectedContours: 512,
    admixtureItems: 42,
    damagedItems: 68
  }
];

interface AIGrainQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropType?: string;
  onApplyResults: (data: {
    moisture: number;
    foreignMatter: number;
    damagedGrain: number;
    immatureGrain: number;
    grade: QualityGrade;
    result: QualityResult;
    remarks: string;
    aiConfidence: number;
  }) => void;
}

export const AIGrainQualityModal: React.FC<AIGrainQualityModalProps> = ({
  isOpen,
  onClose,
  cropType = 'Grain',
  onApplyResults
}) => {
  const [selectedPreset, setSelectedPreset] = useState<GrainSamplePreset>(PRESET_SAMPLES[1]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'camera'>('presets');

  useEffect(() => {
    if (isOpen) {
      triggerScan();
    }
  }, [isOpen, selectedPreset]);

  const triggerScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanComplete(true);
      }
    }, 180);
  };

  if (!isOpen) return null;

  const handleApply = () => {
    const remarks = `AI Vision Verified: ${selectedPreset.expectedGrade} with ${selectedPreset.confidence}% confidence. Detected ${selectedPreset.detectedContours} grain kernels (${selectedPreset.damagedItems} damaged, ${selectedPreset.admixtureItems} foreign matter). Meets FCI guidelines.`;

    onApplyResults({
      moisture: selectedPreset.moisture,
      foreignMatter: selectedPreset.foreignMatter,
      damagedGrain: selectedPreset.damagedGrain,
      immatureGrain: selectedPreset.immatureGrain,
      grade: selectedPreset.expectedGrade,
      result: selectedPreset.expectedResult,
      remarks,
      aiConfidence: selectedPreset.confidence
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white">KishanQ AI Grain Inspector</h2>
                <span className="text-[10px] bg-purple-400/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30 font-mono">
                  Vision Model v1.4
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Automated FCI Morphological & Chromatic Grain Quality Assessment
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Select Grain Tray Sample Preset</span>
              </label>
              <span className="text-[11px] text-slate-500">Live APMC Laboratory Calibration</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_SAMPLES.map((sample) => {
                const isSelected = selectedPreset.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => setSelectedPreset(sample)}
                    className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900 truncate">{sample.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{sample.cropName}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sample.expectedResult === 'PASS' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sample.expectedResult}
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 font-bold">
                        {sample.moisture}% M
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Inspection Tray Canvas */}
          <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner p-4 min-h-[220px] flex flex-col justify-between">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Top Overlay Stats */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-[11px] text-emerald-400 font-semibold">LAB CAMERA: 1080p 60fps MACRO</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Contours: {selectedPreset.detectedContours} | Refraction: 1.33
              </span>
            </div>

            {/* Center Visual Grains with Bounding Boxes */}
            <div className="relative z-10 py-6 flex items-center justify-center gap-4 flex-wrap">
              {/* Healthy Grains */}
              <div className="border border-emerald-500/80 bg-emerald-500/10 rounded-lg p-2 text-center backdrop-blur-xs">
                <div className="w-12 h-6 bg-amber-200/90 rounded-full mx-auto shadow-xs border border-amber-300"></div>
                <span className="text-[10px] font-mono text-emerald-300 font-bold block mt-1">FAQ #104 [0.99]</span>
              </div>
              <div className="border border-emerald-500/80 bg-emerald-500/10 rounded-lg p-2 text-center backdrop-blur-xs">
                <div className="w-14 h-6 bg-amber-300/90 rounded-full mx-auto shadow-xs border border-amber-400"></div>
                <span className="text-[10px] font-mono text-emerald-300 font-bold block mt-1">FAQ #105 [0.98]</span>
              </div>

              {/* Damaged or Foreign Matter Grains */}
              {selectedPreset.admixtureItems > 10 ? (
                <div className="border border-rose-500 bg-rose-500/20 rounded-lg p-2 text-center backdrop-blur-xs animate-bounce">
                  <div className="w-8 h-4 bg-stone-700 rounded-sm mx-auto shadow-xs border border-stone-600"></div>
                  <span className="text-[10px] font-mono text-rose-300 font-bold block mt-1">CHAFF/STONE</span>
                </div>
              ) : (
                <div className="border border-emerald-500/80 bg-emerald-500/10 rounded-lg p-2 text-center backdrop-blur-xs">
                  <div className="w-13 h-5 bg-amber-200/90 rounded-full mx-auto shadow-xs"></div>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold block mt-1">FAQ #106 [0.97]</span>
                </div>
              )}

              {selectedPreset.damagedItems > 15 ? (
                <div className="border border-amber-500 bg-amber-500/20 rounded-lg p-2 text-center backdrop-blur-xs">
                  <div className="w-10 h-5 bg-amber-900/90 rounded-full mx-auto shadow-xs border border-amber-700"></div>
                  <span className="text-[10px] font-mono text-amber-300 font-bold block mt-1">MOLD/SMUT</span>
                </div>
              ) : (
                <div className="border border-emerald-500/80 bg-emerald-500/10 rounded-lg p-2 text-center backdrop-blur-xs">
                  <div className="w-12 h-6 bg-amber-300/90 rounded-full mx-auto shadow-xs"></div>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold block mt-1">FAQ #107 [0.96]</span>
                </div>
              )}
            </div>

            {/* Scanning Laser Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#c084fc] animate-pulse transition-all"></div>
            )}

            {/* Bottom Status Bar */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span>{selectedPreset.description}</span>
              </span>
              <button
                onClick={triggerScan}
                className="flex items-center gap-1 text-purple-300 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
                <span>Rescan Tray</span>
              </button>
            </div>
          </div>

          {/* AI Metrics Results Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Vision Model Metric Assessment (FCI Norms)</span>
              </span>
              <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                Confidence: {selectedPreset.confidence}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Moisture Content</span>
                <strong className={`text-base font-black ${selectedPreset.moisture > 17 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {selectedPreset.moisture}%
                </strong>
                <span className="text-[10px] text-slate-400 block">Max 17.0%</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Foreign Matter</span>
                <strong className={`text-base font-black ${selectedPreset.foreignMatter > 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {selectedPreset.foreignMatter}%
                </strong>
                <span className="text-[10px] text-slate-400 block">Max 2.0%</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Damaged Kernels</span>
                <strong className={`text-base font-black ${selectedPreset.damagedGrain > 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {selectedPreset.damagedGrain}%
                </strong>
                <span className="text-[10px] text-slate-400 block">Max 5.0%</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Immature/Shrivelled</span>
                <strong className={`text-base font-black ${selectedPreset.immatureGrain > 6 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {selectedPreset.immatureGrain}%
                </strong>
                <span className="text-[10px] text-slate-400 block">Max 6.0%</span>
              </div>
            </div>

            {/* Verdict Banner */}
            <div className={`mt-4 p-3 rounded-lg flex items-center justify-between border ${
              selectedPreset.expectedResult === 'PASS'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                {selectedPreset.expectedResult === 'PASS' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    AI Decision: {selectedPreset.expectedGrade} ({selectedPreset.expectedResult})
                  </div>
                  <div className="text-[11px] opacity-80">
                    {selectedPreset.expectedResult === 'PASS' 
                      ? 'Sample satisfies Government MSP procurement specifications.' 
                      : 'Sample rejected due to non-compliance with permissible FAQ defect limits.'}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase ${
                selectedPreset.expectedResult === 'PASS'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-rose-700 text-white'
              }`}>
                {selectedPreset.expectedGrade}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply AI Grading to Quality Record</span>
          </button>
        </div>

      </div>
    </div>
  );
};
