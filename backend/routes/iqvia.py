from flask import Blueprint, request, jsonify
from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool
import os
import time
from functools import wraps
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
import traceback
import re
from decimal import Decimal
import json
from mem0 import MemoryClient
from crewai.memory.external.external_memory import ExternalMemory
from crewai.memory.storage.interface import Storage

# Import database models and helpers
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from db.mock_iqvia_db import Base, Company, Product, Country, Sales, Channel, ATCClassification, DateDimension, IQVIAQueryHelper
# from utils.visualizations import (
#     create_bar_chart, create_line_chart, create_pie_chart, create_table_markdown,
#     embed_image_markdown, create_grouped_bar_chart, create_summary_stats_table
# )

load_dotenv()

# Create Blueprint
iqvia_bp = Blueprint('iqvia', __name__)

# Initialize LLM
llm = LLM(
    model="gemini/gemini-2.5-pro",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)

#Initialize mem0
client = MemoryClient()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ==================== HELPER FUNCTIONS ====================

def get_db_session():
    """Get database session"""
    return SessionLocal()


def get_table_schema():
    """Get comprehensive schema information for all tables"""
    inspector = inspect(engine)
    print(inspector.get_table_names())
    schema_info = {}
    
    tables = ['companies', 'products', 'countries', 'sales', 'channels', 
              'atc_classifications', 'date_dimensions', 'market_shares', 
              'currency_conversion_rates']
    
    for table_name in tables:
        if inspector.has_table(table_name):
            columns = inspector.get_columns(table_name)
            foreign_keys = inspector.get_foreign_keys(table_name)
            schema_info[table_name] = {
                'columns': columns,
                'foreign_keys': foreign_keys
            }
    
    return schema_info


def calculate_cagr(start_value: float, end_value: float, periods: int) -> float:
    """Calculate Compound Annual Growth Rate (CAGR)"""
    if start_value <= 0 or end_value <= 0 or periods <= 0:
        return 0.0
    return (pow(end_value / start_value, 1 / periods) - 1) * 100


def calculate_growth_rate(current: float, previous: float) -> float:
    """Calculate simple growth rate"""
    if previous == 0:
        return 0.0
    return ((current - previous) / previous) * 100


def calculate_market_share(company_sales: float, total_market_sales: float) -> float:
    """Calculate market share percentage"""
    if total_market_sales == 0:
        return 0.0
    return (company_sales / total_market_sales) * 100


# ==================== CREWAI TOOLS ====================

@tool("Execute SQL Query")
def execute_sql_query(query: str) -> str:
    """
    Execute a SQL query against the IQVIA database and return results.
    
    Args:
        query: SQL query string to execute (SELECT queries only for safety)
    
    Returns:
        JSON string with query results or error message
    """
    session = get_db_session()
    try:
        # Security: Only allow SELECT queries
        if not query.strip().upper().startswith('SELECT'):
            return json.dumps({
                "error": "Only SELECT queries are allowed for security reasons",
                "success": False
            })
        
        result = session.execute(text(query))
        rows = result.fetchall()
        columns = result.keys()
        
        # Convert to list of dictionaries
        data = []
        for row in rows:
            row_dict = {}
            for idx, col in enumerate(columns):
                value = row[idx]
                # Handle Decimal serialization
                if isinstance(value, Decimal):
                    value = float(value)
                elif hasattr(value, 'isoformat'):  # Date/DateTime
                    value = value.isoformat()
                row_dict[col] = value
            data.append(row_dict)
        
        return json.dumps({
            "success": True,
            "row_count": len(data),
            "data": data
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "success": False
        })
    finally:
        session.close()


@tool("Get Database Schema")
def get_database_schema() -> str:
    """
    Get the complete database schema including all tables, columns, and relationships.
    Use this to understand the database structure before generating SQL queries.
    
    Returns:
        JSON string with schema information
    """
    try:
        schema = get_table_schema()
        
        # Format schema in a readable way
        formatted_schema = {}
        for table_name, info in schema.items():
            formatted_schema[table_name] = {
                'columns': [
                    {
                        'name': col['name'],
                        'type': str(col['type']),
                        'nullable': col['nullable'],
                        'primary_key': col.get('primary_key', False)
                    }
                    for col in info['columns']
                ],
                'foreign_keys': [
                    {
                        'column': fk['constrained_columns'][0],
                        'references': f"{fk['referred_table']}.{fk['referred_columns'][0]}"
                    }
                    for fk in info['foreign_keys']
                ]
            }
        
        return json.dumps(formatted_schema, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "success": False
        })


