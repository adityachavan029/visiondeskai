import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  RotateCcw,
  Download,
  Filter,
  Search,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  TrendingUp,
  Award,
  Flame,
  Printer
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const DEPARTMENTS = [
  "Assembly Line Alpha",
  "Warehouse Bay 3",
  "Chemical Storage",
  "Fabrication Plant",
  "Loading Dock North",
  "Robotics & Automation Lab"
];

const VIOLATION_TYPES = [
  "NO-Hardhat",
  "NO-Safety-Vest",
  "NO-Gloves",
  "NO-Eye-Protection",
  "Unsafe Behavior",
  "Restricted Zone Access",
  "Equipment Obstruction"
];

const SEVERITY_COLORS = {
  Low: '#3b82f6',
  Medium: '#eab308',
  High: '#f97316',
  Critical: '#ef4444'
};

const STATUS_COLORS = {
  Open: '#ef4444',
  Investigating: '#f59e0b',
  Resolved: '#10b981'
};

export default function SafetyDashboard({ theme = 'dark' }) {
  const isDark = theme === 'dark';

  // Filters State
  const [datePreset, setDatePreset] = useState('30'); // '7', '30', '90', 'all'
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedSeverities, setSelectedSeverities] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedViolationModal, setSelectedViolationModal] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Data State
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    kpis: {
      total_violations: 142,
      critical_count: 18,
      resolved_count: 124,
      open_count: 6,
      investigating_count: 12,
      compliance_percentage: 92.4,
      total_observations: 1860,
      compliant_observations: 1718,
      resolution_rate: 87.3,
      avg_resolution_time_hrs: 3.4,
      repeat_count: 15,
      repeat_rate: 10.5,
      high_risk_department: "Chemical Storage",
      peak_hazard_time: "14:00 - 15:00"
    },
    charts: {
      violation_types: [
        { violation_type: "NO-Hardhat", count: 42 },
        { violation_type: "NO-Safety-Vest", count: 35 },
        { violation_type: "NO-Gloves", count: 28 },
        { violation_type: "Unsafe Behavior", count: 19 },
        { violation_type: "Restricted Zone Access", count: 12 },
        { violation_type: "NO-Eye-Protection", count: 6 }
      ],
      severities: [
        { severity: "Low", count: 52 },
        { severity: "Medium", count: 48 },
        { severity: "High", count: 24 },
        { severity: "Critical", count: 18 }
      ],
      statuses: [
        { status: "Resolved", count: 124 },
        { status: "Investigating", count: 12 },
        { status: "Open", count: 6 }
      ],
      trend: Array.from({ length: 14 }).map((_, i) => ({
        date_only: `2026-08-${17 + i}`,
        violations: Math.floor(Math.random() * 6) + 2,
        critical: Math.floor(Math.random() * 2),
        resolved: Math.floor(Math.random() * 5) + 1,
        compliance: Math.round(88 + Math.random() * 8)
      })),
      dept_leaderboard: [
        { department: "Robotics & Automation Lab", compliance_score: 96.8, violations: 4, critical: 0, repeats: 1, status_indicator: "green" },
        { department: "Assembly Line Alpha", compliance_score: 93.2, violations: 14, critical: 2, repeats: 2, status_indicator: "green" },
        { department: "Warehouse Bay 3", compliance_score: 91.0, violations: 22, critical: 3, repeats: 3, status_indicator: "green" },
        { department: "Loading Dock North", compliance_score: 86.4, violations: 31, critical: 4, repeats: 4, status_indicator: "amber" },
        { department: "Fabrication Plant", compliance_score: 82.5, violations: 38, critical: 5, repeats: 5, status_indicator: "amber" },
        { department: "Chemical Storage", compliance_score: 74.2, violations: 45, critical: 7, repeats: 6, status_indicator: "red" }
      ],
      heatmap: [
        { department: "Assembly Line Alpha", h_7: 0, h_8: 1, h_9: 2, h_10: 1, h_11: 0, h_12: 1, h_13: 2, h_14: 3, h_15: 1, h_16: 0, h_17: 1, h_18: 0, h_19: 0, h_20: 0 },
        { department: "Warehouse Bay 3", h_7: 1, h_8: 2, h_9: 1, h_10: 3, h_11: 1, h_12: 0, h_13: 1, h_14: 4, h_15: 2, h_16: 1, h_17: 0, h_18: 1, h_19: 0, h_20: 0 },
        { department: "Chemical Storage", h_7: 2, h_8: 3, h_9: 2, h_10: 4, h_11: 2, h_12: 1, h_13: 3, h_14: 5, h_15: 3, h_16: 2, h_17: 1, h_18: 2, h_19: 1, h_20: 0 },
        { department: "Fabrication Plant", h_7: 1, h_8: 2, h_9: 3, h_10: 2, h_11: 1, h_12: 0, h_13: 2, h_14: 4, h_15: 2, h_16: 1, h_17: 1, h_18: 0, h_19: 0, h_20: 0 },
        { department: "Loading Dock North", h_7: 0, h_8: 1, h_9: 2, h_10: 1, h_11: 3, h_12: 1, h_13: 2, h_14: 3, h_15: 2, h_16: 1, h_17: 0, h_18: 1, h_19: 0, h_20: 0 },
        { department: "Robotics & Automation Lab", h_7: 0, h_8: 0, h_9: 1, h_10: 0, h_11: 0, h_12: 0, h_13: 1, h_14: 1, h_15: 0, h_16: 0, h_17: 0, h_18: 0, h_19: 0, h_20: 0 }
      ]
    },
    violations: [
      { id: "VIO-10294", timestamp: "2026-08-31 14:22:00", department: "Chemical Storage", location: "Zone 2 - Section B", violation_type: "NO-Eye-Protection", severity: "Critical", status: "Open", notes: "Worker handling acid container without protective goggles." },
      { id: "VIO-10293", timestamp: "2026-08-31 13:45:00", department: "Fabrication Plant", location: "Zone 1 - Section A", violation_type: "NO-Hardhat", severity: "High", status: "Investigating", notes: "Overhead crane active while worker headgear was missing." },
      { id: "VIO-10292", timestamp: "2026-08-31 11:10:00", department: "Warehouse Bay 3", location: "Zone 4 - Section C", violation_type: "NO-Safety-Vest", severity: "Medium", status: "Resolved", notes: "Forklift aisle pedestrian lacking high-visibility vest." },
      { id: "VIO-10291", timestamp: "2026-08-30 16:05:00", department: "Assembly Line Alpha", location: "Zone 3 - Section A", violation_type: "NO-Gloves", severity: "Low", status: "Resolved", notes: "Manual sheet metal assembly executed without cut-resistant gloves." }
    ]
  });

  // Calculate start/end dates based on preset
  const dateParams = useMemo(() => {
    if (datePreset === 'all') return { start: null, end: null };
    const days = parseInt(datePreset, 10);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, [datePreset]);

  // Fetch Dashboard Data from Backend
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateParams.start) params.append('start_date', dateParams.start);
      if (dateParams.end) params.append('end_date', dateParams.end);

      selectedDepts.forEach((d) => params.append('departments', d));
      selectedSeverities.forEach((s) => params.append('severities', s));
      selectedStatuses.forEach((st) => params.append('statuses', st));
      selectedTypes.forEach((t) => params.append('violation_types', t));

      const response = await axios.get(`/api/dashboard/analytics?${params.toString()}`);
      if (response.data && response.data.kpis && response.data.charts) {
        setAnalyticsData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch safety analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [datePreset, selectedDepts, selectedSeverities, selectedStatuses, selectedTypes]);

  // Client-side search filtering on violation log table
  const filteredViolations = useMemo(() => {
    const violations = analyticsData?.violations || [];
    if (!searchTerm.trim()) return violations;
    const term = searchTerm.toLowerCase();
    return violations.filter(
      (v) =>
        v.id.toLowerCase().includes(term) ||
        v.department.toLowerCase().includes(term) ||
        v.violation_type.toLowerCase().includes(term) ||
        v.location.toLowerCase().includes(term) ||
        (v.notes && v.notes.toLowerCase().includes(term))
    );
  }, [analyticsData, searchTerm]);

  // Reset all filters
  const resetFilters = () => {
    setDatePreset('30');
    setSelectedDepts([]);
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSearchTerm('');
  };

  // CSV Export
  const handleExportCSV = () => {
    window.open('/api/dashboard/export?format=csv', '_blank');
  };

  // Compliance Status Color Helper
  const getComplianceStatusBadge = (compScore) => {
    if (compScore >= 90) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Optimal Safety (Green)</span>
        </span>
      );
    }
    if (compScore >= 78) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Attention Needed (Amber)</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        <span>Action Required (Red)</span>
      </span>
    );
  };

  const kpis = analyticsData.kpis || {};
  const compPct = kpis.compliance_percentage ?? 91.4;

  return (
    <div className="space-y-6 pb-12 transition-colors duration-200">
      
      {/* 1. Header Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isDark ? 'bg-zinc-900/70 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-heading">
                  Workplace Monitoring & Safety Analytics
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Real-time violation tracking, compliance scoring, and safety telemetry
                </p>
              </div>
            </div>
          </div>

          {/* Preset Buttons & Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Quick Date Presets */}
            <div className="flex items-center p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 font-mono text-xs">
              {[
                { id: '7', label: '7D' },
                { id: '30', label: '30D' },
                { id: '90', label: '90D' },
                { id: 'all', label: 'ALL' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    datePreset === p.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                isFilterDrawerOpen || selectedDepts.length > 0 || selectedSeverities.length > 0
                  ? 'bg-zinc-900 text-white border-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-300 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedDepts.length + selectedSeverities.length + selectedStatuses.length + selectedTypes.length) > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                  {selectedDepts.length + selectedSeverities.length + selectedStatuses.length + selectedTypes.length}
                </span>
              )}
            </button>

            {/* Export Buttons */}
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-mono transition-all"
              title="Download Raw CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">CSV Export</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold transition-all shadow-md"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Report</span>
            </button>

          </div>
        </div>

        {/* Dynamic Filter Bar (Collapsible) */}
        {isFilterDrawerOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* Department Filter */}
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1.5 font-sans font-medium">Departments</label>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {DEPARTMENTS.map((dept) => (
                  <label key={dept} className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDepts.includes(dept)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDepts([...selectedDepts, dept]);
                        else setSelectedDepts(selectedDepts.filter((d) => d !== dept));
                      }}
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-500 focus:ring-0"
                    />
                    <span className="truncate">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1.5 font-sans font-medium">Severity Level</label>
              <div className="space-y-1">
                {['Low', 'Medium', 'High', 'Critical'].map((sev) => (
                  <label key={sev} className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSeverities.includes(sev)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedSeverities([...selectedSeverities, sev]);
                        else setSelectedSeverities(selectedSeverities.filter((s) => s !== sev));
                      }}
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-500 focus:ring-0"
                    />
                    <span className="capitalize" style={{ color: SEVERITY_COLORS[sev] }}>
                      ● {sev}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 mb-1.5 font-sans font-medium">Status</label>
              <div className="space-y-1">
                {['Open', 'Investigating', 'Resolved'].map((st) => (
                  <label key={st} className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(st)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStatuses([...selectedStatuses, st]);
                        else setSelectedStatuses(selectedStatuses.filter((s) => s !== st));
                      }}
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-500 focus:ring-0"
                    />
                    <span style={{ color: STATUS_COLORS[st] }}>● {st}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex flex-col justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Key Performance Indicators (KPI Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Overall Compliance Percentage */}
        <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">Compliance Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight font-heading text-zinc-900 dark:text-white">{compPct}%</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              ({kpis.compliant_observations ?? 0} / {kpis.total_observations ?? 0} obs)
            </span>
          </div>
          <div className="mt-3">
            {getComplianceStatusBadge(compPct)}
          </div>
        </div>

        {/* KPI 2: Total & Critical Violations */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">Total Violations</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-3">
            <span className="text-3xl font-extrabold tracking-tight font-heading text-zinc-900 dark:text-white">{kpis.total_violations ?? 0}</span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              {kpis.critical_count ?? 0} Critical
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <span>Open: <strong className="text-rose-600 dark:text-rose-400">{kpis.open_count ?? 0}</strong></span>
            <span>Investigating: <strong className="text-amber-600 dark:text-amber-400">{kpis.investigating_count ?? 0}</strong></span>
          </div>
        </div>

        {/* KPI 3: Resolution Rate & Time */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">Resolution Efficiency</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight font-heading text-zinc-900 dark:text-white">{kpis.resolution_rate ?? 100}%</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">Resolved</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <span>Avg Res Time:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-bold">{kpis.avg_resolution_time_hrs ?? 0} hrs</strong>
          </div>
        </div>

        {/* KPI 4: Challenge KPI - Peak Hazard Slot & Repeat Offender Index */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">Risk Telemetry</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex justify-between">
              <span>Peak Risk Slot:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{kpis.peak_hazard_time ?? '14:00 - 15:00'}</span>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex justify-between">
              <span>High Risk Dept:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold truncate max-w-[120px]">{kpis.high_risk_department ?? 'N/A'}</span>
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono flex justify-between">
              <span>Repeat Breaches:</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-bold">{kpis.repeat_count ?? 0} ({kpis.repeat_rate ?? 0}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Violation Distribution by Type (Bar Chart) */}
        <div className={`p-5 rounded-2xl border transition-all lg:col-span-2 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base font-heading">Violations by Type</h3>
              <p className="text-xs text-zinc-500">Breakdown of non-compliance categories</p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
              Total Types: {(analyticsData?.charts?.violation_types || []).length}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.charts?.violation_types || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                <XAxis dataKey="violation_type" stroke={isDark ? '#a1a1aa' : '#71717a'} tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                <YAxis stroke={isDark ? '#a1a1aa' : '#71717a'} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                    borderRadius: '0.75rem',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity & Status Distribution (Pie / Donut) */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base font-heading">Severity Distribution</h3>
              <p className="text-xs text-zinc-500">Incident critical levels</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.charts?.severities || []}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(analyticsData?.charts?.severities || []).map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                    borderRadius: '0.75rem',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-mono text-zinc-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Trend Line & Department Compliance Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart: Incidents & Compliance Score Over Time */}
        <div className={`p-5 rounded-2xl border transition-all lg:col-span-2 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm sm:text-base font-heading">Incidents & Compliance Trend</h3>
              <p className="text-xs text-zinc-500">Daily violation count vs overall compliance score</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1" /> Violations</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1" /> Compliance %</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData?.charts?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                <XAxis dataKey="date_only" stroke={isDark ? '#a1a1aa' : '#71717a'} tick={{ fontSize: 10 }} />
                <YAxis stroke={isDark ? '#a1a1aa' : '#71717a'} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#18181b' : '#ffffff',
                    borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                    borderRadius: '0.75rem',
                    color: isDark ? '#fff' : '#000',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="violations" stroke="#f43f5e" fillOpacity={1} fill="url(#colorViolations)" name="Violations" />
                <Area type="monotone" dataKey="compliance" stroke="#10b981" fillOpacity={1} fill="url(#colorCompliance)" name="Compliance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Compliance Leaderboard */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base font-heading">Department Leaderboard</h3>
              <p className="text-xs text-zinc-500">Safety compliance by department</p>
            </div>
            <Award className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {(analyticsData?.charts?.dept_leaderboard || []).map((item, idx) => (
              <div
                key={item.department}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-between"
              >
                <div className="space-y-0.5 max-w-[170px]">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-500">#{idx + 1}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.department}</span>
                  </div>
                  <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono">
                    {item.violations} violations • {item.repeats} repeat
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold font-mono" style={{
                    color: item.status_indicator === 'green' ? '#10b981' : item.status_indicator === 'amber' ? '#f59e0b' : '#ef4444'
                  }}>
                    {item.compliance_score}%
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    item.status_indicator === 'green'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : item.status_indicator === 'amber'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {item.status_indicator}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Challenge Feature: Peak Risk Hour Matrix (Heatmap Grid) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base font-heading flex items-center space-x-2">
              <span>Hourly Safety Risk Heatmap</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30 font-mono uppercase font-bold">
                Challenge Visualization
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Incident frequency density by hour of day (07:00 - 20:00)</p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>Low Risk</span>
            <div className="flex space-x-1">
              <span className="w-3 h-3 rounded bg-zinc-200 dark:bg-zinc-800" />
              <span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900/60" />
              <span className="w-3 h-3 rounded bg-amber-500 text-zinc-950 font-bold" />
              <span className="w-3 h-3 rounded bg-rose-600 text-white font-bold" />
            </div>
            <span>High Risk</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-bold">Department</th>
                {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((h) => (
                  <th key={h} className="py-2 px-1 text-center font-semibold">{h}:00</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(analyticsData?.charts?.heatmap || []).map((row) => (
                <tr key={row.department} className="border-b border-zinc-200 dark:border-zinc-800/40">
                  <td className="py-2 pr-4 font-bold text-zinc-900 dark:text-zinc-200 truncate max-w-[160px]">{row.department}</td>
                  {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((h) => {
                    const count = row[`h_${h}`] || 0;
                    let bgColor = isDark ? 'bg-zinc-800/40 text-zinc-600' : 'bg-zinc-100 text-zinc-400';
                    if (count >= 4) bgColor = 'bg-rose-600 text-white font-bold animate-pulse';
                    else if (count >= 2) bgColor = 'bg-amber-500 text-zinc-950 font-bold';
                    else if (count === 1) bgColor = isDark ? 'bg-amber-900/60 text-amber-200' : 'bg-amber-100 text-amber-800 font-semibold';

                    return (
                      <td key={h} className="py-1 px-1 text-center">
                        <div className={`w-full py-1.5 rounded text-[11px] ${bgColor}`}>
                          {count > 0 ? count : '•'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Detected Violations Log Table */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-zinc-900/60 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base font-heading text-zinc-900 dark:text-zinc-100">Detected Violations Table</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Live safety monitoring incident log</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search by ID, dept, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3">Violation ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Violation Type</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {filteredViolations.slice(0, 15).map((vio) => (
                <tr key={vio.id} className="hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-200">{vio.id}</td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{vio.timestamp}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-800 dark:text-zinc-300">{vio.department}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                      {vio.violation_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        backgroundColor: `${SEVERITY_COLORS[vio.severity]}20`,
                        color: SEVERITY_COLORS[vio.severity],
                        border: `1px solid ${SEVERITY_COLORS[vio.severity]}40`
                      }}
                    >
                      {vio.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        backgroundColor: `${STATUS_COLORS[vio.status]}20`,
                        color: STATUS_COLORS[vio.status],
                        border: `1px solid ${STATUS_COLORS[vio.status]}40`
                      }}
                    >
                      {vio.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedViolationModal(vio)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Incident Detail Modal */}
      {selectedViolationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-3xl border space-y-4 transition-all shadow-2xl ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold font-heading text-lg">{selectedViolationModal.id}</h3>
              </div>
              <button
                onClick={() => setSelectedViolationModal(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Department:</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-200">{selectedViolationModal.department}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Location:</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-200">{selectedViolationModal.location}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Timestamp:</span>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedViolationModal.timestamp}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Violation Type:</span>
                <p className="font-bold text-violet-600 dark:text-violet-400">{selectedViolationModal.violation_type}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Severity:</span>
                <p className="font-bold" style={{ color: SEVERITY_COLORS[selectedViolationModal.severity] }}>
                  {selectedViolationModal.severity}
                </p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Status:</span>
                <p className="font-bold" style={{ color: STATUS_COLORS[selectedViolationModal.status] }}>
                  {selectedViolationModal.status}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Supervisor Investigation Notes:</span>
              <p className="text-xs text-zinc-800 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 font-sans">
                {selectedViolationModal.notes || 'No notes logged.'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedViolationModal(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-mono font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Executive Report Modal (Print / Downloadable Summary) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl border space-y-6 shadow-2xl ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-heading">VisionDesk AI Safety Audit Executive Report</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-3 gap-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Overall Compliance:</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{compPct}%</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Total Violations:</span>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{kpis.total_violations}</p>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Critical Incidents:</span>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{kpis.critical_count}</p>
              </div>
            </div>

            {/* Executive Notes */}
            <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
              <h4 className="font-bold text-zinc-900 dark:text-white font-heading text-sm">Executive Key Observations:</h4>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 font-mono">
                <li>Workplace compliance currently stands at <strong>{compPct}%</strong> across all monitored zones.</li>
                <li>Highest violation frequency recorded in <strong>{kpis.high_risk_department}</strong> during peak hours <strong>{kpis.peak_hazard_time}</strong>.</li>
                <li>Average incident resolution window is <strong>{kpis.avg_resolution_time_hrs} hours</strong> with a resolution rate of <strong>{kpis.resolution_rate}%</strong>.</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-mono font-bold border border-zinc-300 dark:border-zinc-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Download Raw CSV</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
