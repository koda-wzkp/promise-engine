"""Training pipeline: extract features from networks, train XGBoost, evaluate."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from ..schema.network import PromiseNetwork
from .features import extract_features_batch
from .xgboost_model import ModelResult, prepare_dataset, train_model

logger = logging.getLogger(__name__)


def run_training_pipeline(
    networks: list[PromiseNetwork],
    output_dir: Path | None = None,
) -> dict[str, Any]:
    """Run the full training pipeline on a set of networks.

    1. Extract features from all promises
    2. Establish heuristic baselines
    3. Train XGBoost
    4. Compare ML to baselines
    5. Report results honestly
    """
    # Collect all features and statuses
    all_features: list[dict[str, Any]] = []
    all_statuses: list[str] = []

    for net in networks:
        features = extract_features_batch(net)
        all_features.extend(features)
        all_statuses.extend(p.status for p in net.promises)

    logger.info(f"Extracted features from {len(all_features)} promises across {len(networks)} networks")

    # Prepare dataset
    X, y, feature_names = prepare_dataset(all_features, all_statuses)
    logger.info(f"Training dataset: {len(X)} samples, {len(feature_names)} features")

    if len(X) < 20:
        logger.warning("Insufficient data for meaningful ML training (<20 samples)")
        return {"error": "insufficient_data", "n_samples": len(X)}

    # Heuristic baselines
    baselines = _compute_baselines(X, y)

    # Train XGBoost
    model, result = train_model(X, y)

    # Compare
    comparison = {
        "xgboost": {"accuracy": result.accuracy, "f1": result.f1, "auc": result.auc_roc},
        "baselines": baselines,
        "ml_beats_naive": result.accuracy > baselines["naive"]["accuracy"],
        "ml_beats_verification": result.accuracy > baselines.get("verification", {}).get("accuracy", 0),
        "ml_beats_history": result.accuracy > baselines.get("history", {}).get("accuracy", 0),
    }

    output = {
        "model_result": {
            "accuracy": result.accuracy,
            "precision": result.precision,
            "recall": result.recall,
            "f1": result.f1,
            "auc_roc": result.auc_roc,
            "feature_importance": result.feature_importance,
            "confusion_matrix": result.confusion_matrix,
            "n_train": result.n_train,
            "n_test": result.n_test,
        },
        "baselines": baselines,
        "comparison": comparison,
        "honest_assessment": _honest_assessment(result, baselines),
    }

    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
        with open(output_dir / "training_results.json", "w") as f:
            json.dump(output, f, indent=2, default=str)

    return output


def _compute_baselines(X, y) -> dict[str, Any]:
    """Compute heuristic baselines to beat.

    - Naive: predict majority class for everything
    - Verification: predict based on verification method
    - History: predict based on promiser's historical rate
    """
    import numpy as np

    baselines: dict[str, Any] = {}

    # Naive baseline: predict majority class
    majority = int(y.mode().iloc[0]) if len(y) > 0 else 1
    naive_correct = (y == majority).sum()
    baselines["naive"] = {
        "accuracy": round(float(naive_correct / len(y)), 4) if len(y) > 0 else 0,
        "method": f"Always predict {'kept' if majority == 1 else 'not_kept'}",
    }

    # Verification baseline: predict kept if audit-verified
    if "verification_method" in X.columns:
        # Encoded values — we predict "kept" for higher verification strength
        median_ver = X["verification_method"].median()
        ver_preds = (X["verification_method"] >= median_ver).astype(int)
        ver_correct = (ver_preds == y).sum()
        baselines["verification"] = {
            "accuracy": round(float(ver_correct / len(y)), 4) if len(y) > 0 else 0,
            "method": "Predict kept if verification strength ≥ median",
        }

    # History baseline: predict based on promiser kept rate
    if "promiser_kept_rate" in X.columns:
        hist_preds = (X["promiser_kept_rate"] >= 0.5).astype(int)
        hist_correct = (hist_preds == y).sum()
        baselines["history"] = {
            "accuracy": round(float(hist_correct / len(y)), 4) if len(y) > 0 else 0,
            "method": "Predict kept if promiser's historical rate ≥ 0.5",
        }

    return baselines


def _honest_assessment(result: ModelResult, baselines: dict) -> str:
    """Provide an honest assessment of whether ML adds value."""
    naive_acc = baselines.get("naive", {}).get("accuracy", 0)
    ver_acc = baselines.get("verification", {}).get("accuracy", 0)
    hist_acc = baselines.get("history", {}).get("accuracy", 0)

    best_baseline = max(naive_acc, ver_acc, hist_acc)

    if result.accuracy <= naive_acc:
        return (
            "ML does NOT beat the naive baseline. The model is not adding value. "
            "Focus on physics-based analysis (Papers I-II) instead."
        )
    elif result.accuracy <= best_baseline:
        return (
            "ML beats naive baseline but not all heuristics. "
            "The verification or history baseline may be sufficient. "
            "Consider whether the ML complexity is justified."
        )
    elif result.accuracy - best_baseline < 0.05:
        return (
            "ML marginally outperforms heuristics (+<5%). "
            "The improvement may not justify the complexity. "
            "Physics-based analysis likely provides more insight."
        )
    else:
        return (
            f"ML meaningfully outperforms best baseline ({result.accuracy:.1%} vs {best_baseline:.1%}). "
            "The model captures patterns beyond simple heuristics."
        )
