from models.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, LargeBinary
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.conversations import ConversationModel


class UserModel(Base):
    """
    Represents a user in the system for authentication and profile management.

    Attributes:
        id (int): Unique identifier for the user (Primary Key).
        email (str): Unique email address used for login.
        hashed_password (bytes): The password stored as a secure binary hash.
        conversations (list[ConversationModel]): List of conversations associated with the user.
    """

    __tablename__ = "users"

    # Primary key with automatic increment
    id: Mapped[int] = mapped_column(primary_key=True)
    # Email is indexed for faster lookup during authentication
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    # Password stored as bytes to accommodate bcrypt/argon2 hash outputs
    hashed_password: Mapped[bytes] = mapped_column(LargeBinary)
    # One-to-many relationship: a user can have multiple conversation threads
    conversations: Mapped[list["ConversationModel"]] = relationship(
        back_populates="user"
    )
