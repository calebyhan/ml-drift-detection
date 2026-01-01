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
    <div style={{ backgroundColor: 'var(--background)' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 text-center"
        >
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ color: 'var(--text)' }}
          >
            When ML Models <br className="hidden sm:block" />
            <span style={{ color: 'var(--accent)' }}>Silently Fail</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            PSI says everything is fine. Your model is broken. Here&apos;s why statistical
            drift detection misses concept drift, and what to do about it.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/explainer">
              <button
                className="px-8 py-3.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                }}
              >
                Read the Explainer
              </button>
            </Link>
            <Link href="/simulator">
              <button
                className="px-8 py-3.5 rounded-lg font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                Try the Simulator
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Key Insight Section */}
      <section className="py-16 sm:py-20 lg:py-24" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Left Card - Description */}
            <motion.div
              variants={item}
              className="order-2 lg:order-1"
            >
              <div
                className="p-6 sm:p-8 rounded-2xl shadow-lg"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 2V14M2 8H14"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span
                    className="text-sm font-semibold tracking-wide uppercase"
                    style={{ color: 'var(--accent)' }}
                  >
                    The Detection Matrix
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                  Not All Drift Matters
                </h2>

                <p
                  className="text-base sm:text-lg mb-8 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  And not all failures show up as drift. Understanding the relationship between
                  statistical drift and model performance is crucial for ML monitoring.
                </p>

                <div className="space-y-4">
                  {[
                    { color: 'rgb(34, 197, 94)', label: 'All Good', desc: 'PSI stable, model works' },
                    { color: 'rgb(234, 179, 8)', label: 'False Alarm', desc: 'PSI high, model still works' },
                    { color: 'rgb(239, 68, 68)', label: 'Silent Failure', desc: 'PSI fine, model broken' },
                    { color: 'rgb(59, 130, 246)', label: 'True Positive', desc: 'PSI caught real drift' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--surface)' }}
                    >
                      <div
                        className="w-4 h-4 rounded-md mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                          {item.label}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Card - Detection Matrix Visual */}
            <motion.div
              variants={item}
              className="order-1 lg:order-2"
            >
              <div
                className="p-6 sm:p-8 rounded-2xl shadow-lg cursor-default"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                }}
              >
                <DetectionMatrix />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              The Numbers Tell the Story
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Real-world data from the UCI Bike Sharing Dataset
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                value: '+63%',
                label: 'Ridership Increase',
                sublabel: 'Growth in 2012',
                color: 'rgb(59, 130, 246)',
              },
              {
                value: '6×',
                label: 'RMSE Degradation',
                sublabel: 'Model performance drop',
                color: 'rgb(239, 68, 68)',
              },
              {
                value: '<0.05',
                label: 'PSI on All Features',
                sublabel: 'Below alert threshold',
                color: 'rgb(34, 197, 94)',
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-8 rounded-2xl shadow-lg text-center transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="text-5xl sm:text-6xl font-bold mb-3"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  {stat.label}
                </div>
                <div className="text-sm" style={{ color: 'var(--muted)' }}>
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-12 rounded-2xl shadow-xl text-center"
            style={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              Ready to Explore?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Dive into the interactive explainer or experiment with the drift simulator
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/explainer">
                <button
                  className="px-8 py-3.5 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                  }}
                >
                  Start Learning
                </button>
              </Link>
              <Link href="/simulator">
                <button
                  className="px-8 py-3.5 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  Open Simulator
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
