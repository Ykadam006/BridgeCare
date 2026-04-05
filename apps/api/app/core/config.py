from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "BridgeCare API"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://bridgecare.vercel.app",
    ]

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    DATABASE_URL: str

    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-haiku-4-5"  # cheapest current Claude: $1 in / $5 out per 1M tokens
    ANTHROPIC_BUDGET_USD: float = 100.0  # Claude is skipped once this app's recorded spend reaches it

    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    GOOGLE_AI_KEY: Optional[str] = None
    GOOGLE_AI_MODEL: str = "gemini-3.5-flash-lite"  # free tier (Google may use free-tier prompts to improve products)

    NOMINATIM_USER_AGENT: str = "bridgecare-app/1.0"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
