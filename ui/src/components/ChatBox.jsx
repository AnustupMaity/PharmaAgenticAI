import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import AgentResponseCard from './AgentResponseCard.jsx'
import { useAgentChat } from '../hooks/useAgentChat.js'

const ChatBox = ({ onNewMessage }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)
  const { sendMessage, isLoading } = useAgentChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    try {
      const response = await sendMessage(inputValue)
      
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, agentMessage])
      onNewMessage?.(agentMessage)
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: { error: error.message },
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <div className="chat-box">
      {/* Messages Container */}
      <div className="messages-container w-7xl">
        {messages.length === 0 && (
          <div className="empty-state">
            {/*<div className="empty-state-icon">💬</div>*/}
            <h4 className={"p-2"}>Start a conversation</h4>
            <p className={"p-2"}>Ask me anything about pharmaceutical intelligence, market analysis, or competitive insights.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message message--${message.type}`}>
            {message.type === 'user' ? (
              <div className="message-bubble message-bubble--user">
                <p>{message.content}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ) : message.type === 'error' ? (
              <div className="message-bubble message-bubble--error">
                <p>Error: {message.content.error}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <AgentResponseCard 
                response={message.content}
                timestamp={message.timestamp}
              />
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="message message--agent">
            <div className="message-bubble message-bubble--loading">
              <Loader2 className="spinner" />
              <p>AI agents are analyzing your query...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about market trends, competitive landscape, patents..."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatBox
