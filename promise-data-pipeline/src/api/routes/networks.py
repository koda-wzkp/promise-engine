"""Network API routes: list, detail, summary."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Any

router = APIRouter(tags=["networks"])


@router.get("/networks")
async def list_networks(
    source_type: str | None = Query(None, description="Filter by source type (gpra/mona)"),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
) -> dict[str, Any]:
    """List all promise networks."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    query = client.table("networks").select("*", count="exact")

    if source_type:
        query = query.eq("source_type", source_type)

    offset = (page - 1) * per_page
    result = query.range(offset, offset + per_page - 1).order("created_at", desc=True).execute()

    return {
        "data": result.data,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": result.count,
        },
    }


@router.get("/networks/{slug}")
async def get_network(slug: str) -> dict[str, Any]:
    """Get network detail with summary stats."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    result = client.table("networks").select("*").eq("slug", slug).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")

    network = result.data[0]
    network_id = network["id"]

    # Get counts
    promises = client.table("promises").select("id", count="exact").eq(
        "network_id", network_id
    ).execute()
    agents = client.table("agents").select("id", count="exact").eq(
        "network_id", network_id
    ).execute()
    edges = client.table("dependency_edges").select("id", count="exact").eq(
        "network_id", network_id
    ).execute()

    return {
        "data": {
            **network,
            "stats": {
                "promise_count": promises.count,
                "agent_count": agents.count,
                "edge_count": edges.count,
            },
        },
    }
