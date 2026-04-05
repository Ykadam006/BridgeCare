"""
BridgeCare Triage Engine — deterministic rules.
AI never makes the urgency decision. It only explains it.
"""

import re
import unicodedata
from dataclasses import dataclass, field


RED_FLAGS_CRITICAL = [
    "chest pain", "chest pressure", "chest tightness", "crushing chest",
    "chest hurt", "chest is hurting", "pain in my chest", "pain in chest", "tight chest",
    "trouble breathing", "hard to breathe", "struggling to breathe", "can't catch my breath",
    "cant catch my breath", "gasping for air",
    "can't breathe", "cant breathe", "cannot breathe", "can not breathe", "difficulty breathing", "shortness of breath",
    "not breathing", "stopped breathing",
    "stroke", "facial droop", "arm weakness", "speech slurred", "slurred speech",
    "sudden severe headache", "worst headache of my life", "thunderclap headache",
    "sudden confusion", "loss of consciousness", "passed out", "fainted", "unresponsive",
    "seizure", "convulsion", "paralysis",
    "major bleeding", "uncontrolled bleeding", "spurting blood",
    "anaphylaxis", "severe allergic reaction", "epipen", "throat closing", "throat is closing", "tongue swelling",
    "suicidal", "suicide", "kill myself", "want to die", "self harm", "hurt myself", "end my life",
    "overdose",
]

RED_FLAGS_HIGH = [
    "fever over 103", "fever over 104", "very high fever", "high fever",
    "stiff neck", "light sensitivity with headache", "sensitivity to light",
    "blood in stool", "bloody stool", "vomiting blood", "coughing blood",
    "severe abdominal pain", "severe stomach pain",
    "sudden vision change", "sudden vision loss", "blurry vision suddenly",
    "rapid heart rate", "palpitations", "irregular heartbeat",
    "broken bone", "fracture", "suspected fracture",
    "burn", "burned", "scalded",
    "animal bite", "snake bite", "spider bite",
    "poisoning", "ingested something",
    "pregnant", "pregnancy", "miscarriage",
    "deep cut", "gaping wound",
]

RED_FLAGS_MEDIUM = [
    "fever", "temperature", "chills",
    "sore throat", "strep", "tonsil",
    "ear pain", "ear infection",
    "eye infection", "pink eye", "conjunctivitis",
    "urinary pain", "uti", "burning when urinating", "painful urination",
    "rash", "hives", "skin reaction",
    "persistent cough", "cough for", "coughing for days",
    "nausea", "vomiting", "diarrhea",
    "back pain", "lower back pain",
    "joint pain", "swollen joint",
    "anxiety", "panic attack", "panic",
    "depression", "mental health", "feeling hopeless",
    "insomnia", "can't sleep", "not sleeping",
    "extreme fatigue", "no energy", "exhausted",
    "weight loss",
]

