# 🧬 DNA Sequence Analyzer

A full-stack web application for DNA → mRNA → Protein prediction with mutation detection. Features an interactive button-based DNA sequence builder (no free-text input), protein identification against a local database with live UniProt enrichment, and comprehensive mutation analysis.

---

## 🏗 Architecture

```
DNA SEQUENCE/
├── backend/                   # Python FastAPI backend
│   ├── main.py                # API endpoints + bio pipeline
│   ├── reference_proteins.json # Known protein reference database
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React (Vite + TypeScript)
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Root component — state management
│   │   ├── SequenceBuilder.tsx # Button-based DNA builder
│   │   ├── ResultsDisplay.tsx  # Results rendering (mRNA, AA, protein, mutations)
│   │   ├── api.ts             # API service layer + types
│   │   ├── index.css          # Global styles — dark bio-tech theme
│   │   └── vite-env.d.ts      # TypeScript declarations
│   ├── index.html
│   ├── vite.config.ts         # Dev server + API proxy
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+ (tested on 3.13)
- Node.js 18+
- npm

### 1. Start the Backend

```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> The Vite dev server proxies `/analyze` and `/compare` requests to the backend on port 8000.

---

## 🔬 Features

### Interactive Sequence Builder
- **Four large A/T/G/C buttons** — click to append bases to the live sequence strip
- **Undo last base** and **Clear** controls
- **Running counter** of bases entered and codons formed
- **Collapsible reference sequence builder** for mutation comparison

### Analysis Pipeline (POST `/analyze`)
1. **Transcription**: DNA → mRNA using Biopython `Seq.transcribe()`
2. **Translation**: mRNA → protein starting at first AUG, stopping at stop codon
3. **Protein Identification**: match against local reference database (insulin chains, hemoglobin beta, oxytocin, ubiquitin)
4. **UniProt Enrichment**: live API call to fetch protein name, function, and organism

### Mutation Detection (POST `/compare`)
- **Pairwise alignment** using Biopython `PairwiseAligner`
- Classifies each difference as **Substitution**, **Insertion**, or **Deletion**
- For substitutions: classifies amino acid effect as **Silent**, **Missense**, **Nonsense**, or **Stop-loss**
- Flags **frameshift mutations** when indel length isn't a multiple of 3

### Results Display
- mRNA sequence grouped into color-coded **codon triplets**
- Amino acid chain with **full names** and **chemical class coloring** (nonpolar/polar/acidic/basic)
- Protein match with **confidence percentage** and **UniProt enrichment** data
- Mutation report with **per-mutation cards** showing type, position, base change, amino acid change, and plain-English effect description

### Responsive Design
- **Desktop**: side-by-side panels (builder + results)
- **Mobile**: stacked layout with large thumb-friendly buttons (72px+ touch targets)
- Pure CSS media queries — no user-agent sniffing

---

## 📡 API Reference

### POST `/analyze`
**Request:**
```json
{ "dna_sequence": "ATGGTGCATCTGACTCCTGAGGAG..." }
```

**Response:**
```json
{
  "dna_sequence": "...",
  "mrna_sequence": "...",
  "codons": ["AUG", "GUG", "CAU", ...],
  "protein_sequence": "MVHLT...",
  "amino_acids": [{ "letter": "M", "name": "Methionine", "chemical_class": "nonpolar", ... }],
  "protein_match": { "name": "...", "match_percentage": 95.5, "is_exact_match": false, ... },
  "uniprot_enrichment": { "protein_name": "...", "function_description": "...", "organism": "..." }
}
```

### POST `/compare`
**Request:**
```json
{
  "reference_dna": "ATGGTGCATCTGACTCCTGAGGAG...",
  "sample_dna":    "ATGGTGCACCTGACTCCTGTGGAG..."
}
```

**Response:**
```json
{
  "mutations": [
    {
      "type": "Substitution",
      "position": 20,
      "reference_base": "A",
      "sample_base": "T",
      "amino_acid_effect": "Missense",
      "effect": "Missense mutation — amino acid changed from Glutamic acid to Valine"
    }
  ],
  "mutation_count": 1
}
```

### Error Handling
All errors return descriptive JSON:
```json
{ "detail": "No start codon (AUG) found in mRNA sequence" }
```

---

## 🎨 Design Decisions

- **Button-based input** instead of textarea — reduces input errors and gives a more tactile, interactive experience
- **Dark bio-tech theme** with DNA-inspired base colors (A=cyan, T=pink, G=green, C=amber)
- **Glassmorphism cards** for a modern, premium feel
- **JetBrains Mono** for sequence data, **Inter** for UI text
- **Chemical class coloring** for amino acids follows standard biochemistry conventions
- **UniProt fallback**: if the API is unreachable, results still return without enrichment data

---

## 📦 Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Backend  | Python 3.13, FastAPI, Biopython |
| Frontend | React 19, TypeScript, Vite 8    |
| Styling  | Vanilla CSS (no framework)      |
| Bio APIs | UniProt REST API                |
