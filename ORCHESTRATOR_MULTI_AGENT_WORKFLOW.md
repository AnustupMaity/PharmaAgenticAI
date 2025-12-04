# Orchestrator Multi-Agent Workflow

## Overview
The PharmaAI Orchestrator manages a sophisticated multi-stage workflow that validates, clarifies, and executes pharmaceutical intelligence queries across multiple specialized agents with human-in-the-loop approval.

## Workflow Stages

### 1. **Validation Stage** ✅
- **Purpose**: Verify that the query is related to pharmaceutical/medical domain
- **Agent**: Validator Agent (Gemini 2.0 Flash)
- **Action**: Analyzes query against pharmaceutical domain criteria
- **Outcome**: 
  - ✅ **Valid**: Proceed to clarification
  - ❌ **Invalid**: Reject query with explanation

**Example Invalid Query**: "Best restaurants in New York"
**Example Valid Query**: "Diabetes drug market analysis"

---

### 2. **Clarification Stage** 💬
- **Purpose**: Refine vague queries through interactive questioning
- **Agent**: Clarification Specialist (Gemini 2.5 Pro)
- **Max Rounds**: 5
- **Process**:
  - Agent analyzes query for missing specificity
  - Asks ONE focused question per round
  - User provides response
  - Continues until query is specific enough OR max rounds reached

**Example Clarification Flow**:
```
User: "Tell me about diabetes drugs"
Bot: "Which specific aspect interests you? Market data, clinical trials, or patents?"
User: "Market data"
Bot: "Which geographic region? US, Europe, Asia, or Global?"
User: "US market"
Bot: "What time period? Last year, 3 years, 5 years?"
User: "Last 5 years"
✅ Refined Query: "US market data for diabetes drugs over the last 5 years"
```

---

### 3. **Agent Selection Stage** 🎯
- **Purpose**: Determine which specialized agents are needed
- **Process**: Keyword-based analysis of refined query
- **Available Agents**:
  - **IQVIA** 📈 - Market data, sales, revenue, market share
  - **USPTO** ⚖️ - Patents, IP landscape, innovation
  - **Clinical Trials** 🔬 - Trial data, phases, development pipeline
  - **EXIM** 🌍 - Import/export tariffs, trade regulations
  - **Web Search** 🌐 - General web intelligence (always included)

**Keyword Mapping**:
| Agent | Keywords |
|-------|----------|
| IQVIA | sales, revenue, market share, market size, CAGR, growth rate, company names |
| USPTO | patent, IP, intellectual property, invention, exclusivity |
| Clinical Trials | clinical trial, phase, study, recruitment, sponsor |
| EXIM | tariff, import, export, trade, customs |
| Web Search | (always enabled) |

---

### 4. **Human-in-the-Loop Permission Stage** 🤝
- **Purpose**: Request user approval before executing expensive/time-consuming agents
- **Display**: Shows which agents will be called and why
- **User Action**: Grant or deny permission for each agent
- **Benefits**:
  - Cost control (API calls)
  - Time management (some agents take minutes)
  - User transparency
  - Selective execution

**Example Permission Request**:
```json
{
  "stage": "permission_request",
  "refined_query": "US market data for diabetes drugs",
  "required_agents": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  },
  "permission_request": {
    "iqvia": {
      "required": true,
      "description": "IQVIA Market Data - Pharmaceutical sales, market share..."
    },
    "websearch": {
      "required": true,
      "description": "Web Search - General intelligence from public sources"
    }
  }
}
```

**User Response**:
```json
{
  "session_id": "abc123",
  "user_permission": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  }
}
```

---

### 5. **Execution Stage** 🚀
- **Purpose**: Execute approved agents in parallel
- **Process**:
  - Only run agents granted permission
  - Execute in parallel where possible
  - Collect results from each agent
  - Handle errors gracefully (continue with other agents)

**Execution Flow**:
```
[IQVIA Agent] ▶️ Running market analysis...
[Web Search] ▶️ Running web intelligence...
  ↓ (parallel execution)
[IQVIA Agent] ✅ Complete! (45.2s)
[Web Search] ✅ Complete! (23.8s)
```

---

### 6. **Compilation Stage** 📊
- **Purpose**: Synthesize findings from multiple agents into unified report
- **Process**:
  - Combine all agent reports
  - Add executive summary
  - Highlight cross-sectional insights
  - Format with markdown styling
- **Output**: Comprehensive pharmaceutical intelligence report

**Report Structure**:
```
# PharmaAI Intelligence Report
- Original Query
- Refined Query
- Executive Summary

## IQVIA Market Data Analysis
[Market intelligence findings]

## Web Intelligence Research
[Web research findings]

## Integrated Insights
[Cross-analysis and synthesis]
```

---

## API Usage

