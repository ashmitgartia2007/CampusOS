'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Droplets,
  Trash2,
  Building2,
  DoorOpen,
  CloudSun,
  Wrench,
  BrainCircuit,
  FileBarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  X
} from 'lucide-react';
import { useCampus } from '@/context/CampusContext';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'blue' | 'amber' | 'emerald';
}

export const navItems: NavItem[] = [
  { title: 'Overview', href: '/', icon: LayoutDashboard },
  { title: 'Energy & Grid', href: '/energy', icon: Zap },
  { title: 'Water & Utilities', href: '/water', icon: Droplets },
  { title: 'Waste & Recycling', href: '/waste', icon: Trash2 },
  { title: 'Buildings', href: '/buildings', icon: Building2 },
  { title: 'Rooms & Labs', href: '/rooms', icon: DoorOpen },
  { title: 'Environment & AQI', href: '/environment', icon: CloudSun },
  { title: 'Maintenance', href: '/maintenance', icon: Wrench, badge: 3, badgeVariant: 'amber' },
  { title: 'AI Analytics', href: '/analytics', icon: BrainCircuit, badge: 'ML', badgeVariant: 'emerald' },
  { title: 'Reports & ESG', href: '/reports', icon: FileBarChart2 },
  { title: 'Settings', href: '/settings', icon: Settings }
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    isLiveConnected
  } = useCampus();

  const toggleCollapsed = () => setSidebarCollapsed((prev) => !prev);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                  CampusOS <span className="rounded bg-sky-500/10 dark:bg-sky-500/20 px-1 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">AI</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 truncate">
                  Smart University OS
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.badgeVariant === 'amber'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : item.badgeVariant === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        {/* Live IoT Node Pulse */}
        {!sidebarCollapsed && (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                IoT Mesh Gateway
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isLiveConnected ? 'ONLINE' : 'SIMULATED'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-400">
              1,420 nodes streaming • 99.8% uptime
            </p>
          </div>
        )}

        {/* Desktop Collapse / Expand Toggle */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950/80 backdrop-blur-md ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
