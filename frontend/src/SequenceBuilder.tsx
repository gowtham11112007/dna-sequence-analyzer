/**
 * SequenceBuilder — interactive button-based DNA sequence builder.
 * Features:
 *   • Search & Paste Input Toolbar (Clipboard access, FASTA format auto-parsing)
 *   • Base sanitizer (removes spaces/numbers, converts RNA U→T)
 *   • Live Motif Search within active sequence
 *   • Four large A/T/G/C buttons with click burst animations
 *   • Live mRNA transcription preview ribbon
 *   • Undo, Clear, and running base counter
 */

import React, { useState, useCallback, useMemo } from 'react'

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
  
  // Search & Paste State
  const [pasteInput, setPasteInput] = useState('')
  const [showFastaDrawer, setShowFastaDrawer] = useState(false)
  const [motifSearch, setMotifSearch] = useState('')
  const [pasteNotification, setPasteNotification] = useState<string | null>(null)

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

  // Clean raw paste text (Strips FASTA headers, converts RNA U->T, removes non-ATGC)
  const cleanSequenceText = (raw: string): { clean: string; originalLen: number; isFasta: boolean } => {
    const lines = raw.split('\n')
    const isFasta = lines.some((l) => l.startsWith('>'))

    // Filter out header lines starting with >
    const seqLines = lines.filter((l) => !l.startsWith('>')).join('')
    
    // Replace U with T for RNA input compatibility, remove whitespace, numbers, non-ATGC
    const clean = seqLines
      .toUpperCase()
      .replace(/U/g, 'T')
      .replace(/[^ATGC]/g, '')

    return { clean, originalLen: raw.length, isFasta }
  }

  // Handle direct clipboard paste using Clipboard API
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text || text.trim() === '') {
        setPasteNotification('⚠️ Clipboard is empty or contains no text.')
        setTimeout(() => setPasteNotification(null), 3000)
        return
      }

      const { clean, isFasta } = cleanSequenceText(text)
      if (clean.length === 0) {
        setPasteNotification('⚠️ No valid DNA/RNA bases (A, T, G, C, U) found in copied text.')
        setTimeout(() => setPasteNotification(null), 3500)
        return
      }

      onSequenceChange(clean)
      setPasteNotification(`✅ Successfully loaded ${clean.length} bases ${isFasta ? '(Parsed FASTA header)' : ''}`)
      setTimeout(() => setPasteNotification(null), 3500)
    } catch (err) {
      // Fallback: open manual paste drawer if browser denies clipboard API access
      setShowFastaDrawer(true)
    }
  }

  // Handle manual paste box submit
  const handleApplyPasteText = (append = false) => {
    if (!pasteInput.trim()) return
    const { clean, isFasta } = cleanSequenceText(pasteInput)
    if (clean.length === 0) {
      setPasteNotification('⚠️ No valid DNA/RNA bases found in text.')
      setTimeout(() => setPasteNotification(null), 3000)
      return
    }

    if (append) {
      onSequenceChange(sequence + clean)
      setPasteNotification(`✅ Appended ${clean.length} bases`)
    } else {
      onSequenceChange(clean)
      setPasteNotification(`✅ Replaced sequence with ${clean.length} bases ${isFasta ? '(Parsed FASTA header)' : ''}`)
    }

    setPasteInput('')
    setShowFastaDrawer(false)
    setTimeout(() => setPasteNotification(null), 3500)
  }

  // Remove last base
  const undoLast = useCallback(() => {
    onSequenceChange(sequence.slice(0, -1))
  }, [sequence, onSequenceChange])

  // Clear entire sequence
  const clearAll = useCallback(() => {
    onSequenceChange('')
    setMotifSearch('')
  }, [onSequenceChange])

  // Compute live mRNA sequence
  const mrnaLive = sequence
    .split('')
    .map((b) => MRNA_MAP[b] || b)
    .join('')

  // Group DNA sequence into codon triplets for visualization
  const dnaCodonGroups: string[] = []
  for (let i = 0; i < sequence.length; i += 3) {
    dnaCodonGroups.push(sequence.slice(i, i + 3))
  }

  // Highlight motif match indices
  const motifMatchIndices = useMemo(() => {
    if (!motifSearch || motifSearch.length === 0) return new Set<number>()
    const query = motifSearch.toUpperCase().replace(/[^ATGC]/g, '')
    if (!query) return new Set<number>()

    const indices = new Set<number>()
    let pos = sequence.indexOf(query)
    while (pos !== -1) {
      for (let k = 0; k < query.length; k++) {
        indices.add(pos + k)
      }
      pos = sequence.indexOf(query, pos + 1)
    }
    return indices
  }, [sequence, motifSearch])

  return (
    <div className="sequence-builder-wrapper">
      {/* Header & Quick Action Row */}
      <div className="builder-top-header">
        <div className="card-title">
          <span className="icon-pulse">🧬</span>
          {label}
        </div>

        {/* Quick Toolbar: Clipboard Paste & FASTA Drawer Toggle */}
        <div className="paste-toolbar-actions">
          <button
            type="button"
            className="btn-paste-clipboard pulse-glow-btn"
            onClick={handlePasteFromClipboard}
            title="Paste sequence text from system clipboard"
          >
            📋 Paste from Clipboard
          </button>

          <button
            type="button"
            className="btn-toggle-fasta"
            onClick={() => setShowFastaDrawer(!showFastaDrawer)}
          >
            {showFastaDrawer ? '✕ Close Paste Drawer' : '📝 Paste Text / FASTA'}
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {pasteNotification && (
        <div className="paste-toast-banner animate-in">
          {pasteNotification}
        </div>
      )}

      {/* FASTA & Raw Text Paste Drawer */}
      {showFastaDrawer && (
        <div className="fasta-drawer-panel glass-card animate-in">
          <div className="drawer-header">
            <span className="drawer-title">📝 Raw Sequence & FASTA Parser</span>
            <span className="drawer-sub">Paste FASTA formatted text (e.g. `&gt;header...`) or raw DNA/RNA code</span>
          </div>

          <textarea
            className="fasta-textarea font-mono"
            rows={4}
            placeholder="Paste sequence here (e.g., >sp|P68871|HBB ATGGTGCATCTGACTCCT...)"
            value={pasteInput}
            onChange={(e) => setPasteInput(e.target.value)}
          />

          <div className="drawer-actions-row">
            <button
              type="button"
              className="btn-apply-replace"
              onClick={() => handleApplyPasteText(false)}
              disabled={!pasteInput.trim()}
            >
              🔄 Replace Current Sequence
            </button>
            <button
              type="button"
              className="btn-apply-append"
              onClick={() => handleApplyPasteText(true)}
              disabled={!pasteInput.trim()}
            >
              ➕ Append to Sequence
            </button>
            <button
              type="button"
              className="btn-clear-drawer"
              onClick={() => setPasteInput('')}
              disabled={!pasteInput.trim()}
            >
              Clear Text
            </button>
          </div>
        </div>
      )}

      {/* Sequence Strip — live display with animated pop badges */}
      <div className="sequence-strip-container">
        <div className="strip-header-row">
          <span className="strip-tag">DNA STRAND (5' → 3')</span>

          {/* Sequence Motif Search Input */}
          {sequence.length > 0 && (
            <div className="motif-search-box">
              <span className="motif-icon">🔍</span>
              <input
                type="text"
                className="motif-input font-mono"
                placeholder="Find motif (e.g. ATG, GAATTC)..."
                value={motifSearch}
                onChange={(e) => setMotifSearch(e.target.value.toUpperCase())}
              />
              {motifSearch && (
                <span className="motif-count">
                  {motifMatchIndices.size > 0 ? `${motifMatchIndices.size} base(s)` : 'No match'}
                </span>
              )}
            </div>
          )}

          <span className="count-badge">{sequence.length} bases</span>
        </div>

        <div className="sequence-strip" aria-label="DNA sequence display">
          {sequence.length === 0 ? (
            <span className="sequence-strip-empty">
              Tap the base buttons below or click <strong>"Paste from Clipboard"</strong> to add sequence…
            </span>
          ) : (
            <div className="codon-groups-container">
              {dnaCodonGroups.map((group, groupIdx) => (
                <span key={groupIdx} className="codon-pill">
                  {group.split('').map((base, idx) => {
                    const globalIdx = groupIdx * 3 + idx
                    const isNewest = globalIdx === sequence.length - 1
                    const isMotifMatched = motifMatchIndices.has(globalIdx)
                    return (
                      <span
                        key={globalIdx}
                        className={`base base-${base} ${isNewest ? 'base-pop-anim' : ''} ${
                          isMotifMatched ? 'base-motif-highlight' : ''
                        }`}
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
