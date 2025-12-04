from flask import Blueprint, request, jsonify
from routes.validator import validate_topic_with_retry
from routes.websearch import research_with_retry
from routes.iqvia import analyze_with_retry
from routes.clarification import create_clarification_crew, parse_clarification_response, MAX_CLARIFICATION_COUNT
import time
import re
import uuid
from datetime import datetime

# Create Blueprint for orchestration
orchestrator_bp = Blueprint('orchestrator', __name__)

# Store orchestration sessions (in production, use Redis or database)
orchestration_sessions = {}


def determine_required_agents(query: str) -> dict:
    """
    Determine which agents are needed based on the query
    
    Returns dict with agent flags:
    {
        'iqvia': bool,
        'uspto': bool,
        'clinical_trials': bool,
        'exim': bool,
        'websearch': bool
    }
    """
    query_lower = query.lower()
    
    agents_needed = {
        'iqvia': False,
        'uspto': False,
        'clinical_trials': False,
        'exim': False,
        'websearch': True  # Always include web search for general context
    }
    
    # IQVIA Keywords - Market data, sales, revenue
    iqvia_keywords = [
        'sales', 'revenue', 'market share', 'market size', 'cagr', 'growth rate',
        'market analysis', 'market data', 'competitive intelligence', 'market leader',
        'pfizer', 'novartis', 'roche', 'merck', 'sanofi', 'gsk', 'astrazeneca',
        'market position', 'market penetration', 'therapeutic area', 'atc classification',
        'top companies', 'top products', 'financial performance'
    ]
    
    # USPTO Keywords - Patents, IP, inventions
    uspto_keywords = [
        'patent', 'patents', 'intellectual property', 'ip', 'uspto', 
        'patent filing', 'patent application', 'patent expiry', 'exclusivity',
        'inventor', 'assignee', 'ipc class', 'patent landscape', 'patent search',
        'patent status', 'granted patent', 'pending patent', 'patent protection'
    ]
    
    # Clinical Trials Keywords - Trials, studies, phases
    clinical_keywords = [
        'clinical trial', 'clinical trials', 'trial', 'study', 'studies',
        'phase i', 'phase ii', 'phase iii', 'phase iv', 'preclinical',
        'clinical study', 'recruitment', 'sponsor', 'intervention',
        'trial status', 'trial results', 'clinicaltrials.gov', 'clinical development',
        'trial design', 'enrollment', 'clinical research'
    ]
    
    # EXIM Keywords - Trade, tariffs, import/export
    exim_keywords = [
        'tariff', 'tariffs', 'import', 'export', 'customs', 'trade',
        'exim', 'import duty', 'export duty', 'trade barrier', 'international trade',
        'cross-border', 'trade regulation', 'customs duty', 'import tariff', 'export tariff'
    ]
    
    # Check each agent's keywords
    if any(keyword in query_lower for keyword in iqvia_keywords):
        agents_needed['iqvia'] = True
    
    if any(keyword in query_lower for keyword in uspto_keywords):
        agents_needed['uspto'] = True
    
    if any(keyword in query_lower for keyword in clinical_keywords):
        agents_needed['clinical_trials'] = True
    
    if any(keyword in query_lower for keyword in exim_keywords):
        agents_needed['exim'] = True
    
    return agents_needed


