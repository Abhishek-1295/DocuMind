"""
Flask API server for the AI PDF Chatbot.

Endpoints:
    POST   /api/upload  — Upload a PDF (max 16 MB) and process it.
    POST   /api/chat    — Ask a question about the uploaded PDF.
    GET    /api/status  — Check whether a document is currently loaded.
    DELETE /api/clear   — Clear the session and all uploaded files.
"""

import os

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from rag_engine import RAGEngine

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

# Allow requests from the Vite dev server and production frontend
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CORS(app, origins=[frontend_url])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf"}

# Shared RAG engine instance (lazy loaded)
rag_engine = None

def get_rag_engine():
    global rag_engine
    if rag_engine is None:
        try:
            rag_engine = RAGEngine()
        except Exception as e:
            print(f"Failed to initialize RAG Engine: {e}")
            raise ValueError(f"AI Initialization failed. Did you set GOOGLE_API_KEY? Error: {e}")
    return rag_engine


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/api/upload", methods=["POST"])
def upload_pdf():
    """Accept a PDF file, save it, and process it through the RAG pipeline."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided in the request."}), 400

        file = request.files["file"]

        if file.filename == "" or file.filename is None:
            return jsonify({"error": "No file selected."}), 400

        if not _allowed_file(file.filename):
            return jsonify({"error": "Only PDF files are accepted."}), 400

        # Save the uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        file.save(file_path)

        # Process through RAG engine
        engine = get_rag_engine()
        result = engine.process_document(file_path)
        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"error": f"Upload failed: {str(exc)}"}), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    """Answer a question about the currently loaded PDF."""
    try:
        data = request.get_json(silent=True)
        if not data or "question" not in data:
            return jsonify({"error": "Missing 'question' field in request body."}), 400

        question = data["question"].strip()
        if not question:
            return jsonify({"error": "Question cannot be empty."}), 400

        session_id = data.get("session_id", "default")
        engine = get_rag_engine()
        result = engine.ask_question(question, session_id)
        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"error": f"Chat failed: {str(exc)}"}), 500


@app.route("/api/status", methods=["GET"])
def status():
    """Return whether a document is currently loaded."""
    try:
        info = rag_engine.get_document_info()
        return jsonify(info), 200
    except Exception as exc:
        return jsonify({"error": f"Status check failed: {str(exc)}"}), 500


@app.route("/api/clear", methods=["DELETE"])
def clear():
    """Clear the current session and remove all uploaded files."""
    try:
        engine = get_rag_engine()
        result = engine.clear_session()

        # Remove uploaded files
        if os.path.exists(UPLOAD_DIR):
            for f in os.listdir(UPLOAD_DIR):
                file_path = os.path.join(UPLOAD_DIR, f)
                if os.path.isfile(file_path):
                    os.remove(file_path)

        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"error": f"Clear failed: {str(exc)}"}), 500


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
