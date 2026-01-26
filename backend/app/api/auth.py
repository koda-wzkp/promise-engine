"""Authentication endpoints."""

import logging
from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from datetime import datetime

from app.database import get_db
from app.models import User
from app.utils.exceptions import ValidationError

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register new user account.

    POST /api/v1/auth/register
    Body: { "email": "user@example.com", "password": "..." }
    """
    data = request.get_json()

    # Basic validation
    if not data or not data.get("email") or not data.get("password"):
        raise ValidationError(
            message="Email and password required",
            code="INVALID_INPUT"
        )

    with get_db() as db:
        # Check if email already exists
        existing = db.query(User).filter_by(email=data["email"]).first()
        if existing:
            raise ValidationError(
                message="Email already registered",
                code="EMAIL_EXISTS",
                details={"email": data["email"]}
            )

        # Hash password
        password_hash = bcrypt.hashpw(
            data["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # Create user
        user = User(
            email=data["email"],
            password_hash=password_hash,
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate JWT token
        token = generate_token(user.id)

        logger.info(f"New user registered: {user.email}")

        return jsonify({
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            "token": token
        }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """User login.

    POST /api/v1/auth/login
    Body: { "email": "user@example.com", "password": "..." }
    """
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        raise ValidationError(
            message="Email and password required",
            code="INVALID_INPUT"
        )

    with get_db() as db:
        user = db.query(User).filter_by(email=data["email"]).first()

        if not user or not user.password_hash:
            raise ValidationError(
                message="Invalid email or password",
                code="INVALID_CREDENTIALS"
            )

        # Verify password
        if not bcrypt.checkpw(
            data["password"].encode("utf-8"),
            user.password_hash.encode("utf-8")
        ):
            raise ValidationError(
                message="Invalid email or password",
                code="INVALID_CREDENTIALS"
            )

        # Generate JWT token
        token = generate_token(user.id)

        logger.info(f"User logged in: {user.email}")

        return jsonify({
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            },
            "token": token
        }), 200


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    """Get current user from token.

    GET /api/v1/auth/me
    Headers: { "Authorization": "Bearer <token>" }
    """
    # Get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise ValidationError(
            message="Missing or invalid authorization header",
            code="UNAUTHORIZED"
        )

    token = auth_header.split(" ")[1]
    payload = verify_token(token)

    with get_db() as db:
        user = db.query(User).filter_by(id=payload["user_id"]).first()
        if not user:
            raise ValidationError(
                message="User not found",
                code="USER_NOT_FOUND"
            )

        return jsonify({
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        }), 200


def generate_token(user_id):
    """Generate JWT token for user.

    Args:
        user_id: User UUID

    Returns:
        JWT token string
    """
    from flask import current_app

    payload = {
        "user_id": str(user_id),
        "exp": datetime.utcnow() + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        "iat": datetime.utcnow()
    }

    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256"
    )

    return token


def verify_token(token):
    """Verify and decode JWT token.

    Args:
        token: JWT token string

    Returns:
        Decoded payload dict

    Raises:
        ValidationError: If token is invalid
    """
    from flask import current_app

    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise ValidationError(
            message="Token has expired",
            code="TOKEN_EXPIRED"
        )
    except jwt.InvalidTokenError:
        raise ValidationError(
            message="Invalid token",
            code="INVALID_TOKEN"
        )
