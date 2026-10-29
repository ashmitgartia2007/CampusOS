'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  BrainCircuit,
  User,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CampusAPI } from '@/lib/api';
import { MaintenanceOrder } from '@/types/campus';

export default function MaintenancePage() {
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New ticket form state
  const [newTitle, setNewTitle] = useState('');
  const [newAsset, setNewAsset] = useState('');
  const [newBuilding, setNewBuilding] = useState('Ada Lovelace Engineering Complex');
  const [newSeverity, setNewSeverity] = useState<MaintenanceOrder['severity']>('P3-Normal');
  const [newCategory, setNewCategory] = useState<MaintenanceOrder['category']>('HVAC');
  const [newTechnician, setNewTechnician] = useState('Carlos Vance (Lead HVAC Specialist)');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    CampusAPI.getMaintenanceOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleStatusChange = async (id: string, newStatus: MaintenanceOrder['status']) => {
    try {
      const updated = await CampusAPI.updateMaintenanceStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`Work order ${updated.ticketNumber} marked as ${newStatus}.`);
    } catch {
      // ignore
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAsset.trim()) return;

    const created = await CampusAPI.createMaintenanceOrder({
      title: newTitle,
      assetId: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      assetName: newAsset,
      building: newBuilding,
      floor: 'Level 1 Facility Plant',
      severity: newSeverity,
      category: newCategory,
      assignedTo: newTechnician,
      dueDate: 'Tomorrow, 05:00 PM',
      status: 'Open',
      isPredictive: false,
      notes: newNotes || 'Routine dispatch scheduled via CampusOS.'
    });

    setOrders((prev) => [created, ...prev]);
    setIsModalOpen(false);
    showToast(`Work order ${created.ticketNumber} created and dispatched to ${created.assignedTo}.`);

    // Reset form
    setNewTitle('');
    setNewAsset('');
    setNewNotes('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.assetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || o.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Predictive Maintenance & Work Order Management
            </h1>
            <Badge variant="purple" dot size="sm">
              ML RUL PREDICTIONS
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Scikit-learn Remaining Useful Life (RUL) estimation, vibration anomaly detection, and automated technician dispatch.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm shadow-sky-600/30"
        >
          <Plus className="h-4 w-4" />
          <span>Create Work Order</span>
        </button>
      </div>

      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/20 p-3.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Work Orders"
          value={orders.filter((o) => o.status !== 'Resolved').length}
          unit="tickets"
          icon={Wrench}
          accentColor="sky"
          subtitle={`${orders.filter((o) => o.status === 'In Progress').length} in progress`}
        />

        <KpiCard
          title="Predictive AI Catches"
          value="82"
          unit="%"
          icon={BrainCircuit}
          accentColor="purple"
          trendPct={14.2}
          trendLabel="pre-failure"
          trendFavorable="higher"
          subtitle="Saved ~$48k in downtime"
        />

        <KpiCard
          title="Mean Time to Repair"
          value="3.4"
          unit="hours"
          icon={Clock}
          accentColor="emerald"
          trendPct={-18.0}
          trendLabel="faster MTTR"
          trendFavorable="lower"
          subtitle="Industry Avg: 6.2 hrs"
        />

        <KpiCard
          title="Asset Health Index"
          value="94.6"
          unit="/ 100"
          icon={Sparkles}
          accentColor="amber"
          subtitle="520 Critical Equipment Monitored"
        />
      </div>

      {/* Predictive Spotlight Callout */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Scikit-learn IsolationForest Anomaly Alert: York Chiller #2
                </h3>
                <Badge variant="danger" size="sm">
                  12 DAYS RUL ESTIMATE
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Harmonic 3X peak vibration (4.8 mm/s RMS) detected on compressor bearing assembly in Science Wing Roof Plant.
                Model confidence: 93.2%. Failure risk score: <strong>88%</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assigned: Carlos Vance
            </span>
            <Badge variant="warning">In Progress</Badge>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets, assets, buildings, or assigned staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Severities</option>
            <option value="P1-Critical">P1 - Critical</option>
            <option value="P2-High">P2 - High</option>
            <option value="P3-Normal">P3 - Normal</option>
            <option value="P4-Low">P4 - Low</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3">Ticket / Title</th>
              <th className="pb-3">Equipment Asset</th>
              <th className="pb-3">Location</th>
              <th className="pb-3">Severity</th>
              <th className="pb-3">Assigned Tech</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Wrench className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No work orders match criteria</p>
                  <p className="text-xs mt-1">Try resetting the filter or click &apos;Create Work Order&apos; above.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const sevVariant =
                  order.severity === 'P1-Critical'
                    ? 'danger'
                    : order.severity === 'P2-High'
                    ? 'warning'
                    : order.severity === 'P3-Normal'
                    ? 'info'
                    : 'neutral';

              return (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
                        {order.ticketNumber}
                      </span>
                      {order.isPredictive && (
                        <span className="rounded bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold text-purple-600 dark:text-purple-400">
                          AI RUL
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                      {order.title}
                    </span>
                    <span className="text-[10px] text-slate-400">Created {order.createdAt}</span>
                  </td>

                  <td className="py-3.5">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{order.assetName}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{order.assetId}</span>
                  </td>

                  <td className="py-3.5 text-slate-600 dark:text-slate-400">
                    <span>{order.building}</span>
                    <span className="block text-[10px] text-slate-400">{order.floor}</span>
                  </td>

                  <td className="py-3.5">
                    <Badge variant={sevVariant} size="sm">
                      {order.severity}
                    </Badge>
                  </td>

                  <td className="py-3.5 text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-400" />
                      {order.assignedTo.split('(')[0]}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <Badge
                      variant={
                        order.status === 'Resolved'
                          ? 'success'
                          : order.status === 'In Progress'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as MaintenanceOrder['status'])}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Facility Work Order"
        description="Dispatch maintenance personnel and schedule equipment remediation"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Order Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., AHU-3 VFD Contactor Replacement"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Equipment Asset Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., York Rooftop Chiller Unit #3"
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Facility
              </label>
              <select
                value={newBuilding}
                onChange={(e) => setNewBuilding(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Ada Lovelace Engineering Complex">Ada Lovelace Engineering Complex</option>
                <option value="Curie Science & Biotechnology Wing">Curie Science & Biotechnology Wing</option>
                <option value="Alexandria Central Library">Alexandria Central Library</option>
                <option value="Turing Student Union">Turing Student Union</option>
                <option value="Hawking East Residential Quad">Hawking East Residential Quad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Severity
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as MaintenanceOrder['severity'])}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="P1-Critical">P1 - Critical</option>
                <option value="P2-High">P2 - High</option>
                <option value="P3-Normal">P3 - Normal</option>
                <option value="P4-Low">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MaintenanceOrder['category'])}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="HVAC">HVAC</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Elevator">Elevator</option>
                <option value="IoT Sensor">IoT Sensor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Technician
              </label>
              <select
                value={newTechnician}
                onChange={(e) => setNewTechnician(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Carlos Vance (Lead HVAC Specialist)">Carlos Vance (HVAC)</option>
                <option value="Sarah Lin (Hydraulic Systems Tech)">Sarah Lin (Plumbing)</option>
                <option value="Elena Rostova (Renewable Power Tech)">Elena Rostova (Electrical)</option>
                <option value="Dave Kroll (Building Automation)">Dave Kroll (IoT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diagnostic Notes
            </label>
            <textarea
              rows={3}
              placeholder="Provide symptoms, sensor logs, or special instructions..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
