import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trendPct?: number;
  trendLabel?: string;
  trendFavorable?: 'higher' | 'lower' | 'neutral'; // Whether higher is better or worse
  subtitle?: string;
  accentColor?: 'sky' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'rose' | 'cyan';
  isLive?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trendPct,
  trendLabel,
  trendFavorable = 'higher',
  subtitle,
  accentColor = 'sky',
  isLive = false
}) => {
  const accentMap = {
    sky: 'from-sky-500/10 via-sky-500/5 to-transparent text-sky-500 border-sky-500/20 dark:border-sky-500/30',
    emerald: 'from-emerald-500/10 via-emerald-500/5 to-transparent text-emerald-500 border-emerald-500/20 dark:border-emerald-500/30',
    amber: 'from-amber-500/10 via-amber-500/5 to-transparent text-amber-500 border-amber-500/20 dark:border-amber-500/30',
    indigo: 'from-indigo-500/10 via-indigo-500/5 to-transparent text-indigo-500 border-indigo-500/20 dark:border-indigo-500/30',
    purple: 'from-purple-500/10 via-purple-500/5 to-transparent text-purple-500 border-purple-500/20 dark:border-purple-500/30',
    rose: 'from-rose-500/10 via-rose-500/5 to-transparent text-rose-500 border-rose-500/20 dark:border-rose-500/30',
    cyan: 'from-cyan-500/10 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/20 dark:border-cyan-500/30'
  };

  const iconBgMap = {
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
  };

  // Determine trend color
  let trendColor = 'text-slate-500 dark:text-slate-400';
  let TrendIcon = Minus;

  if (trendPct !== undefined && trendPct !== 0) {
    const isPositive = trendPct > 0;
    TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

    if (trendFavorable === 'higher') {
      trendColor = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    } else if (trendFavorable === 'lower') {
      trendColor = isPositive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';
    } else {
      trendColor = 'text-blue-600 dark:text-blue-400';
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-800/80 backdrop-blur-sm group`}>
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${accentMap[accentColor]} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`rounded-xl border p-2.5 ${iconBgMap[accentColor]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(trendPct !== undefined || subtitle) && (
        <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 text-xs">
          {trendPct !== undefined ? (
            <div className={`flex items-center gap-1 font-semibold ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>
                {trendPct > 0 ? `+${trendPct}%` : `${trendPct}%`}
              </span>
              {trendLabel && (
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  {trendLabel}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          {subtitle && (
            <span className="truncate text-slate-400 dark:text-slate-400 text-[11px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
