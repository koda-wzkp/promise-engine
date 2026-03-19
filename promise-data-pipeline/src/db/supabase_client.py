"""Supabase connection and client management."""

from __future__ import annotations

import logging
import os
from functools import lru_cache

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_supabase_client():
    """Get a Supabase client instance (singleton).

    Requires SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.
    Uses the service role key for pipeline writes (not anon key).
    """
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required. "
            "Set them in .env or your environment."
        )

    client = create_client(url, key)
    logger.info(f"Connected to Supabase: {url}")
    return client


def get_anon_client():
    """Get a Supabase client with anon key (for API reads)."""
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required."
        )

    return create_client(url, key)
