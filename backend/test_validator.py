import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("=" * 60)
print("Validator API Test Suite")
print("=" * 60)

# Test 1: Health Check
print("\n1. Testing /api/validator/health endpoint:")
try:
    response = requests.get(f"{BASE_URL}/api/validator/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
except requests.exceptions.ConnectionError:
    print("   ❌ ERROR: Cannot connect to server. Is Flask running?")
    print("   Run: python app.py")
    exit(1)
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    exit(1)

print("\n✅ Health check passed!")

# Test 2: Valid pharmaceutical topic
print("\n2. Testing with VALID pharmaceutical topic:")
valid_topics = [
    "Clinical trials for diabetes treatment",
    "FDA approval process for new drugs",
    "mRNA vaccine development",
    "Patent expiration for blockbuster drugs"
]

for topic in valid_topics:
    print(f"\n   Topic: '{topic}'")
    try:
        response = requests.post(
            f"{BASE_URL}/api/validator/validate",
            json={"topic": topic},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Valid: {result.get('is_valid')}")
            print(f"   Reason: {result.get('reason')}")
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    break  # Only test first one for now

# Test 3: Invalid (non-pharmaceutical) topic
print("\n3. Testing with INVALID (non-pharmaceutical) topic:")
invalid_topics = [
    "Best pizza recipes",
    "How to train a dog",
    "Football match schedule",
    "Weather forecast"
]

for topic in invalid_topics:
    print(f"\n   Topic: '{topic}'")
    try:
        response = requests.post(
            f"{BASE_URL}/api/validator/validate",
            json={"topic": topic},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   Valid: {result.get('is_valid')}")
            print(f"   Reason: {result.get('reason')}")
        else:
            print(f"   ❌ Status: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
    
    break  # Only test first one for now

# Test 4: Error cases
print("\n4. Testing error cases:")

print("\n   a) Empty topic:")
try:
    response = requests.post(
        f"{BASE_URL}/api/validator/validate",
        json={"topic": ""},
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 400:
        print("   ✅ Correctly rejected empty topic")
    else:
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

print("\n   b) Missing topic field:")
try:
    response = requests.post(
        f"{BASE_URL}/api/validator/validate",
        json={},
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 400:
        print("   ✅ Correctly rejected missing topic")
    else:
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

print("\n" + "=" * 60)
print("Tests complete!")
print("=" * 60)
