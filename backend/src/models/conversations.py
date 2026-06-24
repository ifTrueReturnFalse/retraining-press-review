from models.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text, DateTime
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.users import UserModel
    from models.press_review import PressReviewModel


class ConversationModel(Base):
    """
    Represents a chat conversation session between a user and the AI assistant.

    This model stores the state and history of an ongoing conversation,
    including messages exchanged, associated user, and any articles
    referenced during the session for context.

    Attributes:
        id (int): Primary key, unique identifier for the conversation.
        user_id (int): Foreign key linking to the `UserModel` who owns this conversation.
        history_json (str): A JSON string storing the serialized message history
                            in a format compatible with `pydantic_ai.messages.ModelMessagesTypeAdapter`.
                            Defaults to an empty JSON array `[]`.
        created_at (datetime): Timestamp (UTC) indicating when the conversation was initiated.
                               Automatically set upon creation.
        loaded_articles (str): A JSON string storing a list of URLs of articles
                               that have been loaded or referenced within this conversation.
                               Defaults to an empty JSON array `[]`.
        user (UserModel): SQLAlchemy relationship to the `UserModel` instance that owns this conversation.
        press_reviews (list[PressReviewModel]): SQLAlchemy relationship to a list of `PressReviewModel`
                                                instances generated from this conversation.
    """

    __tablename__ = "conversations"

    # Primary key for the conversation record
    id: Mapped[int] = mapped_column(primary_key=True)

    # Link to the users table with an index for efficient filtering by user.
    # This ensures that fetching all conversations for a specific user is performant.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Stores the full message history as a JSON string to be parsed by ai_service.py.
    # This field is designed to hold the serialized conversation history in a format
    # understood by `pydantic_ai.messages.ModelMessagesTypeAdapter`, allowing the AI service
    # to reconstruct and continue the conversation context.
    history_json: Mapped[str] = mapped_column(Text, default="[]")

    # Automatically set the creation time using UTC.
    # Uses a lambda to ensure the timestamp is generated at the moment of insertion.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    # Timestamp indicating when the conversation record was created.
    # The `default` uses a lambda function `datetime.now(timezone.utc)`
    # to ensure the timestamp is generated at the time of insertion into the database
    # and is stored in UTC for consistency.

    # Stores articles URL to provide context for the press review.
    loaded_articles: Mapped[str] = mapped_column(Text, default="[]")
    # A JSON string storing a list of URLs of articles that have been
    # loaded or referenced within this conversation. This allows the system
    # to keep track of external content used as context for generating
    # press reviews or AI responses. Defaults to an empty JSON array `[]`.

    # Bidirectional relationship with UserModel.
    user: Mapped["UserModel"] = relationship(back_populates="conversations")

    press_reviews: Mapped[list["PressReviewModel"]] = relationship(
        back_populates="conversation"
    )
    # One-to-many relationship with `PressReviewModel`.
    # This represents all press reviews generated as part of this conversation.
    # `back_populates="conversation"` links this side of the relationship
    # to the `conversation` attribute in `PressReviewModel`.
