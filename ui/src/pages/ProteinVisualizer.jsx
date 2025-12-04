import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Dna, Upload, Link as LinkIcon, Loader, AlertCircle, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THREE_DMOL_SRC = 'https://3dmol.org/build/3Dmol-min.js';

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (window.$3Dmol) return resolve(window.$3Dmol);
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve(window.$3Dmol);
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
};

const ProteinVisualizer = () => {
  const user = localStorage.getItem('user');
  const { isDarkMode } = useTheme();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [pdbText, setPdbText] = useState('');
  const [pdbId, setPdbId] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState(null);
  const [loadedStructure, setLoadedStructure] = useState(null);
  const [viewStyle, setViewStyle] = useState('cartoon');

  useEffect(() => {
    let mounted = true;
    loadScript(THREE_DMOL_SRC).catch((e) => {
      if (mounted) setError('Failed to load 3D viewer library');
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!pdbText) return;
    if (!window.$3Dmol || !containerRef.current) return;

    containerRef.current.innerHTML = '';
    try {
      const viewer = window.$3Dmol.createViewer(containerRef.current, { 
        backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
        antialias: true,
        cartoonQuality: 10
      });
      viewer.addModel(pdbText, 'pdb');
      applyStyle(viewer, viewStyle);
      viewer.zoomTo();
      viewer.render();
      viewerRef.current = viewer;
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Failed to render structure');
    }
  }, [pdbText]);

  const applyStyle = (viewer, style) => {
    viewer.setStyle({}, {});
    switch(style) {
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
        break;
      case 'stick':
        viewer.setStyle({}, { stick: { colorscheme: 'Jmol' } });
        break;
      case 'sphere':
        viewer.setStyle({}, { sphere: { colorscheme: 'Jmol' } });
        break;
      case 'surface':
        viewer.addSurface(window.$3Dmol.SurfaceType.VDW, { opacity: 0.85, colorscheme: 'whiteCarbon' });
        break;
    }
    viewer.render();
  };

  const changeStyle = (style) => {
    setViewStyle(style);
    if (viewerRef.current) {
      applyStyle(viewerRef.current, style);
    }
  };

  const fetchFromPdb = async (id) => {
    if (!id.trim()) return;
    setError(null);
    setLoading(true);
    setLoadedStructure(null);
    try {
      const pdbIdUpper = id.trim().toUpperCase();
      const url = `https://files.rcsb.org/download/${pdbIdUpper}.pdb`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      setPdbText(text);
      setLoadedStructure({ type: 'PDB', id: pdbIdUpper });
    } catch (e) {
      setError('Could not fetch PDB ID. Please verify it exists in the RCSB database.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFromUrl = async (url) => {
    if (!url.trim()) return;
    setError(null);
    setLoading(true);
    setLoadedStructure(null);
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const text = await r.text();
      setPdbText(text);
      setLoadedStructure({ type: 'URL', source: url });
    } catch (e) {
      setError('Failed to fetch structure from URL. Check CORS and URL validity.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    setLoadedStructure(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPdbText(e.target.result);
      setLoadedStructure({ type: 'File', name: file.name });
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
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
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header Section */}
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
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
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
                <Dna style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '2.25rem', 
                  fontWeight: '800',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  Protein 3D Visualizer
                </h1>
                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '1rem',
                  margin: '0.5rem 0 0 0',
                  fontWeight: '500'
                }}>
                  Explore protein structures with interactive 3D visualization powered by AlphaFold & RCSB PDB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
          {/* Control Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Load from PDB ID */}
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
                  Load from PDB
                </h3>
              </div>
              <input 
                value={pdbId}
                onChange={(e) => setPdbId(e.target.value)}
                placeholder="e.g., 1CRN, 2HHB" 
                style={{ 
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: `2px solid var(--color-border)`,
                  background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                  color: 'var(--color-text)',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  marginBottom: '0.75rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? 'var(--color-border)' : 'var(--color-border)'}
                onKeyPress={(e) => e.key === 'Enter' && fetchFromPdb(pdbId)}
              />
              <button 
                onClick={() => fetchFromPdb(pdbId)}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
              >
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Activity size={18} />}
                {loading ? 'Loading...' : 'Load Structure'}
              </button>
            </div>

            {/* Load from URL */}
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <LinkIcon size={20} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  Load from URL
                </h3>
              </div>
              <input 
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..." 
                style={{ 
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '12px',
                  border: `2px solid var(--color-border)`,
                  background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white',
                  color: 'var(--color-text)',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  marginBottom: '0.75rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                onKeyPress={(e) => e.key === 'Enter' && fetchFromUrl(sourceUrl)}
              />
              <button 
                onClick={() => fetchFromUrl(sourceUrl)}
                disabled={loading}
                style={{ 
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
              >
                {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <LinkIcon size={18} />}
                {loading ? 'Fetching...' : 'Fetch Structure'}
              </button>
            </div>

            {/* Upload File */}
            <div style={{
              background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <Upload size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  Upload File
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
                background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'var(--color-muted-background)'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.background = isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.background = isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'var(--color-muted-background)';
              }}>
                <Upload size={28} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                  Click or drag PDB file
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                  .pdb, .ent, .cif, .mmcif
                </div>
                <input 
                  type="file" 
                  accept=".pdb,.ent,.cif,.mmcif" 
                  onChange={(e) => handleFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Visualization Style */}
            {pdbText && (
              <div style={{
                background: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.3)' : '0 4px 24px rgba(0, 0, 0, 0.06)',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  Visualization Style
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {['cartoon', 'stick', 'sphere', 'surface'].map(style => (
                    <button
                      key={style}
                      onClick={() => changeStyle(style)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: viewStyle === style ? '2px solid #667eea' : `2px solid var(--color-border)`,
                        background: viewStyle === style 
                          ? (isDarkMode ? 'rgba(102, 126, 234, 0.2)' : '#f0f4ff') 
                          : (isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'white'),
                        color: viewStyle === style ? '#667eea' : 'var(--color-text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textTransform: 'capitalize'
                      }}
                      onMouseEnter={(e) => {
                        if (viewStyle !== style) {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.color = '#667eea';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (viewStyle !== style) {
                          e.target.style.borderColor = 'var(--color-border)';
                          e.target.style.color = 'var(--color-text-secondary)';
                        }
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Structure Info */}
            {loadedStructure && (
              <div style={{
                background: isDarkMode 
                  ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.1) 100%)'
                  : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: isDarkMode ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid #c7d2fe'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#667eea', marginBottom: '0.5rem' }}>
                  LOADED STRUCTURE
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text)' }}>
                  {loadedStructure.type === 'PDB' ? `PDB: ${loadedStructure.id}` :
                   loadedStructure.type === 'File' ? loadedStructure.name :
                   'Custom URL'}
                </div>
              </div>
            )}
          </div>

          {/* 3D Viewer */}
          <div style={{
            background: isDarkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            minHeight: '700px',
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

            {!pdbText && !loading && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-muted)',
                textAlign: 'center'
              }}>
                <Dna size={64} style={{ marginBottom: '1.5rem', opacity: 0.3, color: 'var(--color-muted)' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  No Structure Loaded
                </h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-muted)' }}>
                  Load a protein structure to begin visualization
                </p>
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
                  Loading structure...
                </p>
              </div>
            )}

            <div 
              ref={containerRef} 
              style={{ 
                width: '100%', 
                height: pdbText && !loading ? '100%' : '0',
                minHeight: pdbText && !loading ? '600px' : '0',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: pdbText ? (isDarkMode ? '0 4px 24px rgba(0, 0, 0, 0.4)' : '0 4px 24px rgba(0, 0, 0, 0.06)') : 'none',
                border: pdbText ? `1px solid var(--color-border)` : 'none'
              }} 
            />
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

export default ProteinVisualizer;
