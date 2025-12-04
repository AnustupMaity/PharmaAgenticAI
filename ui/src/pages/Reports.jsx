import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Filter,
  BarChart3,
  TrendingUp,
  Building,
  Calendar,
  Clock,
  Users,
  Star,
  Eye,
  Share2,
  Bookmark,
  Activity,
  Zap,
  Database,
  Brain,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Sparkles,
  Award,
  Target,
  Layers
} from 'lucide-react'
import ReportPreview from '../components/ReportPreview.jsx'
import Loader from '../components/Loader.jsx'
import { reportApi } from '../api/reportApi.js'
import toast from 'react-hot-toast'

const Reports = () => {
  const { isDarkMode } = useTheme()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('recent')
  const [showStats, setShowStats] = useState(true)

  // Mock data for demonstration
  const mockReports = [
    {
      id: 'report-1',
      title: 'Oncology Market Analysis Q4 2024',
      type: 'market_analysis',
      status: 'completed',
      created_at: '2024-01-15T10:30:00Z',
      pages: 45,
      summary: 'Comprehensive analysis of the global oncology market including CAR-T therapies, checkpoint inhibitors, and emerging biomarkers.',
      sections: [
        { name: 'Executive Summary', pages: 3 },
        { name: 'Market Overview', pages: 12 },
        { name: 'Competitive Landscape', pages: 18 },
        { name: 'Future Outlook', pages: 8 },
        { name: 'Recommendations', pages: 4 }
      ],
      key_insights: [
        'CAR-T therapy market expected to reach $12.4B by 2026',
        'Biosimilar competition increasing for established brands',
        'Personalized medicine driving 25% of new approvals'
      ],
      file_info: {
        format: 'PDF',
        size: 2458624,
        last_modified: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'report-2', 
      title: 'Patent Cliff Analysis - Immunology Segment',
      type: 'patent_analysis',
      status: 'completed',
      created_at: '2024-01-10T14:20:00Z',
      pages: 32,
      summary: 'Analysis of upcoming patent expiries in the immunology segment and their potential market impact.',
      sections: [
        { name: 'Patent Landscape', pages: 10 },
        { name: 'Expiry Timeline', pages: 8 },
        { name: 'Biosimilar Threat Assessment', pages: 10 },
        { name: 'Strategic Recommendations', pages: 4 }
      ],
      key_insights: [
        'Humira biosimilars to capture 60% market share by 2025',
        '$45B in revenue at risk from 2024-2026 patent cliff',
        'Next-generation biologics showing promise in late-stage trials'
      ]
    },
    {
      id: 'report-3',
      title: 'Competitive Intelligence - CNS Therapeutics',
      type: 'competitive_intelligence',
      status: 'processing',
      created_at: '2024-01-20T09:15:00Z',
      progress: 65,
      summary: 'Comprehensive competitive analysis of the CNS therapeutics landscape including Alzheimer\'s, depression, and rare neurological disorders.'
    }
  ]

  const reportTypes = [
    { value: 'all', label: 'All Reports', icon: FileText },
    { value: 'market_analysis', label: 'Market Analysis', icon: TrendingUp },
    { value: 'competitive_intelligence', label: 'Competitive Intelligence', icon: Building },
    { value: 'patent_analysis', label: 'Patent Analysis', icon: FileText }
  ]

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setReports(mockReports)
      setFilteredReports(mockReports)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Filter reports based on search and type
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(report => report.type === filterType)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, filterType])

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newReport = {
        id: `report-${Date.now()}`,
        title: 'New Pharmaceutical Intelligence Report',
        type: 'market_analysis',
        status: 'completed',
        created_at: new Date().toISOString(),
        pages: 28,
        summary: 'Newly generated pharmaceutical intelligence report with latest market data.'
      }
      
      setReports(prev => [newReport, ...prev])
      toast.success('Report generated successfully!')
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = async (report) => {
    try {
      toast.success(`Downloading ${report.title}...`)
      // Simulate download
      console.log('Downloading report:', report.id)
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const handleViewReport = (report) => {
    // Open report in new window/modal
    toast.success(`Opening ${report.title}`)
    console.log('Viewing report:', report.id)
  }

  const handleShareReport = (report) => {
    // Share functionality
    toast.success('Report link copied to clipboard')
    console.log('Sharing report:', report.id)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          color: 'white'
        }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '18px', fontWeight: '500' }}>Loading Intelligence Reports...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode 
          ? `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
        `
          : `
          radial-gradient(circle at 20% 80%, rgba(96, 165, 250, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px 20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Hero Header */}
        <div style={{
          background: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '40px',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: isDarkMode
            ? '0 8px 32px rgba(0, 0, 0, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '30px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Brain size={32} color="white" />
                </div>
                <h1 
                  key={`heading-${isDarkMode}`}
                  style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #ffffff 0%, #e0e6ff 100%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    lineHeight: '1.1'
                  }}>
                  Intelligence Reports
                </h1>
              </div>
              <p style={{
                fontSize: '20px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                margin: 0,
                lineHeight: '1.5',
                maxWidth: '600px'
              }}>
                Generate, analyze, and share comprehensive pharmaceutical intelligence reports powered by advanced AI
              </p>
            </div>
            
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating}
              style={{
                background: isGenerating 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px 32px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.3s ease',
                transform: isGenerating ? 'scale(0.95)' : 'scale(1)',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.target.style.transform = 'scale(1.05) translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.3)'
                }
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Report
                </>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          {showStats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '30px'
            }}>
              {[
                { icon: FileText, label: 'Total Reports', value: '127', change: '+12%' },
                { icon: TrendingUp, label: 'Market Analysis', value: '45', change: '+8%' },
                { icon: Shield, label: 'Patent Reports', value: '32', change: '+15%' },
                { icon: Users, label: 'Team Access', value: '18', change: '+5%' }
              ].map((stat, index) => (
                <div key={index} style={{
                  background: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDarkMode 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.7)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.6)'
                  e.target.style.transform = 'translateY(0)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <stat.icon size={24} color={isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)'} />
                    <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>{stat.change}</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: isDarkMode ? 'white' : '#1e293b', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '14px', color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Controls */}
        <div style={{
          background: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '30px',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
            {/* Search Box */}
            <div style={{
              position: 'relative',
              minWidth: '300px',
              flex: 1,
              maxWidth: '400px'
            }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)'
              }} />
              <input
                type="text"
                placeholder="Search reports, keywords, or insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  background: isDarkMode 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(255, 255, 255, 0.5)',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 48px',
                  color: isDarkMode ? 'white' : '#1e293b',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = isDarkMode 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'rgba(255, 255, 255, 0.7)'
                  e.target.style.borderColor = isDarkMode
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(102, 126, 234, 0.4)'
                }}
                onBlur={(e) => {
                  e.target.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.5)'
                  e.target.style.borderColor = isDarkMode
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(148, 163, 184, 0.3)'
                }}
              />
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {reportTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  style={{
                    background: filterType === type.value 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid ' + (filterType === type.value 
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.2)'),
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (filterType !== type.value) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filterType !== type.value) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  <type.icon size={16} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '4px',
              display: 'flex',
              gap: '4px'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <Layers size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FileText size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Report Generation Status */}
        {isGenerating && (
          <div style={{
            background: isDarkMode 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(148, 163, 184, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                padding: '20px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <Brain size={32} color="white" />
              </div>
              <div>
                <h3 style={{ color: isDarkMode ? 'white' : '#1e293b', fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  Generating Intelligence Report
                </h3>
                <p style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)', margin: 0 }}>
                  Our AI agents are analyzing pharmaceutical data and market trends...
                </p>
              </div>
              <div style={{
                width: '100%',
                maxWidth: '300px',
                height: '6px',
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 41, 59, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  borderRadius: '3px',
                  animation: 'progress 3s ease-in-out infinite'
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Reports Display */}
        {filteredReports.length === 0 && !isGenerating ? (
          <div style={{
            background: isDarkMode
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(148, 163, 184, 0.2)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              padding: '24px',
              display: 'inline-flex',
              marginBottom: '24px'
            }}>
              <FileText size={48} color="white" />
            </div>
            <h3 style={{
              color: isDarkMode ? 'white' : '#1e293b',
              fontSize: '24px',
              fontWeight: '600',
              margin: '0 0 12px 0'
            }}>
              {searchTerm || filterType !== 'all' ? 'No reports found' : 'No reports yet'}
            </h3>
            <p style={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
              fontSize: '16px',
              margin: '0 0 32px 0',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria to find relevant reports'
                : 'Generate your first pharmaceutical intelligence report to get started'
              }
            </p>
            {(!searchTerm && filterType === 'all') && (
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.3)'
                }}
              >
                <Sparkles size={20} />
                Generate First Report
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' 
              ? 'repeat(auto-fill, minmax(400px, 1fr))'
              : '1fr',
            gap: '24px',
            marginBottom: '40px'
          }}>
            {filteredReports.map(report => (
              <div
                key={report.id}
                style={{
                  background: isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '24px',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)'
                  e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)'
                  e.target.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.85)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: report.status === 'completed' 
                    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {report.status === 'completed' ? (
                    <>
                      <CheckCircle size={12} />
                      Completed
                    </>
                  ) : (
                    <>
                      <Clock size={12} />
                      {report.progress}%
                    </>
                  )}
                </div>

                {/* Report Header */}
                <div style={{ marginBottom: '16px', paddingRight: '80px' }}>
                  <h3 style={{
                    color: isDarkMode ? 'white' : '#1e293b',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: '0 0 8px 0',
                    lineHeight: '1.3'
                  }}>
                    {report.title}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '14px',
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                    {report.pages && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} />
                        {report.pages} pages
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Summary */}
                <p style={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: '0 0 20px 0'
                }}>
                  {report.summary}
                </p>

                {/* Key Insights */}
                {report.key_insights && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{
                      color: isDarkMode ? 'white' : '#1e293b',
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Zap size={14} />
                      Key Insights
                    </h4>
                    <ul style={{
                      margin: 0,
                      padding: 0,
                      listStyle: 'none'
                    }}>
                      {report.key_insights.slice(0, 2).map((insight, index) => (
                        <li key={index} style={{
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
                          fontSize: '13px',
                          marginBottom: '4px',
                          paddingLeft: '16px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: 0,
                            top: '6px',
                            width: '4px',
                            height: '4px',
                            background: '#4ade80',
                            borderRadius: '50%'
                          }} />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: 'auto'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewReport(report)
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flex: 1,
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadReport(report)
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShareReport(report)
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Templates & AI Features */}
        <div style={{
          background: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(148, 163, 184, 0.2)',
          marginBottom: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 
              key={`templates-heading-${isDarkMode}`}
              style={{
              fontSize: '32px',
              fontWeight: '700',
              background: isDarkMode
                ? 'linear-gradient(135deg, #ffffff 0%, #e0e6ff 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 12px 0'
            }}>
              Intelligent Report Templates
            </h2>
            <p style={{
              fontSize: '18px',
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
              margin: 0,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              AI-powered templates for comprehensive pharmaceutical intelligence analysis
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: BarChart3,
                title: 'Market Intelligence',
                description: 'Deep market analysis with size estimation, growth projections, and competitive dynamics',
                features: ['Market Sizing', 'Growth Trends', 'Competitive Mapping', 'Opportunity Assessment'],
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                popular: true
              },
              {
                icon: Shield,
                title: 'Patent Analytics',
                description: 'Comprehensive IP landscape analysis and patent cliff assessment with FTO evaluation',
                features: ['Patent Landscape', 'Expiry Analysis', 'Competitor Patents', 'FTO Assessment'],
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              },
              {
                icon: Building,
                title: 'Competitive Intelligence',
                description: 'Strategic competitor analysis with pipeline assessment and market positioning',
                features: ['Pipeline Analysis', 'Market Position', 'Strategic Insights', 'SWOT Analysis'],
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              },
              {
                icon: Target,
                title: 'Regulatory Intelligence',
                description: 'Regulatory pathway analysis and approval timeline predictions with risk assessment',
                features: ['Approval Pathways', 'Timeline Prediction', 'Risk Assessment', 'Regulatory History'],
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
              },
              {
                icon: Globe,
                title: 'Global Market Access',
                description: 'Market access strategy with pricing analysis and reimbursement landscape',
                features: ['Pricing Analysis', 'Market Access', 'Reimbursement', 'Health Economics'],
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
              },
              {
                icon: Activity,
                title: 'Clinical Trial Intelligence',
                description: 'Clinical development analysis with success probability and timeline estimation',
                features: ['Trial Landscape', 'Success Rates', 'Timeline Analysis', 'Endpoint Assessment'],
                gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
              }
            ].map((template, index) => (
              <div
                key={index}
                style={{
                  background: isDarkMode
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '20px',
                  padding: '28px',
                  border: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(148, 163, 184, 0.2)',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)'
                  e.target.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.7)'
                  e.target.style.borderColor = isDarkMode
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(102, 126, 234, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.background = isDarkMode
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)'
                  e.target.style.borderColor = isDarkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(148, 163, 184, 0.2)'
                }}
              >
                {/* Popular Badge */}
                {template.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Star size={10} />
                    Popular
                  </div>
                )}

                {/* Template Icon */}
                <div style={{
                  background: template.gradient,
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'inline-flex',
                  marginBottom: '20px'
                }}>
                  <template.icon size={28} color="white" />
                </div>

                {/* Template Info */}
                <h3 style={{
                  color: isDarkMode ? 'white' : '#1e293b',
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 12px 0'
                }}>
                  {template.title}
                </h3>
                
                <p style={{
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: '0 0 20px 0'
                }}>
                  {template.description}
                </p>

                {/* Features */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '24px'
                }}>
                  {template.features.map((feature, featureIndex) => (
                    <div key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)'
                    }}>
                      <CheckCircle size={12} color="#4ade80" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Use Template Button */}
                <button
                  onClick={() => {
                    handleGenerateReport()
                    toast.success(`Using ${template.title} template`)
                  }}
                  style={{
                    width: '100%',
                    background: template.gradient,
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)'
                    e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <Sparkles size={16} />
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div style={{
          background: isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(148, 163, 184, 0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            padding: '20px',
            display: 'inline-flex',
            marginBottom: '20px'
          }}>
            <Brain size={32} color="white" />
          </div>
          
          <h3 style={{
            color: isDarkMode ? 'white' : '#1e293b',
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 12px 0'
          }}>
            Powered by Advanced AI
          </h3>
          
          <p style={{
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)',
            fontSize: '16px',
            margin: '0 0 24px 0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Our AI agents continuously analyze pharmaceutical data, patents, clinical trials, and market trends to deliver actionable intelligence reports
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: Database, label: '50M+ Data Points' },
              { icon: Award, label: '95% Accuracy' },
              { icon: Zap, label: '10x Faster Analysis' }
            ].map((stat, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <stat.icon size={24} color={isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)'} />
                <span style={{
                  color: isDarkMode ? 'white' : '#1e293b',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default Reports