@tool("Calculate CAGR")
def calculate_cagr_tool(start_value: float, end_value: float, years: int) -> str:
    """
    Calculate Compound Annual Growth Rate (CAGR).
    
    Args:
        start_value: Initial value
        end_value: Final value
        years: Number of years
    
    Returns:
        JSON string with CAGR percentage
    """
    try:
        cagr = calculate_cagr(start_value, end_value, years)
        return json.dumps({
            "success": True,
            "cagr_percent": round(cagr, 2),
            "start_value": start_value,
            "end_value": end_value,
            "years": years,
            "interpretation": f"{'Growth' if cagr > 0 else 'Decline'} of {abs(round(cagr, 2))}% per year"
        })
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "success": False
        })


@tool("Calculate Growth Metrics")
def calculate_growth_metrics(data: str) -> str:
    """
    Calculate various growth metrics from time-series data.
    
    Args:
        data: JSON string with time-series data (must include 'year' and 'value' fields)
    
    Returns:
        JSON string with calculated metrics including YoY growth, CAGR, etc.
    """
    try:
        data_dict = json.loads(data)
        
        if not isinstance(data_dict, list) or len(data_dict) < 2:
            return json.dumps({
                "error": "Data must be a list with at least 2 data points",
                "success": False
            })
        
        # Sort by year
        sorted_data = sorted(data_dict, key=lambda x: x.get('year', 0))
        
        # Calculate metrics
        metrics = {
            "success": True,
            "data_points": len(sorted_data),
            "start_year": sorted_data[0]['year'],
            "end_year": sorted_data[-1]['year'],
            "start_value": sorted_data[0]['value'],
            "end_value": sorted_data[-1]['value'],
        }
        
        # CAGR
        years = metrics['end_year'] - metrics['start_year']
        if years > 0:
            metrics['cagr_percent'] = round(calculate_cagr(
                metrics['start_value'], 
                metrics['end_value'], 
                years
            ), 2)
        
        # Year-over-year growth rates
        yoy_growth = []
        for i in range(1, len(sorted_data)):
            growth = calculate_growth_rate(
                sorted_data[i]['value'],
                sorted_data[i-1]['value']
            )
            yoy_growth.append({
                "year": sorted_data[i]['year'],
                "growth_percent": round(growth, 2)
            })
        
        metrics['yoy_growth'] = yoy_growth
        metrics['average_yoy_growth'] = round(sum(g['growth_percent'] for g in yoy_growth) / len(yoy_growth), 2)
        
        # Total growth
        total_growth = calculate_growth_rate(metrics['end_value'], metrics['start_value'])
        metrics['total_growth_percent'] = round(total_growth, 2)
        
        return json.dumps(metrics, indent=2)
        
    except Exception as e:
        return json.dumps({
            "error": str(e),
            "success": False
        })


# ==================== RETRY DECORATOR ====================

