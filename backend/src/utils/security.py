import bcrypt
import jwt
from config import settings
from datetime import datetime, timedelta, timezone


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
