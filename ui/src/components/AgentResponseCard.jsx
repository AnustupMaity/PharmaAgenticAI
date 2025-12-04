import React, { useState } from 'react'
import { 
  Bot, 
  TrendingUp, 
  FileText, 
  Database, 
  Globe, 
  Building, 
  BarChart3, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const AgentResponseCard = ({ response, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const getAgentIcon = (agentType) => {
    const icons = {
      iqvia: TrendingUp,
      patent: FileText,
      trials: Database,
      webintel: Globe,
      exim: Building,
      internal: Building,
      report: BarChart3,
      master: Bot
    }
    return icons[agentType] || Bot
  }

  const getAgentName = (agentType) => {
    const names = {
      iqvia: 'IQVIA Intelligence',
      patent: 'Patent Analysis',
      trials: 'Clinical Trials',
      webintel: 'Web Intelligence', 
      exim: 'Export/Import Intelligence',
      internal: 'Internal Intelligence',
      report: 'Report Generator',
      master: 'Master Agent'
    }
    return names[agentType] || 'AI Agent'
  }

  const getStatusIcon = (response) => {
    if (response.error) return AlertCircle
    if (response.synthesized_response || response.insights) return CheckCircle
    return Clock
  }

  const getStatusColor = (response) => {
    if (response.error) return 'text-red-500'
    if (response.synthesized_response || response.insights) return 'text-green-500'
    return 'text-yellow-500'
  }

  const renderAgentResponse = (agentData, agentType) => {
    const Icon = getAgentIcon(agentType)
    
    return (
      <div key={agentType} className="agent-response-item">
        <div className="agent-header">
          <Icon size={18} />
          <span className="agent-name">{getAgentName(agentType)}</span>
          <span className={`agent-status ${getStatusColor(agentData)}`}>
            {React.createElement(getStatusIcon(agentData), { size: 14 })}
          </span>
        </div>
        
        {agentData.error ? (
          <div className="agent-error">
            <p>Error: {agentData.error}</p>
          </div>
        ) : (
          <div className="agent-content">
            {/* Insights */}
            {agentData.insights && (
              <div className="insights-section">
                <h5>Key Insights</h5>
                <ul className="insights-list">
                  {agentData.insights.slice(0, 3).map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Summary */}
            {agentData.data && (
              <div className="data-section">
                <h5>Data Summary</h5>
                <div className="data-grid">
                  {Object.entries(agentData.data).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="data-item">
                      <span className="data-label">{key.replace(/_/g, ' ')}</span>
                      <span className="data-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Type Specific Content */}
            {agentData.response_type && (
              <div className="response-type">
                <span className="response-type-badge">
                  {agentData.response_type.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderSynthesizedResponse = (synthesized) => {
    return (
      <div className="synthesized-response">
        <div className="synthesis-header">
          <Bot size={18} />
          <span>Synthesized Analysis</span>
        </div>
        
        {/* Executive Summary */}
        {synthesized.executive_summary && (
          <div className="executive-summary">
            <h5>Executive Summary</h5>
            <p>{synthesized.executive_summary}</p>
          </div>
        )}

        {/* Unified Insights */}
        {synthesized.unified_insights && synthesized.unified_insights.length > 0 && (
          <div className="unified-insights">
            <h5>Key Findings</h5>
            <ul className="insights-list">
              {synthesized.unified_insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence Score */}
        {synthesized.confidence_score !== undefined && (
          <div className="confidence-score">
            <span>Confidence: {Math.round(synthesized.confidence_score * 100)}%</span>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${synthesized.confidence_score * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="agent-response-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title">
          <Bot size={20} />
          <span>AI Analysis Results</span>
        </div>
        <div className="card-controls">
          <span className="timestamp">
            <Clock size={14} />
            {timestamp.toLocaleTimeString()}
          </span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-button"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Card Content */}
      {isExpanded && (
        <div className="card-content">
          {/* Synthesized Response (if available) */}
          {response.synthesized_response && renderSynthesizedResponse(response.synthesized_response)}

          {/* Individual Agent Responses */}
          {response.agent_responses && (
            <div className="agent-responses">
              <h4>Agent Responses</h4>
              <div className="agent-responses-grid">
                {Object.entries(response.agent_responses).map(([agentType, agentData]) => 
                  renderAgentResponse(agentData, agentType)
                )}
              </div>
            </div>
          )}

          {/* Single Agent Response */}
          {response.agent && !response.agent_responses && (
            <div className="single-agent-response">
              {renderAgentResponse(response, response.agent)}
            </div>
          )}

          {/* Agents Used Info */}
          {response.agents_used && (
            <div className="agents-used">
              <span>Agents consulted: {response.agents_used.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AgentResponseCard
