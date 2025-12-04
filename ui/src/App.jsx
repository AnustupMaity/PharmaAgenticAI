import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Brain, FileText, Home, Network, FlaskConical, Database } from "lucide-react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import HomePage from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import MarkdownTest from "./pages/MarkdownTest";
import AuthPage from "./AuthPage.js";
import AuthCallback from "./AuthCallback";
import ProtectedRoute from "./components/ProtectedRoutes.js";
import ProteinVisualizer from "./pages/ProteinVisualizer";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import ADMET from "./pages/ADMET";
import DBCon from "./pages/DBCon";

const queryClient = new QueryClient();

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const { isDarkMode } = useTheme();

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : 'light-theme'}`} style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--color-background)', 
      display: 'flex', 
      flexDirection: 'column',
      color: 'var(--color-text)'
    }}>
      {/* Header - Hidden on dashboard */}
      {!isDashboard && (
        <header style={{ 
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid var(--color-border)`,
          padding: '1.5rem 0', 
          position: 'sticky', 
          top: 0, 
          zIndex: 50,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Premium Logo */}
              <Link to="/" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                padding: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Animated background effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                    animation: 'shimmer 3s ease-in-out infinite'
                  }} />
                  <Brain style={{ width: '24px', height: '24px', color: 'white', zIndex: 1 }} />
                </div>
                <div>
                  <span style={{ 
                    fontWeight: '800', 
                    fontSize: '1.75rem', 
                    color: isDarkMode ? '#ffffff' : '#1e293b',
                    lineHeight: '1.2',
                    textShadow: isDarkMode ? '0 0 12px rgba(255,255,255,0.2)' : 'none'
                  }}>
                    Pharma<span style={{ fontWeight: '400' }}>AI</span>
                  </span>
                  <div style={{
                    fontSize: '0.75rem',
                    color: isDarkMode ? '#cbd5e1' : '#64748b',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                    marginTop: '2px'
                  }}>
                    Intelligence Platform
                  </div>
                </div>
              </Link>
              
              {/* Enhanced Navigation */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {[
                  { to: '/', icon: Home, label: 'Home' },
                  { to: '/dashboard', icon: Activity, label: 'Dashboard' },
                  { to: '/reports', icon: FileText, label: 'Reports' },
                  { to: '/protein', icon: Brain, label: 'Proteins' },
                  { to: '/knowledge-graph', icon: Network, label: 'Knowledge Graph' },
                  { to: '/admet', icon: FlaskConical, label: 'ADMET' },
                  { to: '/dbcon', icon: Database, label: 'DBCon' }
                ].map((item, index) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        padding: '0.75rem 1.25rem', 
                        borderRadius: '14px', 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: isActive ? 'white' : 'var(--color-text-secondary)',
                        textDecoration: 'none', 
                        transition: 'all 0.3s ease',
                        background: isActive 
                          ? 'var(--gradient-primary)'
                          : 'transparent',
                        boxShadow: isActive 
                          ? 'var(--shadow-lg)'
                          : 'none',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.background = 'var(--color-primary-alpha)'
                          e.target.style.color = 'var(--color-primary)'
                          e.target.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.background = 'transparent'
                          e.target.style.color = 'var(--color-text-secondary)'
                          e.target.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                          animation: 'shimmer 2s ease-in-out infinite'
                        }} />
                      )}
                      <item.icon size={20} style={{ zIndex: 1 }} />
                      <span style={{ zIndex: 1 }}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer - Hidden on dashboard */}
      {!isDashboard && (
        <footer style={{ 
          background: isDarkMode
            ? 'linear-gradient(135deg, var(--color-card) 0%, var(--color-background) 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderTop: `1px solid var(--color-border)`,
          padding: '3rem 0 2rem 0',
          position: 'relative',
          overflow: 'hidden',
          color: isDarkMode ? 'var(--color-text)' : 'white'
        }}>
          {/* Animated background elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)
            `,
            animation: 'float 15s ease-in-out infinite'
          }} />

          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
            {/* Main Footer Content */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '3rem',
              marginBottom: '2.5rem'
            }}>
              {/* Brand Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Brain style={{ width: '20px', height: '20px', color: 'white' }} />
                  </div>
                  <span style={{ 
                    fontWeight: '800', 
                    fontSize: '1.5rem', 
                    color: isDarkMode ? '#ffffff' : 'white',
                    textShadow: isDarkMode ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                  }}>
                    Pharma<span style={{ fontWeight: '400' }}>AI</span>
                  </span>
                </div>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  margin: '0 0 1.5rem 0',
                  maxWidth: '280px'
                }}>
                  Advanced pharmaceutical intelligence platform powered by cutting-edge AI technology.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1rem'
                }}>
                  {['Excellence', 'Innovation', 'Intelligence'].map((badge, index) => (
                    <span key={index} style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Platform Section */}
              <div>
                <h4 style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 1.5rem 0'
                }}>
                  Platform
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { label: 'Intelligence Dashboard', to: '/dashboard' },
                    { label: 'Report Generator', to: '/reports' },
                    { label: 'Market Analysis', to: '/reports' },
                    { label: 'Patent Intelligence', to: '/reports' }
                  ].map((link, index) => (
                    <Link
                      key={index}
                      to={link.to}
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#667eea'
                        e.target.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.7)'
                        e.target.style.transform = 'translateX(0)'
                      }}
                    >
                      <span style={{ width: '4px', height: '4px', background: '#667eea', borderRadius: '50%' }} />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Capabilities Section */}
              <div>
                <h4 style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 1.5rem 0'
                }}>
                  AI Capabilities
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    'Market Intelligence',
                    'Competitive Analysis',
                    'Patent Landscape',
                    'Clinical Insights',
                    'Regulatory Intelligence',
                    'Real-time Monitoring'
                  ].map((capability, index) => (
                    <div
                      key={index}
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        borderRadius: '50%' 
                      }} />
                      {capability}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h4 style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 1.5rem 0'
                }}>
                  Enterprise Solutions
                </h4>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '15px',
                    margin: '0 0 1rem 0',
                    lineHeight: '1.5'
                  }}>
                    Transform your pharmaceutical intelligence with our enterprise-grade AI platform.
                  </p>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)'
                  }}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
              paddingTop: '2rem',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                flexWrap: 'wrap'
              }}>
                <p style={{ 
                  fontSize: '15px', 
                  color: 'rgba(255, 255, 255, 0.6)',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  &copy; 2025 PharmaAI. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  {['Privacy Policy', 'Terms of Service', 'Support'].map((link, index) => (
                    <a
                      key={index}
                      href="#"
                      style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        textDecoration: 'none',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#667eea'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                  path="/dashboard"
                  element={
                      <ProtectedRoute>
                          <Dashboard />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/protein"
                  element={
                      <ProtectedRoute>
                          <ProteinVisualizer />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/knowledge-graph"
                  element={
                      <ProtectedRoute>
                          <KnowledgeGraph />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/admet"
                  element={
                      <ProtectedRoute>
                          <ADMET />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/dbcon"
                  element={
                      <ProtectedRoute>
                          <DBCon />
                      </ProtectedRoute>
                  }
              />
            <Route path="/reports" element={<Reports />} />
            <Route path="/markdown-test" element={<MarkdownTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ThemeToggle />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
    
    {/* Global CSS Animations */}
    <style jsx global>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-5px) rotate(0.5deg); }
        66% { transform: translateY(2px) rotate(-0.5deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      }
    `}</style>
  </QueryClientProvider>
);

export default App;