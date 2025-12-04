"""
Test script for the parallel orchestrator
Tests the validation → parallel execution (websearch + iqvia) → unified report workflow
"""

import requests
import json
import time


BASE_URL = "http://localhost:8000"


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f" {title}")
    print("=" * 80 + "\n")


def test_health_check():
    """Test the health check endpoint"""
    print_section("Testing Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_orchestrator_health():
    """Test the orchestrator health check"""
    print_section("Testing Orchestrator Health")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_valid_query():
    """Test orchestrator with a valid pharmaceutical query"""
    print_section("Testing Valid Pharmaceutical Query")
    
    query = {
        "topic": "What are the top selling diabetes medications in 2024?"
    }
    
    print(f"Query: {query['topic']}\n")
    print("Sending request... (this may take 30-60 seconds for parallel execution)\n")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json=query,
            headers={"Content-Type": "application/json"}
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Total Time: {elapsed_time:.2f} seconds\n")
        
        result = response.json()
        
        # Print validation result
        print("📋 VALIDATION RESULT:")
        print(f"  Valid: {result.get('validation', {}).get('is_valid', False)}")
        print(f"  Reason: {result.get('validation', {}).get('reason', 'N/A')}")
        print(f"  Duration: {result.get('validation', {}).get('duration', 0):.2f}s\n")
        
        # Print agents execution results
        if 'agents_execution' in result:
            print("🤖 AGENTS EXECUTION:")
            
            websearch = result['agents_execution'].get('websearch', {})
            print(f"  Web Search Agent:")
            print(f"    Success: {websearch.get('success', False)}")
            print(f"    Duration: {websearch.get('duration', 0):.2f}s")
            if websearch.get('error'):
                print(f"    Error: {websearch.get('error')}")
            
            iqvia = result['agents_execution'].get('iqvia', {})
            print(f"  IQVIA Agent:")
            print(f"    Success: {iqvia.get('success', False)}")
            print(f"    Duration: {iqvia.get('duration', 0):.2f}s")
            if iqvia.get('error'):
                print(f"    Error: {iqvia.get('error')}")
            
            print(f"  Parallel Duration: {result['agents_execution'].get('parallel_duration', 0):.2f}s\n")
        
        # Print final report (first 2000 characters)
        if 'final_report' in result:
            print("📊 FINAL UNIFIED REPORT (Preview):")
            print("-" * 80)
            report = result['final_report']
            if len(report) > 2000:
                print(report[:2000] + "\n... (truncated)")
            else:
                print(report)
            print("-" * 80)
        
        # Save full report to file
        if 'final_report' in result:
            with open('orchestrator_test_report.txt', 'w', encoding='utf-8') as f:
                f.write(result['final_report'])
            print("\n✅ Full report saved to: orchestrator_test_report.txt")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_invalid_query():
    """Test orchestrator with an invalid (non-pharmaceutical) query"""
    print_section("Testing Invalid (Non-Pharmaceutical) Query")
    
    query = {
        "topic": "Best vacation spots in Europe"
    }
    
    print(f"Query: {query['topic']}\n")
    print("Sending request...\n")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json=query,
            headers={"Content-Type": "application/json"}
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"Status Code: {response.status_code}")
        print(f"Total Time: {elapsed_time:.2f} seconds\n")
        
        result = response.json()
        
        print("📋 VALIDATION RESULT:")
        print(f"  Valid: {result.get('validation', {}).get('is_valid', False)}")
        print(f"  Reason: {result.get('validation', {}).get('reason', 'N/A')}")
        print(f"  Message: {result.get('message', 'N/A')}\n")
        
        # Should be rejected
        is_rejected = not result.get('validation', {}).get('is_valid', False)
        
        if is_rejected:
            print("✅ Query correctly rejected as non-pharmaceutical")
        else:
            print("❌ Query should have been rejected")
        
        return is_rejected
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_empty_query():
    """Test orchestrator with empty query"""
    print_section("Testing Empty Query")
    
    query = {
        "topic": ""
    }
    
    print("Sending empty query...\n")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json=query,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}\n")
        
        # Should return 400 error
        if response.status_code == 400:
            print("✅ Empty query correctly rejected")
            return True
        else:
            print("❌ Should have returned 400 error")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print(" ORCHESTRATOR PARALLEL EXECUTION TEST SUITE")
    print("=" * 80)
    print("\nThis test suite validates the parallel orchestrator workflow:")
    print("  1. Topic validation")
    print("  2. Parallel execution of Web Search + IQVIA agents")
    print("  3. Unified report generation with clear source distinction")
    print("\n")
    
    results = {
        "Health Check": test_health_check(),
        "Orchestrator Health": test_orchestrator_health(),
        "Empty Query": test_empty_query(),
        "Invalid Query": test_invalid_query(),
        "Valid Query (Full Workflow)": test_valid_query()
    }
    
    # Print summary
    print_section("TEST SUMMARY")
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")


if __name__ == "__main__":
    main()
