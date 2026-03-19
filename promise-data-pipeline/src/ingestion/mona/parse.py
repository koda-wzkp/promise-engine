"""Parse MONA Excel files into typed Python dataclasses."""

from __future__ import annotations

import logging
from dataclasses import dataclass, asdict
from datetime import date, datetime
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from ..common.excel_utils import clean_column_names, read_excel_single, safe_float, safe_int, safe_str

logger = logging.getLogger(__name__)


@dataclass
class MONAArrangement:
    arrangement_id: int
    country: str
    arrangement_type: str
    approval_date: Optional[date] = None
    expiration_date: Optional[date] = None
    total_amount_sdr: Optional[float] = None
    status: Optional[str] = None


@dataclass
class MONACondition:
    arrangement_id: int
    country: str
    condition_type: str  # SPC | PA | SB
    review_number: int
    condition_number: int
    description: str
    sector: Optional[str] = None
    institution: Optional[str] = None
    test_date: Optional[date] = None
    status: Optional[str] = None
    comment: Optional[str] = None


@dataclass
class MONAQuantitativeCondition:
    arrangement_id: int
    country: str
    criterion_name: str
    review_number: int
    test_date: Optional[date] = None
    target_value: Optional[float] = None
    actual_value: Optional[float] = None
    status: Optional[str] = None
    adjusted: bool = False


@dataclass
class MONAReview:
    arrangement_id: int
    country: str
    review_number: int
    scheduled_date: Optional[date] = None
    completion_date: Optional[date] = None
    status: Optional[str] = None
    board_date: Optional[date] = None


