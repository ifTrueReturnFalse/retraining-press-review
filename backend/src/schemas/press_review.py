from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PressReviewRequest(BaseModel):
    theme: str


class PressReviewResponse(BaseModel):
    id: int
    conversation_id: int
    theme: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
