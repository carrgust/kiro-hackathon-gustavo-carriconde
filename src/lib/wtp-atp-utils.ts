import { HypothesisCheck, HypothesisState } from '@/types/project';

/**
 * Calculate combined WTP/ATP score using the formula: (wtp * 0.6) + (atp * 0.4)
 */
export function calculateCombinedScore(wtp: number, atp: number): number {
  return Math.round((wtp * 0.6) + (atp * 0.4));
}

/**
 * Determine hypothesis state based on combined score thresholds
 */
export function getHypothesisState(combinedScore: number): HypothesisState {
  if (combinedScore >= 85) return 'fact';
  if (combinedScore >= 60) return 'validated';
  if (combinedScore >= 40) return 'hypothesis';
  return 'rejected';
}

/**
 * Process WTP/ATP validation result into confidence score and state
 */
export function processValidationResult(check: HypothesisCheck): {
  confidence: number;
  state: HypothesisState;
} {
  const combinedScore = calculateCombinedScore(check.wtp, check.atp);
  const state = getHypothesisState(combinedScore);
  
  return {
    confidence: combinedScore,
    state
  };
}
