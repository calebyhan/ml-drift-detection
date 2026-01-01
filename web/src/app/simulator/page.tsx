'use client';

import Link from 'next/link';
import { DriftSimulator } from '@/components/DriftSimulator';

export default function SimulatorPage() {
  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 200px)' }}>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div
          className="rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12h8m4 0h6M3 6h8m4 0h6M3 18h8m4 0h6"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                Interactive Drift Simulator
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Inject different types of drift into the 2012 data and observe how PSI responds in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Simulator Component */}
        <DriftSimulator />

        {/* Drift Type Explanations */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>
            Types of Drift
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div
              className="rounded-2xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                  Gradual Drift
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Cumulative bias over time. Common in sensor calibration drift or seasonal changes.
              </p>
            </div>

            <div
              className="rounded-2xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                  Sudden Shift
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Abrupt change at a specific point. Often caused by new deployments or system updates.
              </p>
            </div>

            <div
              className="rounded-2xl shadow-lg p-6"
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                  Random Noise
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Gaussian noise on all values. Indicates data quality issues or measurement errors.
              </p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div
          className="mt-8 rounded-xl p-5 border-l-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--accent)',
            border: '1px solid var(--border)',
            borderLeftWidth: '4px',
            borderLeftColor: 'var(--accent)'
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text)' }}>Note:</strong> The same drift amount affects features differently depending on their
            distribution width. A 0.15 shift in temperature has a different impact than a 0.15 shift in humidity.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/explainer">
            <button className="px-8 py-3.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:scale-105" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>
              Learn about drift detection
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
