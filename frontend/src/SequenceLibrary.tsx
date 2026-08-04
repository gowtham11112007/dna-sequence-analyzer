/**
 * SequenceLibrary Component
 * Pro-level library containing extensive curated real-world samples of
 * DNA, RNA, and Protein sequences across multiple biological categories.
 * Supports real-time search, category filtering, FASTA metadata, and 1-click loading.
 */

import React, { useState, useMemo } from 'react'

export type SequenceCategory = 'all' | 'dna' | 'rna' | 'protein'

export interface LibrarySample {
  id: string
  name: string
  category: 'dna' | 'rna' | 'protein'
  subCategory: string
  icon: string
  organism: string
  accession?: string
  description: string
  sequence: string
  /** For RNA or Protein, optional DNA coding equivalent for live analysis */
  dnaEquivalent?: string
  functionTags: string[]
  gcContent?: number
  length: number
}

export const SAMPLE_LIBRARY: LibrarySample[] = [
  // --- DNA SEQUENCES ---
  {
    id: 'dna-hbb-normal',
    name: 'Human Beta-Globin (Normal HBB)',
    category: 'dna',
    subCategory: 'Gene Coding Sequence',
    icon: '🩸',
    organism: 'Homo sapiens',
    accession: 'P68871',
    description: 'Normal human beta-globin gene subunit responsible for oxygen transport in red blood cells.',
    sequence: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTTGTCTACCCCTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGG',
    functionTags: ['Oxygen Transport', 'Hemoglobin', 'Wild Type'],
    gcContent: 53.6,
    length: 339,
  },
  {
    id: 'dna-hbb-sickle',
    name: 'Human Beta-Globin (Sickle Cell HbS)',
    category: 'dna',
    subCategory: 'Pathogenic Mutation',
    icon: '🧬',
    organism: 'Homo sapiens',
    accession: 'P68871 (Val6)',
    description: 'Pathogenic T->A single point mutation at codon 7 resulting in Glu->Val substitution.',
    sequence: 'ATGGTGCACCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTTGTCTACCCCTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGG',
    functionTags: ['Sickle Cell', 'Missense Mutation', 'Anemia'],
    gcContent: 53.6,
    length: 339,
  },
  {
    id: 'dna-ins-human',
    name: 'Human Preproinsulin Gene (INS)',
    category: 'dna',
    subCategory: 'Endocrine Hormone',
    icon: '💉',
    organism: 'Homo sapiens',
    accession: 'P01308',
    description: 'Human insulin coding region regulating glucose metabolism and cellular uptake.',
    sequence: 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGCGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG',
    functionTags: ['Insulin', 'Metabolism', 'Glucose Regulation'],
    gcContent: 64.3,
    length: 333,
  },
  {
    id: 'dna-tp53-core',
    name: 'Tumor Protein p53 (DNA-Binding Core)',
    category: 'dna',
    subCategory: 'Tumor Suppressor',
    icon: '🛡️',
    organism: 'Homo sapiens',
    accession: 'P04637',
    description: 'Guardian of the genome; core DNA-binding domain regulating cell cycle arrest and apoptosis.',
    sequence: 'ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAGCCCCCTCTGAGTCAGGAAACATTTTCAGACCTATGGAAACTACTTCCTGAAAACAACGTTCTGTCCCCCTTGCCGTCCCAAGCAATGGATGATTTGATGCTGTCCCCGGACGATATTGAACAATGGTTCACTGAAGACCCAGGTCCAGATGAAGCTCCCAGAATGCCAGAGGCTGCTCCCCCCGTGGCCCCTGCACCAGCAGCTCCTACACCGGCGGCCCCTGCACCAGCCCCCTCCTGGCCCCTGTCATCTTCTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACGTACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGTGGGTTGATTCCACACCCCCGCCCGGCACCCGCGTCCGCGCCATGGCCATCTACAAGCAGTCACAGCACATGACGGAGGTTGTGAGGCGCTGCCCCCACCATGAGCGCTGCTCAGATAGCGATGGTCTGGCCCCTCCTCAGCATCTTATCCGAGTGGAAGGAAATTTGCGTGTGGAGTATTTGGATGACAGAAACACTTTTCGACATAGTGTGGTGGTGCCCTATGAGCCGCCTGAGGTTGGCTCTGACTGTACCACCATCCACTACAACTACATGTGTAACAGTTCCTGCATGGGCGGCATGAACCGGAGGCCCATCCTCACCATCATCACACTGGAAGACTCCAGTGGTAATCTACTGGGACGGAACAGCTTTGAGGTGCGTGTTTGTGCCTGTCCTGGGAGAGACCGGCGCACAGAGGAAGAGAATCTCCGCAAGAAAGGGGAGCCTCACCACGAGCTGCCCCCAGGGAGCACTAAGCGAGCACTGCCCAACAACACCAGCTCCTCTCCCCAGCCAAAGAAGAAACCACTGGATGGAGAATATTTCACCCTTCAGATCCGTGGGCGTGAGCGCTTCGAGATGTTCCGAGAGCTGAATGAGGCCTTGGAACTCAAGGATGCCCAGGCTGGGAAGGAGCCAGGGGGGAGCAGGGCTCACTCCAGCCACCTGAAGTCCAAAAAGGGTCAGTCTACCTCCCGCCATAAAAAACTCATGTTCAAGACAGAAGGGCCTGACTCAGACTGA',
    functionTags: ['Cancer Biology', 'Apoptosis', 'Genome Stability'],
    gcContent: 56.1,
    length: 1182,
  },
  {
    id: 'dna-gfp',
    name: 'Green Fluorescent Protein (GFP)',
    category: 'dna',
    subCategory: 'Reporter Protein',
    icon: '🟢',
    organism: 'Aequorea victoria',
    accession: 'P42212',
    description: 'Bioluminescent jellyfish protein widely used as a molecular marker and live-cell imaging reporter.',
    sequence: 'ATGAGTAAAGGAGAAGAACTTTTCACTGGAGTTGTCCCAATTCTTGTTGAATTAGATGGTGATGTTAATGGGCACAAATTTTCTGTCAGTGGAGAGGGTGAAGGTGATGCAACATACGGAAAACTTACCCTTAAATTTATTTGCACTACTGGAAAACTACCTGTTCCATGGCCAACACTTGTCACTACTTTCACTTATGGTGTTCAATGCTTTTCAAGATACCCAGATCATATGAAACGGCATGACTTTTTCAAGAGTGCCATGCCCGAAGGTTATGTACAGGAAAGAACTATATTTTTCAAAGATGACGGGAACTACAAGACACGTGCTGAAGTCAAGTTTGAAGGTGATACCCTTGTTAATAGAATCGAGTTAAAAGGTATTGATTTTAAAGAAGATGGAAACATTCTTGGACACAAATTGGAATACAACTATAACTCACACAATGTATACATCATGGCAGACAAACAAAAGAATGGAATCAAAGTTAACTTCAAAATTAGACACAACATTGAAGATGGAAGCGTTCAACTAGCAGACCATTATCAACAAAATACTCCAATTGGCGATGGCCCTGTCCTTTTACCAGACAACCATTACCTSTCCACACAATCTGCCCTTTCGAAAGATCCCAACGAAAAGAGAGACCACATGGTCCTTCTTGAGTTTGTAACAGCTGCTGGGATTACACATGGCATGGATGAACTATACAAATAA',
    functionTags: ['Fluorescence', 'Biotechnology', 'Reporter'],
    gcContent: 41.8,
    length: 717,
  },
  {
    id: 'dna-cas9-target',
    name: 'CRISPR-Cas9 EMX1 Target Locus',
    category: 'dna',
    subCategory: 'Genome Editing Target',
    icon: '✂️',
    organism: 'Homo sapiens',
    accession: 'EMX1_exon1',
    description: 'Human EMX1 gene target sequence widely used in CRISPR-Cas9 genome editing benchmarks.',
    sequence: 'ATGTCACAGCCACCCAGCCTGGAGGCCGGCGAGTCCTACTCGTGGAGCATCGACCACCTGGCCTCGGGCGAGGTGGACGGCAAGAAGAAGAAGAGCGGCTACAGCGTGAGGGTGGGCCTGAGGAAGGTTGGTGGGACCTCCTACACCACAGTG',
    functionTags: ['CRISPR', 'Gene Editing', 'EMX1'],
    gcContent: 63.8,
    length: 153,
  },

  // --- RNA SEQUENCES ---
  {
    id: 'rna-mrna1273',
    name: 'COVID mRNA Vaccine Spike Fragment (mRNA-1273)',
    category: 'rna',
    subCategory: 'Synthetic mRNA Vaccine',
    icon: '💉',
    organism: 'SARS-CoV-2 (Codon Optimized)',
    accession: 'NC_045512.2',
    description: 'Codon-optimized mRNA vaccine sequence encoding the SARS-CoV-2 spike protein receptor-binding domain.',
    sequence: 'AUGUUUGUUUUUCUUGUUUUAUUGCCACUAGUCUCUAGUCAGUGUGUUAAUUUAACAACUAGAACUCAAUUACCCCCAGCAUACACUAAUUCUUUCACACGUGGUGUUUAUUACCCUGACAAAGUUUUCAGAUCCUCAGUUUUACAUUCAACUCAGGACUUGUUCUUACCUUUCUUUUCCAAUGUUACUUGGUUCCAUGCUAUACAUGUCUCUGGGACCAAUGGUACUAAGAGGUUUGAUAACCCUGUCCUACCAUUUAAUGAUGGUGUUUAUUUUGCUUCCACUGAGAAGUCAAACAUCAUCAGAGGCUGGAUUUUUGGUACCACUCUGGACUCAAAGACACAGUCCACUCAUUGA',
    dnaEquivalent: 'ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATTTAACAACTAGAACTCAATTACCCCCAGCATACACTAATTCTTTCACACGTGGTGTTTATTACCCTGACAAAGTTTTCAGATCCTCAGTTTTACATTCAACTCAGGACTTGTTCTTACCTTTCTTTTCCAATGTTACTTGGTTCCATGCTATACATGTCTCTGGGACCAATGGTACTAAGAGGTTTGATAACCCTGTCCTACCATTTAATGATGGTGTTTATTTTGCTTCCACTGAGAAGTCAAACATCATCAGAGGCTGGATTTTTGGTACCACTCTGGACTCAAAGACACAGTCCACTCATTGA',
    functionTags: ['Vaccine', 'Spike Protein', 'mRNA Technology'],
    gcContent: 41.2,
    length: 366,
  },
  {
    id: 'rna-trna-phe',
    name: 'Human Transfer RNA (tRNA-Phe)',
    category: 'rna',
    subCategory: 'Non-coding RNA',
    icon: '🧬',
    organism: 'Homo sapiens',
    accession: 'tRNA-Phe-GAA',
    description: 'Classic cloverleaf-folded transfer RNA delivering Phenylalanine during ribosomal translation.',
    sequence: 'GCCCGGAUAGCUCAGUCGGUAGAGCAGGGACUGAAAAUCCUCGUGUCGGCGGUUCGAUUCCGUCCUCGGGCACCA',
    dnaEquivalent: 'GCCCGGATAGCTCAGTCGGTAGAGCAGGGACTGAAAATCCTCGTGTCGGCGGTTCGATTCCGTCCTCGGGCACCA',
    functionTags: ['tRNA', 'Translation', 'Non-Coding RNA'],
    gcContent: 63.2,
    length: 75,
  },
  {
    id: 'rna-mir21',
    name: 'MicroRNA-21 Precursor (miR-21)',
    category: 'rna',
    subCategory: 'Oncomir MicroRNA',
    icon: '⚡',
    organism: 'Homo sapiens',
    accession: 'MI0000077',
    description: 'Key oncogenic microRNA precursor regulating cell proliferation and extracellular matrix remodeling.',
    sequence: 'UGUCGGGUAGCUUAUCAGACUGAUGUUGACUGUUGAAUCUCAUGGCAACACCAGUCGAUGGGCUGUCUGACA',
    dnaEquivalent: 'TGTCGGGTAGCTTATCAGACTGATGTTGACTGTTGAATCTCATGGCAACACCAGTCGATGGGCTGTCTGACA',
    functionTags: ['microRNA', 'Oncomir', 'Gene Regulation'],
    gcContent: 49.3,
    length: 72,
  },

  // --- PROTEIN SEQUENCES ---
  {
    id: 'protein-insulin-a',
    name: 'Human Insulin Chain A',
    category: 'protein',
    subCategory: 'Peptide Hormone',
    icon: '🩺',
    organism: 'Homo sapiens',
    accession: 'P01308',
    description: 'Chain A of mature human insulin containing 21 amino acids with internal disulfide loop.',
    sequence: 'GIVEQCCTSICSLYQLENYCN',
    dnaEquivalent: 'GGGATCGTGGAGCAGTGCTGCACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAAC',
    functionTags: ['Insulin A', 'Hormone', 'Disulfide Linkage'],
    length: 21,
  },
  {
    id: 'protein-oxytocin',
    name: 'Human Oxytocin Precursor',
    category: 'protein',
    subCategory: 'Neuropeptide',
    icon: '🧠',
    organism: 'Homo sapiens',
    accession: 'P01178',
    description: 'Neuropeptide hormone governing bonding, social recognition, and maternal behavior.',
    sequence: 'CYIQNCPLG',
    dnaEquivalent: 'TGCTACATCCAGAACTGCCCCCTGGGC',
    functionTags: ['Neuropeptide', 'Social Bonding', 'Hypothalamus'],
    length: 9,
  },
  {
    id: 'protein-ubiquitin',
    name: 'Human Ubiquitin',
    category: 'protein',
    subCategory: 'Proteasomal Tag',
    icon: '🏷️',
    organism: 'Homo sapiens',
    accession: 'P62988',
    description: 'Highly conserved 76-residue signaling protein targeting cellular proteins for proteasomal degradation.',
    sequence: 'MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG',
    dnaEquivalent: 'ATGCAGATCTTCGTGAAGACCCTGACCGGCAAGACCATCACCCTGGAGGTGGAGCCCAGCGACACCATCGAGAACGTGAAGGCCAAGATCCAGGACAAGGAGGGCATCCCCCCCGACCAGCAGCGCCTGATCTTCGCCGGCAAGCAGCTGGAGGACGGCCGCACCCTGAGCGACTACAACATCCAGAAGGAGAGCACCCTGCACCTGGTGCTGCGCCTGCGCGGCGGC',
    functionTags: ['Ubiquitination', 'Proteasome', 'Conserved'],
    length: 76,
  },
  {
    id: 'protein-myoglobin',
    name: 'Human Myoglobin (N-Terminal)',
    category: 'protein',
    subCategory: 'Heme Binding Protein',
    icon: '🫀',
    organism: 'Homo sapiens',
    accession: 'P02144',
    description: 'Oxygen-storing pigment in muscle tissue facilitating oxygen diffusion to mitochondria.',
    sequence: 'GLSDGEWQLVLNVWGKVEADIPGHGQEVLIRLFKGHPETLEKFDKFKHLKSEDEMKASEDLKKHGATVLTALGGIL',
    dnaEquivalent: 'GGCCTGAGCGACGGCGAGTGGCAGCTGGTGCTGAACGTGTGGGGCAAGGTGGAGGCCGACATCCCCGGCCACGGCCAGGAGGTGCTGATCAGGCTGTTCAAGGGCCACCCCGAGACCCTGGAGAAGTTCGACAAGTTCAAGCACCTGAAGAGCGAGGACGAGATGAAGGCCAGCGAGGACCTGAAGAAGCACGGCGCCACCGTGCTGACCGCCCTGGGCGGCATCCTG',
    functionTags: ['Myoglobin', 'Heme', 'Oxygen Storage'],
    length: 76,
  },
]

