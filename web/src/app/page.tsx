'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { DetectionMatrix } from '@/components/DetectionMatrix';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-6 py-24 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            When ML Models Silently Fail
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            PSI says everything is fine. Your model is broken. Here&apos;s why statistical 
            drift detection misses concept drift, and what to do about it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/explainer">
              <button className="px-6 py-2.5 bg-white text-slate-900 font-medium rounded hover:bg-gray-100 transition-colors">
                Read the explainer
              </button>
            </Link>
            <Link href="/simulator">
              <button className="px-6 py-2.5 text-gray-300 font-medium rounded border border-gray-600 hover:border-gray-500 hover:text-white transition-colors">
                Try the simulator
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Key Insight Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={item}>
            <h2 className="text-2xl font-semibold text-white mb-4">
              The Detection Matrix
            </h2>
            <p className="text-gray-400 mb-6">
              Not all drift matters, and not all failures show up as drift.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-green-500/80" />
                <span className="text-gray-300">All good — PSI stable, model works</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-yellow-500/80" />
                <span className="text-gray-300">False alarm — PSI high, model still works</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-red-500/80" />
                <span className="text-gray-300">Silent failure — PSI fine, model broken</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm bg-blue-500/80" />
                <span className="text-gray-300">True positive — PSI caught real drift</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={item}>
            <DetectionMatrix />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-semibold text-white text-center mb-10">
            The numbers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-semibold text-white mb-1">+63%</div>
              <div className="text-gray-500 text-sm">ridership increase in 2012</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-white mb-1">6×</div>
              <div className="text-gray-500 text-sm">RMSE degradation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-semibold text-white mb-1">&lt;0.05</div>
              <div className="text-gray-500 text-sm">PSI on all features</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600 text-sm">
          Data from UCI Machine Learning Repository
        </div>
      </footer>
    </main>
  );
}
