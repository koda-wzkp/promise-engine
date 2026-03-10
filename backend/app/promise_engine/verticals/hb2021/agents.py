"""HB 2021 Agent Definitions - All entities in Oregon's clean energy promise network.

Maps the real-world actors to Promise Theory agents:
- Promisers: utilities (PGE, PacifiCorp, ESS)
- Promisees: ratepayers, EJ communities, tribes, workforce
- Verifiers: Oregon PUC, Oregon DEQ, Citizens' Utility Board
- Legislators: Oregon Legislature (source of statutory promises)
"""

from app.promise_engine.core.models import Agent, AgentType


# ============================================================
# UTILITIES (Promisers)
# ============================================================

PGE = Agent(
    type=AgentType.BUSINESS,
    id="pge",
    metadata={
        "name": "Portland General Electric",
        "short": "PGE",
        "role": "investor_owned_utility",
        "hb2021_role": "promiser",
        "service_territory": "Portland metro, Salem, northern Oregon coast",
        "customers": 930000,
        "baseline_emissions_mtco2e_per_mwh": 0.428,
        "latest_reduction_pct": 27,
        "latest_reduction_year": 2022,
    }
)

PACIFICORP = Agent(
    type=AgentType.BUSINESS,
    id="pacificorp",
    metadata={
        "name": "PacifiCorp / Pacific Power",
        "short": "PAC",
        "role": "investor_owned_utility",
        "hb2021_role": "promiser",
        "service_territory": "Southern, central, and eastern Oregon (multi-state: 6 states)",
        "customers": 620000,
        "baseline_emissions_mtco2e_per_mwh": 0.428,
        "latest_reduction_pct": 13,
        "latest_reduction_year": 2022,
        "note": "Multi-state utility — Oregon targets conflict with other state policies",
    }
)

ESS = Agent(
    type=AgentType.BUSINESS,
    id="ess",
    metadata={
        "name": "Electricity Service Suppliers",
        "short": "ESS",
        "role": "electricity_service_supplier",
        "hb2021_role": "promiser",
        "note": "Serve commercial/industrial customers under direct access. Same targets, lighter oversight.",
    }
)


# ============================================================
# REGULATORS (Verifiers)
# ============================================================

OREGON_PUC = Agent(
    type=AgentType.PLATFORM,
    id="oregon_puc",
    metadata={
        "name": "Oregon Public Utility Commission",
        "short": "PUC",
        "role": "regulator",
        "hb2021_role": "verifier",
        "authority": "Reviews and acknowledges Clean Energy Plans; grants exemptions; sets rate policy",
        "url": "https://www.oregon.gov/puc",
    }
)

OREGON_DEQ = Agent(
    type=AgentType.PLATFORM,
    id="oregon_deq",
    metadata={
        "name": "Oregon Department of Environmental Quality",
        "short": "DEQ",
        "role": "regulator",
        "hb2021_role": "verifier",
        "authority": "Establishes emissions baselines; verifies reported emissions; determines required reductions",
        "url": "https://www.oregon.gov/deq",
    }
)


# ============================================================
# COMMUNITIES (Promisees)
# ============================================================

RATEPAYERS = Agent(
    type=AgentType.COMMUNITY,
    id="ratepayers",
    metadata={
        "name": "Oregon Ratepayers",
        "short": "RP",
        "hb2021_role": "promisee",
        "note": "Residential, commercial, and industrial electricity customers",
    }
)

EJ_COMMUNITIES = Agent(
    type=AgentType.COMMUNITY,
    id="ej_communities",
    metadata={
        "name": "Environmental Justice Communities",
        "short": "EJ",
        "hb2021_role": "promisee",
        "definition": "Communities of color, low-income, tribal, rural, coastal, and limited-infrastructure communities (§2)",
    }
)

TRIBES = Agent(
    type=AgentType.COMMUNITY,
    id="tribes",
    metadata={
        "name": "Federally Recognized Tribes",
        "short": "TRB",
        "hb2021_role": "promisee",
        "note": "HB 2021 §2(3) promises meaningful consultation on energy facility siting",
    }
)

WORKERS = Agent(
    type=AgentType.COMMUNITY,
    id="workers",
    metadata={
        "name": "Clean Energy Workforce",
        "short": "WRK",
        "hb2021_role": "promisee",
        "note": "Workers on renewable energy projects covered by §26 labor standards",
    }
)


# ============================================================
# LEGISLATURE (Source of statutory promises)
# ============================================================

OREGON_LEGISLATURE = Agent(
    type=AgentType.PLATFORM,
    id="or_legislature",
    metadata={
        "name": "Oregon Legislature",
        "short": "LEG",
        "hb2021_role": "legislator",
        "note": "Enacted HB 2021 in 2021. Source of the statutory promises that bind utilities.",
    }
)


# ============================================================
# AUDITORS
# ============================================================

CUB = Agent(
    type=AgentType.PLATFORM,
    id="cub",
    metadata={
        "name": "Citizens' Utility Board",
        "short": "CUB",
        "role": "consumer_advocate",
        "hb2021_role": "auditor",
        "note": "Independent consumer advocacy. Found PacifiCorp overstates future emissions reductions.",
        "url": "https://oregoncub.org",
    }
)


# ============================================================
# REGISTRY
# ============================================================

HB2021_AGENTS = {
    # Utilities
    "pge": PGE,
    "pacificorp": PACIFICORP,
    "ess": ESS,
    # Regulators
    "oregon_puc": OREGON_PUC,
    "oregon_deq": OREGON_DEQ,
    # Communities
    "ratepayers": RATEPAYERS,
    "ej_communities": EJ_COMMUNITIES,
    "tribes": TRIBES,
    "workers": WORKERS,
    # Legislature
    "or_legislature": OREGON_LEGISLATURE,
    # Auditors
    "cub": CUB,
}
