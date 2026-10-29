'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem, AuthUser } from '@/types/campus';
import { mockNotifications } from '@/lib/mockData';
import { campusWebSocket } from '@/lib/websocket';
import { CampusAPI } from '@/lib/api';

interface CampusContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  currentUser: AuthUser | null;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  liveEnergyKw: number;
  liveWaterLpm: number;
  isLiveConnected: boolean;
  dataSourceLabel: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedZone, setSelectedZone] = useState<string>('All Campus Zones');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Live telemetry pulse states
  const [liveEnergyKw, setLiveEnergyKw] = useState<number>(1428.5);
  const [liveWaterLpm, setLiveWaterLpm] = useState<number>(184.2);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('[SIMULATED TELEMETRY]');

  // Initialize theme and current user from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('campusos-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }

    const user = CampusAPI.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('campusos-theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const loginUser = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await CampusAPI.login(email, pass);
      setCurrentUser(res.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const logoutUser = () => {
    CampusAPI.logout();
    setCurrentUser(null);
  };

  // Keyboard shortcut for Command Palette (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Subscribe to WebSocket telemetry updates
  useEffect(() => {
    campusWebSocket.connect();
    const unsubscribe = campusWebSocket.subscribe((data) => {
      if (data.type === 'TELEMETRY_PULSE') {
        if (data.liveDemandKw) {
          setLiveEnergyKw(data.liveDemandKw as number);
        } else if (data.deltaKw) {
          setLiveEnergyKw((prev) => Math.round((prev + (data.deltaKw as number)) * 10) / 10);
        }

        if (data.liveWaterLpm) {
          setLiveWaterLpm(data.liveWaterLpm as number);
        } else if (data.deltaWater) {
          setLiveWaterLpm((prev) => Math.round((prev + (data.deltaWater as number)) * 10) / 10);
        }

        setIsLiveConnected(Boolean(data.connectedToLiveServer));
        if (data.dataSource) {
          setDataSourceLabel(data.dataSource as string);
        }
      }
    });

    return () => {
      unsubscribe();
      campusWebSocket.disconnect();
    };
  }, []);

  const markNotificationAsRead = (id: string) => {
    CampusAPI.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    CampusAPI.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <CampusContext.Provider
      value={{
        theme,
        toggleTheme,
        selectedZone,
        setSelectedZone,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        currentUser,
        loginUser,
        logoutUser,
        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        liveEnergyKw,
        liveWaterLpm,
        isLiveConnected,
        dataSourceLabel,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileSidebarOpen,
        setMobileSidebarOpen
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = (): CampusContextType => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
