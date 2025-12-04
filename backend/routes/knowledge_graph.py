import ssl
import certifi
from flask import Blueprint, request, jsonify
import os
import traceback
from dotenv import load_dotenv
from neo4j import GraphDatabase
import google.generativeai as genai
from werkzeug.utils import secure_filename
import PyPDF2
import re
import json

load_dotenv()

kg_bp = Blueprint('knowledge_graph', __name__)

# Neo4j Configuration
NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")
print(f"Connecting to Neo4j at {NEO4J_URI} with user {NEO4J_USERNAME}")

ssl_context = ssl.create_default_context(cafile=certifi.where())

# Gemini Configuration
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp"))

# Neo4j Driver
driver = None

uri = "neo4j://bdfdfbd4.databases.neo4j.io"
user = "neo4j"
password = "FdNtGQZ77BnV1MMtOMZfCejyfhhLM50OMiitVkjlv0U"

def get_neo4j_driver():
    global driver
    if driver is None:
        driver = GraphDatabase.driver(uri, auth=(user, password), ssl_context=ssl_context)
        driver.verify_connectivity()
    return driver

def close_neo4j_driver():
    global driver
    if driver is not None:
        driver.close()
        driver = None


def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Failed to extract PDF text: {str(e)}")


def extract_entities_and_relations(text):
    """Use Gemini to extract entities and relationships from text"""
    prompt = f"""Analyze the following text and extract entities and their relationships to build a knowledge graph.

Text: {text[:8000]}

Extract:
1. Entities (people, organizations, concepts, places, products, etc.)
2. Relationships between entities

Return ONLY a valid JSON object in this exact format (no markdown, no explanations):
{{
  "entities": [
    {{"id": "unique_id", "label": "EntityName", "type": "Person|Organization|Concept|Place|Product|Other"}},
    ...
  ],
  "relationships": [
    {{"source": "entity_id1", "target": "entity_id2", "type": "RELATIONSHIP_TYPE", "properties": {{}}}},
    ...
  ]
}}

Rules:
- Use snake_case for entity IDs (e.g., "john_doe", "pharma_corp")
- Use UPPERCASE for relationship types (e.g., "WORKS_FOR", "DEVELOPS", "LOCATED_IN")
- Extract 10-30 most important entities
- Include only meaningful relationships
- Ensure all source/target IDs exist in entities list"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if result_text.startswith('```'):
            result_text = re.sub(r'^```(?:json)?\n', '', result_text)
            result_text = re.sub(r'\n```$', '', result_text)
        
        data = json.loads(result_text)
        return data
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        print(f"Response text: {result_text[:500]}")
        # Return minimal valid structure
        return {"entities": [], "relationships": []}
    except Exception as e:
        print(f"Entity extraction error: {e}")
        return {"entities": [], "relationships": []}


def store_graph_in_neo4j(graph_data, session_id):
    """Store extracted graph in Neo4j"""
    driver = get_neo4j_driver()
    
    with driver.session(database=NEO4J_DATABASE) as session:
        # Create entities
        for entity in graph_data.get("entities", []):
            session.run(
                """
                MERGE (e:Entity {id: $id, session_id: $session_id})
                SET e.label = $label, e.type = $type
                """,
                id=entity["id"],
                session_id=session_id,
                label=entity["label"],
                type=entity.get("type", "Other")
            )
        
        # Create relationships
        for rel in graph_data.get("relationships", []):
            session.run(
                """
                MATCH (a:Entity {id: $source, session_id: $session_id})
                MATCH (b:Entity {id: $target, session_id: $session_id})
                MERGE (a)-[r:RELATES {type: $type, session_id: $session_id}]->(b)
                SET r += $properties
                """,
                source=rel["source"],
                target=rel["target"],
                type=rel["type"],
                session_id=session_id,
                properties=rel.get("properties", {})
            )


def get_graph_from_neo4j(session_id):
    """Retrieve graph data from Neo4j"""
    driver = get_neo4j_driver()
    
    with driver.session(database=NEO4J_DATABASE) as session:
        # Get nodes
        nodes_result = session.run(
            """
            MATCH (n:Entity {session_id: $session_id})
            RETURN n.id as id, n.label as label, n.type as type
            """,
            session_id=session_id
        )
        nodes = [{"id": record["id"], "label": record["label"], "type": record["type"]} 
                 for record in nodes_result]
        
        # Get relationships
        rels_result = session.run(
            """
            MATCH (a:Entity {session_id: $session_id})-[r:RELATES]->(b:Entity {session_id: $session_id})
            RETURN a.id as source, b.id as target, r.type as type
            """,
            session_id=session_id
        )
        links = [{"source": record["source"], "target": record["target"], "type": record["type"]} 
                 for record in rels_result]
        
        return {"nodes": nodes, "links": links}


def answer_question_with_graph(question, session_id):
    """Use Gemini to answer questions based on the knowledge graph"""
    driver = get_neo4j_driver()
    
    # Retrieve relevant graph context
    with driver.session(database=NEO4J_DATABASE) as session:
        result = session.run(
            """
            MATCH (n:Entity {session_id: $session_id})
            OPTIONAL MATCH (n)-[r:RELATES]->(m:Entity {session_id: $session_id})
            RETURN n.label as entity, n.type as type, 
                   collect({target: m.label, relation: r.type}) as relations
            LIMIT 50
            """,
            session_id=session_id
        )
        
        graph_context = []
        for record in result:
            entity_info = f"{record['entity']} ({record['type']})"
            if record['relations']:
                relations = [f"{r['relation']} {r['target']}" 
                           for r in record['relations'] if r['target']]
                if relations:
                    entity_info += " -> " + ", ".join(relations)
            graph_context.append(entity_info)
    
    context_text = "\n".join(graph_context[:30])
    
    prompt = f"""Based on the following knowledge graph, answer the question.

