"""Database configuration and session management.

Provides SQLAlchemy database connection and session handling.
"""

import logging
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import Pool

logger = logging.getLogger(__name__)

# Base class for all models
Base = declarative_base()

# Global session maker
_SessionLocal = None
_engine = None


def init_database(database_url: str, echo: bool = False) -> None:
    """Initialize database connection.

    Args:
        database_url: PostgreSQL connection string
            Example: postgresql://user:password@localhost:5432/promise_engine
        echo: Whether to log SQL queries (useful for debugging)
    """
    global _SessionLocal, _engine

    logger.info(f"Initializing database connection...")

    # Create engine with connection pooling
    _engine = create_engine(
        database_url,
        echo=echo,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=10,  # Max connections in pool
        max_overflow=20,  # Max overflow connections
    )

    # Enable PostgreSQL-specific optimizations
    @event.listens_for(Pool, "connect")
    def set_postgresql_pragma(dbapi_conn, connection_record):
        """Set PostgreSQL connection parameters."""
        cursor = dbapi_conn.cursor()
        # Set timezone to UTC
        cursor.execute("SET timezone='UTC'")
        cursor.close()

    # Create session factory
    _SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=_engine,
    )

    logger.info("Database initialized successfully")


def get_db_session() -> Session:
    """Get a new database session.

    Returns:
        SQLAlchemy session

    Raises:
        RuntimeError: If database not initialized
    """
    if _SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")

    return _SessionLocal()


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Context manager for database sessions.

    Usage:
        with get_db() as db:
            user = db.query(User).first()

    Yields:
        Database session

    Ensures:
        Session is closed after use
    """
    db = get_db_session()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def transaction() -> Generator[Session, None, None]:
    """Context manager for database transactions.

    Usage:
        with transaction() as db:
            db.add(user)
            # Auto-commits on success, rolls back on error

    Yields:
        Database session

    Ensures:
        - Commits transaction on success
        - Rolls back on error
        - Closes session
    """
    db = get_db_session()
    try:
        yield db
        db.commit()
        logger.debug("Transaction committed successfully")
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction rolled back: {str(e)}")
        raise
    finally:
        db.close()


def create_all_tables() -> None:
    """Create all tables in database.

    Warning:
        Only use for development/testing. Use Alembic migrations in production.
    """
    if _engine is None:
        raise RuntimeError("Database not initialized")

    logger.info("Creating all tables...")
    Base.metadata.create_all(bind=_engine)
    logger.info("All tables created successfully")


def drop_all_tables() -> None:
    """Drop all tables from database.

    Warning:
        Destructive operation! Only use for development/testing.
    """
    if _engine is None:
        raise RuntimeError("Database not initialized")

    logger.warning("Dropping all tables...")
    Base.metadata.drop_all(bind=_engine)
    logger.warning("All tables dropped")


def get_engine():
    """Get the SQLAlchemy engine.

    Returns:
        SQLAlchemy engine instance
    """
    if _engine is None:
        raise RuntimeError("Database not initialized")
    return _engine
