'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Droplets,
  CloudRain,
  RotateCw,
  AlertTriangle,
  Waves,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  ArrowRight,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CampusAPI } from '@/lib/api';
import { mockWaterData } from '@/lib/mockData';
import { useCampus } from '@/context/CampusContext';

export default function WaterPage() {
  const { summary, hourlyFlow, reservoirs } = mockWaterData;
  const { liveWaterLpm } = useCampus();

  const [leakList, setLeakList] = useState(mockWaterData.leakAlerts);
  const [isolatedValve, setIsolatedValve] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Leak report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLeakLocation, setNewLeakLocation] = useState('');
  const [newLeakFlowLoss, setNewLeakFlowLoss] = useState(140);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleIsolateValve = async (leakId: string = 'leak-01') => {
    try {
      const res = await CampusAPI.isolateWaterLeak(leakId);
      setIsolatedValve(true);
      setLeakList((prev) =>
        prev.map((l) => (l.id === leakId ? { ...l, status: 'Isolated' } : l))
      );
      showToast(res.message || 'Smart Valve #IV-81 engaged. Lateral Line B isolated successfully.');
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied')) {
        showToast(err.message);
      } else {
        setIsolatedValve(true);
        showToast('Smart Valve #IV-81 engaged offline. Lateral Line B isolated.');
      }
    }
  };

  const handleReportLeak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeakLocation.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await CampusAPI.createWaterLeak(newLeakLocation.trim(), Number(newLeakFlowLoss));
      const newAlert = {
        id: res.id || `leak-${Date.now()}`,
        location: res.location || newLeakLocation,
        flowLossLph: res.flowLossLph || Number(newLeakFlowLoss),
        acousticConfidence: res.acousticConfidence || 0.94,
        detectedAt: res.detectedAt || 'Just now',
        status: res.status || 'Investigating'
      };
      setLeakList((prev) => [newAlert, ...prev]);
      setIsReportModalOpen(false);
      setNewLeakLocation('');
      showToast(`Acoustic leak report logged for '${newAlert.location}' and persisted.`);
    } catch (err: any) {
      showToast(`Error logging leak: ${err.message || 'Failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeak = async (id: string, location: string) => {
    try {
      await CampusAPI.deleteWaterLeak(id);
      setLeakList((prev) => prev.filter((l) => l.id !== id));
      showToast(`Leak alert at '${location}' marked resolved and cleared.`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Water Distribution & IoT Leak Detection
            </h1>
            <Badge variant="cyan" dot size="sm">
              HYDRAULIC TELEMETRY ACTIVE
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Smart flow meter tracking, underground rainwater harvesting vaults, greywater recycling, and acoustic leak localization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={leakList.length > 0 && !isolatedValve ? 'warning' : 'success'} dot>
            {leakList.length} Active Leak {leakList.length === 1 ? 'Alert' : 'Alerts'}
          </Badge>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Report Leak Alert</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Campus Flow Rate"
          value={liveWaterLpm.toFixed(1)}
          unit="L/min"
          icon={Droplets}
          accentColor="sky"
          trendPct={1.8}
          trendLabel="vs yesterday"
          trendFavorable="lower"
          isLive
          subtitle="164.2 kL today"
        />

        <KpiCard
          title="Rainwater Vaults"
          value={summary.rainwaterCapacityPct.toFixed(1)}
          unit="%"
          icon={CloudRain}
          accentColor="cyan"
          trendPct={8.4}
          trendLabel="post rain"
          subtitle="48.6 kL stored"
        />

        <KpiCard
          title="Greywater Recycled"
          value="38.2"
          unit="kL"
          icon={RotateCw}
          accentColor="emerald"
          subtitle="23.2% of daily supply"
        />

        <KpiCard
          title="Active Pipe Leaks"
          value={leakList.length}
          unit="zones"
          icon={AlertTriangle}
          accentColor={leakList.length > 0 && !isolatedValve ? 'rose' : 'emerald'}
          subtitle={isolatedValve ? 'Isolated via Solenoid' : 'Hydrophone detected'}
        />

        <KpiCard
          title="Main Reservoir Level"
          value={summary.reservoirLevelPct.toFixed(1)}
          unit="%"
          icon={Waves}
          accentColor="indigo"
          subtitle="413 kL / 500 kL max"
        />

        <KpiCard
          title="Loss Rate (NRW)"
          value={summary.nonRevenueWaterPct.toFixed(1)}
          unit="%"
          icon={ShieldCheck}
          accentColor="emerald"
          subtitle="World Bank Grade A"
        />
      </div>

      {/* Acoustic Leak Alert Banner */}
      {leakList.length === 0 ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2.5 text-white bg-emerald-500 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Nominal Hydraulic Integrity Across All Sectors
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Zero active acoustic leak anomalies detected across 4,200m of campus piping. High-frequency hydrophones listening.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            ALL SECTORS SECURE
          </Badge>
        </div>
      ) : (
        leakList.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-2xl border p-5 shadow-xs transition-colors ${
              alert.status === 'Isolated'
                ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                : 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-xl p-2.5 text-white shrink-0 ${
                    alert.status === 'Isolated' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      Acoustic Leak Detection: {alert.location}
                    </span>
                    <Badge variant={alert.status === 'Isolated' ? 'success' : 'warning'} size="sm">
                      {alert.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Estimated flow loss: <span className="font-mono font-bold text-rose-500">{alert.flowLossLph} L/h</span> •
                    Hydrophone acoustic confidence: <span className="font-mono font-bold">{Math.round(alert.acousticConfidence * 100)}%</span> •
                    Detected {alert.detectedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alert.status !== 'Isolated' ? (
                  <button
                    onClick={() => handleIsolateValve(alert.id)}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 text-xs transition-colors shadow-xs"
                  >
                    Actuate Isolation Valve
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Solenoid Valve Closed
                  </span>
                )}
                <button
                  onClick={() => handleDeleteLeak(alert.id, alert.location)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors"
                  title="Resolve and delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <Link
                  href="/maintenance"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Create Work Order →
                </Link>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Hourly Flow Chart & Reservoirs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Hydraulic Flow Distribution by Sector (L/min)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Academic vs Residential vs Smart Drip Irrigation vs Recycled Cooling Loop
            </p>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" L/m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="residentialFlow" name="Residential" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                <Area type="monotone" dataKey="academicFlow" name="Academic Labs" stackId="1" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
                <Area type="monotone" dataKey="recycledFlow" name="Greywater Recycled" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Area type="monotone" dataKey="irrigationFlow" name="Drip Irrigation" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reservoir Capacities */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Waves className="h-4 w-4 text-sky-500" />
                Campus Storage Reservoirs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Purity index & storage capacity
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {reservoirs.map((res) => {
                const pct = Math.round((res.currentLiters / res.capacityLiters) * 100);
                return (
                  <div key={res.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {res.currentLiters.toLocaleString()} / {res.capacityLiters.toLocaleString()} Litres
                        </p>
                      </div>
                      <Badge variant={res.status === 'Normal' ? 'success' : 'info'} size="sm">
                        {res.status}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                        <span>Fill Level</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Water Purity Index:</span>
                      <span className="font-semibold text-emerald-500 font-mono">{res.purityIndex}% (Potable Grade)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Report Leak Modal */}
      {isReportModalOpen && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Log Acoustic Hydraulic Leak Alert"
          description="Register leak localization event and dispatch hydrophone acoustic scan"
          maxWidth="md"
        >
          <form onSubmit={handleReportLeak} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Pipe Segment / Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sub-basement Lateral Line B, North Tech Quad"
                value={newLeakLocation}
                onChange={(e) => setNewLeakLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Estimated Flow Loss (L/h)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={newLeakFlowLoss}
                onChange={(e) => setNewLeakFlowLoss(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Log Leak Alert</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
