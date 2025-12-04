import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance for websearch API
const websearchClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds for web research (can take time)
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for handling errors
websearchClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Websearch API Error:', error)
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data?.error || 'Failed to complete research')
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check if the backend is running.')
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
)

export const websearchApi = {
  // Conduct web intelligence research
  research: async (topic) => {
    try {
      const response = await websearchClient.post('/api/websearch/research', {
        topic
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await websearchClient.get('/api/websearch/health')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default websearchApi
