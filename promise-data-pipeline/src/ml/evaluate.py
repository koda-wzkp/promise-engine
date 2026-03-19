"""Model evaluation: metrics, confusion matrix, feature importance visualization."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from .xgboost_model import ModelResult

logger = logging.getLogger(__name__)


def generate_evaluation_report(
    result: ModelResult,
    baselines: dict[str, Any],
    output_path: Path | None = None,
) -> dict[str, Any]:
    """Generate a comprehensive evaluation report."""
    report = {
        "model_performance": {
            "accuracy": result.accuracy,
            "precision": result.precision,
            "recall": result.recall,
            "f1_score": result.f1,
            "auc_roc": result.auc_roc,
        },
        "baselines": baselines,
        "feature_importance_top10": dict(list(result.feature_importance.items())[:10]),
        "confusion_matrix": result.confusion_matrix,
        "dataset": {
            "n_train": result.n_train,
            "n_test": result.n_test,
        },
    }

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            json.dump(report, f, indent=2, default=str)
        logger.info(f"Evaluation report saved to {output_path}")

    return report