# Non-English red flags (es, fr, pt, hi + Hinglish, zh, ar) — the app takes input in all of these.
# ponytail: hand-written phrase lists; have native-speaking clinicians review before real patients.
# triage.finalize also scores an LLM English translation and keeps the higher result as a backstop.
RED_FLAGS_CRITICAL += [
    # es
    "dolor de pecho", "dolor en el pecho", "duele el pecho", "cuesta respirar", "presión en el pecho", "opresión en el pecho",
    "no puedo respirar", "dificultad para respirar", "falta de aire", "me ahogo",
    "derrame cerebral", "infarto", "ataque al corazón", "convulsión", "me desmayé", "desmayo",
    "perdió el conocimiento", "inconsciente", "sangrado abundante", "hemorragia",
    "reacción alérgica grave", "se me cierra la garganta", "suicidio", "suicidarme",
    "quiero morir", "matarme", "hacerme daño", "sobredosis", "parálisis",
    # fr
    "douleur thoracique", "mal à la poitrine", "mal à respirer", "douleur à la poitrine", "douleur dans la poitrine", "oppression thoracique",
    "je ne peux pas respirer", "je n'arrive pas à respirer", "difficulté à respirer", "essoufflement",
    "avc", "crise cardiaque", "crise d'épilepsie", "évanoui", "perte de connaissance", "inconscient",
    "saignement abondant", "hémorragie", "réaction allergique grave", "gorge qui se ferme",
    "suicidaire", "envie de mourir", "me tuer", "me faire du mal", "surdose", "paralysie",
    # pt
    "dor no peito", "dói o peito", "doendo o peito", "pressão no peito", "aperto no peito", "não consigo respirar",
    "dificuldade para respirar", "falta de ar", "derrame", "ataque cardíaco", "convulsão",
    "desmaiei", "desmaio", "perdi a consciência", "sangramento intenso", "reação alérgica grave",
    "garganta fechando", "suicídio", "quero morrer", "me matar", "me machucar", "paralisia",
    # hi (Devanagari + Hinglish)
    "सीने में दर्द", "छाती में दर्द", "सांस नहीं", "साँस नहीं", "सांस लेने में तकलीफ",
    "सांस लेने में दिक्कत", "दिल का दौरा", "लकवा", "दौरा पड़ा", "बेहोश", "बहुत खून",
    "आत्महत्या", "मरना चाहता", "मरना चाहती", "खुद को मार", "ओवरडोज़", "गला बंद",
    "seene mein dard", "seene me dard", "chhati mein dard", "saans nahi", "sans nahi",
    "behosh", "atmahatya", "marna chahta", "marna chahti",
    # zh (simplified + traditional)
    "胸痛", "胸口痛", "胸口疼", "胸闷", "胸悶", "呼吸困难", "呼吸困難", "喘不过气", "喘不過氣",
    "不能呼吸", "无法呼吸", "無法呼吸", "中风", "中風", "心脏病发作", "心臟病發作", "抽搐",
    "癫痫发作", "昏倒", "晕倒", "暈倒", "昏迷", "失去知觉", "大出血", "流血不止", "严重过敏",
    "喉咙肿", "自杀", "自殺", "想死", "不想活", "伤害自己", "过量服药", "過量服藥", "瘫痪", "癱瘓",
    # ar
    "ألم في الصدر", "ضيق في التنفس", "صعوبة في التنفس", "لا أستطيع التنفس", "سكتة دماغية",
    "جلطة", "نوبة قلبية", "تشنج", "إغماء", "فقدت الوعي", "فاقد الوعي", "نزيف حاد", "نزيف شديد",
    "حساسية شديدة", "انتحار", "أريد أن أموت", "أقتل نفسي", "إيذاء نفسي", "جرعة زائدة", "شلل",
]

RED_FLAGS_HIGH += [
    # es
    "fiebre alta", "sangre en las heces", "vomitando sangre", "vómito con sangre", "tosiendo sangre",
    "dolor abdominal fuerte", "dolor de estómago fuerte", "cuello rígido", "rigidez de cuello",
    "fractura", "hueso roto", "quemadura", "mordedura", "embarazada", "aborto espontáneo",
    "envenenamiento", "corte profundo", "palpitaciones", "pérdida de visión",
    # fr
    "forte fièvre", "fièvre élevée", "sang dans les selles", "vomir du sang", "tousser du sang",
    "douleur abdominale intense", "nuque raide", "os cassé", "brûlure", "morsure", "enceinte",
    "fausse couche", "empoisonnement", "intoxication", "coupure profonde", "perte de vision",
    # pt
    "febre alta", "sangue nas fezes", "vomitando sangue", "tossindo sangue", "dor abdominal forte",
    "pescoço rígido", "fratura", "osso quebrado", "queimadura", "mordida", "grávida",
    "aborto espontâneo", "envenenamento", "palpitações", "perda de visão",
    # hi
    "तेज बुखार", "तेज़ बुखार", "खून की उल्टी", "मल में खून", "खांसी में खून", "पेट में तेज दर्द",
    "हड्डी टूट", "गर्भवती", "जहर", "गहरा घाव", "tez bukhar", "khoon ki ulti", "haddi toot",
    # zh
    "高烧", "高燒", "便血", "吐血", "咳血", "剧烈腹痛", "脖子僵硬", "骨折", "烧伤", "烫伤", "燒傷",
    "咬伤", "怀孕", "懷孕", "流产", "中毒", "心悸", "视力突然", "視力突然",
    # ar
    "حمى شديدة", "حرارة عالية", "دم في البراز", "تقيؤ دم", "استفراغ دم", "سعال دم",
    "ألم شديد في البطن", "تيبس الرقبة", "كسر", "حروق", "عضة", "حامل", "إجهاض", "تسمم", "جرح عميق",
    "خفقان",
]