interface SequenceLibraryProps {
  onSelectSample: (dnaSequence: string, sampleInfo?: LibrarySample) => void
}

export default function SequenceLibrary({ onSelectSample }: SequenceLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<SequenceCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Filtered samples based on tab category and search term
  const filteredSamples = useMemo(() => {
    return SAMPLE_LIBRARY.filter((sample) => {
      const matchCategory =
        selectedCategory === 'all' || sample.category === selectedCategory

      const query = searchQuery.trim().toLowerCase()
      const matchSearch =
        !query ||
        sample.name.toLowerCase().includes(query) ||
        sample.description.toLowerCase().includes(query) ||
        sample.organism.toLowerCase().includes(query) ||
        (sample.accession && sample.accession.toLowerCase().includes(query)) ||
        sample.functionTags.some((tag) => tag.toLowerCase().includes(query)) ||
        sample.sequence.toLowerCase().includes(query)

      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchQuery])

  // Copy sequence to clipboard helper
  const handleCopySequence = (e: React.MouseEvent, sample: LibrarySample) => {
    e.stopPropagation()
    const textToCopy = sample.sequence
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(sample.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Handle Load Action
  const handleLoad = (sample: LibrarySample) => {
    const dnaToLoad = sample.dnaEquivalent || sample.sequence
    onSelectSample(dnaToLoad, sample)
  }

  return (
    <div className="sequence-library-container animate-in">
      {/* Header Banner */}
      <div className="library-header-card glass-card glow-hover-card">
        <div className="library-title-row">
          <div className="title-with-icon">
            <span className="library-header-icon">📚</span>
            <div>
              <h2>Pro Biological Sequence Library</h2>
              <p className="library-subtitle">
                Explore curated DNA, RNA, and Protein reference sequences from human, viral, and model organisms.
              </p>
            </div>
          </div>
          <div className="library-stats-pill">
            <span className="badge-count">{SAMPLE_LIBRARY.length}</span> Curated Presets
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="library-controls-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="library-search-input"
              placeholder="Search by gene name, UniProt ID, organism (e.g. HBB, Insulin, SARS-CoV-2)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="category-tabs">
            {(
              [
                { id: 'all', label: 'All Sequences', icon: '🌐' },
                { id: 'dna', label: 'DNA Genes', icon: '🧬' },
                { id: 'rna', label: 'RNA & Vaccines', icon: '🦠' },
                { id: 'protein', label: 'Proteins & Peptides', icon: '🩺' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`category-tab-btn ${
                  selectedCategory === tab.id ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Library Grid View */}
      <div className="library-grid">
        {filteredSamples.length === 0 ? (
          <div className="empty-library-state glass-card">
            <span className="empty-icon">🔎</span>
            <h3>No sequences matched your search query</h3>
            <p>Try searching for terms like "Insulin", "Sickle", "Vaccine", or "P68871"</p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className={`library-card glass-card category-border-${sample.category}`}
            >
              {/* Top Badge Row */}
              <div className="card-top-row">
                <span className={`badge-type badge-${sample.category}`}>
                  {sample.category.toUpperCase()}
                </span>
                <span className="badge-subcategory">{sample.subCategory}</span>
                {sample.accession && (
                  <span className="badge-accession" title="UniProt / GenBank ID">
                    {sample.accession}
                  </span>
                )}
              </div>

              {/* Title & Organism */}
              <div className="card-header-main">
                <span className="sample-icon">{sample.icon}</span>
                <div>
                  <h3 className="sample-title">{sample.name}</h3>
                  <div className="sample-organism">🌿 {sample.organism}</div>
                </div>
              </div>

              {/* Description */}
              <p className="sample-description">{sample.description}</p>

              {/* Sequence Snippet Preview Box */}
              <div className="sequence-preview-box">
                <div className="preview-label-row">
                  <span className="preview-tag">
                    {sample.category === 'protein'
                      ? 'PROTEIN AMINO ACIDS'
                      : sample.category === 'rna'
                      ? 'RNA TRANSCRIPT'
                      : 'DNA SEQUENCE'}
                  </span>
                  <span className="seq-len-tag">{sample.length} {sample.category === 'protein' ? 'AAs' : 'bases'}</span>
                </div>
                <div className="seq-mono-text font-mono">
                  {sample.sequence}
                </div>
              </div>

              {/* Functional Tags */}
              <div className="tags-row">
                {sample.functionTags.map((tag, idx) => (
                  <span key={idx} className="function-tag">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="card-actions-row">
                <button
                  type="button"
                  className="btn-card-load pulse-glow-btn"
                  onClick={() => handleLoad(sample)}
                >
                  ⚡ Load into Builder
                </button>
                <button
                  type="button"
                  className="btn-card-copy"
                  onClick={(e) => handleCopySequence(e, sample)}
                  title="Copy sequence to clipboard"
                >
                  {copiedId === sample.id ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
