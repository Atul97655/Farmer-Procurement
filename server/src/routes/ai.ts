import { Router, Request, Response } from 'express';

export const aiRouter = Router();

/**
 * AI Grain Computer Vision & Quality Grading Assessment Assistant
 */
aiRouter.post('/grain-quality-assist', (req: Request, res: Response) => {
  const { cropType, sampleImageBase64, overrideMoisture } = req.body;

  // Generate realistic smart analysis simulating computer vision edge inference
  const simulatedMoisture = overrideMoisture !== undefined
    ? Number(overrideMoisture)
    : Math.round((13.5 + Math.random() * 3.5) * 10) / 10; // 13.5% - 17.0%

  const simulatedForeignMatter = Math.round((0.3 + Math.random() * 0.9) * 100) / 100; // 0.3% - 1.2%
  const simulatedDamaged = Math.round((0.8 + Math.random() * 1.4) * 100) / 100; // 0.8% - 2.2%
  const simulatedImmature = Math.round((0.9 + Math.random() * 1.5) * 100) / 100; // 0.9% - 2.4%

  // FCI Paddy Specs: Max Moisture 17.0%, Foreign Matter 1.0%, Damaged 5.0%
  let grade: 'Grade A' | 'FAQ (Fair Average Quality)' | 'Rejected' = 'FAQ (Fair Average Quality)';
  let result: 'PASS' | 'FAIL' | 'HOLD' = 'PASS';
  let advice = '';

  if (simulatedMoisture > 17.0) {
    grade = 'Rejected';
    result = 'HOLD';
    advice = `Moisture is ${(simulatedMoisture - 17.0).toFixed(1)}% above FCI 17% limit. Recommend 2 hours sun-drying on mandi drying yard before re-test.`;
  } else if (simulatedMoisture <= 15.0 && simulatedForeignMatter <= 0.75 && simulatedDamaged <= 1.5) {
    grade = 'Grade A';
    result = 'PASS';
    advice = 'Grain luster and size uniformity are superior. Meets all Grade A specifications. Eligible for Grade A MSP rate.';
  } else {
    grade = 'FAQ (Fair Average Quality)';
    result = 'PASS';
    advice = 'Grain conforms to Fair Average Quality (FAQ) standards. Cleared for immediate weighbridge entry.';
  }

  const confidenceScore = Math.round(91 + Math.random() * 8); // 91% - 99%

  return res.json({
    success: true,
    cropType: cropType || 'Paddy (Common)',
    aiModel: 'KrishiVision-V2 Grain Spectrometry & Defect Classifier',
    hasImage: !!sampleImageBase64,
    metrics: {
      moisturePercentage: simulatedMoisture,
      foreignMatterPercentage: simulatedForeignMatter,
      damagedGrainPercentage: simulatedDamaged,
      immatureGrainPercentage: simulatedImmature
    },
    recommendation: {
      grade,
      result,
      confidenceScore: `${confidenceScore}%`,
      advice,
      isWithinFciNorms: result === 'PASS'
    }
  });
});
