# Orchestrator Multi-Stage Workflow - Request/Response Flow

## Complete Workflow Example

### Step 1: Initial Query (Validation + Start Clarification)

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "diabetes drugs"
}
```

**Response (If needs clarification):**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "clarification",
  "clarification": {
    "needs_clarification": true,
    "question": "Which specific aspect of diabetes drugs interests you? Market data and sales, clinical trials, patent landscape, or trade regulations?",
    "reason": "Query lacks specificity on the type of intelligence needed",
    "round": 1,
    "max_rounds": 5,
    "duration": 3.2
  },
  "message": "Please provide more details to refine your query.",
  "instruction": "Send another request with 'clarification_response' field containing your answer."
}
```

---

### Step 2: Clarification Response

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "diabetes drugs",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "clarification_response": "I want market data and sales information"
}
```

**Response (May need more clarification):**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "clarification",
  "clarification": {
    "needs_clarification": true,
    "question": "Which geographic market are you interested in? United States, Europe, Asia, or Global?",
    "reason": "Geographic scope not specified for market analysis",
    "round": 2,
    "max_rounds": 5,
    "duration": 2.8
  },
  "message": "Please provide more details to refine your query.",
  "instruction": "Send another request with 'clarification_response' field containing your answer."
}
```

---

### Step 3: Final Clarification Response

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "diabetes drugs",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "clarification_response": "US market for the last 5 years"
}
```

**Response (Clarification Complete):**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "clarification_complete",
  "clarification": {
    "needs_clarification": false,
    "refined_query": "US diabetes drug market data and sales information for the last 5 years",
    "rounds_used": 3,
    "max_rounds": 5,
    "duration": 3.1
  },
  "message": "✅ Query clarification complete. Determining required agents...",
  "instruction": "Send another request with the same session_id to proceed to agent selection."
}
```

---

### Step 4: Proceed to Agent Selection (Permission Request)

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "diabetes drugs",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Permission Request):**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "permission_request",
  "refined_query": "US diabetes drug market data and sales information for the last 5 years",
  "required_agents": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  },
  "agents_to_call": ["iqvia", "websearch"],
  "message": "🤝 The following agents will be used to answer your query. Please grant permission to proceed.",
  "permission_request": {
    "iqvia": {
      "required": true,
      "description": "IQVIA Market Data - Pharmaceutical sales, market share, and competitive intelligence"
    },
    "uspto": {
      "required": false,
      "description": "USPTO Patents - Patent search, IP landscape, and innovation trends"
    },
    "clinical_trials": {
      "required": false,
      "description": "Clinical Trials - Trial data, phases, sponsors, and development intelligence"
    },
    "exim": {
      "required": false,
      "description": "EXIM Trade Data - Import/export tariffs and trade regulations"
    },
    "websearch": {
      "required": true,
      "description": "Web Search - General intelligence from public sources"
    }
  },
  "instruction": "Send another request with 'user_permission' field: {'iqvia': true/false, 'uspto': true/false, ...}"
}
```

---

### Step 5: Grant Permission and Execute

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "diabetes drugs",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_permission": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  }
}
```

**Response (Execution Complete):**
```json
{
  "success": true,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "complete",
  "original_query": "diabetes drugs",
  "refined_query": "US diabetes drug market data and sales information for the last 5 years",
  "validation": {
    "is_valid": true,
    "reason": "Query is related to pharmaceutical market analysis",
    "duration": 2.3
  },
  "clarification_rounds": 3,
  "agents_executed": ["iqvia", "websearch"],
  "report": "# 🧬 PharmaAI Intelligence Report\n\n**Original Query:** diabetes drugs\n**Refined Query:** US diabetes drug market data and sales information for the last 5 years\n\n## 📈 IQVIA Market Data Analysis\n[Detailed market data...]\n\n## 🌐 Web Intelligence Research\n[Web research findings...]\n\n## 🔄 Integrated Insights\n[Combined analysis...]",
  "durations": {
    "iqvia": 45.2,
    "websearch": 23.8
  },
  "total_duration": 69.0,
  "message": "✅ Intelligence research completed successfully"
}
```

---

## Workflow States

