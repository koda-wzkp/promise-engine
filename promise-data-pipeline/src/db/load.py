"""Bulk insert/upsert from pipeline output to Supabase."""

from __future__ import annotations

import logging
from typing import Any

from ..schema.network import PromiseNetwork
from .supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

BATCH_SIZE = 500


def load_network(network: PromiseNetwork, source_id: str | None = None) -> dict[str, Any]:
    """Load a complete PromiseNetwork into Supabase.

    Performs upserts to handle re-ingestion safely.

    Returns summary of what was loaded.
    """
    client = get_supabase_client()
    stats: dict[str, int] = {"networks": 0, "agents": 0, "promises": 0, "edges": 0, "snapshots": 0}

    # 1. Upsert network
    network_row = {
        "id": network.id,
        "slug": network.slug,
        "name": network.name,
        "source_type": network.source_type,
        "description": network.description,
        "metadata": network.metadata,
    }
    if source_id:
        network_row["source_id"] = source_id

    client.table("networks").upsert(network_row, on_conflict="slug").execute()
    stats["networks"] = 1

    # Get the network ID from DB (may differ if already existed)
    result = client.table("networks").select("id").eq("slug", network.slug).execute()
    db_network_id = result.data[0]["id"] if result.data else network.id

    # 2. Upsert agents
    agent_id_map: dict[str, str] = {}  # external_id → DB id
    for agent in network.agents:
        agent_row = {
            "id": agent.id,
            "network_id": db_network_id,
            "external_id": agent.external_id,
            "name": agent.name,
            "type": agent.type,
            "short": agent.short,
            "metadata": agent.metadata,
        }
        client.table("agents").upsert(
            agent_row, on_conflict="network_id,external_id"
        ).execute()
        stats["agents"] += 1

    # Fetch agent DB IDs
    agents_result = client.table("agents").select("id,external_id").eq(
        "network_id", db_network_id
    ).execute()
    for a in agents_result.data:
        agent_id_map[a["external_id"]] = a["id"]

    # 3. Upsert promises in batches
    promise_id_map: dict[str, str] = {}  # external_id → DB id
    promise_rows = []
    for p in network.promises:
        row = {
            "id": p.id,
            "network_id": db_network_id,
            "external_id": p.external_id,
            "ref": p.ref,
            "promiser_id": agent_id_map.get(p.promiser),
            "promisee_id": agent_id_map.get(p.promisee),
            "body": p.body,
            "domain": p.domain,
            "status": p.status,
            "target": p.target.isoformat() if p.target else None,
            "progress": p.progress,
            "required": p.required,
            "note": p.note,
            "polarity": p.polarity,
            "scope": p.scope,
            "origin": p.origin,
            "verification_method": p.verification_method,
            "verification_source": p.verification_source,
            "verification_metric": p.verification_metric,
            "verification_frequency": p.verification_frequency,
            "source_raw": p.source_raw,
        }
        promise_rows.append(row)

    for i in range(0, len(promise_rows), BATCH_SIZE):
        batch = promise_rows[i : i + BATCH_SIZE]
        client.table("promises").upsert(
            batch, on_conflict="network_id,external_id"
        ).execute()
        stats["promises"] += len(batch)

    # Fetch promise DB IDs
    promises_result = client.table("promises").select("id,external_id").eq(
        "network_id", db_network_id
    ).execute()
    for p in promises_result.data:
        promise_id_map[p["external_id"]] = p["id"]

    # 4. Upsert edges
    edge_rows = []
    for edge in network.edges:
        src_db_id = promise_id_map.get(edge.source_promise_id)
        tgt_db_id = promise_id_map.get(edge.target_promise_id)
        if not src_db_id or not tgt_db_id:
            continue
        edge_rows.append({
            "id": edge.id,
            "network_id": db_network_id,
            "source_promise_id": src_db_id,
            "target_promise_id": tgt_db_id,
            "edge_type": edge.edge_type,
            "weight": edge.weight,
            "metadata": edge.metadata,
        })

    for i in range(0, len(edge_rows), BATCH_SIZE):
        batch = edge_rows[i : i + BATCH_SIZE]
        client.table("dependency_edges").upsert(
            batch, on_conflict="source_promise_id,target_promise_id,edge_type"
        ).execute()
        stats["edges"] += len(batch)

    # 5. Insert snapshots (append-only per CLAUDE.md invariant)
    snapshot_rows = []
    for snap in network.snapshots:
        promise_db_id = promise_id_map.get(snap.promise_external_id)
        if not promise_db_id:
            continue
        snapshot_rows.append({
            "id": snap.id,
            "promise_id": promise_db_id,
            "status": snap.status,
            "progress": snap.progress,
            "snapshot_date": snap.snapshot_date.isoformat(),
            "source_document": snap.source_document,
            "metadata": snap.metadata,
        })

    for i in range(0, len(snapshot_rows), BATCH_SIZE):
        batch = snapshot_rows[i : i + BATCH_SIZE]
        client.table("promise_snapshots").insert(batch).execute()
        stats["snapshots"] += len(batch)

    logger.info(f"Loaded network '{network.slug}': {stats}")
    return stats
