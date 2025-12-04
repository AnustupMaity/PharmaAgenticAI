import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

/**
 * Orchestrator API Client
 * 
 * Handles the complete workflow: validation → clarification → research
 * Supports multi-stage conversation with session management
 */
const orchestratorApi = {
  /**
   * Process a query (validate + clarify + research) - Auto mode with clarification
   * @param {string} topic - The research topic
   * @param {string} [sessionId] - Optional session ID for continuing clarification
   * @param {string} [clarificationResponse] - User's response to clarification question
   * @returns {Promise} Response with stage info (validation/clarification/complete)
   */
  query: async (topic, sessionId = null, clarificationResponse = null) => {
    try {
      const payload = { topic };
      if (sessionId) {
        payload.session_id = sessionId;
      }
      if (clarificationResponse) {
        payload.clarification_response = clarificationResponse;
      }

      const response = await axios.post(
        `${BASE_URL}/api/query-auto`,
        payload,
        {
          timeout: 0,
          headers: {
        'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Orchestrator query error:', error);
      throw error;
    }
  },

  /**
   * Health check
   * @returns {Promise} Health status
   */
  healthCheck: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/health`);
      return response.data;
    } catch (error) {
      console.error('Orchestrator health check error:', error);
      throw error;
    }
  },
};

export default orchestratorApi;
