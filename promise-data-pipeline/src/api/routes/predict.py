"""Prediction API routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

router = APIRouter(tags=["predictions"])


class PredictRequest(BaseModel):
    promise_body: str
    domain: str
    verification_method: str
    origin: str = "imposed"
    source_type: str = "gpra"


@router.post("/predict")
async def predict_outcome(request: PredictRequest) -> dict[str, Any]:
    """Predict outcome for a promise (stub — requires trained model)."""
    # TODO: Load trained model and run inference
    return {
        "data": {
            "predicted_status": "declared",
            "confidence": 0.0,
            "note": "Model not yet trained. Run scripts/train_model.py first.",
        },
        "meta": {
            "model_version": "none",
        },
    }


@router.get("/networks/{slug}/predictions")
async def get_predictions(slug: str) -> dict[str, Any]:
    """Get all predictions for a network."""
    from ...db.supabase_client import get_anon_client

    client = get_anon_client()
    net_result = client.table("networks").select("id").eq("slug", slug).execute()
    if not net_result.data:
        raise HTTPException(status_code=404, detail=f"Network '{slug}' not found")
    network_id = net_result.data[0]["id"]

    promises = client.table("promises").select("id").eq("network_id", network_id).execute()
    promise_ids = [p["id"] for p in promises.data]

    if not promise_ids:
        return {"data": [], "meta": {"network_slug": slug}}

    predictions = (
        client.table("predictions")
        .select("*")
        .in_("promise_id", promise_ids)
        .order("predicted_at", desc=True)
        .execute()
    )

    return {
        "data": predictions.data,
        "meta": {"network_slug": slug},
    }
