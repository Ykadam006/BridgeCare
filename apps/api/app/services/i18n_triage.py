"""Localized first questions and language hints for triage (no LLM)."""

from __future__ import annotations

FIRST_QUESTIONS_QUICK = {
    "en": "What's going on? Describe your main symptom — keep it as brief or as detailed as you'd like.",
    "es": "¿Qué te pasa? Describe tu síntoma principal — tan breve o detallado como quieras.",
    "zh": "怎么了？请描述你的主要症状——可长可短，按你的习惯来。",
    "fr": "Qu’est-ce qui ne va pas ? Décrivez votre principal symptôme — brièvement ou en détail, comme vous préférez.",
    "pt": "O que está acontecendo? Descreva seu principal sintoma — com a brevidade ou o detalhe que preferir.",
    "ar": "ما الذي يحدث؟ صِف عَرَضَك الرئيسي — باختصار أو بالتفصيل كما تشاء.",
    "hi": "क्या हो रहा है? अपना मुख्य लक्षण बताइए — संक्षेप में या विस्तार से, जैसा आप चाहें।",
}

FIRST_QUESTIONS_GUIDED = {
    "en": "Hey! Tell me what's going on today. Describe how you're feeling in your own words — no medical terms needed.",
    "es": "¡Hola! Cuéntame qué te pasa hoy. Describe cómo te sientes con tus propias palabras — no hace falta usar términos médicos.",
    "zh": "嗨！今天哪里不舒服？用你自己的话描述一下感受——不需要医学术语。",
    "fr": "Salut ! Qu’est-ce qui se passe aujourd’hui ? Décrivez ce que vous ressentez avec vos mots — pas besoin de jargon médical.",
    "pt": "Oi! O que está acontecendo hoje? Descreva como você se sente com suas próprias palavras — sem termos médicos.",
    "ar": "مرحبًا! ما الذي يحدث اليوم؟ صِف شعورك بكلماتك — لا حاجة لمصطلحات طبية.",
    "hi": "नमस्ते! आज क्या हो रहा है? अपने शब्दों में बताइए कैसा महसूस हो रहा है — चिकित्सा शब्दों की ज़रूरत नहीं।",
}

LANGUAGE_NAMES_EN = {
    "en": "English",
    "es": "Spanish",
    "zh": "Chinese (Simplified)",
    "fr": "French",
    "pt": "Portuguese",
    "ar": "Arabic",
    "hi": "Hindi",
    "other": "English",
}


def normalize_lang(code: str | None) -> str:
    if not code:
        return "en"
    c = code.lower().split("-")[0].strip()
    if c in FIRST_QUESTIONS_GUIDED:
        return c
    return "en"


def first_question(mode: str | None, lang_code: str | None) -> str:
    lang = normalize_lang(lang_code)
    mode = (mode or "guided").lower()
    if mode == "quick":
        return FIRST_QUESTIONS_QUICK.get(lang, FIRST_QUESTIONS_QUICK["en"])
    return FIRST_QUESTIONS_GUIDED.get(lang, FIRST_QUESTIONS_GUIDED["en"])


def language_name_for_prompt(lang_code: str | None) -> str:
    lang = normalize_lang(lang_code)
    return LANGUAGE_NAMES_EN.get(lang, "English")


def critical_visit_prep(lang_code: str | None, complaint: str) -> dict[str, list[str]]:
    """Localized strings for critical urgency visit prep (no LLM)."""
    lang = normalize_lang(lang_code)
    q = f"'{complaint}'"
    if lang == "es":
        return {
            "bring": ["Identificación", "Tarjeta de seguro si la tienes"],
            "say": [q],
            "ask": ["'¿Qué está pasando?'", "'¿Qué hago ahora?'"],
            "go_sooner_if": ["Si los síntomas empeoran — no esperes"],
        }
    return {
        "bring": ["ID", "Insurance card if available"],
        "say": [q],
        "ask": ["'What's happening?'", "'What do I do next?'"],
        "go_sooner_if": ["Symptoms worsen at all — do not wait"],
    }


def finalize_fallback_explanation(urgency_level: str, urgency_label: str, lang_code: str | None) -> str:
    lang = normalize_lang(lang_code)
    if lang == "es":
        return (
            f"Tus síntomas se evaluaron como urgencia {urgency_level}. {urgency_label}."
        )
    if lang == "zh":
        return f"你的症状已评估为 {urgency_level} 级别紧急程度。{urgency_label}。"
    if lang == "fr":
        return f"Vos symptômes ont été évalués comme urgence {urgency_level}. {urgency_label}."
    if lang == "pt":
        return f"Seus sintomas foram avaliados como urgência {urgency_level}. {urgency_label}."
    if lang == "ar":
        return f"تم تقييم أعراضك كدرجة إلحاح {urgency_level}. {urgency_label}."
    if lang == "hi":
        return f"आपके लक्षणों की तात्कालिकता {urgency_level} आंकी गई। {urgency_label}।"
    return f"Your symptoms have been assessed as {urgency_level} urgency. {urgency_label}."
