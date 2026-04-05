"""Run: .venv/bin/python -m tests.test_triage_engine  (or pytest)"""

from app.services.triage_engine import LLM_FLAG_CHOICES, score_text


def test_triage_engine():
    for text, level in [
        ("I have chest pain", "critical"),
        ("my chest hurts and I have trouble breathing", "critical"),  # real LLM translation of the next line
        ("me duele mucho el pecho y me cuesta respirar", "critical"),
        ("I can’t breathe", "critical"),  # curly apostrophe from phone keyboards
        ("i cant breathe", "critical"),
        ("I want to kill myself", "critical"),
        ("thinking about suicide", "critical"),
        ("my throat is closing up", "critical"),
        ("I think I overdosed", "critical"),
        ("my wrist is fractured", "high"),
        ("burning when urinating", "medium"),  # was "high" via "burn"
        ("routine checkup, mild cough", "low"),  # was "medium" via "uti"
        ("I have a mild headache", "low"),
        ("Tengo DOLOR DE PECHO", "critical"),  # case-insensitive
        ("no puedo respirar", "critical"),
        ("j’ai une douleur à la poitrine", "critical"),
        ("não consigo respirar", "critical"),
        ("nao consigo respirar", "critical"),  # typed without accents
        ("मुझे सीने में दर्द है", "critical"),
        ("seene mein dard ho raha hai", "critical"),
        ("我胸口痛", "critical"),
        ("我想自殺", "critical"),
        ("اريد ان اموت", "critical"),  # without hamza
        ("tengo fiebre alta", "high"),
        ("dolor de garganta leve", "low"),
    ]:
        got = score_text(text).urgency_level
        assert got == level, f"{text!r}: expected {level}, got {got}"

    # The LLM backstop may only answer with these; each must actually trip a rule.
    for choice in LLM_FLAG_CHOICES:
        assert score_text(choice).red_flags, f"LLM choice {choice!r} matches no rule"


if __name__ == "__main__":
    test_triage_engine()
    print("ok")
