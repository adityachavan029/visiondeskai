"""
vector_store.py
----------------
Handles steps 3 and 4 of the Module 2 pipeline:
  3. Generate embeddings (turn text chunks into numbers that capture meaning)
  4. Store those embeddings in a vector database, and search them later

Uses:
  - sentence-transformers: generates embeddings locally, no API key or
    internet connection needed after the model downloads once
  - chromadb: a lightweight vector database that saves to a local folder
    on disk (no separate server to install/run)
"""
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer
CHROMA_DIR = Path("vector_db")
CHROMA_DIR.mkdir(exist_ok=True)
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
collection = chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"},
)
def add_document_chunks(doc_id: str, filename: str, chunks: list[str]) -> int:
    """
    Embeds a list of text chunks and stores them in the vector database.

    Args:
        doc_id: a unique identifier for this document (e.g. a UUID)
        filename: the original filename, stored as metadata for display later
        chunks: the list of text chunks from document_processor.chunk_text()

    Returns:
        The number of chunks stored.
    """
    if not chunks:
        return 0

    embeddings = embedding_model.encode(chunks).tolist()

    ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename, "doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )

    return len(chunks)


def search_documents(query: str, top_k: int = 5) -> list[dict]:
    """
    Searches the vector database for chunks most relevant to a query.

    Args:
        query: the search question/text
        top_k: how many top results to return

    Returns:
        [
            {
                "text": "...the matching chunk of text...",
                "filename": "report.pdf",
                "chunk_index": 3,
                "relevance_score": 0.82   # higher = more relevant, roughly 0-1
            },
            ...
        ]
    """
    query_embedding = embedding_model.encode([query]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
    )

    output = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for doc, meta, distance in zip(documents, metadatas, distances):
        relevance_score = round(max(0.0, 1 - distance), 3)

        output.append({
            "text": doc,
            "filename": meta.get("filename", "unknown"),
            "chunk_index": meta.get("chunk_index", 0),
            "relevance_score": relevance_score,
        })

    return output
def get_document_count() -> int:
    """Returns how many total chunks are currently stored (across all documents)."""
    return collection.count()