### Initial Request
```bash
POST /api/orchestrator/query
{
  "topic": "diabetes drug market"
}
```

### Response - Clarification Needed
```json
{
  "success": true,
  "session_id": "abc123",
  "stage": "clarification",
  "clarification": {
    "needs_clarification": true,
    "question": "Which geographic region interests you?",
    "reason": "Query lacks geographic specificity",
    "round": 1,
    "max_rounds": 5
  }
}
```

### Follow-up - Clarification Response
```bash
POST /api/orchestrator/query
{
  "topic": "diabetes drug market",
  "session_id": "abc123",
  "clarification_response": "US market"
}
```

### Response - Permission Request
```json
{
  "success": true,
  "session_id": "abc123",
  "stage": "permission_request",
  "refined_query": "US diabetes drug market analysis",
  "required_agents": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  }
}
```

### Follow-up - Grant Permission
```bash
POST /api/orchestrator/query
{
  "topic": "diabetes drug market",
  "session_id": "abc123",
  "user_permission": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  }
}
```

### Final Response - Complete
```json
{
  "success": true,
  "session_id": "abc123",
  "stage": "complete",
  "original_query": "diabetes drug market",
  "refined_query": "US diabetes drug market analysis",
  "clarification_rounds": 2,
  "agents_executed": ["iqvia", "websearch"],
  "report": "[Full intelligence report...]",
  "durations": {
    "iqvia": 45.2,
    "websearch": 23.8
  },
  "total_duration": 69.0
}
```

---

## Session Management

- **Session ID**: Unique identifier for each query workflow
- **Storage**: In-memory (for development) - use Redis/DB in production
- **Lifecycle**: Created on first request, persists through stages, deleted after completion
- **Data Stored**:
  - Original query
  - Clarification history
  - Refined query
  - Validation result
  - Required agents
  - Permission status

---

## Benefits

### For Users
✅ **Clarity**: Interactive refinement ensures accurate results
✅ **Control**: Human approval before execution
✅ **Transparency**: See which agents will run and why
✅ **Efficiency**: Only run necessary agents

### For System
✅ **Cost Control**: Avoid unnecessary API calls
✅ **Resource Management**: Parallel execution where possible
✅ **Error Resilience**: Continue even if one agent fails
✅ **Auditability**: Full session history tracking

---

## Example Workflows

### Workflow 1: Market Analysis
```
User: "cancer drugs"
  ↓ [Validation] ✅ Valid
  ↓ [Clarification] "Which cancer type?"
User: "lung cancer"
  ↓ [Clarification] "Which market region?"
User: "Global"
  ↓ [Agent Selection] IQVIA + Web Search
  ↓ [Permission] User approves both
  ↓ [Execution] Both agents run
  ↓ [Compilation] Unified report
✅ Complete
```

### Workflow 2: Patent Research
```
User: "insulin patents expiring"
  ↓ [Validation] ✅ Valid
  ↓ [Clarification] "Which time period?"
User: "Next 3 years"
  ↓ [Agent Selection] USPTO + Web Search
  ↓ [Permission] User approves both
  ↓ [Execution] Both agents run
  ↓ [Compilation] Unified report
✅ Complete
```

### Workflow 3: Comprehensive Analysis
```
User: "GLP-1 drug landscape"
  ↓ [Validation] ✅ Valid
  ↓ [Clarification] "Full analysis or specific aspect?"
User: "Full analysis - market, trials, and patents"
  ↓ [Agent Selection] IQVIA + USPTO + Clinical Trials + Web Search
  ↓ [Permission] User approves all
  ↓ [Execution] All 4 agents run in parallel
  ↓ [Compilation] Comprehensive multi-source report
✅ Complete
```

---

## Error Handling

- **Validation Fails**: Return rejection with suggestion
- **Clarification Error**: Continue with original query
- **Agent Execution Error**: Mark error in report, continue with other agents
- **Zero Results**: Still compile report with available data
- **Connection Error**: Graceful error message with retry suggestion

---

## Configuration

- `MAX_CLARIFICATION_COUNT = 5` - Maximum clarification rounds
- Session storage: In-memory dict (replace with Redis for production)
- Agent timeouts: 30 seconds per request
- Retry logic: 3 retries with exponential backoff

---

## Testing

Run the test script:
```bash
cd backend
python test_orchestrator_full.py
```

This tests:
1. Health endpoint
2. Invalid query rejection
3. Full workflow (validation → clarification → permission → execution)

---

## Future Enhancements

- [ ] Redis session storage for production
- [ ] Streaming responses for long-running agents
- [ ] WebSocket support for real-time updates
- [ ] Agent result caching
- [ ] User preferences (skip clarification, default permissions)
- [ ] Cost estimation before execution
- [ ] Agent execution priority/ordering
- [ ] Partial report delivery (as agents complete)
