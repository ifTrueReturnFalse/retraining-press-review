from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.conversations import ConversationModel
from models.users import UserModel


def get_owned_conversation_or_40X(
    session: Session, conversation_id: int, current_user: UserModel
) -> ConversationModel:
    """
    Retrieves a conversation by ID and verifies it belongs to the current user.

    Args:
        session (Session): The active SQLAlchemy session.
        conversation_id (int): The ID of the conversation to retrieve.
        current_user (UserModel): The authenticated user.

    Returns:
        ConversationModel: The conversation, if found and owned by the user.

    Raises:
        HTTPException:
            - 404_NOT_FOUND: If the conversation does not exist.
            - 403_FORBIDDEN: If the user is not the owner.
    """
    conversation = session.scalars(
        select(ConversationModel).where(ConversationModel.id == conversation_id)
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation introuvable"
        )

    if conversation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès interdit",
        )

    return conversation
