"""Beta signup endpoints."""

import logging
from flask import Blueprint, request, jsonify
from datetime import datetime

from app.database import get_db
from app.models import BetaSignup
from app.utils.exceptions import ValidationError

logger = logging.getLogger(__name__)

beta_bp = Blueprint("beta", __name__)


@beta_bp.route("/signup", methods=["POST"])
def beta_signup():
    """Collect beta signup email.

    POST /api/v1/beta/signup
    Body: { "email": "user@example.com" }
    """
    data = request.get_json()

    # Validate email
    if not data or not data.get("email"):
        raise ValidationError(
            message="Email required",
            code="INVALID_INPUT"
        )

    email = data["email"].strip().lower()

    # Basic email validation
    if "@" not in email or "." not in email:
        raise ValidationError(
            message="Invalid email format",
            code="INVALID_EMAIL"
        )

    with get_db() as db:
        # Check if already signed up
        existing = db.query(BetaSignup).filter_by(email=email).first()
        if existing:
            # Return success anyway (don't reveal if email exists)
            return jsonify({
                "message": "Thanks! We'll notify you when beta opens."
            }), 200

        # Create beta signup
        signup = BetaSignup(
            email=email,
            created_at=datetime.utcnow()
        )

        db.add(signup)
        db.commit()

        logger.info(f"New beta signup: {email}")

        return jsonify({
            "message": "Thanks! We'll notify you when beta opens."
        }), 201
