const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Connect to a database using the provided connection string
 * @param {string} connectionString - Database connection string
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with success status, tables list, and message
 */
export const connectDatabase = async (connectionString, sessionId) => {
  try {
    console.log('Connecting to:', `${API_BASE_URL}/dbcon/connect`);
    console.log('Payload:', { connectionString, sessionId });
    
    const response = await fetch(`${API_BASE_URL}/dbcon/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        connectionString,
        sessionId,
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // Check if response has content
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to connect to database');
    }

    return data;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

/**
 * Select which tables the agent should have access to
 * @param {Array<string>} tables - List of table names
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with success status and message
 */
export const selectTables = async (tables, sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dbcon/select-tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tables,
        sessionId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to select tables');
    }

    return data;
  } catch (error) {
    console.error('Error selecting tables:', error);
    throw error;
  }
};

/**
 * Query the database based on a natural language question
 * @param {string} question - User's question
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with query results and contextual answer
 */
export const queryDatabase = async (question, sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dbcon/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        sessionId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to query database');
    }

    return data;
  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  }
};

/**
 * Disconnect from the database
 * @param {string} sessionId - Session identifier
 * @returns {Promise<Object>} Response with success status and message
 */
export const disconnectDatabase = async (sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dbcon/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to disconnect from database');
    }

    return data;
  } catch (error) {
    console.error('Error disconnecting from database:', error);
    throw error;
  }
};

/**
 * Get a preview of data from a specific table
 * @param {string} tableName - Name of the table to preview
 * @param {string} sessionId - Session identifier
 * @param {number} limit - Maximum number of rows to return (default: 10)
 * @returns {Promise<Object>} Response with preview data
 */
export const previewTable = async (tableName, sessionId, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dbcon/table-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableName,
        sessionId,
        limit,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to preview table');
    }

    return data;
  } catch (error) {
    console.error('Error previewing table:', error);
    throw error;
  }
};
