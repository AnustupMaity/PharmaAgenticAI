from flask import Blueprint, request, jsonify
from crewai import Agent, Task, Crew, LLM
from crewai_tools import SerperDevTool
import os
import time
from functools import wraps
from dotenv import load_dotenv


load_dotenv()

# Retry decorator with exponential backoff
def retry_with_backoff(max_retries=3, initial_delay=1, backoff_factor=2):
    """
    Retry decorator with exponential backoff
    
    Args:
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
        backoff_factor: Multiplier for delay between retries
    """
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

# Create Blueprint
websearch_bp = Blueprint('websearch', __name__)

# Initialize LLM
llm = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)

# Initialize search tool
search_tool = SerperDevTool()

def create_web_intel_crew(topic: str):
    """Create and configure the web intelligence crew"""
    
    # Web Research Agent
    researcher = Agent(
        role="Web Intelligence Researcher",
        goal=f"Conduct comprehensive web research on: {topic}",
        backstory="""You are an expert web researcher specializing in gathering 
        intelligence from public sources. You excel at finding relevant information, 
        verifying facts, and identifying key insights from web searches.""",
        tools=[search_tool],
         mcps=[
        "crewai-amp:financial-data",                         # CrewAI AMP marketplace
        "crewai-amp:research-tools#pubmed_search"            # Specific AMP tool
        ],
        llm=llm,
        verbose=True,
        max_rpm=2
    )
    
    # Analysis Agent
    analyst = Agent(
        role="Intelligence Analyst",
        goal="Analyze gathered information and extract key insights",
        backstory="""You are a skilled analyst who can identify patterns, 
        trends, and key insights from raw research data. You excel at synthesizing 
        information and drawing meaningful conclusions.""",
        llm=llm,
        verbose=True
    )
    
    # Report Writer Agent
    writer = Agent(
        role="Intelligence Report Writer",
        goal="Create comprehensive, well-structured intelligence reports",
        backstory="""You are an expert at creating clear, concise, and actionable 
        intelligence reports. You know how to present complex information in an 
        accessible format.""",
        llm=llm,
        verbose=True
    )
    
    # Define tasks
    research_task = Task(
        description=f"""Conduct comprehensive web research on: {topic}
        
        Search for:
        - Recent developments and news
        - Key facts and statistics
        - Expert opinions and analysis
        - Relevant trends and patterns
        
        Gather information from multiple reliable sources.""",
        agent=researcher,
        expected_output="Detailed research findings with sources"
    )
    
    analysis_task = Task(
        description="""Analyze the research findings and extract key insights.
        
        Focus on:
        - Main themes and patterns
        - Critical insights
        - Notable trends
        - Important implications
        
        Provide a structured analysis.""",
        agent=analyst,
        expected_output="Structured analysis with key insights"
    )
    
    writing_task = Task(
        description="""Create a comprehensive intelligence report.
        
        The report should include:
        1. Executive Summary
        2. Key Findings
        3. Detailed Analysis
        4. Insights and Implications
        5. Conclusions
        
        Make it clear, concise, and actionable.""",
        agent=writer,
        expected_output="Professional intelligence report"
    )
    
    # Create and return crew
    crew = Crew(
        agents=[researcher, analyst, writer],
        tasks=[research_task, analysis_task, writing_task],
        verbose=True,
        memory=True,
        embedder={
        "provider": "google-generativeai",  # Match your LLM provider
"config": {
    "api_key": f"{os.getenv('GEMINI_API_KEY')}",
    "model": "embedding-001"  # Gemini's embedding model
}
    }
    )
    
    return crew


@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
def research_with_retry(topic: str):
    """Execute research with automatic retry logic"""
    crew = create_web_intel_crew(topic)
    result = crew.kickoff()
    return str(result)

@websearch_bp.route('/research', methods=['POST'])
def research():
    """
    Endpoint to conduct web intelligence research
    
    Request body:
    {
        "topic": "your research topic"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({
                "error": "Missing 'topic' in request body",
                "success": False
            }), 400
        
        topic = data['topic']
        
        if not topic.strip():
            return jsonify({
                "error": "Topic cannot be empty",
                "success": False
            }), 400
        
        print(f"[WebSearch] Starting research on topic: {topic}")
        
        # Use retry logic for research
        result = research_with_retry(topic)
        
        print(f"[WebSearch] Research complete. Result length: {len(result)}")
        
        return jsonify({
            "success": True,
            "topic": topic,
            "report": result
        }), 200
        
    except Exception as e:
        print(f"[WebSearch Error] {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500

@websearch_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint for websearch service"""
    return jsonify({
        "status": "healthy",
        "service": "websearch"
    }), 200
