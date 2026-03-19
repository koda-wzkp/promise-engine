"""Schema validation and completeness checks for promises and networks."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .promise import Promise, PromiseStatus, VerificationMethod
from .network import PromiseNetwork


@dataclass
class ValidationResult:
    valid: bool
    errors: list[str]
    warnings: list[str]

    @staticmethod
    def ok() -> "ValidationResult":
        return ValidationResult(valid=True, errors=[], warnings=[])

    def add_error(self, msg: str) -> None:
        self.errors.append(msg)
        self.valid = False

    def add_warning(self, msg: str) -> None:
        self.warnings.append(msg)


def validate_promise(promise: Promise) -> ValidationResult:
    """Validate a single promise against the v2.1 schema."""
    result = ValidationResult.ok()

    if not promise.external_id:
        result.add_error("external_id is required")
    if not promise.body:
        result.add_error("body is required")
    if not promise.domain:
        result.add_error("domain is required")

    # Validate status is in the 5-state taxonomy
    valid_statuses = {s.value for s in PromiseStatus}
    if promise.status not in valid_statuses:
        result.add_error(f"Invalid status '{promise.status}'. Must be one of: {valid_statuses}")

    # Validate verification method
    valid_methods = {m.value for m in VerificationMethod}
    if promise.verification_method not in valid_methods:
        result.add_error(
            f"Invalid verification_method '{promise.verification_method}'. "
            f"Must be one of: {valid_methods}"
        )

    # Warnings for missing but recommended fields
    if not promise.promiser:
        result.add_warning("promiser not set")
    if not promise.promisee:
        result.add_warning("promisee not set")
    if promise.target is None:
        result.add_warning("No target date set")
    if promise.status == "verified" and promise.progress is None and promise.required is not None:
        result.add_warning("Promise verified but no progress value recorded")
    if promise.source_raw is None:
        result.add_warning("source_raw not populated — traceability compromised")

    return result


def validate_network(network: PromiseNetwork) -> ValidationResult:
    """Validate a complete promise network."""
    result = ValidationResult.ok()

    if not network.slug:
        result.add_error("Network slug is required")
    if not network.name:
        result.add_error("Network name is required")
    if not network.source_type:
        result.add_error("Network source_type is required")
    if not network.promises:
        result.add_warning("Network has no promises")
    if not network.agents:
        result.add_warning("Network has no agents")

    # Validate all promises
    promise_ids = set()
    for p in network.promises:
        if p.external_id in promise_ids:
            result.add_error(f"Duplicate promise external_id: {p.external_id}")
        promise_ids.add(p.external_id)

        p_result = validate_promise(p)
        for err in p_result.errors:
            result.add_error(f"Promise {p.external_id}: {err}")
        for warn in p_result.warnings:
            result.add_warning(f"Promise {p.external_id}: {warn}")

    # Validate edges reference existing promises
    for edge in network.edges:
        if edge.source_promise_id not in promise_ids:
            result.add_error(
                f"Edge references non-existent source promise: {edge.source_promise_id}"
            )
        if edge.target_promise_id not in promise_ids:
            result.add_error(
                f"Edge references non-existent target promise: {edge.target_promise_id}"
            )

    # Validate agents referenced by promises exist
    agent_ids = {a.external_id for a in network.agents}
    for p in network.promises:
        if p.promiser and p.promiser not in agent_ids:
            result.add_warning(f"Promise {p.external_id} references unknown promiser: {p.promiser}")
        if p.promisee and p.promisee not in agent_ids:
            result.add_warning(f"Promise {p.external_id} references unknown promisee: {p.promisee}")

    return result
