from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import engine
from models.conversations import ConversationModel
from utils.security import get_current_user
from models.users import UserModel
from schemas.response import ApiResponse
from schemas.conversations import ConversationResponse

router = APIRouter(prefix="/conversations", tags=["Conversation", "Conversations"])


@router.post("", response_model=ApiResponse[ConversationResponse])
def create_conversation(current_user: UserModel = Depends(get_current_user)):
    """
    Creates a new conversation for the authenticated user.

    Args:
        current_user (UserModel): The user object retrieved from the JWT token.

    Returns:
        ApiResponse[ConversationResponse]: The created conversation details.
    """
    with Session(engine) as session:
        # Initialize a new conversation linked to the current user's ID
        conversation = ConversationModel(user_id=current_user.id)

        # Persist the new conversation to the database
        session.add(conversation)
        session.commit()

        # Refresh to retrieve database-generated fields (like ID or timestamps)
        session.refresh(conversation)

        # Return a standardized API response using the Pydantic schema for validation
        return ApiResponse(
            success=True,
            message="Conversation créée avec succès",
            data=ConversationResponse.model_validate(conversation),
        )
