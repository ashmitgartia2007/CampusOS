'use client';

import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  Calendar,
  CheckCircle2,
  Leaf,
  ShieldCheck,
  TrendingDown,
  Building,
  FileSpreadsheet,
  FileText,
  FileCode,
  Sparkles,
  Trash2
} from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CampusAPI } from '@/lib/api';

interface ArchivedReport {
  id: string;
  title: string;
  type: string;
  dateRange: string;
  format: 'pdf' | 'csv' | 'json';
  status: string;
  generatedBy: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('Month-to-Date (October 2026)');
  const [reportType, setReportType] = useState('ESG Sustainability Comprehensive Scorecard');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>([
    {
      id: 'rep-01',
      title: 'Q3 2026 Campus Energy & ASHRAE 90.1 Audit',
      type: 'ASHRAE 90.1 Commercial Energy Audit',
      dateRange: 'Quarter 3 (Q3 2026)',
      format: 'pdf',
      status: 'Ready',
      generatedBy: 'Dr. Evelyn Reed',
      createdAt: '2026-10-25 14:30'
    },
    {
      id: 'rep-02',
      title: 'FY2026 Campus Carbon & ESG Scorecard',
      type: 'ESG Sustainability Comprehensive Scorecard',
      dateRange: 'Month-to-Date (October 2026)',
      format: 'csv',
      status: 'Ready',
      generatedBy: 'Carlos Vance',
      createdAt: '2026-10-28 09:15'
    },
    {
      id: 'rep-03',
      title: 'Hydraulic Balance & Acoustic Leak Audit',
      type: 'Water Balance & Acoustic Leak Audit',
      dateRange: 'Last 7 Days',
      format: 'json',
      status: 'Ready',
      generatedBy: 'System Auto-Audit',
      createdAt: '2026-10-29 08:00'
    }
  ]);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Register with backend API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          date_range: dateRange,
          format: exportFormat
        })
      });
      if (res.ok) {
        const data = await res.json();
        setArchivedReports((prev) => [
          {
            id: data.id || `rep-${Date.now()}`,
            title: data.title || `${reportType} (${dateRange})`,
            type: data.report_type || reportType,
            dateRange: data.date_range || dateRange,
            format: data.format || exportFormat,
            status: 'Ready',
            generatedBy: data.generated_by || 'Facilities Operator',
            createdAt: 'Just now'
          },
          ...prev
        ]);
      }
    } catch {
      // offline fallback
      setArchivedReports((prev) => [
        {
          id: `rep-${Date.now()}`,
          title: `${reportType} (${dateRange})`,
          type: reportType,
          dateRange,
          format: exportFormat,
          status: 'Ready',
          generatedBy: 'Facilities Operator',
          createdAt: 'Just now'
        },
        ...prev
      ]);
    }

    const cleanName = reportType.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `CampusOS_${cleanName}_2026.${exportFormat}`;

    if (exportFormat === 'csv') {
      const csvRows = [
        ['Metric', 'Category', 'Value', 'Unit', 'Target/Standard', 'Compliance Status'],
        ['Total Campus Electrical Demand', 'Energy', '1428.5', 'kW', '< 1750 kW', 'COMPLIANT'],
        ['Rooftop Solar PV Generation', 'Energy', '485.0', 'kW', '> 400 kW Peak', 'OPTIMAL'],
        ['Hydraulic Water Flow Rate', 'Water', '184.2', 'L/min', '< 220 L/min', 'NORMAL'],
        ['Rainwater Harvesting Vault Capture', 'Water', '78.4', '%', '> 60%', 'EXCEEDED'],
        ['Solid Waste Landfill Diversion Rate', 'Waste', '72.8', '%', '75.0% Goal', 'ON TRACK'],
        ['Campus Mean Air Quality Index', 'Environment', '38', 'AQI', '< 50 Good', 'PASSED'],
        ['ASHRAE 90.1 Energy Standard Score', 'Governance', '94.2', '%', '> 85%', 'CERTIFIED']
      ];
      const csvContent = csvRows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === 'json') {
      const payload = {
        report_title: reportType,
        date_range: dateRange,
        generated_at: new Date().toISOString(),
        compliance_standard: "GRI & GHG Protocol Aligned",
        metrics: {
          campus_energy_kw: 1428.5,
          solar_generation_kw: 485.0,
          water_flow_lpm: 184.2,
          rainwater_storage_pct: 78.4,
          landfill_diversion_pct: 72.8,
          mean_aqi: 38
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === 'pdf') {
      window.print();
    }

    setIsExporting(false);
    setDownloadSuccess(`Generated and registered ${filename} successfully in audit log.`);
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  const handleDeleteReport = async (id: string, title: string) => {
    if (!confirm(`Remove '${title}' from archived compliance audit logs?`)) return;
    try {
      await CampusAPI.deleteReport(id);
      setArchivedReports((prev) => prev.filter((r) => r.id !== id));
      setDownloadSuccess(`Report '${title}' purged from records.`);
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch {
      setArchivedReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              ESG Sustainability & Automated Compliance Reports
            </h1>
            <Badge variant="success" dot size="sm">
              GRI & GHG PROTOCOL ALIGNED
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated carbon accounting, energy star compliance certificates, municipal wastewater reporting, and downloadable audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            {archivedReports.length} Archived Audits
          </Badge>
        </div>
      </div>

      {downloadSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            {downloadSuccess}
          </span>
          <button onClick={() => setDownloadSuccess(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="GHG Scope 1 & 2"
          value="3,240"
          unit="tCO2e"
          icon={Leaf}
          accentColor="emerald"
          trendPct={-8.4}
          trendLabel="YoY reduction"
          trendFavorable="lower"
          subtitle="Annual Carbon Footprint"
        />

        <KpiCard
          title="Energy Star Rating"
          value="91"
          unit="/ 100"
          icon={Building}
          accentColor="amber"
          trendPct={3.0}
          trendLabel="top 10% benchmark"
          subtitle="Portfolio Average"
        />

        <KpiCard
          title="Campus Diversion"
          value="72.8%"
          unit=""
          icon={TrendingDown}
          accentColor="cyan"
          trendPct={4.2}
          trendLabel="vs 2025"
          trendFavorable="higher"
          subtitle="Landfill avoidance"
        />

        <KpiCard
          title="Compliance Score"
          value="98.5%"
          unit=""
          icon={ShieldCheck}
          accentColor="indigo"
          subtitle="EPA & Municipal Passed"
        />
      </div>

      {/* GHG Protocol Scope Breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          GHG Protocol Scope 1, 2 & 3 Campus Carbon Accounting
        </h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <span className="text-[10px] text-slate-400 font-semibold">Scope 1 (Natural Gas & Boilers)</span>
            <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white">1,120 tCO2e</p>
            <span className="text-[10px] text-emerald-500">-5.2% vs baseline</span>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <span className="text-[10px] text-slate-400 font-semibold">Scope 2 (Purchased Electricity)</span>
            <p className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white">2,120 tCO2e</p>
            <span className="text-[10px] text-emerald-500">-10.1% via Rooftop PV</span>
          </div>

          <div className="rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 p-3">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Solar Offset</span>
            <p className="mt-1 text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">-680 tCO2e</p>
            <span className="text-[10px] text-emerald-600">Avoided Emissions</span>
          </div>

          <div className="rounded-xl bg-sky-500/10 dark:bg-sky-500/15 p-3">
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Net Campus Carbon</span>
            <p className="mt-1 text-lg font-bold font-mono text-sky-600 dark:text-sky-400">2,560 tCO2e</p>
            <span className="text-[10px] text-sky-600">On Track for Net-Zero</span>
          </div>
        </div>
      </div>

      {/* Export Report Generator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4 text-sky-500" />
            Automated Audit & Report Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select parameters to generate verified audit documentation for accreditation and municipal reporting
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reporting Scope / Template
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="ESG Sustainability Comprehensive Scorecard">ESG Sustainability Comprehensive Scorecard</option>
              <option value="ASHRAE 90.1 Commercial Energy Audit">ASHRAE 90.1 Commercial Energy Audit</option>
              <option value="Water Balance & Acoustic Leak Audit">Water Balance & Acoustic Leak Audit</option>
              <option value="Zero-Waste Municipal Compliance Export">Zero-Waste Municipal Compliance Export</option>
              <option value="Predictive Maintenance MTTR Log">Predictive Maintenance MTTR Log</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="Last 24 Hours (Rolling)">Last 24 Hours (Rolling)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Month-to-Date (October 2026)">Month-to-Date (October 2026)</option>
              <option value="Quarter 3 (Q3 2026)">Quarter 3 (Q3 2026)</option>
              <option value="Year-to-Date (FY2026)">Year-to-Date (FY2026)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Export Format
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  exportFormat === 'csv'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                  exportFormat === 'json'
                    ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" /> JSON
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors shadow-sm shadow-sky-600/30"
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Compiling Report...' : `Export & Archive ${exportFormat.toUpperCase()}`}</span>
          </button>
        </div>
      </div>

      {/* Archived Compliance Reports & Audit Logs Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Archived Compliance Audits & Verified Filings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Persistent historical audit reports registered in PostgreSQL audit log
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {archivedReports.length} Registered Reports
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5">Report Title</th>
                <th className="pb-2.5">Date Range</th>
                <th className="pb-2.5">Format</th>
                <th className="pb-2.5">Generated By</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {archivedReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileBarChart2 className="h-4 w-4 text-sky-500 shrink-0" />
                    <span>{report.title}</span>
                  </td>
                  <td className="py-3 text-slate-500">{report.dateRange}</td>
                  <td className="py-3">
                    <Badge variant="cyan" size="sm">
                      {report.format.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{report.generatedBy}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">{report.createdAt}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteReport(report.id, report.title)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Delete from archived records"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
