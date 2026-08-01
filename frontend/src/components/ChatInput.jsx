import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSendMessage, isUploaded, isLoading }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed || !isUploaded || isLoading) return;

    onSendMessage(trimmed);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-input-container">
      <div className={`chat-input-wrapper ${!isUploaded ? 'disabled' : ''}`}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isUploaded
              ? 'Ask anything about your document...'
              : 'Upload a PDF first to start chatting...'
          }
          disabled={!isUploaded || isLoading}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSubmit}
          disabled={!message.trim() || !isUploaded || isLoading}
        >
          ➤
        </button>
      </div>

      {!isUploaded && (
        <p className="disabled-tooltip">
          📎 Upload a PDF document to start chatting
        </p>
      )}
    </div>
  );
}
