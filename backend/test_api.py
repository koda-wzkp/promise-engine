"""Test script for Promise Engine API.

Tests all endpoints:
- POST /api/v1/promise/verify
- POST /api/v1/promise/log
- GET /api/v1/promise/integrity/{agent_type}/{agent_id}
- GET /api/v1/promise/schemas
- GET /api/v1/promise/schemas/{schema_id}
- GET /api/v1/promise/pending/{agent_type}/{agent_id}
- GET /api/v1/promise/health

Run with: python3 test_api.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def print_response(name, response):
    """Pretty print API response."""
    print(f"\n{'=' * 70}")
    print(f"{name}")
    print(f"{'=' * 70}")
    print(f"Status: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))


def test_health():
    """Test health endpoint."""
    response = requests.get(f"{BASE_URL}/api/v1/promise/health")
    print_response("Health Check", response)
    return response.status_code == 200


def test_list_schemas():
    """Test listing schemas."""
    response = requests.get(f"{BASE_URL}/api/v1/promise/schemas")
    print_response("List Schemas", response)
    return response.status_code == 200


def test_get_schema():
    """Test getting specific schema."""
    response = requests.get(
        f"{BASE_URL}/api/v1/promise/schemas/codec.grind_roast_compatibility"
    )
    print_response("Get Schema - Grind-Roast Compatibility", response)
    return response.status_code == 200


def test_verify_kept():
    """Test verifying a promise that is kept."""
    response = requests.post(
        f"{BASE_URL}/api/v1/promise/verify",
        json={
            "schema_id": "codec.grind_roast_compatibility",
            "promiser": {"type": "platform", "id": "codec"},
            "promisee": {"type": "user", "id": "test_customer_001"},
            "input_context": {
                "roast": "espresso",
                "grind": "fine"
            },
            "touchpoint_id": "api_test",
            "journey_id": "test_journey_001"
        }
    )
    print_response("Verify Promise - KEPT (espresso + fine)", response)
    return response.status_code == 200 and response.json()["result"]["kept"]


def test_verify_broken():
    """Test verifying a promise that is broken."""
    response = requests.post(
        f"{BASE_URL}/api/v1/promise/verify",
        json={
            "schema_id": "codec.grind_roast_compatibility",
            "promiser": {"type": "platform", "id": "codec"},
            "promisee": {"type": "user", "id": "test_customer_001"},
            "input_context": {
                "roast": "espresso",
                "grind": "french_press"
            },
            "touchpoint_id": "api_test"
        }
    )
    print_response("Verify Promise - BROKEN (espresso + french_press)", response)
    return response.status_code == 200 and not response.json()["result"]["kept"]


def test_manual_log():
    """Test manually logging a promise event."""
    response = requests.post(
        f"{BASE_URL}/api/v1/promise/log",
        json={
            "vertical": "codec",
            "schema_id": "codec.grind_roast_compatibility",
            "promiser": {"type": "platform", "id": "codec"},
            "promisee": {"type": "user", "id": "test_customer_002"},
            "input_context": {
                "roast": "light",
                "grind": "medium"
            },
            "output": {},
            "result": "kept",
            "signal_strength": "explicit",
            "touchpoint_id": "manual_test"
        }
    )
    print_response("Manual Log - Kept Promise", response)
    return response.status_code == 201


def test_get_integrity():
    """Test getting integrity score."""
    response = requests.get(
        f"{BASE_URL}/api/v1/promise/integrity/platform/codec",
        params={"vertical": "codec", "refresh": "true"}
    )
    print_response("Get Integrity Score - platform:codec", response)
    return response.status_code == 200


def test_get_pending():
    """Test getting pending promises."""
    response = requests.get(
        f"{BASE_URL}/api/v1/promise/pending/platform/codec"
    )
    print_response("Get Pending Promises - platform:codec", response)
    return response.status_code == 200


def main():
    """Run all tests."""
    print("=" * 70)
    print("PROMISE ENGINE API TESTS")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.utcnow().isoformat()}")

    tests = [
        ("Health Check", test_health),
        ("List Schemas", test_list_schemas),
        ("Get Schema", test_get_schema),
        ("Verify Kept Promise", test_verify_kept),
        ("Verify Broken Promise", test_verify_broken),
        ("Manual Log", test_manual_log),
        ("Get Integrity Score", test_get_integrity),
        ("Get Pending Promises", test_get_pending),
    ]

    results = []
    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, passed))
        except Exception as e:
            print(f"\n❌ Test failed: {name}")
            print(f"Error: {str(e)}")
            results.append((name, False))

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")

    print(f"\nResults: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")

    print("=" * 70)


if __name__ == "__main__":
    main()
