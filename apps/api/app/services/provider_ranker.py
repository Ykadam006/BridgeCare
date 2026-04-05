"""
Provider ranker: given a triage score, rank care options by fit.
"""

from app.services.triage_engine import TriageScore


def rank_care_options(score: TriageScore, insurance_status: str = "unknown") -> list[dict]:
    """Re-rank care options based on insurance status."""
    options = [dict(o) for o in score.care_options]

    # If uninsured, boost lower-cost options
    if insurance_status in ("uninsured", "unsure"):
        for opt in options:
            if "Telehealth" in opt["type"] or "pharmacy" in opt["type"].lower():
                opt["why_this_fits"] = "Low-cost option well suited for no insurance."
                opt["rank_boost"] = 1
            elif "ER" in opt["type"]:
                opt["why_this_fits"] = "Only if truly life-threatening — costs $500+ uninsured."
                opt["rank_boost"] = -1
            else:
                opt["rank_boost"] = 0
        options.sort(key=lambda o: -o.get("rank_boost", 0))

    # Assign rank numbers
    for i, opt in enumerate(options):
        opt["rank"] = i + 1
        if "why_this_fits" not in opt:
            opt["why_this_fits"] = _default_why(opt["type"], score.urgency_level)

    return options


def _default_why(care_type: str, urgency: str) -> str:
    mapping = {
        "Telehealth": "Fast, private, and often free with insurance. Good starting point.",
        "Urgent Care": "No appointment needed. Right-sized for your urgency level.",
        "Primary Care": "Best for ongoing care and a thorough exam.",
        "Pharmacy": "Walk-in, low-cost, handles common illnesses well.",
        "Emergency Room": "Reserve for life-threatening situations only.",
        "911": "Call immediately. Do not drive yourself.",
    }
    for key, why in mapping.items():
        if key.lower() in care_type.lower():
            return why
    return f"Recommended for {urgency} urgency symptoms."
