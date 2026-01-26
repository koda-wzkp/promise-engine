"""Promise Engine API - RESTful endpoints for promise verification.

External systems can verify promises, log events, and query integrity scores.
This is the public interface to the Promise Engine kernel.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from typing import Optional

from app.database import init_database, get_db
from app.promise_engine.core.engine import PromiseEngine
from app.promise_engine.core.models import (
    Agent,
    AgentType,
    PromiseEvent,
    PromiseResult,
    SignalStrength,
)
from app.config import Config

# Create blueprint
promise_bp = Blueprint("promise", __name__, url_prefix="/api/v1/promise")

# Initialize Promise Engine (will be set on app startup)
_engine: Optional[PromiseEngine] = None


def init_promise_engine():
    """Initialize Promise Engine with database."""
    global _engine
    if _engine is None:
        _engine = PromiseEngine()
    return _engine


def get_engine() -> PromiseEngine:
    """Get Promise Engine instance."""
    if _engine is None:
        return init_promise_engine()
    return _engine


# ============================================================
# VERIFICATION
# ============================================================

@promise_bp.route("/verify", methods=["POST"])
def verify_promise():
    """Verify a promise and auto-log the result.

    This is the main entry point for promise verification.
    Verifies against schema rules and logs to database.

    Request Body:
        {
            "schema_id": "codec.grind_roast_compatibility",
            "promiser": {"type": "platform", "id": "codec"},
            "promisee": {"type": "user", "id": "customer_123"},
            "input_context": {"roast": "espresso", "grind": "fine"},
            "output": {},  // optional
            "touchpoint_id": "subscription_creation",  // optional
            "journey_id": "journey_abc123"  // optional
        }

    Response:
        {
            "success": true,
            "result": {
                "kept": true,
                "result": "kept",
                "violation": null,
                "details": {}
            },
            "event_id": "uuid",
            "timestamp": "2026-01-26T10:30:00Z"
        }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required = ["schema_id", "promiser", "promisee", "input_context"]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400

        # Parse agents
        try:
            promiser = Agent(
                type=AgentType(data["promiser"]["type"]),
                id=data["promiser"]["id"]
            )
            promisee = Agent(
                type=AgentType(data["promisee"]["type"]),
                id=data["promisee"]["id"]
            )
        except (KeyError, ValueError) as e:
            return jsonify({
                "success": False,
                "error": f"Invalid agent format: {str(e)}"
            }), 400

        # Verify promise
        engine = get_engine()
        result = engine.verify(
            schema_id=data["schema_id"],
            promiser=promiser,
            promisee=promisee,
            input_context=data["input_context"],
            output=data.get("output", {}),
            touchpoint_id=data.get("touchpoint_id"),
            journey_id=data.get("journey_id")
        )

        # Get the logged event (most recent for this verification)
        # In production, we'd return the event_id from verify()

        return jsonify({
            "success": True,
            "result": {
                "kept": result.kept,
                "result": result.result.value,
                "violation": result.violation,
                "details": result.details
            },
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# MANUAL LOGGING
# ============================================================

@promise_bp.route("/log", methods=["POST"])
def log_promise():
    """Manually log a promise event.

    Use this for async verification or external systems that
    determine kept/broken status independently.

    Request Body:
        {
            "vertical": "codec",
            "schema_id": "codec.grind_roast_compatibility",
            "promiser": {"type": "platform", "id": "codec"},
            "promisee": {"type": "user", "id": "customer_123"},
            "input_context": {"roast": "espresso", "grind": "fine"},
            "output": {},
            "result": "kept",  // kept, broken, pending, blocked, renegotiated
            "violation_type": null,  // optional
            "violation_detail": null,  // optional
            "signal_strength": "explicit",  // explicit, implicit, inferred
            "touchpoint_id": "subscription_creation",  // optional
            "journey_id": "journey_abc123"  // optional
        }

    Response:
        {
            "success": true,
            "event_id": "uuid",
            "timestamp": "2026-01-26T10:30:00Z"
        }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required = ["vertical", "schema_id", "promiser", "promisee",
                   "input_context", "result"]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing)}"
            }), 400

        # Parse agents
        try:
            promiser = Agent(
                type=AgentType(data["promiser"]["type"]),
                id=data["promiser"]["id"]
            )
            promisee = Agent(
                type=AgentType(data["promisee"]["type"]),
                id=data["promisee"]["id"]
            )
        except (KeyError, ValueError) as e:
            return jsonify({
                "success": False,
                "error": f"Invalid agent format: {str(e)}"
            }), 400

        # Parse result and signal strength
        try:
            result = PromiseResult(data["result"])
            signal_strength = SignalStrength(data.get("signal_strength", "inferred"))
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": f"Invalid enum value: {str(e)}"
            }), 400

        # Create event
        event = PromiseEvent.create(
            vertical=data["vertical"],
            schema_id=data["schema_id"],
            promiser=promiser,
            promisee=promisee,
            input_context=data["input_context"],
            output=data.get("output", {}),
            result=result,
            violation_type=data.get("violation_type"),
            violation_detail=data.get("violation_detail"),
            signal_strength=signal_strength,
            touchpoint_id=data.get("touchpoint_id"),
            journey_id=data.get("journey_id")
        )

        # Log to database
        engine = get_engine()
        engine.log(event)

        return jsonify({
            "success": True,
            "event_id": str(event.id),
            "timestamp": event.timestamp.isoformat()
        }), 201

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# INTEGRITY SCORES
# ============================================================

@promise_bp.route("/integrity/<agent_type>/<agent_id>", methods=["GET"])
def get_integrity(agent_type: str, agent_id: str):
    """Get integrity score for an agent.

    Query Parameters:
        - vertical: Filter by vertical (optional)
        - since: ISO timestamp - only count promises since this date (optional)
        - refresh: Force recomputation (default: false)

    Response:
        {
            "success": true,
            "integrity": {
                "agent": {"type": "platform", "id": "codec"},
                "overall_score": 0.95,
                "total_promises": 1000,
                "kept_count": 950,
                "broken_count": 40,
                "renegotiated_count": 5,
                "pending_count": 5,
                "trend_30d": 0.02,
                "trend_90d": 0.05,
                "trust_capital": 0.0,
                "recovery_rate": 0.75,
                "computed_at": "2026-01-26T10:30:00Z",
                "vertical": "codec"
            }
        }
    """
    try:
        # Parse agent
        try:
            agent = Agent(
                type=AgentType(agent_type),
                id=agent_id
            )
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": f"Invalid agent type: {str(e)}"
            }), 400

        # Parse query params
        vertical = request.args.get("vertical")
        since_str = request.args.get("since")
        refresh = request.args.get("refresh", "false").lower() == "true"

        since = None
        if since_str:
            try:
                since = datetime.fromisoformat(since_str.replace("Z", "+00:00"))
            except ValueError:
                return jsonify({
                    "success": False,
                    "error": "Invalid 'since' timestamp format. Use ISO 8601."
                }), 400

        # Get integrity score
        engine = get_engine()
        score = engine.get_integrity(
            agent=agent,
            vertical=vertical,
            since=since,
            refresh=refresh
        )

        return jsonify({
            "success": True,
            "integrity": {
                "agent": {"type": agent.type.value, "id": agent.id},
                "overall_score": score.overall_score,
                "total_promises": score.total_promises,
                "kept_count": score.kept_count,
                "broken_count": score.broken_count,
                "renegotiated_count": score.renegotiated_count,
                "pending_count": score.pending_count,
                "trend_30d": score.trend_30d,
                "trend_90d": score.trend_90d,
                "trust_capital": score.trust_capital,
                "recovery_rate": score.recovery_rate,
                "computed_at": score.computed_at.isoformat(),
                "vertical": score.vertical
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# SCHEMAS
# ============================================================

@promise_bp.route("/schemas", methods=["GET"])
def list_schemas():
    """List available promise schemas.

    Query Parameters:
        - vertical: Filter by vertical (optional)

    Response:
        {
            "success": true,
            "schemas": [
                {
                    "id": "codec.grind_roast_compatibility",
                    "version": 1,
                    "vertical": "codec",
                    "name": "Grind-Roast Compatibility",
                    "description": "...",
                    "commitment_type": "configuration_validity",
                    "stakes": "low",
                    "verification_type": "automatic",
                    "training_eligible": true,
                    "domain_tags": ["coffee", "configuration"],
                    "created_at": "2026-01-26T10:00:00Z"
                }
            ]
        }
    """
    try:
        vertical = request.args.get("vertical")

        engine = get_engine()
        schemas = engine.list_schemas(vertical=vertical)

        return jsonify({
            "success": True,
            "schemas": [
                {
                    "id": s.id,
                    "version": s.version,
                    "vertical": s.vertical,
                    "name": s.name,
                    "description": s.description,
                    "commitment_type": s.commitment_type,
                    "stakes": s.stakes,
                    "verification_type": s.verification_type,
                    "training_eligible": s.training_eligible,
                    "domain_tags": s.domain_tags,
                    "created_at": s.created_at.isoformat()
                }
                for s in schemas
            ]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@promise_bp.route("/schemas/<schema_id>", methods=["GET"])
def get_schema(schema_id: str):
    """Get a specific promise schema.

    Response:
        {
            "success": true,
            "schema": {
                "id": "codec.grind_roast_compatibility",
                "version": 1,
                "vertical": "codec",
                "name": "Grind-Roast Compatibility",
                "description": "...",
                "commitment_type": "configuration_validity",
                "stakes": "low",
                "schema_json": {...},
                "verification_type": "automatic",
                "verification_rules": {...},
                "training_eligible": true,
                "domain_tags": ["coffee", "configuration"],
                "created_at": "2026-01-26T10:00:00Z"
            }
        }
    """
    try:
        engine = get_engine()
        schema = engine.get_schema(schema_id)

        if not schema:
            return jsonify({
                "success": False,
                "error": f"Schema not found: {schema_id}"
            }), 404

        return jsonify({
            "success": True,
            "schema": {
                "id": schema.id,
                "version": schema.version,
                "vertical": schema.vertical,
                "name": schema.name,
                "description": schema.description,
                "commitment_type": schema.commitment_type,
                "stakes": schema.stakes,
                "schema_json": schema.schema_json,
                "verification_type": schema.verification_type,
                "verification_rules": schema.verification_rules,
                "training_eligible": schema.training_eligible,
                "domain_tags": schema.domain_tags,
                "created_at": schema.created_at.isoformat()
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# PENDING PROMISES
# ============================================================

@promise_bp.route("/pending/<agent_type>/<agent_id>", methods=["GET"])
def get_pending(agent_type: str, agent_id: str):
    """Get pending promises for an agent.

    Query Parameters:
        - due_before: ISO timestamp - only show promises due before this time (optional)

    Response:
        {
            "success": true,
            "pending": [
                {
                    "id": "uuid",
                    "timestamp": "2026-01-26T10:00:00Z",
                    "schema_id": "codec.delivery_timeline",
                    "promisee": {"type": "user", "id": "customer_123"},
                    "input_context": {...},
                    "result": "pending"
                }
            ]
        }
    """
    try:
        # Parse agent
        try:
            agent = Agent(
                type=AgentType(agent_type),
                id=agent_id
            )
        except ValueError as e:
            return jsonify({
                "success": False,
                "error": f"Invalid agent type: {str(e)}"
            }), 400

        # Parse query params
        due_before_str = request.args.get("due_before")
        due_before = None
        if due_before_str:
            try:
                due_before = datetime.fromisoformat(due_before_str.replace("Z", "+00:00"))
            except ValueError:
                return jsonify({
                    "success": False,
                    "error": "Invalid 'due_before' timestamp format. Use ISO 8601."
                }), 400

        # Get pending promises
        engine = get_engine()
        pending = engine.get_pending(agent, due_before=due_before)

        return jsonify({
            "success": True,
            "pending": [
                {
                    "id": str(e.id),
                    "timestamp": e.timestamp.isoformat(),
                    "schema_id": e.promise_schema_id,
                    "promisee": {"type": e.promisee.type.value, "id": e.promisee.id},
                    "input_context": e.input_context,
                    "result": e.result.value
                }
                for e in pending
            ]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# HEALTH CHECK
# ============================================================

@promise_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint.

    Response:
        {
            "status": "healthy",
            "engine": "initialized",
            "timestamp": "2026-01-26T10:30:00Z"
        }
    """
    try:
        engine = get_engine()
        return jsonify({
            "status": "healthy",
            "engine": "initialized" if engine else "not_initialized",
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }), 500
