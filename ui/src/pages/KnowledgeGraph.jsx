import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Network, Database, Upload, FileText, MessageSquare, Loader, AlertCircle, Trash2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ForceGraph2D from 'react-force-graph-2d';

const KnowledgeGraph = () => {
  const user = localStorage.getItem('user');
  const { isDarkMode } = useTheme();
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);
  const fgRef = useRef();

  const API_BASE = 'http://localhost:8000/api/kg';

  const uploadDocument = async (file, text) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      
      if (file) {
        formData.append('file', file);
        setUploadedFileName(file.name);
      } else if (text) {
        formData.append('text', text);
        setUploadedFileName('Text Input');
      }

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const formattedData = {
          nodes: data.graph.nodes.map(node => ({
            id: node.id,
            name: node.label,
            type: node.type,
            val: 10
          })),
          links: data.graph.links.map(link => ({
            source: link.source,
            target: link.target,
            label: link.type
          }))
        };
        setGraphData(formattedData);
        setTextInput('');
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadDocument(file, null);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim().length < 50) {
      setError('Text must be at least 50 characters');
      return;
    }
    uploadDocument(null, textInput);
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    if (graphData.nodes.length === 0) {
      setError('Please upload a document first to build the knowledge graph');
      return;
    }

    setAskingQuestion(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, session_id: sessionId })
      });

      const data = await response.json();

      if (data.success) {
        setAnswer(data.answer);
      } else {
        setError(data.error || 'Query failed');
      }
    } catch (err) {
      setError(`Query error: ${err.message}`);
    } finally {
      setAskingQuestion(false);
    }
  };

  const clearGraph = async () => {
    try {
      await fetch(`${API_BASE}/clear/${sessionId}`, { method: 'DELETE' });
      setGraphData({ nodes: [], links: [] });
      setAnswer('');
      setQuestion('');
      setUploadedFileName('');
      setError(null);
    } catch (err) {
      setError(`Clear error: ${err.message}`);
    }
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.3, 400);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() / 1.3, 400);
    }
  };

  const handleZoomReset = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
    }
  };

  const handleNodeHover = (node) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
    
    if (node) {
      const newHighlightNodes = new Set([node.id]);
      const newHighlightLinks = new Set();
      
      graphData.links.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(link.source.id);
          newHighlightNodes.add(link.target.id);
        }
      });
      
      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);
    }
    
    setHoverNode(node);
  };

  const getNodeColor = (type) => {
    const colors = {
      Person: '#667eea',
      Organization: '#10b981',
      Concept: '#f59e0b',
      Place: '#ef4444',
      Product: '#8b5cf6',
      Other: '#64748b'
    };
    return colors[type] || colors.Other;
  };

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
      backgroundColor: 'var(--color-background)',
      padding: '3rem 2rem',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2.5rem',
          marginBottom: '2rem',
          boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
              }}>
                <Network style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '2.25rem',
                  fontWeight: '800',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  Knowledge Graph Visualizer
                </h1>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '1rem',
                  margin: '0.5rem 0 0 0',
                  fontWeight: '500'
                }}>
                  Build intelligent knowledge graphs from documents • Powered by Neo4j & Gemini AI
                </p>
              </div>
            </div>
            {graphData.nodes.length > 0 && (
              <button
                onClick={clearGraph}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <Trash2 size={18} />
                Clear Graph
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
          {/* Left Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Upload Section */}
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Upload size={20} style={{ color: '#667eea' }} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  Upload Document
                </h3>
              </div>

              <label style={{
                display: 'block',
                width: '100%',
                padding: '2rem 1rem',
                borderRadius: '12px',
                border: `2px dashed var(--color-border)`,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'var(--color-muted-background)',
                marginBottom: '1rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = isDarkMode ? 'rgba(102, 126, 234, 0.1)' : '#f0f4ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.background = isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'var(--color-muted-background)';
              }}>
                <FileText size={28} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                  Click or drag PDF/TXT file
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                  .pdf, .txt (min 50 chars)
                </div>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>

              <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--color-muted)', fontSize: '0.875rem', fontWeight: '600' }}>
                OR
              </div>

              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste text here (minimum 50 characters)..."
                disabled={uploading}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: `2px solid var(--color-border)`,
                  background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '0.75rem',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />

              <button
                onClick={handleTextSubmit}
                disabled={uploading || textInput.length < 50}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  background: (uploading || textInput.length < 50) ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: (uploading || textInput.length < 50) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: (uploading || textInput.length < 50) ? 'none' : '0 4px 16px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!uploading && textInput.length >= 50) e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (!uploading && textInput.length >= 50) e.target.style.transform = 'translateY(0)';
                }}
              >
                {uploading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Database size={18} />}
                {uploading ? 'Building Graph...' : 'Build Knowledge Graph'}
              </button>
            </div>

            {/* Q&A Section */}
            {graphData.nodes.length > 0 && (
              <div style={{
                background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <MessageSquare size={20} style={{ color: '#10b981' }} />
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                    Ask Questions
                  </h3>
                </div>

                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about the knowledge graph..."
                  disabled={askingQuestion}
                  onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    border: `2px solid var(--color-border)`,
                    background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    marginBottom: '0.75rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />

                <button
                  onClick={askQuestion}
                  disabled={askingQuestion || !question.trim()}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '12px',
                    background: (askingQuestion || !question.trim()) ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: (askingQuestion || !question.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: answer ? '1rem' : 0
                  }}
                >
                  {askingQuestion ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={18} />}
                  {askingQuestion ? 'Thinking...' : 'Ask AI'}
                </button>

                {answer && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: isDarkMode
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
                      : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #86efac',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      AI ANSWER
                    </div>
                    {answer}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            {graphData.nodes.length > 0 && (
              <div style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.1) 100%)'
                  : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: isDarkMode ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid #c7d2fe'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#667eea', marginBottom: '0.75rem' }}>
                  GRAPH STATISTICS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text)' }}>
                      {graphData.nodes.length}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Entities</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-text)' }}>
                      {graphData.links.length}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Relationships</div>
                  </div>
                </div>
                {uploadedFileName && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${isDarkMode ? 'rgba(102, 126, 234, 0.3)' : '#c7d2fe'}` }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>Source</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)', wordBreak: 'break-all' }}>
                      {uploadedFileName}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Graph Visualization */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            minHeight: '800px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {error && (
              <div style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)'
                  : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span style={{ color: isDarkMode ? '#fca5a5' : '#991b1b', fontSize: '0.9rem', fontWeight: '500' }}>
                  {error}
                </span>
              </div>
            )}

            {graphData.nodes.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-muted)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <Network size={64} style={{ marginBottom: '1.5rem', opacity: 0.3, color: 'var(--color-muted)' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  No Knowledge Graph Yet
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-muted)', marginBottom: '2rem' }}>
                  Upload a document or paste text to build your knowledge graph
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  maxWidth: '600px',
                  textAlign: 'left'
                }}>
                  {[
                    { icon: '🔍', title: 'Hover Nodes', desc: 'Hover over nodes to see connections' },
                    { icon: '🖱️', title: 'Drag Nodes', desc: 'Click and drag nodes to reposition' },
                    { icon: '🔎', title: 'Zoom & Pan', desc: 'Scroll to zoom, drag background to pan' },
                    { icon: '🎯', title: 'Auto-Fit', desc: 'Use FIT button to center the graph' }
                  ].map((tip, i) => (
                    <div key={i} style={{
                      padding: '1rem',
                      background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '12px',
                      border: `1px solid var(--color-border)`
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tip.icon}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                        {tip.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        {tip.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Zoom Controls */}
                <div style={{
                  position: 'absolute',
                  top: '2rem',
                  right: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  zIndex: 10
                }}>
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'white',
                      border: `2px solid var(--color-border)`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    <ZoomIn size={20} style={{ color: 'var(--color-text)' }} />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    title="Reset Zoom"
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'white',
                      border: `2px solid var(--color-border)`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: 'var(--color-text)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    FIT
                  </button>
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    style={{
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'white',
                      border: `2px solid var(--color-border)`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    <ZoomOut size={20} style={{ color: 'var(--color-text)' }} />
                  </button>
                </div>

                {/* Hover Info Panel */}
                {hoverNode && (
                  <div style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '2rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                    border: `2px solid ${getNodeColor(hoverNode.type)}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    zIndex: 10,
                    maxWidth: '300px'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: getNodeColor(hoverNode.type),
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {hoverNode.type}
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: 'var(--color-text)',
                      marginBottom: '0.5rem'
                    }}>
                      {hoverNode.name}
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)'
                    }}>
                      Connections: {graphData.links.filter(l => 
                        l.source.id === hoverNode.id || l.target.id === hoverNode.id
                      ).length}
                    </div>
                  </div>
                )}

                <div style={{
                  flex: 1,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `1px solid var(--color-border)`,
                  background: isDarkMode ? '#0f172a' : '#f8fafc',
                  cursor: 'grab'
                }}>
                  <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    
                    // Node styling
                    nodeRelSize={8}
                    nodeVal={node => highlightNodes.has(node.id) ? 15 : 10}
                    nodeColor={node => {
                      if (highlightNodes.size === 0) return getNodeColor(node.type);
                      return highlightNodes.has(node.id) ? getNodeColor(node.type) : isDarkMode ? '#334155' : '#cbd5e1';
                    }}
                    nodeLabel={node => `${node.name} (${node.type})`}
                    
                    // Link styling
                    linkLabel={link => link.label}
                    linkColor={link => {
                      if (highlightLinks.size === 0) return isDarkMode ? '#475569' : '#94a3b8';
                      return highlightLinks.has(link) ? '#667eea' : isDarkMode ? '#1e293b' : '#e2e8f0';
                    }}
                    linkWidth={link => highlightLinks.has(link) ? 3 : 2}
                    linkDirectionalArrowLength={8}
                    linkDirectionalArrowRelPos={0.8}
                    linkDirectionalParticles={link => highlightLinks.has(link) ? 4 : 0}
                    linkDirectionalParticleWidth={3}
                    linkDirectionalParticleSpeed={0.005}
                    
                    // Background
                    backgroundColor={isDarkMode ? '#0f172a' : '#f8fafc'}
                    
                    // Interaction
                    enableNodeDrag={true}
                    enableZoomInteraction={true}
                    enablePanInteraction={true}
                    onNodeHover={handleNodeHover}
                    onNodeDragEnd={node => {
                      node.fx = node.x;
                      node.fy = node.y;
                    }}
                    
                    // Physics
                    cooldownTicks={100}
                    d3AlphaDecay={0.02}
                    d3VelocityDecay={0.3}
                    warmupTicks={50}
                    
                    // Canvas rendering
                    nodeCanvasObject={(node, ctx, globalScale) => {
                      const label = node.name;
                      const fontSize = Math.max(12 / globalScale, 3);
                      const nodeSize = highlightNodes.has(node.id) ? 8 : 6;
                      const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
                      const opacity = isHighlighted ? 1 : 0.3;
                      
                      // Draw node shadow
                      if (isHighlighted) {
                        ctx.fillStyle = `rgba(0, 0, 0, ${isDarkMode ? 0.5 : 0.2})`;
                        ctx.beginPath();
                        ctx.arc(node.x + 1, node.y + 1, nodeSize + 2, 0, 2 * Math.PI);
                        ctx.fill();
                      }
                      
                      // Draw node outline
                      ctx.strokeStyle = isDarkMode ? '#1e293b' : 'white';
                      ctx.lineWidth = isHighlighted ? 3 : 2;
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
                      ctx.stroke();
                      
                      // Draw node
                      const color = isHighlighted ? getNodeColor(node.type) : (isDarkMode ? '#334155' : '#cbd5e1');
                      ctx.fillStyle = color;
                      ctx.globalAlpha = opacity;
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
                      ctx.fill();
                      ctx.globalAlpha = 1;
                      
                      // Draw label background for better readability
                      if (globalScale > 1) {
                        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
                        const textWidth = ctx.measureText(label).width;
                        const padding = 4;
                        
                        ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)';
                        ctx.fillRect(
                          node.x - textWidth / 2 - padding,
                          node.y + nodeSize + 4,
                          textWidth + padding * 2,
                          fontSize + padding
                        );
                      }
                      
                      // Draw label
                      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'top';
                      ctx.fillStyle = isHighlighted 
                        ? (isDarkMode ? '#f1f5f9' : '#1e293b')
                        : (isDarkMode ? '#475569' : '#94a3b8');
                      ctx.globalAlpha = opacity;
                      ctx.fillText(label, node.x, node.y + nodeSize + 6);
                      ctx.globalAlpha = 1;
                    }}
                    
                    // Link canvas rendering for labels
                    linkCanvasObjectMode={() => 'after'}
                    linkCanvasObject={(link, ctx, globalScale) => {
                      if (globalScale < 1.5) return;
                      
                      const label = link.label;
                      const fontSize = 10 / globalScale;
                      const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(link);
                      
                      if (!label || !isHighlighted) return;
                      
                      const start = link.source;
                      const end = link.target;
                      
                      // Calculate midpoint
                      const textPos = {
                        x: start.x + (end.x - start.x) / 2,
                        y: start.y + (end.y - start.y) / 2
                      };
                      
                      // Draw label background
                      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
                      const textWidth = ctx.measureText(label).width;
                      const padding = 3;
                      
                      ctx.fillStyle = isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                      ctx.fillRect(
                        textPos.x - textWidth / 2 - padding,
                        textPos.y - fontSize / 2 - padding,
                        textWidth + padding * 2,
                        fontSize + padding * 2
                      );
                      
                      // Draw label
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = highlightLinks.has(link) ? '#667eea' : (isDarkMode ? '#94a3b8' : '#64748b');
                      ctx.fillText(label, textPos.x, textPos.y);
                    }}
                  />
                </div>

                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {['Person', 'Organization', 'Concept', 'Place', 'Product', 'Other'].map(type => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getNodeColor(type)
                      }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{type}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KnowledgeGraph;
