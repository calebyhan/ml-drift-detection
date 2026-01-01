'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedHistogram } from './AnimatedHistogram';
import { PSIGauge } from './PSIGauge';
import { computeFeaturePSI, injectGradualDrift, injectSuddenShift, injectNoise } from '@/lib/drift';
import { splitByYear, extractFeature } from '@/lib/data';
import type { FeatureName, PSIResult } from '@/lib/types';
import { FEATURE_LABELS } from '@/lib/types';
import { Settings, TrendingUp, Activity } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Control Panel */}
      <div
        className="rounded-2xl shadow-lg p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
          >
            <Settings size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            Simulation Controls
          </h3>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* Feature Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Feature to Monitor
            </label>
            <select
              value={feature}
              onChange={(e) => setFeature(e.target.value as FeatureName)}
              className="w-full px-4 py-3 text-sm rounded-lg transition-all focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              {features.map((f) => (
                <option key={f} value={f}>
                  {FEATURE_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          {/* Drift Type Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Drift Type
            </label>
            <select
              value={driftType}
              onChange={(e) => setDriftType(e.target.value as DriftType)}
              className="w-full px-4 py-3 text-sm rounded-lg transition-all focus:ring-2 focus:outline-none"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <option value="none">None</option>
              <option value="gradual">Gradual</option>
              <option value="sudden">Sudden</option>
              <option value="noise">Noise</option>
            </select>
          </div>

          {/* Drift Amount Slider */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              Intensity: <span style={{ color: 'var(--accent)' }}>{driftAmount.toFixed(2)}</span>
            </label>
            <div
              className="px-4 py-3 rounded-lg"
              style={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)'
              }}
            >
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={driftAmount}
                onChange={(e) => setDriftAmount(parseFloat(e.target.value))}
                disabled={driftType === 'none'}
                className="w-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  height: '6px',
                  borderRadius: '3px',
                  appearance: 'none',
                  background: driftType === 'none'
                    ? 'var(--border)'
                    : `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(driftAmount / 0.5) * 100}%, var(--border) ${(driftAmount / 0.5) * 100}%, var(--border) 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Drift Explanation */}
        <div
          className="mt-6 rounded-xl p-4"
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {driftType === 'none' && 'Original 2011 vs 2012 data.'}
              {driftType === 'gradual' && `Cumulative bias of ${driftAmount.toFixed(2)} added over time.`}
              {driftType === 'sudden' && `Bias of ${driftAmount.toFixed(2)} applied to second half.`}
              {driftType === 'noise' && `Gaussian noise (std=${driftAmount.toFixed(2)}) added.`}
            </span>
          </div>
        </div>
      </div>

      {/* Visualization Panel */}
      <div
        className="rounded-2xl shadow-lg p-6 sm:p-8"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
          >
            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
            Results
          </h3>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Histogram Card */}
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)'
            }}
          >
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
          </div>

          {/* PSI Gauge Card */}
          <div
            className="rounded-xl p-6 flex flex-col items-center justify-center"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)'
            }}
          >
            {psiResult && (
              <>
                <div className="mb-6">
                  <PSIGauge
                    value={psiResult.psi}
                    label={feature}
                    size={160}
                  />
                </div>

                {/* Status Badge */}
                <div
                  className="px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: psiResult.status === 'stable' ? 'rgba(34, 197, 94, 0.1)' :
                                   psiResult.status === 'moderate' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: psiResult.status === 'stable' ? 'rgb(34, 197, 94)' :
                          psiResult.status === 'moderate' ? 'rgb(234, 179, 8)' : 'rgb(239, 68, 68)',
                  }}
                >
                  {psiResult.status === 'stable' && 'Stable'}
                  {psiResult.status === 'moderate' && 'Moderate'}
                  {psiResult.status === 'significant' && 'Significant'}
                </div>

                {/* PSI Value Display */}
                <div className="mt-4 text-center">
                  <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>
                    PSI Value
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {psiResult.psi.toFixed(4)}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
