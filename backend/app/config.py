"""Flask application configuration."""

import os
from datetime import timedelta


class Config:
    """Base configuration."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/promise_engine_dev")
    SQL_ECHO = os.getenv("SQL_ECHO", "False").lower() == "true"

    # CORS
    _cors_raw = os.getenv("CORS_ORIGINS", "*")
    CORS_ORIGINS = _cors_raw if _cors_raw == "*" else [o.strip() for o in _cors_raw.split(",")]

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "24"))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_DAYS", "30"))
    )

    # Stripe
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

    # SendGrid
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@promisepipeline.com")

    # Application
    APP_NAME = os.getenv("APP_NAME", "Promise Engine")
    APP_URL = os.getenv("APP_URL", "http://localhost:5000")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Rate limiting
    RATELIMIT_ENABLED = os.getenv("RATELIMIT_ENABLED", "True").lower() == "true"
    RATELIMIT_STORAGE_URL = os.getenv("RATELIMIT_STORAGE_URL", "memory://")


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    SQL_ECHO = True


class TestingConfig(Config):
    """Testing configuration."""

    TESTING = True
    DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://localhost/promise_engine_test")
    SQL_ECHO = False


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    SQL_ECHO = False
    RATELIMIT_ENABLED = True


# Configuration mapping
config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}
