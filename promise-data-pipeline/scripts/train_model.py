#!/usr/bin/env python3
"""Train XGBoost on full dataset.

Usage:
    python scripts/train_model.py [--output-dir OUTPUT_DIR]
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.ml.train import run_training_pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("train_model")


def main():
    parser = argparse.ArgumentParser(description="Train XGBoost outcome prediction model")
    parser.add_argument("--output-dir", type=Path, default=Path("data/qa"), help="Output directory")
    args = parser.parse_args()

    # For now, this requires networks to be loaded.
    # In production, fetch from Supabase.
    logger.info("Training pipeline ready. Import and call run_training_pipeline() with networks.")
    logger.info("Example: from src.ml.train import run_training_pipeline")


if __name__ == "__main__":
    main()
