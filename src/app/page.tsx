'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Droplets,
  Trash2,
  Users,
  Wind,
  AlertTriangle,
  Building2,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Sun,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useCampus } from '@/context/CampusContext';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { mockBuildings, mockEnergyData } from '@/lib/mockData';
import { Building } from '@/types/campus';

export default function OverviewPage() {
  const { selectedZone, liveEnergyKw, liveWaterLpm, notifications } = useCampus();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter buildings by zone if selected
  const filteredBuildings = selectedZone === 'All Campus Zones'
    ? mockBuildings
    : mockBuildings.filter((b) => b.zone === selectedZone);

  const handleQuickAction = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      handleQuickAction('Telemetry stream refreshed across all 1,420 campus nodes.');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Campus Command Center
            </h1>
            <Badge variant="cyan" dot size="sm">
              REAL-TIME IOT
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Intelligent environmental monitoring, microgrid energy dispatch, and facility operations.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
            <span>Sync Telemetry</span>
          </button>

          <button
            onClick={() => handleQuickAction('Solar Priority Grid Dispatch activated. Battery storage charged to 84.5%.')}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Solar Priority</span>
          </button>

          <button
            onClick={() => handleQuickAction('Emergency HVAC Setback executed across non-critical zones (-62 kW saved).')}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-sm shadow-sky-600/30"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Eco Setback</span>
          </button>
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionFeedback && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-500/20 p-3.5 text-xs font-medium text-sky-800 dark:text-sky-300 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
            {actionFeedback}
          </span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs text-sky-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          title="Grid Demand"
          value={liveEnergyKw.toFixed(1)}
          unit="kW"
          icon={Zap}
          accentColor="amber"
          trendPct={-4.2}
          trendLabel="vs yesterday"
          trendFavorable="lower"
          isLive
          subtitle="Solar: 485 kW"
        />

        <KpiCard
          title="Water Draw"
          value={liveWaterLpm.toFixed(1)}
          unit="L/m"
          icon={Droplets}
          accentColor="sky"
          trendPct={1.8}
          trendLabel="vs baseline"
          trendFavorable="lower"
          isLive
          subtitle="Harvest: 78.4%"
        />

        <KpiCard
          title="Waste Bin Fill"
          value="58.4"
          unit="%"
          icon={Trash2}
          accentColor="emerald"
          trendPct={-6.5}
          trendLabel="weekly avg"
          trendFavorable="lower"
          subtitle="8 bins near full"
        />

        <KpiCard
          title="Population"
          value="8,420"
          unit="ppl"
          icon={Users}
          accentColor="indigo"
          trendPct={12.4}
          trendLabel="peak lecture"
          trendFavorable="neutral"
          subtitle="76.5% max cap"
        />

        <KpiCard
          title="Campus AQI"
          value="38"
          unit="AQI"
          icon={Wind}
          accentColor="cyan"
          trendPct={-15.0}
          trendLabel="clean air"
          trendFavorable="lower"
          subtitle="PM2.5: 9.2 µg/m³"
        />

        <KpiCard
          title="Active Alerts"
          value="3"
          unit="cases"
          icon={AlertTriangle}
          accentColor="rose"
          subtitle="1 Critical Chiller"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 24-Hour Energy Load Curve */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500" />
                24-Hour Campus Electrical Load Curve & Solar Offset
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time smart grid telemetry vs Scikit-learn AI forecasted baseline
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-sky-500" /> Actual (kW)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Solar PV
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Baseline
              </span>
            </div>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockEnergyData.hourlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
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
                <Area type="monotone" dataKey="actualKw" name="Actual Demand" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGradient)" />
                <Area type="monotone" dataKey="solarKw" name="Solar PV" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#solarGradient)" />
                <Area type="monotone" dataKey="baselineKw" name="Historical Baseline" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 text-center">
            <div>
              <p className="text-[11px] text-slate-400">Peak Demand Recorded</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">1,680 kW (12:00)</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Solar Generation Peak</p>
              <p className="text-sm font-bold text-amber-500">495 kW (12:00)</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Net Clean Energy Offset</p>
              <p className="text-sm font-bold text-emerald-500">29.4% Today</p>
            </div>
          </div>
        </div>

        {/* Zone Energy Budget vs Actual */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Zone Consumption vs Budget
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quarterly energy efficiency score
              </p>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockEnergyData.zoneComparison} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} unit=" kW" />
                  <YAxis type="category" dataKey="zone" stroke="#64748b" fontSize={10} width={90} tickFormatter={(val) => val.split(' ')[0]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="currentKw" name="Current kW" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="budgetKw" name="Budget kW" fill="#64748b" radius={[0, 4, 4, 0]} opacity={0.4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Campus Efficiency Index:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" /> 91.2% (Grade A)
            </span>
          </div>
        </div>
      </div>

      {/* Campus Buildings Live Matrix */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-sky-500" />
              Campus Facilities & Building IoT Mesh
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instantaneous power, water draw, climate metrics, and occupancy across {filteredBuildings.length} monitored facilities
            </p>
          </div>

          <Link
            href="/buildings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Open Buildings Directory <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuildings.map((building) => {
            const statusVariant =
              building.status === 'optimal'
                ? 'success'
                : building.status === 'warning'
                ? 'warning'
                : 'danger';

            return (
              <div
                key={building.id}
                onClick={() => setSelectedBuilding(building)}
                className="group relative cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-4 hover:border-sky-500/50 hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                        {building.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                      Code: {building.code} • {building.zone}
                    </p>
                  </div>
                  <Badge variant={statusVariant} dot size="sm">
                    {building.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-center">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-2">
                    <p className="text-[10px] text-slate-400">Power</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {building.energyUsageKw} kW
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-2">
                    <p className="text-[10px] text-slate-400">Occupancy</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {Math.round((building.currentOccupancy / building.maxCapacity) * 100)}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-2">
                    <p className="text-[10px] text-slate-400">Temp / AQI</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {building.indoorTempC}°C • {building.aqi}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>HVAC: <strong className="text-slate-700 dark:text-slate-300">{building.hvacStatus}</strong></span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                    Inspect telemetry →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Alerts & Quick Actions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              Active Priority Alerts & System Exceptions
            </h2>
            <Link href="/maintenance" className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline">
              All Tickets →
            </Link>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/70">
            {notifications.slice(0, 3).map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="inline-block mt-1 text-[10px] text-slate-400">
                      {item.timestamp} • Category: {item.category}
                    </span>
                  </div>
                </div>

                {item.actionUrl && (
                  <Link
                    href={item.actionUrl}
                    className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations & Quick Toggles */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                AI Optimization Actions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable efficiency opportunities
              </p>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 dark:bg-sky-500/10 p-3 text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Pre-cool Central Library</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Pre-chill thermal mass before 11:00 AM tariff surge. Estimated savings: $340/day.
                </p>
                <button
                  onClick={() => handleQuickAction('Pre-cooling cycle scheduled for Central Library (07:00-09:30 AM).')}
                  className="mt-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Schedule Dispatch →
                </button>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Rainwater Loop Shift</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                  Harvest vault at 78.4%. Switch cooling towers to harvested rain supply.
                </p>
                <button
                  onClick={() => handleQuickAction('Auxiliary cooling towers switched to rainwater harvest supply.')}
                  className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Switch Supply Valve →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Model: HistGradient v2.4</span>
            <Link href="/analytics" className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
              Analytics Hub →
            </Link>
          </div>
        </div>
      </div>

      {/* Building Details Modal */}
      {selectedBuilding && (
        <Modal
          isOpen={Boolean(selectedBuilding)}
          onClose={() => setSelectedBuilding(null)}
          title={selectedBuilding.name}
          description={`Building Code: ${selectedBuilding.code} • ${selectedBuilding.zone} • ${selectedBuilding.floors} Floors`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-xs text-slate-400">Energy Consumption</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white font-mono">
                  {selectedBuilding.energyUsageKw} kW
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-xs text-slate-400">Water Flow</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white font-mono">
                  {selectedBuilding.waterDrawLpm} L/m
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-xs text-slate-400">Indoor Temp / CO2</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white font-mono">
                  {selectedBuilding.indoorTempC}°C • {selectedBuilding.co2Ppm} ppm
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-xs text-slate-400">Energy Star Score</p>
                <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedBuilding.energyStarScore} / 100
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Floor Area:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBuilding.grossAreaSqFt.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current Occupancy:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBuilding.currentOccupancy} / {selectedBuilding.maxCapacity} people</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">HVAC Operational State:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBuilding.hvacStatus}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Critical Maintenance Alerts:</span>
                <span className={`font-semibold ${selectedBuilding.criticalAlerts > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {selectedBuilding.criticalAlerts} active
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBuilding(null)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <Link
                href={`/rooms?buildingId=${selectedBuilding.id}`}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Inspect Rooms & Labs →
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
