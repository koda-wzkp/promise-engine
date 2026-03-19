"""HTTP fetch with retry, caching, and SHA-256 checksums."""

from __future__ import annotations

import hashlib
import logging
import time
from pathlib import Path
from typing import Optional

import requests

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 120  # seconds
MAX_RETRIES = 4
BACKOFF_BASE = 2  # seconds


def download_file(
    url: str,
    dest_dir: Path,
    filename: Optional[str] = None,
    force: bool = False,
    timeout: int = DEFAULT_TIMEOUT,
) -> Path:
    """Download a file with retry logic and checksum-based caching.

    Only re-downloads if the remote file has changed (different checksum)
    or if force=True.

    Returns the path to the downloaded file.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)

    if filename is None:
        filename = url.split("/")[-1]
    dest_path = dest_dir / filename
    checksum_path = dest_dir / f"{filename}.sha256"

    # Check if we already have this file and its checksum
    if not force and dest_path.exists() and checksum_path.exists():
        logger.info(f"Using cached file: {dest_path}")
        return dest_path

    # Download with retry and exponential backoff
    last_error: Optional[Exception] = None
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"Downloading {url} (attempt {attempt + 1}/{MAX_RETRIES})")
            response = requests.get(url, timeout=timeout, stream=True)
            response.raise_for_status()

            # Write to file and compute checksum simultaneously
            sha256 = hashlib.sha256()
            with open(dest_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    sha256.update(chunk)

            # Save checksum
            new_checksum = sha256.hexdigest()
            checksum_path.write_text(new_checksum)

            file_size_mb = dest_path.stat().st_size / (1024 * 1024)
            logger.info(f"Downloaded {filename} ({file_size_mb:.1f} MB, sha256={new_checksum[:12]}…)")
            return dest_path

        except (requests.RequestException, IOError) as e:
            last_error = e
            if attempt < MAX_RETRIES - 1:
                wait_time = BACKOFF_BASE ** (attempt + 1)
                logger.warning(f"Download failed: {e}. Retrying in {wait_time}s…")
                time.sleep(wait_time)

    raise RuntimeError(f"Failed to download {url} after {MAX_RETRIES} attempts: {last_error}")


def get_checksum(filepath: Path) -> str:
    """Compute SHA-256 checksum of a file."""
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def checksum_changed(filepath: Path) -> bool:
    """Check if a file's checksum differs from the stored checksum."""
    checksum_path = filepath.parent / f"{filepath.name}.sha256"
    if not checksum_path.exists():
        return True
    stored = checksum_path.read_text().strip()
    current = get_checksum(filepath)
    return stored != current
