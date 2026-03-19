"""Fetch GPRA Performance Data Reports (Excel) from performance.gov archives."""

from __future__ import annotations

import logging
from pathlib import Path

from ..common.download_utils import download_file

logger = logging.getLogger(__name__)

GPRA_SOURCES: dict[str, str] = {
    "fy2024": (
        "https://assets.performance.gov/data/performance-data-report/2024/"
        "Performance_Data_Report_FY24-25_FY22-23.xlsx"
    ),
    "fy2023": (
        "https://assets.performance.gov/data/performance-data-report/2023/"
        "Performance_Data_Report.xlsx"
    ),
    "fy2020": (
        "https://trumpadministration.archives.performance.gov/about/"
        "Performance.gov Reports_20210116_FY20_Q4.xlsx"
    ),
}


def download_gpra_data(
    dest_dir: Path,
    sources: dict[str, str] | None = None,
    force: bool = False,
) -> dict[str, Path]:
    """Download GPRA Performance Data Report Excel files.

    Args:
        dest_dir: Directory to save files to.
        sources: Specific sources to download. None downloads all known.
        force: Force re-download even if cached.

    Returns:
        Dict mapping source key (e.g. 'fy2024') to local file path.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)

    if sources is None:
        sources = GPRA_SOURCES

    downloaded: dict[str, Path] = {}
    for key, url in sources.items():
        try:
            filename = f"gpra_{key}.xlsx"
            path = download_file(url, dest_dir, filename=filename, force=force)
            downloaded[key] = path
        except RuntimeError as e:
            logger.warning(f"Failed to download GPRA source '{key}': {e}")

    logger.info(f"Downloaded {len(downloaded)}/{len(sources)} GPRA files")
    return downloaded
