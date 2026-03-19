"""Source-specific field mapping configurations for GPRA and MONA."""

from __future__ import annotations

# GPRA status → Promise Pipeline 5-state taxonomy
GPRA_STATUS_MAP: dict[str, str] = {
    "Met": "verified",
    "Exceeded": "verified",
    "On Track": "declared",
    "Not Met": "violated",
    "Slightly Below Target": "degraded",
    "Noteworthy Progress": "declared",
    "Focus Area": "degraded",
    "Discontinued": "violated",
}

# MONA compliance → Promise Pipeline 5-state taxonomy
MONA_STATUS_MAP: dict[str, str] = {
    "Met": "verified",
    "Met with delay": "degraded",
    "Partially met": "degraded",
    "Not met": "violated",
    "Waived": "declared",
    "Cancelled": "declared",
    "Delayed": "declared",
}

# MONA sector classifications → domain mapping
MONA_SECTOR_MAP: dict[str, str] = {
    "Fiscal": "fiscal",
    "Monetary": "monetary",
    "Financial": "financial",
    "Structural": "structural",
    "Trade": "trade",
    "External": "external",
    "Social": "social",
    "Governance": "governance",
    "Public Financial Management": "fiscal",
    "Revenue": "fiscal",
    "Expenditure": "fiscal",
    "Banking": "financial",
    "Exchange": "monetary",
}

# GPRA agency abbreviations
GPRA_AGENCY_CODES: dict[str, str] = {
    "DOD": "Department of Defense",
    "DOE": "Department of Energy",
    "DOI": "Department of the Interior",
    "DOJ": "Department of Justice",
    "DOL": "Department of Labor",
    "DOT": "Department of Transportation",
    "ED": "Department of Education",
    "EPA": "Environmental Protection Agency",
    "GSA": "General Services Administration",
    "HHS": "Department of Health and Human Services",
    "HUD": "Department of Housing and Urban Development",
    "NASA": "National Aeronautics and Space Administration",
    "NRC": "Nuclear Regulatory Commission",
    "NSF": "National Science Foundation",
    "OPM": "Office of Personnel Management",
    "SBA": "Small Business Administration",
    "SSA": "Social Security Administration",
    "State": "Department of State",
    "Treasury": "Department of the Treasury",
    "USAID": "U.S. Agency for International Development",
    "USDA": "Department of Agriculture",
    "VA": "Department of Veterans Affairs",
    "Commerce": "Department of Commerce",
    "DHS": "Department of Homeland Security",
}

# IMF arrangement type descriptions
MONA_ARRANGEMENT_TYPES: dict[str, str] = {
    "SBA": "Stand-By Arrangement",
    "EFF": "Extended Fund Facility",
    "ECF": "Extended Credit Facility",
    "SCF": "Standby Credit Facility",
    "PSI": "Policy Support Instrument",
    "PCI": "Policy Coordination Instrument",
    "PLL": "Precautionary and Liquidity Line",
    "FCL": "Flexible Credit Line",
    "RFI": "Rapid Financing Instrument",
    "RCF": "Rapid Credit Facility",
    "SMP": "Staff Monitored Program",
}


def map_gpra_status(gpra_status: str) -> str:
    """Map GPRA status to Promise Pipeline 5-state taxonomy."""
    return GPRA_STATUS_MAP.get(gpra_status, "declared")


def map_mona_status(mona_status: str) -> str:
    """Map MONA compliance status to Promise Pipeline 5-state taxonomy."""
    return MONA_STATUS_MAP.get(mona_status, "declared")


def map_mona_sector(sector: str) -> str:
    """Map MONA sector classification to a domain string."""
    if not sector:
        return "unclassified"
    return MONA_SECTOR_MAP.get(sector, sector.lower())