# What the LLM backstop in triage.finalize may answer with. Every item is a phrase from the lists
# above, so the rules — not the model — turn the answer into a score.
LLM_FLAG_CHOICES = [
    "chest pain", "difficulty breathing", "stroke", "suicidal", "self harm", "overdose",
    "loss of consciousness", "seizure", "uncontrolled bleeding", "severe allergic reaction",
    "high fever", "vomiting blood", "coughing blood", "blood in stool", "severe abdominal pain",
    "stiff neck", "sudden vision loss", "suspected fracture", "pregnancy", "poisoning",
]

DURATION_MODIFIERS = [
    (["month", "months", "weeks", "week"], +15),
    (["5 days", "6 days", "4 days"], +10),
    (["3 days", "three days"], +7),
    (["2 days", "two days"], +5),
    (["yesterday", "since yesterday"], +3),
]

SEVERITY_MODIFIERS = [
    (["excruciating", "unbearable", "worst", "10/10", "10 out of 10"], +20),
    (["very bad", "really bad", "horrible", "terrible", "awful", "severe"], +12),
    (["bad", "quite bad", "significant", "8/10", "9/10"], +8),
    (["moderate", "medium", "5/10", "6/10", "7/10"], +4),
    (["mild", "slight", "little", "minor", "3/10", "4/10"], -5),
]


@dataclass
class TriageScore:
    score: int = 0
    urgency_level: str = "low"
    urgency_label: str = ""
    red_flags: list[str] = field(default_factory=list)
    care_options: list[dict] = field(default_factory=list)
    cost_estimate: str = ""
    follow_up_in: str = ""
    warning_signs: list[str] = field(default_factory=list)


def _fold(s: str) -> str:
    """Lowercase, strip accents/diacritics, straighten phone-keyboard apostrophes ("can’t")."""
    s = unicodedata.normalize("NFKD", s.lower().replace("\u2019", "'"))
    return "".join(c for c in s if not unicodedata.combining(c))


def _has(phrase: str, text: str) -> bool:
    phrase = _fold(phrase)
    if not phrase.isascii():
        return phrase in text  # zh/hi/ar: no reliable word boundaries, substring match
    # Whole words only (plus s/es/d/ed): "uti" must not hit "routine", "week" must not hit "weekend".
    return re.search(rf"\b{re.escape(phrase)}(?:s|es|d|ed)?\b", text) is not None


