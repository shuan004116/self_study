"""ChromaDB vector store wrapper."""

import chromadb
from typing import Optional

from backend.config import settings
from backend.rag.embeddings import get_ollama_embeddings


class VectorStore:
    """ChromaDB wrapper with subject-specific collections."""

    def __init__(self, persist_directory: Optional[str] = None):
        self.persist_directory = persist_directory or settings.chroma_db_path
        self.embeddings = get_ollama_embeddings()

        self.client = chromadb.PersistentClient(path=self.persist_directory)

    def get_or_create_collection(self, subject: str):
        """Get or create a collection for a subject."""
        collection_name = f"{subject}_knowledge"
        return self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embeddings,
            metadata={"hnsw:space": "cosine"},
        )

    def add_documents(
        self,
        subject: str,
        texts: list[str],
        metadatas: list[dict] | None = None,
        ids: list[str] | None = None,
    ):
        """Add documents to a subject collection."""
        collection = self.get_or_create_collection(subject)
        if ids is None:
            import hashlib
            ids = [f"{subject}_{hashlib.md5(t.encode()).hexdigest()[:8]}_{i}"
                   for i, t in enumerate(texts)]
        collection.add(
            documents=texts,
            metadatas=metadatas or [{}] * len(texts),
            ids=ids,
        )

    def similarity_search(
        self,
        subject: str,
        query: str,
        k: int = None,
        score_threshold: float = None,
    ) -> list[dict]:
        """Search for similar documents in a subject collection."""
        collection = self.get_or_create_collection(subject)
        k = k or settings.retrieval_top_k

        results = collection.query(
            query_texts=[query],
            n_results=k,
        )

        output = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                output.append({
                    "text": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "distance": results["distances"][0][i] if results["distances"] else 0,
                })

        score_threshold = score_threshold or settings.retrieval_score_threshold
        output = [r for r in output if r["distance"] <= (1 - score_threshold)]

        return output
