/**
 * Type definitions for the Drift Detection visualization app
 */

export interface BikeRecord {
  instant: number;
  dteday: string;
  season: number;
  yr: number;
  mnth: number;
  hr: number;
  holiday: number;
  weekday: number;
  workingday: number;
  weathersit: number;
  temp: number;
  atemp: number;
  hum: number;
  windspeed: number;
  cnt: number;
}

export interface PSIResult {
  feature: string;
  psi: number;
  status: 'stable' | 'moderate' | 'significant';
  referenceHist: number[];
  currentHist: number[];
  bins: number[];
}

export interface DriftExperiment {
  id: string;
  name: string;
  description: string;
  driftType: 'gradual' | 'sudden' | 'noise';
  feature: string;
  params: {
    bias?: number;
    noiseStd?: number;
    mask?: boolean;
  };
}

export interface DetectionMatrixCell {
  psiDrifted: boolean;
  rmseDegraded: boolean;
  label: string;
  description: string;
  color: string;
  textColor: string;
  descColor: string;
}

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
  proportion: number;
}

export type FeatureName = 'temp' | 'atemp' | 'hum' | 'windspeed' | 'hr' | 'cnt';

export const FEATURE_LABELS: Record<FeatureName, string> = {
  temp: 'Temperature (normalized)',
  atemp: 'Feels-like Temp (normalized)',
  hum: 'Humidity (normalized)',
  windspeed: 'Wind Speed (normalized)',
  hr: 'Hour of Day',
  cnt: 'Bike Rentals (target)',
};

export const PSI_THRESHOLDS = {
  stable: 0.1,
  moderate: 0.2,
} as const;