def retry_with_backoff(max_retries=3, initial_delay=1, backoff_factor=2):
    """Retry decorator with exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        print(f"[Retry {attempt + 1}/{max_retries}] Error: {str(e)}")
                        print(f"Waiting {delay} seconds before retry...")
                        time.sleep(delay)
                        delay *= backoff_factor
                    else:
                        print(f"[Failed] All {max_retries} retries exhausted")
                        raise last_exception
            
            raise last_exception
        return wrapper
    return decorator


# ==================== CREWAI AGENTS ====================

def create_iqvia_intelligence_crew(question: str):
    """Create and configure the IQVIA intelligence crew"""
    
    # Database Schema Expert Agent
    schema_expert = Agent(
        role="Database Schema Expert",
        goal="Understand the IQVIA database structure and provide schema information",
        backstory="""You are an expert in pharmaceutical database structures, 
        particularly IQVIA MIDAS. You understand the relationships between companies, 
        products, sales, markets, and therapeutic classifications. You always check 
        the database schema first before any analysis.""",
        tools=[get_database_schema],
        llm=llm,
        verbose=True
    )
    
    # SQL Query Generator Agent
    sql_expert = Agent(
        role="SQL Query Specialist",
        goal="Generate accurate and optimized SQL queries for pharmaceutical market data",
        backstory="""You are a SQL expert specializing in pharmaceutical market analytics. 
        You write efficient queries to extract sales data, market trends, and competitive 
        intelligence. You understand JOINs, aggregations, and window functions. You always 
        use proper table and column names from the schema. You use wildcards whenever you
        come across names and incomplete information.""",
        tools=[execute_sql_query, get_database_schema],
        llm=llm,
        verbose=True
    )
    
    # Analytics Agent
    analytics_expert = Agent(
        role="Pharmaceutical Market Analyst",
        goal="Analyze pharmaceutical market data and calculate key metrics",
        backstory="""You are a pharmaceutical market analyst with expertise in calculating 
        growth rates, CAGR, market share, and other key performance indicators. You understand 
        market dynamics, competitive positioning, and therapeutic area trends. You provide 
        actionable insights from data.""",
        tools=[calculate_cagr_tool, calculate_growth_metrics],
        llm=llm,
        verbose=True
    )
    
    # Report Writer Agent
    report_writer = Agent(
        role="Intelligence Report Writer",
        goal="Create comprehensive and insightful pharmaceutical market reports",
        backstory="""You are an expert at translating complex pharmaceutical market data 
        and analytics into clear, actionable business intelligence reports. You highlight 
        key findings, trends, and strategic implications.""",
        llm=llm,
        verbose=True
    )
    
    # Define tasks
    schema_task = Task(
        description=f"""Retrieve and understand the IQVIA database schema.
        
        Question to answer: {question}
        
        1. Get the complete database schema
        2. Identify relevant tables for answering the question
        3. Note key relationships and foreign keys
        4. Provide a summary of available data""",
        agent=schema_expert,
        expected_output="Summary of relevant database tables and their relationships"
    )
    
    query_task = Task(
        description=f"""Generate and execute SQL queries to answer the question.
        
        Question: {question}
        
        Based on the schema information:
        1. Create appropriate SQL queries to extract relevant data
        2. Execute the queries and retrieve results
        3. If needed, create multiple queries for different aspects
        4. Ensure queries are optimized and use proper JOINs
        
        Return the raw data results for analysis.""",
        agent=sql_expert,
        expected_output="Query results with relevant pharmaceutical market data",
        context=[schema_task]
    )
    
    analytics_task = Task(
        description=f"""Analyze the data and calculate relevant metrics.
        
        Question: {question}
        
        Based on the query results:
        1. Calculate appropriate metrics (CAGR, growth rates, market share, etc.)
        2. Identify trends and patterns
        3. Compare different segments (companies, products, countries, etc.)
        4. Highlight significant findings
        
        Provide detailed analytics with numbers and percentages.""",
        agent=analytics_expert,
        expected_output="Detailed analytics with calculated metrics and insights",
        context=[query_task]
    )
    
    report_task = Task(
        description=f"""Create a comprehensive intelligence report.
        
        Question: {question}
        
        Create a report with:
        1. Executive Summary - Key findings in 2-3 sentences
        2. Data Overview - What data was analyzed
        3. Key Metrics - CAGR, growth rates, market share, etc.
        4. Detailed Analysis - Trends, patterns, comparisons
        5. Strategic Insights - Business implications
        6. Conclusions and Recommendations
        
        Make it clear, data-driven, and actionable.""",
        agent=report_writer,
        expected_output="Professional pharmaceutical market intelligence report",
        context=[schema_task, query_task, analytics_task]
    )
    
    # Create and return crew
    crew = Crew(
        agents=[schema_expert, sql_expert, analytics_expert, report_writer],
        tasks=[schema_task, query_task, analytics_task, report_task],
        verbose=True,
        memory=True,
        memory_config={
            "provider": "mem0",
            "config": {"user_id": "crew_user_1"},
        },
        embedder={
            "provider": "google-generativeai",
            "config": {
                "api_key": os.getenv('GEMINI_API_KEY'),
                "model": "embedding-001"
            }
        },
        max_rpm=5
    )
    
    return crew


@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
def analyze_with_retry(question: str):
    """Execute IQVIA analysis with automatic retry logic"""
    from crewai import Crew
    crew = create_iqvia_intelligence_crew(question)
    result = crew.kickoff()
    return str(result)


# ==================== API ENDPOINTS ====================

@iqvia_bp.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze IQVIA market data using AI agents
    
    Request body:
    {
        "question": "Your question about pharmaceutical market data"
    }
    
    Example questions:
    - "What are the top 5 products by sales in the United States?"
    - "Calculate the CAGR for Pfizer's sales from 2020 to 2024"
    - "Show market share of companies in the cardiovascular therapeutic area"
    - "What is the quarterly sales trend for products in Germany?"
    """
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                "error": "Missing 'question' in request body",
                "success": False
            }), 400
        
        question = data['question']
        
        if not question.strip():
            return jsonify({
                "error": "Question cannot be empty",
                "success": False
            }), 400
        
        print(f"[IQVIA] Starting analysis for question: {question}")
        
        # Use retry logic for analysis
        result = analyze_with_retry(question)
        
        print(f"[IQVIA] Analysis complete. Result length: {len(result)}")
        
        return jsonify({
            "success": True,
            "question": question,
            "report": result
        }), 200
        
    except Exception as e:
        print(f"[IQVIA Error] {str(e)}")
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@iqvia_bp.route('/query', methods=['POST'])
def direct_query():
    """
    Direct SQL query endpoint (for testing)
    
    Request body:
    {
        "query": "SELECT * FROM companies LIMIT 5"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                "error": "Missing 'query' in request body",
                "success": False
            }), 400
        
        query = data['query']
        
        # Execute query using the tool
        result = execute_sql_query(query)
        result_dict = json.loads(result)
        
        return jsonify(result_dict), 200 if result_dict.get('success') else 400
        
    except Exception as e:
        print(f"[IQVIA Query Error] {str(e)}")
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@iqvia_bp.route('/schema', methods=['GET'])
def get_schema():
    """Get database schema information"""
    try:
        schema = get_database_schema()
        return jsonify(json.loads(schema)), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@iqvia_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint for IQVIA service"""
    try:
        # Test database connection
        session = get_db_session()
        session.execute(text("SELECT 1"))
        session.close()
        
        return jsonify({
            "status": "healthy",
            "service": "iqvia",
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "iqvia",
            "error": str(e)
        }), 500


