'use client';

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Zap,
  Droplets,
  MapPin,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { NotificationPanel } from './NotificationPanel';
import { CommandPalette } from './CommandPalette';
import { AuthModal } from './AuthModal';

const campusZones = [
  'All Campus Zones',
  'North Tech Quad',
  'Central Arts & Science',
  'South Residential',
  'East Athletics'
];

export const TopNavbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    selectedZone,
    setSelectedZone,
    setIsCommandPaletteOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    unreadCount,
    liveEnergyKw,
    liveWaterLpm,
    isLiveConnected,
    dataSourceLabel,
    sidebarCollapsed,
    setMobileSidebarOpen
  } = useCampus();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isZoneOpen, setIsZoneOpen] = useState(false);

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md transition-all duration-300 ${
          sidebarCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'
        }`}
      >
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          {/* Left section: Hamburger (mobile) + Zone selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Campus Zone Selector */}
            <div className="relative">
              <button
                onClick={() => setIsZoneOpen(!isZoneOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{selectedZone}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isZoneOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsZoneOpen(false)} />
                  <div className="absolute left-0 top-10 z-50 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl animate-in fade-in">
                    {campusZones.map((zone) => (
                      <button
                        key={zone}
                        onClick={() => {
                          setSelectedZone(zone);
                          setIsZoneOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                          selectedZone === zone
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Real-time Telemetry Pill (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Grid:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {liveEnergyKw.toFixed(1)} kW
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-sky-500" />
                <span>Water:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {liveWaterLpm.toFixed(1)} L/m
                </span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium transition-all ${
                  isLiveConnected
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
                title={isLiveConnected ? 'Connected to FastAPI WebSocket /ws/telemetry [SIMULATED TELEMETRY]' : 'Offline simulated pulse active [SIMULATED TELEMETRY]'}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
                <span>{isLiveConnected ? 'WS LIVE' : 'SIMULATED'}</span>
              </div>
              <span className="hidden xl:inline-block text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                [SIMULATED DATA]
              </span>
            </div>
          </div>

          {/* Right section: Search trigger, Theme Toggle, Notification Bell, User Card */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shadow-2xs"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search CampusOS...</span>
              <kbd className="hidden sm:inline-block rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="Notifications & Alerts"
                aria-label="Campus Alerts"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>

            {/* User Profile Pill (Click to open AuthModal) */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-2 sm:pl-3 hover:opacity-80 transition-opacity text-left"
              title="Click to switch role or manage credentials"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs shadow-xs">
                {currentUser?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ER'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  {currentUser?.fullName || 'Dr. Evelyn Reed'}
                  <UserCheck className="h-3 w-3 text-sky-500" />
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser ? `${currentUser.role} Access` : 'Facilities Director'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette />

      {/* RBAC Authentication Modal */}
      <AuthModal />
    </>
  );
};
