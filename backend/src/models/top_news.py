from models.base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Text, DateTime
from datetime import datetime, timezone


class TopNewsCache(Base):
    __tablename__ = "top_news_cache"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(Text)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