def compile_multi_agent_report(query: str, results: dict, session: dict) -> str:
    """
    Compile findings from multiple agents into a unified intelligence report
    
    Args:
        query: The refined query
        results: Dictionary of agent results {agent_name: report_text}
        session: Session data including original query and clarification history
    
    Returns:
        Compiled intelligence report
    """
    report_sections = []
    
    # Header
    report_sections.append(f"# 🧬 PharmaAI Intelligence Report\n")
    report_sections.append("=" * 100 + "\n")
    
    # Query Information
    report_sections.append(f"\n**Original Query:** {session['original_query']}")
    report_sections.append(f"\n**Refined Query:** {query}")
    report_sections.append(f"\n**Clarification Rounds:** {session['clarification_count']}")
    report_sections.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Executive Summary
    report_sections.append("\n" + "=" * 100)
    report_sections.append("\n## 📊 Executive Summary\n")
    
    agents_used = list(results.keys())
    agent_descriptions = {
        'iqvia': 'IQVIA Market Data (pharmaceutical sales, market share, competitive intelligence)',
        'uspto': 'USPTO Patent Intelligence (IP landscape, innovation trends, patent analysis)',
        'clinical_trials': 'Clinical Trials Intelligence (trial landscape, development pipeline, competitive analysis)',
        'exim': 'EXIM Trade Intelligence (import/export tariffs, trade regulations)',
        'websearch': 'Web Intelligence (public sources, recent developments, industry news)'
    }
    
    report_sections.append(f"This comprehensive pharmaceutical intelligence report synthesizes data from {len(agents_used)} specialized sources:\n")
    for agent in agents_used:
        if agent in agent_descriptions:
            report_sections.append(f"- ✅ **{agent.upper()}**: {agent_descriptions[agent]}")
    report_sections.append("")
    
    # Individual Agent Reports
    agent_icons = {
        'iqvia': '📈',
        'uspto': '⚖️',
        'clinical_trials': '🔬',
        'exim': '🌍',
        'websearch': '🌐'
    }
    
    agent_titles = {
        'iqvia': 'IQVIA Market Data Analysis',
        'uspto': 'USPTO Patent Intelligence',
        'clinical_trials': 'Clinical Trials Intelligence',
        'exim': 'EXIM Trade Intelligence',
        'websearch': 'Web Intelligence Research'
    }
    
    for agent_name, report_text in results.items():
        icon = agent_icons.get(agent_name, '📄')
        title = agent_titles.get(agent_name, agent_name.upper())
        
        report_sections.append("\n" + "=" * 100)
        report_sections.append(f"\n## {icon} {title}\n")
        
        if "Error:" in report_text:
            report_sections.append(f"⚠️ *{report_text}*\n")
        else:
            report_sections.append(report_text)
            report_sections.append("\n")
    
    # Integrated Insights (if multiple sources)
    if len(results) > 1:
        report_sections.append("\n" + "=" * 100)
        report_sections.append("\n## 🔄 Integrated Insights\n")
        report_sections.append("*Cross-sectional analysis from multiple intelligence sources*\n\n")
        report_sections.append("This report combines:\n")
        
        if 'iqvia' in results:
            report_sections.append("- **Market Intelligence**: Quantitative sales data, market dynamics, and competitive positioning\n")
        if 'uspto' in results:
            report_sections.append("- **IP Intelligence**: Patent landscape, innovation trends, and technology evolution\n")
        if 'clinical_trials' in results:
            report_sections.append("- **Clinical Intelligence**: Development pipeline, trial outcomes, and regulatory insights\n")
        if 'exim' in results:
            report_sections.append("- **Trade Intelligence**: Import/export dynamics, tariff implications, and market access\n")
        if 'websearch' in results:
            report_sections.append("- **Current Intelligence**: Latest developments, news, and industry trends\n")
        
        report_sections.append("\nThis multi-dimensional view enables comprehensive strategic decision-making across pharmaceutical R&D, commercialization, and market access.\n")
    
    # Footer
    report_sections.append("\n" + "=" * 100)
    report_sections.append("\n*🤖 Report generated by PharmaAI Multi-Agent Intelligence Platform*")
    report_sections.append(f"\n*Session ID: {session.get('created_at', 'N/A')}*\n")
    
    return "\n".join(report_sections)


