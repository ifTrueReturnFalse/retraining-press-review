import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["DATABASE_USER"] = "test"
os.environ["DATABASE_PASSWORD"] = "test"
os.environ["DATABASE"] = "test"
os.environ["MISTRAL_API_KEY"] = "dummy-key"
os.environ["WORLD_NEWS_API_KEY"] = "dummy-key"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from main import app
from database import engine
from models import Base
from models.users import UserModel
from models.conversations import ConversationModel
from utils.security import hash_password, create_access_token


@pytest.fixture
def db():
    """
    Pytest fixture that provides a transactional database session for tests.

    This fixture ensures a clean database state for each test by dropping
    and recreating all tables before yielding a session.

    Yields:
        Session: A SQLAlchemy database session.
    """
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    """
    Pytest fixture to clean up the test database file after all tests in the session have run.

    This ensures that no `test.db` file is left behind after the test suite completes.
    It has a session scope and is automatically used.
    """
    yield
    engine.dispose()
    if os.path.exists("test.db"):
        os.remove("test.db")


@pytest.fixture
def client():
    """
    Pytest fixture that provides a TestClient for the FastAPI application.
    This client can be used to make requests to the application during tests.

    Returns:
        TestClient: An instance of FastAPI's TestClient configured with the main app.
    """
    return TestClient(app)


def create_user(session: Session, email: str) -> UserModel:
    user = UserModel(email=email, hashed_password=hash_password("password123"))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def auth_headers(user: UserModel) -> dict:
    """
    Generates authorization headers for a given user.

    Args:
        user (UserModel): The user for whom to generate authentication headers.

    Returns:
        dict: A dictionary containing the 'Authorization' header with a Bearer token.
    """
    token = create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def user_a(db):
    """
    Pytest fixture that creates and returns a user named 'Alice' for testing.

    Args:
        db (Session): The database session fixture.

    Returns:
        UserModel: The created user model instance.
    """
    return create_user(db, "alice@test.com")


@pytest.fixture
def user_b(db):
    """
    Pytest fixture that creates and returns a user named 'Bob' for testing.

    Args:
        db (Session): The database session fixture.

    Returns:
        UserModel: The created user model instance.
    """
    return create_user(db, "bob@test.com")


@pytest.fixture
def conversation_of_user_a(db, user_a):
    conversation = ConversationModel(user_id=user_a.id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation
