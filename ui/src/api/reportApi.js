import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for report generation
  headers: {
    'Content-Type': 'application/json'
  }
})

export const reportApi = {
  // Generate a new report
  generateReport: async (reportRequest) => {
    const response = await apiClient.post('/reports/generate', reportRequest)
    return response.data
  },

  // Get report status
  getReportStatus: async (reportId) => {
    const response = await apiClient.get(`/reports/status/${reportId}`)
    return response.data
  },

  // Download report
  downloadReport: async (reportId, format = 'pdf') => {
    const response = await apiClient.get(`/reports/download/${reportId}`, {
      params: { format },
      responseType: 'blob' // Important for file downloads
    })
    return response
  },

  // Get available report templates
  getReportTemplates: async () => {
    const response = await apiClient.get('/reports/templates')
    return response.data
  },

  // Delete a report
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`/reports/${reportId}`)
    return response.data
  },

  // Get list of user reports (future implementation)
  getUserReports: async (userId = null) => {
    const response = await apiClient.get('/reports/user', {
      params: { userId }
    })
    return response.data
  },

  // Share report (future implementation)
  shareReport: async (reportId, shareOptions = {}) => {
    const response = await apiClient.post(`/reports/${reportId}/share`, shareOptions)
    return response.data
  },

  // Get report analytics (future implementation)
  getReportAnalytics: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}/analytics`)
    return response.data
  }
}

export default reportApi
