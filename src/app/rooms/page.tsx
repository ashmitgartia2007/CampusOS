'use client';

import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Search,
  Sliders,
  Thermometer,
  Lightbulb,
  Wind,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { CampusAPI } from '@/lib/api';
import { Room, Building } from '@/types/campus';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterBuilding, setFilterBuilding] = useState('All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Add Room Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    buildingId: 'b-eng',
    buildingName: 'Engineering Complex',
    roomNumber: '',
    name: '',
    type: 'Lecture Hall' as Room['type'],
    floor: 1,
    capacity: 40,
    temperatureC: 22.0,
    targetTempC: 22.0,
    humidityPct: 45.0,
    co2Ppm: 550,
    luxLevel: 420,
    lightingState: true,
    hvacMode: 'Comfort' as Room['hvacMode'],
    scheduleStatus: 'Available' as Room['scheduleStatus'],
    airQualityStatus: 'Good' as Room['airQualityStatus']
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, buildingsData] = await Promise.all([
        CampusAPI.getRooms(),
        CampusAPI.getBuildings()
      ]);
      setRooms(roomsData);
      setBuildings(buildingsData);
      if (buildingsData.length > 0) {
        setNewRoomData((prev) => ({
          ...prev,
          buildingId: buildingsData[0].id,
          buildingName: buildingsData[0].name
        }));
      }
    } catch {
      // offline fallback handled by CampusAPI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTempAdjust = async (roomId: string, delta: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const newTarget = Math.round((room.targetTempC + delta) * 10) / 10;
    const updated = await CampusAPI.updateRoomControl(roomId, { targetTempC: newTarget });
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    showToast(`Setpoint updated to ${newTarget}°C in ${room.name}.`);
  };

  const handleLightingToggle = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const updated = await CampusAPI.updateRoomControl(roomId, { lightingState: !room.lightingState });
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    showToast(`Smart lighting ${!room.lightingState ? 'turned ON' : 'turned OFF'} in ${room.name}.`);
  };

  const handleHvacModeChange = async (roomId: string, mode: Room['hvacMode']) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    const updated = await CampusAPI.updateRoomControl(roomId, { hvacMode: mode });
    setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));
    showToast(`HVAC mode set to ${mode} in ${room.name}.`);
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomData.roomNumber || !newRoomData.name) return;

    try {
      setIsSubmitting(true);
      const selectedB = buildings.find((b) => b.id === newRoomData.buildingId);
      const bName = selectedB ? selectedB.name : newRoomData.buildingName;

      const created = await CampusAPI.createRoom({
        ...newRoomData,
        buildingName: bName,
        currentOccupancy: 0,
        floor: Number(newRoomData.floor),
        capacity: Number(newRoomData.capacity)
      });

      setRooms((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      showToast(`Room ${created.roomNumber} (${created.name}) created and synced with BACnet!`);

      // Reset
      setNewRoomData((prev) => ({
        ...prev,
        roomNumber: '',
        name: '',
        type: 'Lecture Hall',
        floor: 1,
        capacity: 40
      }));
    } catch (err: any) {
      showToast(`Error creating room: ${err.message || 'Failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Are you sure you want to remove ${roomName} from campus telemetry?`)) return;
    try {
      await CampusAPI.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      showToast(`Room ${roomName} deleted successfully.`);
    } catch (err: any) {
      showToast(`Failed to delete room: ${err.message}`);
    }
  };

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.buildingName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || r.type === filterType;
    const matchesBuilding = filterBuilding === 'All' || r.buildingId === filterBuilding;
    return matchesSearch && matchesType && matchesBuilding;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Classrooms, Labs & IoT Climate Controls
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Precision microclimate thermostats, daylight harvesting, and real-time room occupancy scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" dot size="sm">
            {rooms.length} Active Nodes Online
          </Badge>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Room / Lab</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 dark:bg-sky-500/20 p-3.5 text-xs font-medium text-sky-800 dark:text-sky-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-500 shrink-0" />
            {actionMessage}
          </span>
          <button onClick={() => setActionMessage(null)} className="text-xs text-sky-600 hover:underline">
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
              placeholder="Search by room name, number, or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Building Filter */}
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Facilities</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          {/* Room Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="All">All Types</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Computer Lab">Computer Lab</option>
            <option value="Bio-Chemistry Lab">Bio-Chemistry Lab</option>
            <option value="Robotics Lab">Robotics Lab</option>
            <option value="Seminar Room">Seminar Room</option>
            <option value="Faculty Office">Faculty Office</option>
            <option value="Server Room">Server Room</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mb-2" />
          <p className="text-xs">Connecting to BACnet room sensors...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
          <DoorOpen className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No rooms match filter criteria</p>
          <p className="text-xs mt-1">Try resetting search or click &apos;Add Room / Lab&apos; to register a space.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const occupancyPct = Math.round((room.currentOccupancy / room.capacity) * 100);

            return (
              <div
                key={room.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-sky-500/50 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                          {room.roomNumber}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] text-slate-400">Floor {room.floor}</span>
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 dark:text-white text-base">
                        {room.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">{room.buildingName}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          room.airQualityStatus === 'Excellent' || room.airQualityStatus === 'Good'
                            ? 'success'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {room.type}
                      </Badge>
                      <button
                        onClick={() => handleDeleteRoom(room.id, `${room.roomNumber} - ${room.name}`)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Occupancy and Schedule Status */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/40 px-3 py-2 text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Occupancy:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white font-mono">
                      {room.currentOccupancy} / {room.capacity} ({occupancyPct}%)
                    </span>
                  </div>

                  {/* Microclimate Telemetry Readouts */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                      <p className="text-[10px] text-slate-400">Room Temp</p>
                      <p className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {room.temperatureC}°C
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                      <p className="text-[10px] text-slate-400">CO2 Level</p>
                      <p className="text-xs font-bold font-mono text-emerald-500 mt-0.5">
                        {room.co2Ppm} ppm
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-2">
                      <p className="text-[10px] text-slate-400">Ambient Light</p>
                      <p className="text-xs font-bold font-mono text-amber-500 mt-0.5">
                        {room.luxLevel} lux
                      </p>
                    </div>
                  </div>

                  {/* Interactive Controls Section */}
                  <div className="mt-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {/* Thermostat Setpoint */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                        Target Setpoint:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTempAdjust(room.id, -0.5)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Lower setpoint 0.5°C"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono font-bold text-slate-900 dark:text-white w-12 text-center">
                          {room.targetTempC.toFixed(1)}°C
                        </span>
                        <button
                          onClick={() => handleTempAdjust(room.id, 0.5)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Raise setpoint 0.5°C"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Smart Lighting Toggle */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Lightbulb className={`h-3.5 w-3.5 ${room.lightingState ? 'text-amber-500' : 'text-slate-400'}`} />
                        Automated Lighting:
                      </span>
                      <button
                        onClick={() => handleLightingToggle(room.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          room.lightingState ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            room.lightingState ? 'translate-x-4.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* HVAC Mode Selector */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Wind className="h-3.5 w-3.5 text-sky-500" />
                        HVAC Profile:
                      </span>
                      <div className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
                        {(['Eco', 'Comfort', 'Boost'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleHvacModeChange(room.id, mode)}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-all ${
                              room.hvacMode === mode
                                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-2xs'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Classroom, Lab, or Office Space"
          description="Register space in campus directory and initialize BACnet microclimate profile"
          maxWidth="lg"
        >
          <form onSubmit={handleAddRoom} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Host Facility *
                </label>
                <select
                  value={newRoomData.buildingId}
                  onChange={(e) => {
                    const b = buildings.find((x) => x.id === e.target.value);
                    setNewRoomData({
                      ...newRoomData,
                      buildingId: e.target.value,
                      buildingName: b ? b.name : ''
                    });
                  }}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Room Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 204B or LAB-110"
                  value={newRoomData.roomNumber}
                  onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Room Name / Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantum Computing Lab"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Room Type
                </label>
                <select
                  value={newRoomData.type}
                  onChange={(e) => setNewRoomData({ ...newRoomData, type: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Bio-Chemistry Lab">Bio-Chemistry Lab</option>
                  <option value="Robotics Lab">Robotics Lab</option>
                  <option value="Seminar Room">Seminar Room</option>
                  <option value="Faculty Office">Faculty Office</option>
                  <option value="Server Room">Server Room</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Floor Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={newRoomData.floor}
                  onChange={(e) => setNewRoomData({ ...newRoomData, floor: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newRoomData.capacity}
                  onChange={(e) => setNewRoomData({ ...newRoomData, capacity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Default Target Setpoint (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="16"
                  max="30"
                  value={newRoomData.targetTempC}
                  onChange={(e) => setNewRoomData({ ...newRoomData, targetTempC: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  HVAC Initial Profile
                </label>
                <select
                  value={newRoomData.hvacMode}
                  onChange={(e) => setNewRoomData({ ...newRoomData, hvacMode: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Comfort">Comfort</option>
                  <option value="Eco">Eco</option>
                  <option value="Boost">Boost</option>
                </select>
              </div>
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
                <span>Commission Room</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
