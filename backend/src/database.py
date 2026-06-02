from config import settings
from sqlalchemy import create_engine

"""
Database configuration module.

This module initializes the SQLAlchemy engine using the database URL 
provided in the application settings.
"""

engine = create_engine(settings.DATABASE_URL, echo=True)
