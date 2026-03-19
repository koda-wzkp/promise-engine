"""Parse GPRA Performance Data Report Excel files into typed records."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, asdict
from datetime import date, datetime
from pathlib import Path
from typing import Any, Optional

import pandas as pd

from ..common.excel_utils import clean_column_names, read_excel_sheets, safe_float, safe_str

logger = logging.getLogger(__name__)


@dataclass
class GPRARawGoal:
    agency: str
    goal_type: str  # strategic_goal | strategic_objective | apg
    goal_id: str
    goal_statement: str
    target_date: Optional[str] = None
    metric_name: Optional[str] = None
    metric_target: Optional[float] = None
    metric_actual: Optional[float] = None
    status: Optional[str] = None
    quarter: Optional[str] = None
    strategic_objective_ref: Optional[str] = None
    narrative: Optional[str] = None
    fiscal_year: Optional[int] = None
    source_file: Optional[str] = None
    source_sheet: Optional[str] = None
    source_row: Optional[int] = None


def _infer_fiscal_year(text: str) -> Optional[int]:
    """Try to extract a fiscal year from text like 'FY24', 'FY2024', '2024'."""
    match = re.search(r"FY\s*(\d{2,4})", text, re.IGNORECASE)
    if match:
        year = int(match.group(1))
        if year < 100:
            year += 2000
        return year
    match = re.search(r"(20\d{2})", text)
    if match:
        return int(match.group(1))
    return None


def _generate_goal_id(agency: str, goal_type: str, index: int) -> str:
    """Generate a unique goal ID from agency, type, and row index."""
    agency_code = agency.upper().replace(" ", "")[:6]
    type_code = {"strategic_goal": "SG", "strategic_objective": "SO", "apg": "APG"}.get(
        goal_type, "G"
    )
    return f"{agency_code}-{type_code}-{index}"


def parse_gpra_file(filepath: Path) -> list[GPRARawGoal]:
    """Parse a GPRA Performance Data Report Excel file.

    These files typically contain multiple sheets:
    - Strategic Goals
    - Strategic Objectives (with categorizations)
    - Agency Priority Goals (with quarterly metrics)
    """
    logger.info(f"Parsing GPRA file: {filepath}")
    sheets = read_excel_sheets(filepath)
    goals: list[GPRARawGoal] = []

    for sheet_name, df in sheets.items():
        df = clean_column_names(df)
        sheet_lower = sheet_name.lower()

        if "priority" in sheet_lower or "apg" in sheet_lower:
            goals.extend(_parse_apg_sheet(df, sheet_name, filepath))
        elif "objective" in sheet_lower:
            goals.extend(_parse_objective_sheet(df, sheet_name, filepath))
        elif "goal" in sheet_lower or "strategic" in sheet_lower:
            goals.extend(_parse_strategic_sheet(df, sheet_name, filepath))
        else:
            # Try to parse as a generic goal sheet
            goals.extend(_parse_generic_sheet(df, sheet_name, filepath))

    logger.info(f"Parsed {len(goals)} goals from {filepath.name}")
    return goals


def _parse_apg_sheet(
    df: pd.DataFrame, sheet_name: str, filepath: Path
) -> list[GPRARawGoal]:
    """Parse an Agency Priority Goals sheet."""
    goals: list[GPRARawGoal] = []
    cols = set(df.columns)

    # Find the agency column
    agency_col = _find_column(cols, ["agency", "agency_name", "organization"])
    goal_col = _find_column(cols, ["goal_statement", "goal", "description", "apg_statement", "apg_goal_statement"])
    status_col = _find_column(cols, ["status", "progress_status", "goal_status"])
    target_col = _find_column(cols, ["target", "target_value", "metric_target", "fy_target"])
    actual_col = _find_column(cols, ["actual", "actual_value", "metric_actual", "fy_actual"])
    metric_col = _find_column(cols, ["metric", "metric_name", "indicator", "measure"])
    quarter_col = _find_column(cols, ["quarter", "reporting_period", "period"])

    for idx, row in df.iterrows():
        agency = safe_str(row.get(agency_col)) if agency_col else None
        if not agency:
            continue

        statement = safe_str(row.get(goal_col)) if goal_col else None
        if not statement:
            continue

        goal_id = _generate_goal_id(agency, "apg", int(idx) if isinstance(idx, (int, float)) else 0)

        goals.append(GPRARawGoal(
            agency=agency,
            goal_type="apg",
            goal_id=goal_id,
            goal_statement=statement,
            status=safe_str(row.get(status_col)) if status_col else None,
            metric_target=safe_float(row.get(target_col)) if target_col else None,
            metric_actual=safe_float(row.get(actual_col)) if actual_col else None,
            metric_name=safe_str(row.get(metric_col)) if metric_col else None,
            quarter=safe_str(row.get(quarter_col)) if quarter_col else None,
            fiscal_year=_infer_fiscal_year(filepath.stem),
            source_file=filepath.name,
            source_sheet=sheet_name,
            source_row=int(idx) if isinstance(idx, (int, float)) else None,
        ))

    return goals


def _parse_objective_sheet(
    df: pd.DataFrame, sheet_name: str, filepath: Path
) -> list[GPRARawGoal]:
    """Parse a Strategic Objectives sheet."""
    goals: list[GPRARawGoal] = []
    cols = set(df.columns)

    agency_col = _find_column(cols, ["agency", "agency_name", "organization"])
    goal_col = _find_column(cols, ["objective", "strategic_objective", "description", "goal_statement"])
    status_col = _find_column(cols, ["status", "category", "categorization", "progress"])

    for idx, row in df.iterrows():
        agency = safe_str(row.get(agency_col)) if agency_col else None
        if not agency:
            continue
        statement = safe_str(row.get(goal_col)) if goal_col else None
        if not statement:
            continue

        goal_id = _generate_goal_id(agency, "strategic_objective", int(idx) if isinstance(idx, (int, float)) else 0)

        goals.append(GPRARawGoal(
            agency=agency,
            goal_type="strategic_objective",
            goal_id=goal_id,
            goal_statement=statement,
            status=safe_str(row.get(status_col)) if status_col else None,
            fiscal_year=_infer_fiscal_year(filepath.stem),
            source_file=filepath.name,
            source_sheet=sheet_name,
            source_row=int(idx) if isinstance(idx, (int, float)) else None,
        ))

    return goals


def _parse_strategic_sheet(
    df: pd.DataFrame, sheet_name: str, filepath: Path
) -> list[GPRARawGoal]:
    """Parse a Strategic Goals sheet."""
    goals: list[GPRARawGoal] = []
    cols = set(df.columns)

    agency_col = _find_column(cols, ["agency", "agency_name", "organization"])
    goal_col = _find_column(cols, ["goal", "strategic_goal", "description", "goal_statement"])

    for idx, row in df.iterrows():
        agency = safe_str(row.get(agency_col)) if agency_col else None
        if not agency:
            continue
        statement = safe_str(row.get(goal_col)) if goal_col else None
        if not statement:
            continue

        goal_id = _generate_goal_id(agency, "strategic_goal", int(idx) if isinstance(idx, (int, float)) else 0)

        goals.append(GPRARawGoal(
            agency=agency,
            goal_type="strategic_goal",
            goal_id=goal_id,
            goal_statement=statement,
            fiscal_year=_infer_fiscal_year(filepath.stem),
            source_file=filepath.name,
            source_sheet=sheet_name,
            source_row=int(idx) if isinstance(idx, (int, float)) else None,
        ))

    return goals


def _parse_generic_sheet(
    df: pd.DataFrame, sheet_name: str, filepath: Path
) -> list[GPRARawGoal]:
    """Attempt to parse an unknown sheet format as goals."""
    goals: list[GPRARawGoal] = []
    cols = set(df.columns)

    agency_col = _find_column(cols, ["agency", "agency_name", "organization"])
    goal_col = _find_column(cols, ["goal", "description", "statement", "objective"])

    if not agency_col or not goal_col:
        logger.debug(f"Sheet '{sheet_name}' doesn't match known goal format, skipping")
        return goals

    for idx, row in df.iterrows():
        agency = safe_str(row.get(agency_col)) if agency_col else None
        statement = safe_str(row.get(goal_col)) if goal_col else None
        if not agency or not statement:
            continue

        goal_id = _generate_goal_id(agency, "strategic_goal", int(idx) if isinstance(idx, (int, float)) else 0)

        goals.append(GPRARawGoal(
            agency=agency,
            goal_type="strategic_goal",
            goal_id=goal_id,
            goal_statement=statement,
            fiscal_year=_infer_fiscal_year(filepath.stem),
            source_file=filepath.name,
            source_sheet=sheet_name,
            source_row=int(idx) if isinstance(idx, (int, float)) else None,
        ))

    return goals


def _find_column(columns: set[str], candidates: list[str]) -> Optional[str]:
    """Find the first matching column name from a list of candidates."""
    for c in candidates:
        if c in columns:
            return c
    return None
