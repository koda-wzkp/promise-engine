"""HB 2021 API - Endpoints for Oregon's clean energy promise tracking.

Provides:
- Dashboard summary (for the frontend HB2021Dashboard)
- Emissions trajectory verification and projections
- Agent registry (utilities, regulators, communities)
- Promise event logging for HB 2021 schemas
"""

from flask import Blueprint, request, jsonify
from datetime import datetime

from app.promise_engine.verticals.hb2021.schemas import HB2021_SCHEMAS
from app.promise_engine.verticals.hb2021.agents import HB2021_AGENTS
from app.promise_engine.verticals.hb2021.verification import (
    EmissionsTrajectoryVerifier,
    TARGETS,
    BASELINE_YEAR,
)

hb2021_bp = Blueprint("hb2021", __name__, url_prefix="/api/v1/hb2021")

# Shared verifier instance
_verifier = EmissionsTrajectoryVerifier()


# ============================================================
# DASHBOARD
# ============================================================

@hb2021_bp.route("/dashboard", methods=["GET"])
def dashboard():
    """Dashboard summary for the HB 2021 vertical.

    Returns all data the frontend needs in a single call:
    utilities, their latest emissions, trajectory status, and projections.

    Response shape matches what HB2021Dashboard.jsx expects.
    """
    try:
        utilities = _build_utility_summaries()

        return jsonify({
            "success": True,
            "dashboard": {
                "vertical": "hb2021",
                "title": "Oregon HB 2021 — Clean Energy Promise Tracker",
                "statutory_targets": [
                    {"year": y, "reduction_pct": p} for y, p in TARGETS
                ],
                "baseline_year": BASELINE_YEAR,
                "utilities": utilities,
                "schema_count": len(HB2021_SCHEMAS),
                "agent_count": len(HB2021_AGENTS),
                "updated_at": datetime.utcnow().isoformat(),
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def _build_utility_summaries():
    """Build per-utility summary objects for the dashboard."""
    # Current known data points (would come from DB in production)
    utility_data = {
        "pge": {
            "name": "Portland General Electric",
            "short": "PGE",
            "reporting_year": 2022,
            "actual_reduction_pct": 27.0,
            "emissions_history": [
                {"year": 2020, "reduction_pct": 22.0},
                {"year": 2021, "reduction_pct": 24.0},
                {"year": 2022, "reduction_pct": 27.0},
            ],
            "cep_status": "accepted_with_conditions",
            "cep_docket": "LC 80",
            "advisory_group_convened": True,
            "new_gas_plants": 0,
        },
        "pacificorp": {
            "name": "PacifiCorp / Pacific Power",
            "short": "PAC",
            "reporting_year": 2022,
            "actual_reduction_pct": 13.0,
            "emissions_history": [
                {"year": 2020, "reduction_pct": 10.0},
                {"year": 2021, "reduction_pct": 11.0},
                {"year": 2022, "reduction_pct": 13.0},
            ],
            "cep_status": "accepted_with_conditions",
            "cep_docket": "LC 82",
            "advisory_group_convened": True,
            "new_gas_plants": 0,
        },
    }

    summaries = []
    for uid, data in utility_data.items():
        # Verify current emissions trajectory
        result = _verifier.verify(
            data["actual_reduction_pct"],
            data["reporting_year"],
            uid,
        )

        # Project forward
        projections = _verifier.project_trajectory(
            data["actual_reduction_pct"],
            data["reporting_year"],
        )

        # Build trajectory points for charting
        trajectory_expected = []
        for year in range(2020, 2041):
            tp = _verifier.expected_reduction(year)
            trajectory_expected.append({
                "year": year,
                "expected_pct": tp.expected_reduction_pct,
            })

        summaries.append({
            "id": uid,
            "name": data["name"],
            "short": data["short"],
            # Emissions
            "emissions": {
                "reporting_year": data["reporting_year"],
                "actual_reduction_pct": data["actual_reduction_pct"],
                "expected_reduction_pct": result.details["expected_reduction_pct"],
                "gap_pct": result.details["gap_pct"],
                "status": result.result.value,
                "history": data["emissions_history"],
                "trajectory_expected": trajectory_expected,
            },
            # Projections
            "projections": {
                year: {
                    "projected_pct": proj["projected_pct"],
                    "target_pct": proj["target_pct"],
                    "gap_pct": proj["gap_pct"],
                    "on_track": proj["on_track"],
                }
                for year, proj in projections.items()
            },
            # Other promise statuses
            "clean_energy_plan": {
                "status": data["cep_status"],
                "docket": data["cep_docket"],
            },
            "community_benefits": {
                "advisory_group_convened": data["advisory_group_convened"],
            },
            "fossil_fuel_ban": {
                "new_gas_plants": data["new_gas_plants"],
                "compliant": data["new_gas_plants"] == 0,
            },
        })

    return summaries


# ============================================================
# TRAJECTORY
# ============================================================

@hb2021_bp.route("/trajectory", methods=["GET"])
def trajectory():
    """Get the expected emissions reduction trajectory.

    Query Parameters:
        year: Specific year to check (optional, returns full trajectory if omitted)
        tolerance: Override default tolerance % (optional, default 5.0)

    Response:
        Full trajectory from baseline to 2040 with expected reduction at each year.
    """
    try:
        year = request.args.get("year", type=int)
        tolerance = request.args.get("tolerance", type=float, default=5.0)

        if year:
            tp = _verifier.expected_reduction(year)
            return jsonify({
                "success": True,
                "trajectory_point": {
                    "year": tp.year,
                    "expected_reduction_pct": tp.expected_reduction_pct,
                    "next_target_year": tp.next_target_year,
                    "next_target_pct": tp.next_target_pct,
                    "years_remaining": tp.years_remaining,
                    "tolerance_pct": tolerance,
                }
            }), 200

        # Full trajectory
        points = []
        for y in range(BASELINE_YEAR, 2041):
            tp = _verifier.expected_reduction(y)
            points.append({
                "year": tp.year,
                "expected_reduction_pct": tp.expected_reduction_pct,
            })

        return jsonify({
            "success": True,
            "trajectory": points,
            "targets": [{"year": y, "reduction_pct": p} for y, p in TARGETS],
            "tolerance_pct": tolerance,
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# VERIFY EMISSIONS
# ============================================================

@hb2021_bp.route("/verify-emissions", methods=["POST"])
def verify_emissions():
    """Verify a utility's emissions reduction against the trajectory.

    Request Body:
        {
            "utility_id": "pge",
            "reporting_year": 2023,
            "actual_reduction_pct": 30.0,
            "tolerance_pct": 5.0  // optional
        }

    Response:
        Verification result with trajectory details and projections.
    """
    try:
        data = request.get_json()

        required = ["utility_id", "reporting_year", "actual_reduction_pct"]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400

        tolerance = data.get("tolerance_pct", 5.0)
        verifier = EmissionsTrajectoryVerifier(tolerance_pct=tolerance)

        result = verifier.verify(
            actual_reduction_pct=data["actual_reduction_pct"],
            reporting_year=data["reporting_year"],
            utility_id=data["utility_id"],
        )

        projections = verifier.project_trajectory(
            actual_reduction_pct=data["actual_reduction_pct"],
            actual_year=data["reporting_year"],
        )

        return jsonify({
            "success": True,
            "verification": {
                "kept": result.kept,
                "result": result.result.value,
                "violation": result.violation,
                "details": result.details,
            },
            "projections": {
                str(year): proj for year, proj in projections.items()
            },
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# AGENTS
# ============================================================

@hb2021_bp.route("/agents", methods=["GET"])
def list_agents():
    """List all HB 2021 agents.

    Query Parameters:
        role: Filter by hb2021_role (promiser, promisee, verifier, auditor, legislator)
        type: Filter by agent type (business, platform, community)
    """
    try:
        role_filter = request.args.get("role")
        type_filter = request.args.get("type")

        agents = []
        for agent_id, agent in HB2021_AGENTS.items():
            # Apply filters
            if type_filter and agent.type.value != type_filter:
                continue
            if role_filter and agent.metadata.get("hb2021_role") != role_filter:
                continue

            agents.append({
                "id": agent.id,
                "type": agent.type.value,
                "name": agent.metadata.get("name", agent.id),
                "short": agent.metadata.get("short", ""),
                "role": agent.metadata.get("hb2021_role", ""),
                "metadata": agent.metadata,
            })

        return jsonify({
            "success": True,
            "agents": agents,
            "count": len(agents),
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@hb2021_bp.route("/agents/<agent_id>", methods=["GET"])
def get_agent(agent_id: str):
    """Get a specific HB 2021 agent by ID."""
    try:
        agent = HB2021_AGENTS.get(agent_id)
        if not agent:
            return jsonify({
                "success": False,
                "error": f"Agent not found: {agent_id}"
            }), 404

        return jsonify({
            "success": True,
            "agent": {
                "id": agent.id,
                "type": agent.type.value,
                "name": agent.metadata.get("name", agent.id),
                "short": agent.metadata.get("short", ""),
                "role": agent.metadata.get("hb2021_role", ""),
                "metadata": agent.metadata,
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================
# SCHEMAS (HB2021-specific)
# ============================================================

@hb2021_bp.route("/schemas", methods=["GET"])
def list_hb2021_schemas():
    """List all HB 2021 promise schemas."""
    try:
        schemas = []
        for schema_id, schema in HB2021_SCHEMAS.items():
            schemas.append({
                "id": schema.id,
                "name": schema.name,
                "description": schema.description,
                "commitment_type": schema.commitment_type,
                "stakes": schema.stakes,
                "verification_type": schema.verification_type,
                "domain_tags": schema.domain_tags,
            })

        return jsonify({
            "success": True,
            "schemas": schemas,
            "count": len(schemas),
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