def score_text(text: str) -> TriageScore:
    low = _fold(text)
    result = TriageScore()
    found: list[str] = []

    for flag in RED_FLAGS_CRITICAL:
        if _has(flag, low):
            result.score = max(result.score, 90)
            found.append(flag)

    if result.score < 70:
        for flag in RED_FLAGS_HIGH:
            if _has(flag, low):
                result.score = max(result.score, 65)
                found.append(flag)

    if result.score < 40:
        for flag in RED_FLAGS_MEDIUM:
            if _has(flag, low):
                result.score = max(result.score, 30)
                found.append(flag)

    for keywords, delta in DURATION_MODIFIERS:
        if any(_has(k, low) for k in keywords):
            result.score = min(100, result.score + delta)
            break

    for keywords, delta in SEVERITY_MODIFIERS:
        if any(_has(k, low) for k in keywords):
            result.score = max(0, min(100, result.score + delta))
            break

    result.red_flags = list(dict.fromkeys(found))
    result.score = max(0, min(100, result.score))

    if result.score >= 85:
        result.urgency_level = "critical"
        result.urgency_label = "Go to ER or call 911 immediately"
        result.care_options = [
            {"type": "Emergency Room (ER)", "notes": "Life-threatening — do not drive yourself", "cost_range": "$500–$3,000+", "time_sensitivity": "Now"},
            {"type": "Call 911", "notes": "Request emergency services immediately", "cost_range": None, "time_sensitivity": "Now"},
        ]
        result.cost_estimate = "ER: $500–$3,000+ depending on insurance. Call your insurer after stabilization."
        result.follow_up_in = "after you receive emergency care"
        result.warning_signs = ["Any worsening at all — do not wait"]

    elif result.score >= 60:
        result.urgency_level = "high"
        result.urgency_label = "Urgent care today — don't wait"
        result.care_options = [
            {"type": "Urgent Care Center", "notes": "No appointment needed. Open evenings/weekends.", "cost_range": "$100–$200 uninsured", "time_sensitivity": "Today"},
            {"type": "Telehealth (same-day)", "notes": "Faster and cheaper for non-physical symptoms.", "cost_range": "$0–$75", "time_sensitivity": "Hours"},
            {"type": "Primary Care (same-day sick visit)", "notes": "Call and ask for same-day.", "cost_range": "$30–$100 insured", "time_sensitivity": "Today"},
        ]
        result.cost_estimate = "Urgent care: $100–$200 uninsured. Telehealth: $0–$75."
        result.follow_up_in = "24 hours"
        result.warning_signs = [
            "Symptoms rapidly worsen",
            "New symptoms appear (fever, confusion, chest pain)",
            "You feel significantly worse within hours",
        ]

    elif result.score >= 25:
        result.urgency_level = "medium"
        result.urgency_label = "Schedule a visit within 1–3 days"
        result.care_options = [
            {"type": "Primary Care Doctor", "notes": "Book a sick visit within 1–3 days.", "cost_range": "$30–$100 insured", "time_sensitivity": "1–3 days"},
            {"type": "Telehealth", "notes": "Often same-day or next-day.", "cost_range": "$0–$50", "time_sensitivity": "Same or next day"},
            {"type": "Pharmacy clinic", "notes": "Walk-in for common illnesses.", "cost_range": "$30–$80", "time_sensitivity": "Today, walk-in"},
        ]
        result.cost_estimate = "Doctor: $50–$250. Telehealth: $20–$75. Pharmacy clinic: $30–$100."
        result.follow_up_in = "3 days if not improving"
        result.warning_signs = [
            "Fever develops or rises above 102°F",
            "Symptoms significantly worsen",
            "New symptoms appear",
            "No improvement after 3 days",
        ]

    else:
        result.urgency_level = "low"
        result.urgency_label = "Self-care is likely OK"
        result.care_options = [
            {"type": "Rest and monitor at home", "notes": "Most mild symptoms resolve in 1–3 days.", "cost_range": "$0", "time_sensitivity": "At home now"},
            {"type": "OTC remedies", "notes": "Ibuprofen, acetaminophen, antihistamines as appropriate.", "cost_range": "$5–$20", "time_sensitivity": "Today"},
            {"type": "Telehealth if no improvement", "notes": "If symptoms worsen or persist beyond 5 days.", "cost_range": "$0–$50", "time_sensitivity": "If needed"},
        ]
        result.cost_estimate = "OTC meds: $5–$20. Telehealth if needed: $0–$50."
        result.follow_up_in = "5–7 days if not better"
        result.warning_signs = [
            "Fever over 101°F",
            "Symptoms last more than 7 days",
            "Symptoms suddenly worsen",
        ]

    return result
