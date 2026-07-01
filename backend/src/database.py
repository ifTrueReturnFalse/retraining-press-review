"""Database configuration module.

This module initializes the SQLAlchemy engine using the database URL
provided in the application settings. The engine is a central access point
to the database for the application.
"""
from config import settings
from sqlalchemy import create_engine

engine = create_engine(settings.DATABASE_URL, echo=True)
