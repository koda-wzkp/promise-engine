"""HB 2021 Vertical - Promise schemas for Oregon's clean energy law.

Tracks the 20 promises embedded in Oregon House Bill 2021 (2021):
- Emissions reduction targets (80%/90%/100% by 2030/2035/2040)
- Clean Energy Plan submissions and PUC review
- Community benefits and environmental justice
- Labor standards for renewable projects
- Rate impact and affordability safeguards
- Fossil fuel ban compliance

Agents: PGE, PacifiCorp, ESS providers, Oregon PUC, Oregon DEQ,
EJ communities, ratepayers, tribes, workforce.
"""

from app.promise_engine.verticals.hb2021.schemas import HB2021_SCHEMAS
from app.promise_engine.verticals.hb2021.agents import HB2021_AGENTS
from app.promise_engine.verticals.hb2021.verification import EmissionsTrajectoryVerifier

__all__ = ["HB2021_SCHEMAS", "HB2021_AGENTS", "EmissionsTrajectoryVerifier"]