| Stage | Description | Next Action |
|-------|-------------|-------------|
| `validation` | Query rejected - not pharmaceutical | Provide new query |
| `clarification` | Needs more details | Send `clarification_response` |
| `clarification_complete` | Query refined successfully | Send request with same `session_id` |
| `permission_request` | Awaiting user approval | Send `user_permission` |
| `complete` | All done - report ready | Done (session cleared) |

---

## Error Handling

### Invalid Query (Non-Pharmaceutical)

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "best Italian restaurants"
}
```

**Response:**
```json
{
  "success": false,
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "topic": "best Italian restaurants",
  "stage": "validation",
  "validation": {
    "is_valid": false,
    "reason": "Topic is not related to pharmaceutical or medical domain",
    "duration": 1.8
  },
  "message": "❌ This topic is not related to the pharmaceutical or medical domain. Please provide a topic related to drugs, treatments, clinical trials, or healthcare.",
  "suggestion": "Try topics like: 'FDA drug approvals', 'diabetes treatment options', 'cancer clinical trials', or 'vaccine development'"
}
```

---

## Force Complete Clarification

If you want to skip remaining clarification rounds:

**Request:**
```json
POST /api/orchestrator/query
{
  "topic": "diabetes drugs",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "clarification_response": "just use what I provided",
  "force_complete_clarification": true
}
```

This will use the current query state and proceed to agent selection.

---

## Session Management

- **Session Creation**: Automatic on first request
- **Session Persistence**: Maintained across requests using `session_id`
- **Session Deletion**: Automatic after completion (stage = "complete")
- **Session Timeout**: None (in-memory storage clears on server restart)

---

## Frontend Integration Tips

### State Machine in React

```javascript
const [orchestratorState, setOrchestratorState] = useState({
  stage: null,
  sessionId: null,
  refinedQuery: null,
  requiredAgents: null,
  report: null
});

const handleOrchestrator = async (payload) => {
  const response = await fetch('/api/orchestrator/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await response.json();
  
  switch(data.stage) {
    case 'clarification':
      // Show clarification question to user
      showClarificationUI(data.clarification.question);
      break;
      
    case 'clarification_complete':
      // Automatically proceed to next stage
      handleOrchestrator({ 
        topic: payload.topic, 
        session_id: data.session_id 
      });
      break;
      
    case 'permission_request':
      // Show permission UI with agent checkboxes
      showPermissionUI(data.permission_request);
      break;
      
    case 'complete':
      // Display final report
      displayReport(data.report);
      break;
  }
  
  setOrchestratorState(prev => ({...prev, ...data}));
};
```

---

## Key Points

1. **Multi-Request Flow**: Each stage requires a separate request
2. **Session ID**: Must be preserved across all requests
3. **Automatic Progression**: `clarification_complete` stage should auto-trigger next request
4. **Human Control**: Permission request gives user full control
5. **Graceful Degradation**: System continues even if agents fail

---

## Testing the Flow

Use the test script:
```bash
cd backend
python test_orchestrator_full.py
```

Or test manually with curl:

```bash
# Step 1: Initial query
curl -X POST http://localhost:5000/api/orchestrator/query \
  -H "Content-Type: application/json" \
  -d '{"topic": "diabetes drugs"}'

# Step 2: Clarification response (use session_id from step 1)
curl -X POST http://localhost:5000/api/orchestrator/query \
  -H "Content-Type: application/json" \
  -d '{"topic": "diabetes drugs", "session_id": "YOUR_SESSION_ID", "clarification_response": "US market sales"}'

# Step 3: Proceed after clarification complete
curl -X POST http://localhost:5000/api/orchestrator/query \
  -H "Content-Type: application/json" \
  -d '{"topic": "diabetes drugs", "session_id": "YOUR_SESSION_ID"}'

# Step 4: Grant permission
curl -X POST http://localhost:5000/api/orchestrator/query \
  -H "Content-Type: application/json" \
  -d '{"topic": "diabetes drugs", "session_id": "YOUR_SESSION_ID", "user_permission": {"iqvia": true, "websearch": true, "uspto": false, "clinical_trials": false, "exim": false}}'
```
