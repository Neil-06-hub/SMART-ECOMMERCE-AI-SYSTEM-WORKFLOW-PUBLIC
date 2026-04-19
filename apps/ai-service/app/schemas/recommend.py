from pydantic import BaseModel, Field
from typing import Optional


class RecommendFilters(BaseModel):
    excludeOos: bool = True
    minPrice: float = 0.0
    maxPrice: float = 999_000_000.0
    excludeIds: list[str] = Field(default_factory=list)


class RecommendRequest(BaseModel):
    userId: Optional[str] = None
    placement: str = Field(
        default="homepage",
        pattern="^(homepage|pdp|cart|search|email)$",
    )
    n: int = Field(default=12, ge=1, le=50)
    filters: RecommendFilters = Field(default_factory=RecommendFilters)
    preferences: list[str] = Field(default_factory=list)
    keywords: Optional[str] = None


class RecommendResponse(BaseModel):
    productIds: list[str]
    scores: list[float]
    model_version: str
    source: str = "model_lightfm"  # "model_lightfm" | "cold_start_cbf" | "fallback_popular"

