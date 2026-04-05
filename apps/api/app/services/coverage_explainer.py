"""
Coverage explanation service.
Generates plain-language insurance guidance based on insurance status and age.
"""

from app.services.llm_service import chat


COVERAGE_CONTENT = {
    "parent-plan": {
        "title": "On a parent's plan (under 26)",
        "applicable_if": "age_range in ['18-24', '13-17']",
        "summary": "You can stay on your parent's health insurance until your 26th birthday — even if you're not in school, not living at home, or married.",
        "details": [
            "Works wherever your parent's plan is accepted (check if it's HMO or PPO).",
            "Uses your parent's deductible — check how much has been met this year.",
            "Telehealth is usually covered at $0–$30 copay.",
            "Show your insurance card at any in-network provider.",
        ],
        "action": "Use your parent's insurance card at your next visit.",
    },
    "student-plan": {
        "title": "Student health plan",
        "applicable_if": "age_range in ['18-24']",
        "summary": "If you're enrolled at a college or university, you likely have access to a student health plan — sometimes included in tuition fees.",
        "details": [
            "Campus clinics are often free or very low-cost with a student plan.",
            "Telehealth and mental health services often included.",
            "Check your student health portal — you may already be enrolled.",
            "Can often waive the student plan if you have other coverage.",
        ],
        "action": "Log into your student health portal or visit the campus health center.",
    },
    "marketplace": {
        "title": "Marketplace / ACA plan",
        "applicable_if": "True",
        "summary": "You can buy a health plan on Healthcare.gov. Subsidies are available based on income — many people pay $0/month.",
        "details": [
            "Open enrollment: Nov 1 – Jan 15. Special enrollment if you lost coverage.",
            "Medicaid may be available if your income is low.",
            "All ACA plans cover preventive care at no cost.",
            "Use healthcare.gov to compare plans and check subsidy eligibility.",
        ],
        "action": "Visit healthcare.gov to find your options.",
    },
    "uninsured": {
        "title": "No insurance",
        "applicable_if": "insurance_status == 'uninsured'",
        "summary": "You still have real options. Community health centers charge based on income — many visits cost $20–$40.",
        "details": [
            "Federally Qualified Health Centers (FQHCs) serve everyone, regardless of ability to pay.",
            "Telehealth like Plume, Teladoc can be $0–$75 out of pocket.",
            "Many pharmacies offer $4 generics for common medications.",
            "Urgent care is much cheaper than an ER for non-emergencies.",
        ],
        "action": "Find a community health center at findahealthcenter.hrsa.gov",
    },
    "medicaid": {
        "title": "Medicaid coverage",
        "applicable_if": "insurance_status == 'medicaid'",
        "summary": "Medicaid provides comprehensive coverage at very low or no cost. Most services have $0–$3 copays.",
        "details": [
            "Covers doctor visits, urgent care, ER, prescriptions, mental health.",
            "Always check that your provider accepts Medicaid before visiting.",
            "Telehealth is covered by most state Medicaid programs.",
        ],
        "action": "Show your Medicaid card at any participating provider.",
    },
}

GLOSSARY = [
    {"term": "Deductible", "definition": "The amount you pay before insurance starts. Example: $500 deductible = you pay the first $500/year."},
    {"term": "Copay", "definition": "A fixed amount per visit. Example: $30 copay = you pay $30 every time you see a doctor."},
    {"term": "Coinsurance", "definition": "After your deductible, you split costs. 20% coinsurance = you pay 20%, insurance pays 80%."},
    {"term": "Out-of-pocket max", "definition": "The most you'll pay in a year. After hitting this, insurance covers 100%."},
    {"term": "In-network", "definition": "Providers your insurance has negotiated rates with — always cheaper than out-of-network."},
    {"term": "Prior authorization", "definition": "Some services need insurance pre-approval. Your doctor usually handles this."},
    {"term": "Premium", "definition": "Your monthly insurance payment — separate from what you pay at visits."},
]


def get_coverage_explanation(insurance_status: str, age_range: str = "") -> dict:
    applicable_paths = []

    if insurance_status == "parent-plan" or (age_range in ("18-24", "13-17") and insurance_status not in ("employer", "marketplace", "medicaid")):
        applicable_paths.append({**COVERAGE_CONTENT["parent-plan"], "applicable": True})

    if age_range in ("18-24",):
        applicable_paths.append({**COVERAGE_CONTENT["student-plan"], "applicable": True})

    if insurance_status in ("uninsured", "unsure"):
        applicable_paths.append({**COVERAGE_CONTENT["uninsured"], "applicable": True})
        applicable_paths.append({**COVERAGE_CONTENT["marketplace"], "applicable": False})
    elif insurance_status == "medicaid":
        applicable_paths.append({**COVERAGE_CONTENT["medicaid"], "applicable": True})
    else:
        applicable_paths.append({**COVERAGE_CONTENT["marketplace"], "applicable": False})

    # Deduplicate
    seen = set()
    unique_paths = []
    for p in applicable_paths:
        if p["title"] not in seen:
            seen.add(p["title"])
            unique_paths.append(p)

    summary = _summary_for_status(insurance_status, age_range)

    return {
        "summary": summary,
        "path": insurance_status,
        "details": unique_paths,
        "glossary": GLOSSARY,
    }


def _summary_for_status(status: str, age_range: str) -> str:
    if status == "parent-plan":
        return "You're likely covered under a parent's plan. Use your insurance card at any in-network provider."
    elif status == "student-plan":
        return "Check your student health portal first — campus care is often free or very low-cost."
    elif status == "uninsured":
        return "You're uninsured, but you have options. Community health centers and telehealth can keep costs low."
    elif status == "medicaid":
        return "Your Medicaid coverage is comprehensive. Most visits cost very little or nothing."
    elif status == "marketplace":
        return "You have a marketplace plan. Check your deductible status and use in-network providers."
    else:
        return "Here are your coverage options based on your situation."
