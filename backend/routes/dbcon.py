from flask import Blueprint, request, jsonify
from sqlalchemy import create_engine, inspect, text, MetaData, Table
from sqlalchemy.exc import SQLAlchemyError
import logging
from typing import Dict, List, Any
import json

dbcon_bp = Blueprint('dbcon', __name__)
logger = logging.getLogger(__name__)

# Store active connections (in production, use a proper session management)
active_connections = {}

@dbcon_bp.route('/connect', methods=['POST'])
def connect_database():
    """
    Connect to a database using the provided connection string
    and discover all available tables.
    """
    try:
        print(request)
        data = request.get_json()
        connection_string = data.get('connectionString')
        session_id = data.get('sessionId', 'default')
        
        if not connection_string:
            return jsonify({'error': 'Connection string is required'}), 400

        print(connection_string)
        # Create database engine
        engine = create_engine(connection_string)
        
        # Test connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        
        # Get table information
        inspector = inspect(engine)
        tables = []
        
        for table_name in inspector.get_table_names():
            columns = []
            for column in inspector.get_columns(table_name):
                columns.append({
                    'name': column['name'],
                    'type': str(column['type']),
                    'nullable': column.get('nullable', True),
                    'primary_key': column.get('primary_key', False)
                })
            
            tables.append({
                'name': table_name,
                'columns': columns
            })
        
        # Store connection for this session
        active_connections[session_id] = {
            'engine': engine,
            'connection_string': connection_string,
            'selected_tables': []
        }
        
        return jsonify({
            'success': True,
            'tables': tables,
            'message': f'Successfully connected. Found {len(tables)} tables.'
        }), 200
        
    except SQLAlchemyError as e:
        logger.error(f"Database connection error: {str(e)}")
        return jsonify({'error': f'Database connection failed: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@dbcon_bp.route('/select-tables', methods=['POST'])
def select_tables():
    """
    Set which tables the agent should have access to.
    """
    try:
        data = request.get_json()
        session_id = data.get('sessionId', 'default')
        selected_tables = data.get('tables', [])
        
        if session_id not in active_connections:
            return jsonify({'error': 'No active database connection. Please connect first.'}), 400
        
        active_connections[session_id]['selected_tables'] = selected_tables
        
        return jsonify({
            'success': True,
            'selected_tables': selected_tables,
            'message': f'Successfully configured access to {len(selected_tables)} tables.'
        }), 200
        
    except Exception as e:
        logger.error(f"Error selecting tables: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@dbcon_bp.route('/query', methods=['POST'])
def query_database():
    """
    Execute a query based on user's question.
    The agent will analyze the question, check if it relates to report records,
    and generate an appropriate SQL query.
    """
    try:
        data = request.get_json()
        session_id = data.get('sessionId', 'default')
        user_question = data.get('question')
        
        if session_id not in active_connections:
            return jsonify({'error': 'No active database connection. Please connect first.'}), 400
        
        if not user_question:
            return jsonify({'error': 'Question is required'}), 400
        
        connection_info = active_connections[session_id]
        engine = connection_info['engine']
        selected_tables = connection_info['selected_tables']
        
        if not selected_tables:
            return jsonify({'error': 'No tables selected. Please select tables first.'}), 400
        
        # Generate SQL query based on the question
        # This is a simplified version - in production, use an LLM to generate queries
        sql_query = generate_sql_from_question(user_question, selected_tables, engine)
        
        # Execute query
        with engine.connect() as connection:
            result = connection.execute(text(sql_query))
            rows = result.fetchall()
            columns = result.keys()
            
            # Convert to list of dictionaries
            data_rows = []
            for row in rows:
                data_rows.append(dict(zip(columns, row)))
        
        # Check if results contain report data
        has_reports = check_for_reports(data_rows, selected_tables)
        
        # Generate contextual response
        response = generate_contextual_response(user_question, data_rows, has_reports)
        
        return jsonify({
            'success': True,
            'query': sql_query,
            'results': data_rows,
            'row_count': len(data_rows),
            'response': response,
            'has_reports': has_reports
        }), 200
        
    except SQLAlchemyError as e:
        logger.error(f"Query execution error: {str(e)}")
        return jsonify({'error': f'Query failed: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@dbcon_bp.route('/disconnect', methods=['POST'])
def disconnect_database():
    """
    Disconnect from the database and clean up resources.
    """
    try:
        data = request.get_json()
        session_id = data.get('sessionId', 'default')
        
        if session_id in active_connections:
            engine = active_connections[session_id]['engine']
            engine.dispose()
            del active_connections[session_id]
            
            return jsonify({
                'success': True,
                'message': 'Successfully disconnected from database.'
            }), 200
        else:
            return jsonify({
                'success': True,
                'message': 'No active connection to disconnect.'
            }), 200
            
    except Exception as e:
        logger.error(f"Disconnect error: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@dbcon_bp.route('/table-preview', methods=['POST'])
def preview_table():
    """
    Get a preview of data from a specific table.
    """
    try:
        data = request.get_json()
        session_id = data.get('sessionId', 'default')
        table_name = data.get('tableName')
        limit = data.get('limit', 10)
        
        if session_id not in active_connections:
            return jsonify({'error': 'No active database connection'}), 400
        
        if not table_name:
            return jsonify({'error': 'Table name is required'}), 400
        
        engine = active_connections[session_id]['engine']
        
        # Execute preview query
        query = text(f'SELECT * FROM "{table_name}" LIMIT :limit')
        
        with engine.connect() as connection:
            result = connection.execute(query, {"limit": limit})
            rows = result.fetchall()
            columns = result.keys()
            
            data_rows = []
            for row in rows:
                data_rows.append(dict(zip(columns, row)))
        
        return jsonify({
            'success': True,
            'table_name': table_name,
            'preview': data_rows,
            'row_count': len(data_rows)
        }), 200
        
    except Exception as e:
        logger.error(f"Preview error: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


def generate_sql_from_question(question: str, selected_tables: List[str], engine) -> str:
    """
    Generate SQL query from natural language question.
    This is a simplified version - in production, integrate with an LLM.
    """
    question_lower = question.lower()
    
    # Simple keyword-based query generation
    if 'report' in question_lower or 'reports' in question_lower:
        # Look for report tables
        report_tables = [t for t in selected_tables if 'report' in t.lower()]
        if report_tables:
            table_name = report_tables[0]
            return f'SELECT * FROM "{table_name}" LIMIT 100'
    
    # Default: select from first available table
    if selected_tables:
        return f'SELECT * FROM "{selected_tables[0]}" LIMIT 100'
    
    return 'SELECT 1'


def check_for_reports(data_rows: List[Dict], selected_tables: List[str]) -> bool:
    """
    Check if the results contain report records.
    """
    if not data_rows:
        return False
    
    # Check if any selected table contains 'report' in its name
    has_report_table = any('report' in table.lower() for table in selected_tables)
    
    # Check if data contains report-like fields
    if data_rows:
        first_row = data_rows[0]
        report_fields = ['report', 'content', 'analysis', 'summary', 'document']
        has_report_fields = any(
            any(field in key.lower() for field in report_fields)
            for key in first_row.keys()
        )
        return has_report_table or has_report_fields
    
    return False


def generate_contextual_response(question: str, data_rows: List[Dict], has_reports: bool) -> str:
    """
    Generate a contextual response based on the query results.
    In production, integrate with an LLM for better responses.
    """
    if not data_rows:
        return "I couldn't find any data matching your question in the selected tables."
    
    row_count = len(data_rows)
    
    if has_reports:
        # Analyze report content
        response = f"I found {row_count} report record(s) related to your question. "
        
        # Try to extract report content
        for row in data_rows[:3]:  # Analyze first 3 reports
            for key, value in row.items():
                if 'report' in key.lower() or 'content' in key.lower() or 'summary' in key.lower():
                    if value:
                        response += f"\n\nReport excerpt: {str(value)[:500]}..."
                        break
        
        return response
    else:
        # Regular data response
        response = f"I found {row_count} record(s) matching your question. "
        
        if row_count > 0:
            # Summarize first few records
            response += "\n\nHere's a summary of the data:\n"
            for idx, row in enumerate(data_rows[:5], 1):
                response += f"\nRecord {idx}: "
                # Show first few fields
                fields_shown = 0
                for key, value in row.items():
                    if fields_shown < 3:
                        response += f"{key}: {value}, "
                        fields_shown += 1
                    else:
                        break
        
        return response
