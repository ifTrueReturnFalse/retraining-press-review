import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from config import settings
from models import Base, UserModel, ConversationModel, TopNewsCache
from database import engine


def run():
    """
    Initializes the database by creating all tables defined in the models.
    It also checks for the existence of a default user and creates one
    using credentials from the settings if it does not already exist.
    """
    Base.metadata.create_all(engine)
    print("Database initialized successfully")

    with Session(engine) as session:
        statement = select(UserModel).where(
            UserModel.email == settings.FIRST_USER_EMAIL
        )
        user = session.scalars(statement).first()

        if not user:
            session.add(
                UserModel(
                    email=settings.FIRST_USER_EMAIL,
                    hashed_password=bcrypt.hashpw(
                        settings.FIRST_USER_PASSWORD.encode("utf-8"), bcrypt.gensalt()
                    ),
                )
            )
            session.commit()


if __name__ == "__main__":
    run()
