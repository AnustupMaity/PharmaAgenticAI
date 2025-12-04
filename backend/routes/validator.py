from flask import Blueprint, request, jsonify
from crewai import Agent, Task, Crew, LLM, Process
import os
import time
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

# Create Blueprint
validator_bp = Blueprint('validator', __name__)

# Initialize LLM
llm = LLM(
    model="gemini/gemini-2.0-flash-exp",
    api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.1
)

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


# Validator Agent
validator = Agent(
    role="Domain Knowledge Expert",
    goal="Check whether the given prompt is related to medicine and medicine related market",
    backstory="""You are an expert drug researcher with years of experience in 
    pharmaceutical and drug development. You can accurately determine if a topic 
    is relevant to the medical and pharmaceutical domain.""",
    llm=llm,
    verbose=True,
    allow_delegation=False
)


def create_validator_crew(topic: str):
    """Create and configure the validator crew"""
    
    validation_task = Task(
        description=f"""Your task is to determine whether the given topic: "{topic}" is relevant to the pharmaceutical and drug development domain.

Consider whether it relates to any of the following areas:

1. Drug discovery and development (molecular targets, drug candidates, preclinical studies)
2. Clinical trials (Phase I-IV studies, trial designs, patient recruitment)
3. Pharmaceutical market research (market size, therapy areas, competitive landscape, sales trends)
4. Intellectual property (patents, exclusivity, patent filings, licensing)
5. Regulatory aspects (FDA, EMA, or other health authority approvals and guidelines)
6. Medical conditions, diseases, and treatments
7. Healthcare policy and pharmaceutical regulations
8. Biotechnology and biopharmaceuticals

Return ONLY "yes" if the topic is relevant to these areas, or "no" if it is not relevant.
Provide a brief one-sentence justification.

Format your response as:
Answer: yes/no
Reason: [brief justification]""",
        agent=validator,
        expected_output="""A response with:
- Answer: yes/no
- Reason: brief justification"""
    )
    
    # Create the crew with memory disabled to avoid OpenAI dependency
    crew = Crew(
        agents=[validator],
        tasks=[validation_task],
        process=Process.sequential,
        verbose=True,
        memory=False  # Disable memory to avoid OpenAI API key requirement
    )
    
    return crew


@retry_with_backoff(max_retries=3, initial_delay=2, backoff_factor=2)
def validate_topic_with_retry(topic: str):
    """Validate topic with automatic retry logic"""
    crew = create_validator_crew(topic)
    result = crew.kickoff()
    return str(result)


@validator_bp.route('/validate', methods=['POST'])
def validate():
    """
    Endpoint to validate if a topic is pharmaceutical-related
    
    Request body:
    {
        "topic": "your topic to validate"
    }
    
    Response:
    {
        "success": true,
        "topic": "original topic",
        "is_valid": true/false,
        "reason": "justification",
        "full_response": "complete response from agent"
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
        
        print(f"[Validator] Validating topic: {topic}")
        
        # Use retry logic for validation
        result = validate_topic_with_retry(topic)
        
        # Parse the result
        result_lower = result.lower()
        is_valid = "yes" in result_lower and "answer" in result_lower
        
        # Extract reason if possible
        reason = "Topic validated successfully"
        if "reason:" in result_lower:
            reason_parts = result.split("Reason:")
            if len(reason_parts) > 1:
                reason = reason_parts[1].strip()
        
        print(f"[Validator] Result: {'Valid' if is_valid else 'Invalid'}")
        
        return jsonify({
            "success": True,
            "topic": topic,
            "is_valid": is_valid,
            "reason": reason,
            "full_response": result
        }), 200
        
    except Exception as e:
        print(f"[Validator Error] {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@validator_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint for validator service"""
    return jsonify({
        "status": "healthy",
        "service": "validator",
        "llm_configured": llm is not None
    }), 200
