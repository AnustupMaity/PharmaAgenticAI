import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth tokens (future use)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const agentApi = {
  // Master Agent
  queryMasterAgent: async (query, context = {}) => {
    const response = await apiClient.post('/master/analyze', {
      query,
      context
    })
    return response.data
  },

  // IQVIA Agent
  getMarketData: async (drugName) => {
    const response = await apiClient.get(`/iqvia/market-data/${drugName}`)
    return response.data
  },

  getSalesForecast: async (drugName, years = 5) => {
    const response = await apiClient.get(`/iqvia/sales-forecast/${drugName}`, {
      params: { years }
    })
    return response.data
  },

  getCompetitiveLandscape: async (therapeuticArea) => {
    const response = await apiClient.get(`/iqvia/competitive-landscape/${therapeuticArea}`)
    return response.data
  },

  analyzeIQVIAQuery: async (query) => {
    const response = await apiClient.post('/iqvia/analyze-query', query)
    return response.data
  },

  // Patent Agent
  searchPatents: async (query, limit = 10) => {
    const response = await apiClient.get(`/patents/search/${query}`, {
      params: { limit }
    })
    return response.data
  },

  getPatentLandscape: async (technologyArea) => {
    const response = await apiClient.get(`/patents/landscape/${technologyArea}`)
    return response.data
  },

  getPatentExpiryAnalysis: async (drugName) => {
    const response = await apiClient.get(`/patents/expiry-analysis/${drugName}`)
    return response.data
  },

  getFreedomToOperate: async (innovation) => {
    const response = await apiClient.get(`/patents/freedom-to-operate/${innovation}`)
    return response.data
  },

  analyzePatentQuery: async (query) => {
    const response = await apiClient.post('/patents/analyze-query', query)
    return response.data
  },

  // Clinical Trials Agent
  searchTrials: async (indication, phase = null, status = null) => {
    const response = await apiClient.get(`/trials/search/${indication}`, {
      params: { phase, status }
    })
    return response.data
  },

  getCompanyPipeline: async (company) => {
    const response = await apiClient.get(`/trials/pipeline/${company}`)
    return response.data
  },

  getCompetitiveTrials: async (drugName) => {
    const response = await apiClient.get(`/trials/competitive-trials/${drugName}`)
    return response.data
  },

  predictTrialSuccess: async (trialId) => {
    const response = await apiClient.get(`/trials/success-predictions/${trialId}`)
    return response.data
  },

  analyzeTrialsQuery: async (query) => {
    const response = await apiClient.post('/trials/analyze-query', query)
    return response.data
  },

  // Export/Import Agent
  getTradeData: async (product, country = null) => {
    const response = await apiClient.get(`/exim/trade-data/${product}`, {
      params: { country }
    })
    return response.data
  },

  getMarketOpportunities: async (region) => {
    const response = await apiClient.get(`/exim/market-opportunities/${region}`)
    return response.data
  },

  getRegulatoryBarriers: async (country) => {
    const response = await apiClient.get(`/exim/regulatory-barriers/${country}`)
    return response.data
  },

  analyzeEXIMQuery: async (query) => {
    const response = await apiClient.post('/exim/analyze-query', query)
    return response.data
  },

  // Web Intelligence Agent
  scrapeNews: async (query) => {
    const response = await apiClient.post('/webintel/scrape-news', query)
    return response.data
  },

  getMarketSentiment: async (drugName) => {
    const response = await apiClient.get(`/webintel/market-sentiment/${drugName}`)
    return response.data
  },

  getCompetitorIntelligence: async (company) => {
    const response = await apiClient.get(`/webintel/competitor-intelligence/${company}`)
    return response.data
  },

  getRegulatoryUpdates: async (region) => {
    const response = await apiClient.get(`/webintel/regulatory-updates/${region}`)
    return response.data
  },

  analyzeWebIntelQuery: async (query) => {
    const response = await apiClient.post('/webintel/analyze-query', query)
    return response.data
  },

  // Health Check
  healthCheck: async () => {
    const response = await apiClient.get('/health')
    return response.data
  }
}

export default agentApi
