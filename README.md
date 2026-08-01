# 📄 PDF Chat AI — Chat with your Documents

An AI-powered chatbot that lets you upload PDF documents and ask questions about their content. Built with Google Gemini AI, LangChain, and React.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Python Flask
- **AI**: Google Gemini 2.0 Flash (FREE)
- **RAG Pipeline**: LangChain + ChromaDB
- **PDF Processing**: PyPDF

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API Key (free from [aistudio.google.com](https://aistudio.google.com))

### 1. Setup Backend

```bash
cd backend

# Add your API key
# Edit .env and replace "your_api_key_here" with your actual key

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 3. Open the App

Go to `http://localhost:5173` in your browser.

## 📖 How to Use

1. Click **"Upload PDF"** and drop your PDF file
2. Wait for the AI to process the document
3. Start asking questions in the chat!
4. The AI will answer based on your document content
5. Source page numbers are shown below each answer

## 📁 Project Structure

```
ai-pdf-chatbot/
├── backend/
│   ├── app.py              # Flask API server
│   ├── rag_engine.py       # RAG pipeline (LangChain + Gemini)
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # API key (not committed)
│   └── uploads/            # Uploaded PDFs
│
└── frontend/
    ├── src/
    │   ├── App.jsx          # Main app component
    │   ├── App.css          # Premium dark theme
    │   └── components/
    │       ├── Sidebar.jsx
    │       ├── FileUpload.jsx
    │       ├── ChatWindow.jsx
    │       ├── ChatInput.jsx
    │       └── MessageBubble.jsx
    └── vite.config.js
```

## 🎨 Features

- 🌙 Premium dark theme with glassmorphism
- 📎 Drag & drop PDF upload
- 💬 Real-time chat interface
- 📋 Copy AI responses
- 📄 Source page citations
- ✨ Stunning loading animations
- 📱 Responsive design
