"""Shared Excel parsing utilities using openpyxl and pandas."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Optional

import pandas as pd

logger = logging.getLogger(__name__)


def read_excel_sheets(
    filepath: Path,
    sheet_names: Optional[list[str]] = None,
) -> dict[str, pd.DataFrame]:
    """Read one or more sheets from an Excel file.

    Args:
        filepath: Path to the Excel file.
        sheet_names: Specific sheets to read. None reads all sheets.

    Returns:
        Dict mapping sheet name to DataFrame.
    """
    logger.info(f"Reading Excel file: {filepath}")
    xls = pd.ExcelFile(filepath)

    available = xls.sheet_names
    logger.info(f"Available sheets: {available}")

    if sheet_names is None:
        sheet_names = available
    else:
        missing = set(sheet_names) - set(available)
        if missing:
            logger.warning(f"Sheets not found in {filepath.name}: {missing}")
        sheet_names = [s for s in sheet_names if s in available]

    result = {}
    for name in sheet_names:
        df = pd.read_excel(xls, sheet_name=name)
        logger.info(f"  Sheet '{name}': {len(df)} rows, {len(df.columns)} columns")
        result[name] = df

    return result


def read_excel_single(
    filepath: Path,
    sheet_name: Optional[str] = None,
) -> pd.DataFrame:
    """Read a single sheet from an Excel file.

    If sheet_name is None, reads the first sheet.
    """
    if sheet_name:
        return pd.read_excel(filepath, sheet_name=sheet_name)
    return pd.read_excel(filepath)


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize column names: strip whitespace, lowercase, replace spaces with underscores."""
    df.columns = [
        str(col).strip().lower().replace(" ", "_").replace(".", "_")
        for col in df.columns
    ]
    return df


def safe_str(value: Any) -> Optional[str]:
    """Convert a cell value to string, handling NaN/None."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    return str(value).strip()


def safe_float(value: Any) -> Optional[float]:
    """Convert a cell value to float, handling NaN/None/non-numeric."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def safe_int(value: Any) -> Optional[int]:
    """Convert a cell value to int, handling NaN/None/non-numeric."""
    f = safe_float(value)
    if f is None:
        return None
    return int(f)
