from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    Inherits from DeclarativeBase to enable type-hinted mapping.
    """

    pass
