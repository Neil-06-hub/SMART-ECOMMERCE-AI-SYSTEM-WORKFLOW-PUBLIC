from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/smart-ecommerce"
    MONGODB_DB_NAME: str = "smart-ecommerce"

    # Cloudflare R2 (S3-compatible)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_BUCKET: str = "models"

    # Internal auth for /internal/* endpoints
    INTERNAL_SECRET: str = "super-secret-key"

    # Self-reference (for GitHub Actions hot-reload trigger)
    FASTAPI_URL: str = "http://localhost:8000"

    # Redis (optional — caching at Express.js layer, but FastAPI can also read)
    REDIS_URL: Optional[str] = None

    # Placement config: alpha weight for hybrid scoring
    ALPHA_HOMEPAGE: float = 0.7
    ALPHA_PDP: float = 0.3
    ALPHA_CART: float = 0.5
    ALPHA_ANONYMOUS: float = 0.0

    # N recommendations per placement
    N_HOMEPAGE: int = 12
    N_PDP: int = 8
    N_CART: int = 6

    # ML thresholds
    PRECISION_THRESHOLD: float = 0.30
    RECALL_THRESHOLD: float = 0.20

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()

# Placement → (alpha, n) lookup
PLACEMENT_CONFIG: dict = {
    "homepage": {"alpha": settings.ALPHA_HOMEPAGE, "n": settings.N_HOMEPAGE},
    "pdp":      {"alpha": settings.ALPHA_PDP,      "n": settings.N_PDP},
    "cart":     {"alpha": settings.ALPHA_CART,      "n": settings.N_CART},
}

