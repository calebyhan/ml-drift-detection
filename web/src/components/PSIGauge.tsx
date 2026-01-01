'use client';

import { motion } from 'framer-motion';

interface PSIGaugeProps {
  value: number;
  label: string;
  size?: number;
}

export function PSIGauge({ value, label, size = 120 }: PSIGaugeProps) {
  // PSI thresholds
  const thresholds = { stable: 0.1, moderate: 0.2, max: 0.5 };

  // Clamp value for display
  const displayValue = Math.min(value, thresholds.max);
  const percentage = (displayValue / thresholds.max) * 100;

  // Determine color based on thresholds
  let color = '#22c55e'; // green for stable
  let status = 'Stable';
  if (value >= thresholds.moderate) {
    color = '#ef4444'; // red for significant
    status = 'Significant';
  } else if (value >= thresholds.stable) {
    color = '#eab308'; // yellow for moderate
    status = 'Moderate';
  }

  // Arc calculations
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <svg width={size} height={size / 2 + 20} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Threshold markers */}
        {[thresholds.stable, thresholds.moderate].map((threshold, idx) => {
          const angle = Math.PI * (1 - threshold / thresholds.max);
          const x = size / 2 + radius * Math.cos(angle);
          const y = size / 2 - radius * Math.sin(angle);
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r={3} fill={idx === 0 ? '#eab308' : '#ef4444'} />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {threshold}
              </text>
            </g>
          );
        })}

        {/* Value arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill={color}
        >
          {value.toFixed(3)}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 15}
          textAnchor="middle"
          className="text-xs"
          fill="#6b7280"
        >
          PSI
        </text>
      </svg>

      <div className="text-center mt-1">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-semibold"
          style={{ color }}
        >
          {status}
        </motion.div>
      </div>
    </motion.div>
  );
}
