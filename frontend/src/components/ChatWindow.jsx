import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, isLoading, isUploaded }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Welcome state
  if (!isUploaded && messages.length === 0) {
    return (
      <div className="chat-window">
        <div className="welcome-state">
          <span className="welcome-emoji">📄</span>
          <h2 className="welcome-title">Chat with your PDFs</h2>
          <p className="welcome-subtitle">
            Upload a PDF document and start asking questions.
            AI will answer based on your document content.
          </p>
        </div>
      </div>
    );
  }

  // Chat ready but no messages yet
  if (isUploaded && messages.length === 0 && !isLoading) {
    return (
      <div className="chat-window">
        <div className="welcome-state">
          <span className="welcome-emoji">✨</span>
          <h2 className="welcome-title">Document loaded!</h2>
          <p className="welcome-subtitle">
            Your PDF is ready. Ask any question about its content below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg.text}
          isUser={msg.isUser}
          sources={msg.sources}
          timestamp={msg.timestamp}
        />
      ))}

      {/* Stunning Shimmer Loading */}
      {isLoading && (
        <div className="shimmer-container">
          <div className="shimmer-avatar">🤖</div>
          <div className="shimmer-bubble">
            <div className="shimmer-line"></div>
            <div className="shimmer-line"></div>
            <div className="shimmer-line"></div>
            <div className="shimmer-line"></div>
            <div className="typing-dots">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
