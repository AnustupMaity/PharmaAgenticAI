import { useState, useCallback } from 'react'
import { agentApi } from '../api/agentApi.js'
import { mockApi } from '../api/mockApi.js'
import toast from 'react-hot-toast'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || true // Default to mock for development

export const useAgentChat = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (message, selectedAgents = ['master']) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let response
      
      if (USE_MOCK_API) {
        // Use mock API for development
        response = await mockApi.queryMasterAgent(message, { agents: selectedAgents })
      } else {
        // Use real API
        if (selectedAgents.includes('master') || selectedAgents.length > 1) {
          // Use master agent for complex queries
          response = await agentApi.queryMasterAgent(message, { agents: selectedAgents })
        } else {
          // Route to specific agent
          const agentType = selectedAgents[0]
          switch (agentType) {
            case 'iqvia':
              response = await agentApi.analyzeIQVIAQuery({ query: message })
              break
            case 'patent':
              response = await agentApi.analyzePatentQuery({ query: message })
              break
            case 'trials':
              response = await agentApi.analyzeTrialsQuery({ query: message })
              break
            case 'exim':
              response = await agentApi.analyzeEXIMQuery({ query: message })
              break
            case 'webintel':
              response = await agentApi.analyzeWebIntelQuery({ query: message })
              break
            default:
              response = await agentApi.queryMasterAgent(message, { agents: selectedAgents })
          }
        }
      }
      
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to process query'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const querySpecificAgent = useCallback(async (agentType, query, params = {}) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let response
      
      if (USE_MOCK_API) {
        // Use mock responses
        switch (agentType) {
          case 'iqvia':
            response = await mockApi.analyzeIQVIAQuery(query)
            break
          case 'patent':
            response = await mockApi.analyzePatentQuery(query)
            break
          case 'trials':
            response = await mockApi.analyzeTrialsQuery(query)
            break
          default:
            response = await mockApi.queryMasterAgent(query)
        }
      } else {
        // Use real API endpoints
        switch (agentType) {
          case 'iqvia':
            if (params.type === 'market-data') {
              response = await agentApi.getMarketData(params.drugName)
            } else if (params.type === 'forecast') {
              response = await agentApi.getSalesForecast(params.drugName, params.years)
            } else {
              response = await agentApi.analyzeIQVIAQuery({ query })
            }
            break
          
          case 'patent':
            if (params.type === 'search') {
              response = await agentApi.searchPatents(params.searchTerm, params.limit)
            } else if (params.type === 'landscape') {
              response = await agentApi.getPatentLandscape(params.technologyArea)
            } else {
              response = await agentApi.analyzePatentQuery({ query })
            }
            break
          
          case 'trials':
            if (params.type === 'search') {
              response = await agentApi.searchTrials(params.indication, params.phase, params.status)
            } else if (params.type === 'pipeline') {
              response = await agentApi.getCompanyPipeline(params.company)
            } else {
              response = await agentApi.analyzeTrialsQuery({ query })
            }
            break
          
          default:
            response = await agentApi.queryMasterAgent(query)
        }
      }
      
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to query agent'
      setError(errorMessage)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkAgentHealth = useCallback(async () => {
    try {
      if (USE_MOCK_API) {
        return await mockApi.healthCheck()
      } else {
        return await agentApi.healthCheck()
      }
    } catch (err) {
      console.error('Health check failed:', err)
      return { status: 'error', message: err.message }
    }
  }, [])

  return {
    sendMessage,
    querySpecificAgent,
    checkAgentHealth,
    isLoading,
    error
  }
}
