from flask import Blueprint, request, jsonify
import os
import requests
import time
import traceback
from dotenv import load_dotenv

from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool

load_dotenv()

USPTO_MCP_URL = os.getenv("USPTO_MCP_URL", "http://localhost:8003")

uspto_bp = Blueprint('uspto', __name__)


def call_mcp(path: str, payload: dict):
    """Call the USPTO MCP server endpoint"""
    url = f"{USPTO_MCP_URL}{path}"
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


@tool("Search Patents by Title")
def search_patents_by_title_tool(title: str) -> str:
    """Search for patents by title keyword.

    Args:
        title: Title or keyword to search for in patent titles.

    Returns:
        List of patents matching the title search or error structure.
    """
    payload = {"title": title}
    return call_mcp("/tools/search_patents_by_title", payload)


@tool("Search Patents by Inventor")
def search_patents_by_inventor_tool(inventor: str) -> str:
    """Search for patents by inventor name.

    Args:
        inventor: Inventor name to search for.

    Returns:
        List of patents by the specified inventor or error structure.
    """
    payload = {"inventor": inventor}
    return call_mcp("/tools/search_patents_by_inventor", payload)


@tool("Search Patents by Assignee")
def search_patents_by_assignee_tool(assignee: str) -> str:
    """Search for patents by assignee/company name.

    Args:
        assignee: Company or assignee name to search for.

    Returns:
        List of patents assigned to the specified entity or error structure.
    """
    payload = {"assignee": assignee}
    return call_mcp("/tools/search_patents_by_assignee", payload)


@tool("Search Patents by IPC Class")
def search_patents_by_ipc_class_tool(ipc_class: str) -> str:
    """Search for patents by International Patent Classification code.

    Args:
        ipc_class: IPC classification code to search for.

    Returns:
        List of patents in the specified IPC class or error structure.
    """
    payload = {"ipc_class": ipc_class}
    return call_mcp("/tools/search_patents_by_ipc_class", payload)


@tool("Search Patents by Status")
def search_patents_by_status_tool(status: str) -> str:
    """Search for patents by their legal status.

    Args:
        status: Patent status (Granted, Pending, Abandoned, or Expired).

    Returns:
        List of patents with the specified status or error structure.
    """
    payload = {"status": status}
    return call_mcp("/tools/search_patents_by_status", payload)


@tool("Search Patents by Date Range")
def search_patents_by_date_range_tool(start_date: str, end_date: str) -> str:
    """Search for patents by publication date range.

    Args:
        start_date: Start date in YYYY-MM-DD format.
        end_date: End date in YYYY-MM-DD format.

    Returns:
        List of patents published within the date range or error structure.
    """
    payload = {"start_date": start_date, "end_date": end_date}
    return call_mcp("/tools/search_patents_by_date_range", payload)


# Initialize LLM
llm = LLM(
    model=os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-pro"),
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)


def create_uspto_crew(question: str):
    """Create a CrewAI crew for USPTO patent intelligence"""
    
    researcher = Agent(
        role="Patent Researcher",
        goal=f"Search and gather comprehensive patent information for: {question}",
        backstory="You are an expert patent researcher specializing in pharmaceutical and biotechnology patents. You use various search tools to find relevant patents based on titles, inventors, assignees, classifications, and dates.",
        tools=[
            search_patents_by_title_tool,
            search_patents_by_inventor_tool,
            search_patents_by_assignee_tool,
            search_patents_by_ipc_class_tool,
            search_patents_by_status_tool,
            search_patents_by_date_range_tool
        ],
        llm=llm,
        verbose=True,
    )

    analyst = Agent(
        role="Patent Analyst",
        goal="Analyze patent data and extract competitive intelligence insights",
        backstory="You are a seasoned patent analyst who interprets patent landscapes, identifies innovation trends, competitive positioning, and potential IP risks. You synthesize raw patent data into actionable business intelligence.",
        llm=llm,
        verbose=True,
    )

    writer = Agent(
        role="Patent Intelligence Report Writer",
        goal="Create a comprehensive patent intelligence report with clear findings",
        backstory="You are an expert technical writer who creates clear, concise patent intelligence reports. You present findings in an organized manner highlighting key patents, innovation trends, competitive landscape, and strategic recommendations.",
        llm=llm,
        verbose=True,
    )

    research_task = Task(
        description=f"Search for relevant patents related to: {question}. Use multiple search strategies (title, inventor, assignee, IPC class) to gather comprehensive patent data.",
        agent=researcher,
        expected_output="Complete list of relevant patents with full details including titles, inventors, assignees, filing dates, publication dates, abstracts, IPC classifications, and current status."
    )

    analysis_task = Task(
        description="Analyze the gathered patent data to identify: 1) Key innovation trends, 2) Major patent holders and their strategies, 3) Technology evolution patterns, 4) Competitive landscape, 5) Patent quality and significance, 6) Potential IP risks or opportunities.",
        agent=analyst,
        expected_output="Detailed analysis covering innovation trends, competitive landscape, patent quality assessment, and strategic implications.",
        context=[research_task]
    )

    report_task = Task(
        description="Create a comprehensive patent intelligence report that includes: Executive Summary, Key Patents Overview, Innovation Trends Analysis, Competitive Landscape, Patent Timeline, IPC Classification Breakdown, and Strategic Recommendations.",
        agent=writer,
        expected_output="Final structured patent intelligence report with clear sections, key findings, data tables, and actionable recommendations.",
        context=[research_task, analysis_task]
    )

    crew = Crew(
        agents=[researcher, analyst, writer],
        tasks=[research_task, analysis_task, report_task],
        verbose=True,
        external_memory=None,
        max_rpm=5,
    )

    return crew


