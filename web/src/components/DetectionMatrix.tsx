'use client';

import type { DetectionMatrixCell } from '@/lib/types';

interface DetectionMatrixProps {
  activeCell?: { psiDrifted: boolean; rmseDegraded: boolean } | null;
  onCellClick?: (cell: DetectionMatrixCell) => void;
}

const MATRIX_CELLS: DetectionMatrixCell[][] = [
  // Row 0: PSI = Low (no drift detected)
  [
    {
      psiDrifted: false,
      rmseDegraded: false,
      label: 'All good',
      description: 'No feature drift, model performs well.',
      color: 'bg-green-100 border-green-400 hover:bg-green-200',
      textColor: 'text-green-900',
      descColor: 'text-green-700',
    },
    {
      psiDrifted: false,
      rmseDegraded: true,
      label: 'Silent failure',
      description: 'Model degraded but PSI missed it. Concept drift.',
      color: 'bg-red-100 border-red-400 hover:bg-red-200',
      textColor: 'text-red-900',
      descColor: 'text-red-700',
    },
  ],
  // Row 1: PSI = High (drift detected)
  [
    {
      psiDrifted: true,
      rmseDegraded: false,
      label: 'False alarm',
      description: 'PSI flagged drift but model still works.',
      color: 'bg-amber-100 border-amber-400 hover:bg-amber-200',
      textColor: 'text-amber-900',
      descColor: 'text-amber-700',
    },
    {
      psiDrifted: true,
      rmseDegraded: true,
      label: 'True positive',
      description: 'PSI correctly caught drift that matters.',
      color: 'bg-blue-100 border-blue-400 hover:bg-blue-200',
      textColor: 'text-blue-900',
      descColor: 'text-blue-700',
    },
  ],
];

export function DetectionMatrix({ activeCell, onCellClick }: DetectionMatrixProps) {
  const isActive = (cell: DetectionMatrixCell) =>
    activeCell?.psiDrifted === cell.psiDrifted &&
    activeCell?.rmseDegraded === cell.rmseDegraded;

  return (
    <div className="rounded-xl p-6 sm:p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Detection Matrix
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          How PSI monitoring relates to actual model performance
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[100px_1fr_1fr] gap-3 mb-3">
        <div /> {/* Empty corner */}
        <div
          className="text-center text-xs font-semibold tracking-wide uppercase py-2 px-3 rounded-lg"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text-secondary)'
          }}
        >
          RMSE OK
        </div>
        <div
          className="text-center text-xs font-semibold tracking-wide uppercase py-2 px-3 rounded-lg"
          style={{
            backgroundColor: 'var(--surface)',
            color: 'var(--text-secondary)'
          }}
        >
          RMSE Degraded
        </div>
      </div>

      {/* Matrix rows */}
      {MATRIX_CELLS.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-[100px_1fr_1fr] gap-3 mb-3">
          {/* Row header */}
          <div
            className="flex items-center justify-center text-xs font-semibold tracking-wide uppercase rounded-lg px-3"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-secondary)'
            }}
          >
            {rowIdx === 0 ? 'PSI Low' : 'PSI High'}
          </div>

          {/* Cells */}
          {row.map((cell, colIdx) => (
            <button
              key={`${rowIdx}-${colIdx}`}
              onClick={() => onCellClick?.(cell)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 cursor-default
                hover:scale-105 hover:shadow-lg
                ${cell.color}
                ${isActive(cell) ? 'ring-4 ring-offset-2 scale-105 shadow-lg' : ''}
              `}
              style={{
                borderColor: isActive(cell) ? 'var(--accent)' : undefined,
              }}
            >
              <div className="text-center">
                <div className={`text-sm sm:text-base font-bold mb-1.5 ${cell.textColor}`}>
                  {cell.label}
                </div>
                <div className={`text-xs leading-relaxed ${cell.descColor}`}>
                  {cell.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
