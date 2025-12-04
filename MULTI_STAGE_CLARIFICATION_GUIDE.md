# Multi-Stage Clarification Workflow Guide

## Overview
The orchestrator now supports an interactive multi-stage workflow that validates queries, seeks clarification when needed, and then executes the appropriate intelligence agents.

## Workflow Stages

### 1. **Validation Stage**
- **What happens**: Query is validated to ensure it's pharmaceutical/medical-related
- **Response format**:
```json
{
  "success": false,
  "session_id": "uuid",
  "stage": "validation",
  "validation": {
    "is_valid": false,
    "reason": "...",
    "duration": 1.23
  },
  "message": "❌ This topic is not related to...",
  "suggestion": "Try topics like: ..."
}
```

### 2. **Clarification Stage**
- **What happens**: AI asks follow-up questions to refine vague queries
- **Max rounds**: 5 clarification rounds
- **Response format**:
```json
{
  "success": true,
  "session_id": "uuid",
  "stage": "clarification",
  "clarification": {
    "needs_clarification": true,
    "question": "What aspect of paracetamol are you interested in?",
    "reason": "The query is too broad...",
    "round": 1,
    "max_rounds": 5,
    "duration": 2.45
  },
  "message": "Please provide more details...",
  "instruction": "Send another request with 'clarification_response'..."
}
```

### 3. **Completion Stage**
- **What happens**: All agents execute and return final report
- **Response format**:
```json
{
  "success": true,
  "session_id": "uuid",
  "stage": "complete",
  "topic": "original query",
  "refined_query": "clarified query",
  "clarification_performed": true,
  "clarification_rounds": 2,
  "validation": {...},
  "agents_used": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": false,
    "exim": false,
    "websearch": true
  },
  "research": {
    "report": "# Final Intelligence Report\n\n..."
  },
  "metadata": {...}
}
```

## API Usage

### First Request (New Query)
```javascript
POST /api/query-auto
{
  "topic": "paracetamol"
}
```

### Clarification Response (Continuing Session)
```javascript
POST /api/query-auto
{
  "topic": "paracetamol",  // Original topic
  "session_id": "abc-123-def-456",
  "clarification_response": "I'm interested in market data and sales figures"
}
```

## Frontend Implementation

### State Management
```typescript
const [sessionId, setSessionId] = useState<string | null>(null);
const [awaitingClarification, setAwaitingClarification] = useState(false);
```

### Handling Responses
```typescript
const response = await orchestratorApi.query(
  content,
  awaitingClarification && sessionId ? sessionId : undefined,
  awaitingClarification ? content : undefined
);

// Check response stage
if (response.stage === "clarification") {
  // Display question to user
  // Store session_id
  setSessionId(response.session_id);
  setAwaitingClarification(true);
} else if (response.stage === "complete") {
  // Display final report
  setAwaitingClarification(false);
  setSessionId(null);
}
```

## Session Management

### Session Structure
```python
{
    'original_query': str,
    'clarification_history': [
        {
            'question': str,
            'reason': str,
            'user_response': str,
            'timestamp': ISO datetime
        }
    ],
    'clarification_count': int,
    'refined_query': str or None,
    'validation_result': {
        'is_valid': bool,
        'reason': str,
        'duration': float
    },
    'created_at': ISO datetime
}
```

### Session Lifecycle
1. **Creation**: On first request, new session created with UUID
2. **Validation**: Query validated, result stored in session
3. **Clarification Loop**: 
   - Question generated and added to history
   - User responds with session_id
   - Response added to history
   - Process repeats up to MAX_CLARIFICATION_COUNT (5)
4. **Execution**: Once clarified, agents execute with refined_query
5. **Cleanup**: Session remains in memory (consider cleanup after completion)

## Example Flow

### Example 1: Query Needs Clarification
```
User: "paracetamol"
→ Validation: ✅ Valid
→ Clarification Round 1: "What aspect of paracetamol? Clinical, market, or manufacturing?"

User: "market information"
→ Clarification Round 2: "Which market metrics? Sales, pricing, or competition?"

User: "sales and market share data"
→ Clarification Complete: "paracetamol sales and market share data"
→ Agents Execute: IQVIA + WebSearch
→ Final Report: Delivered
```

### Example 2: Query Already Specific
```
User: "FDA approval timeline for mRNA COVID-19 vaccines Pfizer and Moderna"
→ Validation: ✅ Valid
→ Clarification: Query is sufficiently specific, no questions needed
→ Agents Execute: USPTO + Clinical Trials + WebSearch
→ Final Report: Delivered
```

### Example 3: Invalid Query
```
User: "best pizza restaurants in New York"
→ Validation: ❌ Invalid
→ Response: "This topic is not pharmaceutical-related. Try topics like FDA approvals..."
→ Workflow Ends
```

## Key Features

✅ **Session Persistence**: Each conversation maintains state across multiple requests
✅ **Smart Clarification**: AI only asks when query is genuinely vague
✅ **Max Round Limit**: Prevents infinite clarification loops (max 5 rounds)
✅ **Multi-Agent Selection**: Automatically determines which agents to use
✅ **Graceful Fallback**: If clarification fails, continues with original query

## Testing

Test the workflow with:
1. **Vague query**: `"paracetamol"` → Should trigger clarification
2. **Specific query**: `"paracetamol market share in US 2024"` → Should skip clarification
3. **Invalid query**: `"pizza recipes"` → Should fail validation

## Files Modified
- `backend/routes/orchestrator.py` - Multi-stage endpoint logic
- `ui/src/api/orchestratorApi.js` - Updated API client
- `ui/src/pages/Dashboard.tsx` - Session management and stage handling
