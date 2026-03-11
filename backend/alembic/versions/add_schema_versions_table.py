"""Add promise_schema_versions table for version tracking

Revision ID: b5e8c2f3d6a7
Revises: a3d7f1e2b4c5
Create Date: 2026-03-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b5e8c2f3d6a7'
down_revision = 'a3d7f1e2b4c5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('promise_schema_versions',
        sa.Column('schema_id', sa.String(length=100), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('commitment_type', sa.String(length=100), nullable=True),
        sa.Column('stakes', sa.String(length=20), nullable=True),
        sa.Column('schema_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('verification_type', sa.String(length=50), nullable=True),
        sa.Column('verification_rules', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('change_summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('schema_id', 'version')
    )
    op.create_index('idx_schema_versions_id', 'promise_schema_versions', ['schema_id'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_schema_versions_id', table_name='promise_schema_versions')
    op.drop_table('promise_schema_versions')
