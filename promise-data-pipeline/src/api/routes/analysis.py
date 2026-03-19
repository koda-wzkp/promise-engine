"""Analysis API routes: health, conductivity, cascade."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Any

router = APIRouter(tags=["analysis"])


@router.get("/networks/{slug}/health")
async def get_health(slug: str) -> dict[str, Any]:
    """Get network health score and domain breakdown."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()

    # Check for cached analysis
    net_result = client.table("networks").select("id").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")
    network_id = net_result.data[0]["id"]

    result = (
        client.table("network_analysis")
        .select("*")
        .eq("network_id", network_id)
        .eq("analysis_type", "health")
        .order("computed_at", desc=True)
        .limit(1)
        .execute()
    )

    if result.data:
        return {
            "data": result.data[0]["results"],
            "meta": {
                "network_slug": slug,
                "computed_at": result.data[0]["computed_at"],
            },
        }

    raise HTTPException(status_code=404, detail="No health analysis found. Run the analysis pipeline first.")


@router.get("/networks/{slug}/conductivity")
async def get_conductivity(slug: str) -> dict[str, Any]:
    """Get Paper II conductivity metrics."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    net_result = client.table("networks").select("id").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")
    network_id = net_result.data[0]["id"]

    result = (
        client.table("network_analysis")
        .select("*")
        .eq("network_id", network_id)
        .eq("analysis_type", "percolation")
        .order("computed_at", desc=True)
        .limit(1)
        .execute()
    )

    if result.data:
        return {
            "data": result.data[0]["results"],
            "meta": {
                "network_slug": slug,
                "computed_at": result.data[0]["computed_at"],
                "parameters": result.data[0].get("parameters"),
            },
        }

    raise HTTPException(status_code=404, detail="No conductivity analysis found.")


@router.get("/networks/{slug}/analysis")
async def get_full_analysis(slug: str) -> dict[str, Any]:
    """Get full analysis suite (all Papers I-VI results)."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    net_result = client.table("networks").select("id").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")
    network_id = net_result.data[0]["id"]

    result = (
        client.table("network_analysis")
        .select("*")
        .eq("network_id", network_id)
        .order("computed_at", desc=True)
        .execute()
    )

    # Group by analysis type (latest of each)
    analyses: dict[str, Any] = {}
    for row in result.data:
        atype = row["analysis_type"]
        if atype not in analyses:
            analyses[atype] = {
                "results": row["results"],
                "computed_at": row["computed_at"],
                "parameters": row.get("parameters"),
            }

    return {
        "data": analyses,
        "meta": {"network_slug": slug},
    }


@router.get("/networks/{slug}/time-series")
async def get_time_series(slug: str) -> dict[str, Any]:
    """Get promise snapshots over time."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    net_result = client.table("networks").select("id").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")
    network_id = net_result.data[0]["id"]

    # Get promise IDs for this network
    promises = client.table("promises").select("id").eq("network_id", network_id).execute()
    promise_ids = [p["id"] for p in promises.data]

    if not promise_ids:
        return {"data": [], "meta": {"network_slug": slug}}

    # Get snapshots for these promises
    snapshots = (
        client.table("promise_snapshots")
        .select("*")
        .in_("promise_id", promise_ids)
        .order("snapshot_date")
        .execute()
    )

    return {
        "data": snapshots.data,
        "meta": {"network_slug": slug},
    }
