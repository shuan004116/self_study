#!/usr/bin/env python3
"""Initialize ChromaDB with seed knowledge base data."""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.rag.vector_store import VectorStore
from backend.rag.chunking import ChineseTextChunker


def init_knowledge_base():
    """Initialize the knowledge base with sample documents."""
    store = VectorStore()
    chunker = ChineseTextChunker()

    subjects = ["数学", "计算机", "物理", "人文"]
    knowledge_dir = Path(__file__).parent.parent / "knowledge_base"

    total_chunks = 0
    for subject in subjects:
        subject_dir = knowledge_dir / subject
        if not subject_dir.exists():
            print(f"  [!] {subject_dir} 不存在，跳过")
            continue

        print(f"正在导入 {subject} 知识库...")
        for file_path in subject_dir.glob("*"):
            if file_path.suffix in (".txt", ".md", ".pdf"):
                try:
                    if file_path.suffix == ".pdf":
                        from backend.tools.pdf_parser import ChinesePDFParser
                        parser = ChinesePDFParser()
                        text = parser.extract_text(str(file_path))
                    else:
                        text = file_path.read_text(encoding="utf-8", errors="ignore")

                    if len(text.strip()) < 100:
                        continue

                    chunks = chunker.split_with_metadata(text, {
                        "subject": subject,
                        "source": file_path.name,
                    })

                    store.add_documents(
                        subject=subject,
                        texts=[c["text"] for c in chunks],
                        metadatas=[c["metadata"] for c in chunks],
                    )

                    total_chunks += len(chunks)
                    print(f"  ✓ {file_path.name}: {len(chunks)} 个片段")
                except Exception as e:
                    print(f"  ✗ {file_path.name}: 导入失败 - {e}")

    print(f"\n导入完成！共 {total_chunks} 个知识片段")


if __name__ == "__main__":
    init_knowledge_base()
