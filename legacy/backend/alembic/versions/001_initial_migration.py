"""Initial migration - create users and beta_signups tables

Revision ID: 001_initial
Revises:
Create Date: 2026-01-26

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=True),
        sa.Column("last_name", sa.String(length=100), nullable=True),
        sa.Column("stripe_customer_id", sa.String(length=100), nullable=True),
        sa.Column("stripe_account_id", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # Create beta_signups table
    op.create_table(
        "beta_signups",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_beta_signups_email"), "beta_signups", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_beta_signups_email"), table_name="beta_signups")
    op.drop_table("beta_signups")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
