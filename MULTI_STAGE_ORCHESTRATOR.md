# Multi-Stage Orchestrator Workflow

## Overview
The `/api/query-auto` endpoint now supports an **interactive multi-stage workflow** that includes:
1. **Validation** - Ensures query is pharmaceutical/medical domain related
2. **Clarification** - Refines the query through up to 5 rounds of interactive Q&A
3. **Agent Selection** - Automatically determines which intelligence agents to use
4. **Execution** - Runs all required agents and compiles a comprehensive report

## Key Features

### Smart Clarification
- **Up to 5 rounds** of clarification questions to refine the query
- **User can stop anytime** by responding with:
  - "no", "stop", "enough", "proceed", "continue", "go ahead"
  - "that's enough", "no more", "skip", "just proceed", "move on"
  - Any similar phrase indicating they want to proceed
- **All responses are stitched together** into a comprehensive refined query
- Example:
  ```
  Original: "paracetamol"
  Round 1 Response: "clinical data and side effects"
  Round 2 Response: "especially in elderly patients"
  Final Query: "paracetamol. Additional context: clinical data and side effects especially in elderly patients"
  ```

### Session Management
- Each query gets a unique `session_id`
- Session tracks:
  - Original query
  - Clarification history (questions, responses, timestamps)
  - Clarification round count
  - Validation result
  - Final refined query

## API Flow

### Stage 1: Validation
**First Request:**
```json
POST /api/query-auto
{
  "topic": "paracetamol"
}
```

**Response (if invalid):**
```json
{
  "success": false,
  "session_id": "uuid",
  "stage": "validation",
  "validation": {
    "is_valid": false,
    "reason": "Not pharmaceutical related",
    "duration": 1.5
  },
  "message": "❌ This topic is not related to the pharmaceutical or medical domain..."
}
```

### Stage 2: Clarification
**Response (needs clarification):**
```json
{
  "success": true,
  "session_id": "uuid",
  "stage": "clarification",
  "clarification": {
    "needs_clarification": true,
    "question": "What aspect of paracetamol are you interested in?",
    "reason": "Query is too broad",
    "round": 1,
    "max_rounds": 5,
    "duration": 2.0
  },
  "message": "Please provide more details to refine your query.",
  "instruction": "Send another request with 'clarification_response' field..."
}
```

**Next Request (with clarification):**
```json
POST /api/query-auto
{
  "topic": "paracetamol",
  "session_id": "uuid",
  "clarification_response": "clinical data and side effects"
}
```

**To Stop Clarification Early:**
```json
POST /api/query-auto
{
  "topic": "paracetamol",
  "session_id": "uuid",
  "clarification_response": "proceed"
}
```

### Stage 3: Execution & Completion
**Response (final report):**
```json
{
  "success": true,
  "session_id": "uuid",
  "stage": "complete",
  "topic": "paracetamol",
  "refined_query": "paracetamol. Additional context: clinical data and side effects",
  "clarification_performed": true,
  "clarification_rounds": 2,
  "validation": { ... },
  "agents_used": {
    "iqvia": true,
    "uspto": false,
    "clinical_trials": true,
    "exim": false,
    "websearch": true
  },
  "research": {
    "report": "# Comprehensive Intelligence Report...",
    "timestamp": "2024-01-15T10:30:00",
    "duration": 45.2
  }
}
```

## Frontend Implementation

### Handling Multi-Stage Responses

The frontend needs to check `response.stage` and handle each stage differently:

```typescript
const response = await queryOrchestrator(topic, sessionId, clarificationResponse);

if (response.stage === "validation" && !response.success) {
  // Show validation error
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: response.message
  }]);
}
else if (response.stage === "clarification") {
  // Show clarification question
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: response.clarification.question
  }]);
  // Store session_id for next request
  setCurrentSessionId(response.session_id);
  setAwaitingClarification(true);
}
else if (response.stage === "complete") {
  // Show final report
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: response.research.report
  }]);
  // Clear session
  setCurrentSessionId(null);
  setAwaitingClarification(false);
}
```

### Sending Clarification Responses

When user responds to a clarification question:

```typescript
const handleSendMessage = async (userMessage: string) => {
  if (awaitingClarification && currentSessionId) {
    // Send clarification response
    const response = await queryOrchestrator(
      messages[0].content, // Original topic
      currentSessionId,
      userMessage
    );
    // Handle response...
  } else {
    // Start new query
    const response = await queryOrchestrator(userMessage);
    // Handle response...
  }
};
```

## Stop Words for Early Termination

The backend detects these phrases to stop clarification:
- "no", "nope", "stop", "enough"
- "proceed", "continue", "go ahead"
- "that's enough", "no more"
- "skip", "just proceed", "move on"
- "no need", "not needed", "don't need"
- "sufficient", "good enough"

When detected, all previous clarification responses are stitched together into the final query.

## Agent Selection Logic

The orchestrator automatically determines which agents to use based on keywords in the refined query:

- **IQVIA**: sales, revenue, market, prescription, commercial
- **USPTO**: patent, IP, intellectual property, innovation
- **Clinical Trials**: trial, study, phase, clinical, patient
- **EXIM**: tariff, import, export, trade, customs
- **WebSearch**: Always included for general context

## Benefits

1. **Better Query Understanding**: Interactive clarification ensures the system understands exactly what the user needs
2. **User Control**: User can stop clarification anytime and proceed with current context
3. **Comprehensive Context**: All clarification responses are combined into a rich, detailed query
4. **Efficient Processing**: Only relevant agents are executed based on the refined query
5. **Session Continuity**: Session management ensures smooth multi-turn conversations
