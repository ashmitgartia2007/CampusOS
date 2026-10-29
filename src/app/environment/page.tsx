'use client';

import React, { useState } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  Volume2,
  Thermometer,
  ShieldCheck,
  Compass,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
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
import { mockEnvironmentData } from '@/lib/mockData';

export default function EnvironmentPage() {
  const {
    campusAqi,
    primaryPollutant,
    ambientTempC,
    humidityPct,
    windSpeedKmh,
    uvIndex,
    noiseLevelDb,
    solarIrradianceWm2,
    aqiHistory24h
  } = mockEnvironmentData;

  const [nodes, setNodes] = useState(mockEnvironmentData.sensorNodes);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Deploy sensor modal
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeZone, setNewNodeZone] = useState('Central Arts & Science');
  const [newNodeAqi, setNewNodeAqi] = useState(32);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeploySensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await CampusAPI.createEnvironmentSensor({
        name: newNodeName.trim(),
        zone: newNodeZone
      });
      const created = {
        id: res.id || `env-${Date.now()}`,
        name: res.name || newNodeName,
        zone: res.zone || newNodeZone,
        aqi: Number(newNodeAqi),
        pm25: 7.2,
        pm10: 16.5,
        co2: 440,
        temp: 22.0,
        humidity: 46.0,
        noiseDb: 41.5,
        status: 'Healthy' as const
      };
      setNodes((prev) => [created, ...prev]);
      setIsDeployModalOpen(false);
      setNewNodeName('');
      showToast(`Microclimate station '${created.name}' deployed and calibrated!`);
    } catch (err: any) {
      showToast(`Error deploying station: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSensor = async (id: string, name: string) => {
    if (!confirm(`Decommission environmental monitoring node '${name}'?`)) return;
    try {
      await CampusAPI.deleteEnvironmentSensor(id);
      setNodes((prev) => prev.filter((n) => n.id !== id));
      showToast(`Sensor '${name}' decommissioned.`);
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
              Campus Microclimate & Air Quality Telemetry
            </h1>
            <Badge variant="cyan" dot size="sm">
              EPA NAAQS CALIBRATED
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time outdoor particulate matter (PM2.5 / PM10), acoustic noise profiles, urban heat island metrics, and canopy health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" dot>
            CAMPUS AIR: GOOD (AQI {campusAqi})
          </Badge>
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Deploy Air Sensor</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Campus Mean AQI"
          value={campusAqi}
          unit="AQI"
          icon={Wind}
          accentColor="emerald"
          trendPct={-12.5}
          trendLabel="clean air flow"
          trendFavorable="lower"
          subtitle={primaryPollutant}
        />

        <KpiCard
          title="Ambient Temp / RH"
          value={`${ambientTempC}°C`}
          unit={`/ ${humidityPct}%`}
          icon={Thermometer}
          accentColor="amber"
          subtitle="Dew Point: 11.8°C"
        />

        <KpiCard
          title="Solar Irradiance"
          value={solarIrradianceWm2}
          unit="W/m²"
          icon={Sun}
          accentColor="amber"
          subtitle={`UV Index: ${uvIndex} (Moderate)`}
        />

        <KpiCard
          title="Acoustic Baseline"
          value={`${noiseLevelDb}`}
          unit="dB"
          icon={Volume2}
          accentColor="indigo"
          subtitle="WHO Urban Quiet Zone"
        />
      </div>

      {/* 24-Hour Air Quality Index Trend by Campus Sector */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              24-Hour Air Quality Index (AQI) Quadrant Drift
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-point optical particulate sensors (PM2.5 / PM10)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Botanical Park
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-sky-500" /> North Quad
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Parking East
            </span>
          </div>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aqiHistory24h} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" AQI" />
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
              <Line type="monotone" dataKey="botanicalGarden" name="Botanical Park" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="northQuad" name="North Quad Tech" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="centralPlaza" name="Central Plaza" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="parkingEast" name="Transit & Parking" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Microclimate Nodes Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Deployed Microclimate Sensor Nodes ({nodes.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">NAAQS Calibration: Passed</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{node.name}</h4>
                    <p className="text-[11px] text-slate-400">{node.zone}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={node.status === 'Healthy' ? 'success' : 'warning'} size="sm">
                      {node.status}
                    </Badge>
                    <button
                      onClick={() => handleDeleteSensor(node.id, node.name)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Decommission sensor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                    <span className="text-[10px] text-slate-400">AQI</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{node.aqi}</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                    <span className="text-[10px] text-slate-400">PM2.5</span>
                    <p className="font-mono font-bold text-sky-500 mt-0.5">{node.pm25} µg/m³</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                    <span className="text-[10px] text-slate-400">CO2</span>
                    <p className="font-mono font-bold text-emerald-500 mt-0.5">{node.co2} ppm</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-slate-800 p-2">
                    <span className="text-[10px] text-slate-400">Noise</span>
                    <p className="font-mono font-bold text-amber-500 mt-0.5">{node.noiseDb} dB</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deploy Sensor Modal */}
      {isDeployModalOpen && (
        <Modal
          isOpen={isDeployModalOpen}
          onClose={() => setIsDeployModalOpen(false)}
          title="Deploy EPA Microclimate Air Sensor"
          description="Commission solar-powered LoRaWAN environmental telemetry station"
          maxWidth="md"
        >
          <form onSubmit={handleDeploySensor} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sensor Station Designation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. North Plaza Canopy Station #05"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Campus Zone
              </label>
              <select
                value={newNodeZone}
                onChange={(e) => setNewNodeZone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="North Tech Quad">North Tech Quad</option>
                <option value="Central Arts & Science">Central Arts & Science</option>
                <option value="South Residential">South Residential</option>
                <option value="East Athletics">East Athletics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Initial Baseline AQI
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={newNodeAqi}
                onChange={(e) => setNewNodeAqi(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeployModalOpen(false)}
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
                <span>Deploy & Calibrate</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
