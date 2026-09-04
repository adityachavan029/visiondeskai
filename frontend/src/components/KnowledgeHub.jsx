import React, { useState } from 'react';
import { BookOpen, Search, Upload, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Sparkles, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import axios from 'axios';

export default function KnowledgeHub({ theme }) {
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDocFile(file);
    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage({
        type: 'success',
        text: `Document ingested successfully! ${res.data.chunks_created || 0} chunk(s) indexed into ChromaDB vector store.`,
      });
    } catch (err) {
      setUploadMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Document upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await axios.post('/api/document/search', {
        query: searchQuery.trim(),
        top_k: 5,
      });
      setSearchResult(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.detail || 'Search query failed.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0d12]/90">
        <div>
          <Badge variant="outline" className="mb-2">MODULE 02 / VECTOR RAG ENGINE</Badge>
          <h1 className="text-xl sm:text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
            Compliance Document Repository
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">
            ChromaDB vector database for instant regulation retrieval and evidence lookup.
          </p>
        </div>

        <Badge variant="monochrome" className="self-start sm:self-center font-mono">
          <Database className="w-3.5 h-3.5 mr-1.5" />
          ChromaDB Vector Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Document Upload */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-mono flex items-center justify-between">
                <span>Ingest Compliance File</span>
                <span className="text-[10px] text-zinc-500 font-normal">PDF, DOCX, TXT</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div
                data-cursor="UPLOAD"
                className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-950/40 rounded-3xl p-6 text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                  onChange={handleDocUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold font-mono text-zinc-900 dark:text-zinc-100">Upload Regulation Document</p>
                <p className="text-[10px] font-mono text-zinc-500 mt-1">Automatically chunked & embedded</p>
              </div>

              {uploading && (
                <div className="p-3 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono flex items-center space-x-2 text-zinc-800 dark:text-zinc-200">
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Indexing Vectors into ChromaDB...</span>
                </div>
              )}

              {uploadMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-mono flex items-start space-x-2 border ${
                  uploadMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-300'
                    : 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-300'
                }`}>
                  {uploadMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{uploadMessage.text}</span>
                </div>
              )}

              {docFile && (
                <div className="p-3 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono flex items-center space-x-2 text-zinc-800 dark:text-zinc-200">
                  <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                  <span className="truncate">{docFile.name}</span>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Query & Search */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="min-h-[440px] space-y-6">
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100">Semantic RAG Regulation Search</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              
              <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ask any question regarding safety manuals, OSHA rules, PPE requirements..."
                    className="w-full pl-11 pr-4 sm:pr-24 py-3.5 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-600 transition-all font-sans"
                  />
                </div>
                <Button
                  data-cursor="SEARCH"
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="sm:absolute sm:right-2 font-mono text-xs py-3 sm:py-2"
                >
                  {searching ? 'Querying...' : 'Ask AI'}
                </Button>
              </form>

              {searching && (
                <div className="py-16 text-center space-y-3 font-mono">
                  <div className="w-7 h-7 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Retrieving top-5 semantic vectors & synthesizing response...</p>
                </div>
              )}

              {searchError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {!searching && !searchResult && !searchError && (
                <div className="py-16 sm:py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">Query indexed safety standards</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">e.g., "What are mandatory helmet requirements on construction sites?"</p>
                </div>
              )}

              {searchResult && !searching && (
                <div className="space-y-6">
                  
                  {searchResult.answer ? (
                    <div className="p-4 sm:p-5 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        <span className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-zinc-500" />
                          <span>SYNTHESIZED RAG RESPONSE</span>
                        </span>

                        {searchResult.confidence && (
                          <Badge variant={searchResult.confidence.toLowerCase() === 'high' ? 'success' : 'warning'}>
                            {searchResult.confidence} CONFIDENCE
                          </Badge>
                        )}
                      </div>

                      <p className="leading-relaxed font-sans text-zinc-800 dark:text-zinc-200">{searchResult.answer}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">No matching answers found.</p>
                  )}

                  {searchResult.evidence?.length > 0 && (
                    <div className="space-y-3">
                      <button
                        data-cursor="SOURCES"
                        onClick={() => setShowSources(!showSources)}
                        className="flex items-center space-x-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold transition-colors"
                      >
                        {showSources ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>Retrieved Vector Sources ({searchResult.evidence.length})</span>
                      </button>

                      {showSources && (
                        <div className="space-y-2.5 animate-fadeIn">
                          {searchResult.evidence.map((ev, i) => (
                            <div key={i} className="p-4 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-2 font-mono">
                              <div className="flex items-center justify-between text-zinc-900 dark:text-zinc-100">
                                <span className="font-semibold">{ev.source}</span>
                                <span className="text-zinc-500 text-[10px]">Relevance: {ev.relevance}</span>
                              </div>
                              {ev.section && ev.section !== 'N/A' && (
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{ev.section}</p>
                              )}
                              <p className="text-[11px] leading-relaxed font-sans text-zinc-800 dark:text-zinc-200 p-3 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                "{ev.excerpt}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
