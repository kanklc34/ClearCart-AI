"""
category_grounding.py
─────────────────────
Deterministic category resolution with grounding confidence tiers.

Priority order (highest → lowest):
  1. Platform breadcrumb taxonomy signals in visible text (structured labels)
  2. Schema.org / JSON-LD structured metadata keywords extracted from text
  3. Canonical URL path segment classification
  4. Keyword scan of visible listing text (inferred fallback)

Confidence tiers:
  HIGH   – taxonomy anchor + structured metadata agree
  MEDIUM – partial agreement (one structured source, or URL + keywords)
  LOW    – inferred keyword fallback only

The resolved CategoryContext is a locked object. Market Validator MUST
consume it and MAY NOT override category anchors through its own heuristic
inference pass.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Literal

from .audit_shared import clamp_ratio, contains_any, fold_text


# ─────────────────────────────────────────────────────────────────────────────
# Category taxonomy
# ─────────────────────────────────────────────────────────────────────────────

CategoryName = Literal[
    "electronics",
    "robot_vacuums",
    "supplements",
    "cosmetics",
    "fashion",
    "home_goods",
    "accessories",
    "general",
]

CATEGORY_BASELINES: dict[str, dict] = {
    "electronics": {
        "segments": {"budget": 500, "mainstream": 3000, "premium": 15000},
        "floor_tl": 500,
        "ceiling_tl": 250000,
        "label": "Electronics",
    },
    "robot_vacuums": {
        "segments": {"budget": 2000, "mainstream": 8000, "premium": 25000},
        "floor_tl": 2000,
        "ceiling_tl": 75000,
        "label": "Robot Vacuums",
    },
    "supplements": {
        "segments": {"budget": 50, "mainstream": 400, "premium": 2000},
        "floor_tl": 50,
        "ceiling_tl": 10000,
        "label": "Supplements",
    },
    "cosmetics": {
        "segments": {"budget": 20, "mainstream": 250, "premium": 2500},
        "floor_tl": 20,
        "ceiling_tl": 20000,
        "label": "Cosmetics / Skincare",
    },
    "fashion": {
        "segments": {"budget": 50, "mainstream": 500, "premium": 10000},
        "floor_tl": 50,
        "ceiling_tl": 100000,
        "label": "Fashion",
    },
    "home_goods": {
        "segments": {"budget": 30, "mainstream": 1000, "premium": 30000},
        "floor_tl": 30,
        "ceiling_tl": 150000,
        "label": "Home Goods",
    },
    "accessories": {
        "segments": {"budget": 20, "mainstream": 300, "premium": 8000},
        "floor_tl": 20,
        "ceiling_tl": 50000,
        "label": "Accessories",
    },
    "general": {
        "segments": {"budget": 5, "mainstream": 500, "premium": 50000},
        "floor_tl": 5,
        "ceiling_tl": 1000000,
        "label": "General",
    },
}

# Source 1: Platform breadcrumb / taxonomy labels (highest priority)
_TAXONOMY_SIGNALS: list[tuple[str, list[str]]] = [
    ("cosmetics", [
        "kozmetik", "cilt bakimi", "makyaj", "parfumeri", "kisisel bakim",
        "skincare", "beauty", "makeup", "fragrance", "parfum kategorisi",
        "ruj kategorisi", "fondoten", "serum kategorisi",
    ]),
    ("supplements", [
        "takviye edici", "protein tozu", "vitamin mineral", "saglik urunleri",
        "besin takviyeleri", "spor beslenmesi", "supplement",
    ]),
    ("electronics", [
        "elektronik", "bilgisayar", "telefon ve aksesuar", "tv ve goruntu",
        "kamera ve foto", "ses sistemleri", "akilli ev",
    ]),
    ("robot_vacuums", [
        "robot supurge", "robot vacuum", "akilli supurge kategorisi",
    ]),
    ("fashion", [
        "giyim", "ayakkabi", "canta ve aksesuar", "moda", "tekstil",
    ]),
    ("home_goods", [
        "ev ve yasam", "mobilya", "mutfak", "beyaz esya", "ev dekorasyon",
    ]),
    ("accessories", [
        "saat", "takı", "gozluk", "kemer",
    ]),
]

# Source 2: Schema.org / JSON-LD category signals (metadata tier)
_SCHEMA_SIGNALS: list[tuple[str, list[str]]] = [
    ("cosmetics", [
        "health beauty", "personal care", "skin care", "beauty personal care",
        "beautycare",
    ]),
    ("supplements", [
        "dietary supplement", "health nutrition", "sports nutrition",
        "vitamins supplement",
    ]),
    ("electronics", [
        "consumer electronics", "cell phones accessories", "computers accessories",
        "cameras photo",
    ]),
    ("robot_vacuums", [
        "robotic vacuum", "robot mop", "home robot",
    ]),
    ("fashion", [
        "clothing shoes jewelry", "apparel", "fashion clothing",
    ]),
    ("home_goods", [
        "home kitchen", "home improvement", "tools home",
    ]),
    ("accessories", [
        "watches", "jewelry watches", "sunglasses",
    ]),
]

# Source 3: URL path segment patterns (canonical URL tier)
_URL_PATH_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("cosmetics",    re.compile(r"/(?:kozmetik|skincare|beauty|parfum|makyaj|cilt-bakimi|kosmetik)/", re.I)),
    ("supplements",  re.compile(r"/(?:takviye|supplement|protein|vitamin|nutri)/", re.I)),
    ("electronics",  re.compile(r"/(?:elektronik|telefon|laptop|bilgisayar|kamera|tablet|tv-ve|ses-sist)/", re.I)),
    ("robot_vacuums",re.compile(r"/(?:robot-supurge|robot-vacuum|akilli-supurge)/", re.I)),
    ("fashion",      re.compile(r"/(?:giyim|ayakkabi|moda|tekstil|clothing|fashion)/", re.I)),
    ("home_goods",   re.compile(r"/(?:ev-yasam|mobilya|mutfak|home-kitchen|ev-dekor)/", re.I)),
    ("accessories",  re.compile(r"/(?:saat|takil?ar|gozluk|kemer|jewelry|watches)/", re.I)),
]

# Source 4: Keyword scan of listing text (inferred fallback, lowest priority)
_TEXT_KEYWORD_SIGNALS: list[tuple[str, list[str]]] = [
    ("cosmetics", [
        "ruj", "krem", "serum", "maskara", "fondoten", "losyon", "parfum",
        "cilt", "makyaj", "toner", "misel", "temizleme", "nemlendirici",
        "spf", "retinol", "hyaluronik", "vitamin c serum",
    ]),
    ("supplements", [
        "protein", "magnezyum", "omega", "kolajen", "vitamin", "zinc",
        "kreatin", "bcaa", "glutamin", "takviye",
    ]),
    ("electronics", [
        "iphone", "telefon", "laptop", "notebook", "tv", "kamera", "tablet",
        "samsung", "xiaomi", "apple", "ram", "ssd", "islemci",
    ]),
    ("robot_vacuums", [
        "robot supurge", "roborock", "dreame", "viomi",
        "emis gucu pa", "haritalama supu",
    ]),
    ("fashion", [
        "ayakkabi", "canta", "elbise", "ceket", "mont", "giyim",
        "tshirt", "gomlek", "pantolon",
    ]),
    ("home_goods", [
        "buzdolabi", "derin dondurucu", "bulasik makinesi", "camasir makinesi",
        "air fryer", "fritoz", "tencere", "tabak", "mobilya",
    ]),
    ("accessories", [
        "saat", "gozluk", "kolye", "yuzuk", "bileklik",
    ]),
]


# ─────────────────────────────────────────────────────────────────────────────
# CategoryContext — the locked grounding object
# ─────────────────────────────────────────────────────────────────────────────

GroundingConfidence = Literal["HIGH", "MEDIUM", "LOW"]


@dataclass(frozen=True)
class CategoryContext:
    """Immutable, locked category context.  Downstream agents MUST consume this
    object as-is.  They MAY NOT re-infer the category from listing text."""

    category: CategoryName
    confidence: GroundingConfidence
    # Individual source votes (for transparency)
    taxonomy_vote: str | None
    schema_vote: str | None
    url_vote: str | None
    keyword_vote: str | None
    # Human-readable grounding path (for audit trail)
    grounding_sources: list[str] = field(default_factory=list)
    confidence_explanation: str = ""
    grounding_trace: dict = field(default_factory=dict)
    ambiguity_score: float = 0.0
    category_distribution: dict[str, int] = field(default_factory=dict)

    @property
    def baseline(self) -> dict:
        return CATEGORY_BASELINES.get(self.category, CATEGORY_BASELINES["general"])

    @property
    def floor_tl(self) -> float:
        return float(self.baseline["floor_tl"])

    @property
    def ceiling_tl(self) -> float:
        return float(self.baseline["ceiling_tl"])

    @property
    def label(self) -> str:
        return self.baseline["label"]

    @property
    def pricing_baseline_reliable(self) -> bool:
        return self.confidence in ("HIGH", "MEDIUM") and self.category != "general"

    def to_dict(self) -> dict:
        return {
            "category": self.category,
            "category_label": self.label,
            "confidence": self.confidence,
            "grounding_sources": self.grounding_sources,
            "taxonomy_vote": self.taxonomy_vote,
            "schema_vote": self.schema_vote,
            "url_vote": self.url_vote,
            "keyword_vote": self.keyword_vote,
            "pricing_baseline_reliable": self.pricing_baseline_reliable,
            "floor_tl": self.floor_tl,
            "ceiling_tl": self.ceiling_tl,
            "confidence_explanation": self.confidence_explanation,
            "grounding_trace": self.grounding_trace,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Public resolver
# ─────────────────────────────────────────────────────────────────────────────

def resolve_category_grounding(
    *,
    product_text: str,
    url_path: str = "",
    html_content: str = "",
) -> CategoryContext:
    folded = fold_text(product_text)
    path = url_path.casefold()

    # 1. Structured signals from HTML (Schema.org / JSON-LD / Meta)
    html_signals = ""
    if html_content:
        json_ld = " ".join(re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html_content, re.DOTALL))
        meta_tags = " ".join(re.findall(r'<meta\b[^>]*content=["\']([^"\']+)["\'][^>]*>', html_content))
        html_signals = (json_ld + " " + meta_tags).casefold()

    # ── Weighted Ensemble Voting ──────────────────────────────────────────
    votes: dict[str, int] = {cat: 0 for cat in CATEGORY_BASELINES.keys()}
    
    t_cat = _vote(_TAXONOMY_SIGNALS, folded)
    if t_cat: votes[t_cat] += 5
    
    s_cat = _vote(_SCHEMA_SIGNALS, html_signals if html_signals else folded)
    if s_cat: votes[s_cat] += 4
    
    u_cat = _url_vote(path)
    if u_cat: votes[u_cat] += 3
    
    k_cat = _vote(_TEXT_KEYWORD_SIGNALS, folded)
    if k_cat: votes[k_cat] += 1

    sorted_votes = sorted([(c, v) for c, v in votes.items() if v > 0], key=lambda x: x[1], reverse=True)
    
    if not sorted_votes:
        category = "general"
        confidence = "LOW"
        sources = ["no_signal"]
        ambiguity = 0.0
        explanation = "Low confidence: No category signals detected."
    else:
        winner_cat, winner_score = sorted_votes[0]
        runner_up_score = sorted_votes[1][1] if len(sorted_votes) > 1 else 0
        ambiguity = clamp_ratio(runner_up_score / winner_score) if winner_score > 0 else 1.0
        
        category = winner_cat
        sources = []
        if t_cat == category: sources.append("platform_taxonomy")
        if s_cat == category: sources.append("schema_metadata")
        if u_cat == category: sources.append("url_path")
        if k_cat == category: sources.append("keyword_inference")
        
        if winner_score >= 8 and ambiguity < 0.4:
            confidence = "HIGH"
        elif winner_score >= 4:
            confidence = "MEDIUM"
        else:
            confidence = "LOW"
            
        explanation = f"{confidence} confidence ({winner_score}pts) grounded via {', '.join(sources)}."
        if ambiguity > 0.6:
            explanation += f" Note: High ambiguity detected (Runner up score: {runner_up_score})."

    trace = {
        "breadcrumb_category": t_cat,
        "schema_org_category": s_cat,
        "canonical_url_taxonomy": u_cat,
        "attribute_derived_category": k_cat,
        "voting_scores": votes,
        "ambiguity_score": ambiguity,
    }

    return CategoryContext(
        category=category,
        confidence=confidence,
        taxonomy_vote=t_cat,
        schema_vote=s_cat,
        url_vote=u_cat,
        keyword_vote=k_cat,
        grounding_sources=sources,
        confidence_explanation=explanation,
        grounding_trace=trace,
        ambiguity_score=ambiguity,
        category_distribution=votes,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _vote(
    signals: list[tuple[str, list[str]]],
    folded: str,
) -> str | None:
    """Return the first category whose keywords appear in folded text, or None."""
    for category, keywords in signals:
        if contains_any(folded, keywords):
            return category
    return None


def _url_vote(path: str) -> str | None:
    """Return the first category whose URL pattern matches the path, or None."""
    for category, pattern in _URL_PATH_PATTERNS:
        if pattern.search(path):
            return category
    return None
