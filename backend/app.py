from flask import Flask, jsonify
from flask_cors import CORS
from routes.websearch import websearch_bp
from routes.validator import validator_bp
from routes.orchestrator import orchestrator_bp
from routes.iqvia import iqvia_bp
from routes.exim import exim_bp
from routes.knowledge_graph import kg_bp
from routes.admet import admet_bp
from routes.uspto import uspto_bp
from routes.clinical_trial import clinical_trials_bp
from routes.clarification import clarification_bp
from routes.dbcon import dbcon_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(websearch_bp, url_prefix='/api/websearch')
app.register_blueprint(validator_bp, url_prefix='/api/validator')
app.register_blueprint(orchestrator_bp, url_prefix='/api')
app.register_blueprint(iqvia_bp, url_prefix='/api/iqvia')
app.register_blueprint(exim_bp, url_prefix='/api/exim')
app.register_blueprint(kg_bp, url_prefix='/api/kg')
app.register_blueprint(admet_bp, url_prefix='/api/admet')
app.register_blueprint(uspto_bp, url_prefix='/api/uspto')
app.register_blueprint(clinical_trials_bp, url_prefix='/api/clinical-trials')
app.register_blueprint(clarification_bp, url_prefix='/api/clarification')
app.register_blueprint(dbcon_bp, url_prefix='/dbcon')

@app.route('/')
def home():
    return jsonify({
        "message": "Pharma Agentic AI API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "query": "/api/query (POST) - Validate + Research",
            "websearch": "/api/websearch/research (POST)",
            "validator": "/api/validator/validate (POST)",
            "iqvia_analyze": "/api/iqvia/analyze (POST) - AI-powered IQVIA market analysis",
            "iqvia_query": "/api/iqvia/query (POST) - Direct SQL query",
            "iqvia_schema": "/api/iqvia/schema (GET) - Database schema",
            "iqvia_examples": "/api/iqvia/examples (GET) - Example questions"
            ,
            "exim_analyze": "/api/exim/analyze (POST) - EXIM tariff & trade analysis",
            "exim_health": "/api/exim/health (GET) - EXIM agent health",
            "uspto_analyze": "/api/uspto/analyze (POST) - AI-powered patent intelligence analysis",
            "uspto_search_title": "/api/uspto/search/title (POST) - Search patents by title",
            "uspto_search_inventor": "/api/uspto/search/inventor (POST) - Search patents by inventor",
            "uspto_search_assignee": "/api/uspto/search/assignee (POST) - Search patents by assignee",
            "uspto_search_ipc": "/api/uspto/search/ipc (POST) - Search patents by IPC class",
            "uspto_search_status": "/api/uspto/search/status (POST) - Search patents by status",
            "uspto_search_date": "/api/uspto/search/date-range (POST) - Search patents by date range",
            "uspto_health": "/api/uspto/health (GET) - USPTO agent health",
            "clinical_trials_analyze": "/api/clinical-trials/analyze (POST) - AI-powered clinical trials intelligence",
            "clinical_trials_search_condition": "/api/clinical-trials/search/condition (POST) - Search trials by condition",
            "clinical_trials_search_phase": "/api/clinical-trials/search/phase (POST) - Search trials by phase",
            "clinical_trials_search_sponsor": "/api/clinical-trials/search/sponsor (POST) - Search trials by sponsor",
            "clinical_trials_search_status": "/api/clinical-trials/search/status (POST) - Search trials by status",
            "clinical_trials_search_location": "/api/clinical-trials/search/location (POST) - Search trials by location",
            "clinical_trials_search_intervention": "/api/clinical-trials/search/intervention (POST) - Search trials by intervention",
            "clinical_trials_search_date": "/api/clinical-trials/search/date-range (POST) - Search trials by date range",
            "clinical_trials_health": "/api/clinical-trials/health (GET) - Clinical Trials agent health",
            "clinical_trials_examples": "/api/clinical-trials/examples (GET) - Example questions",
            "clarification": "/api/clarification/clarify (POST) - Interactive query clarification (max 5 rounds)",
            "clarification_reset": "/api/clarification/reset/<session_id> (DELETE) - Reset clarification session",
            "clarification_session": "/api/clarification/session/<session_id> (GET) - Get session history",
            "clarification_health": "/api/clarification/health (GET) - Clarification agent health",
            "clarification_examples": "/api/clarification/examples (GET) - Example clarification scenarios",
            "exim_health": "/api/exim/health (GET) - EXIM agent health",
            "dbcon_connect": "/dbcon/connect (POST) - Connect to database",
            "dbcon_select_tables": "/dbcon/select-tables (POST) - Select tables for agent access",
            "dbcon_query": "/dbcon/query (POST) - Query database with natural language",
            "dbcon_disconnect": "/dbcon/disconnect (POST) - Disconnect from database",
            "dbcon_preview": "/dbcon/table-preview (POST) - Preview table data"
        }
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "service": "Pharma Agentic AI"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
