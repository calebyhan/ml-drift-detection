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
      color: 'bg-green-50 border-green-300 hover:bg-green-100',
    },
    {
      psiDrifted: false,
      rmseDegraded: true,
      label: 'Silent failure',
      description: 'Model degraded but PSI missed it. Concept drift.',
      color: 'bg-red-50 border-red-300 hover:bg-red-100',
    },
  ],
  // Row 1: PSI = High (drift detected)
  [
    {
      psiDrifted: true,
      rmseDegraded: false,
      label: 'False alarm',
      description: 'PSI flagged drift but model still works.',
      color: 'bg-amber-50 border-amber-300 hover:bg-amber-100',
    },
    {
      psiDrifted: true,
      rmseDegraded: true,
      label: 'True positive',
      description: 'PSI correctly caught drift that matters.',
      color: 'bg-blue-50 border-blue-300 hover:bg-blue-100',
    },
  ],
];

export function DetectionMatrix({ activeCell, onCellClick }: DetectionMatrixProps) {
  const isActive = (cell: DetectionMatrixCell) =>
    activeCell?.psiDrifted === cell.psiDrifted &&
    activeCell?.rmseDegraded === cell.rmseDegraded;

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Detection Matrix
      </h3>
      
      {/* Column headers */}
      <div className="grid grid-cols-[80px_1fr_1fr] gap-2 mb-2">
        <div /> {/* Empty corner */}
        <div className="text-center text-xs font-medium text-gray-500 py-1">
          RMSE OK
        </div>
        <div className="text-center text-xs font-medium text-gray-500 py-1">
          RMSE degraded
        </div>
      </div>

      {/* Matrix rows */}
      {MATRIX_CELLS.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-[80px_1fr_1fr] gap-2 mb-2">
          {/* Row header */}
          <div className="flex items-center justify-center text-xs font-medium text-gray-500">
            {rowIdx === 0 ? 'PSI low' : 'PSI high'}
          </div>
          
          {/* Cells */}
          {row.map((cell, colIdx) => (
            <button
              key={`${rowIdx}-${colIdx}`}
              onClick={() => onCellClick?.(cell)}
              className={`
                p-3 rounded border transition-colors cursor-pointer
                ${cell.color}
                ${isActive(cell) ? 'ring-2 ring-offset-1 ring-gray-400' : ''}
              `}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-800 mb-0.5">{cell.label}</div>
                <div className="text-xs text-gray-500 leading-snug">
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
