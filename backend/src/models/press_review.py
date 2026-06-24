from models.base import Base
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.conversations import ConversationModel


class PressReviewModel(Base):
    """
    Represents a generated press review associated with a specific conversation.

    This model stores the details of a press review, including its theme,
    the generated content, and a link back to the conversation that
    triggered its creation.

    Attributes:
        id (int): Primary key, unique identifier for the press review.
        conversation_id (int): Foreign key linking to the `ConversationModel`
                               that initiated this press review.
        theme (str): The thematic subject of the press review (e.g., "économie", "sport").
        content (str): The full text content of the generated press review.
        created_at (datetime): Timestamp indicating when the press review was generated.
                               Automatically set upon creation.
        conversation (ConversationModel): SQLAlchemy relationship to the `ConversationModel`
                                          instance this press review belongs to.
    """

    __tablename__ = "press_reviews"

    # Primary key for the press review record.
    id: Mapped[int] = mapped_column(primary_key=True)
    # Foreign key to the conversations table.
    # Links this press review to the specific conversation that generated it.
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id"))
    # The theme or subject of the press review.
    theme: Mapped[str] = mapped_column(String)
    # The full text content of the generated press review.
    content: Mapped[str] = mapped_column(Text)
    # Timestamp indicating when the press review was created.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Bidirectional relationship with ConversationModel.
    # `back_populates="press_reviews"` links this side of the relationship
    # to the `press_reviews` attribute in `ConversationModel`.
    conversation: Mapped["ConversationModel"] = relationship(
        back_populates="press_reviews"
    )
