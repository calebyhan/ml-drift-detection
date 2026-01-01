'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedHistogram } from '@/components/AnimatedHistogram';
import { PSIGauge } from '@/components/PSIGauge';
import { DetectionMatrix } from '@/components/DetectionMatrix';
import { computeFeaturePSI } from '@/lib/drift';
import { splitByYear, extractFeature } from '@/lib/data';
import type { FeatureName, BikeRecord } from '@/lib/types';
import { FEATURE_LABELS } from '@/lib/types';

interface Step {
  id: number;
  title: string;
  content: React.ReactNode;
}

export default function ExplainerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { train2011, eval2012 } = splitByYear();

  const steps: Step[] = [
    {
      id: 0,
      title: "The Problem",
      content: <IntroStep />,
    },
    {
      id: 1,
      title: "Our Dataset",
      content: <DatasetStep train2011={train2011} eval2012={eval2012} />,
    },
    {
      id: 2,
      title: "What is PSI?",
      content: <PSIExplanationStep />,
    },
    {
      id: 3,
      title: "PSI in Action",
      content: <PSIActionStep train2011={train2011} eval2012={eval2012} />,
    },
    {
      id: 4,
      title: "The Paradox",
      content: <ParadoxStep />,
    },
    {
      id: 5,
      title: "Detection Matrix",
      content: <MatrixStep />,
    },
    {
      id: 6,
      title: "Key Takeaways",
      content: <TakeawaysStep />,
    },
  ];

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 200px)' }}>
      {/* Step indicator */}
      <div className="sticky top-16 z-40 border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className="w-3 h-3 rounded-full transition-colors cursor-pointer"
                style={{
                  backgroundColor: idx === currentStep
                    ? 'var(--accent)'
                    : idx < currentStep
                    ? 'var(--text-secondary)'
                    : 'var(--border)',
                }}
                aria-label={`Step ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto mb-8"
          >
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text)' }}>
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="border-t py-4 mt-auto" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
            style={{ color: 'var(--text)' }}
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// Step Components

function IntroStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          You trained a bike rental prediction model on 2011 data. It works well.
          You deploy it and set up monitoring using <strong style={{ color: 'var(--text)' }}>PSI
          (Population Stability Index)</strong> to detect when input data drifts.
        </p>
      </div>

      <div className="border-l-2 p-4 rounded-r-lg" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>One year later</p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your PSI dashboard shows all green. No drift detected. But predictions
          are way off. What happened?
        </p>
      </div>
    </div>
  );
}

function DatasetStep({ train2011, eval2012 }: { train2011: unknown[]; eval2012: unknown[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          UCI Bike Sharing Dataset: hourly bike rental counts in Washington D.C.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>2011 (training)</div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>{train2011.length.toLocaleString()}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>records</div>
          </div>
          <div className="rounded p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>2012 (evaluation)</div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>{eval2012.length.toLocaleString()}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>records</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Features monitored for drift:</p>
        <div className="flex flex-wrap gap-2">
          {['temp', 'atemp', 'hum', 'windspeed'].map((feature) => (
            <span key={feature} className="px-3 py-1 rounded text-sm" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
              {FEATURE_LABELS[feature as FeatureName]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PSIExplanationStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          PSI measures how much a feature&apos;s distribution has shifted from the
          training baseline. It buckets values and compares proportions.
        </p>

        <div className="rounded p-3 font-mono text-sm" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
          PSI = Σ (Current% - Reference%) × ln(Current% / Reference%)
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="rounded-lg shadow p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>&lt; 0.1</div>
          <div className="text-sm" style={{ color: 'rgb(34, 197, 94)' }}>Stable</div>
        </div>
        <div className="rounded-lg shadow p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>0.1 - 0.2</div>
          <div className="text-sm" style={{ color: 'rgb(234, 179, 8)' }}>Moderate</div>
        </div>
        <div className="rounded-lg shadow p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>&gt; 0.2</div>
          <div className="text-sm" style={{ color: 'rgb(239, 68, 68)' }}>Significant</div>
        </div>
      </div>
    </div>
  );
}

function PSIActionStep({ train2011, eval2012 }: { train2011: BikeRecord[]; eval2012: BikeRecord[] }) {
  const features: FeatureName[] = ['temp', 'hum', 'windspeed'];

  const results = features.map(feature => {
    const refData = extractFeature(train2011, feature);
    const curData = extractFeature(eval2012, feature);
    return computeFeaturePSI(refData, curData, feature);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-6 text-center" style={{ color: 'var(--text)' }}>
          PSI Results: 2011 vs 2012
        </h3>
        <div className="flex flex-wrap justify-center gap-8">
          {results.map(result => (
            <PSIGauge
              key={result.feature}
              value={result.psi}
              label={FEATURE_LABELS[result.feature as FeatureName]}
              size={140}
            />
          ))}
        </div>
      </div>

      <div className="border-l-4 rounded-r-xl p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgb(34, 197, 94)' }}>
        <h3 className="font-semibold mb-2" style={{ color: 'rgb(21, 128, 61)' }}>All Clear!</h3>
        <p style={{ color: 'rgb(22, 101, 52)' }}>
          All PSI values are well below 0.1. According to our drift monitor, the
          feature distributions haven&apos;t changed significantly between 2011 and 2012.
        </p>
      </div>

      {/* Show histogram for temperature */}
      <AnimatedHistogram
        referenceData={extractFeature(train2011, 'temp')}
        currentData={extractFeature(eval2012, 'temp')}
        bins={results[0].bins}
        title="Temperature Distribution"
        width={600}
        height={280}
      />
    </div>
  );
}

function ParadoxStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="mb-4" style={{ color: 'var(--text)' }}>The model failed anyway.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Training RMSE (2011)</div>
            <div className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>~20</div>
          </div>
          <div className="rounded p-4" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Evaluation RMSE (2012)</div>
            <div className="text-2xl font-semibold" style={{ color: 'rgb(239, 68, 68)' }}>~126</div>
          </div>
        </div>

        <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          6× worse performance despite no feature drift detected.
        </p>
      </div>

      <div className="border-l-2 p-4 rounded-r-lg" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--accent)' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Concept drift</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          The relationship between features and target changed. 2012 had 63% more
          ridership than 2011. Same weather, different rental counts. The service
          became more popular.
        </p>
      </div>

      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>The blind spot</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          PSI only monitors input feature distributions. It&apos;s blind to changes
          in the target distribution or the relationship between inputs and outputs.
        </p>
      </div>
    </div>
  );
}

function MatrixStep() {
  return (
    <div className="space-y-6">
      <DetectionMatrix />

      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          The bike sharing example landed in <span className="font-medium" style={{ color: 'var(--text)' }}>silent failure</span>:
          PSI showed no drift, but RMSE degraded significantly.
        </p>
      </div>
    </div>
  );
}

function TakeawaysStep() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>PSI alone is not enough</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Statistical drift detection has blind spots. Pair it with performance monitoring.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Monitor what matters</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Track actual model errors (RMSE, MAE) or use labeled samples.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Weight by importance</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Not all features matter equally. Consider weighted PSI.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>False alarms happen</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              High PSI on unimportant features might not matter. Investigate first.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/simulator">
          <button className="px-6 py-3 text-sm font-medium rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>
            Try the simulator
          </button>
        </Link>
      </div>
    </div>
  );
}
