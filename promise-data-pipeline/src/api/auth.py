"""API key management and rate limiting."""

from __future__ import annotations

import hashlib
import logging
import time
from typing import Any, Optional

from fastapi import HTTPException, Request, Security
from fastapi.security import APIKeyHeader

logger = logging.getLogger(__name__)

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

# In-memory rate limit tracking (replace with Redis in production)
_rate_limits: dict[str, list[float]] = {}

TIER_LIMITS: dict[str, int] = {
    "free": 100,
    "researcher": 1000,
    "enterprise": 10000,
}


def hash_api_key(key: str) -> str:
    """SHA-256 hash of an API key."""
    return hashlib.sha256(key.encode()).hexdigest()


async def verify_api_key(
    request: Request,
    api_key: Optional[str] = Security(api_key_header),
) -> Optional[dict[str, Any]]:
    """Verify API key and check rate limits.

    Returns the key info dict if valid, None for public endpoints.
    """
    if not api_key:
        return None

    # Strip 'Bearer ' prefix
    if api_key.startswith("Bearer "):
        api_key = api_key[7:]

    key_hash = hash_api_key(api_key)

    from ..db.supabase_client import get_anon_client

    client = get_anon_client()
    result = (
        client.table("api_keys")
        .select("*")
        .eq("key_hash", key_hash)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid API key")

    key_info = result.data[0]

    # Check expiration
    if key_info.get("expires_at"):
        from datetime import datetime

        expires = datetime.fromisoformat(key_info["expires_at"].replace("Z", "+00:00"))
        if datetime.now(expires.tzinfo) > expires:
            raise HTTPException(status_code=401, detail="API key expired")

    # Check rate limit
    tier = key_info.get("tier", "free")
    limit = key_info.get("rate_limit_per_hour") or TIER_LIMITS.get(tier, 100)
    _check_rate_limit(key_hash, limit)

    return key_info


def _check_rate_limit(key_hash: str, limit: int) -> None:
    """Sliding window rate limiter."""
    now = time.time()
    window = 3600  # 1 hour

    if key_hash not in _rate_limits:
        _rate_limits[key_hash] = []

    # Remove old entries
    _rate_limits[key_hash] = [t for t in _rate_limits[key_hash] if now - t < window]

    if len(_rate_limits[key_hash]) >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded ({limit} requests/hour)",
        )

    _rate_limits[key_hash].append(now)
