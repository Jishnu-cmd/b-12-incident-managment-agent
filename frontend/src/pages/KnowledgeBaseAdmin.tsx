import React, { useEffect, useState } from 'react';
import { Database, Plus, Search, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { KnowledgeDocument } from '../types';

export const KnowledgeBaseAdmin: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

  // New Doc Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [docType, setDocType] = useState('SOP');
  const [source] = useState('Manual Upload');
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch knowledge base', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await api.searchKnowledge(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      setUploading(true);
      await api.addKnowledgeDocument({ title, content, document_type: docType, source });
      await fetchDocs();
      setShowModal(false);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Failed to add document', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white">RAG Knowledge Base & Vector Index</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Centralized SOP repository, troubleshooting manuals, and automated resolution feedback loop indexing.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add SOP Document</span>
        </button>
      </div>

      {/* RAG Vector Similarity Search Playground */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Vector Similarity Sandbox</span>
        </h3>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type query to test vector embedding cosine similarity search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-xs glass-input rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search Vectors</span>
          </button>
        </div>

        {searchResults && (
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-medium text-slate-400">Top Similarity Search Matches:</span>
            {searchResults.map((res: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{res.title}</span>
                  <span className="text-cyan-400 font-mono text-[10px]">Relevance: {(res.relevance_score * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{res.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indexed Knowledge Documents ({documents.length})</h3>
          <span className="text-[10px] text-slate-400">Embeddings: 128-dim Normalized Dense Vector</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading knowledge index...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="glass-card rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] border border-indigo-500/20">
                    {doc.document_type}
                  </span>
                  <span className="text-[10px] text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>

                <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{doc.content}</p>
                <div className="text-[10px] text-slate-500 pt-1 font-mono">Source: {doc.source}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-white">Add Knowledge Document</h3>

            <form onSubmit={handleAddDoc} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  placeholder="e.g. SOP-DB-005: Redis Cache Flushing Protocol"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                >
                  <option value="SOP" className="bg-slate-900">Standard Operating Procedure (SOP)</option>
                  <option value="Troubleshooting Guide" className="bg-slate-900">Troubleshooting Guide</option>
                  <option value="Resolution Record" className="bg-slate-900">Resolution Record</option>
                  <option value="Architecture Document" className="bg-slate-900">Architecture Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Full Content / Resolution Steps *</label>
                <textarea
                  rows={5}
                  placeholder="Paste SOP text, symptoms, and resolution commands..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                >
                  {uploading ? 'Embedding Vector...' : 'Save & Compute Vector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
