#!/usr/bin/env python3
"""Initialize Supabase schema.

Usage:
    python scripts/setup_db.py

Requires SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("setup_db")


def main():
    schema_path = Path(__file__).parent.parent / "src" / "db" / "schema.sql"
    schema_sql = schema_path.read_text()

    logger.info(f"Read schema from {schema_path} ({len(schema_sql)} bytes)")
    logger.info("To apply this schema, run the SQL in your Supabase SQL editor:")
    logger.info(f"  1. Go to your Supabase project dashboard")
    logger.info(f"  2. Navigate to SQL Editor")
    logger.info(f"  3. Paste and run the contents of {schema_path}")
    logger.info("")
    logger.info("Or use the Supabase CLI:")
    logger.info(f"  supabase db push --db-url <your-db-url> < {schema_path}")


if __name__ == "__main__":
    main()
