'use client';

import React from 'react';
import { CampusProvider, useCampus } from '@/context/CampusContext';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

const DashboardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarCollapsed } = useCampus();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <TopNavbar />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CampusProvider>
      <DashboardContent>{children}</DashboardContent>
    </CampusProvider>
  );
};
