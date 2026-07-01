from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine
from models.conversations import ConversationModel
from utils.security import get_current_user
from models.users import UserModel
from models.press_review import PressReviewModel
from schemas.response import ApiResponse
from schemas.conversations import (
    ConversationResponse,
    ConversationSummary,
    MessageRequest,
)
from schemas.press_review import PressReviewRequest, PressReviewResponse
from services.ai_service import chat
from services.news_service import get_top_news_for_prompt
from services.press_review_service import get_urls_for_review, build_index
from utils.conversations import get_owned_conversation_or_40X
from typing import List
from exceptions import MistralAPIError

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
        conversation = get_owned_conversation_or_40X(
            session, conversation_id, current_user
        )

        return ApiResponse(
            success=True,
            message="Conversation récupérée avec succès",
            data=ConversationResponse.model_validate(conversation),
        )


@router.post(
    "/{conversation_id}/messages", response_model=ApiResponse[ConversationResponse]
)
async def post_message(
    conversation_id: int,
    body: MessageRequest,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Sends a message to the AI assistant within a specific conversation.

    Args:
        conversation_id (int): The ID of the conversation to continue.
        body (MessageRequest): The user's message content.
        current_user (UserModel): The authenticated user.

    Returns:
        ApiResponse[ConversationResponse]: The updated conversation with the AI's response.

    Raises:
        HTTPException: 404 if conversation doesn't exist, 403 if user is not the owner.
    """
    with Session(engine) as session:
        conversation = get_owned_conversation_or_40X(
            session, conversation_id, current_user
        )

        top_news = await get_top_news_for_prompt()

        try:
            # Fetch fresh news context and process the chat through the AI service
            response, new_history = await chat(
                body.message,
                conversation.history_json,
                top_news,
                conversation_id,
            )
        except MistralAPIError as error:
            print(error)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service de chat temporairement indisponible",
            ) from error

        # Update the conversation history in the database with the new serialized JSON
        conversation.history_json = new_history
        session.commit()
        session.refresh(conversation)

        return ApiResponse(
            success=True,
            message=response,
            data=ConversationResponse.model_validate(conversation),
        )


@router.post(
    "/{conversation_id}/press-review", response_model=ApiResponse[PressReviewResponse]
)
async def create_press_review(
    conversation_id: int,
    body: PressReviewRequest,
    current_user: UserModel = Depends(get_current_user),
):
    """
    Generates a press review based on a given theme within a specific conversation.

    This endpoint fetches relevant news articles, builds an index from their content,
    and then uses an LLM to generate a synthetic press review. The generated review
    is stored in the database and associated with the conversation.

    Args:
        conversation_id (int): The ID of the conversation for which to generate the press review.
        body (PressReviewRequest): The request body containing the theme for the press review.
        current_user (UserModel): The authenticated user, obtained via dependency injection.

    Returns:
        ApiResponse[PressReviewResponse]: A standardized API response containing
                                          the details of the newly created press review.

    Raises:
        HTTPException:
            - 404_NOT_FOUND: If the `conversation_id` does not correspond to an existing conversation.
            - 403_FORBIDDEN: If the authenticated user is not the owner of the conversation.
            - 404_NOT_FOUND: If no articles are found for the specified theme (raised by `get_urls_for_review`).
            - 417_EXPECTATION_FAILED: If the Language Model (LLM) fails to generate any content
                                      for the press review.
    """
    with Session(engine) as session:
        conversation = get_owned_conversation_or_40X(
            session, conversation_id, current_user
        )

        # Fetch URLs of relevant articles based on the conversation's context and the requested theme.
        urls = await get_urls_for_review(conversation, body.theme)

        try:
            # Build a LlamaIndex VectorStoreIndex from the scraped article content.
            index = await build_index(urls)

            # Initialize a query engine from the index and query the LLM for the press review content.
            query_engine = index.as_query_engine()
            response = query_engine.query(
                # LLM prompt instructing it to act as a press review editor.
                f"Tu es un rédacteur de revue de presse\
                                        Ton objectif est de rédiger une revue sur ce thème: {body.theme}\
                                            Soit synthétique, conserve l'essentiel de l'information, cite tes sources"
            )
        except Exception as error:
            print(error)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service de génération de revue de presse temporairement indisponible",
            ) from error

        content = str(response)

        if not content:
            raise HTTPException(
                status_code=status.HTTP_417_EXPECTATION_FAILED,
                detail="Aucune réponse du LLM",
            )

        press_review = PressReviewModel(
            conversation_id=conversation_id, theme=body.theme, content=content
        )

        session.add(press_review)
        session.commit()
        session.refresh(press_review)

        return ApiResponse(
            success=True,
            message="Revue de presse généré avec succès",
            data=PressReviewResponse.model_validate(press_review),
        )


@router.get(
    "/{conversation_id}/press-review",
    response_model=ApiResponse[List[PressReviewResponse]],
)
def get_press_reviews(
    conversation_id: int, current_user: UserModel = Depends(get_current_user)
):
    """
    Retrieves all press reviews associated with a specific conversation.

    Ensures that the conversation belongs to the currently authenticated user
    before returning the reviews.

    Args:
        conversation_id: The ID of the conversation to fetch reviews for.
        current_user: The authenticated user.

    Returns:
        An API response containing a list of press reviews, ordered by creation date.
    """
    with Session(engine) as session:
        get_owned_conversation_or_40X(session, conversation_id, current_user)
        reviews = session.scalars(
            select(PressReviewModel)
            .where(PressReviewModel.conversation_id == conversation_id)
            .order_by(PressReviewModel.created_at)
        ).all()

        return ApiResponse(
            success=True,
            message="Revues récupérés avec succès",
            data=[PressReviewResponse.model_validate(review) for review in reviews],
        )
