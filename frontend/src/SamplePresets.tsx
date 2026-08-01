/**
 * SamplePresets Component
 * Provides 1-click loading of real-world biological DNA sequences
 * (e.g., Sickle Cell Anemia vs Normal Hemoglobin, Human Insulin, Oxytocin).
 */

import React from 'react'

export interface Preset {
  id: string
  name: string
  category: string
  icon: string
  description: string
  sampleDna: string
  referenceDna?: string
}

export const PRESETS: Preset[] = [
  {
    id: 'sickle-cell',
    name: 'Sickle Cell Anemia (Beta-Globin)',
    category: 'Mutation Case',
    icon: '🩸',
    description: 'Compares Normal Hemoglobin HBB vs Sickle Cell (Glu6Val substitution at codon 7).',
    referenceDna: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCC',
    sampleDna: 'ATGGTGCACCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCC',
  },
  {
    id: 'insulin-a',
    name: 'Human Insulin (A Chain)',
    category: 'Hormone',
    icon: '💉',
    description: 'Human Insulin A Chain coding sequence (21 amino acids).',
    sampleDna: 'GGGATCGTGGAGCAGTGCTGCACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAAC',
  },
  {
    id: 'oxytocin',
    name: 'Oxytocin Precursor',
    category: 'Neuropeptide',
    icon: '🧠',
    description: 'Oxytocin precursor fragment responsible for social bonding.',
    sampleDna: 'TGCTACATCCAGAACTGCCCCCTGGGC',
  },
  {
    id: 'ubiquitin',
    name: 'Human Ubiquitin',
    category: 'Cellular Tag',
    icon: '🏷️',
    description: 'Protein degradation signaling tag sequence.',
    sampleDna: 'ATGCAGATCTTCGTGAAGACCCTGACCGGCAAGACCATCACCCTGGAGGTGGAGCCCAGCGACACCATCGAGAACGTGAAGGCCAAGATCCAGGACAAGGAGGGCATCCCCCCCGACCAGCAGCGCCTGATCTTCGCCGGCAAGCAGCTGGAGGACGGCCGCACCCTGAGCGACTACAACATCCAGAAGGAGAGCACCCTGCACCTGGTGCTGCGCCTGCGCGGCGGC',
  },
]

interface SamplePresetsProps {
  onSelectPreset: (preset: Preset) => void
}

export default function SamplePresets({ onSelectPreset }: SamplePresetsProps) {
  return (
    <div className="glass-card presets-card glow-hover-card" style={{ marginBottom: 20 }}>
      <div className="card-title">
        <span className="icon-pulse">🧬</span>
        Quick-Load Preset DNA Sequences
      </div>
      <p className="presets-subtitle">
        Click any preset below to instantly load real biological DNA data:
      </p>

      <div className="presets-grid">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset-btn"
            onClick={() => onSelectPreset(preset)}
            type="button"
          >
            <div className="preset-header">
              <span className="preset-icon">{preset.icon}</span>
              <span className="preset-category">{preset.category}</span>
            </div>
            <div className="preset-name">{preset.name}</div>
            <div className="preset-desc">{preset.description}</div>
            <div className="preset-action-tag">⚡ Load Sequence</div>
          </button>
        ))}
      </div>
    </div>
  )
}
