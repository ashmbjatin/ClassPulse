import React from 'react';
import type { RiskLevel, PerformanceTrend } from '../../types';
import { TrendingDown, TrendingUp, Minus, AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const styles: Record<RiskLevel, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    CRITICAL: {
      bg: '#fef2f2',
      text: '#991b1b',
      border: '#fecaca',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-700 inline mr-1 stroke-[2.2]" />
    },
    HIGH: {
      bg: '#fff7ed',
      text: '#c2410c',
      border: '#ffedd5',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-700 inline mr-1 stroke-[2.2]" />
    },
    MODERATE: {
      bg: '#fefce8',
      text: '#a16207',
      border: '#fef08a',
      icon: <AlertCircle className="w-3.5 h-3.5 text-yellow-700 inline mr-1 stroke-[2.2]" />
    },
    LOW: {
      bg: '#f0fdf4',
      text: '#166534',
      border: '#bbf7d0',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 inline mr-1 stroke-[2.2]" />
    }
  };

  const currentStyle = styles[level];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : size === 'lg' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center tracking-wide uppercase font-mono rounded ${sizeClasses}`}
      style={{
        backgroundColor: currentStyle.bg,
        color: currentStyle.text,
        border: `1px solid ${currentStyle.border}`
      }}
    >
      {currentStyle.icon}
      {level}
    </span>
  );
};

interface TrendIndicatorProps {
  trend: PerformanceTrend;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  if (trend === 'falling') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
        <TrendingDown className="w-3.5 h-3.5 mr-1" />
        Falling Marks
      </span>
    );
  }
  if (trend === 'improving') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <TrendingUp className="w-3.5 h-3.5 mr-1" />
        Improving
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
      <Minus className="w-3.5 h-3.5 mr-1" />
      Stable
    </span>
  );
};

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'safe';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  onClick
}) => {
  const variantStyles = {
    default: 'border-slate-200 bg-white text-slate-900',
    critical: 'border-red-300 bg-red-50/50 text-red-950',
    warning: 'border-amber-300 bg-amber-50/50 text-amber-950',
    safe: 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
  };

  const accentStyles = {
    default: 'text-slate-500',
    critical: 'text-red-700',
    warning: 'text-amber-700',
    safe: 'text-emerald-700'
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-md border shadow-sm transition-all ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:border-slate-400 hover:shadow' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {title}
        </span>
        {icon && <div className={accentStyles[variant]}>{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold font-mono tracking-tight">{value}</span>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
};
