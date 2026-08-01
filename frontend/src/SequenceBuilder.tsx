/**
 * SequenceBuilder — interactive button-based DNA sequence builder.
 * Four large A/T/G/C buttons append bases to a live "sequence strip".
 * Includes live mRNA transcription preview, animated base badges,
 * burst effects on click, undo, clear, and running base counter.
 */

import React, { useState, useCallback } from 'react'

interface SequenceBuilderProps {
  sequence: string
  onSequenceChange: (seq: string) => void
  label?: string
}

const BASE_LABELS: Record<string, string> = {
  A: 'Adenine',
  T: 'Thymine',
  G: 'Guanine',
  C: 'Cytosine',
}

const MRNA_MAP: Record<string, string> = {
  A: 'U',
  T: 'A',
  G: 'C',
  C: 'G',
}

interface BurstEffect {
  id: number
  x: number
  y: number
  base: string
}

export default function SequenceBuilder({
  sequence,
  onSequenceChange,
  label = 'Sample DNA Sequence',
}: SequenceBuilderProps) {
  const [bursts, setBursts] = useState<BurstEffect[]>([])

  // Append a single base with click burst animation
  const addBase = useCallback(
    (base: string, e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newBurst = { id: Date.now(), x, y, base }
      setBursts((prev) => [...prev.slice(-5), newBurst])

      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== newBurst.id))
      }, 600)

      onSequenceChange(sequence + base)
    },
    [sequence, onSequenceChange]
  )

  // Remove last base
  const undoLast = useCallback(() => {
    onSequenceChange(sequence.slice(0, -1))
  }, [sequence, onSequenceChange])

  // Clear entire sequence
  const clearAll = useCallback(() => {
    onSequenceChange('')
  }, [onSequenceChange])

  // Compute live mRNA sequence (DNA -> mRNA base pairing: A->U, T->A, G->C, C->G)
  const mrnaLive = sequence
    .split('')
    .map((b) => MRNA_MAP[b] || b)
    .join('')

  // Group DNA sequence into codon triplets for visualization
  const dnaCodonGroups: string[] = []
  for (let i = 0; i < sequence.length; i += 3) {
    dnaCodonGroups.push(sequence.slice(i, i + 3))
  }

  return (
    <div className="sequence-builder-wrapper">
      {/* Header Label */}
      <div className="card-title">
        <span className="icon-pulse">🧬</span>
        {label}
      </div>

      {/* Sequence Strip — live display with animated pop badges */}
      <div className="sequence-strip-container">
        <div className="strip-header-row">
          <span className="strip-tag">DNA STRAND (5' → 3')</span>
          <span className="count-badge">{sequence.length} bases</span>
        </div>

        <div className="sequence-strip" aria-label="DNA sequence display">
          {sequence.length === 0 ? (
            <span className="sequence-strip-empty">
              Tap the large base buttons below to build sequence…
            </span>
          ) : (
            <div className="codon-groups-container">
              {dnaCodonGroups.map((group, groupIdx) => (
                <span key={groupIdx} className="codon-pill">
                  {group.split('').map((base, idx) => {
                    const globalIdx = groupIdx * 3 + idx
                    const isNewest = globalIdx === sequence.length - 1
                    return (
                      <span
                        key={globalIdx}
                        className={`base base-${base} ${isNewest ? 'base-pop-anim' : ''}`}
                      >
                        {base}
                      </span>
                    )
                  })}
                </span>
              ))}
              <span className="cursor-blink" />
            </div>
          )}
        </div>

        {/* Live mRNA preview ribbon */}
        {sequence.length > 0 && (
          <div className="mrna-live-ribbon animate-in">
            <span className="mrna-ribbon-label">mRNA TRANSCRIPT:</span>
            <span className="mrna-ribbon-seq">
              {mrnaLive.split('').map((base, i) => (
                <span key={i} className={`mrna-base mrna-${base}`}>
                  {base}
                </span>
              ))}
            </span>
          </div>
        )}

        {/* Base counter & stats */}
        <div className="base-counter">
          <span>
            <span className="count">{sequence.length}</span> bases entered
          </span>
          <span>
            {sequence.length >= 3 ? (
              <span className="codon-stat">
                ⚡ {Math.floor(sequence.length / 3)} complete codon(s)
              </span>
            ) : (
              <span className="codon-hint">Need {3 - sequence.length} more base(s) for 1st codon</span>
            )}
          </span>
        </div>
      </div>

      {/* Base builder buttons with interactive click ripples */}
      <div className="base-buttons">
        {(['A', 'T', 'G', 'C'] as const).map((base) => (
          <button
            key={base}
            className={`base-btn base-btn-${base} interactive-btn`}
            onClick={(e) => addBase(base, e)}
            aria-label={`Add ${BASE_LABELS[base]}`}
            type="button"
          >
            <span className="base-glow-ring" />
            <span className="base-letter">{base}</span>
            <span className="base-label">{BASE_LABELS[base]}</span>

            {/* Click ripple bursts */}
            {bursts
              .filter((b) => b.base === base)
              .map((b) => (
                <span
                  key={b.id}
                  className="btn-burst"
                  style={{ left: b.x, top: b.y }}
                />
              ))}
          </button>
        ))}
      </div>

      {/* Undo / Clear row */}
      <div className="action-row">
        <button
          className="btn-undo hover-glow"
          onClick={undoLast}
          disabled={sequence.length === 0}
          type="button"
        >
          ↩ Undo Base
        </button>
        <button
          className="btn-clear hover-glow"
          onClick={clearAll}
          disabled={sequence.length === 0}
          type="button"
        >
          ✕ Clear All
        </button>
      </div>
    </div>
  )
}
