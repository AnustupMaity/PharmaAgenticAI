from flask import Blueprint, request, jsonify
import os
import requests
import time
import traceback
from dotenv import load_dotenv

from crewai import Agent, Task, Crew, LLM
from crewai.tools import tool

load_dotenv()

EXIM_MCP_URL = os.getenv("EXIM_MCP_URL", "http://localhost:8002")

exim_bp = Blueprint('exim', __name__)


def call_mcp(path: str, payload: dict):
    url = f"{EXIM_MCP_URL}{path}"
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


@tool("Get Export Tariff")
def get_export_tariff_tool(drug_name: str, country: str) -> str:
    """Call the MCP export tariff endpoint and return the tariff row for a drug/country.

    Args:
        drug_name: Name of the pharmaceutical product to look up.
        country: Destination country for export tariff lookup.

    Returns:
        JSON-like dict with tariff information or an error structure.
    """
    payload = {"drug_name": drug_name, "country": country}
    return call_mcp("/tools/get_export_tariff", payload)


@tool("Get Import Tariff")
def get_import_tariff_tool(drug_name: str, origin_country: str, destination_country: str) -> str:
    """Call the MCP import tariff endpoint and return the tariff row for a drug and origin/destination.

    Args:
        drug_name: Name of the pharmaceutical product to look up.
        origin_country: Country of origin for import lookup.
        destination_country: Destination country for import lookup.

    Returns:
        JSON-like dict with tariff information or an error structure.
    """
    payload = {"drug_name": drug_name, "origin_country": origin_country, "destination_country": destination_country}
    return call_mcp("/tools/get_import_tariff", payload)


# Initialize LLM
llm = LLM(
    model=os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-pro"),
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)


def create_exim_crew(question: str):
    researcher = Agent(
        role="EXIM Researcher",
        goal=f"Gather export/import tariff and trade intelligence for: {question}",
        backstory="You are an expert in international trade tariffs and customs for pharmaceutical products. Call the various tools to gather data",
        tools=[get_export_tariff_tool, get_import_tariff_tool],
        llm=llm,
        verbose=True,
    )

    analyst = Agent(
        role="EXIM Analyst",
        goal="Analyze tariff findings and produce actionable insights",
        backstory="You synthesize raw tariff data into concise trade and regulatory insights for stakeholders.",
        llm=llm,
        verbose=True,
    )

    writer = Agent(
        role="Report Writer",
        goal="Only output the findings of the tool",
        backstory="You only report the learnings from the tool",
        llm=llm,
        verbose=True,
    )

    research_task = Task(
        description=f"Gather tariff and customs info for: {question}",
        agent=researcher,
        expected_output="Raw tariff rows and sources"
    )

    analysis_task = Task(
        description="Analyze gathered tariff data and extract implications",
        agent=analyst,
        expected_output="Key insights and trade implications",
        context=[research_task]
    )

    report_task = Task(
        description="Write the findings of the tool",
        agent=writer,
        expected_output="Final intelligence report",
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


@exim_bp.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json() or {}
        question = data.get('question') or data.get('topic')
        if not question:
            return jsonify({"error": "Missing 'question' in request body", "success": False}), 400

        crew = create_exim_crew(question)
        result = crew.kickoff()
        return jsonify({"success": True, "question": question, "report": str(result)}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False, "error_type": type(e).__name__}), 500


@exim_bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "exim-agent"}), 200