def _parse_date(val: Any) -> Optional[date]:
    """Parse a date value from Excel, handling various formats."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, date):
        return val
    try:
        return pd.to_datetime(str(val)).date()
    except (ValueError, TypeError):
        return None


def parse_arrangements(filepath: Path) -> list[MONAArrangement]:
    """Parse Description.xlsx into MONAArrangement records."""
    df = clean_column_names(read_excel_single(filepath))
    logger.info(f"Parsing arrangements from {filepath.name}: {len(df)} rows")
    logger.info(f"Columns: {list(df.columns)}")

    arrangements = []
    for _, row in df.iterrows():
        # Column names vary across MONA versions; try common variants
        arr_id = safe_int(row.get("arrangement_number") or row.get("arr_number") or row.get("id"))
        if arr_id is None:
            # Try first column as arrangement ID
            arr_id = safe_int(row.iloc[0]) if len(row) > 0 else None
        if arr_id is None:
            continue

        country = safe_str(row.get("country") or row.get("member"))
        if not country:
            continue

        arrangements.append(MONAArrangement(
            arrangement_id=arr_id,
            country=country,
            arrangement_type=safe_str(
                row.get("arrangement_type") or row.get("type") or row.get("facility")
            ) or "Unknown",
            approval_date=_parse_date(
                row.get("approval_date") or row.get("date_of_arrangement")
            ),
            expiration_date=_parse_date(
                row.get("expiration_date") or row.get("date_of_expiration")
            ),
            total_amount_sdr=safe_float(
                row.get("amount_agreed_(sdr_millions)") or row.get("amount_agreed") or row.get("total_amount")
            ),
            status=safe_str(row.get("status")),
        ))

    logger.info(f"Parsed {len(arrangements)} arrangements")
    return arrangements


def parse_conditions(filepath: Path) -> list[MONACondition]:
    """Parse Combined.xlsx into MONACondition records.

    Combined.xlsx contains all Structural Performance Criteria (SPC),
    Prior Actions (PA), and Structural Benchmarks (SB).
    """
    df = clean_column_names(read_excel_single(filepath))
    logger.info(f"Parsing conditions from {filepath.name}: {len(df)} rows")
    logger.info(f"Columns: {list(df.columns)}")

    conditions = []
    for idx, row in df.iterrows():
        arr_id = safe_int(
            row.get("arrangement_number") or row.get("arr_number") or row.iloc[0]
        )
        if arr_id is None:
            continue

        country = safe_str(row.get("country") or row.get("member")) or ""
        description = safe_str(row.get("description") or row.get("condition_description")) or ""
        if not description:
            continue

        conditions.append(MONACondition(
            arrangement_id=arr_id,
            country=country,
            condition_type=safe_str(
                row.get("condition_type") or row.get("type") or row.get("conditionality_type")
            ) or "SB",
            review_number=safe_int(
                row.get("review_number") or row.get("review") or row.get("review_no")
            ) or 0,
            condition_number=int(idx) if isinstance(idx, (int, float)) else 0,
            description=description,
            sector=safe_str(row.get("sector") or row.get("economic_sector")),
            institution=safe_str(row.get("institution") or row.get("responsible_institution")),
            test_date=_parse_date(row.get("test_date") or row.get("date")),
            status=safe_str(row.get("status") or row.get("compliance_status")),
            comment=safe_str(row.get("comment") or row.get("comments")),
        ))

    logger.info(f"Parsed {len(conditions)} structural conditions")
    return conditions


def parse_qpc(filepath: Path) -> list[MONAQuantitativeCondition]:
    """Parse QPC.xlsx into MONAQuantitativeCondition records."""
    df = clean_column_names(read_excel_single(filepath))
    logger.info(f"Parsing QPCs from {filepath.name}: {len(df)} rows")
    logger.info(f"Columns: {list(df.columns)}")

    qpcs = []
    for _, row in df.iterrows():
        arr_id = safe_int(
            row.get("arrangement_number") or row.get("arr_number") or row.iloc[0]
        )
        if arr_id is None:
            continue

        criterion = safe_str(
            row.get("criterion_name") or row.get("description") or row.get("indicator")
        )
        if not criterion:
            continue

        qpcs.append(MONAQuantitativeCondition(
            arrangement_id=arr_id,
            country=safe_str(row.get("country") or row.get("member")) or "",
            criterion_name=criterion,
            review_number=safe_int(
                row.get("review_number") or row.get("review") or row.get("review_no")
            ) or 0,
            test_date=_parse_date(row.get("test_date") or row.get("date")),
            target_value=safe_float(row.get("target") or row.get("target_value") or row.get("programmed")),
            actual_value=safe_float(row.get("actual") or row.get("actual_value") or row.get("observed")),
            status=safe_str(row.get("status") or row.get("compliance_status")),
            adjusted=bool(safe_str(row.get("adjusted")) in ("Yes", "Y", "1", "True")),
        ))

    logger.info(f"Parsed {len(qpcs)} quantitative performance criteria")
    return qpcs


def parse_reviews(filepath: Path) -> list[MONAReview]:
    """Parse Reviews.xlsx into MONAReview records."""
    df = clean_column_names(read_excel_single(filepath))
    logger.info(f"Parsing reviews from {filepath.name}: {len(df)} rows")
    logger.info(f"Columns: {list(df.columns)}")

    reviews = []
    for _, row in df.iterrows():
        arr_id = safe_int(
            row.get("arrangement_number") or row.get("arr_number") or row.iloc[0]
        )
        if arr_id is None:
            continue

        reviews.append(MONAReview(
            arrangement_id=arr_id,
            country=safe_str(row.get("country") or row.get("member")) or "",
            review_number=safe_int(
                row.get("review_number") or row.get("review") or row.get("review_no")
            ) or 0,
            scheduled_date=_parse_date(
                row.get("scheduled_date") or row.get("expected_date") or row.get("scheduled")
            ),
            completion_date=_parse_date(
                row.get("completion_date") or row.get("actual_date") or row.get("completed")
            ),
            status=safe_str(row.get("status") or row.get("review_status")),
            board_date=_parse_date(row.get("board_date") or row.get("board_approval_date")),
        ))

    logger.info(f"Parsed {len(reviews)} reviews")
    return reviews
