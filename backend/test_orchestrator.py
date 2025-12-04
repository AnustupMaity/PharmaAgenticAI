"""
Test script for the Orchestrator endpoint
Tests the full workflow: validation → research (if valid)
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_orchestrator_valid_topic():
    """Test orchestrator with a valid pharmaceutical topic"""
    print("\n" + "="*60)
    print("TEST 1: Valid Pharmaceutical Topic")
    print("="*60)
    
    topic = "FDA approvals for diabetes medications in 2024"
    print(f"Topic: {topic}")
    
    response = requests.post(
        f"{BASE_URL}/api/query",
        json={"topic": topic},
        timeout=180  # 3 minutes
    )
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    
    print(f"Success: {data.get('success')}")
    print(f"Validation Result: {data.get('validation', {}).get('is_valid')}")
    print(f"Validation Reason: {data.get('validation', {}).get('reason', 'N/A')[:100]}...")
    
    if data.get('success'):
        print(f"Research Report Length: {len(data.get('research', {}).get('report', ''))} characters")
        print(f"Total Duration: {data.get('total_duration', 'N/A')} seconds")
        print("\nFirst 300 characters of report:")
        print(data.get('research', {}).get('report', '')[:300] + "...")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert data.get('success') == True, "Expected success=True for valid topic"
    assert 'research' in data, "Expected research results"
    
    print("\n✅ Test 1 PASSED")


def test_orchestrator_invalid_topic():
    """Test orchestrator with an invalid (non-pharmaceutical) topic"""
    print("\n" + "="*60)
    print("TEST 2: Invalid Non-Pharmaceutical Topic")
    print("="*60)
    
    topic = "Best Italian restaurants in New York"
    print(f"Topic: {topic}")
    
    response = requests.post(
        f"{BASE_URL}/api/query",
        json={"topic": topic},
        timeout=180
    )
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    
    print(f"Success: {data.get('success')}")
    print(f"Validation Result: {data.get('validation', {}).get('is_valid')}")
    print(f"Message: {data.get('message', 'N/A')}")
    print(f"Suggestion: {data.get('suggestion', 'N/A')}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert data.get('success') == False, "Expected success=False for invalid topic"
    assert 'research' not in data, "Should not have research results for invalid topic"
    assert data.get('validation', {}).get('is_valid') == False, "Validation should be False"
    
    print("\n✅ Test 2 PASSED")


def test_orchestrator_edge_cases():
    """Test orchestrator with edge cases"""
    print("\n" + "="*60)
    print("TEST 3: Edge Cases")
    print("="*60)
    
    # Test empty topic
    print("\nSubtest 3a: Empty topic")
    response = requests.post(
        f"{BASE_URL}/api/query",
        json={"topic": ""},
        timeout=60
    )
    print(f"Empty topic - Status: {response.status_code}")
    assert response.status_code == 400, "Should return 400 for empty topic"
    
    # Test missing topic
    print("\nSubtest 3b: Missing topic field")
    response = requests.post(
        f"{BASE_URL}/api/query",
        json={},
        timeout=60
    )
    print(f"Missing topic - Status: {response.status_code}")
    assert response.status_code == 400, "Should return 400 for missing topic"
    
    print("\n✅ Test 3 PASSED")


def test_orchestrator_health():
    """Test orchestrator health endpoint"""
    print("\n" + "="*60)
    print("TEST 4: Health Check")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/api/health", timeout=10)
    
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Service: {data.get('service')}")
    print(f"Status: {data.get('status')}")
    print(f"Workflow: {data.get('workflow')}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert data.get('status') == 'healthy', "Service should be healthy"
    
    print("\n✅ Test 4 PASSED")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("ORCHESTRATOR ENDPOINT TEST SUITE")
    print("="*60)
    print("\nMake sure the Flask server is running on port 8000")
    print("Command: cd backend && python app.py\n")
    
    try:
        # Test health first
        test_orchestrator_health()
        
        # Test valid topic (long-running)
        test_orchestrator_valid_topic()
        
        # Test invalid topic
        test_orchestrator_invalid_topic()
        
        # Test edge cases
        test_orchestrator_edge_cases()
        
        print("\n" + "="*60)
        print("ALL TESTS PASSED! ✅")
        print("="*60 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server. Is it running on port 8000?\n")
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
