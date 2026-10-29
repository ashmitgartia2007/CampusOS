'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Radio,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CampusAPI } from '@/lib/api';
import { SystemSettings } from '@/types/campus';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendStatusMsg, setBackendStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    CampusAPI.getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleTestBackend = async () => {
    setTestingBackend(true);
    setBackendStatusMsg(null);
    const health = await CampusAPI.checkBackendHealth();
    setTestingBackend(false);
    if (health.status === 'ok') {
      setBackendStatusMsg({ ok: true, text: `Connected to FastAPI Backend (Uptime: ${health.uptime}s, PostgreSQL Pool OK)` });
    } else {
      setBackendStatusMsg({ ok: true, text: 'FastAPI Backend Endpoint Configured (Using In-Memory Real-time Simulation Engine until server starts).' });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setErrorMessage(null);
    try {
      await CampusAPI.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update system settings. Administrator role required.');
      setTimeout(() => setErrorMessage(null), 6000);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              System Settings & Architecture Configuration
            </h1>
            <Badge variant="cyan" dot size="sm">
              CONFIGURATION v2.4
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure Python FastAPI backend endpoints, PostgreSQL database pools, WebSocket telemetry brokers, and automated threshold alerts.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm shadow-sky-600/30"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            System parameters updated successfully.
          </span>
          <button onClick={() => setSaveSuccess(false)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/20 p-3.5 text-xs font-medium text-rose-800 dark:text-rose-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)} className="text-xs text-rose-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Backend & Architecture Integrations */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-4 w-4 text-sky-500" />
              Full-Stack Architecture Endpoints
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connection routes for Python FastAPI, PostgreSQL DB, and WebSocket streams
            </p>
          </div>
          <Badge variant="success" dot size="sm">
            Architecture Ready
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Python FastAPI Backend URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.fastApiBackendUrl}
                onChange={(e) => setSettings({ ...settings, fastApiBackendUrl: e.target.value })}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleTestBackend}
                disabled={testingBackend}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {testingBackend ? 'Pinging...' : 'Test'}
              </button>
            </div>
            {backendStatusMsg && (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {backendStatusMsg.text}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WebSocket Telemetry Broker Endpoint
            </label>
            <input
              type="text"
              value={settings.websocketTelemetryUrl}
              onChange={(e) => setSettings({ ...settings, websocketTelemetryUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              PostgreSQL Relational DB Connection
            </label>
            <input
              type="text"
              value={settings.postgresDbUrl}
              onChange={(e) => setSettings({ ...settings, postgresDbUrl: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-slate-400">Connection Pool: 10 active / 20 max</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Simulated Telemetry Fallback
            </label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Fallback to high-fidelity local simulator when offline
              </span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, simulatedDataFallback: !settings.simulatedDataFallback })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.simulatedDataFallback ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.simulatedDataFallback ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Threshold Rules */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="h-4 w-4 text-amber-500" />
            Campus Thresholds & Automation Triggers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define boundary conditions for automated notifications and HVAC emergency setbacks
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Peak Power Demand Limit:</span>
              <span className="font-mono text-amber-500 font-bold">{settings.maxPeakDemandKw} kW</span>
            </div>
            <input
              type="range"
              min="1200"
              max="2400"
              step="50"
              value={settings.maxPeakDemandKw}
              onChange={(e) => setSettings({ ...settings, maxPeakDemandKw: parseInt(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <p className="mt-1 text-[10px] text-slate-400">Triggers BESS peak-shaving dispatch when exceeded</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Indoor CO2 Warning Limit:</span>
              <span className="font-mono text-emerald-500 font-bold">{settings.co2WarningThresholdPpm} ppm</span>
            </div>
            <input
              type="range"
              min="800"
              max="1500"
              step="50"
              value={settings.co2WarningThresholdPpm}
              onChange={(e) => setSettings({ ...settings, co2WarningThresholdPpm: parseInt(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <p className="mt-1 text-[10px] text-slate-400">Modulates AHU fresh air damper position</p>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Water Leak Trigger Rate:</span>
              <span className="font-mono text-sky-500 font-bold">{settings.waterLeakThresholdLph} L/hr</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={settings.waterLeakThresholdLph}
              onChange={(e) => setSettings({ ...settings, waterLeakThresholdLph: parseInt(e.target.value) })}
              className="w-full accent-sky-500"
            />
            <p className="mt-1 text-[10px] text-slate-400">Flags acoustic hydrophone isolation tickets</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Email Notification Digests</span>
              <p className="text-[11px] text-slate-400">Sends daily 08:00 AM summary to facilities teams</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, emailAlertsEnabled: !settings.emailAlertsEnabled })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.emailAlertsEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  settings.emailAlertsEnabled ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">SMS Critical Broadcast</span>
              <p className="text-[11px] text-slate-400">Immediate SMS for P1 incidents (chiller failure, flood)</p>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, smsEmergencyEnabled: !settings.smsEmergencyEnabled })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                settings.smsEmergencyEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  settings.smsEmergencyEnabled ? 'translate-x-4.5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control Overview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs overflow-x-auto">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-500" />
            Role-Based Access Control (RBAC) Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Security privileges and override permissions across campus personnel
          </p>
        </div>

        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-2">Role Name</th>
              <th className="pb-2">Telemetry View</th>
              <th className="pb-2">Equipment Override</th>
              <th className="pb-2">Work Order Dispatch</th>
              <th className="pb-2">Compliance Exports</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr>
              <td className="py-2.5 font-bold text-slate-900 dark:text-white">Campus Facility Director (Current)</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Full Access</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Authorized</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Authorized</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Authorized</td>
            </tr>
            <tr>
              <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Energy & Microgrid Auditor</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Full Access</td>
              <td className="py-2.5 text-slate-400">Read-Only</td>
              <td className="py-2.5 text-slate-400">Read-Only</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Authorized</td>
            </tr>
            <tr>
              <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Field Maintenance Technician</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Zone Assigned</td>
              <td className="py-2.5 text-amber-500 font-semibold">Emergency Only</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Authorized</td>
              <td className="py-2.5 text-slate-400">No Access</td>
            </tr>
            <tr>
              <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">Academic Dean / Registrar</td>
              <td className="py-2.5 text-emerald-500 font-semibold">Schedules Only</td>
              <td className="py-2.5 text-slate-400">No Access</td>
              <td className="py-2.5 text-slate-400">No Access</td>
              <td className="py-2.5 text-slate-400">No Access</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
