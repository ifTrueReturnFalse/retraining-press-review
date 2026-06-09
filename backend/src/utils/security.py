import bcrypt
import jwt
from config import settings
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models.users import UserModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from database import engine

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> bytes:
    """
    Generates a unique salt and hashes the provided password using bcrypt.

    Args:
        password (str): The plain text password to hash.

    Returns:
        bytes: The hashed password.
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    """
    Verifies a plain text password against a hashed password.

    Args:
        plain_password (str): The plain text password to check.
        hashed_password (bytes): The bcrypt hashed password to verify against.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password)


def create_access_token(data: dict) -> str:
    """
    Creates a JSON Web Token (JWT) with the provided data and an expiration time.

    Args:
        data (dict): The payload data to encode in the token.

    Returns:
        str: The encoded JWT as a string.
    """
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserModel:
    """
    Validates the JWT token and retrieves the associated user from the database.

    Args:
        token (str): The bearer token extracted from the Authorization header.

    Returns:
        UserModel: The user object if the token is valid and the user exists.

    Raises:
        HTTPException: 401 Unauthorized if the token is invalid or user is not found.
    """
    try:
        # Decode the JWT using the secret key and algorithm defined in settings
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )

        # Extract the 'sub' (subject) claim which contains the user's email
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    except jwt.InvalidTokenError:
        # Raised if the token is expired, signature is invalid, etc.
        raise HTTPException(
            detail="Vous n'êtes pas autorisé à accéder à ce contenu",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    with Session(engine) as session:
        # Query the database to find the user associated with the email in the token
        user = session.scalars(
            select(UserModel).where(UserModel.email == email)
        ).first()

        if not user:
            raise HTTPException(
                detail="Vous n'êtes pas autorisé à accéder à ce contenu",
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        return user
