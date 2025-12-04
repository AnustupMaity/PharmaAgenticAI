import React from 'react'
import { FileText, Download, Eye, Share } from 'lucide-react'

const ReportPreview = ({ report, onDownload, onView, onShare }) => {
  const getReportTypeIcon = (type) => {
    return FileText // Could be expanded for different report types
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500'
      case 'processing': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Ready'
      case 'processing': return 'Generating...'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  return (
    <div className="report-preview">
      <div className="report-header">
        <div className="report-icon">
          {React.createElement(getReportTypeIcon(report.type), { size: 24 })}
        </div>
        <div className="report-info">
          <h3 className="report-title">{report.title || 'Pharmaceutical Intelligence Report'}</h3>
          <div className="report-meta">
            <span className="report-date">
              {new Date(report.created_at || Date.now()).toLocaleDateString()}
            </span>
            <span className={`report-status ${getStatusColor(report.status)}`}>
              {getStatusText(report.status)}
            </span>
            {report.pages && (
              <span className="report-pages">{report.pages} pages</span>
            )}
          </div>
        </div>
      </div>

      {/* Report Summary */}
      {report.summary && (
        <div className="report-summary">
          <p>{report.summary}</p>
        </div>
      )}

      {/* Report Sections */}
      {report.sections && report.sections.length > 0 && (
        <div className="report-sections">
          <h4>Report Sections</h4>
          <ul className="sections-list">
            {report.sections.map((section, index) => (
              <li key={index} className="section-item">
                <span className="section-name">{section.name}</span>
                {section.pages && (
                  <span className="section-pages">({section.pages} pages)</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Insights Preview */}
      {report.key_insights && report.key_insights.length > 0 && (
        <div className="key-insights">
          <h4>Key Insights</h4>
          <ul className="insights-list">
            {report.key_insights.slice(0, 3).map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Report Actions */}
      <div className="report-actions">
        {report.status === 'completed' && (
          <>
            <button 
              onClick={() => onView?.(report)}
              className="action-button action-button--primary"
            >
              <Eye size={16} />
              View Report
            </button>
            <button 
              onClick={() => onDownload?.(report)}
              className="action-button action-button--secondary"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button 
              onClick={() => onShare?.(report)}
              className="action-button action-button--outline"
            >
              <Share size={16} />
              Share
            </button>
          </>
        )}
        
        {report.status === 'processing' && (
          <div className="processing-status">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${report.progress || 0}%` }}
              />
            </div>
            <span>Generating report... {report.progress || 0}%</span>
          </div>
        )}
        
        {report.status === 'error' && (
          <div className="error-status">
            <span>Error generating report: {report.error}</span>
            <button className="action-button action-button--outline">
              Retry
            </button>
          </div>
        )}
      </div>

      {/* File Info */}
      {report.file_info && (
        <div className="file-info">
          <div className="file-detail">
            <span className="file-label">Format:</span>
            <span className="file-value">{report.file_info.format || 'PDF'}</span>
          </div>
          {report.file_info.size && (
            <div className="file-detail">
              <span className="file-label">Size:</span>
              <span className="file-value">{formatFileSize(report.file_info.size)}</span>
            </div>
          )}
          {report.file_info.last_modified && (
            <div className="file-detail">
              <span className="file-label">Modified:</span>
              <span className="file-value">
                {new Date(report.file_info.last_modified).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReportPreview
