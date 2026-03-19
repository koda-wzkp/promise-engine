"""Promise API routes: list, search, filter."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Any

router = APIRouter(tags=["promises"])


@router.get("/networks/{slug}/promises")
async def list_promises(
    slug: str,
    status: str | None = Query(None),
    domain: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
) -> dict[str, Any]:
    """List promises in a network with optional filters."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()

    # Get network ID
    net_result = client.table("networks").select("id").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")
    network_id = net_result.data[0]["id"]

    query = client.table("promises").select("*", count="exact").eq("network_id", network_id)

    if status:
        query = query.eq("status", status)
    if domain:
        query = query.eq("domain", domain)

    offset = (page - 1) * per_page
    result = query.range(offset, offset + per_page - 1).order("created_at", desc=True).execute()

    return {
        "data": result.data,
        "meta": {"network_slug": slug},
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": result.count,
        },
    }


@router.get("/search")
async def search_promises(
    q: str = Query(..., min_length=2),
    domain: str | None = Query(None),
    source_type: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
) -> dict[str, Any]:
    """Full-text search across all promises."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    query = client.table("promises").select("*", count="exact").ilike("body", f"%{q}%")

    if domain:
        query = query.eq("domain", domain)

    offset = (page - 1) * per_page
    result = query.range(offset, offset + per_page - 1).execute()

    return {
        "data": result.data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": result.count,
        },
    }
