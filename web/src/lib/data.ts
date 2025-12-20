/**
 * Data loading and processing utilities
 */

import type { BikeRecord, FeatureName } from './types';
import bikeData from '../data/bike-sharing.json';

// Type assertion for imported JSON
const typedBikeData = bikeData as BikeRecord[];

/**
 * Get all bike sharing records
 */
export function getAllData(): BikeRecord[] {
  return typedBikeData;
}

/**
 * Split data by year (2011 = training, 2012 = evaluation)
 */
export function splitByYear(): { train2011: BikeRecord[]; eval2012: BikeRecord[] } {
  const train2011 = typedBikeData.filter(r => r.yr === 0);
  const eval2012 = typedBikeData.filter(r => r.yr === 1);
  return { train2011, eval2012 };
}

/**
 * Extract a specific feature as an array of numbers
 */
export function extractFeature(data: BikeRecord[], feature: FeatureName): number[] {
  return data.map(r => r[feature] as number);
}

/**
 * Get summary statistics for a feature
 */
export function getFeatureStats(data: number[]): {
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
} {
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, v) => sum + (v - mean) ** 2, 0) / data.length;
  
  return {
    mean,
    std: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
  };
}

/**
 * Sample data for visualization (reduces rendering load)
 */
export function sampleData(data: BikeRecord[], maxSamples: number = 1000): BikeRecord[] {
  if (data.length <= maxSamples) return data;
  
  const step = Math.ceil(data.length / maxSamples);
  return data.filter((_, i) => i % step === 0);
}

/**
 * Get feature names available for drift detection
 */
export function getNumericFeatures(): FeatureName[] {
  return ['temp', 'atemp', 'hum', 'windspeed'];
}

/**
 * Group data by week for temporal analysis
 */
export function groupByWeek(data: BikeRecord[]): Map<number, BikeRecord[]> {
  const grouped = new Map<number, BikeRecord[]>();
  const startDate = new Date(data[0]?.dteday || '2011-01-01');
  
  data.forEach(record => {
    const recordDate = new Date(record.dteday);
    const weekNum = Math.floor((recordDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    
    if (!grouped.has(weekNum)) {
      grouped.set(weekNum, []);
    }
    grouped.get(weekNum)!.push(record);
  });
  
  return grouped;
}

/**
 * Compute weekly average for a feature
 */
export function getWeeklyAverages(
  data: BikeRecord[],
  feature: FeatureName
): { week: number; value: number }[] {
  const grouped = groupByWeek(data);
  const result: { week: number; value: number }[] = [];
  
  grouped.forEach((records, week) => {
    const values = extractFeature(records, feature);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    result.push({ week, value: avg });
  });
  
  return result.sort((a, b) => a.week - b.week);
}
