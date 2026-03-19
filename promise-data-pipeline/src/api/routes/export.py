"""Export API routes: CSV/JSON export of network data."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Any

router = APIRouter(tags=["export"])


@router.get("/networks/{slug}/export")
async def export_network(
    slug: str,
    format: str = Query("json", description="Export format: json or csv"),
) -> Any:
    """Export full network data (promises, agents, edges)."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    net_result = client.table("networks").select("*").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")

    network = net_result.data[0]
    network_id = network["id"]

    promises = client.table("promises").select("*").eq("network_id", network_id).execute()
    agents = client.table("agents").select("*").eq("network_id", network_id).execute()
    edges = client.table("dependency_edges").select("*").eq("network_id", network_id).execute()

    if format == "csv":
        import csv
        import io

        output = io.StringIO()
        if promises.data:
            writer = csv.DictWriter(output, fieldnames=promises.data[0].keys())
            writer.writeheader()
            writer.writerows(promises.data)

        from fastapi.responses import Response

        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={slug}.csv"},
        )

    return {
        "data": {
            "network": network,
            "agents": agents.data,
            "promises": promises.data,
            "edges": edges.data,
        },
        "meta": {"network_slug": slug, "format": format},
    }


@router.get("/compare")
async def compare_networks(
    slugs: str = Query(..., description="Comma-separated network slugs"),
) -> dict[str, Any]:
    """Cross-network comparison."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    slug_list = [s.strip() for s in slugs.split(",")]

    comparisons = []
    for slug in slug_list:
        net_result = client.table("networks").select("*").eq("slug", slug).execute()
        if not net_result.data:
            continue

        network_id = net_result.data[0]["id"]
        promises = (
            client.table("promises")
            .select("status,domain,verification_method")
            .eq("network_id", network_id)
            .execute()
        )

        # Compute summary stats
        status_dist: dict[str, int] = {}
        for p in promises.data:
            s = p["status"]
            status_dist[s] = status_dist.get(s, 0) + 1

        comparisons.append({
            "slug": slug,
            "name": net_result.data[0]["name"],
            "source_type": net_result.data[0]["source_type"],
            "promise_count": len(promises.data),
            "status_distribution": status_dist,
        })

    return {"data": comparisons}
