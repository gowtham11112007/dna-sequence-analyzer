/**
 * ProTools Component — Modular Bioinformatic Sequence Tools
 * Features expandable tool sections and collapsible detail views to maintain
 * an ultra-clean, state-of-the-art UI experience.
 */

import React, { useState, useMemo } from 'react'

interface ProToolsProps {
  currentSequence: string
  onLoadSequence: (seq: string) => void
}

interface RestrictionEnzyme {
  name: string
  site: string
  cutOffset: number
  description: string
}

const ENZYMES: RestrictionEnzyme[] = [
  { name: 'EcoRI', site: 'GAATTC', cutOffset: 1, description: 'G^AATTC sticky cut (5\' overhang)' },
  { name: 'BamHI', site: 'GGATCC', cutOffset: 1, description: 'G^GATCC sticky cut (5\' overhang)' },
  { name: 'HindIII', site: 'AAGCTT', cutOffset: 1, description: 'A^AGCTT sticky cut' },
  { name: 'XhoI', site: 'CTCGAG', cutOffset: 1, description: 'C^TCGAG sticky cut' },
  { name: 'NotI', site: 'GCGGCCGC', cutOffset: 2, description: 'GC^GGCCGC 8-base cutter' },
  { name: 'PstI', site: 'CTGCAG', cutOffset: 5, description: 'CTGCA^G 3\' overhang cut' },
  { name: 'SalI', site: 'GTCGAC', cutOffset: 1, description: 'G^TCGAC sticky cut' },
  { name: 'TaqI', site: 'TCGA', cutOffset: 1, description: 'T^CGA thermophilic 4-base cutter' },
]

const CODON_TABLE: Record<string, string> = {
  ATA: 'I', ATC: 'I', ATT: 'I', ATG: 'M',
  ACA: 'T', ACC: 'T', ACG: 'T', ACT: 'T',
  AAC: 'N', AAT: 'N', AAA: 'K', AAG: 'K',
  AGC: 'S', AGT: 'S', AGA: 'R', AGG: 'R',
  CTA: 'L', CTC: 'L', CTG: 'L', CTT: 'L',
  CCA: 'P', CCC: 'P', CCG: 'P', CCT: 'P',
  CAC: 'H', CAT: 'H', CAA: 'Q', CAG: 'Q',
  CGA: 'R', CGC: 'R', CGD: 'R', CGG: 'R', CGT: 'R',
  GTA: 'V', GTC: 'V', GTG: 'V', GTT: 'V',
  GCA: 'A', GCC: 'A', GCG: 'A', GCT: 'A',
  GAC: 'D', GAT: 'D', GAA: 'E', GAG: 'E',
  GGA: 'G', GGC: 'G', GGG: 'G', GGT: 'G',
  TCA: 'S', TCC: 'S', TCG: 'S', TCT: 'S',
  TTC: 'F', TTT: 'F', TTA: 'L', TTG: 'L',
  TAC: 'Y', TAT: 'Y', TAA: '*', TAG: '*', TGA: '*',
  TGC: 'C', TGT: 'C', TGG: 'W',
}

const DNA_COMPLEMENT: Record<string, string> = {
  A: 'T', T: 'A', G: 'C', C: 'G', U: 'A',
}

