import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatHeader } from "../components/ChatHeader";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { EmptyState } from "../components/EmptyState";
import orchestratorApi from "../api/orchestratorApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agents?: string[];
  error?: boolean;
}

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [user, setUser] = useState<{ name?: string; email?: string; picture?: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null); // For clarification sessions
  const [awaitingClarification, setAwaitingClarification] = useState(false); // Flag to track clarification state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load user info from localStorage (set by AuthCallback)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        // parsed may be nested metadata or a simple object
        const userObj = parsed?.user_metadata ? parsed.user_metadata : parsed;
        setUser({
          name: userObj?.name || userObj?.full_name || userObj?.given_name || userObj?.email?.split('@')[0],
          email: userObj?.email,
          picture: userObj?.picture || userObj?.avatar_url || undefined,
        });
      }
    } catch (e) {
      // ignore parse errors
      console.warn('Could not load user from localStorage', e);
    }
  }, []);

  const handleSignOut = () => {
    // clear local session and navigate to auth
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Error clearing localStorage', e);
    }
    navigate('/auth');
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsLoading(true);

      try {
        // Call the orchestrator API with session info if continuing clarification
        const response = await orchestratorApi.query(
          content,
          awaitingClarification && sessionId ? sessionId : undefined,
          awaitingClarification ? content : undefined
        );

        // Check if validation failed
        if (!response.success) {
          const rejectionMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `${response.message}\n\n**Reason:** ${response.validation?.reason || 'Topic not pharmaceutical-related'}\n\n${response.suggestion || ''}`,
            timestamp: new Date(),
            error: true,
          };
          setMessages((prev) => [...prev, rejectionMessage]);
          setAwaitingClarification(false);
          setSessionId(null);
          return;
        }

        // Check the stage of the response
        if (response.stage === "clarification") {
          // Need clarification from user
          const clarificationMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `**Clarification Needed** (Round ${response.clarification.round}/${response.clarification.max_rounds})\n\n${response.clarification.question}\n\n**Why:** ${response.clarification.reason}`,
            timestamp: new Date(),
            agents: ["Clarification Specialist"],
          };
          setMessages((prev) => [...prev, clarificationMessage]);
          setSessionId(response.session_id);
          setAwaitingClarification(true);
          return;
        }

        // Validation passed and research completed (stage === "complete")
        setAwaitingClarification(false);
        setSessionId(null);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.research.report,
          timestamp: new Date(),
          agents: ["Domain Validator", "Web Intelligence Researcher", "Intelligence Analyst", "Report Writer"],
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error calling orchestrator API:", error);
        
        const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I apologize, but I encountered an error while processing your request:\n\n${errorMsg}\n\nPlease make sure the backend server is running and try again.`,
          timestamp: new Date(),
          error: true,
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, awaitingClarification, sessionId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto pt-8 pb-4">
        {/* User profile card */}
        <div className="max-w-8xl mx-auto px-4 md:px-6 mb-6">
          <div style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(20px)',
            transition: 'all var(--transition-base)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}>
            {/* Animated gradient background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(96, 165, 250, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />

            {/* Avatar with gradient ring */}
            <div style={{ 
              flexShrink: 0, 
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                padding: '4px',
                background: 'var(--gradient-primary)',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                position: 'relative'
              }}>
                <img
                  src={user?.picture || '/favicon.ico'}
                  alt={user?.name || 'User'}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--color-card)'
                  }}
                />
                {/* Online status indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '18px',
                  height: '18px',
                  background: 'var(--color-success)',
                  borderRadius: '50%',
                  border: '3px solid var(--color-card)',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                }} />
              </div>
            </div>

            {/* User info */}
            <div style={{ 
              flex: 1, 
              minWidth: 0,
              zIndex: 1
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginBottom: '0.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--color-text)',
                  margin: 0,
                  letterSpacing: '-0.025em'
                }}>
                  {user?.name ?? 'Welcome'}
                </h2>
                <svg style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                margin: '0 0 1rem 0'
              }}>
                {user?.email ?? 'Signed in with Supabase'}
              </p>

              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem' 
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'var(--gradient-primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                }}>
                  ✨ Premium Member
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'var(--color-primary-alpha)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-border)'
                }}>
                  🔬 Researcher
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              zIndex: 1
            }}>
              <button 
                onClick={() => navigate('/reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reports
              </button>
              <button 
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  background: 'var(--color-muted-background)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-error)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--color-error)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-muted-background)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>

        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSendMessage} />
        ) : (
          <div className="max-w-8xl mx-auto space-y-6 px-4 md:px-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start px-3">
                <div className="flex gap-3 max-w-full md:max-w-[80%]">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 p-4 rounded-xl bg-card border border-border rounded-tl-none shadow-[var(--shadow-soft)]">
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Conducting web intelligence research...
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      This may take 30-60 seconds
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;