@uspto_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze patent landscape based on a question or topic"""
    try:
        data = request.get_json() or {}
        question = data.get('question') or data.get('topic')
        if not question:
            return jsonify({"error": "Missing 'question' in request body", "success": False}), 400

        crew = create_uspto_crew(question)
        result = crew.kickoff()
        return jsonify({"success": True, "question": question, "report": str(result)}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False, "error_type": type(e).__name__}), 500


@uspto_bp.route('/search/title', methods=['POST'])
def search_by_title():
    """Direct search for patents by title"""
    try:
        data = request.get_json() or {}
        title = data.get('title')
        if not title:
            return jsonify({"error": "Missing 'title' in request body", "success": False}), 400

        result = call_mcp("/tools/search_patents_by_title", {"title": title})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "patents": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@uspto_bp.route('/search/inventor', methods=['POST'])
def search_by_inventor():
    """Direct search for patents by inventor"""
    try:
        data = request.get_json() or {}
        inventor = data.get('inventor')
        if not inventor:
            return jsonify({"error": "Missing 'inventor' in request body", "success": False}), 400

        result = call_mcp("/tools/search_patents_by_inventor", {"inventor": inventor})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "patents": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@uspto_bp.route('/search/assignee', methods=['POST'])
def search_by_assignee():
    """Direct search for patents by assignee/company"""
    try:
        data = request.get_json() or {}
        assignee = data.get('assignee')
        if not assignee:
            return jsonify({"error": "Missing 'assignee' in request body", "success": False}), 400

        result = call_mcp("/tools/search_patents_by_assignee", {"assignee": assignee})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "patents": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@uspto_bp.route('/search/ipc', methods=['POST'])
def search_by_ipc():
    """Direct search for patents by IPC classification"""
    try:
        data = request.get_json() or {}
        ipc_class = data.get('ipc_class')
        if not ipc_class:
            return jsonify({"error": "Missing 'ipc_class' in request body", "success": False}), 400

        result = call_mcp("/tools/search_patents_by_ipc_class", {"ipc_class": ipc_class})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "patents": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@uspto_bp.route('/search/status', methods=['POST'])
def search_by_status():
    """Direct search for patents by legal status"""
    try:
        data = request.get_json() or {}
        status = data.get('status')
        if not status:
            return jsonify({"error": "Missing 'status' in request body", "success": False}), 400

        result = call_mcp("/tools/search_patents_by_status", {"status": status})
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "patents": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@uspto_bp.route('/search/date-range', methods=['POST'])
def search_by_date_range():
    """Direct search for patents by publication date range"""
    try:
        data = request.get_json() or {}
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({"error": "Missing 'start_date' or 'end_date' in request body", "success": False}), 400

        result = call_mcp("/tools/search_patents_by_date_range", {
            "start_date": start_date,
            "end_date": end_date
        })
        
        if "error" in result:
            return jsonify({"success": False, "error": result["error"]}), 404
        
        return jsonify({"success": True, "patents": result}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500


@uspto_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "uspto-agent"}), 200
