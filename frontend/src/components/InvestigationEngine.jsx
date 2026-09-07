import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Play, CheckCircle2, Circle, AlertCircle, Edit3, Check, X,
  ShieldAlert, Sparkles, FileText, Terminal, History, RefreshCw,
  Trash2, Eye, Clock, Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import axios from 'axios';
import { getTranslation } from '../lib/translations';

const PIPELINE_STEPS = [
  { id: 'query_analysis', label: 'Query Analysis' },
  { id: 'visual_analysis', label: 'Visual Analysis' },
  { id: 'document_retrieval', label: 'Document Retrieval' },
  { id: 'evidence_validation', label: 'Evidence Validation' },
  { id: 'reasoning', label: 'Reasoning Engine' },
  { id: 'report_generation', label: 'Report Generation' },
];

export default function InvestigationEngine({ theme, language = 'en' }) {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('Check PPE compliance for the workers shown');
  const [running, setRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const [investigation, setInvestigation] = useState(null);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedReportText, setEditedReportText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const reportViewerRef = useRef(null);

  const t = (key) => getTranslation(language, key);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get('/api/investigations');
      const list = res.data.investigations || [];
      setHistory(list);
      // Auto-load latest report into viewer if none active
      setInvestigation((prev) => (prev ? prev : (list.length > 0 ? list[0] : null)));
    } catch (err) {
      console.error('Failed to load investigation history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const runInvestigation = async () => {
    if (!file) {
      setError('Please select an image or video file before starting investigation.');
      return;
    }

    setRunning(true);
    setError(null);
    setInvestigation(null);
    setCompletedSteps([]);
    setCurrentStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < PIPELINE_STEPS.length) {
        setCurrentStepIndex(step);
        setCompletedSteps((prev) => [...prev, PIPELINE_STEPS[step - 1].id]);
      } else {
        clearInterval(interval);
      }
    }, 1600);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('query', query.trim() || 'Check PPE compliance');

    try {
      const res = await axios.post('/api/investigate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(interval);
      setCompletedSteps(PIPELINE_STEPS.map((s) => s.id));
      setCurrentStepIndex(-1);
      setInvestigation(res.data);
      await fetchHistory();

      if (reportViewerRef.current) {
        reportViewerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      clearInterval(interval);
      setCurrentStepIndex(-1);
      setError(err.response?.data?.detail || 'Investigation workflow failed.');
    } finally {
      setRunning(false);
    }
  };

  const submitReview = async (action, newReportContent) => {
    if (!investigation?.id) return;
    setReviewLoading(true);

    const payload = { action };
    if (newReportContent !== undefined) {
      payload.edited_report = newReportContent;
    }

    try {
      const res = await axios.post(`/api/investigation/${investigation.id}/review`, payload);
      setInvestigation(res.data);
      setIsEditing(false);
      await fetchHistory();

      if (action === 'approve') {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#ffffff', '#a1a1aa', '#71717a'],
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Review action failed.');
    } finally {
      setReviewLoading(false);
    }
  };

  const deleteInvestigationRecord = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this investigation report?')) return;
    try {
      await axios.delete(`/api/investigation/${id}`);
      if (investigation?.id === id) {
        setInvestigation(null);
      }
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete investigation report.');
    }
  };

  const selectReport = (item) => {
    setInvestigation(item);
    setIsEditing(false);
    if (reportViewerRef.current) {
      reportViewerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredHistory = history.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  const renderMarkdown = (md) => {
    if (!md) return null;
    const lines = md.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-lg sm:text-xl font-bold font-heading text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-200 mt-5 mb-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('- ')) {
        return <li key={idx} className="ml-4 list-disc text-xs text-zinc-800 dark:text-zinc-200 my-1">{trimmed.slice(2)}</li>;
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-2 p-3 border-l-2 border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-900 text-xs italic text-zinc-800 dark:text-zinc-200 rounded-r-xl">
            {trimmed.slice(2)}
          </blockquote>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed my-1 font-sans">{trimmed}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d12]/90 shadow-sm dark:shadow-none">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold font-heading text-zinc-900 dark:text-zinc-100">
            {t('agentTitle')}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-sans">
            {t('agentDesc')}
          </p>
        </div>
      </div>

      {/* Case Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs sm:text-sm font-mono flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>{t('incidentQuery')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">MEDIA FILE</label>
              <div className="relative flex items-center border border-zinc-300 dark:border-zinc-800 rounded-2xl px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-900">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full text-zinc-800 dark:text-zinc-200 file:mr-3 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-semibold file:bg-zinc-900 file:text-white dark:file:bg-zinc-100 dark:file:text-zinc-950 hover:file:opacity-90 cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">QUERY DETAILS</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('askAgentPlaceholder')}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-all font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                data-cursor="RUN"
                onClick={runInvestigation}
                disabled={running || !file}
                className="w-full font-mono text-xs py-2.5"
              >
                {running ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    <span>{t('runInvestigation')}</span>
                  </>
                )}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Step Tracker Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase flex items-center space-x-2 font-semibold">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>Agent Pipeline Progression Engine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStepIndex === idx;

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-2 font-mono text-xs ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-300 font-semibold'
                      : isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-zinc-700'
                      : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span>STEP 0{idx + 1}</span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : isActive ? (
                      <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                      <Circle className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                  <p className="font-semibold truncate">{step.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Output & Human Review */}
      {investigation && (
        <div ref={reportViewerRef}>
          <Card className="animate-fadeIn">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={investigation.status === 'approved' ? 'success' : investigation.status === 'rejected' ? 'danger' : investigation.status === 'edited' ? 'monochrome' : 'warning'}>
                    STATUS: {investigation.status}
                  </Badge>

                  {investigation.severity && (
                    <Badge variant={investigation.severity.toLowerCase() === 'none' ? 'success' : investigation.severity.toLowerCase() === 'severe' ? 'danger' : 'warning'}>
                      SEVERITY: {investigation.severity}
                    </Badge>
                  )}

                  {investigation.confidence && (
                    <Badge variant="outline">
                      CONFIDENCE: {investigation.confidence}
                    </Badge>
                  )}
                </div>

                <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 flex items-center space-x-3">
                  <span>Chunks Retrieved: {investigation.retrieved_chunk_count || 0}</span>
                  <span>Case ID: #{investigation.id?.slice(0, 8)}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {!isEditing ? (
                <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
                  {renderMarkdown(investigation.report)}
                </div>
              ) : (
                <div className="space-y-3 font-mono">
                  <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">LIVE MARKDOWN REPORT EDITOR</label>
                  <textarea
                    rows={12}
                    value={editedReportText}
                    onChange={(e) => setEditedReportText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="flex space-x-2">
                    <Button
                      data-cursor="SAVE"
                      variant="success"
                      onClick={() => submitReview('edit', editedReportText)}
                      disabled={reviewLoading}
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      <span>Save Edits</span>
                    </Button>
                    <Button
                      data-cursor="CANCEL"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              {investigation.status !== 'approved' && investigation.status !== 'rejected' && !isEditing && (
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 font-mono">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mr-2">HUMAN REVIEW:</span>
                  
                  <Button
                    data-cursor="APPROVE"
                    variant="success"
                    onClick={() => submitReview('approve')}
                    disabled={reviewLoading}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    <span>Approve Report</span>
                  </Button>

                  <Button
                    data-cursor="EDIT"
                    variant="secondary"
                    onClick={() => {
                      setEditedReportText(investigation.report || '');
                      setIsEditing(true);
                    }}
                    disabled={reviewLoading}
                  >
                    <Edit3 className="w-4 h-4 mr-1.5" />
                    <span>Edit Draft</span>
                  </Button>

                  <Button
                    data-cursor="REJECT"
                    variant="destructive"
                    onClick={() => submitReview('reject')}
                    disabled={reviewLoading}
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    <span>Reject Report</span>
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}

      {/* Investigation Report History Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-sm font-mono flex items-center space-x-2 text-zinc-900 dark:text-zinc-100 font-bold">
                <History className="w-4 h-4 text-violet-500" />
                <span>{t('reportHistory')}</span>
                <span className="ml-2 text-xs font-normal text-zinc-500">({history.length})</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 font-sans">
                {t('reportHistoryDesc')}
              </CardDescription>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter Dropdown */}
              <div className="relative flex items-center">
                <Filter className="w-3.5 h-3.5 absolute left-3 text-zinc-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-8 pr-4 py-1.5 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="edited">Edited</option>
                </select>
              </div>

              {/* Refresh History Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHistory}
                disabled={historyLoading}
                className="text-xs font-mono py-1.5 px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${historyLoading ? 'animate-spin' : ''}`} />
                <span>{t('refreshHistory')}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {historyLoading && history.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500 flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Fetching investigation history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              {t('noHistory')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => {
                const isCurrent = investigation?.id === item.id;
                const formattedDate = item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : 'N/A';

                return (
                  <div
                    key={item.id}
                    onClick={() => selectReport(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCurrent
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-sans truncate max-w-md">
                          {item.query || 'PPE Compliance Check'}
                        </span>
                        {item.kind && (
                          <Badge variant="outline" className="text-[9px]">
                            {item.kind.toUpperCase()}
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="monochrome" className="text-[9px]">
                            ACTIVE VIEW
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-500">
                        <span>File: {item.filename || 'N/A'}</span>
                        <span>ID: #{item.id?.slice(0, 8)}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 inline opacity-60" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                      <Badge
                        variant={
                          item.status === 'approved'
                            ? 'success'
                            : item.status === 'rejected'
                            ? 'danger'
                            : item.status === 'edited'
                            ? 'monochrome'
                            : 'warning'
                        }
                      >
                        {item.status}
                      </Badge>

                      {item.severity && (
                        <Badge
                          variant={
                            item.severity.toLowerCase() === 'none'
                              ? 'success'
                              : item.severity.toLowerCase() === 'severe'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {item.severity}
                        </Badge>
                      )}

                      <div className="flex items-center space-x-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectReport(item);
                          }}
                          className="h-8 px-2.5 text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-violet-500" />
                          <span>{t('viewReport')}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteInvestigationRecord(item.id, e)}
                          className="h-8 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
