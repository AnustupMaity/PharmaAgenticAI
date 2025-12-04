import React, { useState, useEffect } from 'react';
import { connectDatabase, selectTables, queryDatabase, disconnectDatabase, previewTable } from '../api/dbconApi';
import { useTheme } from '../context/ThemeContext';
import { ChatMessage } from '../components/ChatMessage';
import Loader from '../components/Loader';

const DBCon = () => {
  const { isDarkMode } = useTheme();
  const [sessionId] = useState(() => `session_${Date.now()}`);
  
  // Connection state
  const [connectionString, setConnectionString] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  
  // Tables state
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [previewingTable, setPreviewingTable] = useState(null);
  const [tablePreview, setTablePreview] = useState(null);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  
  // Sample connection strings
  const sampleConnections = [
    { 
      name: 'Supabase (PostgreSQL)', 
      template: 'postgresql://user:password@host:port/database' 
    },
    { 
      name: 'MySQL', 
      template: 'mysql://user:password@host:port/database' 
    },
    { 
      name: 'SQLite', 
      template: 'sqlite:///path/to/database.db' 
    }
  ];

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isConnected) {
        disconnectDatabase(sessionId).catch(console.error);
      }
    };
  }, [isConnected, sessionId]);

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      setConnectionError('Please enter a connection string');
      return;
    }

    setIsConnecting(true);
    setConnectionError('');

    try {
      const response = await connectDatabase(connectionString, sessionId);
      
      if (response.success) {
        setIsConnected(true);
        setAvailableTables(response.tables || []);
        setMessages([{
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: response.message || 'Successfully connected to the database!',
          timestamp: new Date()
        }]);
      } else {
        setConnectionError(response.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionError(error.message || 'Failed to connect to database');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectDatabase(sessionId);
      setIsConnected(false);
      setAvailableTables([]);
      setSelectedTables([]);
      setMessages([]);
      setConnectionString('');
      setTablePreview(null);
      setPreviewingTable(null);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleTableSelection = (tableName) => {
    setSelectedTables(prev => {
      if (prev.includes(tableName)) {
        return prev.filter(t => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTables.length === availableTables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(availableTables.map(t => t.name));
    }
  };

  const handleConfirmSelection = async () => {
    try {
      const response = await selectTables(selectedTables, sessionId);
      if (response.success) {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: response.message || `Successfully configured access to ${selectedTables.length} tables.`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error selecting tables:', error);
    }
  };

  const handlePreviewTable = async (tableName) => {
    setPreviewingTable(tableName);
    try {
      const response = await previewTable(tableName, sessionId, 10);
      if (response.success) {
        setTablePreview(response.preview);
      }
    } catch (error) {
      console.error('Error previewing table:', error);
      setTablePreview(null);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!currentQuestion.trim() || selectedTables.length === 0) {
      return;
    }

    const userMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: currentQuestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsQuerying(true);

    try {
      const response = await queryDatabase(currentQuestion, sessionId);
      
      if (response.success) {
        const assistantMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          data: {
            query: response.query,
            results: response.results,
            row_count: response.row_count,
            has_reports: response.has_reports
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: `Error: ${response.error}`,
          timestamp: new Date(),
          error: true
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Database Connection
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect to your database, select tables, and ask questions about your data
          </p>
        </div>

        {!isConnected ? (
          /* Connection Form */
          <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Connect to Database
            </h2>
            
            {/* Sample connections */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sample Connection Strings:
              </label>
              <div className="space-y-2">
                {sampleConnections.map((sample, idx) => (
                  <div key={idx} className={`text-xs p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {sample.name}:
                    </span>
                    <code className={`ml-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {sample.template}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Connection string input */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Connection String
              </label>
              <input
                type="text"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                placeholder="postgresql://user:password@host:port/database"
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                disabled={isConnecting}
              />
            </div>

            {connectionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {connectionError}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isConnecting || !connectionString.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isConnecting || !connectionString.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect to Database'}
            </button>
          </div>
        ) : (
          /* Connected View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Table Selection */}
            <div className={`lg:col-span-1 rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tables
                </h2>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Disconnect
                </button>
              </div>

              <div className="mb-4">
                <button
                  onClick={handleSelectAll}
                  className={`text-sm mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                >
                  {selectedTables.length === availableTables.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableTables.map((table) => (
                  <div 
                    key={table.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTables.includes(table.name)
                        ? isDarkMode
                          ? 'bg-blue-900 border-blue-700'
                          : 'bg-blue-50 border-blue-300'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedTables.includes(table.name)}
                          onChange={() => handleTableSelection(table.name)}
                          className="mr-2"
                        />
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {table.name}
                        </span>
                      </label>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTable(table.name);
                        }}
                        className={`text-xs px-2 py-1 rounded ${
                          isDarkMode 
                            ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {table.columns.length} columns
                    </div>
                  </div>
                ))}
              </div>

              {selectedTables.length > 0 && (
                <button
                  onClick={handleConfirmSelection}
                  className="w-full mt-4 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  Confirm Selection ({selectedTables.length})
                </button>
              )}

              {/* Table Preview */}
              {previewingTable && tablePreview && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Preview: {previewingTable}
                    </h3>
                    <button
                      onClick={() => {
                        setPreviewingTable(null);
                        setTablePreview(null);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className={`text-xs overflow-auto max-h-40 p-2 rounded ${
                    isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                  }`}>
                    <pre className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>
                      {JSON.stringify(tablePreview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Chat Interface */}
            <div className={`lg:col-span-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="mb-2">Select tables and start asking questions about your data</p>
                    <p className="text-sm">Try asking: "Show me all reports" or "What data is available?"</p>
                  </div>
                ) : (
                  messages.map((message, idx) => (
                    <ChatMessage key={idx} message={message} />
                  ))
                )}
                {isQuerying && (
                  <div className="flex justify-center">
                    <Loader />
                  </div>
                )}
              </div>

              {/* Input Form */}
              <div className={`border-t p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder={
                      selectedTables.length === 0 
                        ? 'Select tables first...' 
                        : 'Ask a question about your data...'
                    }
                    disabled={selectedTables.length === 0 || isQuerying}
                    className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!currentQuestion.trim() || selectedTables.length === 0 || isQuerying}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      !currentQuestion.trim() || selectedTables.length === 0 || isQuerying
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DBCon;
