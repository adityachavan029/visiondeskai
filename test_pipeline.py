from document_processor import process_document
from vector_store import add_document_chunks, search_documents

# Process and store the second test document
chunks2 = process_document("test2.txt")
add_document_chunks(doc_id="test-doc-2", filename="test2.txt", chunks=chunks2)
print(f"Stored {len(chunks2)} chunks from test2.txt")

# Now search - this should find the dashboard document, not the safety one
results = search_documents("how do I export a report")
print("\nSearch results for 'how do I export a report':")
for r in results:
    print(f"  [{r['filename']}] score={r['relevance_score']} -> {r['text'][:80]}...")