@iqvia_bp.route('/examples', methods=['GET'])
def get_examples():
    """Get example questions that can be asked"""
    examples = [
        {
            "category": "Sales Analysis",
            "questions": [
                "What are the top 10 products by sales value globally?",
                "Show me total sales by country for 2024",
                "Which distribution channel has the highest sales?",
                "What is the sales breakdown by therapeutic category (ATC Level 1)?"
            ]
        },
        {
            "category": "Growth Metrics",
            "questions": [
                "Calculate the CAGR for total pharmaceutical sales from 2020 to 2024",
                "What is the year-over-year growth rate for Pfizer products?",
                "Show quarterly sales trends for products in the United States",
                "Compare growth rates of different therapeutic categories"
            ]
        },
        {
            "category": "Market Share",
            "questions": [
                "What is the market share of top 5 pharmaceutical companies?",
                "Show market share by company in Germany for cardiovascular drugs",
                "Which company dominates the diabetes treatment market?",
                "Calculate market concentration (HHI) for different therapeutic areas"
            ]
        },
        {
            "category": "Product Analysis",
            "questions": [
                "List all products from Novartis with their sales performance",
                "Which products have shown the highest growth in the last year?",
                "Show product mix by dosage form for each company",
                "Find products nearing patent expiry with high sales"
            ]
        },
        {
            "category": "Geographic Analysis",
            "questions": [
                "Compare pharmaceutical market size across regions",
                "Which countries have the highest per capita pharmaceutical spending?",
                "Show sales distribution between developed and emerging markets",
                "Analyze market penetration by country for specific products"
            ]
        }
    ]
    
    return jsonify({
        "success": True,
        "examples": examples
    }), 200
