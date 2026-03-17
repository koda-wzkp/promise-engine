"""Flask application factory."""

import logging
from flask import Flask, jsonify
from flask_cors import CORS

from app.database import init_database
from app.config import Config

logger = logging.getLogger(__name__)

__version__ = "0.1.0"


def create_app(config=None):
    """Create and configure Flask application.

    Args:
        config: Configuration object or dict (optional)

    Returns:
        Configured Flask application
    """
    app = Flask(__name__)

    # Load configuration
    if config is None:
        app.config.from_object(Config)
    elif isinstance(config, dict):
        app.config.update(config)
    else:
        app.config.from_object(config)

    # Enable CORS
    cors_config = app.config.get("CORS_ORIGINS", "")
    if cors_config:
        cors_origins = [o.strip() for o in cors_config.split(",") if o.strip()]
    else:
        cors_origins = ["https://promisepipeline.com", "http://localhost:3000"]
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": cors_origins,
                "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    # Initialize database
    init_database(database_url=app.config["DATABASE_URL"], echo=app.config.get("SQL_ECHO", False))

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    register_blueprints(app)

    logger.info(f"Flask app created - Environment: {app.config.get('ENV')}")

    return app


def register_error_handlers(app):
    """Register global error handlers."""
    from app.utils.exceptions import ValidationError, BusinessRuleViolation

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle validation errors."""
        return jsonify(error.to_dict()), 400

    @app.errorhandler(BusinessRuleViolation)
    def handle_business_rule_violation(error):
        """Handle business rule violations."""
        return jsonify(error.to_dict()), 409

    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 errors."""
        return jsonify({"error": {"code": "NOT_FOUND", "message": "Resource not found", "details": {}}}), 404

    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle internal server errors."""
        import traceback

        # Log error to console
        logger.error(f"Internal server error: {error}")
        logger.error(traceback.format_exc())

        return (
            jsonify(
                {"error": {"code": "INTERNAL_ERROR", "message": "An internal server error occurred", "details": {}}}
            ),
            500,
        )


def register_blueprints(app):
    """Register API blueprints."""
    from app.api.auth import auth_bp
    from app.api.beta import beta_bp
    from app.api.promise import promise_bp
    from app.api.hb2021 import hb2021_bp

    # API v1 blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(beta_bp, url_prefix="/api/v1/beta")
    app.register_blueprint(promise_bp)  # Already has /api/v1/promise prefix
    app.register_blueprint(hb2021_bp)  # Already has /api/v1/hb2021 prefix

    logger.info("API blueprints registered")

    # Initialize Promise Engine and load schemas (after blueprints)
    try:
        init_promise_schemas()
    except Exception as e:
        logger.error(f"Error initializing Promise Engine: {str(e)}")
        # Don't crash the app if schema initialization fails
        pass


def init_promise_schemas():
    """Initialize Promise Engine and register schemas."""
    from app.api.promise import init_promise_engine
    from app.promise_engine.verticals import ALL_SCHEMAS

    engine = init_promise_engine()

    # Register all vertical schemas
    for schema_id, schema in ALL_SCHEMAS.items():
        try:
            existing = engine.get_schema(schema_id)
            if existing:
                logger.info(f"Schema already registered: {schema_id}")
            else:
                engine.register_schema(schema)
                logger.info(f"Registered new schema: {schema_id}")
        except Exception as e:
            logger.error(f"Error registering schema {schema_id}: {str(e)}")
            continue

    logger.info(f"Promise Engine initialized with {len(ALL_SCHEMAS)} schemas")
