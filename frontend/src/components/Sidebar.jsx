import React from 'react';

export default function Sidebar({ documentInfo, isUploaded, onUploadClick, onClearChat }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>📄 DocuMind</h1>
        <p>Powered by RAG</p>
      </div>

      <button className="sidebar-btn" onClick={onUploadClick}>
        📎 Upload PDF
      </button>

      {isUploaded && (
        <div className="doc-info">
          <div className="doc-info-title">
            📑 Loaded Document
          </div>
          <div className="doc-info-name">
            {documentInfo?.filename || 'Document'}
          </div>
          <div className="doc-info-pages">
            {documentInfo?.pages || 0} pages
          </div>
        </div>
      )}

      {isUploaded && (
        <button className="sidebar-btn danger" onClick={onClearChat}>
          🗑️ Clear Chat
        </button>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-badge">
          ✨ Gemini AI
        </div>
      </div>
    </aside>
  );
}
