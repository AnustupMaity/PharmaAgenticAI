# DBCon - Database Connection Feature

## Overview

The DBCon feature allows users to connect to external databases, discover tables, select which data the AI agent should access, and ask natural language questions about the data. The system automatically detects report records and provides contextual analysis.

## Features

### 1. Database Connection
- Support for multiple database types:
  - PostgreSQL (including Supabase)
  - MySQL
  - SQLite
  - Any SQLAlchemy-supported database
- Automatic table discovery
- Connection validation
- Secure session management

### 2. Table Discovery & Selection
- Automatic listing of all available tables
- Table schema information (columns, types, nullable, primary keys)
- Preview functionality for each table
- Multi-select table configuration
- Visual indication of selected tables

### 3. Natural Language Querying
- Ask questions about your data in plain English
- Automatic SQL query generation
- Report detection and analysis
- Contextual response generation
- Query history in chat interface

### 4. Report Intelligence
- Automatic detection of report-containing tables
- Content extraction and summarization
- Contextual analysis of report data
- Integration with existing report features

## Architecture

### Backend Components

#### `/backend/routes/dbcon.py`
Main Flask blueprint handling:
- `/connect` - Database connection and table discovery
- `/select-tables` - Configure table access
- `/query` - Natural language query execution
- `/disconnect` - Clean connection teardown
- `/table-preview` - Sample data preview

#### Key Functions:
- `generate_sql_from_question()` - NLP to SQL conversion
- `check_for_reports()` - Report detection logic
- `generate_contextual_response()` - Response generation

### Frontend Components

#### `/ui/src/pages/DBCon.jsx`
Main React component with:
- Connection form with sample templates
- Table selection sidebar with preview
- Chat interface for queries
- Real-time connection status
- Error handling and validation

#### `/ui/src/api/dbconApi.js`
API client with methods:
- `connectDatabase()` - Initialize connection
- `selectTables()` - Configure access
- `queryDatabase()` - Execute queries
- `previewTable()` - Get sample data
- `disconnectDatabase()` - Clean up

## Usage Guide

### For Users

1. **Connect to Database**
   ```
   Navigate to /dbcon
   Enter your connection string
   Example: postgresql://user:password@host:5432/database
   Click "Connect to Database"
   ```

2. **Select Tables**
   ```
   Review discovered tables
   Click checkboxes to select tables
   Use "Select All" for bulk selection
   Click "Preview" to see sample data
   Confirm selection
   ```

3. **Ask Questions**
   ```
   Type natural language questions:
   - "Show me all reports"
   - "What data is available in the patients table?"
   - "Find recent transactions"
   Agent will generate SQL and provide contextual answers
   ```

### Connection String Examples

**Supabase (PostgreSQL):**
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

**MySQL:**
```
mysql://username:password@hostname:3306/database_name
```

**SQLite:**
```
sqlite:///path/to/database.db
```

**PostgreSQL (Local):**
```
postgresql://username:password@localhost:5432/database_name
```

## Security Considerations

### Current Implementation
- Session-based connection management
- Connection strings not persisted
- Automatic cleanup on disconnect
- Server-side query execution

### Production Recommendations

1. **Authentication & Authorization**
   - Integrate with existing auth system
   - Role-based access control
   - Audit logging

2. **Connection String Security**
   - Encrypt stored credentials
   - Use environment variables
   - Implement connection pooling
   - Credential vault integration

3. **Query Safety**
   - SQL injection prevention (using parameterized queries)
   - Query timeout limits
   - Resource usage monitoring
   - Rate limiting

4. **Data Privacy**
   - Comply with data protection regulations
   - Implement data masking for sensitive fields
   - Access logging and monitoring
   - Secure data transmission (SSL/TLS)

## Future Enhancements

### Phase 1 (Immediate)
- [ ] LLM-powered SQL generation (replace simple keyword matching)
- [ ] Better error messages and recovery
- [ ] Query result caching
- [ ] Export functionality (CSV, Excel)

### Phase 2 (Short-term)
- [ ] Saved connections management
- [ ] Query templates and favorites
- [ ] Advanced filtering and sorting
- [ ] Visualization of query results (charts, graphs)
- [ ] Multi-table JOIN support

### Phase 3 (Long-term)
- [ ] Real-time data streaming
- [ ] Scheduled queries and alerts
- [ ] Data transformation pipelines
- [ ] Integration with external BI tools
- [ ] Collaborative query sharing
- [ ] Version control for queries

## API Reference

### POST /dbcon/connect
Connect to a database and discover tables.

**Request:**
```json
{
  "connectionString": "postgresql://user:pass@host:5432/db",
  "sessionId": "session_123"
}
```

**Response:**
```json
{
  "success": true,
  "tables": [
    {
      "name": "users",
      "columns": [
        {
          "name": "id",
          "type": "INTEGER",
          "nullable": false,
          "primary_key": true
        }
      ]
    }
  ],
  "message": "Successfully connected. Found 5 tables."
}
```

### POST /dbcon/select-tables
Configure which tables the agent can access.

**Request:**
```json
{
  "sessionId": "session_123",
  "tables": ["users", "reports", "transactions"]
}
```

**Response:**
```json
{
  "success": true,
  "selected_tables": ["users", "reports", "transactions"],
  "message": "Successfully configured access to 3 tables."
}
```

### POST /dbcon/query
Execute a natural language query.

**Request:**
```json
{
  "sessionId": "session_123",
  "question": "Show me all reports from last month"
}
```

**Response:**
```json
{
  "success": true,
  "query": "SELECT * FROM reports WHERE created_at > '2025-10-01'",
  "results": [...],
  "row_count": 42,
  "response": "I found 42 report records...",
  "has_reports": true
}
```

### POST /dbcon/table-preview
Get a sample of data from a table.

**Request:**
```json
{
  "sessionId": "session_123",
  "tableName": "users",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "table_name": "users",
  "preview": [...],
  "row_count": 10
}
```

### POST /dbcon/disconnect
Disconnect from database and clean up resources.

**Request:**
```json
{
  "sessionId": "session_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully disconnected from database."
}
```

## Troubleshooting

### Connection Issues

**Problem:** "Connection failed: could not connect to server"
- Verify connection string format
- Check network connectivity
- Ensure database server is running
- Verify firewall settings

**Problem:** "Authentication failed"
- Check username and password
- Verify user has database access
- Check SSL/TLS requirements

### Query Issues

**Problem:** "No tables selected"
- Select at least one table before querying
- Confirm table selection with button

**Problem:** "Query failed: permission denied"
- Verify database user permissions
- Check table access rights

## Contributing

When extending this feature:
1. Follow existing code patterns
2. Add error handling for edge cases
3. Update this documentation
4. Add tests for new functionality
5. Consider security implications

## Dependencies

### Backend
- Flask (web framework)
- SQLAlchemy (database abstraction)
- psycopg2-binary (PostgreSQL driver)
- Additional drivers as needed

### Frontend
- React (UI framework)
- Context API (state management)
- Fetch API (HTTP requests)

## License

Part of PharmaAI Intelligence Platform
