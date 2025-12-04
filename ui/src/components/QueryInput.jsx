import React, { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  TrendingUp, 
  FileText, 
  Globe, 
  Activity, 
  Database, 
  Sparkles, 
  Brain, 
  Zap, 
  Send,
  Loader2,
  ArrowRight,
  CheckCircle,
  Star,
  Target
} from 'lucide-react'

const QueryInput = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('')
  const [selectedAgents, setSelectedAgents] = useState(['master'])
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef(null)

  const agentOptions = [
    { 
      id: 'master', 
      name: 'Master Agent', 
      icon: Brain, 
      description: 'Comprehensive analysis using all specialized agents',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      popular: true
    },
    { 
      id: 'iqvia', 
      name: 'IQVIA Intelligence', 
      icon: TrendingUp, 
      description: 'Market data, sales forecasting & commercial insights',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      id: 'patent', 
      name: 'Patent Analysis', 
      icon: FileText, 
      description: 'IP landscape, patent cliff & freedom to operate',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      id: 'trials', 
      name: 'Clinical Trials', 
      icon: Database, 
      description: 'Pipeline intelligence & trial success prediction',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    { 
      id: 'webintel', 
      name: 'Web Intelligence', 
      icon: Globe, 
      description: 'Market sentiment, news analysis & competitive monitoring',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSubmit({
        query: query.trim(),
        agents: selectedAgents,
        timestamp: new Date()
      })
      setQuery('')
    }
  }

  const toggleAgent = (agentId) => {
    if (agentId === 'master') {
      setSelectedAgents(['master'])
    } else {
      setSelectedAgents(prev => {
        const filtered = prev.filter(id => id !== 'master')
        if (filtered.includes(agentId)) {
          return filtered.filter(id => id !== agentId)
        } else {
          return [...filtered, agentId]
        }
      })
    }
  }

  const predefinedQueries = [
    {
      text: "What is the market opportunity for CAR-T therapies in oncology?",
      category: "Market Analysis",
      icon: TrendingUp,
      popular: true
    },
    {
      text: "Analyze the competitive landscape for diabetes drugs",
      category: "Competitive Intelligence",
      icon: Target,
      popular: true
    },
    {
      text: "When do key patents expire for top-selling biologics?",
      category: "Patent Intelligence",
      icon: FileText,
      popular: false
    },
    {
      text: "What are the latest clinical trial trends in immunology?",
      category: "Clinical Intelligence",
      icon: Database,
      popular: false
    },
    {
      text: "Assess export opportunities for pharmaceutical products in Asia",
      category: "Market Access",
      icon: Globe,
      popular: false
    },
    {
      text: "Compare biosimilar competition for adalimumab globally",
      category: "Market Analysis",
      icon: Activity,
      popular: true
    }
  ]

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [query])

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
        background: `
          radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)
        `,
        animation: 'float 15s ease-in-out infinite'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              padding: '12px',
              animation: 'pulse 3s ease-in-out infinite'
            }}>
              <Sparkles size={24} color="white" />
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e6ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              AI Intelligence Query
            </h3>
          </div>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px',
            margin: 0,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Ask our AI agents anything about pharmaceutical markets, patents, clinical trials, and competitive intelligence
          </p>
        </div>

        {/* Agent Selection */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <Brain size={20} color="rgba(255, 255, 255, 0.8)" />
            <h4 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              margin: 0
            }}>
              Select AI Agents
            </h4>
            <span style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {selectedAgents.length} selected
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {agentOptions.map((agent) => {
              const Icon = agent.icon
              const isSelected = selectedAgents.includes(agent.id)
              
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => toggleAgent(agent.id)}
                  style={{
                    background: isSelected 
                      ? agent.gradient
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                      e.target.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {/* Popular Badge */}
                  {agent.popular && (
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

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: agent.popular ? '80px' : '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      padding: '4px'
                    }}>
                      <CheckCircle size={16} color="white" />
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    paddingRight: agent.popular ? '80px' : '40px'
                  }}>
                    <div style={{
                      background: isSelected 
                        ? 'rgba(255, 255, 255, 0.2)'
                        : agent.gradient,
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '48px',
                      height: '48px'
                    }}>
                      <Icon size={24} color="white" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '6px'
                      }}>
                        {agent.name}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {agent.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Query Input Form */}
        <form onSubmit={handleSubmit} style={{
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            border: `2px solid ${isFocused ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            {/* Input Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <Search size={20} color="rgba(255, 255, 255, 0.8)" />
              <span style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Your Intelligence Query
              </span>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask about market opportunities, competitive landscapes, patent expiries, clinical trials, or any pharmaceutical intelligence..."
              disabled={isLoading}
              style={{
                width: '100%',
                minHeight: '80px',
                maxHeight: '200px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '16px',
                lineHeight: '1.5',
                resize: 'none',
                fontFamily: 'inherit',
                marginBottom: '20px'
              }}
            />

            {/* Submit Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '14px'
              }}>
                {query.length}/1000 characters
              </div>
              
              <button 
                type="submit" 
                disabled={!query.trim() || isLoading || selectedAgents.length === 0}
                style={{
                  background: (!query.trim() || isLoading || selectedAgents.length === 0)
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 28px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (!query.trim() || isLoading || selectedAgents.length === 0) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease',
                  opacity: (!query.trim() || isLoading || selectedAgents.length === 0) ? 0.5 : 1,
                  boxShadow: (!query.trim() || isLoading || selectedAgents.length === 0) 
                    ? 'none' 
                    : '0 8px 24px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (query.trim() && !isLoading && selectedAgents.length > 0) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (query.trim() && !isLoading && selectedAgents.length > 0) {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.3)'
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Generate Intelligence
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Predefined Queries */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Target size={20} color="rgba(255, 255, 255, 0.8)" />
              <h4 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>
                Example Queries
              </h4>
            </div>
            
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {showSuggestions ? 'Hide' : 'Show'} Examples
            </button>
          </div>

          {(showSuggestions || !query) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '12px'
            }}>
              {predefinedQueries.map((suggestion, index) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion.text)
                      setShowSuggestions(false)
                    }}
                    disabled={isLoading}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                        e.target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    {/* Popular Badge */}
                    {suggestion.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                        borderRadius: '10px',
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        Popular
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      paddingRight: suggestion.popular ? '60px' : '20px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={16} color="white" />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '12px',
                          fontWeight: '500',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {suggestion.category}
                        </div>
                        <div style={{
                          color: 'white',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          {suggestion.text}
                        </div>
                      </div>

                      <ArrowRight size={16} color="rgba(255, 255, 255, 0.4)" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-3px) rotate(0.5deg); }
          66% { transform: translateY(2px) rotate(-0.5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default QueryInput