Knowledge Graph:
{context_text}

Question: {question}

Provide a clear, concise answer based on the information in the knowledge graph. If the information is not available, say so."""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating answer: {str(e)}"


@kg_bp.route('/upload', methods=['POST'])
def upload_document():
    """Upload and process document to build knowledge graph"""
    try:
        session_id = request.form.get('session_id')
        if not session_id:
            return jsonify({"error": "session_id is required", "success": False}), 400
        
        text = None
        
        # Check for file upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected", "success": False}), 400
            
            filename = secure_filename(file.filename)
            
            if filename.endswith('.pdf'):
                text = extract_text_from_pdf(file)
            elif filename.endswith('.txt'):
                text = file.read().decode('utf-8')
            else:
                return jsonify({"error": "Only PDF and TXT files supported", "success": False}), 400
        
        # Check for direct text input
        elif 'text' in request.form:
            text = request.form.get('text')
        
        else:
            return jsonify({"error": "No file or text provided", "success": False}), 400
        
        if not text or len(text.strip()) < 50:
            return jsonify({"error": "Text too short (minimum 50 characters)", "success": False}), 400
        
        # Extract entities and relationships
        graph_data = extract_entities_and_relations(text)
        
        if not graph_data.get("entities"):
            return jsonify({
                "error": "No entities could be extracted from the text",
                "success": False
            }), 400
        
        # Store in Neo4j
        store_graph_in_neo4j(graph_data, session_id)
        
        # Get the stored graph
        graph = get_graph_from_neo4j(session_id)
        
        return jsonify({
            "success": True,
            "message": f"Processed {len(graph['nodes'])} entities and {len(graph['links'])} relationships",
            "graph": graph
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@kg_bp.route('/graph/<session_id>', methods=['GET'])
def get_graph(session_id):
    """Retrieve knowledge graph for a session"""
    try:
        graph = get_graph_from_neo4j(session_id)
        return jsonify({
            "success": True,
            "graph": graph
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@kg_bp.route('/query', methods=['POST'])
def query_graph():
    """Answer questions based on knowledge graph"""
    try:
        data = request.get_json()
        question = data.get('question')
        session_id = data.get('session_id')
        
        if not question or not session_id:
            return jsonify({
                "error": "question and session_id required",
                "success": False
            }), 400
        
        answer = answer_question_with_graph(question, session_id)
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": answer
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@kg_bp.route('/clear/<session_id>', methods=['DELETE'])
def clear_graph(session_id):
    """Clear knowledge graph for a session"""
    try:
        driver = get_neo4j_driver()
        with driver.session(database=NEO4J_DATABASE) as session:
            session.run(
                """
                MATCH (n:Entity {session_id: $session_id})
                DETACH DELETE n
                """,
                session_id=session_id
            )
        
        return jsonify({
            "success": True,
            "message": "Graph cleared"
        }), 200
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@kg_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        driver = get_neo4j_driver()
        driver.verify_connectivity()
        return jsonify({
            "status": "healthy",
            "service": "knowledge-graph",
            "neo4j": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "knowledge-graph",
            "error": str(e)
        }), 500
