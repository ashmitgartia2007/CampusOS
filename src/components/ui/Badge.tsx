import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'cyan';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-500/20'
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-500/20'
    },
    danger: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-500/20'
    },
    info: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
      border: 'border-blue-500/20'
    },
    neutral: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/15',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
      border: 'border-purple-500/20'
    },
    cyan: {
      bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      text: 'text-cyan-700 dark:text-cyan-300',
      dot: 'bg-cyan-400',
      border: 'border-cyan-500/20'
    }
  };

  const current = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} font-medium tracking-wide transition-colors ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${current.dot} animate-pulse`} />}
      {children}
    </span>
  );
};
