"""Chinese PDF parser using PyMuPDF."""

import fitz  # PyMuPDF
import re
from typing import Optional


class ChinesePDFParser:
    """Parse Chinese PDF documents with structure preservation."""

    def extract_text(self, filepath: str) -> str:
        """Extract all text from a PDF."""
        doc = fitz.open(filepath)
        text = ""
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()
        return text

    def extract_by_chapters(self, filepath: str) -> list[dict]:
        """Extract text organized by chapter/section headers."""
        doc = fitz.open(filepath)
        chapters = []
        current = {"title": "前言", "content": "", "page_start": 1}

        # Chinese chapter number pattern: 第一章, 第1章, 第1节, 1.1, etc.
        chapter_pattern = re.compile(
            r'^第[一二三四五六七八九十百千零\d]+[章节篇讲]|^\d+\.\d+\s',
            re.MULTILINE,
        )

        for page_num, page in enumerate(doc, 1):
            text = page.get_text("text")
            match = chapter_pattern.search(text)
            if match:
                if current["content"].strip():
                    chapters.append(current)
                current = {
                    "title": match.group(0).strip(),
                    "content": text,
                    "page_start": page_num,
                }
            else:
                current["content"] += "\n" + text

        if current["content"].strip():
            chapters.append(current)

        doc.close()
        return chapters
