/**
 * CodonWheel Component
 * Interactive Codon Matrix & Genetic Code Lookup Table.
 * Shows codon-to-amino acid mappings with search / filter capabilities.
 */

import React, { useState } from 'react'

// Standard Genetic Code Dictionary
const GENETIC_CODE: Record<string, { aa: string; name: string; class: string }> = {
  TTT: { aa: 'F', name: 'Phenylalanine', class: 'nonpolar' },
  TTC: { aa: 'F', name: 'Phenylalanine', class: 'nonpolar' },
  TTA: { aa: 'L', name: 'Leucine', class: 'nonpolar' },
  TTG: { aa: 'L', name: 'Leucine', class: 'nonpolar' },

  CTT: { aa: 'L', name: 'Leucine', class: 'nonpolar' },
  CTC: { aa: 'L', name: 'Leucine', class: 'nonpolar' },
  CTA: { aa: 'L', name: 'Leucine', class: 'nonpolar' },
  CTG: { aa: 'L', name: 'Leucine', class: 'nonpolar' },

  ATT: { aa: 'I', name: 'Isoleucine', class: 'nonpolar' },
  ATC: { aa: 'I', name: 'Isoleucine', class: 'nonpolar' },
  ATA: { aa: 'I', name: 'Isoleucine', class: 'nonpolar' },
  ATG: { aa: 'M', name: 'Methionine (START)', class: 'nonpolar' },

  GTT: { aa: 'V', name: 'Valine', class: 'nonpolar' },
  GTC: { aa: 'V', name: 'Valine', class: 'nonpolar' },
  GTA: { aa: 'V', name: 'Valine', class: 'nonpolar' },
  GTG: { aa: 'V', name: 'Valine', class: 'nonpolar' },

  TCT: { aa: 'S', name: 'Serine', class: 'polar' },
  TCC: { aa: 'S', name: 'Serine', class: 'polar' },
  TCA: { aa: 'S', name: 'Serine', class: 'polar' },
  TCG: { aa: 'S', name: 'Serine', class: 'polar' },

  CCT: { aa: 'P', name: 'Proline', class: 'nonpolar' },
  CCC: { aa: 'P', name: 'Proline', class: 'nonpolar' },
  CCA: { aa: 'P', name: 'Proline', class: 'nonpolar' },
  CCG: { aa: 'P', name: 'Proline', class: 'nonpolar' },

  ACT: { aa: 'T', name: 'Threonine', class: 'polar' },
  ACC: { aa: 'T', name: 'Threonine', class: 'polar' },
  ACA: { aa: 'T', name: 'Threonine', class: 'polar' },
  ACG: { aa: 'T', name: 'Threonine', class: 'polar' },

  GCT: { aa: 'A', name: 'Alanine', class: 'nonpolar' },
  GCC: { aa: 'A', name: 'Alanine', class: 'nonpolar' },
  GCA: { aa: 'A', name: 'Alanine', class: 'nonpolar' },
  GCG: { aa: 'A', name: 'Alanine', class: 'nonpolar' },

  TAT: { aa: 'Y', name: 'Tyrosine', class: 'polar' },
  TAC: { aa: 'Y', name: 'Tyrosine', class: 'polar' },
  TAA: { aa: '*', name: 'STOP Codon (Ochre)', class: 'acidic' },
  TAG: { aa: '*', name: 'STOP Codon (Amber)', class: 'acidic' },

  CAT: { aa: 'H', name: 'Histidine', class: 'basic' },
  CAC: { aa: 'H', name: 'Histidine', class: 'basic' },
  CAA: { aa: 'Q', name: 'Glutamine', class: 'polar' },
  CAG: { aa: 'Q', name: 'Glutamine', class: 'polar' },

  AAT: { aa: 'N', name: 'Asparagine', class: 'polar' },
  AAC: { aa: 'N', name: 'Asparagine', class: 'polar' },
  AAA: { aa: 'K', name: 'Lysine', class: 'basic' },
  AAG: { aa: 'K', name: 'Lysine', class: 'basic' },

  GAT: { aa: 'D', name: 'Aspartic Acid', class: 'acidic' },
  GAC: { aa: 'D', name: 'Aspartic Acid', class: 'acidic' },
  GAA: { aa: 'E', name: 'Glutamic Acid', class: 'acidic' },
  GAG: { aa: 'E', name: 'Glutamic Acid', class: 'acidic' },

  TGT: { aa: 'C', name: 'Cysteine', class: 'polar' },
  TGC: { aa: 'C', name: 'Cysteine', class: 'polar' },
  TGA: { aa: '*', name: 'STOP Codon (Opal)', class: 'acidic' },
  TGG: { aa: 'W', name: 'Tryptophan', class: 'nonpolar' },

  CGT: { aa: 'R', name: 'Arginine', class: 'basic' },
  CGC: { aa: 'R', name: 'Arginine', class: 'basic' },
  CGA: { aa: 'R', name: 'Arginine', class: 'basic' },
  CGG: { aa: 'R', name: 'Arginine', class: 'basic' },

  AGT: { aa: 'S', name: 'Serine', class: 'polar' },
  AGC: { aa: 'S', name: 'Serine', class: 'polar' },
  AGA: { aa: 'R', name: 'Arginine', class: 'basic' },
  AGG: { aa: 'R', name: 'Arginine', class: 'basic' },

  GGT: { aa: 'G', name: 'Glycine', class: 'nonpolar' },
  GGC: { aa: 'G', name: 'Glycine', class: 'nonpolar' },
  GGA: { aa: 'G', name: 'Glycine', class: 'nonpolar' },
  GGG: { aa: 'G', name: 'Glycine', class: 'nonpolar' },
}

