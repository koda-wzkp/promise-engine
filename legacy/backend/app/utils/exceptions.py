"""Custom validation exceptions."""

from typing import Any, Dict, Optional


class ValidationError(Exception):
    """Base validation error."""

    def __init__(
        self,
        message: str,
        code: str = "INVALID_INPUT",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to API error format."""
        return {"error": {"code": self.code, "message": self.message, "details": self.details}}


class BusinessRuleViolation(ValidationError):
    """Business rule validation error."""

    def __init__(
        self,
        message: str,
        code: str = "BUSINESS_RULE_VIOLATION",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, code, details)
