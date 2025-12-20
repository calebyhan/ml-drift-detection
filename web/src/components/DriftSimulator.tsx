'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedHistogram } from './AnimatedHistogram';
import { PSIGauge } from './PSIGauge';
import { computeFeaturePSI, injectGradualDrift, injectSuddenShift, injectNoise } from '@/lib/drift';
import { splitByYear, extractFeature } from '@/lib/data';
import type { FeatureName, PSIResult } from '@/lib/types';
import { FEATURE_LABELS } from '@/lib/types';

type DriftType = 'none' | 'gradual' | 'sudden' | 'noise';

interface DriftSimulatorProps {
  initialFeature?: FeatureName;
}

export function DriftSimulator({ initialFeature = 'hum' }: DriftSimulatorProps) {
  const [feature, setFeature] = useState<FeatureName>(initialFeature);
  const [driftType, setDriftType] = useState<DriftType>('none');
  const [driftAmount, setDriftAmount] = useState(0.15);
  const [psiResult, setPsiResult] = useState<PSIResult | null>(null);
  const [referenceData, setReferenceData] = useState<number[]>([]);
  const [currentData, setCurrentData] = useState<number[]>([]);

  // Load initial data
  useEffect(() => {
    const { train2011, eval2012 } = splitByYear();
    const refData = extractFeature(train2011, feature);
    const curData = extractFeature(eval2012, feature);
    
    setReferenceData(refData);
    applyDrift(curData, driftType, driftAmount, refData);
  }, [feature]);

  // Apply drift when type or amount changes
  useEffect(() => {
    if (referenceData.length === 0) return;
    
    const { eval2012 } = splitByYear();
    const curData = extractFeature(eval2012, feature);
    applyDrift(curData, driftType, driftAmount, referenceData);
  }, [driftType, driftAmount, feature, referenceData]);

  const applyDrift = (
    originalData: number[],
    type: DriftType,
    amount: number,
    refData: number[]
  ) => {
    let modifiedData: number[];
    
    switch (type) {
      case 'gradual':
        modifiedData = injectGradualDrift(originalData, amount);
        break;
      case 'sudden':
        modifiedData = injectSuddenShift(originalData, amount, Math.floor(originalData.length / 2));
        break;
      case 'noise':
        modifiedData = injectNoise(originalData, amount);
        break;
      default:
        modifiedData = originalData;
    }
    
    setCurrentData(modifiedData);
    
    // Compute PSI
    const result = computeFeaturePSI(refData, modifiedData, feature);
    setPsiResult(result);
  };

  const features: FeatureName[] = ['temp', 'atemp', 'hum', 'windspeed'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Controls */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Feature selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Feature
          </label>
          <select
            value={feature}
            onChange={(e) => setFeature(e.target.value as FeatureName)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            {features.map((f) => (
              <option key={f} value={f}>
                {FEATURE_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        {/* Drift type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Drift type
          </label>
          <select
            value={driftType}
            onChange={(e) => setDriftType(e.target.value as DriftType)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="none">None</option>
            <option value="gradual">Gradual</option>
            <option value="sudden">Sudden</option>
            <option value="noise">Noise</option>
          </select>
        </div>

        {/* Drift amount */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Intensity: {driftAmount.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={driftAmount}
            onChange={(e) => setDriftAmount(parseFloat(e.target.value))}
            disabled={driftType === 'none'}
            className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>

      {/* Visualization area */}
      <div className="grid md:grid-cols-[1fr_200px] gap-6">
        {/* Histogram */}
        <AnimatePresence mode="wait">
          {psiResult && (
            <AnimatedHistogram
              key={`${feature}-${driftType}-${driftAmount}`}
              referenceData={referenceData}
              currentData={currentData}
              bins={psiResult.bins}
              title={`${FEATURE_LABELS[feature]} Distribution`}
              width={500}
              height={280}
            />
          )}
        </AnimatePresence>

        {/* PSI Gauge */}
        <div className="flex flex-col items-center justify-center">
          {psiResult && (
            <PSIGauge
              value={psiResult.psi}
              label={feature}
              size={160}
            />
          )}
          
          {/* Status indicator */}
          <div
            className="mt-4 px-3 py-1.5 rounded text-xs font-medium"
            style={{
              backgroundColor: psiResult?.status === 'stable' ? '#f0fdf4' :
                             psiResult?.status === 'moderate' ? '#fefce8' : '#fef2f2',
              color: psiResult?.status === 'stable' ? '#166534' :
                    psiResult?.status === 'moderate' ? '#854d0e' : '#991b1b',
            }}
          >
            {psiResult?.status === 'stable' && 'Stable'}
            {psiResult?.status === 'moderate' && 'Moderate drift'}
            {psiResult?.status === 'significant' && 'Significant drift'}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        {driftType === 'none' && (
          <>Original 2011 vs 2012 data.</>
        )}
        {driftType === 'gradual' && (
          <>Cumulative bias of {driftAmount.toFixed(2)} added over time.</>
        )}
        {driftType === 'sudden' && (
          <>Bias of {driftAmount.toFixed(2)} applied to second half.</>
        )}
        {driftType === 'noise' && (
          <>Gaussian noise (std={driftAmount.toFixed(2)}) added.</>
        )}
      </div>
    </div>
  );
}
