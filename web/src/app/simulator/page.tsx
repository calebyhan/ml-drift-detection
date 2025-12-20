'use client';

import Link from 'next/link';
import { DriftSimulator } from '@/components/DriftSimulator';

export default function SimulatorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-gray-500 hover:text-gray-900 text-sm">
            ← Back
          </Link>
          <span className="text-sm text-gray-600">Simulator</span>
          <Link href="/explainer" className="text-gray-500 hover:text-gray-900 text-sm">
            Explainer
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Inject drift into the 2012 data and observe how PSI responds.
          </p>
        </div>

        <DriftSimulator />

        {/* Info cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-800 mb-1">Gradual drift</p>
            <p className="text-gray-500 text-xs">
              Cumulative bias over time. Sensor calibration, seasonal changes.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-800 mb-1">Sudden shift</p>
            <p className="text-gray-500 text-xs">
              Abrupt change at a point. New deployment, system updates.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-800 mb-1">Random noise</p>
            <p className="text-gray-500 text-xs">
              Gaussian noise on all values. Data quality issues.
            </p>
          </div>
        </div>

        {/* Note */}
        <p className="mt-6 text-xs text-gray-500">
          The same drift amount affects features differently depending on their 
          distribution width.
        </p>
      </div>
    </main>
  );
}
