"""Retrieval-augmented generation (RAG) pipeline."""

from backend.rag.vector_store import VectorStore
from backend.rag.embeddings import get_ollama_embeddings


class RAGRetriever:
    """RAG retrieval pipeline combining vector search with subject filtering."""

    def __init__(self):
        self.vector_store = VectorStore()
        self.embeddings = get_ollama_embeddings()

    async def retrieve(
        self,
        query: str,
        subject: str = "",
        top_k: int = 5,
    ) -> str:
        """Retrieve relevant context for a query from the knowledge base."""
        if not subject or subject == "跨学科":
            # Try all subjects
            all_results = []
            for subj in ["数学", "计算机", "物理", "人文"]:
                try:
                    results = self.vector_store.similarity_search(
                        subject=subj, query=query, k=top_k
                    )
                    all_results.extend(results)
                except Exception:
                    continue
            results = sorted(all_results, key=lambda x: x["distance"])[:top_k]
        else:
            results = self.vector_store.similarity_search(
                subject=subject, query=query, k=top_k
            )

        if not results:
            return ""

        context_parts = []
        for i, r in enumerate(results, 1):
            source = r["metadata"].get("source", "未知来源")
            context_parts.append(f"[{i}] (来源: {source})\n{r['text']}")

        return "\n\n".join(context_parts)
