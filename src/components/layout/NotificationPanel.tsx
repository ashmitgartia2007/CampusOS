'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { CheckCheck, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useCampus } from '@/context/CampusContext';
import { Severity } from '@/types/campus';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useCampus();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const severityIcon = (sev: Severity) => {
    switch (sev) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Campus Alerts</h4>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No active notifications.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                !item.isRead ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {severityIcon(item.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${!item.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      onClick={onClose}
                      className="mt-2 inline-flex items-center text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      View details →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-b-2xl text-center">
        <Link
          href="/maintenance"
          onClick={onClose}
          className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-500"
        >
          View All Maintenance & System Logs →
        </Link>
      </div>
    </div>
  );
};
