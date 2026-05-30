"""Chinese-optimized text chunker using sentence boundaries."""

import re
from typing import Optional

from backend.config import settings


class ChineseTextChunker:
    """Text chunker optimized for Chinese text with sentence boundary detection."""

    def __init__(
        self,
        chunk_size: int = None,
        chunk_overlap: int = None,
    ):
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap

    def split_text(self, text: str) -> list[str]:
        """Split Chinese text into overlapping chunks at sentence boundaries."""
        if not text:
            return []

        # Chinese sentence-ending punctuation
        sentences = re.split(r'(?<=[。！？；\n])', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        chunks = []
        current_chunk = ""
        overlap_buffer = ""

        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= self.chunk_size:
                current_chunk += sentence
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                    # Build overlap buffer from end of current chunk
                    overlap_buffer = current_chunk[-self.chunk_overlap:] if len(current_chunk) > self.chunk_overlap else current_chunk
                current_chunk = overlap_buffer + sentence

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def split_with_metadata(self, text: str, metadata: dict | None = None) -> list[dict]:
        """Split text and attach metadata to each chunk."""
        chunks = self.split_text(text)
        return [
            {
                "text": chunk,
                "metadata": {**(metadata or {}), "chunk_index": i},
            }
            for i, chunk in enumerate(chunks)
        ]
