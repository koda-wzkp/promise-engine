"""Add due_by column to promise_events

Revision ID: a3d7f1e2b4c5
Revises: 0f28bc9d4a52
Create Date: 2026-03-10 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a3d7f1e2b4c5"
down_revision = "0f28bc9d4a52"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("promise_events", sa.Column("due_by", sa.DateTime(), nullable=True))
    op.create_index("idx_events_due_by", "promise_events", ["due_by"], unique=False)
    op.create_index("idx_events_overdue", "promise_events", ["promiser_id", "result", "due_by"], unique=False)


def downgrade() -> None:
    op.drop_index("idx_events_overdue", table_name="promise_events")
    op.drop_index("idx_events_due_by", table_name="promise_events")
    op.drop_column("promise_events", "due_by")
