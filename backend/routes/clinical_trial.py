from flask import Blueprint, request, jsonify
import os
import requests
import json
import time
import traceback
from functools import wraps
from dotenv import load_dotenv

from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool

load_dotenv()

CLINICAL_TRIALS_MCP_URL = os.getenv("CLINICAL_TRIALS_MCP_URL", "http://localhost:8004")

clinical_trials_bp = Blueprint('clinical_trials', __name__)


def call_mcp(path: str, payload: dict):
    """Call the Clinical Trials MCP server endpoint"""
    url = f"{CLINICAL_TRIALS_MCP_URL}{path}"
    try:
        r = requests.post(url, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()
    except requests.HTTPError as e:
        # return error payload
        try:
            return {"error": r.text}
        except Exception:
            return {"error": str(e)}
    except Exception as e:
        return {"error": str(e)}


# ==================== CREWAI TOOLS ====================

@tool("Search Trials by Condition")
def search_trials_by_condition_tool(condition: str) -> str:
    """Search for clinical trials by medical condition or disease.

    Args:
        condition: Medical condition, disease name, or therapeutic area to search for.

    Returns:
        List of clinical trials for the specified condition or error structure.
    """
    payload = {"condition": condition}
    return call_mcp("/tools/search_trials_by_condition", payload)


@tool("Search Trials by Phase")
def search_trials_by_phase_tool(phase: str) -> str:
    """Search for clinical trials by phase.

    Args:
        phase: Clinical trial phase (Preclinical, Phase I, Phase II, Phase III, Phase IV).

    Returns:
        List of clinical trials in the specified phase or error structure.
    """
    payload = {"phase": phase}
    return call_mcp("/tools/search_trials_by_phase", payload)


@tool("Search Trials by Sponsor")
def search_trials_by_sponsor_tool(sponsor: str) -> str:
    """Search for clinical trials by sponsor or organization.

    Args:
        sponsor: Name of the sponsoring organization or pharmaceutical company.

    Returns:
        List of clinical trials sponsored by the organization or error structure.
    """
    payload = {"sponsor": sponsor}
    return call_mcp("/tools/search_trials_by_sponsor", payload)


@tool("Search Trials by Status")
def search_trials_by_status_tool(status: str) -> str:
    """Search for clinical trials by their current status.

    Args:
        status: Trial status (Recruiting, Completed, Terminated, Withdrawn, Suspended, Active, Not Recruiting).

    Returns:
        List of clinical trials with the specified status or error structure.
    """
    payload = {"status": status}
    return call_mcp("/tools/search_trials_by_status", payload)


@tool("Search Trials by Location")
def search_trials_by_location_tool(location: str) -> str:
    """Search for clinical trials by geographic location.

    Args:
        location: Country, city, or region where trials are conducted.

    Returns:
        List of clinical trials in the specified location or error structure.
    """
    payload = {"location": location}
    return call_mcp("/tools/search_trials_by_location", payload)


@tool("Search Trials by Intervention")
def search_trials_by_intervention_tool(intervention: str) -> str:
    """Search for clinical trials by intervention or treatment type.

    Args:
        intervention: Type of intervention, drug name, or treatment approach.

    Returns:
        List of clinical trials using the specified intervention or error structure.
    """
    payload = {"intervention": intervention}
    return call_mcp("/tools/search_trials_by_intervention", payload)


@tool("Search Trials by Date Range")
def search_trials_by_date_range_tool(start_date: str, end_date: str) -> str:
    """Search for clinical trials by start date range.

    Args:
        start_date: Start date in YYYY-MM-DD format.
        end_date: End date in YYYY-MM-DD format.

    Returns:
        List of clinical trials started within the date range or error structure.
    """
    payload = {"start_date": start_date, "end_date": end_date}
    return call_mcp("/tools/search_trials_by_date_range", payload)


# Initialize LLM
llm = LLM(
    model=os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-pro"),
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)


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


def create_clinical_trials_crew(question: str):
    """Create and configure the Clinical Trials intelligence crew"""
    
    # Clinical Trials Research Agent
    researcher = Agent(
        role="Clinical Trials Researcher",
        goal=f"Search and gather comprehensive clinical trial information for: {question}",
        backstory="""You are an expert clinical research analyst specializing in pharmaceutical 
        and biotechnology clinical trials. You use various search tools to find relevant trials 
        based on conditions, phases, sponsors, locations, interventions, and timelines. You understand 
        trial design, regulatory requirements, and clinical development strategies.""",
        tools=[
            search_trials_by_condition_tool,
            search_trials_by_phase_tool,
            search_trials_by_sponsor_tool,
            search_trials_by_status_tool,
            search_trials_by_location_tool,
            search_trials_by_intervention_tool,
            search_trials_by_date_range_tool
        ],
        llm=llm,
        verbose=True,
    )

    # Clinical Trials Analyst Agent
    analyst = Agent(
        role="Clinical Development Analyst",
        goal="Analyze clinical trial data to extract strategic insights and competitive intelligence",
        backstory="""You are a seasoned clinical development strategist who interprets trial landscapes, 
        identifies development trends, competitive positioning, and regulatory patterns. You assess trial 
        success rates, enrollment challenges, geographic strategies, and therapeutic area dynamics. You 
        synthesize raw trial data into actionable pharmaceutical development intelligence.""",
        llm=llm,
        verbose=True,
    )

    # Report Writer Agent
    writer = Agent(
        role="Clinical Intelligence Report Writer",
        goal="Create comprehensive clinical trials intelligence reports with clear findings",
        backstory="""You are an expert medical writer who creates clear, concise clinical trial 
        intelligence reports. You present findings in an organized manner highlighting key trials, 
        development trends, competitive landscape, enrollment patterns, geographic distribution, 
        and strategic recommendations for pharmaceutical development.""",
        llm=llm,
        verbose=True,
    )

    # Define tasks
    research_task = Task(
        description=f"""Search for relevant clinical trials related to: {question}
        
        Use multiple search strategies to gather comprehensive trial data:
        1. Search by condition/disease if mentioned
        2. Search by phase if specified
        3. Search by sponsor/company if mentioned
        4. Search by location if geographic focus exists
        5. Search by intervention if treatment type is mentioned
        6. Search by status to understand active vs completed trials
        
        Gather complete trial details including title, phase, condition, intervention, 
        sponsor, dates, status, location, enrollment, and results summaries.""",
        agent=researcher,
        expected_output="""Complete list of relevant clinical trials with full details including:
        - Trial titles and identifiers
        - Phase and status
        - Medical conditions and interventions
        - Sponsors and locations
        - Start/end dates and enrollment numbers
        - Results summaries where available"""
    )

    analysis_task = Task(
        description=f"""Analyze the gathered clinical trial data to extract strategic insights:
        
        1. **Development Pipeline Analysis**: Assess the depth and breadth of clinical pipelines
        2. **Phase Distribution**: Analyze distribution across trial phases
        3. **Competitive Landscape**: Identify major sponsors and their strategies
        4. **Geographic Patterns**: Analyze trial location strategies
        5. **Enrollment Trends**: Assess enrollment sizes and patterns
        6. **Timeline Analysis**: Evaluate trial durations and completion rates
        7. **Success Indicators**: Identify completed trials with results
        8. **Therapeutic Focus**: Analyze concentration in disease areas
        9. **Intervention Types**: Categorize treatment approaches
        10. **Strategic Gaps**: Identify opportunities and white spaces
        
        For question: {question}""",
        agent=analyst,
        expected_output="""Detailed clinical trials analysis covering:
        - Pipeline depth and maturity assessment
        - Competitive positioning and sponsor strategies
        - Geographic and enrollment patterns
        - Phase distribution and success rates
        - Therapeutic area concentrations
        - Timeline and completion trends
        - Strategic opportunities and risks
        - Market access considerations""",
        context=[research_task]
    )

    report_task = Task(
        description=f"""Create a comprehensive clinical trials intelligence report:
        
        **Report Structure:**
        
        1. **Executive Summary**
           - Key findings (3-5 bullet points)
           - Critical insights and implications
        
        2. **Clinical Trials Overview**
           - Total number of trials identified
           - Phase distribution breakdown
           - Status summary (active, recruiting, completed)
        
        3. **Competitive Landscape**
           - Major sponsors and their trial counts
           - Sponsor strategies and focus areas
           - Competitive positioning
        
        4. **Development Pipeline Analysis**
           - Phase progression analysis
           - Therapeutic area concentrations
           - Intervention types and approaches
        
        5. **Geographic Distribution**
           - Trial locations and regional strategies
           - Country-specific patterns
           - Global vs regional trials
        
        6. **Enrollment and Timeline Insights**
           - Average enrollment sizes by phase
           - Trial duration patterns
           - Completion rates
        
        7. **Key Trials Spotlight**
           - Highlight 3-5 most significant trials
           - Trial details and strategic importance
        
        8. **Strategic Insights & Recommendations**
           - Development opportunities
           - Competitive threats
           - Market access considerations
           - Partnership opportunities
        
        For question: {question}""",
        agent=writer,
        expected_output="""Professional clinical trials intelligence report with:
        - Clear executive summary
        - Data-driven analysis with specific numbers
        - Competitive landscape assessment
        - Geographic and enrollment insights
        - Key trials highlighted
        - Actionable strategic recommendations
        - Well-organized sections with headers
        - Business implications clearly stated""",
        context=[research_task, analysis_task]
    )

    # Create and return crew
    crew = Crew(
        agents=[researcher, analyst, writer],
        tasks=[research_task, analysis_task, report_task],
        verbose=True,
        memory=True,
        embedder={
            "provider": "google-generativeai",
            "config": {
                "api_key": os.getenv('GEMINI_API_KEY'),
                "model": "embedding-001"
            }
        },
        max_rpm=5,
    )

    return crew


@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
def analyze_with_retry(question: str):
    """Execute Clinical Trials analysis with automatic retry logic"""
    crew = create_clinical_trials_crew(question)
    result = crew.kickoff()
    return str(result)


# ==================== API ENDPOINTS ====================

@clinical_trials_bp.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze clinical trials data using AI agents
    
    Request body:
    {
        "question": "Your question about clinical trials"
    }
    
    Example questions:
    - "What are the active Phase III trials for diabetes?"
    - "Show me all trials sponsored by Pfizer in oncology"
    - "What clinical trials are recruiting in the United States for cardiovascular conditions?"
    - "Analyze the clinical pipeline for Alzheimer's disease"
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
        
        print(f"[Clinical Trials] Starting analysis for question: {question}")
        
        # Use retry logic for analysis
        result = analyze_with_retry(question)
        
        print(f"[Clinical Trials] Analysis complete. Result length: {len(result)}")
        
        return jsonify({
            "success": True,
            "question": question,
            "report": result
        }), 200
        
    except Exception as e:
        print(f"[Clinical Trials Error] {str(e)}")
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@clinical_trials_bp.route('/search/condition', methods=['POST'])
def search_by_condition():
    """Direct search for trials by medical condition"""
    try:
        data = request.get_json() or {}
        condition = data.get('condition')
        if not condition:
            return jsonify({"error": "Missing 'condition' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_condition", {"condition": condition})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/search/phase', methods=['POST'])
def search_by_phase():
    """Direct search for trials by phase"""
    try:
        data = request.get_json() or {}
        phase = data.get('phase')
        if not phase:
            return jsonify({"error": "Missing 'phase' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_phase", {"phase": phase})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/search/sponsor', methods=['POST'])
def search_by_sponsor():
    """Direct search for trials by sponsor"""
    try:
        data = request.get_json() or {}
        sponsor = data.get('sponsor')
        if not sponsor:
            return jsonify({"error": "Missing 'sponsor' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_sponsor", {"sponsor": sponsor})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/search/status', methods=['POST'])
def search_by_status():
    """Direct search for trials by status"""
    try:
        data = request.get_json() or {}
        status = data.get('status')
        if not status:
            return jsonify({"error": "Missing 'status' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_status", {"status": status})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/search/location', methods=['POST'])
def search_by_location():
    """Direct search for trials by location"""
    try:
        data = request.get_json() or {}
        location = data.get('location')
        if not location:
            return jsonify({"error": "Missing 'location' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_location", {"location": location})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/search/intervention', methods=['POST'])
def search_by_intervention():
    """Direct search for trials by intervention"""
    try:
        data = request.get_json() or {}
        intervention = data.get('intervention')
        if not intervention:
            return jsonify({"error": "Missing 'intervention' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_intervention", {"intervention": intervention})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/search/date-range', methods=['POST'])
def search_by_date_range():
    """Direct search for trials by date range"""
    try:
        data = request.get_json() or {}
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({"error": "Missing 'start_date' or 'end_date' in request body", "success": False}), 400

        result = call_mcp("/tools/search_trials_by_date_range", {
            "start_date": start_date,
            "end_date": end_date
        })
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "trials": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@clinical_trials_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Clinical Trials service"""
    return jsonify({
        "status": "healthy",
        "service": "clinical-trials",
    }), 200


@clinical_trials_bp.route('/examples', methods=['GET'])
def get_examples():
    """Get example questions that can be asked"""
    examples = [
        {
            "category": "Disease/Condition Analysis",
            "questions": [
                "What are the active clinical trials for diabetes?",
                "Show me all Phase III trials for Alzheimer's disease",
                "Find trials for cardiovascular conditions that are currently recruiting",
                "What trials are being conducted for rare genetic disorders?"
            ]
        },
        {
            "category": "Sponsor/Company Intelligence",
            "questions": [
                "What clinical trials is Pfizer currently conducting?",
                "Show me Novartis' oncology clinical pipeline",
                "Which companies are leading in immunotherapy trials?",
                "Compare clinical trial activity between Merck and Johnson & Johnson"
            ]
        },
        {
            "category": "Phase & Pipeline Analysis",
            "questions": [
                "What are all the Phase II trials currently recruiting?",
                "Show distribution of trials across all phases for cancer treatments",
                "Which Phase III trials have been completed in the last year?",
                "What is the success rate of Phase I trials in oncology?"
            ]
        },
        {
            "category": "Geographic & Location Trends",
            "questions": [
                "What clinical trials are being conducted in the United States?",
                "Show me trials in emerging markets for infectious diseases",
                "Which countries have the most active trials for neurodegenerative diseases?",
                "Find trials recruiting in Europe for metabolic disorders"
            ]
        },
        {
            "category": "Intervention & Treatment Analysis",
            "questions": [
                "What trials are testing monoclonal antibodies?",
                "Show me gene therapy clinical trials",
                "Find trials using CRISPR or gene editing technology",
                "What drug combinations are being tested in oncology trials?"
            ]
        },
        {
            "category": "Timeline & Enrollment",
            "questions": [
                "Which trials started in the last 6 months?",
                "Show me trials with large enrollment (>1000 patients)",
                "What trials are scheduled to complete in 2025?",
                "Find trials that were terminated or withdrawn and analyze why"
            ]
        }
    ]
    
    return jsonify({
        "success": True,
        "examples": examples
    }), 200
