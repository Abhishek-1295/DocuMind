"""
RAG Engine — Core retrieval-augmented generation pipeline for the AI PDF Chatbot.

Uses Gemini LLM + embeddings, ChromaDB vector store, and LangChain orchestration
to answer questions grounded in an uploaded PDF document.
"""

import os
import shutil
from typing import Dict, List, Optional

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document



SYSTEM_PROMPT_TEMPLATE = """\
You are a helpful AI assistant that answers questions based on the provided PDF document.
Use ONLY the context below to answer. If the answer is not in the context, say
"I couldn't find the answer in the uploaded document."

Always cite the page number(s) where you found the information.

Context:
{context}

Conversation history:
{history}
"""


class RAGEngine:
    """Manages PDF ingestion, vector storage, and conversational Q&A."""

    def __init__(self) -> None:
        """Initialize Gemini LLM, embeddings, and empty session state."""
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            temperature=0.3,
        )
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
        )
        self.vector_store: Optional[Chroma] = None
        self.document_name: Optional[str] = None
        self.page_count: int = 0
        # Simple conversation memory: list of {"role": ..., "content": ...}
        self.conversation_history: List[Dict[str, str]] = []

    # ------------------------------------------------------------------
    # PDF processing
    # ------------------------------------------------------------------

    def process_pdf(self, file_path: str) -> Dict:
        """Load a PDF, chunk it, and store embeddings in ChromaDB.

        Args:
            file_path: Absolute path to the uploaded PDF file.

        Returns:
            Dict with 'success', 'filename', and 'pages' keys.
        """
        # Load pages
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        self.page_count = len(pages)
        self.document_name = os.path.basename(file_path)

        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunks: List[Document] = text_splitter.split_documents(pages)

        # Create new vector store from chunks in-memory
        self.vector_store = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
        )

        # Reset conversation for the new document
        self.conversation_history = []

        return {
            "success": True,
            "filename": self.document_name,
            "pages": self.page_count,
        }

    # ------------------------------------------------------------------
    # Question answering
    # ------------------------------------------------------------------

    def ask_question(self, question: str, session_id: str = "default") -> Dict:
        """Retrieve relevant chunks and generate an answer via Gemini.

        Args:
            question: The user's natural-language question.
            session_id: Optional session identifier (reserved for future use).

        Returns:
            Dict with 'answer' and 'sources' (list of page numbers).
        """
        if self.vector_store is None:
            return {
                "answer": "No document has been uploaded yet. Please upload a PDF first.",
                "sources": [],
            }

        try:
            # Retrieve top-k relevant chunks
            retriever = self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 5},
            )
            relevant_docs: List[Document] = retriever.invoke(question)

            # Build context string and collect source pages
            context_parts: List[str] = []
            source_pages: set = set()
            for doc in relevant_docs:
                page_num = doc.metadata.get("page", 0) + 1  # 0-indexed → 1-indexed
                context_parts.append(f"[Page {page_num}]: {doc.page_content}")
                source_pages.add(page_num)

            context = "\n\n".join(context_parts)

            # Build conversation history string
            history_str = ""
            if self.conversation_history:
                history_lines = []
                for msg in self.conversation_history[-6:]:  # Keep last 6 exchanges
                    role = "User" if msg["role"] == "user" else "Assistant"
                    history_lines.append(f"{role}: {msg['content']}")
                history_str = "\n".join(history_lines)

            # Build a single prompt (more reliable with Gemini than SystemMessage)
            prompt = f"""You are a helpful AI assistant that answers questions based on the provided PDF document.
Use ONLY the context below to answer. If the answer is not in the context, say
"I couldn't find the answer in the uploaded document."

Always cite the page number(s) where you found the information.

Context from the PDF:
{context}

Conversation history:
{history_str}

User question: {question}

Answer:"""

            from langchain_core.messages import HumanMessage

            response = self.llm.invoke([HumanMessage(content=prompt)])
            answer = response.content
            
            # Ensure answer is a string (Langchain sometimes returns a list of parts for Gemini)
            if isinstance(answer, list):
                answer = "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in answer)
            elif not isinstance(answer, str):
                answer = str(answer)

            # Update conversation memory
            self.conversation_history.append({"role": "user", "content": question})
            self.conversation_history.append({"role": "assistant", "content": answer})

            return {
                "answer": answer,
                "sources": sorted(source_pages),
            }

        except Exception as e:
            return {
                "answer": f"Error generating answer: {str(e)}",
                "sources": [],
            }

    # ------------------------------------------------------------------
    # Session management
    # ------------------------------------------------------------------

    def clear_session(self) -> Dict:
        """Delete the vector store data and reset session state.

        Returns:
            Dict with 'success' and 'message' keys.
        """


        self.vector_store = None
        self.document_name = None
        self.page_count = 0
        self.conversation_history = []

        return {"success": True, "message": "Session cleared successfully."}

    def get_document_info(self) -> Dict:
        """Return metadata about the currently loaded PDF.

        Returns:
            Dict with 'loaded', 'filename', and 'pages' keys.
        """
        if self.document_name is None:
            return {"loaded": False, "filename": None, "pages": 0}

        return {
            "loaded": True,
            "filename": self.document_name,
            "pages": self.page_count,
        }
