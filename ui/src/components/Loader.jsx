import React from 'react'
import { Loader2, Bot, BarChart3, FileText } from 'lucide-react'

const Loader = ({ message, type = 'default' }) => {
  const getLoaderIcon = () => {
    switch (type) {
      case 'agent': return Bot
      case 'analysis': return BarChart3
      case 'report': return FileText
      default: return Loader2
    }
  }

  const getLoaderMessage = () => {
    if (message) return message
    
    switch (type) {
      case 'agent': return 'AI agents are analyzing your query...'
      case 'analysis': return 'Processing pharmaceutical data...'
      case 'report': return 'Generating comprehensive report...'
      default: return 'Loading...'
    }
  }

  const LoaderIcon = getLoaderIcon()

  return (
    <div className="loader">
      <div className="loader-content">
        <div className="loader-icon">
          <LoaderIcon className="spinner" size={32} />
        </div>
        <div className="loader-text">
          <p className="loader-message">{getLoaderMessage()}</p>
          {type === 'agent' && (
            <div className="loader-details">
              <div className="processing-steps">
                <div className="step step--active">Analyzing query context</div>
                <div className="step">Consulting specialized agents</div>
                <div className="step">Synthesizing insights</div>
                <div className="step">Preparing response</div>
              </div>
            </div>
          )}
          {type === 'report' && (
            <div className="loader-details">
              <div className="report-progress">
                <div className="progress-item">📊 Collecting market data</div>
                <div className="progress-item">🔍 Analyzing competitive landscape</div>
                <div className="progress-item">📋 Formatting report sections</div>
                <div className="progress-item">📄 Generating PDF document</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Animated dots */}
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  )
}

export default Loader
