import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { FlaskConical, Activity, AlertCircle, Loader, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, Zap, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ADMET = () => {
  const user = localStorage.getItem('user');
  const { isDarkMode } = useTheme();
  const [smiles, setSmiles] = useState('');
  const [compoundName, setCompoundName] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickMode, setQuickMode] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const canvasRef = useRef(null);

  const API_BASE = 'http://localhost:8000/api/admet';

  // Example compounds
  const examples = [
    { name: 'Aspirin', smiles: 'CC(=O)Oc1ccccc1C(=O)O' },
    { name: 'Ibuprofen', smiles: 'CC(C)Cc1ccc(cc1)C(C)C(=O)O' },
    { name: 'Caffeine', smiles: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
    { name: 'Paracetamol', smiles: 'CC(=O)Nc1ccc(O)cc1' }
  ];

  // Draw molecule structure using RDKit.js or simple canvas
  useEffect(() => {
    if (smiles && canvasRef.current) {
      drawMolecule(smiles);
    }
  }, [smiles]);

  const drawMolecule = (smilesStr) => {
    // Placeholder for molecule drawing - would integrate RDKit.js or similar
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple placeholder visualization
    ctx.fillStyle = isDarkMode ? '#f1f5f9' : '#1e293b';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Molecule Structure', canvas.width / 2, 30);
    ctx.font = '12px monospace';
    ctx.fillText(smilesStr.substring(0, 30), canvas.width / 2, 60);
    if (smilesStr.length > 30) {
      ctx.fillText(smilesStr.substring(30), canvas.width / 2, 80);
    }
    
    // Draw simple chemical structure placeholder
    ctx.strokeStyle = isDarkMode ? '#94a3b8' : '#64748b';
    ctx.lineWidth = 2;
    
    // Hexagon (benzene ring placeholder)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20;
    const radius = 40;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  const predict = async () => {
    if (!smiles.trim()) {
      setError('Please enter a SMILES string');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const endpoint = quickMode ? '/quick-predict' : '/predict';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smiles: smiles.trim(),
          compound_name: compoundName.trim() || 'Unknown Compound'
        })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      setError(`Prediction error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example) => {
    setSmiles(example.smiles);
    setCompoundName(example.name);
    setResults(null);
    setError(null);
  };

  const getStatusIcon = (value) => {
    if (typeof value === 'boolean') {
      return value ? <CheckCircle size={18} style={{ color: '#10b981' }} /> : <XCircle size={18} style={{ color: '#ef4444' }} />;
    }
    if (value === 'High' || value === 'Likely') {
      return <TrendingUp size={18} style={{ color: '#10b981' }} />;
    }
    if (value === 'Low' || value === 'Unlikely') {
      return <TrendingDown size={18} style={{ color: '#ef4444' }} />;
    }
    return <Minus size={18} style={{ color: '#f59e0b' }} />;
  };

  const getStatusColor = (value) => {
    if (typeof value === 'boolean') {
      return value ? '#10b981' : '#ef4444';
    }
    if (value === 'High' || value === 'Likely') return '#10b981';
    if (value === 'Low' || value === 'Unlikely') return '#ef4444';
    return '#f59e0b';
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
      overflow: 'auto'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
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
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
        }}>
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
              <FlaskConical style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '2.25rem',
                fontWeight: '800',
                color: 'var(--color-text)',
                margin: 0,
                lineHeight: '1.2'
              }}>
                ADMET Predictor
              </h1>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '1rem',
                margin: '0.5rem 0 0 0',
                fontWeight: '500'
              }}>
                Absorption • Distribution • Metabolism • Excretion • Toxicity Analysis
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '2rem' }}>
          {/* Input Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Input Section */}
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Activity size={20} style={{ color: '#667eea' }} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  Compound Input
                </h3>
              </div>

              <input
                value={compoundName}
                onChange={(e) => setCompoundName(e.target.value)}
                placeholder="Compound name (optional)"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: `2px solid var(--color-border)`,
                  background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                  color: 'var(--color-text)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  marginBottom: '0.75rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />

              <textarea
                value={smiles}
                onChange={(e) => setSmiles(e.target.value)}
                placeholder="Enter SMILES string (e.g., CC(=O)Oc1ccccc1C(=O)O)"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: `2px solid var(--color-border)`,
                  background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                  color: 'var(--color-text)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '1rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="quickMode"
                  checked={quickMode}
                  onChange={(e) => setQuickMode(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="quickMode" style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  Quick Mode (faster, no AI analysis)
                </label>
              </div>

              <button
                onClick={predict}
                disabled={loading || !smiles.trim()}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  background: (loading || !smiles.trim()) ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: (loading || !smiles.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: (loading || !smiles.trim()) ? 'none' : '0 4px 16px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading && smiles.trim()) e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (!loading && smiles.trim()) e.target.style.transform = 'translateY(0)';
                }}
              >
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={18} />}
                {loading ? 'Predicting...' : 'Predict ADMET'}
              </button>
            </div>

            {/* Examples */}
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                Example Compounds
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => loadExample(example)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: `2px solid var(--color-border)`,
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                      color: 'var(--color-text)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = isDarkMode ? 'rgba(102, 126, 234, 0.1)' : '#f0f4ff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.background = isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white';
                    }}
                  >
                    {example.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Molecule Visualization */}
            {smiles && (
              <div style={{
                background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  Structure Preview
                </h3>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={250}
                  style={{
                    width: '100%',
                    border: `1px solid var(--color-border)`,
                    borderRadius: '12px',
                    background: isDarkMode ? '#0f172a' : '#f8fafc'
                  }}
                />
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
            minHeight: '600px',
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

            {!results && !loading && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-muted)',
                textAlign: 'center'
              }}>
                <FlaskConical size={64} style={{ marginBottom: '1.5rem', opacity: 0.3, color: 'var(--color-muted)' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  Ready for Prediction
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                  Enter a SMILES string or select an example compound to begin
                </p>
                <div style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                  <strong>ADMET Analysis includes:</strong>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    <li>Molecular properties (MW, LogP, TPSA)</li>
                    <li>Lipinski Rule of Five compliance</li>
                    <li>Absorption & bioavailability</li>
                    <li>BBB penetration prediction</li>
                    <li>Metabolism (CYP450) analysis</li>
                    <li>Toxicity risk assessment</li>
                    <li>Drug-likeness scoring</li>
                  </ul>
                </div>
              </div>
            )}

            {loading && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Loader size={48} style={{ color: '#667eea', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  {quickMode ? 'Calculating properties...' : 'Running AI analysis...'}
                </p>
              </div>
            )}

            {results && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 300px)', width: '100%' }}>
                {/* Compound Info */}
                <div style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.1) 100%)'
                    : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: isDarkMode ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid #c7d2fe',
                  width: '100%'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#667eea', marginBottom: '0.5rem' }}>
                    COMPOUND
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                    {results.compound_name || 'Unknown Compound'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                    {results.smiles}
                  </div>
                </div>

                {/* Molecular Properties */}
                {results.properties && !results.properties.error && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '1rem' }}>
                      Molecular Properties
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%' }}>
                      {Object.entries(results.properties).map(([key, value]) => (
                        <div key={key} style={{
                          background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: `1px solid var(--color-border)`
                        }}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)' }}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lipinski Rule of Five */}
                {results.lipinski && !results.lipinski.error && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      Lipinski Rule of Five
                      {results.lipinski.passes_lipinski ? (
                        <CheckCircle size={24} style={{ color: '#10b981' }} />
                      ) : (
                        <XCircle size={24} style={{ color: '#ef4444' }} />
                      )}
                    </h3>
                    <div style={{
                      background: results.lipinski.passes_lipinski
                        ? (isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4')
                        : (isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'),
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: results.lipinski.passes_lipinski
                        ? (isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #86efac')
                        : (isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca'),
                      width: '100%'
                    }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                        {results.lipinski.passes_lipinski ? 'Drug-Like (≤1 violation)' : `${results.lipinski.violation_count} Violations`}
                      </div>
                      {results.lipinski.violations.length > 0 && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          Violations: {results.lipinski.violations.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ADMET Predictions */}
                {results.admet && !results.admet.error && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '1rem' }}>
                      ADMET Predictions
                    </h3>
                    
                    {/* Absorption */}
                    {results.admet.absorption && (
                      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                          Absorption
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%' }}>
                          {Object.entries(results.admet.absorption).map(([key, value]) => (
                            <div key={key} style={{
                              background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                              borderRadius: '12px',
                              padding: '1rem',
                              border: `2px solid ${getStatusColor(value)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getStatusIcon(value)}
                                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                  {String(value)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Distribution */}
                    {results.admet.distribution && (
                      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                          Distribution
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%' }}>
                          {Object.entries(results.admet.distribution).map(([key, value]) => (
                            <div key={key} style={{
                              background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                              borderRadius: '12px',
                              padding: '1rem',
                              border: `2px solid ${getStatusColor(value)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getStatusIcon(value)}
                                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                  {String(value)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Toxicity */}
                    {results.admet.toxicity && (
                      <div style={{ marginBottom: '1.5rem', width: '100%' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                          Toxicity
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%' }}>
                          {Object.entries(results.admet.toxicity).map(([key, value]) => (
                            <div key={key} style={{
                              background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                              borderRadius: '12px',
                              padding: '1rem',
                              border: `2px solid ${getStatusColor(value)}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {getStatusIcon(value)}
                                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)' }}>
                                  {String(value)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary Metrics */}
                    <div style={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.1) 100%)'
                        : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: isDarkMode ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid #c7d2fe',
                      width: '100%'
                    }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#667eea', marginBottom: '1rem' }}>
                        Overall Assessment
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                            Bioavailability
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getStatusColor(results.admet.bioavailability) }}>
                            {results.admet.bioavailability}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                            Solubility
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: getStatusColor(results.admet.solubility) }}>
                            {results.admet.solubility}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                            Drug-Likeness
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text)' }}>
                            {(results.admet.drug_likeness_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Report (full mode only) */}
                {results.report && (
                  <div style={{ width: '100%' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} />
                      AI Analysis Report
                    </h3>
                    <div style={{
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: `1px solid var(--color-border)`,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem',
                      lineHeight: '1.8',
                      color: 'var(--color-text)',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      width: '100%'
                    }}>
                      {results.report}
                    </div>
                  </div>
                )}
              </div>
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

export default ADMET;
