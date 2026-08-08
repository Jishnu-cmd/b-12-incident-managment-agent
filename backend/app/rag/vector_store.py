import json
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.genai as genai
from app.core.config import settings

class VectorStore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.is_fitted = False

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a given text string.
        Uses Gemini embeddings if GEMINI_API_KEY is available,
        otherwise uses a normalized TF-IDF vector fallback.
        """
        if settings.GEMINI_API_KEY:
            try:
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                response = client.models.embed_content(
                    model="text-embedding-004",
                    contents=text
                )
                if response.embedding:
                    return response.embedding.values
            except Exception as e:
                print(f"[VectorStore] Gemini embedding warning: {e}. Fallback to local vector.")

        # Fallback local embedding: pseudo-semantic feature representation
        # Generate 128-dimensional dense vector representation based on term hashing & character n-grams
        words = text.lower().split()
        vector = np.zeros(128)
        for i, word in enumerate(words):
            hash_val = hash(word) % 128
            vector[hash_val] += 1.0 / (i + 1)
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector.tolist()

    def calculate_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two float vectors."""
        a = np.array(vec1)
        b = np.array(vec2)
        if len(a) != len(b):
            # Pad if dimension mismatch
            min_len = min(len(a), len(b))
            a = a[:min_len]
            b = b[:min_len]
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(dot / (norm_a * norm_b))

    def search_similar_documents(self, query: str, documents: List[Dict[str, Any]], top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """Search top-k most relevant documents for a query."""
        if not documents:
            return []

        query_vec = self.generate_embedding(query)
        results = []

        for doc in documents:
            doc_vec_raw = doc.get("embedding_json")
            if doc_vec_raw:
                try:
                    doc_vec = json.loads(doc_vec_raw)
                except Exception:
                    doc_vec = self.generate_embedding(doc.get("content", ""))
            else:
                doc_vec = self.generate_embedding(doc.get("content", ""))

            score = self.calculate_similarity(query_vec, doc_vec)
            
            # Boost score if keywords match directly in title/content
            query_lower = query.lower()
            if any(term in doc.get("content", "").lower() for term in query_lower.split() if len(term) > 3):
                score = min(1.0, score + 0.15)

            results.append((doc, float(round(score, 4))))

        # Sort descending by relevance score
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

vector_store = VectorStore()
