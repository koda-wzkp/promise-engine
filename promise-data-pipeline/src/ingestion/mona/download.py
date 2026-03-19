"""Download all 8 MONA Excel files from the IMF data page."""

from __future__ import annotations

import logging
from pathlib import Path

from ..common.download_utils import download_file

logger = logging.getLogger(__name__)

MONA_BASE = "https://www.imf.org/external/np/pdr/mona/ArrangementsData"

MONA_FILES: dict[str, str] = {
    "description": f"{MONA_BASE}/Description.xlsx",
    "program": f"{MONA_BASE}/Program.xlsx",
    "purchases": f"{MONA_BASE}/Purchases.xlsx",
    "reviews": f"{MONA_BASE}/Reviews.xlsx",
    "qpc": f"{MONA_BASE}/QPC.xlsx",
    "qpc_ind": f"{MONA_BASE}/QPCandIndTarg.xlsx",
    "combined": f"{MONA_BASE}/Combined.xlsx",
    "mecon": f"{MONA_BASE}/Mecon.xlsx",
}

# Files required for core ingestion (others are supplementary)
REQUIRED_FILES = {"description", "combined", "qpc", "reviews"}


def download_mona_data(
    dest_dir: Path,
    files: list[str] | None = None,
    force: bool = False,
) -> dict[str, Path]:
    """Download MONA Excel files.

    Args:
        dest_dir: Directory to save files to.
        files: Specific files to download. None downloads all.
        force: Force re-download even if cached.

    Returns:
        Dict mapping file key to local path.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)

    if files is None:
        files_to_download = MONA_FILES
    else:
        files_to_download = {k: v for k, v in MONA_FILES.items() if k in files}

    downloaded: dict[str, Path] = {}
    for key, url in files_to_download.items():
        try:
            path = download_file(url, dest_dir, filename=f"{key}.xlsx", force=force)
            downloaded[key] = path
        except RuntimeError as e:
            if key in REQUIRED_FILES:
                raise
            logger.warning(f"Failed to download optional file '{key}': {e}")

    logger.info(f"Downloaded {len(downloaded)}/{len(files_to_download)} MONA files")
    return downloaded
