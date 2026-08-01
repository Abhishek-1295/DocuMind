import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({ onUploadSuccess, onClose }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be under 16MB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUploadSuccess({
          filename: data.filename,
          pages: data.pages,
        });
      } else {
        setError(data.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Make sure the backend is running.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="upload-modal">
        <button className="upload-close" onClick={onClose}>✕</button>
        <h2 className="upload-title">Upload a PDF</h2>

        {isUploading ? (
          <div className="upload-loading">
            <div className="upload-spinner"></div>
            <p className="upload-loading-text">Processing your document...</p>
          </div>
        ) : (
          <>
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
            >
              <input {...getInputProps()} />
              <span className="dropzone-emoji">📄</span>
              <p className="dropzone-text">
                {isDragActive
                  ? 'Drop your PDF here!'
                  : 'Drag & drop your PDF here'}
              </p>
              <p className="dropzone-subtext">or click to browse • Max 16MB</p>
            </div>

            {error && (
              <p style={{
                color: 'var(--danger)',
                fontSize: '0.85rem',
                textAlign: 'center',
                marginTop: '12px'
              }}>
                ⚠️ {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
