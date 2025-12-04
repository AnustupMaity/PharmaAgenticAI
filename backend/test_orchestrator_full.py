"""
Test script for the full orchestrator workflow with all agents
Tests: Validation → Clarification → Permission → Execution
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/api/orchestrator"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def test_full_orchestrator_workflow():
    """Test the complete orchestrator workflow"""
    
    print_section("ORCHESTRATOR FULL WORKFLOW TEST")
    
    # Step 1: Initial query (should trigger validation and possibly clarification)
    print("Step 1: Sending initial query...")
    initial_query = {
        "topic": "diabetes drugs market"
    }
    
    response = requests.post(f"{BASE_URL}/query", json=initial_query)
    print(f"Status Code: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    # Check the stage
    stage = result.get('stage')
    session_id = result.get('session_id')
    
    if stage == 'validation' and not result.get('validation', {}).get('is_valid'):
        print("\n❌ Query rejected by validator - not pharmaceutical related")
        return
    
    # Step 2: Handle clarification if needed
    if stage == 'clarification' and result.get('clarification', {}).get('needs_clarification'):
        print_section("CLARIFICATION STAGE")
        print(f"Clarification Question: {result['clarification']['question']}")
        print(f"Reason: {result['clarification']['reason']}")
        print(f"Round: {result['clarification']['round']}/{result['clarification']['max_rounds']}")
        
        # Simulate user response
        clarification_response = {
            "topic": initial_query['topic'],
            "session_id": session_id,
            "clarification_response": "I want to know about the US market for Type 2 diabetes drugs in the last 5 years"
        }
        
        print("\nSending clarification response...")
        time.sleep(1)
        
        response = requests.post(f"{BASE_URL}/query", json=clarification_response)
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        stage = result.get('stage')
        session_id = result.get('session_id')
    
    # Step 3: Handle permission request
    if stage == 'permission_request':
        print_section("PERMISSION REQUEST STAGE")
        print(f"Refined Query: {result['refined_query']}")
        print(f"\nAgents to be called:")
        
        required_agents = result.get('required_agents', {})
        for agent_name, is_required in required_agents.items():
            status = "✅ WILL BE CALLED" if is_required else "⏭️  SKIPPED"
            print(f"  - {agent_name.upper()}: {status}")
        
        print(f"\nPermission Details:")
        for agent_name, details in result.get('permission_request', {}).items():
            if details['required']:
                print(f"  📋 {agent_name.upper()}")
                print(f"     {details['description']}")
        
        # Grant permission for all required agents
        user_permission = {}
        for agent_name, is_required in required_agents.items():
            user_permission[agent_name] = is_required  # Grant permission for all required agents
        
        permission_response = {
            "topic": initial_query['topic'],
            "session_id": session_id,
            "user_permission": user_permission
        }
        
        print("\n🤝 Granting permission to all required agents...")
        print(f"Permission: {json.dumps(user_permission, indent=2)}")
        time.sleep(1)
        
        response = requests.post(f"{BASE_URL}/query", json=permission_response)
        result = response.json()
        
        stage = result.get('stage')
    
    # Step 4: Final results
    if stage == 'complete':
        print_section("EXECUTION COMPLETE")
        print(f"✅ Success: {result.get('success')}")
        print(f"Original Query: {result.get('original_query')}")
        print(f"Refined Query: {result.get('refined_query')}")
        print(f"Clarification Rounds: {result.get('clarification_rounds')}")
        print(f"Agents Executed: {', '.join(result.get('agents_executed', []))}")
        print(f"\nDurations:")
        for agent, duration in result.get('durations', {}).items():
            print(f"  - {agent}: {duration:.2f}s")
        print(f"Total Duration: {result.get('total_duration', 0):.2f}s")
        
        print(f"\n{'='*80}")
        print("FINAL REPORT")
        print(f"{'='*80}")
        print(result.get('report', 'No report generated'))
        
    print_section("TEST COMPLETE")

def test_invalid_query():
    """Test with an invalid non-pharmaceutical query"""
    print_section("TESTING INVALID QUERY")
    
    invalid_query = {
        "topic": "best restaurants in New York"
    }
    
    print(f"Query: {invalid_query['topic']}")
    response = requests.post(f"{BASE_URL}/query", json=invalid_query)
    result = response.json()
    
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if not result.get('validation', {}).get('is_valid'):
        print("\n✅ Correctly rejected non-pharmaceutical query")
    else:
        print("\n❌ ERROR: Should have rejected non-pharmaceutical query")

def test_health_endpoint():
    """Test the health endpoint"""
    print_section("TESTING HEALTH ENDPOINT")
    
    response = requests.get(f"{BASE_URL}/health")
    result = response.json()
    
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(result, indent=2)}")

if __name__ == "__main__":
    try:
        # Test health first
        test_health_endpoint()
        
        # Test invalid query
        test_invalid_query()
        
        # Test full workflow
        test_full_orchestrator_workflow()
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to Flask server")
        print("Make sure the Flask app is running: python backend/app.py")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
