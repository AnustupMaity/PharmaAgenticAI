from flask import Blueprint, request, jsonify, session
from crewai import Agent, Task, Crew, LLM, Process
import os
import time
from functools import wraps
from dotenv import load_dotenv
import uuid

load_dotenv()

# Create Blueprint
clarification_bp = Blueprint('clarification', __name__)
clarification_bp.secret_key = os.getenv("FLASK_SECRET_KEY", "change-me-in-env")

# Initialize LLM
llm = LLM(
    model="gemini/gemini-2.5-pro",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.3
)

# Store conversation history in memory (in production, use Redis or database)
conversation_store = {}

# Maximum clarification rounds
MAX_CLARIFICATION_COUNT = 5


# Retry decorator with exponential backoff
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


def create_clarification_crew(prompt: str, conversation_history: list, clarification_count: int):
    """Create and configure the clarification crew"""
    
    # Clarification Specialist Agent
    clarifier = Agent(
        role="Pharmaceutical Query Clarification Specialist",
        goal="""Analyze user queries about pharmaceuticals, clinical trials, patents, market data, 
        or drug development and determine if they need clarification. Ask targeted questions to make 
        vague queries more specific and actionable.""",
        backstory="""You are an expert pharmaceutical intelligence analyst who helps users refine 
        their questions to get the most accurate and useful information. You understand that good 
        pharmaceutical intelligence requires specificity in terms of:
        - Therapeutic areas and specific diseases
        - Geographic markets and regions
        - Time periods and date ranges
        - Company/sponsor names
        - Drug/product names and classes
        - Clinical trial phases
        - Patent types and classifications
        - Market metrics (sales, growth, market share)
        
        You ask focused, relevant questions to fill in missing details without overwhelming the user.""",
        llm=llm,
        verbose=True,
        allow_delegation=False
    )
    
    # Build conversation context
    context = "Previous conversation:\n"
    for idx, exchange in enumerate(conversation_history, 1):
        context += f"\nRound {idx}:\n"
        context += f"User: {exchange.get('user_message', '')}\n"
        if exchange.get('clarification_question'):
            context += f"Assistant: {exchange.get('clarification_question', '')}\n"
    
    context += f"\n\nCurrent user input: {prompt}\n"
    context += f"Clarification round: {clarification_count + 1} of {MAX_CLARIFICATION_COUNT}\n"
    
    clarification_task = Task(
        description=f"""{context}

Your task is to analyze the current state of the user's query and determine if it is specific enough 
to execute a pharmaceutical intelligence search, or if it needs further clarification.

**Criteria for a well-specified query:**
1. Clear intent (what information they want)
2. Specific subject (drug name, disease, company, etc.)
3. Relevant dimensions specified where needed:
   - Time period (if asking about trends, sales, or temporal data)
   - Geographic scope (if asking about markets)
   - Phase (if asking about clinical trials)
   - Classification (if asking about patents)

**Your Response Format:**

If the query NEEDS clarification, respond with:
```
Status: NEEDS_CLARIFICATION
Question: [Ask ONE specific, focused question to fill the most critical gap]
Reason: [Brief explanation of what's missing]
```

If the query IS sufficiently specific, respond with:
```
Status: READY
Refined_Query: [Restate the query in a clear, specific format incorporating all provided details]
Summary: [Brief summary of what will be searched]
```

**Important Guidelines:**
- Ask only ONE question at a time
- Focus on the most critical missing information first
- Be conversational and helpful, not interrogative
- If this is round {clarification_count + 1} of {MAX_CLARIFICATION_COUNT}, be more lenient and accept reasonable specificity
- Consider the conversation history - don't ask about information already provided
- For very vague queries, prioritize: subject > scope > timeframe > details

Analyze and respond:""",
        agent=clarifier,
        expected_output="""A response containing either:
- Status: NEEDS_CLARIFICATION with a focused question and reason, OR
- Status: READY with refined query and summary"""
    )
    
    crew = Crew(
        agents=[clarifier],
        tasks=[clarification_task],
        process=Process.sequential,
        verbose=True,
        memory=False
    )
    
    return crew


