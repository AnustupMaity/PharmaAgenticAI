import requests
import json
import pytest

# Base URL for the Flask API
BASE_URL = "http://127.0.0.1:8000"


def test_health_check():
    """Test the health check endpoint"""
    print("\n=== Testing Health Check ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "status" in data, "Response should contain 'status' field"
    assert data["status"] == "healthy", "Status should be 'healthy'"


@pytest.mark.parametrize("topic", [
    "Latest developments in mRNA vaccines",
    "FDA approved drugs in 2024",
    "Clinical trials for diabetes treatment"
])
def test_websearch(topic):
    """Test the web search endpoint with different topics"""
    print(f"\n=== Testing Web Search with topic: '{topic}' ===")
    
    # Prepare the request payload
    payload = {"topic": topic}
    
    # Make POST request
    response = requests.post(
        f"{BASE_URL}/api/websearch/research",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    
    result = response.json()
    print(f"\nSuccess!")
    print(f"Topic: {result.get('topic')}")
    
    # Assertions
    assert "topic" in result, "Response should contain 'topic' field"
    assert "report" in result, "Response should contain 'report' field"
    assert "success" in result, "Response should contain 'success' field"
    assert result["success"] == True, "Success should be True"
    assert result["topic"] == topic, "Topic in response should match request"
    assert len(result["report"]) > 0, "Report should not be empty"
    
    print(f"\nReport Preview (first 500 chars):")
    print(result.get('report', '')[:500] + "...")
    print(f"\nFull report length: {len(result.get('report', ''))} characters")


def test_websearch_empty_query():
    """Test the web search endpoint with empty topic"""
    print("\n=== Testing Web Search with empty topic ===")
    
    payload = {"topic": ""}
    
    response = requests.post(
        f"{BASE_URL}/api/websearch/research",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 400, "Empty topic should return 400"


def test_websearch_missing_query():
    """Test the web search endpoint without topic field"""
    print("\n=== Testing Web Search without topic field ===")
    
    payload = {}
    
    response = requests.post(
        f"{BASE_URL}/api/websearch/research",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 400, "Missing topic should return 400"


if __name__ == "__main__":
    # Run tests manually if executed directly
    print("=" * 60)
    print("Flask Web Search API Test Suite (Manual Run)")
    print("=" * 60)
    print("\nNote: For proper pytest execution, run: pytest test_websearch.py")
    print("=" * 60)
    
    try:
        test_health_check()
        print("\n✅ Health check passed!")
        
        test_websearch("Latest developments in mRNA vaccines")
        print("\n✅ Web search test passed!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
