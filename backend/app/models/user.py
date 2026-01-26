"""User model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class User(Base):
    """User account."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Optional profile fields
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)

    # Stripe integration (for future payment processing)
    stripe_customer_id = Column(String(100), nullable=True)
    stripe_account_id = Column(String(100), nullable=True)  # For Stripe Connect

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<User {self.email}>"
