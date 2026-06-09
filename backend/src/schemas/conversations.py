from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    history_json: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(BaseModel):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
