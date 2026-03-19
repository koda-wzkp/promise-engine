"""XGBoost outcome prediction model for promises."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier

logger = logging.getLogger(__name__)

# Categorical columns that need encoding
CATEGORICAL_COLS = ["domain", "verification_method", "origin", "polarity", "source_type"]

# Target: 1 = kept (verified), 0 = not kept (violated/degraded)
STATUS_LABEL: dict[str, int] = {
    "verified": 1,
    "declared": -1,  # Exclude from training (not yet evaluated)
    "degraded": 0,
    "violated": 0,
    "unverifiable": -1,  # Exclude from training
}


@dataclass
class ModelResult:
    accuracy: float
    precision: float
    recall: float
    f1: float
    auc_roc: float
    feature_importance: dict[str, float]
    confusion_matrix: list[list[int]]
    n_train: int
    n_test: int
    details: dict[str, Any]


def prepare_dataset(
    features: list[dict[str, Any]],
    statuses: list[str],
) -> tuple[pd.DataFrame, pd.Series, list[str]]:
    """Prepare features and labels for XGBoost training.

    Filters out promises that don't have terminal statuses (declared, unverifiable).
    Returns (X, y, feature_names).
    """
    df = pd.DataFrame(features)

    # Add labels
    labels = [STATUS_LABEL.get(s, -1) for s in statuses]
    df["_label"] = labels

    # Filter out non-terminal statuses
    df = df[df["_label"] >= 0].copy()
    y = df.pop("_label")

    # Encode categorical columns
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))

    # Fill NaN
    df = df.fillna(-1)

    # Convert boolean columns
    for col in df.select_dtypes(include=["bool"]).columns:
        df[col] = df[col].astype(int)

    return df, y, list(df.columns)


def train_model(
    X: pd.DataFrame,
    y: pd.Series,
    n_splits: int = 5,
) -> tuple[XGBClassifier, ModelResult]:
    """Train XGBoost model with time-series cross-validation.

    Returns (model, results).
    """
    from sklearn.metrics import (
        accuracy_score,
        confusion_matrix,
        f1_score,
        precision_score,
        recall_score,
        roc_auc_score,
    )

    model = XGBClassifier(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        use_label_encoder=False,
    )

    # Time-series split for temporal validation
    tscv = TimeSeriesSplit(n_splits=min(n_splits, len(X) // 10 or 1))

    all_y_true = []
    all_y_pred = []
    all_y_prob = []

    for train_idx, test_idx in tscv.split(X):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1] if len(model.classes_) == 2 else np.zeros(len(y_pred))

        all_y_true.extend(y_test)
        all_y_pred.extend(y_pred)
        all_y_prob.extend(y_prob)

    # Final fit on all data
    model.fit(X, y)

    all_y_true = np.array(all_y_true)
    all_y_pred = np.array(all_y_pred)
    all_y_prob = np.array(all_y_prob)

    # Feature importance
    importance = dict(zip(X.columns, model.feature_importances_))
    importance = {k: round(float(v), 6) for k, v in sorted(importance.items(), key=lambda x: x[1], reverse=True)}

    # Metrics
    try:
        auc = float(roc_auc_score(all_y_true, all_y_prob))
    except ValueError:
        auc = 0.0

    cm = confusion_matrix(all_y_true, all_y_pred).tolist()

    result = ModelResult(
        accuracy=round(float(accuracy_score(all_y_true, all_y_pred)), 4),
        precision=round(float(precision_score(all_y_true, all_y_pred, zero_division=0)), 4),
        recall=round(float(recall_score(all_y_true, all_y_pred, zero_division=0)), 4),
        f1=round(float(f1_score(all_y_true, all_y_pred, zero_division=0)), 4),
        auc_roc=round(auc, 4),
        feature_importance=importance,
        confusion_matrix=cm,
        n_train=len(X),
        n_test=len(all_y_true),
        details={
            "n_splits": n_splits,
            "model_params": model.get_params(),
        },
    )

    logger.info(f"Model trained: accuracy={result.accuracy}, F1={result.f1}, AUC={result.auc_roc}")
    return model, result
