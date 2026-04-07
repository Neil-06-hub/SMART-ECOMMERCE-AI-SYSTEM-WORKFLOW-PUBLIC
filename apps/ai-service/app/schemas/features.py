from pydantic import BaseModel
from typing import Optional


class FeatureUpdateRequest(BaseModel):
    userId: str
    productId: str
    eventType: str  # view | click | add_to_cart | purchase | rec_click
    metadata: Optional[dict] = None


class FeatureUpdateResponse(BaseModel):
    success: bool
    message: str = ""


class ReloadModelRequest(BaseModel):
    version: Optional[str] = None  # None = load latest active from MongoDB


class ReloadModelResponse(BaseModel):
    success: bool
    version: str
    message: str = ""
