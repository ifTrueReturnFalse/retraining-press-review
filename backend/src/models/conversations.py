from models.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text, DateTime
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.users import UserModel


class ConversationModel(Base):
    """
    Represents a chat conversation session between a user and the AI assistant.

    Attributes:
        id (int): Unique identifier for the conversation.
        user_id (int): Foreign key linking to the owner of the conversation.
        history_json (str): JSON string containing the serialized message history (PydanticAI format).
        created_at (datetime): Timestamp of when the conversation was initiated.
        user (UserModel): Relationship object to the parent user.
    """

    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Link to the users table with an index for efficient filtering by user
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Stores the full message history as a JSON string to be parsed by ai_service.py
    history_json: Mapped[str] = mapped_column(Text, default="[]")

    # Automatically set the creation time using UTC
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Bidirectional relationship with UserModel
    user: Mapped["UserModel"] = relationship(back_populates="conversations")
