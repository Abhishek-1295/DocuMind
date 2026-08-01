import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ message, isUser, sources, timestamp }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isUser ? 'user' : 'ai'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {isUser ? (
            <p>{message}</p>
          ) : (
            <ReactMarkdown>{message}</ReactMarkdown>
          )}
        </div>

        {/* Source badges for AI messages */}
        {!isUser && sources && sources.length > 0 && (
          <div className="source-badges">
            {sources.map((page, idx) => (
              <span key={idx} className="source-badge">
                📄 Page {page}
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="message-meta">
          <span className="message-time">{formatTime(timestamp)}</span>
          {!isUser && (
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
