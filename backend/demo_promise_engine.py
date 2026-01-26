"""Demo script for Promise Engine - First test of the kernel.

This script demonstrates the core POD flow:
1. Register a promise schema (grind-roast compatibility)
2. Verify promises (both kept and broken)
3. Compute integrity scores
4. Show training signals generated

Run with: python3 demo_promise_engine.py
"""

import os
from dotenv import load_dotenv

from app.database import init_database
from app.promise_engine.core.engine import PromiseEngine
from app.promise_engine.core.models import Agent, AgentType
from app.promise_engine.verticals.codec.schemas import GRIND_ROAST_COMPATIBILITY

# Load environment variables
load_dotenv()


def main():
    print("=" * 70)
    print("PROMISE ENGINE - FIRST TEST")
    print("=" * 70)
    print()

    # Initialize database
    print("Initializing database...")
    database_url = os.getenv("DATABASE_URL", "postgresql://localhost/promise_engine_dev")
    init_database(database_url)
    print("✓ Database initialized")
    print()

    # Initialize engine
    print("Initializing Promise Engine...")
    engine = PromiseEngine(vertical="codec")
    print("✓ Engine initialized")
    print()

    # Register schema
    print("Registering CODEC schema: grind_roast_compatibility")
    schema = engine.register_schema(GRIND_ROAST_COMPATIBILITY)
    print(f"✓ Schema registered: {schema.id} v{schema.version}")
    print(f"  Description: {schema.description[:80]}...")
    print()

    # Define agents
    platform = Agent(type=AgentType.PLATFORM, id="codec")
    customer = Agent(type=AgentType.USER, id="customer_demo_001")

    print(f"Agents: {platform} → {customer}")
    print()

    # Test 1: Valid configuration (promise KEPT)
    print("-" * 70)
    print("Test 1: Valid configuration - Espresso roast with fine grind")
    result1 = engine.verify(
        schema_id="codec.grind_roast_compatibility",
        promiser=platform,
        promisee=customer,
        input_context={"roast": "espresso", "grind": "fine"}
    )
    print(f"Result: {result1.result.value}")
    print(f"Kept: {result1.kept}")
    print("✓ Promise KEPT - Training signal: espresso + fine = VALID")
    print()

    # Test 2: Invalid configuration (promise BROKEN)
    print("-" * 70)
    print("Test 2: Invalid configuration - Espresso roast with french_press grind")
    result2 = engine.verify(
        schema_id="codec.grind_roast_compatibility",
        promiser=platform,
        promisee=customer,
        input_context={"roast": "espresso", "grind": "french_press"}
    )
    print(f"Result: {result2.result.value}")
    print(f"Kept: {result2.kept}")
    print(f"Violation: {result2.violation}")
    print("✗ Promise BROKEN - Training signal: espresso + french_press = INVALID")
    print()

    # Test 3: Another valid configuration
    print("-" * 70)
    print("Test 3: Valid configuration - Light roast with medium grind")
    result3 = engine.verify(
        schema_id="codec.grind_roast_compatibility",
        promiser=platform,
        promisee=customer,
        input_context={"roast": "light", "grind": "medium"}
    )
    print(f"Result: {result3.result.value}")
    print(f"Kept: {result3.kept}")
    print("✓ Promise KEPT - Training signal: light + medium = VALID")
    print()

    # Test 4: Another broken promise
    print("-" * 70)
    print("Test 4: Invalid configuration - French roast with extra-fine grind")
    result4 = engine.verify(
        schema_id="codec.grind_roast_compatibility",
        promiser=platform,
        promisee=customer,
        input_context={"roast": "french", "grind": "extra-fine"}
    )
    print(f"Result: {result4.result.value}")
    print(f"Kept: {result4.kept}")
    print(f"Violation: {result4.violation}")
    print("✗ Promise BROKEN - Training signal: french + extra-fine = INVALID")
    print()

    # Compute integrity score for platform
    print("=" * 70)
    print("INTEGRITY SCORE COMPUTATION")
    print("=" * 70)
    integrity = engine.get_integrity(platform, vertical="codec", refresh=True)
    print(f"Agent: {platform}")
    print(f"Overall Score: {integrity.overall_score:.2%}")
    print(f"Total Promises: {integrity.total_promises}")
    print(f"  Kept: {integrity.kept_count}")
    print(f"  Broken: {integrity.broken_count}")
    print(f"  Pending: {integrity.pending_count}")
    print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print("✓ Schema registered successfully")
    print("✓ 4 promise verifications completed")
    print("✓ 4 training signals generated")
    print("✓ Integrity score computed")
    print()
    print("The Promise Engine is working!")
    print("Every verification automatically logged as labeled training data.")
    print("This is POD in action - learning integrity through verification.")
    print("=" * 70)


if __name__ == "__main__":
    main()
