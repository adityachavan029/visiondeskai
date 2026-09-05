import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Video, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, FileText, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import axios from 'axios';
import { getTranslation } from '../lib/translations';

export default function VisionInspector({ theme, language = 'en' }) {
  const [activeTab, setActiveTab] = useState('image');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const t = (key) => getTranslation(language, key);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
    runAnalysis(selectedFile);
  };

  const runAnalysis = async (fileToAnalyze) => {
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', fileToAnalyze);

    try {
      const res = await axios.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          if (percent === 100) setIsUploading(false);
        },
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d12]/90 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
            {t('visionTitle')}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">
            {t('visionDesc')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 self-start sm:self-center font-mono">
          <button
            data-cursor="IMAGE"
            onClick={() => { setActiveTab('image'); setFile(null); setResult(null); setError(null); }}
            className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'image'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t('imagePpe')}</span>
          </button>
          <button
            data-cursor="VIDEO"
            onClick={() => { setActiveTab('video'); setFile(null); setResult(null); setError(null); }}
            className={`flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{t('videoStream')}</span>
          </button>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upload Controls */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-mono flex items-center justify-between">
                <span>{activeTab === 'image' ? t('targetImage') : t('targetVideo')}</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  {activeTab === 'image' ? 'JPG, PNG, WEBP' : 'MP4, MOV, AVI'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div
                data-cursor="UPLOAD"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50 dark:bg-zinc-950/40 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />

                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-xs">
                  <Upload className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold font-mono text-zinc-900 dark:text-zinc-100">
                  {t('clickToUpload')}
                </p>
                <p className="text-[10px] font-mono text-zinc-500 mt-1">
                  {t('yoloAutoScan')}
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 font-mono text-xs">
                  <div className="flex justify-between text-zinc-900 dark:text-zinc-100">
                    <span className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>STREAMING MEDIA</span>
                    </span>
                    <span className="font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {file && (
                <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono flex items-center justify-between text-zinc-800 dark:text-zinc-200">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              )}

              {previewUrl && (
                <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-black relative">
                  {activeTab === 'image' ? (
                    <img
                      src={result?.annotated_image_url ? result.annotated_image_url : previewUrl}
                      alt="Inspection preview"
                      className="w-full max-h-64 object-contain mx-auto"
                    />
                  ) : (
                    <video src={previewUrl} controls className="w-full max-h-64 rounded-2xl" />
                  )}
                  {result?.annotated_image_url && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold flex items-center space-x-1 backdrop-blur-md">
                      <CheckCircle className="w-3 h-3" />
                      <span>YOLO Bounding Overlay</span>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Telemetry Output */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="min-h-[440px] flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <CardTitle className="text-xs sm:text-sm font-mono flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>{t('detectionTelemetry')}</span>
                </CardTitle>
                {loading && (
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Model Running...</span>
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {!loading && !result && !error && (
                <div className="py-16 sm:py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
                    <Eye className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{t('noMediaLoaded')}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{t('uploadHint')}</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-300 text-xs flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold font-mono">Analysis Error</h4>
                    <p className="mt-0.5 font-sans">{error}</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6">
                  
                  {/* Summary Bar */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                        {activeTab === 'image' ? result.count : result.video_analysis?.frames_analyzed || 0}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {activeTab === 'image' ? t('objectsDetected') : t('framesProcessed')}
                        </p>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                          {activeTab === 'image'
                            ? 'Confidence threshold: >= 25%'
                            : `${result.video_analysis?.violation_frame_count || 0} Frames with Violations`}
                        </p>
                      </div>
                    </div>

                    {result.confidence && (
                      <Badge variant={result.confidence.toLowerCase() === 'high' ? 'success' : result.confidence.toLowerCase() === 'moderate' ? 'warning' : 'danger'}>
                        {result.confidence} CONFIDENCE
                      </Badge>
                    )}
                  </div>

                  {/* Detected Tags */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-3 font-semibold">{t('detectionBreakdown')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeTab === 'image' ? (
                        result.detections?.length > 0 ? (
                          result.detections.map((d, i) => {
                            const isViolation = d.class.startsWith('NO-') || d.class === 'Fall-Detected';
                            return (
                              <Badge key={i} variant={isViolation ? 'warning' : 'success'}>
                                {isViolation ? <AlertTriangle className="w-3.5 h-3.5 mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                                <span>{d.class}</span>
                                <span className="ml-1 opacity-80">({Math.round(d.confidence * 100)}%)</span>
                              </Badge>
                            );
                          })
                        ) : (
                          <p className="text-xs text-zinc-500 font-mono">No PPE objects detected in image.</p>
                        )
                      ) : (
                        Object.entries(result.video_analysis?.class_counts || {}).map(([cls, count], i) => {
                          const isViolation = cls.startsWith('NO-') || cls === 'Fall-Detected';
                          return (
                            <Badge key={i} variant={isViolation ? 'warning' : 'success'}>
                              {isViolation ? <AlertTriangle className="w-3.5 h-3.5 mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                              <span>{cls}</span>
                              <span className="ml-1 font-bold">({count}x)</span>
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* AI Synthesized Answer */}
                  {result.answer && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        <span className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span>SYNTHESIZED SAFETY RAG EVALUATION</span>
                        </span>
                      </div>
                      <p className="leading-relaxed font-sans text-zinc-800 dark:text-zinc-200">{result.answer}</p>
                    </div>
                  )}

                  {/* Evidence Drawer */}
                  {result.evidence?.length > 0 && (
                    <div className="pt-2">
                      <button
                        data-cursor="SOURCES"
                        onClick={() => setShowSources(!showSources)}
                        className="flex items-center space-x-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold transition-colors"
                      >
                        {showSources ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span>Verified Safety Document Sources ({result.evidence.length})</span>
                      </button>

                      {showSources && (
                        <div className="mt-3 space-y-2 animate-fadeIn">
                          {result.evidence.map((item, idx) => (
                            <div key={idx} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-1.5 font-mono">
                              <div className="flex items-center justify-between text-zinc-900 dark:text-zinc-100">
                                <span className="font-semibold">{item.source}</span>
                                <span className="text-zinc-500 text-[10px]">Relevance: {item.relevance}</span>
                              </div>
                              {item.section && item.section !== 'N/A' && (
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{item.section}</p>
                              )}
                              <p className="text-[11px] leading-relaxed font-sans text-zinc-800 dark:text-zinc-200">{item.excerpt}</p>
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