@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
def clarify_with_retry(prompt: str, conversation_history: list, clarification_count: int):
    """Execute clarification with automatic retry logic"""
    crew = create_clarification_crew(prompt, conversation_history, clarification_count)
    result = crew.kickoff()
    return str(result)


def parse_clarification_response(response: str):
    """Parse the agent's response to extract status and relevant fields"""
    response_lower = response.lower()
    
    result = {
        "needs_clarification": False,
        "question": None,
        "reason": None,
        "refined_query": None,
        "summary": None,
        "raw_response": response
    }
    
    # Check status
    if "status: needs_clarification" in response_lower or "needs_clarification" in response_lower:
        result["needs_clarification"] = True
        
        # Extract question
        if "question:" in response_lower:
            parts = response.split("Question:", 1)
            if len(parts) > 1:
                question_part = parts[1].split("Reason:", 1)[0] if "Reason:" in parts[1] else parts[1]
                result["question"] = question_part.strip().strip('`').strip()
        
        # Extract reason
        if "reason:" in response_lower:
            parts = response.split("Reason:", 1)
            if len(parts) > 1:
                result["reason"] = parts[1].strip().strip('`').strip()
    
    elif "status: ready" in response_lower or "ready" in response_lower:
        result["needs_clarification"] = False
        
        # Extract refined query
        if "refined_query:" in response_lower or "refined query:" in response_lower:
            parts = response.split("Refined_Query:", 1) if "Refined_Query:" in response else response.split("Refined Query:", 1)
            if len(parts) > 1:
                query_part = parts[1].split("Summary:", 1)[0] if "Summary:" in parts[1] else parts[1]
                result["refined_query"] = query_part.strip().strip('`').strip()
        
        # Extract summary
        if "summary:" in response_lower:
            parts = response.split("Summary:", 1)
            if len(parts) > 1:
                result["summary"] = parts[1].strip().strip('`').strip()
    
    return result


