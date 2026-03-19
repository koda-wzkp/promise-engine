#!/usr/bin/env python3
"""Full MONA pipeline: download → parse → transform → QA → load.

Usage:
    python scripts/ingest_mona.py [--force] [--skip-load] [--data-dir DATA_DIR]
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.ingestion.mona.download import download_mona_data
from src.ingestion.mona.parse import (
    parse_arrangements,
    parse_conditions,
    parse_qpc,
    parse_reviews,
)
from src.ingestion.mona.transform import (
    build_time_series,
    infer_mona_dependencies,
    transform_mona_arrangement,
)
from src.qa.reports import generate_qa_report
from src.qa.checks import run_mona_specific_checks

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("ingest_mona")


def main():
    parser = argparse.ArgumentParser(description="Ingest MONA data into the pipeline")
    parser.add_argument("--force", action="store_true", help="Force re-download")
    parser.add_argument("--skip-load", action="store_true", help="Skip loading to Supabase")
    parser.add_argument("--data-dir", type=Path, default=Path("data"), help="Base data directory")
    args = parser.parse_args()

    raw_dir = args.data_dir / "raw" / "mona"
    qa_dir = args.data_dir / "qa"

    # Phase 1: Download
    logger.info("=== Phase 1: Download ===")
    files = download_mona_data(raw_dir, force=args.force)
    logger.info(f"Downloaded files: {list(files.keys())}")

    # Phase 2: Parse
    logger.info("=== Phase 2: Parse ===")
    arrangements = parse_arrangements(files["description"])
    conditions = parse_conditions(files["combined"])
    qpcs = parse_qpc(files["qpc"])
    reviews = parse_reviews(files["reviews"])

    total_parsed = len(arrangements) + len(conditions) + len(qpcs) + len(reviews)
    logger.info(
        f"Parsed: {len(arrangements)} arrangements, {len(conditions)} conditions, "
        f"{len(qpcs)} QPCs, {len(reviews)} reviews (total: {total_parsed})"
    )

    # Phase 3: Transform
    logger.info("=== Phase 3: Transform ===")
    networks = []
    records_failed = 0

    # Group conditions, QPCs, and reviews by arrangement
    conds_by_arr: dict[int, list] = {}
    for c in conditions:
        conds_by_arr.setdefault(c.arrangement_id, []).append(c)

    qpcs_by_arr: dict[int, list] = {}
    for q in qpcs:
        qpcs_by_arr.setdefault(q.arrangement_id, []).append(q)

    reviews_by_arr: dict[int, list] = {}
    for r in reviews:
        reviews_by_arr.setdefault(r.arrangement_id, []).append(r)

    for arr in arrangements:
        try:
            arr_conds = conds_by_arr.get(arr.arrangement_id, [])
            arr_qpcs = qpcs_by_arr.get(arr.arrangement_id, [])
            arr_reviews = reviews_by_arr.get(arr.arrangement_id, [])

            if not arr_conds and not arr_qpcs:
                continue  # Skip arrangements with no conditions

            network = transform_mona_arrangement(arr, arr_conds, arr_qpcs, arr_reviews)

            # Infer dependencies
            edges = infer_mona_dependencies(arr_conds, arr_reviews, network)
            for edge in edges:
                network.add_edge(edge)

            # Build time series
            snapshots = build_time_series(arr_conds, arr_reviews, network)
            for snap in snapshots:
                network.add_snapshot(snap)

            networks.append(network)
        except Exception as e:
            logger.error(f"Failed to transform arrangement {arr.arrangement_id}: {e}")
            records_failed += 1

    logger.info(f"Transformed {len(networks)} networks ({records_failed} failures)")

    # Phase 4: QA
    logger.info("=== Phase 4: QA ===")
    report = generate_qa_report("mona", networks, total_parsed, records_failed)
    report_path = report.save(qa_dir)
    logger.info(f"QA report: {report_path}")
    logger.info(f"  Records: {report.records_parsed} parsed, {report.records_transformed} transformed")
    logger.info(f"  Status distribution: {report.status_distribution}")
    logger.info(f"  Needs manual review: {report.needs_manual_review}")

    # Run integrity checks on a sample
    for net in networks[:3]:
        checks = run_mona_specific_checks(net)
        failed = [c for c in checks if not c.passed]
        if failed:
            logger.warning(f"Network '{net.slug}' failed checks: {[c.name for c in failed]}")

    # Phase 5: Load to Supabase
    if not args.skip_load:
        logger.info("=== Phase 5: Load ===")
        try:
            from src.db.load import load_network

            for net in networks:
                stats = load_network(net)
                logger.info(f"Loaded '{net.slug}': {stats}")
        except RuntimeError as e:
            logger.error(f"Failed to load to Supabase: {e}")
            logger.info("Skipping load. Set SUPABASE_URL and SUPABASE_SERVICE_KEY to enable.")
    else:
        logger.info("Skipping Supabase load (--skip-load)")

    # Summary
    logger.info("=== Done ===")
    logger.info(f"Networks: {len(networks)}")
    logger.info(f"Total promises: {sum(len(n.promises) for n in networks)}")
    logger.info(f"Total edges: {sum(len(n.edges) for n in networks)}")
    logger.info(f"Total snapshots: {sum(len(n.snapshots) for n in networks)}")


if __name__ == "__main__":
    main()
