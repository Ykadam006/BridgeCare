from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.routes import triage, providers, coverage, followup, documents

setup_logging(settings.DEBUG)

app = FastAPI(title=settings.APP_NAME, version="0.1.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage.router)
app.include_router(providers.router)
app.include_router(coverage.router)
app.include_router(followup.router)
app.include_router(documents.router)


@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "status": "ok"}


@app.get("/api/health")
async def health():
    import httpx
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass
    return {
        "status": "ok",
        "ai_providers": {
            "ollama": ollama_ok,
            "anthropic": bool(settings.ANTHROPIC_API_KEY),
            "groq": bool(settings.GROQ_API_KEY),
            "google_ai": bool(settings.GOOGLE_AI_KEY),
        },
    }
