'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  DoorOpen,
  Zap,
  Droplets,
  Trash2,
  Wrench,
  BrainCircuit,
  FileBarChart2,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { mockBuildings, mockRooms, mockMaintenanceOrders } from '@/lib/mockData';

interface SearchResult {
  id: string;
  category: 'Navigation' | 'Building' | 'Room' | 'Work Order';
  title: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useCampus();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchableItems: SearchResult[] = useMemo(() => {
    const list: SearchResult[] = [
      { id: 'p-overview', category: 'Navigation', title: 'Campus Overview Dashboard', subtitle: 'Executive command center & KPI summaries', href: '/', icon: Building2 },
      { id: 'p-energy', category: 'Navigation', title: 'Energy & Microgrid Management', subtitle: 'Solar PV, battery storage, and peak demand', href: '/energy', icon: Zap },
      { id: 'p-water', category: 'Navigation', title: 'Water & Distribution Networks', subtitle: 'Acoustic leak detection and reservoir monitoring', href: '/water', icon: Droplets },
      { id: 'p-waste', category: 'Navigation', title: 'Waste & Recycling Analytics', subtitle: 'Smart bin fill rates and route optimization', href: '/waste', icon: Trash2 },
      { id: 'p-buildings', category: 'Navigation', title: 'Campus Buildings Directory', subtitle: 'Real-time telemetry and energy star ratings', href: '/buildings', icon: Building2 },
      { id: 'p-rooms', category: 'Navigation', title: 'Classrooms & Laboratories', subtitle: 'IoT climate controls, occupancy and schedules', href: '/rooms', icon: DoorOpen },
      { id: 'p-environment', category: 'Navigation', title: 'Campus Environment & Air Quality', subtitle: 'Microclimate nodes, PM2.5, and heat island tracking', href: '/environment', icon: Droplets },
      { id: 'p-maintenance', category: 'Navigation', title: 'Predictive Maintenance & Work Orders', subtitle: 'Scikit-learn RUL predictions and technician dispatch', href: '/maintenance', icon: Wrench },
      { id: 'p-analytics', category: 'Navigation', title: 'AI Analytics & What-If Simulator', subtitle: 'Gradient boosted energy load forecasting', href: '/analytics', icon: BrainCircuit },
      { id: 'p-reports', category: 'Navigation', title: 'ESG Sustainability & Compliance Reports', subtitle: 'Scope 1/2/3 carbon accounting exports', href: '/reports', icon: FileBarChart2 },
      { id: 'p-settings', category: 'Navigation', title: 'CampusOS Settings & Gateway Integrations', subtitle: 'FastAPI, PostgreSQL & WebSocket endpoints', href: '/settings', icon: Settings },
    ];

    // Add buildings
    mockBuildings.forEach(b => {
      list.push({
        id: `b-${b.id}`,
        category: 'Building',
        title: `${b.name} (${b.code})`,
        subtitle: `${b.zone} • ${b.currentOccupancy} occupants • ${b.energyUsageKw} kW`,
        href: `/buildings?id=${b.id}`,
        icon: Building2
      });
    });

    // Add rooms
    mockRooms.forEach(r => {
      list.push({
        id: `r-${r.id}`,
        category: 'Room',
        title: `${r.name} (${r.roomNumber})`,
        subtitle: `${r.buildingName} • ${r.type} • ${r.currentOccupancy}/${r.capacity} people`,
        href: `/rooms?id=${r.id}`,
        icon: DoorOpen
      });
    });

    // Add maintenance orders
    mockMaintenanceOrders.forEach(o => {
      list.push({
        id: `wo-${o.id}`,
        category: 'Work Order',
        title: `${o.ticketNumber}: ${o.title}`,
        subtitle: `${o.building} • ${o.severity} • ${o.assignedTo}`,
        href: `/maintenance?id=${o.id}`,
        icon: Wrench
      });
    });

    return list;
  }, []);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchableItems.slice(0, 8);
    const q = query.toLowerCase();
    return searchableItems
      .filter(item => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, searchableItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item: SearchResult) => {
    setIsCommandPaletteOpen(false);
    setQuery('');
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search campus buildings, labs, energy assets, work orders, or jump to page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between rounded-xl p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`rounded-lg p-2 ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isSelected ? 'opacity-100 translate-x-1' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigate: <kbd className="rounded border border-slate-200 dark:border-slate-700 px-1">↑</kbd> <kbd className="rounded border border-slate-200 dark:border-slate-700 px-1">↓</kbd></span>
            <span>Select: <kbd className="rounded border border-slate-200 dark:border-slate-700 px-1">↵</kbd></span>
          </div>
          <span>CampusOS AI Search Index</span>
        </div>
      </div>
    </div>
  );
};
