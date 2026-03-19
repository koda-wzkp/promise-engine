"""Usage tracking per API key."""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)


async def record_usage(
    api_key_id: Optional[str],
    endpoint: str,
    method: str,
    status_code: int,
    response_time_ms: int,
) -> None:
    """Record API usage for metering and billing."""
    if not api_key_id:
        return

    try:
        from ..db.supabase_client import get_supabase_client

        client = get_supabase_client()
        client.table("api_usage").insert({
            "api_key_id": api_key_id,
            "endpoint": endpoint,
            "method": method,
            "status_code": status_code,
            "response_time_ms": response_time_ms,
        }).execute()
    except Exception as e:
        # Don't let metering failures break the API
        logger.warning(f"Failed to record API usage: {e}")
