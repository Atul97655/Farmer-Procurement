import { ProcurementCentre, CentreRecommendation, Farmer } from '../types';

export function calculateCentreRecommendations(
  centres: ProcurementCentre[],
  farmer: Farmer,
  requiredQuantity: number
): CentreRecommendation[] {
  const recommendations: CentreRecommendation[] = centres.map((centre) => {
    let baseDistance = 8.5;
    if (centre.district === farmer.district) {
      if (centre.block === farmer.block) {
        baseDistance = 4.2 + (Math.abs(centre.latitude - 20.25) * 10);
      } else {
        baseDistance = 14.8 + (Math.abs(centre.longitude - 85.78) * 8);
      }
    } else {
      baseDistance = 45.0 + (Math.abs(centre.latitude - 21.0) * 20);
    }
    const distanceKm = Math.round(baseDistance * 10) / 10;

    const remainingCap = Math.max(0, centre.dailyCapacity - centre.currentLoad);
    const capacityUtilization = Math.min(100, Math.round((centre.currentLoad / centre.dailyCapacity) * 100));

    const estimatedWaitMinutes = centre.queueLength * centre.avgProcessingTimeMinutes;

    // SCORING:
    // Distance (35% weight)
    const distClamped = Math.min(60, distanceKm);
    const distanceScore = Math.round(35 * (1 - distClamped / 60) * 10) / 10;

    // Queue (35% weight)
    const queueClamped = Math.min(25, centre.queueLength);
    const queueScore = Math.round(35 * (1 - queueClamped / 25) * 10) / 10;

    // Remaining capacity buffer (30% weight)
    const canFulfill = remainingCap >= requiredQuantity;
    let capacityScore = Math.round(30 * (remainingCap / centre.dailyCapacity) * 10) / 10;
    if (!canFulfill) {
      capacityScore = Math.max(0, capacityScore - 15);
    }

    const totalScore = Math.round(Math.max(5, distanceScore + queueScore + capacityScore));

    let recommendationReason = '';
    if (distanceKm < 10 && centre.queueLength <= 5) {
      recommendationReason = 'Optimal proximity (<10 km) and fast-moving short queue.';
    } else if (remainingCap > 300 && estimatedWaitMinutes < 40) {
      recommendationReason = 'High remaining capacity buffer with low estimated wait time.';
    } else if (estimatedWaitMinutes <= 30) {
      recommendationReason = 'Lowest estimated waiting time with expedited processing.';
    } else if (centre.status === 'NEAR CAPACITY') {
      recommendationReason = 'Operating near peak capacity. Slower turnaround expected.';
    } else {
      recommendationReason = 'Standard regional Mandi with moderate queue.';
    }

    return {
      centre,
      distanceKm,
      estimatedWaitMinutes,
      capacityUtilizationPercent: capacityUtilization,
      score: totalScore,
      scoreBreakdown: {
        distanceScore,
        queueScore,
        capacityScore
      },
      recommendationReason,
      isBestMatch: false
    };
  });

  recommendations.sort((a, b) => b.score - a.score);

  if (recommendations.length > 0) {
    recommendations[0].isBestMatch = true;
  }

  return recommendations;
}
