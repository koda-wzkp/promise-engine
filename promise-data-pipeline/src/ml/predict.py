"""Inference: predict outcomes for new promises."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np

from ..schema.network import PromiseNetwork
from ..schema.promise import Promise
from .features import extract_features

logger = logging.getLogger(__name__)


@dataclass
class PredictionResult:
    promise_id: str
    predicted_status: str  # "kept" | "not_kept"
    confidence: float
    features_used: dict[str, Any]


def predict_outcome(
    promise: Promise,
    network: PromiseNetwork,
    model: Any,  # XGBClassifier
    feature_columns: list[str],
) -> PredictionResult:
    """Predict the outcome of a single promise."""
    import pandas as pd
    from sklearn.preprocessing import LabelEncoder

    features = extract_features(promise, network)

    # Build a single-row DataFrame matching training columns
    df = pd.DataFrame([features])

    # Encode categoricals (same as training)
    categorical_cols = ["domain", "verification_method", "origin", "polarity", "source_type"]
    for col in categorical_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))

    # Convert booleans
    for col in df.select_dtypes(include=["bool"]).columns:
        df[col] = df[col].astype(int)

    df = df.fillna(-1)

    # Align columns with training
    for col in feature_columns:
        if col not in df.columns:
            df[col] = -1
    df = df[feature_columns]

    # Predict
    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0]
    confidence = float(max(prob))

    return PredictionResult(
        promise_id=promise.external_id,
        predicted_status="kept" if pred == 1 else "not_kept",
        confidence=round(confidence, 4),
        features_used=features,
    )