@orchestrator_bp.route('/query-auto', methods=['POST'])
def process_query_auto():
    """
    Orchestrator endpoint with user-interactive clarification
    
    This endpoint follows the full workflow:
    1. Validates the topic
    2. Clarifies the query (returns question to user if needed)
    3. Determines required agents based on refined query
    4. Executes all required agents automatically (no permission request in auto mode)
    5. Returns the final report
    
    Request body:
    {
        "topic": "your research topic",
        "session_id": "optional - for continuing clarification",
        "clarification_response": "optional - user's answer to clarification"
    }
    
    Response stages:
    - "clarification": Need user input
    - "complete": Final report ready
    """
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({
                "error": "Missing 'topic' in request body",
                "success": False
            }), 400
        
        topic = data['topic']
        session_id = data.get('session_id') or str(uuid.uuid4())
        clarification_response = data.get('clarification_response')
        
        if not topic.strip():
            return jsonify({
                "error": "Topic cannot be empty",
                "success": False
            }), 400
        
        print(f"\n{'='*80}")
        print(f"[Orchestrator-Auto] Session: {session_id}")
        print(f"[Orchestrator-Auto] Processing query: {topic}")
        print(f"{'='*80}\n")
        
        # Initialize or retrieve session
        if session_id not in orchestration_sessions:
            orchestration_sessions[session_id] = {
                'original_query': topic,
                'clarification_history': [],
                'clarification_count': 0,
                'refined_query': None,
                'validation_result': None,
                'created_at': datetime.now().isoformat()
            }
        
        session = orchestration_sessions[session_id]
        
        # STEP 1: VALIDATION (only on first request)
        if session['validation_result'] is None:
            print("[Step 1/4] Validating topic...")
            validation_start = time.time()
            
            try:
                validation_result = validate_topic_with_retry(topic)
                validation_duration = time.time() - validation_start
                
                # Parse validation result
                result_lower = validation_result.lower()
                is_valid = "yes" in result_lower and "answer" in result_lower
                
                # Extract reason
                reason = "Topic validated"
                if "reason:" in result_lower:
                    reason_parts = validation_result.split("Reason:")
                    if len(reason_parts) > 1:
                        reason = reason_parts[1].strip()
                
                print(f"[Validation] Result: {'✅ Valid' if is_valid else '❌ Invalid'}")
                print(f"[Validation] Reason: {reason}")
                print(f"[Validation] Duration: {validation_duration:.2f}s\n")
                
                # If not valid, return rejection message
                if not is_valid:
                    return jsonify({
                        "success": False,
                        "session_id": session_id,
                        "topic": topic,
                        "stage": "validation",
                        "validation": {
                            "is_valid": False,
                            "reason": reason,
                            "duration": validation_duration
                        },
                        "message": f"❌ This topic is not related to the pharmaceutical or medical domain. Please provide a topic related to drugs, treatments, clinical trials, or healthcare.",
                        "suggestion": "Try topics like: 'FDA drug approvals', 'diabetes treatment options', 'cancer clinical trials', or 'vaccine development'"
                    }), 200
                
                # Save validation result in session
                session['validation_result'] = {
                    'is_valid': True,
                    'reason': reason,
                    'duration': validation_duration
                }
                
            except Exception as validation_error:
                print(f"[Validation Error] {str(validation_error)}")
                return jsonify({
                    "error": f"Validation failed: {str(validation_error)}",
                    "success": False,
                    "session_id": session_id,
                    "topic": topic
                }), 500
        
        # STEP 2: CLARIFICATION (if query not yet refined)
        if session['refined_query'] is None:
            print("[Step 2/4] Clarifying query...")
            clarification_start = time.time()
            
            # Check if user wants to stop clarification
            user_wants_to_stop = False
            if clarification_response:
                response_lower = clarification_response.lower().strip()
                stop_indicators = [
                    'no', 'nope', 'stop', 'enough', 'proceed', 'continue', 'go ahead',
                    'that\'s enough', 'no more', 'skip', 'just proceed', 'move on',
                    'no need', 'not needed', 'don\'t need', 'sufficient', 'good enough'
                ]
                
                user_wants_to_stop = any(indicator in response_lower for indicator in stop_indicators)
                
                if user_wants_to_stop:
                    print(f"[Clarification] User wants to stop clarification. Building final query from history...")
            
            # Build clarification prompt
            if clarification_response and not user_wants_to_stop:
                clarification_prompt = f"{topic}\n\nUser's response: {clarification_response}"
                session['clarification_history'].append({
                    'user_response': clarification_response,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                clarification_prompt = topic
            
            # If user wants to stop, build refined query from all responses
            if user_wants_to_stop:
                # Stitch together all clarification Q&A into final query
                refined_query = topic
                if session['clarification_history']:
                    # Build comprehensive query including all Q&A pairs
                    clarification_context = []
                    for i, entry in enumerate(session['clarification_history'], 1):
                        if 'question' in entry and 'user_response' not in entry:
                            # This is a question waiting for response
                            continue
                        if 'user_response' in entry:
                            # Find the corresponding question
                            question = None
                            if i > 1 and 'question' in session['clarification_history'][i-2]:
                                question = session['clarification_history'][i-2]['question']
                            
                            if question:
                                clarification_context.append(f"{question} → {entry['user_response']}")
                            else:
                                clarification_context.append(entry['user_response'])
                    
                    if clarification_context:
                        refined_query = f"{topic}\n\nAdditional Details:\n" + "\n".join(f"- {ctx}" for ctx in clarification_context)
                
                session['refined_query'] = refined_query
                print(f"[Clarification] ✅ User stopped clarification after {session['clarification_count']} rounds")
                print(f"[Clarification] Final stitched query:\n{refined_query}\n")
            else:
                # Continue with normal clarification flow
                try:
                    # Create and run clarification crew
                    crew = create_clarification_crew(
                        clarification_prompt,
                        session['clarification_history'],
                        session['clarification_count']
                    )
                    clarification_result = str(crew.kickoff())
                    clarification_duration = time.time() - clarification_start
                    
                    # Parse clarification response
                    parsed = parse_clarification_response(clarification_result)
                    
                    session['clarification_count'] += 1
                    
                    print(f"[Clarification] Round {session['clarification_count']}/{MAX_CLARIFICATION_COUNT}")
                    print(f"[Clarification] Needs more clarification: {parsed['needs_clarification']}")
                    print(f"[Clarification] Duration: {clarification_duration:.2f}s\n")
                    
                    # Check if we need more clarification
                    if parsed['needs_clarification'] and session['clarification_count'] < MAX_CLARIFICATION_COUNT:
                        session['clarification_history'].append({
                            'question': parsed['question'],
                            'reason': parsed['reason'],
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        return jsonify({
                            "success": True,
                            "session_id": session_id,
                            "stage": "clarification",
                            "clarification": {
                                "needs_clarification": True,
                                "question": parsed['question'],
                                "reason": parsed['reason'],
                                "round": session['clarification_count'],
                                "max_rounds": MAX_CLARIFICATION_COUNT,
                                "duration": clarification_duration
                            },
                            "message": "Please provide more details to refine your query.",
                            "instruction": "Send another request with 'clarification_response' field containing your answer and the same 'session_id'. You can also reply 'proceed' or 'no' to stop clarification and continue with the current query."
                        }), 200
                    
                    # Query is ready or max rounds reached - stitch together all responses
                    refined_query = topic
                    if session['clarification_history']:
                        # Build comprehensive query including all Q&A pairs
                        clarification_context = []
                        temp_question = None
                        
                        for entry in session['clarification_history']:
                            if 'question' in entry and 'user_response' not in entry:
                                # Store the question for pairing
                                temp_question = entry['question']
                            elif 'user_response' in entry:
                                # Pair with previous question if available
                                if temp_question:
                                    clarification_context.append(f"{temp_question} → {entry['user_response']}")
                                    temp_question = None
                                else:
                                    clarification_context.append(entry['user_response'])
                        
                        if clarification_context:
                            refined_query = f"{topic}\n\nAdditional Details:\n" + "\n".join(f"- {ctx}" for ctx in clarification_context)
                        else:
                            refined_query = parsed.get('refined_query') or topic
                    else:
                        refined_query = parsed.get('refined_query') or topic
                    
                    session['refined_query'] = refined_query
                    
                    print(f"[Clarification] ✅ Query refined after {session['clarification_count']} rounds")
                    print(f"[Clarification] Final stitched query:\n{refined_query}\n")
                    
                except Exception as clarification_error:
                    print(f"[Clarification Error] {str(clarification_error)}")
                    # Continue with original query if clarification fails
                    session['refined_query'] = topic
        
        # STEP 3: DETERMINE REQUIRED AGENTS
        refined_query = session['refined_query']
        print("[Step 3/4] Determining required agents...")
        required_agents = determine_required_agents(refined_query)
        
        print(f"[Agent Selection] Based on query: '{refined_query}'")
        print(f"  - IQVIA Market Data: {'✅ Yes' if required_agents['iqvia'] else '❌ No'}")
        print(f"  - USPTO Patents: {'✅ Yes' if required_agents['uspto'] else '❌ No'}")
        print(f"  - Clinical Trials: {'✅ Yes' if required_agents['clinical_trials'] else '❌ No'}")
        print(f"  - EXIM Trade Data: {'✅ Yes' if required_agents['exim'] else '❌ No'}")
        print(f"  - Web Search: {'✅ Yes' if required_agents['websearch'] else '❌ No'}\n")
        
        # STEP 3: EXECUTE ALL REQUIRED AGENTS
        print("[Step 4/4] Executing agents...")
        results = {}
        durations = {}
        
        # Import agent functions
        from routes.exim import create_exim_crew
        from routes.uspto import create_uspto_crew
        from routes.clinical_trial import create_clinical_trials_crew
        
        # Execute IQVIA if required
        if required_agents['iqvia']:
            print("[Agent: IQVIA] Starting market data analysis...")
            iqvia_start = time.time()
            try:
                results['iqvia'] = analyze_with_retry(refined_query)
                durations['iqvia'] = time.time() - iqvia_start
                print(f"[Agent: IQVIA] ✅ Complete! Duration: {durations['iqvia']:.2f}s\n")
            except Exception as e:
                print(f"[Agent: IQVIA] ❌ Error: {str(e)}\n")
                results['iqvia'] = f"Error: {str(e)}"
                durations['iqvia'] = time.time() - iqvia_start
        
        # Execute USPTO if required
        if required_agents['uspto']:
            print("[Agent: USPTO] Starting patent search...")
            uspto_start = time.time()
            try:
                crew = create_uspto_crew(refined_query)
                results['uspto'] = str(crew.kickoff())
                durations['uspto'] = time.time() - uspto_start
                print(f"[Agent: USPTO] ✅ Complete! Duration: {durations['uspto']:.2f}s\n")
            except Exception as e:
                print(f"[Agent: USPTO] ❌ Error: {str(e)}\n")
                results['uspto'] = f"Error: {str(e)}"
                durations['uspto'] = time.time() - uspto_start
        
        # Execute Clinical Trials if required
        if required_agents['clinical_trials']:
            print("[Agent: Clinical Trials] Starting clinical trials search...")
            ct_start = time.time()
            try:
                crew = create_clinical_trials_crew(refined_query)
                results['clinical_trials'] = str(crew.kickoff())
                durations['clinical_trials'] = time.time() - ct_start
                print(f"[Agent: Clinical Trials] ✅ Complete! Duration: {durations['clinical_trials']:.2f}s\n")
            except Exception as e:
                print(f"[Agent: Clinical Trials] ❌ Error: {str(e)}\n")
                results['clinical_trials'] = f"Error: {str(e)}"
                durations['clinical_trials'] = time.time() - ct_start
        
        # Execute EXIM if required
        if required_agents['exim']:
            print("[Agent: EXIM] Starting trade data analysis...")
            exim_start = time.time()
            try:
                crew = create_exim_crew(refined_query)
                results['exim'] = str(crew.kickoff())
                durations['exim'] = time.time() - exim_start
                print(f"[Agent: EXIM] ✅ Complete! Duration: {durations['exim']:.2f}s\n")
            except Exception as e:
                print(f"[Agent: EXIM] ❌ Error: {str(e)}\n")
                results['exim'] = f"Error: {str(e)}"
                durations['exim'] = time.time() - exim_start
        
        # Execute Web Search if required
        if required_agents['websearch']:
            print("[Agent: Web Search] Starting web intelligence research...")
            web_start = time.time()
            try:
                results['websearch'] = research_with_retry(refined_query)
                durations['websearch'] = time.time() - web_start
                print(f"[Agent: Web Search] ✅ Complete! Duration: {durations['websearch']:.2f}s\n")
            except Exception as e:
                print(f"[Agent: Web Search] ❌ Error: {str(e)}\n")
                results['websearch'] = f"Error: {str(e)}"
                durations['websearch'] = time.time() - web_start
        
        # Compile final report
        print("[Compilation] Compiling final intelligence report...")
        compile_start = time.time()
        
        final_report = compile_multi_agent_report(
            query=refined_query,
            results=results,
            session=session
        )
        
        compile_duration = time.time() - compile_start
        
        # Get clarification duration from session if available
        clarification_duration = 0
        if session.get('clarification_history'):
            # Sum up all clarification rounds (rough estimate)
            clarification_duration = session['clarification_count'] * 2.0  # Approximate
        
        total_duration = sum(durations.values()) + compile_duration + session['validation_result']['duration'] + clarification_duration
        
        print(f"[Compilation] ✅ Complete! Duration: {compile_duration:.2f}s")
        print(f"\n{'='*80}")
        print(f"[Orchestrator-Auto] Total processing time: {total_duration:.2f}s")
        print(f"  - Validation: {session['validation_result']['duration']:.2f}s")
        print(f"  - Clarification: {clarification_duration:.2f}s ({session['clarification_count']} rounds)")
        for agent_name, duration in durations.items():
            print(f"  - {agent_name}: {duration:.2f}s")
        print(f"  - Compilation: {compile_duration:.2f}s")
        print(f"{'='*80}\n")
        
        # Return in format compatible with old frontend
        return jsonify({
            "success": True,
            "session_id": session_id,
            "stage": "complete",
            "topic": topic,
            "refined_query": refined_query,
            "clarification_performed": session['clarification_count'] > 0,
            "clarification_rounds": session['clarification_count'],
            "validation": session['validation_result'],
            "agents_used": {
                agent: agent in results for agent in ['iqvia', 'uspto', 'clinical_trials', 'exim', 'websearch']
            },
            "research": {
                "report": final_report,
                "durations": durations,
                "compilation_duration": compile_duration,
                "clarification_duration": clarification_duration
            },
            "total_duration": total_duration,
            "message": "✅ Research completed successfully"
        }), 200
        
    except Exception as e:
        print(f"[Orchestrator-Auto Error] {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@orchestrator_bp.route('/query', methods=['POST'])
def process_query():
    """
    Orchestrator endpoint with full workflow:
    1. Validate topic is pharmaceutical-related
    2. Clarify query through interactive questioning
    3. Determine required agents
    4. Request human permission for agent execution
    5. Execute approved agents and compile report
    
    Request body:
    {
        "topic": "your research topic",
        "session_id": "optional - for continuing clarification",
        "clarification_response": "optional - user's response to clarification question",
        "force_complete_clarification": false,
        "user_permission": null or {"iqvia": true, "uspto": false, ...}
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
        session_id = data.get('session_id') or str(uuid.uuid4())
        clarification_response = data.get('clarification_response')
        force_complete_clarification = data.get('force_complete_clarification', False)
        user_permission = data.get('user_permission')
        
        if not topic.strip():
            return jsonify({
                "error": "Topic cannot be empty",
                "success": False
            }), 400
        
        print(f"\n{'='*80}")
        print(f"[Orchestrator] Session: {session_id}")
        print(f"[Orchestrator] Processing query: {topic}")
        print(f"{'='*80}\n")
        
        # Initialize or retrieve session
        if session_id not in orchestration_sessions:
            orchestration_sessions[session_id] = {
                'original_query': topic,
                'clarification_history': [],
                'clarification_count': 0,
                'refined_query': None,
                'validation_result': None,
                'required_agents': None,
                'permission_requested': False,
                'created_at': datetime.now().isoformat()
            }
        
        session = orchestration_sessions[session_id]
        
        # STEP 1: VALIDATION (only on first request)
        if session['validation_result'] is None:
            print("[Step 1/4] Validating topic...")
            validation_start = time.time()
            
            try:
                validation_result = validate_topic_with_retry(topic)
                validation_duration = time.time() - validation_start
                
                # Parse validation result
                result_lower = validation_result.lower()
                is_valid = "yes" in result_lower and "answer" in result_lower
                
                # Extract reason
                reason = "Topic validated"
                if "reason:" in result_lower:
                    reason_parts = validation_result.split("Reason:")
                    if len(reason_parts) > 1:
                        reason = reason_parts[1].strip()
                
                session['validation_result'] = {
                    'is_valid': is_valid,
                    'reason': reason,
                    'duration': validation_duration
                }
                
                print(f"[Validation] Result: {'✅ Valid' if is_valid else '❌ Invalid'}")
                print(f"[Validation] Reason: {reason}")
                print(f"[Validation] Duration: {validation_duration:.2f}s\n")
                
                # If not valid, return rejection message
                if not is_valid:
                    return jsonify({
                        "success": False,
                        "session_id": session_id,
                        "topic": topic,
                        "stage": "validation",
                        "validation": {
                            "is_valid": False,
                            "reason": reason,
                            "duration": validation_duration
                        },
                        "message": f"❌ This topic is not related to the pharmaceutical or medical domain. Please provide a topic related to drugs, treatments, clinical trials, or healthcare.",
                        "suggestion": "Try topics like: 'FDA drug approvals', 'diabetes treatment options', 'cancer clinical trials', or 'vaccine development'"
                    }), 200
                
            except Exception as validation_error:
                print(f"[Validation Error] {str(validation_error)}")
                return jsonify({
                    "error": f"Validation failed: {str(validation_error)}",
                    "success": False,
                    "session_id": session_id,
                    "topic": topic
                }), 500
        
        # STEP 2: CLARIFICATION (if query not yet refined)
        if session['refined_query'] is None:
            print("[Step 2/4] Clarifying query...")
            clarification_start = time.time()
            
            # Build clarification prompt
            if clarification_response:
                clarification_prompt = f"{topic}\n\nUser's response: {clarification_response}"
                session['clarification_history'].append({
                    'user_response': clarification_response,
                    'timestamp': datetime.now().isoformat()
                })
            else:
                clarification_prompt = topic
            
            try:
                # Create and run clarification crew
                crew = create_clarification_crew(
                    clarification_prompt,
                    session['clarification_history'],
                    session['clarification_count']
                )
                clarification_result = str(crew.kickoff())
                clarification_duration = time.time() - clarification_start
                
                # Parse clarification response
                parsed = parse_clarification_response(clarification_result)
                
                session['clarification_count'] += 1
                
                print(f"[Clarification] Round {session['clarification_count']}/{MAX_CLARIFICATION_COUNT}")
                print(f"[Clarification] Needs more clarification: {parsed['needs_clarification']}")
                print(f"[Clarification] Duration: {clarification_duration:.2f}s\n")
                
                # Check if we need more clarification
                if parsed['needs_clarification'] and session['clarification_count'] < MAX_CLARIFICATION_COUNT and not force_complete_clarification:
                    session['clarification_history'].append({
                        'question': parsed['question'],
                        'reason': parsed['reason'],
                        'timestamp': datetime.now().isoformat()
                    })
                    
                    return jsonify({
                        "success": True,
                        "session_id": session_id,
                        "stage": "clarification",
                        "clarification": {
                            "needs_clarification": True,
                            "question": parsed['question'],
                            "reason": parsed['reason'],
                            "round": session['clarification_count'],
                            "max_rounds": MAX_CLARIFICATION_COUNT,
                            "duration": clarification_duration
                        },
                        "message": "Please provide more details to refine your query.",
                        "instruction": "Send another request with 'clarification_response' field containing your answer."
                    }), 200
                
                # Query is ready or max rounds reached
                refined_query = parsed.get('refined_query') or topic
                session['refined_query'] = refined_query
                
                print(f"[Clarification] ✅ Query refined: {refined_query}\n")
                
                # Return clarification complete status and proceed to agent selection on next request
                return jsonify({
                    "success": True,
                    "session_id": session_id,
                    "stage": "clarification_complete",
                    "clarification": {
                        "needs_clarification": False,
                        "refined_query": refined_query,
                        "rounds_used": session['clarification_count'],
                        "max_rounds": MAX_CLARIFICATION_COUNT,
                        "duration": clarification_duration
                    },
                    "message": "✅ Query clarification complete. Determining required agents...",
                    "instruction": "Send another request with the same session_id to proceed to agent selection."
                }), 200
                
            except Exception as clarification_error:
                print(f"[Clarification Error] {str(clarification_error)}")
                # Continue with original query if clarification fails
                session['refined_query'] = topic
        
        # STEP 3: DETERMINE REQUIRED AGENTS (only if refined query is ready)
        if session['refined_query'] is not None and session['required_agents'] is None:
            print("[Step 3/4] Determining required agents...")
            query_to_analyze = session['refined_query']
            
            required_agents = determine_required_agents(query_to_analyze)
            session['required_agents'] = required_agents
            
            print(f"[Agent Selection] Based on query: '{query_to_analyze}'")
            print(f"  - IQVIA Market Data: {'✅ Yes' if required_agents['iqvia'] else '❌ No'}")
            print(f"  - USPTO Patents: {'✅ Yes' if required_agents['uspto'] else '❌ No'}")
            print(f"  - Clinical Trials: {'✅ Yes' if required_agents['clinical_trials'] else '❌ No'}")
            print(f"  - EXIM Trade Data: {'✅ Yes' if required_agents['exim'] else '❌ No'}")
            print(f"  - Web Search: {'✅ Yes' if required_agents['websearch'] else '❌ No'}\n")
            
            # Don't proceed to permission request yet - let this request complete
            # and the next request will handle permission
        
        # STEP 4: REQUEST HUMAN PERMISSION (Human-in-the-Loop)
        if session['required_agents'] is not None and not session.get('permission_requested') and user_permission is None:
            print("[Step 4/4] Requesting human permission...")
            
            # Build list of agents that will be called
            agents_to_call = []
            for agent_name, is_required in session['required_agents'].items():
                if is_required:
                    agents_to_call.append(agent_name)
            
            session['permission_requested'] = True
            
            return jsonify({
                "success": True,
                "session_id": session_id,
                "stage": "permission_request",
                "refined_query": session['refined_query'],
                "required_agents": session['required_agents'],
                "agents_to_call": agents_to_call,
                "message": "🤝 The following agents will be used to answer your query. Please grant permission to proceed.",
                "permission_request": {
                    "iqvia": {
                        "required": session['required_agents']['iqvia'],
                        "description": "IQVIA Market Data - Pharmaceutical sales, market share, and competitive intelligence"
                    },
                    "uspto": {
                        "required": session['required_agents']['uspto'],
                        "description": "USPTO Patents - Patent search, IP landscape, and innovation trends"
                    },
                    "clinical_trials": {
                        "required": session['required_agents']['clinical_trials'],
                        "description": "Clinical Trials - Trial data, phases, sponsors, and development intelligence"
                    },
                    "exim": {
                        "required": session['required_agents']['exim'],
                        "description": "EXIM Trade Data - Import/export tariffs and trade regulations"
                    },
                    "websearch": {
                        "required": session['required_agents']['websearch'],
                        "description": "Web Search - General intelligence from public sources"
                    }
                },
                "instruction": "Send another request with 'user_permission' field: {'iqvia': true/false, 'uspto': true/false, ...}"
            }), 200
        
        # STEP 5: EXECUTE APPROVED AGENTS
        if user_permission is not None or session.get('permission_requested'):
            print("[Step 4/4] Executing approved agents...")
            
            # If user_permission not provided, use all required agents by default
            if user_permission is None:
                user_permission = session['required_agents']
            
            query_to_execute = session['refined_query']
            results = {}
            durations = {}
            
            # Import agent functions
            from routes.exim import create_exim_crew
            from routes.uspto import create_uspto_crew
            from routes.clinical_trial import create_clinical_trials_crew
            
            # Execute IQVIA if approved
            if user_permission.get('iqvia') and session['required_agents']['iqvia']:
                print("[Agent: IQVIA] Starting market data analysis...")
                iqvia_start = time.time()
                try:
                    results['iqvia'] = analyze_with_retry(query_to_execute)
                    durations['iqvia'] = time.time() - iqvia_start
                    print(f"[Agent: IQVIA] ✅ Complete! Duration: {durations['iqvia']:.2f}s\n")
                except Exception as e:
                    print(f"[Agent: IQVIA] ❌ Error: {str(e)}\n")
                    results['iqvia'] = f"Error: {str(e)}"
                    durations['iqvia'] = time.time() - iqvia_start
            
            # Execute USPTO if approved
            if user_permission.get('uspto') and session['required_agents']['uspto']:
                print("[Agent: USPTO] Starting patent search...")
                uspto_start = time.time()
                try:
                    crew = create_uspto_crew(query_to_execute)
                    results['uspto'] = str(crew.kickoff())
                    durations['uspto'] = time.time() - uspto_start
                    print(f"[Agent: USPTO] ✅ Complete! Duration: {durations['uspto']:.2f}s\n")
                except Exception as e:
                    print(f"[Agent: USPTO] ❌ Error: {str(e)}\n")
                    results['uspto'] = f"Error: {str(e)}"
                    durations['uspto'] = time.time() - uspto_start
            
            # Execute Clinical Trials if approved
            if user_permission.get('clinical_trials') and session['required_agents']['clinical_trials']:
                print("[Agent: Clinical Trials] Starting clinical trials search...")
                ct_start = time.time()
                try:
                    crew = create_clinical_trials_crew(query_to_execute)
                    results['clinical_trials'] = str(crew.kickoff())
                    durations['clinical_trials'] = time.time() - ct_start
                    print(f"[Agent: Clinical Trials] ✅ Complete! Duration: {durations['clinical_trials']:.2f}s\n")
                except Exception as e:
                    print(f"[Agent: Clinical Trials] ❌ Error: {str(e)}\n")
                    results['clinical_trials'] = f"Error: {str(e)}"
                    durations['clinical_trials'] = time.time() - ct_start
            
            # Execute EXIM if approved
            if user_permission.get('exim') and session['required_agents']['exim']:
                print("[Agent: EXIM] Starting trade data analysis...")
                exim_start = time.time()
                try:
                    crew = create_exim_crew(query_to_execute)
                    results['exim'] = str(crew.kickoff())
                    durations['exim'] = time.time() - exim_start
                    print(f"[Agent: EXIM] ✅ Complete! Duration: {durations['exim']:.2f}s\n")
                except Exception as e:
                    print(f"[Agent: EXIM] ❌ Error: {str(e)}\n")
                    results['exim'] = f"Error: {str(e)}"
                    durations['exim'] = time.time() - exim_start
            
            # Execute Web Search if approved
            if user_permission.get('websearch') and session['required_agents']['websearch']:
                print("[Agent: Web Search] Starting web intelligence research...")
                web_start = time.time()
                try:
                    results['websearch'] = research_with_retry(query_to_execute)
                    durations['websearch'] = time.time() - web_start
                    print(f"[Agent: Web Search] ✅ Complete! Duration: {durations['websearch']:.2f}s\n")
                except Exception as e:
                    print(f"[Agent: Web Search] ❌ Error: {str(e)}\n")
                    results['websearch'] = f"Error: {str(e)}"
                    durations['websearch'] = time.time() - web_start
            
            # Compile final report
            print("[Compilation] Compiling final intelligence report...")
            compile_start = time.time()
            
            final_report = compile_multi_agent_report(
                query=query_to_execute,
                results=results,
                session=session
            )
            
            compile_duration = time.time() - compile_start
            total_duration = sum(durations.values()) + compile_duration
            
            print(f"[Compilation] ✅ Complete! Duration: {compile_duration:.2f}s")
            print(f"\n{'='*80}")
            print(f"[Orchestrator] Total processing time: {total_duration:.2f}s")
            for agent_name, duration in durations.items():
                print(f"  - {agent_name}: {duration:.2f}s")
            print(f"  - Compilation: {compile_duration:.2f}s")
            print(f"{'='*80}\n")
            
            # Clear session after completion
            del orchestration_sessions[session_id]
            
            return jsonify({
                "success": True,
                "session_id": session_id,
                "stage": "complete",
                "original_query": session['original_query'],
                "refined_query": session['refined_query'],
                "validation": session['validation_result'],
                "clarification_rounds": session['clarification_count'],
                "agents_executed": list(results.keys()),
                "report": final_report,
                "durations": durations,
                "total_duration": total_duration,
                "message": "✅ Intelligence research completed successfully"
            }), 200
        
    except Exception as e:
        print(f"[Orchestrator Error] {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "success": False,
            "error_type": type(e).__name__
        }), 500


@orchestrator_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint for orchestrator service"""
    return jsonify({
        "status": "healthy",
        "service": "orchestrator",
        "version": "2.0",
        "modes": {
            "auto": {
                "endpoint": "POST /api/query-auto",
                "description": "Simplified mode - validates, clarifies internally, and executes all agents automatically",
                "use_case": "Frontend integration, simple queries, one-shot execution"
            },
            "interactive": {
                "endpoint": "POST /api/query",
                "description": "Interactive mode - multi-stage with user-driven clarification and human-in-the-loop",
                "use_case": "Advanced workflows, interactive query refinement, selective agent execution"
            }
        },
        "workflow_auto": [
            "1. Validation - Verify pharmaceutical domain relevance",
            "2. Clarification - Internal query analysis and refinement (automatic)",
            "3. Agent Selection - Determine required intelligence sources",
            "4. Execution - Run all required agents automatically",
            "5. Compilation - Return unified report"
        ],
        "workflow_interactive": [
            "1. Validation - Verify pharmaceutical domain relevance",
            "2. Clarification - Refine vague queries through interactive questioning (max 5 rounds)",
            "3. Agent Selection - Determine required intelligence sources",
            "4. Human-in-the-Loop - Request user permission for agent execution",
            "5. Execution - Run approved agents in parallel",
            "6. Compilation - Synthesize findings into unified report"
        ],
        "available_agents": {
            "validator": "Domain validation using Gemini AI",
            "clarification": "Interactive query refinement (interactive mode only)",
            "iqvia": "Pharmaceutical market data and competitive intelligence",
            "uspto": "Patent search and IP landscape analysis",
            "clinical_trials": "Clinical development and trial intelligence",
            "exim": "Import/export tariffs and trade regulations",
            "websearch": "Web-based research and current developments"
        },
        "features": {
            "auto_mode": {
                "session_management": False,
                "clarification_rounds": "1 (automatic, internal)",
                "human_in_loop": False,
                "parallel_execution": True,
                "multi_agent_synthesis": True
            },
            "interactive_mode": {
                "session_management": True,
                "clarification_rounds": MAX_CLARIFICATION_COUNT,
                "human_in_loop": True,
                "parallel_execution": True,
                "multi_agent_synthesis": True
            }
        }
    }), 200
