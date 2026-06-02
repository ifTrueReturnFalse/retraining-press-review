from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models.users import UserModel
from schemas.response import ApiResponse
from schemas.auth import AuthResponse
from utils.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.post("/login", response_model=ApiResponse[AuthResponse])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticates a user and returns a JWT access token.

    Args:
        form_data (OAuth2PasswordRequestForm): The OAuth2 compatible form containing username (email) and password.

    Raises:
        HTTPException: 401 Unauthorized if the email or password is incorrect.

    Returns:
        dict: A dictionary containing the 'access_token' and 'token_type'.
    """
    with Session(engine) as session:
        query = select(UserModel).where(UserModel.email == form_data.username)
        user = session.scalars(query).first()

        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(data={"sub": user.email})

        payload = {
            "access_token": token,
            "token_type": "bearer",
        }

        return ApiResponse(
            success=True, message="Utilisateur connecté avec succès", data=payload
        )
