"""
DNA Sequence Analyzer — FastAPI Backend
========================================
Provides endpoints for DNA→mRNA→Protein analysis with mutation detection.
Uses Biopython for all biological sequence operations.
Supports local dev and Vercel serverless deployment.
"""

import json
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from Bio.Seq import Seq
from Bio.Align import PairwiseAligner
from Bio.Data.IUPACData import protein_letters_1to3

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="DNA Sequence Analyzer",
    description="DNA → mRNA → Protein analysis with mutation detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load reference protein database
# ---------------------------------------------------------------------------

REFERENCE_PROTEINS_PATH = Path(__file__).parent / "reference_proteins.json"

with open(REFERENCE_PROTEINS_PATH) as f:
    REFERENCE_PROTEINS: list[dict] = json.load(f)

# ---------------------------------------------------------------------------
# Amino acid metadata — full names and chemical classes
# ---------------------------------------------------------------------------

AMINO_ACID_CLASS = {
    "G": "nonpolar", "A": "nonpolar", "V": "nonpolar", "L": "nonpolar",
    "I": "nonpolar", "P": "nonpolar", "F": "nonpolar", "W": "nonpolar",
    "M": "nonpolar",
    "S": "polar", "T": "polar", "C": "polar", "Y": "polar",
    "N": "polar", "Q": "polar",
    "D": "acidic", "E": "acidic",
    "K": "basic", "R": "basic", "H": "basic",
}

AMINO_ACID_FULL_NAMES = {
    "A": "Alanine", "R": "Arginine", "N": "Asparagine", "D": "Aspartic acid",
    "C": "Cysteine", "E": "Glutamic acid", "Q": "Glutamine", "G": "Glycine",
    "H": "Histidine", "I": "Isoleucine", "L": "Leucine", "K": "Lysine",
    "M": "Methionine", "F": "Phenylalanine", "P": "Proline", "S": "Serine",
    "T": "Threonine", "W": "Tryptophan", "Y": "Tyrosine", "V": "Valine",
}

# ---------------------------------------------------------------------------
# Pydantic request/response models
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    dna_sequence: str

    @field_validator("dna_sequence")
    @classmethod
    def validate_dna(cls, v: str) -> str:
        v = v.upper().strip()
        if len(v) < 3:
            raise ValueError("Sequence must be at least 3 bases long")
        invalid = set(v) - {"A", "T", "G", "C"}
        if invalid:
            raise ValueError(f"Invalid characters in DNA sequence: {', '.join(sorted(invalid))}. Only A, T, G, C are allowed.")
        return v


class CompareRequest(BaseModel):
    reference_dna: str
    sample_dna: str

    @field_validator("reference_dna", "sample_dna")
    @classmethod
    def validate_dna(cls, v: str) -> str:
        v = v.upper().strip()
        if len(v) < 3:
            raise ValueError("Sequence must be at least 3 bases long")
        invalid = set(v) - {"A", "T", "G", "C"}
        if invalid:
            raise ValueError(f"Invalid characters in DNA sequence: {', '.join(sorted(invalid))}. Only A, T, G, C are allowed.")
        return v


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def transcribe_dna(dna: str) -> str:
    return str(Seq(dna).transcribe())


def translate_mrna(mrna: str) -> tuple[str, list[str]]:
    start_idx = mrna.find("AUG")
    if start_idx == -1:
        raise ValueError("No start codon (AUG) found in mRNA sequence")

    coding_mrna = mrna[start_idx:]
    codons = [coding_mrna[i:i+3] for i in range(0, len(coding_mrna), 3) if i+3 <= len(coding_mrna)]

    if not codons:
        raise ValueError("mRNA sequence too short for translation after start codon")

    coding_seq = Seq(coding_mrna)
    protein = str(coding_seq.translate(to_stop=True))

    if not protein:
        raise ValueError("Translation produced empty protein (stop codon immediately after start?)")

    used_codons = codons[:len(protein)]
    return protein, used_codons


def build_amino_acid_details(protein: str) -> list[dict]:
    return [
        {
            "letter": aa,
            "name": AMINO_ACID_FULL_NAMES.get(aa, aa),
            "three_letter": protein_letters_1to3.get(aa.upper(), aa).capitalize(),
            "chemical_class": AMINO_ACID_CLASS.get(aa, "unknown"),
            "position": i + 1,
        }
        for i, aa in enumerate(protein)
    ]


