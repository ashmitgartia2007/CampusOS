'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Filter,
  Grid,
  List,
  Zap,
  Droplets,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CampusAPI } from '@/lib/api';
import { Building } from '@/types/campus';
import { mockBuildings } from '@/lib/mockData';

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);

  // Modal & Form state for creating a new facility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Academic' as Building['category'],
    zone: 'North Tech Quad' as Building['zone'],
    floors: 3,
    grossAreaSqFt: 65000,
    maxCapacity: 600,
    energyUsageKw: 185.0,
    waterDrawLpm: 24.5,
    indoorTempC: 22.0,
    co2Ppm: 580,
    aqi: 32,
    energyStarScore: 88,
    status: 'optimal' as Building['status'],
    hvacStatus: 'Optimized' as Building['hvacStatus']
  });

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const data = await CampusAPI.getBuildings();
      setBuildings(data);
    } catch {
      setBuildings(mockBuildings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) return;

    try {
      setIsSubmitting(true);
      const created = await CampusAPI.createBuilding({
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        category: formData.category,
        zone: formData.zone,
        floors: Number(formData.floors),
        grossAreaSqFt: Number(formData.grossAreaSqFt),
        currentOccupancy: 0,
        maxCapacity: Number(formData.maxCapacity),
        energyUsageKw: Number(formData.energyUsageKw),
        waterDrawLpm: Number(formData.waterDrawLpm),
        indoorTempC: Number(formData.indoorTempC),
        co2Ppm: Number(formData.co2Ppm),
        aqi: Number(formData.aqi),
        energyStarScore: Number(formData.energyStarScore),
        status: formData.status,
        hvacStatus: formData.hvacStatus
      });

      setBuildings((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`Facility '${created.name}' (${created.code}) successfully registered and persisted!`);

      // Reset form
      setFormData({
        code: '',
        name: '',
        category: 'Academic',
        zone: 'North Tech Quad',
        floors: 3,
        grossAreaSqFt: 65000,
        maxCapacity: 600,
        energyUsageKw: 185.0,
        waterDrawLpm: 24.5,
        indoorTempC: 22.0,
        co2Ppm: 580,
        aqi: 32,
        energyStarScore: 88,
        status: 'optimal',
        hvacStatus: 'Optimized'
      });
    } catch (err: any) {
      showToast(`Error creating facility: ${err.message || 'Operation failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBuilding = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to decommission facility '${name}'? This action will remove all room associations.`)) {
      return;
    }
    try {
      await CampusAPI.deleteBuilding(id);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
      if (activeBuilding?.id === id) setActiveBuilding(null);
      showToast(`Facility '${name}' decommissioned successfully.`);
    } catch (err: any) {
      showToast(`Failed to delete facility: ${err.message || 'Error'}`);
    }
  };

  const handleStatusToggle = async (building: Building, newStatus: Building['status']) => {
    try {
      const updated = await CampusAPI.updateBuilding(building.id, { status: newStatus });
      setBuildings((prev) => prev.map((b) => (b.id === building.id ? updated : b)));
      if (activeBuilding?.id === building.id) setActiveBuilding(updated);
      showToast(`Facility '${building.name}' status set to ${newStatus}.`);
    } catch (err: any) {
      showToast(`Failed to update status: ${err.message}`);
    }
  };

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = selectedZone === 'All' || b.zone === selectedZone;
      const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
      return matchesSearch && matchesZone && matchesCategory;
    });
  }, [buildings, searchTerm, selectedZone, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campus Buildings Directory & Infrastructure
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time mechanical plants, energy star performance, climate automation, and occupancy loads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="sm">
            {buildings.length} Monitored Facilities
          </Badge>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Facility</span>
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            {actionFeedback}
          </span>
          <button onClick={() => setActionFeedback(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by facility name or code (e.g. ENG-A)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Zones</option>
            <option value="North Tech Quad">North Tech Quad</option>
            <option value="Central Arts & Science">Central Arts & Science</option>
            <option value="South Residential">South Residential</option>
            <option value="East Athletics">East Athletics</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Research">Research</option>
            <option value="Residential">Residential</option>
            <option value="Administration">Administration</option>
            <option value="Student Life">Student Life</option>
            <option value="Athletics">Athletics</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-2xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`rounded-lg p-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-2xs'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Buildings List Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mb-2" />
          <p className="text-xs">Querying persistent campus buildings from database...</p>
        </div>
      ) : filteredBuildings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
          <Building2 className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No facilities match criteria</p>
          <p className="text-xs mt-1">Try adjusting search query or zone filter, or register a new facility above.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBuildings.map((building) => {
            const occupancyPct = Math.round((building.currentOccupancy / building.maxCapacity) * 100);
            return (
              <div
                key={building.id}
                className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-sky-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                          {building.code}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] text-slate-400">{building.category}</span>
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 dark:text-white text-base group-hover:text-sky-500 transition-colors">
                        {building.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">{building.zone}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <Badge
                        variant={
                          building.status === 'optimal'
                            ? 'success'
                            : building.status === 'warning'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {building.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {building.floors} Floors
                      </span>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Live Occupancy</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-white">
                        {building.currentOccupancy} / {building.maxCapacity} ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct > 85 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Metric Badges */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-center">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span>Power</span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {building.energyUsageKw} kW
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <Droplets className="h-3 w-3 text-sky-500" />
                        <span>Water</span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {building.waterDrawLpm} L/m
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
                        <Thermometer className="h-3 w-3 text-rose-500" />
                        <span>Temp</span>
                      </div>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {building.indoorTempC}°C
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Drilldown and Delete Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Energy Star {building.energyStarScore}/100</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteBuilding(building.id, building.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Decommission Facility"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveBuilding(building)}
                      className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      Drilldown <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Facility</th>
                <th className="pb-3">Zone</th>
                <th className="pb-3">Occupancy</th>
                <th className="pb-3">Power Draw</th>
                <th className="pb-3">Water Draw</th>
                <th className="pb-3">Indoor Temp</th>
                <th className="pb-3">Star Score</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredBuildings.map((building) => (
                <tr key={building.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3">
                    <span className="font-bold text-slate-900 dark:text-white">{building.name}</span>
                    <span className="block text-[11px] text-slate-400">{building.code} • {building.category}</span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{building.zone}</td>
                  <td className="py-3 font-mono">
                    {building.currentOccupancy} / {building.maxCapacity} ({Math.round((building.currentOccupancy / building.maxCapacity) * 100)}%)
                  </td>
                  <td className="py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{building.energyUsageKw} kW</td>
                  <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{building.waterDrawLpm} L/m</td>
                  <td className="py-3 font-mono">{building.indoorTempC}°C</td>
                  <td className="py-3 font-bold text-emerald-500 font-mono">{building.energyStarScore}/100</td>
                  <td className="py-3">
                    <Badge variant={building.status === 'optimal' ? 'success' : building.status === 'warning' ? 'warning' : 'danger'} size="sm">
                      {building.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDeleteBuilding(building.id, building.name)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete facility"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveBuilding(building)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Building Details Modal */}
      {activeBuilding && (
        <Modal
          isOpen={Boolean(activeBuilding)}
          onClose={() => setActiveBuilding(null)}
          title={activeBuilding.name}
          description={`${activeBuilding.code} • ${activeBuilding.zone} • ${activeBuilding.grossAreaSqFt.toLocaleString()} sq ft`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-[10px] text-slate-400">Total Floors</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{activeBuilding.floors} Levels</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-[10px] text-slate-400">CO2 Concentration</p>
                <p className="text-base font-bold text-emerald-600 font-mono">{activeBuilding.co2Ppm} ppm</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-[10px] text-slate-400">AQI Rating</p>
                <p className="text-base font-bold text-sky-500 font-mono">{activeBuilding.aqi} (Clean)</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
                <p className="text-[10px] text-slate-400">HVAC Automation</p>
                <p className="text-base font-bold text-amber-500">{activeBuilding.hvacStatus}</p>
              </div>
            </div>

            {/* Quick Status Control */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Operational Status Setpoint:</span>
                <span className="ml-2 text-slate-400 capitalize">{activeBuilding.status}</span>
              </div>
              <div className="flex gap-1.5">
                {(['optimal', 'warning', 'alert'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusToggle(activeBuilding, st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors capitalize ${
                      activeBuilding.status === st
                        ? 'bg-sky-600 text-white'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-sky-500" />
                Floor-by-Floor Automation Status
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Floor 1 (Atrium & Auditoriums):</span>
                  <span className="font-semibold text-emerald-500">HVAC Active • Air Quality Optimal</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Floor 2 (Specialized Research Labs):</span>
                  <span className="font-semibold text-sky-500">Positive Pressure Active • HEPA Filtration</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Floor 3 (Offices & Seminar Rooms):</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Eco Standby Mode</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Roof Mechanical:</span>
                  <span className="font-semibold text-amber-500">Chillers 1 & 3 Online • Solar String 1-4 Active</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleDeleteBuilding(activeBuilding.id, activeBuilding.name)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Decommission</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveBuilding(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                <Link
                  href={`/rooms?buildingId=${activeBuilding.id}`}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
                >
                  Manage Rooms in this Building →
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Facility Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Register New Campus Facility"
          description="Commission an infrastructure asset and link BACnet energy submetering"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateBuilding} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Facility Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BIO-C or LAW-1"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life Sciences Annex"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Campus Zone
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value as any })}
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
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Academic">Academic</option>
                  <option value="Research">Research</option>
                  <option value="Residential">Residential</option>
                  <option value="Administration">Administration</option>
                  <option value="Athletics">Athletics</option>
                  <option value="Student Life">Student Life</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Total Levels / Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.floors}
                  onChange={(e) => setFormData({ ...formData, floors: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Gross Area (sq ft)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={formData.grossAreaSqFt}
                  onChange={(e) => setFormData({ ...formData, grossAreaSqFt: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Max Occupancy Capacity
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  HVAC Strategy
                </label>
                <select
                  value={formData.hvacStatus}
                  onChange={(e) => setFormData({ ...formData, hvacStatus: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Optimized">Optimized</option>
                  <option value="Heating">Heating</option>
                  <option value="Cooling">Cooling</option>
                  <option value="Eco Standby">Eco Standby</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
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
                <span>Commission Facility</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
