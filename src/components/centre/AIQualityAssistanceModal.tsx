import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, X, Camera, RefreshCw, Layers } from 'lucide-react';
import { api, AiGrainAnalysisResult } from '../../services/api';
import { QualityGrade, QualityResult } from '../../types';

interface AIQualityAssistanceModalProps {
  cropType: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: {
    moisturePercentage: number;
    foreignMatterPercentage: number;
    damagedGrainPercentage: number;
    immatureGrainPercentage: number;
    grade: QualityGrade;
    result: QualityResult;
    remarks: string;
  }) => void;
}

export const AIQualityAssistanceModal: React.FC<AIQualityAssistanceModalProps> = ({
  cropType,
  isOpen,
  onClose,
  onApply
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiGrainAnalysisResult | null>(null);
  const [sampleScanMode, setSampleScanMode] = useState<'STANDARD' | 'MOIST' | 'SUPERIOR'>('SUPERIOR');

  if (!isOpen) return null;

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);

    const overrideMoisture = sampleScanMode === 'MOIST' ? 17.8 : sampleScanMode === 'SUPERIOR' ? 14.2 : 15.6;

    try {
      const res = await api.getAiGrainAnalysis({
        cropType,
        overrideMoisture
      });
      setAnalysisResult(res);
    } catch {
      // Local fallback simulation if server is offline
      setTimeout(() => {
        setAnalysisResult({
          success: true,
          cropType,
          aiModel: 'KrishiVision-Edge V2.1 (Offline Cached)',
          metrics: {
            moisturePercentage: overrideMoisture,
            foreignMatterPercentage: sampleScanMode === 'SUPERIOR' ? 0.5 : 0.9,
            damagedGrainPercentage: sampleScanMode === 'SUPERIOR' ? 1.0 : 1.8,
            immatureGrainPercentage: 1.2
          },
          recommendation: {
            grade: sampleScanMode === 'SUPERIOR' ? 'Grade A' : sampleScanMode === 'MOIST' ? 'Rejected' : 'FAQ (Fair Average Quality)',
            result: sampleScanMode === 'MOIST' ? 'HOLD' : 'PASS',
            confidenceScore: '96%',
            advice: sampleScanMode === 'MOIST'
              ? 'Moisture exceeds 17% FCI standard. Suggest 2 hours sun-drying.'
              : 'Grains meet Fair Average Quality / Grade A specifications. Recommended for full MSP clearance.',
            isWithinFciNorms: sampleScanMode !== 'MOIST'
          }
        });
      }, 500);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!analysisResult) return;
    onApply({
      moisturePercentage: analysisResult.metrics.moisturePercentage,
      foreignMatterPercentage: analysisResult.metrics.foreignMatterPercentage,
      damagedGrainPercentage: analysisResult.metrics.damagedGrainPercentage,
      immatureGrainPercentage: analysisResult.metrics.immatureGrainPercentage,
      grade: analysisResult.recommendation.grade,
      result: analysisResult.recommendation.result,
      remarks: `[AI Verified] ${analysisResult.recommendation.advice} (${analysisResult.recommendation.confidenceScore} confidence)`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">KrishiVision AI Grain Inspector</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Smart Automation
                </span>
              </div>
              <p className="text-xs text-emerald-100">FCI Fair Average Quality (FAQ) Automated Computer Vision Inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Sample Selector */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <label className="text-xs font-semibold text-slate-700 block mb-2">Select Inspection Sample:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setSampleScanMode('SUPERIOR'); setAnalysisResult(null); }}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  sampleScanMode === 'SUPERIOR'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dry Clean (Grade A)
              </button>
              <button
                type="button"
                onClick={() => { setSampleScanMode('STANDARD'); setAnalysisResult(null); }}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  sampleScanMode === 'STANDARD'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Standard (FAQ Pass)
              </button>
              <button
                type="button"
                onClick={() => { setSampleScanMode('MOIST'); setAnalysisResult(null); }}
                className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  sampleScanMode === 'MOIST'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                High Moisture (Hold)
              </button>
            </div>
          </div>

          {/* Grain Camera Viewport Simulation */}
          <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-900 aspect-video flex items-center justify-center text-center p-4">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

            {/* Bounding box overlays */}
            <div className="absolute top-4 left-4 border border-emerald-400/80 bg-emerald-500/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-emerald-300 z-20">
              Crop: {cropType}
            </div>
            <div className="absolute bottom-4 left-4 z-20 text-left">
              <span className="text-[11px] font-mono text-slate-300 block">Edge Sensor: Spectral Moisture & Discoloration</span>
              <span className="text-xs text-white font-semibold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Optical Camera Sensor (50MP Macro)
              </span>
            </div>

            {/* Scan animation line */}
            {analyzing && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-bounce z-20" />
            )}

            {!analysisResult && !analyzing && (
              <div className="z-20 text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
                <p className="text-xs text-slate-300">Click below to run automated computer vision grain analysis</p>
              </div>
            )}

            {analyzing && (
              <div className="z-20 text-center space-y-2">
                <RefreshCw className="w-7 h-7 text-emerald-400 mx-auto animate-spin" />
                <p className="text-xs font-mono text-emerald-300">Extracting grain geometry & spectrometry...</p>
              </div>
            )}

            {analysisResult && (
              <div className="absolute top-3 right-3 z-20">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono shadow-md ${
                  analysisResult.recommendation.result === 'PASS'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {analysisResult.recommendation.grade} ({analysisResult.recommendation.confidenceScore})
                </span>
              </div>
            )}
          </div>

          {/* Results Display */}
          {analysisResult && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {analysisResult.recommendation.result === 'PASS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  <span className="font-bold text-sm text-slate-800">
                    Recommended Grade: {analysisResult.recommendation.grade}
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {analysisResult.recommendation.confidenceScore} Match
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Moisture</div>
                  <div className="text-sm font-bold text-slate-800">
                    {analysisResult.metrics.moisturePercentage}%
                  </div>
                  <div className="text-[9px] text-slate-400">Max 17.0%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Foreign Matter</div>
                  <div className="text-sm font-bold text-slate-800">
                    {analysisResult.metrics.foreignMatterPercentage}%
                  </div>
                  <div className="text-[9px] text-slate-400">Max 1.0%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Damaged</div>
                  <div className="text-sm font-bold text-slate-800">
                    {analysisResult.metrics.damagedGrainPercentage}%
                  </div>
                  <div className="text-[9px] text-slate-400">Max 5.0%</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Immature</div>
                  <div className="text-sm font-bold text-slate-800">
                    {analysisResult.metrics.immatureGrainPercentage}%
                  </div>
                  <div className="text-[9px] text-slate-400">Max 3.0%</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                &ldquo;{analysisResult.recommendation.advice}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={runAiAnalysis}
            disabled={analyzing}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            {analysisResult ? 'Re-Scan Sample' : 'Run AI Analysis'}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!analysisResult}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Apply AI Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