def find_protein_match(protein: str) -> dict:
    best_match = None
    best_score = 0.0

    for ref in REFERENCE_PROTEINS:
        ref_seq = ref["sequence"]
        matches = sum(1 for a, b in zip(protein, ref_seq) if a == b)
        max_len = max(len(protein), len(ref_seq))
        if max_len == 0:
            continue
        score = (matches / max_len) * 100

        if score > best_score:
            best_score = score
            best_match = {
                "name": ref["name"],
                "uniprot_accession": ref["uniprot_accession"],
                "description": ref["description"],
                "match_percentage": round(score, 2),
                "is_exact_match": protein == ref_seq,
                "reference_length": len(ref_seq),
                "query_length": len(protein),
            }

    return best_match or {
        "name": "Unknown protein",
        "uniprot_accession": None,
        "description": "No significant match found in reference database",
        "match_percentage": 0,
        "is_exact_match": False,
        "reference_length": 0,
        "query_length": len(protein),
    }


async def fetch_uniprot_data(accession: str) -> Optional[dict]:
    if not accession:
        return None

    url = f"https://rest.uniprot.org/uniprotkb/{accession}.json"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return None
            data = resp.json()

        protein_name = data.get("proteinDescription", {}).get("recommendedName", {}).get("fullName", {}).get("value", "Unknown")

        function_desc = "No function description available"
        for comment in data.get("comments", []):
            if comment.get("commentType") == "FUNCTION":
                texts = comment.get("texts", [])
                if texts:
                    function_desc = " ".join([t.get("value", "") for t in texts]).strip()
                break

        organism = data.get("organism", {}).get("scientificName", "Unknown organism")

        return {
            "protein_name": protein_name,
            "function_description": function_desc,
            "organism": organism,
            "uniprot_url": f"https://www.uniprot.org/uniprot/{accession}",
        }
    except Exception:
        return None


