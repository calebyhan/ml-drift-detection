/**
 * Drift detection utilities - TypeScript port of Python PSI computation
 */

import { PSI_THRESHOLDS, type PSIResult, type HistogramBin } from './types';

/**
 * Compute histogram bins for a numeric array
 */
export function computeHistogram(
  data: number[],
  bins: number[]
): HistogramBin[] {
  const histogram: HistogramBin[] = [];
  
  for (let i = 0; i < bins.length - 1; i++) {
    const x0 = bins[i];
    const x1 = bins[i + 1];
    const count = data.filter(v => v >= x0 && (i === bins.length - 2 ? v <= x1 : v < x1)).length;
    histogram.push({
      x0,
      x1,
      count,
      proportion: count / data.length,
    });
  }
  
  return histogram;
}

/**
 * Compute quantile-based bins from reference data
 */
export function computeQuantileBins(data: number[], nBins: number = 10): number[] {
  const sorted = [...data].sort((a, b) => a - b);
  const bins: number[] = [];
  
  for (let i = 0; i <= nBins; i++) {
    const idx = Math.floor((i / nBins) * (sorted.length - 1));
    bins.push(sorted[idx]);
  }
  
  // Ensure unique bins
  const uniqueBins = [...new Set(bins)];
  
  // If too few unique bins, fall back to equal-width
  if (uniqueBins.length < 3) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const step = (max - min) / nBins;
    return Array.from({ length: nBins + 1 }, (_, i) => min + i * step);
  }
  
  return uniqueBins;
}

/**
 * Compute Population Stability Index (PSI) between two distributions
 * 
 * PSI measures how much a distribution has shifted from a reference baseline.
 * - PSI < 0.1: No significant shift (stable)
 * - 0.1 <= PSI < 0.2: Moderate shift, investigation recommended
 * - PSI >= 0.2: Significant shift, action required
 */
export function computePSI(
  reference: number[],
  current: number[],
  nBins: number = 10
): { psi: number; referenceHist: number[]; currentHist: number[]; bins: number[] } {
  // Filter out NaN/undefined
  const refClean = reference.filter(v => !isNaN(v) && v !== undefined);
  const curClean = current.filter(v => !isNaN(v) && v !== undefined);
  
  // Compute bins from reference distribution
  let bins = computeQuantileBins(refClean, nBins);
  
  // Extend bins to capture all current values
  const allMin = Math.min(Math.min(...refClean), Math.min(...curClean));
  const allMax = Math.max(Math.max(...refClean), Math.max(...curClean));
  bins[0] = allMin - 1e-10;
  bins[bins.length - 1] = allMax + 1e-10;
  
  // Compute histograms
  const refHist = computeHistogram(refClean, bins);
  const curHist = computeHistogram(curClean, bins);
  
  // Compute PSI with epsilon for numerical stability
  const eps = 1e-10;
  let psi = 0;
  
  for (let i = 0; i < refHist.length; i++) {
    const refPct = Math.max(refHist[i].proportion, eps);
    const curPct = Math.max(curHist[i].proportion, eps);
    psi += (curPct - refPct) * Math.log(curPct / refPct);
  }
  
  return {
    psi,
    referenceHist: refHist.map(h => h.proportion),
    currentHist: curHist.map(h => h.proportion),
    bins,
  };
}

/**
 * Get PSI status based on thresholds
 */
export function getPSIStatus(psi: number): 'stable' | 'moderate' | 'significant' {
  if (psi < PSI_THRESHOLDS.stable) return 'stable';
  if (psi < PSI_THRESHOLDS.moderate) return 'moderate';
  return 'significant';
}

/**
 * Compute PSI for a specific feature
 */
export function computeFeaturePSI(
  reference: number[],
  current: number[],
  featureName: string,
  nBins: number = 10
): PSIResult {
  const { psi, referenceHist, currentHist, bins } = computePSI(reference, current, nBins);
  
  return {
    feature: featureName,
    psi,
    status: getPSIStatus(psi),
    referenceHist,
    currentHist,
    bins,
  };
}

/**
 * Inject gradual drift into a feature array
 * Simulates cumulative bias that increases over time
 */
export function injectGradualDrift(
  data: number[],
  maxBias: number,
  startIdx: number = 0
): number[] {
  const result = [...data];
  const driftRange = data.length - startIdx;
  
  for (let i = startIdx; i < data.length; i++) {
    const progress = (i - startIdx) / driftRange;
    const bias = maxBias * progress;
    result[i] = Math.max(0, Math.min(1, result[i] + bias)); // Clamp to [0, 1]
  }
  
  return result;
}

/**
 * Inject sudden shift into a feature array
 * Simulates an abrupt change at a specific point
 */
export function injectSuddenShift(
  data: number[],
  bias: number,
  shiftIdx: number
): number[] {
  const result = [...data];
  
  for (let i = shiftIdx; i < data.length; i++) {
    result[i] = Math.max(0, Math.min(1, result[i] + bias));
  }
  
  return result;
}

/**
 * Inject random noise into a feature array
 */
export function injectNoise(
  data: number[],
  noiseStd: number
): number[] {
  return data.map(v => {
    // Box-Muller transform for Gaussian noise
    const u1 = Math.random();
    const u2 = Math.random();
    const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * noiseStd;
    return Math.max(0, Math.min(1, v + noise));
  });
}

/**
 * Mask feature values (set to zero) for specific conditions
 * Used to simulate Experiment B (masking morning hours)
 */
export function maskFeature(
  data: number[],
  mask: boolean[]
): number[] {
  return data.map((v, i) => mask[i] ? 0 : v);
}