export default function ProTools({ currentSequence, onLoadSequence }: ProToolsProps) {
  const [activeTab, setActiveTab] = useState<'revcomp' | 'orf' | 'enzymes' | 'synthetic' | 'mutagenesis'>('revcomp')
  const [toolSeq, setToolSeq] = useState<string>(currentSequence || 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCC')

  React.useEffect(() => {
    if (currentSequence) {
      setToolSeq(currentSequence.toUpperCase().replace(/[^ATGCU]/g, ''))
    }
  }, [currentSequence])

  // --- REVERSE COMPLEMENT ---
  const complementSeq = useMemo(() => {
    return toolSeq.split('').map((b) => DNA_COMPLEMENT[b] || b).join('')
  }, [toolSeq])

  const reverseSeq = useMemo(() => {
    return toolSeq.split('').reverse().join('')
  }, [toolSeq])

  const revCompSeq = useMemo(() => {
    return complementSeq.split('').reverse().join('')
  }, [toolSeq, complementSeq])

  // --- RESTRICTION ENZYMES ---
  const restrictionMatches = useMemo(() => {
    const results: { enzyme: RestrictionEnzyme; positions: number[] }[] = []
    if (!toolSeq) return results

    ENZYMES.forEach((enz) => {
      const positions: number[] = []
      let pos = toolSeq.indexOf(enz.site)
      while (pos !== -1) {
        positions.push(pos + 1)
        pos = toolSeq.indexOf(enz.site, pos + 1)
      }
      if (positions.length > 0) {
        results.push({ enzyme: enz, positions })
      }
    })
    return results
  }, [toolSeq])

  // --- ORF SCANNER ---
  const orfResults = useMemo(() => {
    if (toolSeq.length < 9) return []

    const cleanDna = toolSeq.replace(/U/g, 'T')
    const revCleanDna = cleanDna.split('').map((b) => DNA_COMPLEMENT[b] || b).reverse().join('')

    const frames = [
      { name: 'Frame +1', seq: cleanDna, offset: 0 },
      { name: 'Frame +2', seq: cleanDna.slice(1), offset: 1 },
      { name: 'Frame +3', seq: cleanDna.slice(2), offset: 2 },
      { name: 'Frame -1', seq: revCleanDna, offset: 0 },
      { name: 'Frame -2', seq: revCleanDna.slice(1), offset: 1 },
      { name: 'Frame -3', seq: revCleanDna.slice(2), offset: 2 },
    ]

    const foundOrfs: { frame: string; start: number; stop: number; length: number; peptide: string }[] = []

    frames.forEach((fr) => {
      const s = fr.seq
      let inOrf = false
      let startPos = -1
      let peptide = ''

      for (let i = 0; i <= s.length - 3; i += 3) {
        const codon = s.slice(i, i + 3)
        const aa = CODON_TABLE[codon] || '?'

        if (codon === 'ATG' && !inOrf) {
          inOrf = true
          startPos = i + fr.offset + 1
          peptide = 'M'
        } else if (inOrf) {
          if (aa === '*') {
            inOrf = false
            const endPos = i + fr.offset + 3
            foundOrfs.push({
              frame: fr.name,
              start: startPos,
              stop: endPos,
              length: peptide.length,
              peptide,
            })
            peptide = ''
          } else {
            peptide += aa
          }
        }
      }
    })

    return foundOrfs.sort((a, b) => b.length - a.length)
  }, [toolSeq])

  // --- SYNTHETIC GENERATOR ---
  const [synthType, setSynthType] = useState<'dna' | 'rna' | 'protein'>('dna')
  const [synthLength, setSynthLength] = useState<number>(60)
  const [synthGc, setSynthGc] = useState<number>(50)
  const [generatedSeq, setGeneratedSeq] = useState<string>('')

  const handleGenerateSynthetic = () => {
    let result = ''
    if (synthType === 'dna' || synthType === 'rna') {
      const bases = synthType === 'dna' ? ['A', 'T', 'G', 'C'] : ['A', 'U', 'G', 'C']
      const gcProb = synthGc / 100
      for (let i = 0; i < synthLength; i++) {
        if (Math.random() < gcProb) {
          result += Math.random() < 0.5 ? 'G' : 'C'
        } else {
          result += Math.random() < 0.5 ? bases[0] : bases[1]
        }
      }
    } else {
      const aaList = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V']
      for (let i = 0; i < synthLength; i++) {
        result += aaList[Math.floor(Math.random() * aaList.length)]
      }
    }
    setGeneratedSeq(result)
  }

  // --- MUTAGENESIS ---
  const [mutPos, setMutPos] = useState<number>(1)
  const [mutNewBase, setMutNewBase] = useState<string>('A')
  const [simulatedSeq, setSimulatedSeq] = useState<string>('')

  const handleSimulateMutation = () => {
    if (!toolSeq || mutPos < 1 || mutPos > toolSeq.length) return
    const arr = toolSeq.split('')
    arr[mutPos - 1] = mutNewBase
    setSimulatedSeq(arr.join(''))
  }

  return (
    <div className="pro-tools-container animate-in">
      {/* Header Banner */}
      <div className="glass-card tools-header-card glow-hover-card">
        <div className="tools-title-row">
          <div className="title-with-icon">
            <span className="tools-header-icon">⚡</span>
            <div>
              <h2>Pro Bioinformatic Function Suite</h2>
              <p className="tools-subtitle">
                Select any tool below to calculate reverse complements, scan ORFs, map cut sites, or generate synthetic DNA.
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="tools-input-box">
          <label className="tools-label font-semibold">Active Sequence Input:</label>
          <div className="tools-input-row">
            <input
              type="text"
              className="tools-sequence-input font-mono"
              value={toolSeq}
              onChange={(e) => setToolSeq(e.target.value.toUpperCase().replace(/[^ATGCU]/g, ''))}
              placeholder="Paste sequence..."
            />
            <button
              type="button"
              className="btn-use-builder-seq"
              onClick={() => onLoadSequence(toolSeq)}
            >
              🚀 Send to Builder
            </button>
          </div>
        </div>

        {/* Clean Interactive Tool Selector Buttons */}
        <div className="tools-tabs">
          {[
            { id: 'revcomp', label: '🔄 Reverse Complement', badge: null },
            { id: 'orf', label: '🔍 6-Frame ORF Finder', badge: orfResults.length },
            { id: 'enzymes', label: '✂️ Restriction Cut Sites', badge: restrictionMatches.length },
            { id: 'synthetic', label: '🧪 Synthetic Generator', badge: null },
            { id: 'mutagenesis', label: '🧬 Mutagenesis Simulator', badge: null },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tools-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id as any)}
            >
              {t.label}
              {t.badge !== null && <span className="tab-count-pill">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tool View Panels */}
      {activeTab === 'revcomp' && (
        <div className="tool-view-panel glass-card animate-in">
          <h3 className="panel-title">🔄 Strand Operations & Reverse Complement</h3>
          <p className="panel-desc">Calculates 5'→3' Reverse Complement, Watson-Crick Complement, and Inverted strand.</p>

          <div className="strand-grid">
            <div className="strand-card">
              <div className="strand-card-header">
                <span>5' → 3' REVERSE COMPLEMENT</span>
                <button type="button" className="btn-copy-mini" onClick={() => navigator.clipboard.writeText(revCompSeq)}>
                  📋 Copy
                </button>
              </div>
              <div className="strand-output font-mono">{revCompSeq || 'No sequence'}</div>
            </div>

            <div className="strand-card">
              <div className="strand-card-header">
                <span>WATSON-CRICK COMPLEMENT</span>
                <button type="button" className="btn-copy-mini" onClick={() => navigator.clipboard.writeText(complementSeq)}>
                  📋 Copy
                </button>
              </div>
              <div className="strand-output font-mono">{complementSeq || 'No sequence'}</div>
            </div>

            <div className="strand-card">
              <div className="strand-card-header">
                <span>REVERSE STRAND</span>
                <button type="button" className="btn-copy-mini" onClick={() => navigator.clipboard.writeText(reverseSeq)}>
                  📋 Copy
                </button>
              </div>
              <div className="strand-output font-mono">{reverseSeq || 'No sequence'}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orf' && (
        <div className="tool-view-panel glass-card animate-in">
          <h3 className="panel-title">🔍 6-Frame Open Reading Frame (ORF) Scanner</h3>
          <p className="panel-desc">Detects START (ATG) to STOP codons across all 6 reading frames.</p>

          {orfResults.length === 0 ? (
            <div className="empty-tool-state">⚠️ No complete ORFs found. Try a longer coding region.</div>
          ) : (
            <div className="orf-list">
              {orfResults.map((orf, idx) => (
                <div key={idx} className="orf-card glass-card">
                  <div className="orf-header">
                    <span className="orf-frame-badge">{orf.frame}</span>
                    <span className="orf-pos">Bases {orf.start}..{orf.stop}</span>
                    <span className="orf-len-badge">⚡ {orf.length} Amino Acids</span>
                  </div>
                  <div className="orf-peptide-box font-mono">{orf.peptide}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'enzymes' && (
        <div className="tool-view-panel glass-card animate-in">
          <h3 className="panel-title">✂️ Restriction Endonuclease Cut Sites</h3>
          <p className="panel-desc">Maps recognition sites for standard restriction enzymes.</p>

          <div className="enzyme-results-grid">
            {ENZYMES.map((enz) => {
              const match = restrictionMatches.find((m) => m.enzyme.name === enz.name)
              const hasMatch = match && match.positions.length > 0
              return (
                <div key={enz.name} className={`enzyme-card ${hasMatch ? 'has-cut' : ''}`}>
                  <div className="enz-header">
                    <span className="enz-name">{enz.name}</span>
                    <span className={`enz-cut-badge ${hasMatch ? 'badge-cut' : 'badge-nocut'}`}>
                      {hasMatch ? `${match.positions.length} Cut Site(s)` : 'No Cut'}
                    </span>
                  </div>
                  <div className="enz-site font-mono">Site: <strong>{enz.site}</strong></div>
                  <div className="enz-desc">{enz.description}</div>
                  {hasMatch && (
                    <div className="enz-pos-list">Positions: {match.positions.join(', ')} bp</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'synthetic' && (
        <div className="tool-view-panel glass-card animate-in">
          <h3 className="panel-title">🧪 Synthetic Sequence Generator</h3>
          <p className="panel-desc">Generate synthetic DNA, RNA, or Protein with custom length & GC target.</p>

          <div className="synth-controls">
            <div className="synth-field">
              <label>Sequence Type:</label>
              <select value={synthType} onChange={(e: any) => setSynthType(e.target.value)}>
                <option value="dna">DNA (A, T, G, C)</option>
                <option value="rna">RNA (A, U, G, C)</option>
                <option value="protein">Protein Amino Acids</option>
              </select>
            </div>

            <div className="synth-field">
              <label>Length: {synthLength} units</label>
              <input type="range" min={15} max={300} value={synthLength} onChange={(e) => setSynthLength(Number(e.target.value))} />
            </div>

            {synthType !== 'protein' && (
              <div className="synth-field">
                <label>Target GC Content: {synthGc}%</label>
                <input type="range" min={10} max={90} value={synthGc} onChange={(e) => setSynthGc(Number(e.target.value))} />
              </div>
            )}

            <button type="button" className="btn-generate pulse-glow-btn" onClick={handleGenerateSynthetic}>
              ⚡ Generate Synthetic Sequence
            </button>
          </div>

          {generatedSeq && (
            <div className="generated-output-box glass-card animate-in">
              <div className="gen-header">
                <span>GENERATED SEQUENCE ({generatedSeq.length} units)</span>
                <div className="gen-actions">
                  <button type="button" className="btn-copy-mini" onClick={() => navigator.clipboard.writeText(generatedSeq)}>
                    📋 Copy
                  </button>
                  {synthType === 'dna' && (
                    <button type="button" className="btn-load-gen" onClick={() => onLoadSequence(generatedSeq)}>
                      🚀 Send to Builder
                    </button>
                  )}
                </div>
              </div>
              <div className="gen-seq font-mono">{generatedSeq}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mutagenesis' && (
        <div className="tool-view-panel glass-card animate-in">
          <h3 className="panel-title">🧬 Point Mutagenesis Simulator</h3>
          <p className="panel-desc">Mutate a single base position to test mutational impact.</p>

          <div className="mut-controls">
            <div className="mut-field">
              <label>Base Position (1 to {toolSeq.length}):</label>
              <input type="number" min={1} max={Math.max(1, toolSeq.length)} value={mutPos} onChange={(e) => setMutPos(Number(e.target.value))} />
            </div>

            <div className="mut-field">
              <label>New Base:</label>
              <select value={mutNewBase} onChange={(e) => setMutNewBase(e.target.value)}>
                <option value="A">Adenine (A)</option>
                <option value="T">Thymine (T)</option>
                <option value="G">Guanine (G)</option>
                <option value="C">Cytosine (C)</option>
              </select>
            </div>

            <button type="button" className="btn-simulate pulse-glow-btn" onClick={handleSimulateMutation}>
              ⚡ Mutate Base & Test
            </button>
          </div>

          {simulatedSeq && (
            <div className="simulated-output-box glass-card animate-in">
              <div className="sim-header">
                <span>MUTATED SEQUENCE OUTPUT</span>
                <button type="button" className="btn-load-sim" onClick={() => onLoadSequence(simulatedSeq)}>
                  🚀 Send to Builder
                </button>
              </div>
              <div className="sim-seq font-mono">{simulatedSeq}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
