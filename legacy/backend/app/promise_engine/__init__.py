"""Promise Engine - Core Infrastructure for Promise-Oriented Development (POD)

The kernel for a new paradigm in AI training and human coordination.

Every promise kept or broken is:
- A training signal for ethical AI
- A data point in someone's integrity score
- A node in a trust network
- A step toward verifiable trustworthiness

🐳 Make it solid. Make it simple. Make it log everything.
"""

from app.promise_engine.core.models import (
    Agent,
    PromiseEvent,
    PromiseResult,
    SignalStrength,
    IntegrityScore,
    PromiseDelta,
    VerificationResult,
)
from app.promise_engine.core.engine import PromiseEngine

__version__ = "0.1.0"

__all__ = [
    "PromiseEngine",
    "Agent",
    "PromiseEvent",
    "PromiseResult",
    "SignalStrength",
    "IntegrityScore",
    "PromiseDelta",
    "VerificationResult",
]