def detect_mutations(reference_dna: str, sample_dna: str) -> dict:
    aligner = PairwiseAligner()
    aligner.mode = "global"
    aligner.match_score = 2
    aligner.mismatch_score = -1
    aligner.open_gap_score = -2
    aligner.extend_gap_score = -0.5

    alignments = aligner.align(reference_dna, sample_dna)
    if not alignments:
        raise ValueError("Could not align sequences")

    best = alignments[0]
    ref_seq = reference_dna
    sam_seq = sample_dna

    ref_aligned_chars = []
    sam_aligned_chars = []

    ref_ranges = best.aligned[0]
    sam_ranges = best.aligned[1]

    ref_pos = 0
    sam_pos = 0

    for ref_range, sam_range in zip(ref_ranges, sam_ranges):
        ref_start, ref_end = ref_range
        sam_start, sam_end = sam_range

        while sam_pos < sam_start:
            ref_aligned_chars.append("-")
            sam_aligned_chars.append(sam_seq[sam_pos])
            sam_pos += 1

        while ref_pos < ref_start:
            ref_aligned_chars.append(ref_seq[ref_pos])
            sam_aligned_chars.append("-")
            ref_pos += 1

        ref_block = ref_seq[ref_start:ref_end]
        sam_block = sam_seq[sam_start:sam_end]

        for r, s in zip(ref_block, sam_block):
            ref_aligned_chars.append(r)
            sam_aligned_chars.append(s)

        ref_pos = ref_end
        sam_pos = sam_end

    while ref_pos < len(ref_seq):
        ref_aligned_chars.append(ref_seq[ref_pos])
        sam_aligned_chars.append("-")
        ref_pos += 1

    while sam_pos < len(sam_seq):
        ref_aligned_chars.append("-")
        sam_aligned_chars.append(sam_seq[sam_pos])
        sam_pos += 1

    aligned_ref = "".join(ref_aligned_chars)
    aligned_sample = "".join(sam_aligned_chars)

    mutations = []
    ref_base_pos = 0
    sam_base_pos = 0

    i = 0
    while i < len(aligned_ref):
        r = aligned_ref[i]
        s = aligned_sample[i]

        if r == s:
            if r != "-":
                ref_base_pos += 1
                sam_base_pos += 1
            i += 1
            continue

        if r == "-":
            ins_bases = []
            ins_start = sam_base_pos + 1
            while i < len(aligned_ref) and aligned_ref[i] == "-":
                ins_bases.append(aligned_sample[i])
                sam_base_pos += 1
                i += 1
            ins_seq = "".join(ins_bases)
            is_frameshift = len(ins_bases) % 3 != 0
            mutations.append({
                "type": "Insertion",
                "position": ref_base_pos,
                "reference_base": "-",
                "sample_base": ins_seq,
                "length": len(ins_bases),
                "is_frameshift": is_frameshift,
                "effect": f"Frameshift mutation — {len(ins_bases)} base(s) inserted" if is_frameshift else f"In-frame insertion of {len(ins_bases)} base(s)",
            })
            continue

        if s == "-":
            del_bases = []
            del_start = ref_base_pos + 1
            while i < len(aligned_ref) and aligned_sample[i] == "-":
                del_bases.append(aligned_ref[i])
                ref_base_pos += 1
                i += 1
            del_seq = "".join(del_bases)
            is_frameshift = len(del_bases) % 3 != 0
            mutations.append({
                "type": "Deletion",
                "position": del_start,
                "reference_base": del_seq,
                "sample_base": "-",
                "length": len(del_bases),
                "is_frameshift": is_frameshift,
                "effect": f"Frameshift mutation — {len(del_bases)} base(s) deleted" if is_frameshift else f"In-frame deletion of {len(del_bases)} base(s)",
            })
            continue

        ref_base_pos += 1
        sam_base_pos += 1

        codon_pos = (ref_base_pos - 1) // 3
        codon_start = codon_pos * 3

        effect = "Unknown"
        ref_aa = ""
        sam_aa = ""

        if codon_start + 3 <= len(reference_dna) and codon_start + 3 <= len(sample_dna):
            try:
                ref_codon = reference_dna[codon_start:codon_start+3]
                pos_in_codon = (ref_base_pos - 1) % 3
                sam_codon_list = list(ref_codon)
                sam_codon_list[pos_in_codon] = s
                sam_codon = "".join(sam_codon_list)

                ref_aa_seq = str(Seq(ref_codon).translate())
                sam_aa_seq = str(Seq(sam_codon).translate())
                ref_aa = ref_aa_seq
                sam_aa = sam_aa_seq

                if ref_aa == sam_aa:
                    effect = "Silent"
                    effect_desc = f"Silent mutation — codon changed from {ref_codon} to {sam_codon}, but amino acid remains {AMINO_ACID_FULL_NAMES.get(ref_aa, ref_aa)}"
                elif sam_aa == "*":
                    effect = "Nonsense"
                    effect_desc = f"Nonsense mutation — introduces a premature stop codon, truncating the protein"
                elif ref_aa == "*":
                    effect = "Stop-loss"
                    effect_desc = f"Stop-loss mutation — stop codon changed to {AMINO_ACID_FULL_NAMES.get(sam_aa, sam_aa)}, extending the protein"
                else:
                    effect = "Missense"
                    ref_name = AMINO_ACID_FULL_NAMES.get(ref_aa, ref_aa)
                    sam_name = AMINO_ACID_FULL_NAMES.get(sam_aa, sam_aa)
                    effect_desc = f"Missense mutation — amino acid changed from {ref_name} to {sam_name}, alters protein structure"
            except Exception:
                effect_desc = "Could not determine amino acid effect"
        else:
            effect_desc = "Substitution outside translatable region"

        mutations.append({
            "type": "Substitution",
            "position": ref_base_pos,
            "reference_base": r,
            "sample_base": s,
            "reference_amino_acid": AMINO_ACID_FULL_NAMES.get(ref_aa, ref_aa) if ref_aa else None,
            "sample_amino_acid": AMINO_ACID_FULL_NAMES.get(sam_aa, sam_aa) if sam_aa else None,
            "amino_acid_effect": effect,
            "effect": effect_desc,
        })
        i += 1

    ref_mrna = transcribe_dna(reference_dna)
    sam_mrna = transcribe_dna(sample_dna)

    try:
        ref_protein, _ = translate_mrna(ref_mrna)
    except ValueError:
        ref_protein = None

    try:
        sam_protein, _ = translate_mrna(sam_mrna)
    except ValueError:
        sam_protein = None

    return {
        "mutations": mutations,
        "mutation_count": len(mutations),
        "reference_protein": ref_protein,
        "sample_protein": sam_protein,
        "alignment_score": best.score,
    }


# ---------------------------------------------------------------------------
# API Endpoints (Supports both local /analyze and Vercel /api/analyze)
# ---------------------------------------------------------------------------

@app.get("/")
@app.get("/api")
async def root():
    return {"status": "ok", "message": "DNA Sequence Analyzer API"}


@app.post("/analyze")
@app.post("/api/analyze")
async def analyze_dna(request: AnalyzeRequest):
    dna = request.dna_sequence
    mrna = transcribe_dna(dna)

    try:
        protein, codons = translate_mrna(mrna)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    match = find_protein_match(protein)

    uniprot_data = None
    if match.get("uniprot_accession"):
        uniprot_data = await fetch_uniprot_data(match["uniprot_accession"])

    amino_acids = build_amino_acid_details(protein)

    return {
        "dna_sequence": dna,
        "mrna_sequence": mrna,
        "codons": codons,
        "protein_sequence": protein,
        "amino_acids": amino_acids,
        "protein_match": match,
        "uniprot_enrichment": uniprot_data,
    }


@app.post("/compare")
@app.post("/api/compare")
async def compare_sequences(request: CompareRequest):
    try:
        result = detect_mutations(request.reference_dna, request.sample_dna)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return result
