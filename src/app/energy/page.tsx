'use client';

import React, { useState } from 'react';
import {
  Zap,
  Sun,
  BatteryCharging,
  Power,
  DollarSign,
  Leaf,
  ShieldCheck,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { mockEnergyData } from '@/lib/mockData';

export default function EnergyPage() {
  const [bessMode, setBessMode] = useState<'shaving' | 'solar_priority' | 'backup'>('shaving');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleModeChange = (mode: 'shaving' | 'solar_priority' | 'backup') => {
    setBessMode(mode);
    const label = {
      shaving: 'Peak Shaving Mode: BESS will discharge during peak tariff hours (11:00 - 16:00).',
      solar_priority: 'Solar Priority: All excess rooftop PV stored into BESS before grid export.',
      backup: 'Reserve Standby: BESS maintained at >90% SoC for uninterruptible campus backup.'
    }[mode];
    setDispatchStatus(label);
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  const { summary, breakdown, hourlyTrend, zoneComparison } = mockEnergyData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Energy & Microgrid Management
            </h1>
            <Badge variant="warning" dot size="sm">
              GRID INTERTIE ACTIVE
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time campus power distribution, rooftop solar PV telemetry, battery storage (BESS), and peak demand charge mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs">
            <span className="text-slate-400">Current Tariff: </span>
            <span className="font-bold text-amber-500 font-mono">PEAK ($0.22/kWh)</span>
          </div>
        </div>
      </div>

      {/* Dispatch Notification */}
      {dispatchStatus && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            {dispatchStatus}
          </span>
          <button onClick={() => setDispatchStatus(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Campus Demand"
          value={summary.realtimeDemandKw.toFixed(1)}
          unit="kW"
          icon={Zap}
          accentColor="amber"
          trendPct={-3.8}
          trendLabel="vs avg peak"
          trendFavorable="lower"
          isLive
          subtitle="Max Cap: 1,750 kW"
        />

        <KpiCard
          title="Solar PV Array"
          value={summary.solarPVKw.toFixed(0)}
          unit="kW"
          icon={Sun}
          accentColor="amber"
          trendPct={14.2}
          trendLabel="irradiance high"
          trendFavorable="higher"
          subtitle="1,240 panels active"
        />

        <KpiCard
          title="BESS Storage"
          value={summary.bessSocPct.toFixed(1)}
          unit="% SoC"
          icon={BatteryCharging}
          accentColor="emerald"
          trendPct={summary.bessStorageKw}
          trendLabel="kW discharging"
          trendFavorable="higher"
          subtitle="Cap: 1.2 MWh"
        />

        <KpiCard
          title="Grid Net Import"
          value={summary.gridImportKw.toFixed(0)}
          unit="kW"
          icon={Power}
          accentColor="sky"
          trendPct={-18.4}
          trendLabel="offset by solar"
          trendFavorable="lower"
          subtitle="PF: 0.98 (Optimal)"
        />

        <KpiCard
          title="Today's Cost"
          value={`$${summary.estimatedCostTodayUsd.toLocaleString()}`}
          icon={DollarSign}
          accentColor="indigo"
          trendPct={-8.2}
          trendLabel="vs budget"
          trendFavorable="lower"
          subtitle="24,680 kWh consumed"
        />

        <KpiCard
          title="Carbon Avoided"
          value={(summary.carbonAvoidedKg / 1000).toFixed(2)}
          unit="tCO2e"
          icon={Leaf}
          accentColor="emerald"
          trendPct={22.5}
          trendLabel="green energy"
          trendFavorable="higher"
          subtitle="Equivalent: 92 trees"
        />
      </div>

      {/* Microgrid Power Flow Architecture */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-500" />
              Microgrid Power Flow & Energy Balance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live power routing between utility substation, campus solar arrays, battery storage, and building loads
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1">
            <button
              onClick={() => handleModeChange('shaving')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                bessMode === 'shaving'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Peak Shaving
            </button>
            <button
              onClick={() => handleModeChange('solar_priority')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                bessMode === 'solar_priority'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Solar Priority
            </button>
            <button
              onClick={() => handleModeChange('backup')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                bessMode === 'backup'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reserve Standby
            </button>
          </div>
        </div>

        {/* Visual Flow diagram blocks */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 p-4">
            <span className="text-[11px] font-semibold uppercase text-sky-600 dark:text-sky-400">Grid Substation</span>
            <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">{summary.gridImportKw.toFixed(0)} kW</p>
            <p className="text-[11px] text-slate-400 mt-1">13.8 kV Intertie • 60 Hz</p>
            <div className="mt-3 flex justify-center">
              <Badge variant="cyan" size="sm">57.6% of Load</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-4">
            <span className="text-[11px] font-semibold uppercase text-amber-600 dark:text-amber-400">Campus Solar PV</span>
            <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">{summary.solarPVKw.toFixed(0)} kW</p>
            <p className="text-[11px] text-slate-400 mt-1">4 Rooftop Arrays • MPPT Active</p>
            <div className="mt-3 flex justify-center">
              <Badge variant="warning" size="sm">33.9% of Load</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-4">
            <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Battery BESS</span>
            <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">+{summary.bessStorageKw.toFixed(0)} kW</p>
            <p className="text-[11px] text-slate-400 mt-1">SoC: {summary.bessSocPct}% • Discharging</p>
            <div className="mt-3 flex justify-center">
              <Badge variant="success" size="sm">8.5% of Load</Badge>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 p-4">
            <span className="text-[11px] font-semibold uppercase text-indigo-600 dark:text-indigo-400">Total Consumption</span>
            <p className="mt-2 text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{summary.realtimeDemandKw.toFixed(1)} kW</p>
            <p className="text-[11px] text-slate-400 mt-1">Peak Limit: {summary.peakDemandThresholdKw} kW</p>
            <div className="mt-3 flex justify-center">
              <Badge variant="purple" size="sm">Normal Headroom</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: Hourly Profile & Sub-metering Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Demand Profile */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Hourly Load Profile vs Predicted Baseline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Demand management with solar generation overlay
            </p>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kW" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="actualKw" name="Actual kW" stroke="#38bdf8" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="predictedKw" name="ML Predicted kW" stroke="#818cf8" strokeDasharray="3 3" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="solarKw" name="Solar Gen kW" stroke="#f59e0b" strokeWidth={2} fill="url(#energyFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub-Metering Breakdown Donut */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="h-4 w-4 text-sky-500" />
                Sub-System Consumption Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Major energy consuming building systems
              </p>
            </div>

            <div className="mt-2 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="kw"
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} kW`, 'Consumption']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-1">
              {breakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    {item.kw} kW ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Sub-metering Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs overflow-x-auto">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Sub-Station Zone Energy Telemetry
        </h2>

        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-2">Campus Zone</th>
              <th className="pb-2">Current Demand (kW)</th>
              <th className="pb-2">Allocated Budget</th>
              <th className="pb-2">Variance</th>
              <th className="pb-2">Efficiency Rating</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {zoneComparison.map((zone) => {
              const diff = zone.currentKw - zone.budgetKw;
              return (
                <tr key={zone.zone} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">{zone.zone}</td>
                  <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{zone.currentKw} kW</td>
                  <td className="py-3 font-mono text-slate-500">{zone.budgetKw} kW</td>
                  <td className="py-3">
                    <span className={`font-semibold font-mono ${diff <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {diff <= 0 ? `${diff.toFixed(1)} kW` : `+${diff.toFixed(1)} kW`}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge variant={zone.efficiencyScore >= 90 ? 'success' : 'info'} size="sm">
                      {zone.efficiencyScore}% Optimal
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleModeChange('shaving')}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
