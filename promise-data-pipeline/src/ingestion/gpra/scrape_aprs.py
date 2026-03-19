"""Scrape individual agency Annual Performance Reports (APRs) as fallback.

Used when centralized Performance Data Reports from performance.gov are
unavailable (e.g., during administration transitions). APRs are published
as PDFs on individual agency websites.

This module is a stub — full implementation requires Claude API for PDF
extraction. Only implement when Excel data is unavailable.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


def scrape_agency_aprs(
    agency_urls: dict[str, str],
    dest_dir: Path,
) -> dict[str, Path]:
    """Download APR PDFs from agency websites.

    Args:
        agency_urls: Mapping of agency code → APR PDF URL.
        dest_dir: Directory to save PDFs.

    Returns:
        Mapping of agency code → local PDF path.

    Note:
        PDF parsing requires ANTHROPIC_API_KEY for Claude-assisted extraction.
        This is the fallback path — prefer Excel data from performance.gov.
    """
    logger.warning(
        "APR scraping is a stub. Use download_gpra_data() for Excel sources first. "
        "APR PDF extraction requires Claude API integration (not yet implemented)."
    )
    return {}
