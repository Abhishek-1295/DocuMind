import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import FileUpload from './components/FileUpload';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleUploadSuccess = (info) => {
    setDocumentInfo(info);
    setIsUploaded(true);
    setShowUploadModal(false);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    // Add user message
    const userMessage = {
      text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      const data = await response.json();

      const aiMessage = {
        text: data.answer || 'Sorry, I could not find an answer.',
        isUser: false,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        text: '⚠️ Connection error. Please make sure the backend server is running on port 5000.',
        isUser: false,
        sources: [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch('/api/clear', { method: 'DELETE' });
    } catch {
      // Continue clearing even if API call fails
    }
    setMessages([]);
    setIsUploaded(false);
    setDocumentInfo(null);
  };

  return (
    <div className="app">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          ☰
        </button>
        <h1 style={{ fontSize: '1rem', fontWeight: 600 }}>PDF Chat AI</h1>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={sidebarOpen ? 'sidebar open' : ''} style={sidebarOpen ? { position: 'fixed', left: 0, zIndex: 50 } : {}}>
        <Sidebar
          documentInfo={documentInfo}
          isUploaded={isUploaded}
          onUploadClick={() => {
            setShowUploadModal(true);
            setSidebarOpen(false);
          }}
          onClearChat={() => {
            handleClearChat();
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className="main-area">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          isUploaded={isUploaded}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          isUploaded={isUploaded}
          isLoading={isLoading}
        />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}
