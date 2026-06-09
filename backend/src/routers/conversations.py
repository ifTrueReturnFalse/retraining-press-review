from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine
from models.conversations import ConversationModel
from utils.security import get_current_user
from models.users import UserModel
from schemas.response import ApiResponse
from schemas.conversations import ConversationResponse, ConversationSummary

router = APIRouter(prefix="/conversations", tags=["Conversations"])


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


@router.get("", response_model=ApiResponse[list[ConversationSummary]])
def get_all_conversations(current_user: UserModel = Depends(get_current_user)):
    """
    Retrieves the list of all conversations belonging to the authenticated user.

    Args:
        current_user (UserModel): The user object retrieved from the JWT token.

    Returns:
        ApiResponse[list[ConversationSummary]]: A list of conversation summaries.
    """
    with Session(engine) as session:
        # Query all conversations where the user_id matches the current user's ID
        conversations = session.scalars(
            select(ConversationModel).where(
                ConversationModel.user_id == current_user.id
            )
        ).all()

        return ApiResponse(
            success=True,
            message="Conversations récupérées avec succès",
            data=[
                ConversationSummary.model_validate(conversation)
                for conversation in conversations
            ],
        )


@router.get("/{conversation_id}", response_model=ApiResponse[ConversationResponse])
def get_conversation(
    conversation_id: int, current_user: UserModel = Depends(get_current_user)
):
    """
    Retrieves a specific conversation by its ID, ensuring it belongs to the current user.

    Args:
        conversation_id (int): The unique identifier of the conversation.
        current_user (UserModel): The user object retrieved from the JWT token.

    Returns:
        ApiResponse[ConversationResponse]: The conversation data if found and authorized.

    Raises:
        HTTPException: 404 if not found, 403 if the user is not the owner.
    """
    with Session(engine) as session:
        # Fetch the conversation from the database using the ID
        conversation = session.scalars(
            select(ConversationModel).where(ConversationModel.id == conversation_id)
        ).first()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cette conversation n'existe pas",
            )

        # Security check: Ensure the conversation belongs to the authenticated user
        if conversation.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à accéder à ce contenu",
            )

        return ApiResponse(
            success=True,
            message="Conversation récupérée avec succès",
            data=ConversationResponse.model_validate(conversation),
        )
