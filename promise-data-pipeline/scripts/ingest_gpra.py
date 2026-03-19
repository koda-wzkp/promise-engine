#!/usr/bin/env python3
"""Full GPRA pipeline: download → parse → transform → QA → load.

Usage:
    python scripts/ingest_gpra.py [--force] [--skip-load] [--data-dir DATA_DIR]
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.ingestion.gpra.download import download_gpra_data
from src.ingestion.gpra.parse import parse_gpra_file
from src.ingestion.gpra.transform import transform_gpra_goals
from src.qa.reports import generate_qa_report
from src.qa.checks import run_gpra_specific_checks

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("ingest_gpra")


def main():
    parser = argparse.ArgumentParser(description="Ingest GPRA data into the pipeline")
    parser.add_argument("--force", action="store_true", help="Force re-download")
    parser.add_argument("--skip-load", action="store_true", help="Skip loading to Supabase")
    parser.add_argument("--data-dir", type=Path, default=Path("data"), help="Base data directory")
    args = parser.parse_args()

    raw_dir = args.data_dir / "raw" / "gpra"
    qa_dir = args.data_dir / "qa"

    # Phase 1: Download
    logger.info("=== Phase 1: Download ===")
    files = download_gpra_data(raw_dir, force=args.force)
    logger.info(f"Downloaded files: {list(files.keys())}")

    if not files:
        logger.error("No GPRA files downloaded. Check URLs or network connectivity.")
        sys.exit(1)

    # Phase 2: Parse
    logger.info("=== Phase 2: Parse ===")
    all_goals = []
    for source_key, filepath in files.items():
        goals = parse_gpra_file(filepath)
        logger.info(f"  {source_key}: {len(goals)} goals")
        all_goals.extend(goals)

    logger.info(f"Total parsed: {len(all_goals)} goals")

    # Phase 3: Transform
    logger.info("=== Phase 3: Transform ===")
    all_networks = []
    records_failed = 0

    for source_key, filepath in files.items():
        goals = [g for g in all_goals if g.source_file == filepath.name]
        if not goals:
            continue

        try:
            fy = goals[0].fiscal_year
            networks = transform_gpra_goals(goals, fiscal_year=fy)
            all_networks.extend(networks)
        except Exception as e:
            logger.error(f"Failed to transform {source_key}: {e}")
            records_failed += 1

    logger.info(f"Transformed {len(all_networks)} networks ({records_failed} failures)")

    # Phase 4: QA
    logger.info("=== Phase 4: QA ===")
    report = generate_qa_report("gpra", all_networks, len(all_goals), records_failed)
    report_path = report.save(qa_dir)
    logger.info(f"QA report: {report_path}")
    logger.info(f"  Records: {report.records_parsed} parsed, {report.records_transformed} transformed")
    logger.info(f"  Status distribution: {report.status_distribution}")

    # Run checks on a sample
    for net in all_networks[:3]:
        checks = run_gpra_specific_checks(net)
        failed = [c for c in checks if not c.passed]
        if failed:
            logger.warning(f"Network '{net.slug}' failed checks: {[c.name for c in failed]}")

    # Phase 5: Load
    if not args.skip_load:
        logger.info("=== Phase 5: Load ===")
        try:
            from src.db.load import load_network

            for net in all_networks:
                stats = load_network(net)
                logger.info(f"Loaded '{net.slug}': {stats}")
        except RuntimeError as e:
            logger.error(f"Failed to load to Supabase: {e}")
            logger.info("Skipping load. Set SUPABASE_URL and SUPABASE_SERVICE_KEY to enable.")
    else:
        logger.info("Skipping Supabase load (--skip-load)")

    # Summary
    logger.info("=== Done ===")
    logger.info(f"Networks: {len(all_networks)}")
    logger.info(f"Total promises: {sum(len(n.promises) for n in all_networks)}")
    logger.info(f"Total edges: {sum(len(n.edges) for n in all_networks)}")


if __name__ == "__main__":
    main()
