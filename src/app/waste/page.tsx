'use client';

import React, { useState } from 'react';
import {
  Trash2,
  Recycle,
  Truck,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Cpu,
  Navigation,
  Plus,
  Loader2,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import { Modal } from '@/components/ui/Modal';
import { CampusAPI } from '@/lib/api';
import { mockWasteData } from '@/lib/mockData';

export default function WastePage() {
  const { summary, streamBreakdown, routeOptimization } = mockWasteData;
  const [clusters, setClusters] = useState(mockWasteData.binClusters);
  const [truckDispatched, setTruckDispatched] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClusterLocation, setNewClusterLocation] = useState('');
  const [newClusterZone, setNewClusterZone] = useState('Central Arts & Science');

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDispatchTruck = async () => {
    try {
      const res = await CampusAPI.dispatchWasteRoute();
      setTruckDispatched(true);
      showToast(res.message || 'Electric collection truck #CT-04 dispatched for 8 optimized stops. ETA: 14 mins.');
    } catch (err: any) {
      if (err.message?.includes('Forbidden') || err.message?.includes('Access denied')) {
        showToast(err.message);
      } else {
        setTruckDispatched(true);
        showToast('Collection truck #CT-04 dispatched offline.');
      }
    }
  };

  const handleEmptyCluster = async (clusterId: string, location: string) => {
    try {
      await CampusAPI.emptyWasteCluster(clusterId);
      setClusters((prev) =>
        prev.map((c) =>
          c.id === clusterId
            ? {
                ...c,
                compostFillPct: 5,
                recyclingFillPct: 5,
                landfillFillPct: 5,
                lastEmptied: 'Just now',
                status: 'Normal'
              }
            : c
        )
      );
      showToast(`Waste station '${location}' emptied and ultrasonic sensors reset.`);
    } catch (err: any) {
      showToast(`Error emptying station: ${err.message}`);
    }
  };

  const handleDeleteCluster = async (clusterId: string, location: string) => {
    if (!confirm(`Decommission smart waste station at '${location}'?`)) return;
    try {
      await CampusAPI.deleteWasteCluster(clusterId);
      setClusters((prev) => prev.filter((c) => c.id !== clusterId));
      showToast(`Station '${location}' removed from campus routing.`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleAddCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClusterLocation.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await CampusAPI.createWasteCluster({
        location: newClusterLocation.trim(),
        zone: newClusterZone
      });
      const newClust = {
        id: res.id || `wc-${Date.now()}`,
        location: res.location || newClusterLocation,
        zone: res.zone || newClusterZone,
        compostFillPct: 20,
        recyclingFillPct: 25,
        landfillFillPct: 15,
        lastEmptied: 'Just now',
        status: 'Normal' as const
      };
      setClusters((prev) => [newClust, ...prev]);
      setIsAddModalOpen(false);
      setNewClusterLocation('');
      showToast(`Smart station '${newClust.location}' deployed and active!`);
    } catch (err: any) {
      showToast(`Error adding station: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const binsNeedingPickup = clusters.filter(
    (c) => c.compostFillPct >= 80 || c.recyclingFillPct >= 80 || c.landfillFillPct >= 80
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Waste & Zero-Waste Campus Operations
            </h1>
            <Badge variant="success" dot size="sm">
              ULTRASONIC SENSORS ACTIVE
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Ultrasonic bin fill levels, automated route optimization for campus collection trucks, and ESG diversion analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={binsNeedingPickup > 0 ? 'warning' : 'success'}>
            {binsNeedingPickup} Bins Need Pickup
          </Badge>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Bin Station</span>
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
          title="Monitored Bins"
          value={clusters.length * 3}
          unit="units"
          icon={Trash2}
          accentColor="sky"
          subtitle={`${clusters.length} Triple Stations`}
        />

        <KpiCard
          title="Pickup Priority"
          value={binsNeedingPickup}
          unit="stations"
          icon={AlertTriangle}
          accentColor={binsNeedingPickup > 2 ? 'amber' : 'emerald'}
          trendPct={binsNeedingPickup}
          trendLabel="fill > 80%"
          trendFavorable="lower"
          subtitle="Dynamic TSP Routing"
        />

        <KpiCard
          title="Campus Mean Fill"
          value={summary.avgFillPct.toFixed(1)}
          unit="%"
          icon={Recycle}
          accentColor="indigo"
          subtitle="Threshold: 85%"
        />

        <KpiCard
          title="Diversion Rate"
          value={summary.monthlyDiversionRatePct.toFixed(1)}
          unit="%"
          icon={Leaf}
          accentColor="emerald"
          trendPct={4.2}
          trendLabel="vs last month"
          trendFavorable="higher"
          subtitle="Landfill avoidance"
        />

        <KpiCard
          title="Compost Diverted"
          value={(summary.compostDivertedKg / 1000).toFixed(1)}
          unit="tons"
          icon={Flame}
          accentColor="emerald"
          subtitle="On-campus garden soil"
        />

        <KpiCard
          title="E-Waste Recycled"
          value={(summary.eWasteRecycledKg / 1000).toFixed(1)}
          unit="tons"
          icon={Cpu}
          accentColor="cyan"
          subtitle="Certified R2 recycler"
        />
      </div>

      {/* Dynamic Route Optimization Card */}
      <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sky-500 p-2.5 text-white shrink-0 shadow-xs">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Autonomous Truck Dispatch & TSP Route Optimization
                </span>
                <Badge variant={truckDispatched ? 'success' : 'cyan'} size="sm">
                  {truckDispatched ? 'TRUCK EN ROUTE' : 'READY TO DISPATCH'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optimized waypoint path clusters {routeOptimization.suggestedTruckStops} stations requiring urgent collection •
                Estimated travel: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{routeOptimization.estTravelKm} km</span> •
                Fuel avoided: <span className="font-mono font-bold text-emerald-500">{routeOptimization.fuelSavedLiters} L</span> •
                GHG mitigated: <span className="font-mono font-bold text-emerald-500">{routeOptimization.co2SavedKg} kg CO2e</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleDispatchTruck}
            className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2.5 text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0"
          >
            <Truck className="h-4 w-4" />
            <span>{truckDispatched ? 'Re-dispatch Truck #CT-04' : 'Dispatch Collection Truck'}</span>
          </button>
        </div>
      </div>

      {/* Ultrasonic Station Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Ultrasonic Bin Fill Stations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time compost, recycling, and municipal landfill fill levels
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {clusters.length} Stations Monitored
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((cluster) => {
            const hasOverfill =
              cluster.compostFillPct >= 80 ||
              cluster.recyclingFillPct >= 80 ||
              cluster.landfillFillPct >= 80;

            return (
              <div
                key={cluster.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cluster.location}</h4>
                      <p className="text-[11px] text-slate-400">{cluster.zone}</p>
                    </div>
                    <Badge variant={hasOverfill ? 'warning' : 'success'} size="sm">
                      {hasOverfill ? 'Pickup Due' : 'Optimal'}
                    </Badge>
                  </div>

                  {/* Tri-stream Fill Bars */}
                  <div className="mt-3 space-y-2">
                    {/* Compost */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Leaf className="h-3 w-3" /> Compost
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {cluster.compostFillPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-0.5">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${cluster.compostFillPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Recycling */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
                          <Recycle className="h-3 w-3" /> Recycling
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {cluster.recyclingFillPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-0.5">
                        <div
                          className="h-full rounded-full bg-sky-500 transition-all duration-500"
                          style={{ width: `${cluster.recyclingFillPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Landfill */}
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-500">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-semibold">
                          <Trash2 className="h-3 w-3" /> Landfill
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {cluster.landfillFillPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            cluster.landfillFillPct > 80 ? 'bg-rose-500' : 'bg-slate-500'
                          }`}
                          style={{ width: `${cluster.landfillFillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Emptied: {cluster.lastEmptied}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEmptyCluster(cluster.id, cluster.location)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                      title="Clear and reset station bins"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Empty</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCluster(cluster.id, cluster.location)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Decommission Station"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stream Mass Balance Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Monthly Waste Stream Mass Balance Composition
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tons diverted from municipal landfill through composting and source separation
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="weightTons"
                  nameKey="stream"
                >
                  {streamBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} tons`, 'Mass']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {streamBreakdown.map((stream) => (
              <div
                key={stream.stream}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stream.color }} />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {stream.stream}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {stream.weightTons} Tons
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {stream.percentage}% of campus stream
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Station Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Deploy Smart Waste & Recycling Station"
          description="Commission ultrasonic bin fill cluster on campus navigation grid"
          maxWidth="md"
        >
          <form onSubmit={handleAddCluster} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Station Location Designation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Science Quad Atrium Station #4"
                value={newClusterLocation}
                onChange={(e) => setNewClusterLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campus Quadrant / Zone
              </label>
              <select
                value={newClusterZone}
                onChange={(e) => setNewClusterZone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="North Tech Quad">North Tech Quad</option>
                <option value="Central Arts & Science">Central Arts & Science</option>
                <option value="South Residential">South Residential</option>
                <option value="East Athletics">East Athletics</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
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
                <span>Deploy Station</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
