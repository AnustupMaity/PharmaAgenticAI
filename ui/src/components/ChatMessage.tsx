import { User, Sparkles, Brain, Zap, CheckCircle, Clock, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agents?: string[];
  error?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [isVisible, setIsVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isUser && message.content) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUser, message.content]);

  const getAgentIcon = (agents?: string[]) => {
    if (!agents || agents.length === 0) return Brain;
    if (agents.includes('master')) return Brain;
    if (agents.includes('iqvia')) return Zap;
    return Bot;
  };

  const Icon = isUser ? User : getAgentIcon(message.agents);

  const agentGradients = {
    master: 'from-blue-500 to-purple-600',
    iqvia: 'from-emerald-500 to-teal-600',
    patent: 'from-orange-500 to-red-600',
    trials: 'from-cyan-500 to-blue-600',
    webintel: 'from-pink-500 to-purple-600'
  };

  const getAgentGradient = (agents?: string[]) => {
    if (!agents || agents.length === 0) return 'from-blue-500 to-purple-600';
    const firstAgent = agents[0] as keyof typeof agentGradients;
    return agentGradients[firstAgent] || 'from-blue-500 to-purple-600';
  };

  return (
    <div className={`flex w-full transition-all duration-700 ease-out overflow-hidden ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-4 min-w-0 ${isUser ? "max-w-[85%] md:max-w-[70%]" : "max-w-full md:max-w-[85%]"}`}>
        {!isUser && (
          <div className="flex-shrink-0 relative">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getAgentGradient(message.agents)} shadow-lg relative overflow-hidden group`}>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Pulsing ring for AI activity */}
              {isTyping && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 animate-ping" />
              )}
              
              <Icon className="w-5 h-5 text-white relative z-10" />
              
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                {isTyping ? (
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                ) : (
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                )}
              </div>
            </div>

            {/* Floating particles for AI messages */}
            {!isUser && (
              <>
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-400/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute -bottom-1 left-2 w-1 h-1 bg-purple-400/60 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute top-2 -right-1 w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              </>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-3 flex-1">
          {/* Enhanced Message Header */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm ${
              isUser 
                ? 'bg-primary/10 text-primary' 
                : 'bg-gradient-to-r from-muted/50 to-muted/30 text-foreground'
            }`}>
              <span className="font-bold text-sm">
                {isUser ? "You" : "PharmaAI"}
              </span>
              
              {!isUser && message.agents && message.agents.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <span className="text-xs font-medium capitalize">
                    {message.agents[0]} Agent
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-xs opacity-60">
                <Clock className="w-3 h-3" />
                <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {/* Processing indicator for AI */}
            {!isUser && isTyping && (
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 ml-1">
                  Processing
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Message Bubble */}
          <div className={`relative group ${isUser ? 'ml-8' : 'mr-8'}`}>
            <div
              className={`relative p-5 rounded-2xl backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl ${
                isUser
                  ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md shadow-lg shadow-primary/20"
                  : message.error
                  ? "bg-gradient-to-br from-red-500/10 to-red-500/5 text-card-foreground rounded-tl-md border border-red-500/30 shadow-lg"
                  : "bg-gradient-to-br from-card/80 to-card/60 text-card-foreground rounded-tl-md border border-border/50 shadow-lg hover:border-primary/30"
              }`}
              style={{
                background: isUser 
                  ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
              }}
            >
              {/* Shimmer effect for AI messages */}
              {!isUser && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl" />
                </div>
              )}

              {/* Message content */}
              <div className="relative z-10 leading-relaxed text-sm md:text-base overflow-hidden break-words">
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</div>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>

              {/* Gradient border for AI messages */}
              {!isUser && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ padding: '1px' }} />
              )}
            </div>

            {/* Message tail */}
            <div className={`absolute top-6 w-0 h-0 ${
              isUser 
                ? 'right-0 translate-x-full border-l-8 border-l-primary border-t-8 border-t-transparent border-b-8 border-b-transparent'
                : 'left-0 -translate-x-full border-r-8 border-r-card border-t-8 border-t-transparent border-b-8 border-b-transparent'
            }`} />
          </div>

          {/* Agent badges for multi-agent responses */}
          {!isUser && message.agents && message.agents.length > 1 && (
            <div className="flex flex-wrap gap-2 ml-2">
              {message.agents.map((agent, index) => (
                <div
                  key={agent}
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${agentGradients[agent as keyof typeof agentGradients] || 'from-gray-400 to-gray-500'} text-white shadow-sm`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {agent.charAt(0).toUpperCase() + agent.slice(1)} Agent
                </div>
              ))}
            </div>
          )}
        </div>

        {isUser && (
          <div className="flex-shrink-0 relative">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Icon className="w-5 h-5" />
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 animate-pulse" />
            </div>
          </div>
        )}
      </div>


    </div>
  );
};