@clarification_bp.route('/clarify', methods=['POST'])
def clarify():
    """
    Endpoint to clarify user prompts through interactive questioning
    
    Request body:
    {
        "prompt": "user's query or answer to previous question",
        "session_id": "optional session ID to continue conversation",
        "force_complete": false  // optional - force completion even if not fully clarified
    }
    
    Response:
    {
        "success": true,
        "session_id": "unique session identifier",
        "needs_clarification": true/false,
        "clarification_count": 2,
        "max_clarifications": 5,
        "question": "clarification question" (if needs_clarification),
        "refined_query": "final specific query" (if ready),
        "conversation_history": [...],
        "status": "clarifying/ready/max_reached"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({
                "error": "Missing 'prompt' in request body",
                "success": False
            }), 400
        
        prompt = data['prompt']
        session_id = data.get('session_id', str(uuid.uuid4()))
        force_complete = data.get('force_complete', False)
        
        if not prompt.strip():
            return jsonify({
                "error": "Prompt cannot be empty",
                "success": False
            }), 400
        
        # Get or create conversation history
        if session_id not in conversation_store:
            conversation_store[session_id] = {
                "history": [],
                "clarification_count": 0,
                "created_at": time.time()
            }
        
        session_data = conversation_store[session_id]
        clarification_count = session_data["clarification_count"]
        conversation_history = session_data["history"]
        
        print(f"[Clarification] Session: {session_id}, Round: {clarification_count + 1}/{MAX_CLARIFICATION_COUNT}")
        print(f"[Clarification] User input: {prompt}")
        
        # Check if max clarifications reached
        if clarification_count >= MAX_CLARIFICATION_COUNT or force_complete:
            print(f"[Clarification] Max rounds reached or forced completion. Finalizing query.")
            
            # Store final input
            conversation_history.append({
                "user_message": prompt,
                "clarification_question": None,
                "timestamp": time.time()
            })
            
            # Compile final query from conversation
            final_query = prompt
            if len(conversation_history) > 1:
                context_parts = []
                for exchange in conversation_history:
                    if exchange.get('user_message'):
                        context_parts.append(exchange['user_message'])
                final_query = " | ".join(context_parts)
            
            return jsonify({
                "success": True,
                "session_id": session_id,
                "needs_clarification": False,
                "clarification_count": clarification_count,
                "max_clarifications": MAX_CLARIFICATION_COUNT,
                "refined_query": final_query,
                "summary": "Maximum clarification rounds reached. Proceeding with available information.",
                "conversation_history": conversation_history,
                "status": "max_reached" if not force_complete else "forced_complete"
            }), 200
        
        # Run clarification analysis
        result = clarify_with_retry(prompt, conversation_history, clarification_count)
        parsed_result = parse_clarification_response(result)
        
        # Update conversation history
        conversation_entry = {
            "user_message": prompt,
            "clarification_question": parsed_result.get("question"),
            "agent_response": parsed_result.get("raw_response"),
            "timestamp": time.time()
        }
        conversation_history.append(conversation_entry)
        session_data["clarification_count"] = clarification_count + 1
        
        if parsed_result["needs_clarification"]:
            # Need more information
            print(f"[Clarification] Needs more info. Asking: {parsed_result['question']}")
            
            return jsonify({
                "success": True,
                "session_id": session_id,
                "needs_clarification": True,
                "clarification_count": clarification_count + 1,
                "max_clarifications": MAX_CLARIFICATION_COUNT,
                "question": parsed_result["question"],
                "reason": parsed_result["reason"],
                "conversation_history": conversation_history,
                "status": "clarifying"
            }), 200
        else:
            # Query is ready
            refined_query = parsed_result["refined_query"] or prompt
            print(f"[Clarification] Query ready: {refined_query}")
            
            return jsonify({
                "success": True,
                "session_id": session_id,
                "needs_clarification": False,
                "clarification_count": clarification_count + 1,
                "max_clarifications": MAX_CLARIFICATION_COUNT,
                "refined_query": refined_query,
                "summary": parsed_result["summary"],
                "conversation_history": conversation_history,
                "status": "ready"
            }), 200
        
    except Exception as e:
        print(f"[Clarification Error] {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@clarification_bp.route('/reset/<session_id>', methods=['DELETE'])
def reset_session(session_id):
    """Reset a clarification session"""
    try:
        if session_id in conversation_store:
            del conversation_store[session_id]
            return jsonify({
                "success": True,
                "message": f"Session {session_id} reset successfully"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Session not found"
            }), 404
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@clarification_bp.route('/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get conversation history for a session"""
    try:
        if session_id in conversation_store:
            return jsonify({
                "success": True,
                "session_id": session_id,
                "data": conversation_store[session_id]
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Session not found"
            }), 404
    except Exception as e:
        return jsonify({
            "error": str(e),
            "success": False
        }), 500


@clarification_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint for clarification service"""
    return jsonify({
        "status": "healthy",
        "service": "clarification",
        "llm_configured": llm is not None,
        "max_clarification_rounds": MAX_CLARIFICATION_COUNT,
        "active_sessions": len(conversation_store)
    }), 200


@clarification_bp.route('/examples', methods=['GET'])
def get_examples():
    """Get example use cases for clarification service"""
    examples = [
        {
            "scenario": "Vague Query",
            "initial_prompt": "Tell me about diabetes drugs",
            "expected_clarifications": [
                "What specific aspect of diabetes drugs are you interested in? (market size, clinical trials, patents, specific products)",
                "Which geographic market? (US, Europe, Global, specific country)",
                "What time period? (current, historical trends, future projections)"
            ]
        },
        {
            "scenario": "Partially Specific",
            "initial_prompt": "Show me Pfizer's clinical trials",
            "expected_clarifications": [
                "Which therapeutic area or disease are you interested in?",
                "What trial phase? (Phase I, II, III, IV, or all phases)",
                "What time period? (currently active, completed in last year, etc.)"
            ]
        },
        {
            "scenario": "Well-Specified",
            "initial_prompt": "What are the active Phase III clinical trials for Alzheimer's disease sponsored by pharmaceutical companies in the United States?",
            "expected_clarifications": []
        }
    ]
    
    return jsonify({
        "success": True,
        "examples": examples,
        "max_clarification_rounds": MAX_CLARIFICATION_COUNT
    }), 200