interface CodonWheelProps {
  activeSequence?: string
}

export default function CodonWheel({ activeSequence = '' }: CodonWheelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCodon, setSelectedCodon] = useState<string | null>(null)

  // Extract user sequence codons
  const userCodons = new Set<string>()
  for (let i = 0; i < activeSequence.length - 2; i += 3) {
    userCodons.add(activeSequence.slice(i, i + 3).toUpperCase())
  }

  const allCodons = Object.keys(GENETIC_CODE)
  const filteredCodons = allCodons.filter((c) => {
    const info = GENETIC_CODE[c]
    const q = searchTerm.toLowerCase()
    return (
      c.toLowerCase().includes(q) ||
      info.name.toLowerCase().includes(q) ||
      info.aa.toLowerCase() === q
    )
  })

  return (
    <div className="glass-card codon-matrix-card glow-hover-card" style={{ marginTop: 20 }}>
      <div className="card-title">
        <span className="icon-pulse">📖</span>
        Interactive Genetic Codon Dictionary (64 Codons)
      </div>

      <div className="codon-search-row">
        <input
          type="text"
          className="codon-search-input"
          placeholder="Search codon (e.g. ATG, Serine, Met)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeSequence.length >= 3 && (
          <span className="user-codon-badge">
            ✨ {userCodons.size} unique codon(s) in active sequence
          </span>
        )}
      </div>

      <div className="codon-grid">
        {filteredCodons.map((codon) => {
          const info = GENETIC_CODE[codon]
          const isUserCodon = userCodons.has(codon)
          const isStart = codon === 'ATG'
          const isStop = info.aa === '*'

          return (
            <button
              key={codon}
              className={`codon-card-item aa-${info.class} ${isUserCodon ? 'active-user-codon' : ''} ${
                selectedCodon === codon ? 'selected-codon' : ''
              }`}
              onClick={() => setSelectedCodon(selectedCodon === codon ? null : codon)}
              type="button"
            >
              <span className="codon-seq">{codon}</span>
              <span className="codon-aa-letter">{info.aa}</span>
              <span className="codon-aa-name">{info.name.split(' ')[0]}</span>
              {isStart && <span className="start-pill">START</span>}
              {isStop && <span className="stop-pill">STOP</span>}
              {isUserCodon && <span className="present-dot" title="Present in sequence" />}
            </button>
          );
        })}
      </div>

      {selectedCodon && (
        <div className="selected-codon-details animate-in">
          <div className="detail-title">
            Codon: <strong>{selectedCodon}</strong> → Amino Acid:{' '}
            <strong>{GENETIC_CODE[selectedCodon].name}</strong> ({GENETIC_CODE[selectedCodon].aa})
          </div>
          <div className="detail-desc">
            Chemical Properties: <span>{GENETIC_CODE[selectedCodon].class}</span>
          </div>
        </div>
      )}

      {/* CODON USAGE FREQUENCY CHART */}
      {activeSequence.length >= 3 && (
        <div className="codon-frequency-chart glass-card animate-in" style={{ marginTop: 24, padding: 20 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>📊 Codon Usage Frequency</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(() => {
              const totalCodons = Math.floor(activeSequence.length / 3)
              const data = Array.from(userCodons).map(codon => {
                let count = 0
                for (let i = 0; i < activeSequence.length - 2; i += 3) {
                  if (activeSequence.slice(i, i + 3).toUpperCase() === codon) count++
                }
                const percentage = ((count / totalCodons) * 100).toFixed(1)
                return { codon, count, percentage }
              }).sort((a, b) => b.count - a.count)

              return data.map(({ codon, count, percentage }) => (
                <div key={codon} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="font-mono" style={{ width: 40, fontWeight: 'bold' }}>{codon}</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, background: '#38bdf8', height: '100%', borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 80, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {count} ({percentage}%)
                  </span>
                </div>
              ))
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
