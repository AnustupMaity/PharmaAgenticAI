"""
Test script for IQVIA Agent
Tests the SQL generation, query execution, and analytics capabilities
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(__file__))

from routes.iqvia import (
    get_database_schema, 
    execute_sql_query, 
    calculate_cagr_tool,
    calculate_growth_metrics,
    get_db_session
)

load_dotenv()


def test_database_connection():
    """Test 1: Database Connection"""
    print("\n" + "="*60)
    print("TEST 1: Database Connection")
    print("="*60)
    
    try:
        session = get_db_session()
        from sqlalchemy import text
        result = session.execute(text("SELECT 1"))
        session.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def test_schema_retrieval():
    """Test 2: Schema Retrieval"""
    print("\n" + "="*60)
    print("TEST 2: Schema Retrieval")
    print("="*60)
    
    try:
        schema_json = get_database_schema()
        schema = json.loads(schema_json)
        
        print(f"✅ Schema retrieved successfully")
        print(f"📊 Tables found: {len(schema)}")
        
        for table_name in schema.keys():
            print(f"   - {table_name} ({len(schema[table_name]['columns'])} columns)")
        
        return True
    except Exception as e:
        print(f"❌ Schema retrieval failed: {e}")
        return False


def test_simple_query():
    """Test 3: Simple Query Execution"""
    print("\n" + "="*60)
    print("TEST 3: Simple Query Execution")
    print("="*60)
    
    try:
        query = "SELECT COUNT(*) as total_companies FROM companies"
        result_json = execute_sql_query(query)
        result = json.loads(result_json)
        
        if result.get('success'):
            print("✅ Query executed successfully")
            print(f"📊 Result: {result['data']}")
            return True
        else:
            print(f"❌ Query failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Query execution failed: {e}")
        return False


def test_complex_query():
    """Test 4: Complex Query with JOINs"""
    print("\n" + "="*60)
    print("TEST 4: Complex Query with JOINs")
    print("="*60)
    
    try:
        query = """
        SELECT 
            c.company_name,
            COUNT(DISTINCT p.product_id) as product_count,
            COALESCE(SUM(s.sales_value_usd), 0) as total_sales
        FROM companies c
        LEFT JOIN products p ON c.company_id = p.company_id
        LEFT JOIN sales s ON p.product_id = s.product_id
        GROUP BY c.company_id, c.company_name
        ORDER BY total_sales DESC
        LIMIT 5
        """
        
        result_json = execute_sql_query(query)
        result = json.loads(result_json)
        
        if result.get('success'):
            print("✅ Complex query executed successfully")
            print(f"📊 Top 5 Companies by Sales:")
            for row in result['data']:
                print(f"   - {row['company_name']}: ${row['total_sales']:,.2f} ({row['product_count']} products)")
            return True
        else:
            print(f"❌ Query failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Query execution failed: {e}")
        return False


def test_cagr_calculation():
    """Test 5: CAGR Calculation"""
    print("\n" + "="*60)
    print("TEST 5: CAGR Calculation")
    print("="*60)
    
    try:
        # Test data: $100M to $150M over 3 years
        result_json = calculate_cagr_tool(100000000, 150000000, 3)
        result = json.loads(result_json)
        
        if result.get('success'):
            print("✅ CAGR calculation successful")
            print(f"📊 Start Value: ${result['start_value']:,.0f}")
            print(f"📊 End Value: ${result['end_value']:,.0f}")
            print(f"📊 Years: {result['years']}")
            print(f"📊 CAGR: {result['cagr_percent']}%")
            print(f"📊 Interpretation: {result['interpretation']}")
            return True
        else:
            print(f"❌ CAGR calculation failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ CAGR calculation failed: {e}")
        return False


def test_growth_metrics():
    """Test 6: Growth Metrics Calculation"""
    print("\n" + "="*60)
    print("TEST 6: Growth Metrics Calculation")
    print("="*60)
    
    try:
        # Sample time series data
        time_series_data = [
            {"year": 2020, "value": 100000000},
            {"year": 2021, "value": 115000000},
            {"year": 2022, "value": 125000000},
            {"year": 2023, "value": 140000000},
            {"year": 2024, "value": 160000000}
        ]
        
        result_json = calculate_growth_metrics(json.dumps(time_series_data))
        result = json.loads(result_json)
        
        if result.get('success'):
            print("✅ Growth metrics calculation successful")
            print(f"📊 Period: {result['start_year']} - {result['end_year']}")
            print(f"📊 CAGR: {result['cagr_percent']}%")
            print(f"📊 Total Growth: {result['total_growth_percent']}%")
            print(f"📊 Average YoY Growth: {result['average_yoy_growth']}%")
            print(f"📊 Year-over-Year Growth:")
            for yoy in result['yoy_growth']:
                print(f"   - {yoy['year']}: {yoy['growth_percent']}%")
            return True
        else:
            print(f"❌ Growth metrics calculation failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Growth metrics calculation failed: {e}")
        return False


def test_sales_analysis_query():
    """Test 7: Sales Analysis Query"""
    print("\n" + "="*60)
    print("TEST 7: Sales Analysis Query")
    print("="*60)
    
    try:
        query = """
        SELECT 
            co.country_name,
            co.region,
            COUNT(DISTINCT s.product_id) as products_sold,
            SUM(s.units_sold) as total_units,
            SUM(s.sales_value_usd) as total_sales_usd
        FROM sales s
        JOIN countries co ON s.country_id = co.country_id
        GROUP BY co.country_id, co.country_name, co.region
        ORDER BY total_sales_usd DESC
        LIMIT 5
        """
        
        result_json = execute_sql_query(query)
        result = json.loads(result_json)
        
        if result.get('success'):
            print("✅ Sales analysis query executed successfully")
            print(f"📊 Top 5 Markets by Sales:")
            for row in result['data']:
                print(f"   - {row['country_name']} ({row['region']}): ${row['total_sales_usd']:,.2f}")
                print(f"     Products: {row['products_sold']}, Units: {row['total_units']:,}")
            return True
        else:
            print(f"❌ Query failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Query execution failed: {e}")
        return False


def test_therapeutic_category_query():
    """Test 8: Therapeutic Category Analysis"""
    print("\n" + "="*60)
    print("TEST 8: Therapeutic Category Analysis")
    print("="*60)
    
    try:
        query = """
        SELECT 
            atc.atc_level1,
            COUNT(DISTINCT p.product_id) as product_count,
            SUM(s.sales_value_usd) as total_sales
        FROM atc_classifications atc
        JOIN products p ON atc.atc_code = p.atc_code
        LEFT JOIN sales s ON p.product_id = s.product_id
        GROUP BY atc.atc_level1
        ORDER BY total_sales DESC
        """
        
        result_json = execute_sql_query(query)
        result = json.loads(result_json)
        
        if result.get('success'):
            print("✅ Therapeutic category analysis successful")
            print(f"📊 Sales by Therapeutic Category:")
            for row in result['data']:
                if row['total_sales']:
                    print(f"   - {row['atc_level1']}: ${row['total_sales']:,.2f} ({row['product_count']} products)")
            return True
        else:
            print(f"❌ Query failed: {result.get('error')}")
            return False
    except Exception as e:
        print(f"❌ Query execution failed: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 IQVIA AGENT TEST SUITE")
    print("="*60)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Schema Retrieval", test_schema_retrieval),
        ("Simple Query", test_simple_query),
        ("Complex Query with JOINs", test_complex_query),
        ("CAGR Calculation", test_cagr_calculation),
        ("Growth Metrics", test_growth_metrics),
        ("Sales Analysis", test_sales_analysis_query),
        ("Therapeutic Category Analysis", test_therapeutic_category_query)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n📊 Total: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")


if __name__ == "__main__":
    run_all_tests()
