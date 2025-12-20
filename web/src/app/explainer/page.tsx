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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← Back
          </Link>
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentStep
                    ? 'bg-indigo-600'
                    : idx < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-20 pb-24 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              {steps[currentStep].title}
            </h2>
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-6 flex justify-between">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  );
}

// Step Components

function IntroStep() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 leading-relaxed">
          You trained a bike rental prediction model on 2011 data. It works well.
          You deploy it and set up monitoring using <strong>PSI 
          (Population Stability Index)</strong> to detect when input data drifts.
        </p>
      </div>
      
      <div className="bg-gray-50 border-l-2 border-gray-300 p-4">
        <p className="text-sm font-medium text-gray-600 mb-1">One year later</p>
        <p className="text-gray-700">
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
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          UCI Bike Sharing Dataset: hourly bike rental counts in Washington D.C.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-1">2011 (training)</div>
            <div className="text-2xl font-semibold text-gray-900">{train2011.length.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">records</div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-1">2012 (evaluation)</div>
            <div className="text-2xl font-semibold text-gray-900">{eval2012.length.toLocaleString()}</div>
            <div className="text-gray-500 text-sm">records</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600 mb-3">Features monitored for drift:</p>
        <div className="flex flex-wrap gap-2">
          {['temp', 'atemp', 'hum', 'windspeed'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700">
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
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          PSI measures how much a feature&apos;s distribution has shifted from the 
          training baseline. It buckets values and compares proportions.
        </p>
        
        <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-sm">
          PSI = Σ (Current% - Reference%) × ln(Current% / Reference%)
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xl font-semibold text-gray-900 mb-1">&lt; 0.1</div>
          <div className="text-sm text-green-600">Stable</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xl font-semibold text-gray-900 mb-1">0.1 - 0.2</div>
          <div className="text-sm text-amber-600">Moderate</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-xl font-semibold text-gray-900 mb-1">&gt; 0.2</div>
          <div className="text-sm text-red-600">Significant</div>
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
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
      
      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-6">
        <h3 className="font-semibold text-green-800 mb-2">All Clear!</h3>
        <p className="text-green-700">
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
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-4">The model failed anyway.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-1">Training RMSE (2011)</div>
            <div className="text-2xl font-semibold text-gray-900">~20</div>
          </div>
          <div className="bg-gray-50 rounded p-4">
            <div className="text-xs text-gray-500 mb-1">Evaluation RMSE (2012)</div>
            <div className="text-2xl font-semibold text-red-600">~126</div>
          </div>
        </div>
        
        <p className="text-gray-600 mt-4 text-sm">
          6× worse performance despite no feature drift detected.
        </p>
      </div>
      
      <div className="bg-gray-50 border-l-2 border-gray-300 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Concept drift</p>
        <p className="text-gray-600 text-sm">
          The relationship between features and target changed. 2012 had 63% more 
          ridership than 2011. Same weather, different rental counts. The service 
          became more popular.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-700 mb-2">The blind spot</p>
        <p className="text-gray-600 text-sm">
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
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-sm">
          The bike sharing example landed in <span className="font-medium">silent failure</span>: 
          PSI showed no drift, but RMSE degraded significantly.
        </p>
      </div>
    </div>
  );
}

function TakeawaysStep() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-800">PSI alone is not enough</p>
            <p className="text-gray-600 text-sm">
              Statistical drift detection has blind spots. Pair it with performance monitoring.
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-800">Monitor what matters</p>
            <p className="text-gray-600 text-sm">
              Track actual model errors (RMSE, MAE) or use labeled samples.
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-800">Weight by importance</p>
            <p className="text-gray-600 text-sm">
              Not all features matter equally. Consider weighted PSI.
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-800">False alarms happen</p>
            <p className="text-gray-600 text-sm">
              High PSI on unimportant features might not matter. Investigate first.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link href="/simulator">
          <button className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
            Try the simulator
          </button>
        </Link>
      </div>
    </div>
  );
}
