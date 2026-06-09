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
    with Session(engine) as session:
        conversation = ConversationModel(user_id=current_user.id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        return ApiResponse(
            success=True,
            message="Conversation créée avec succès",
            data=ConversationResponse.model_validate(conversation),
        )
