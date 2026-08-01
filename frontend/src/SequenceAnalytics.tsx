/**
 * SequenceAnalytics Component
 * Computes live biophysical properties of the DNA sequence:
 *   • GC-Content percentage with visual gauge
 *   • Nucleotide base composition distribution
 *   • Estimated DNA Melting Temperature (Tm in °C)
 *   • Estimated Molecular Weight (in Daltons / g/mol)
 */

import React from 'react'

interface SequenceAnalyticsProps {
  sequence: string
}

export default function SequenceAnalytics({ sequence }: SequenceAnalyticsProps) {
  if (sequence.length === 0) return null

  const total = sequence.length
  const counts = {
    A: (sequence.match(/A/g) || []).length,
    T: (sequence.match(/T/g) || []).length,
    G: (sequence.match(/G/g) || []).length,
    C: (sequence.match(/C/g) || []).length,
  }

  // GC Content %
  const gcCount = counts.G + counts.C
  const gcPercent = total > 0 ? ((gcCount / total) * 100).toFixed(1) : '0'

  // Estimated Melting Temp (Wallace Rule for short, nearest-neighbor formula for long)
  let tm = 0
  if (total < 14) {
    tm = (counts.A + counts.T) * 2 + (counts.G + counts.C) * 4
  } else {
    tm = 64.9 + (41 * (gcCount - 16.4)) / total
  }
  const tmFormatted = tm > 0 ? tm.toFixed(1) : '0'

  // Estimated Molecular Weight (ssDNA in g/mol or Da)
  const mw =
    counts.A * 313.21 + counts.T * 304.2 + counts.G * 329.21 + counts.C * 289.18 - 61.96
  const mwFormatted = (mw / 1000).toFixed(2)

  return (
    <div className="glass-card analytics-card animate-in glow-hover-card" style={{ marginTop: 16 }}>
      <div className="card-title">
        <span className="icon-pulse">📊</span>
        Live Sequence Analytics & Biophysics
      </div>

      <div className="analytics-grid">
        {/* GC Content Gauge */}
        <div className="analytics-metric-box">
          <div className="metric-label">GC Content</div>
          <div className="metric-value-group">
            <span className="metric-number">{gcPercent}%</span>
            <span className="metric-sub">
              {Number(gcPercent) > 60
                ? '🔥 High Stability'
                : Number(gcPercent) < 40
                  ? '❄️ Low Stability'
                  : '⚖️ Normal Stability'}
            </span>
          </div>
          <div className="gc-bar-bg">
            <div className="gc-bar-fill" style={{ width: `${gcPercent}%` }} />
          </div>
        </div>

        {/* Melting Temp */}
        <div className="analytics-metric-box">
          <div className="metric-label">Melting Temp (Tₘ)</div>
          <div className="metric-value-group">
            <span className="metric-number">{tmFormatted}°C</span>
            <span className="metric-sub">PCR Annealing ~{(tm - 5).toFixed(1)}°C</span>
          </div>
        </div>

        {/* Molecular Weight */}
        <div className="analytics-metric-box">
          <div className="metric-label">Molecular Weight</div>
          <div className="metric-value-group">
            <span className="metric-number">{mwFormatted} kDa</span>
            <span className="metric-sub">{mw.toFixed(0)} g/mol</span>
          </div>
        </div>
      </div>

      {/* Base Distribution Bar Chart */}
      <div className="base-dist-section">
        <div className="dist-title">Nucleotide Base Composition</div>
        <div className="base-dist-bars">
          {(['A', 'T', 'G', 'C'] as const).map((base) => {
            const count = counts[base]
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
            return (
              <div key={base} className="dist-bar-item">
                <div className="dist-bar-header">
                  <span className={`dist-base-letter base-${base}`}>{base}</span>
                  <span className="dist-count">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="dist-bar-bg">
                  <div
                    className={`dist-bar-fill fill-${base}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
