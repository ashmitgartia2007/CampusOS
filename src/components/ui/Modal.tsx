'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClass} rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition-all duration-200 animate-in zoom-in-95`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
