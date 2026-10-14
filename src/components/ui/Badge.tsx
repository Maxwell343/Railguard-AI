import React from 'react';
import { cn } from '../../utils/cn';
import { DefectClass, DefectSeverity } from '../../types/inspection';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'neutral'
    | 'spalling'
    | 'wheel_burn'
    | 'squat'
    | 'severity-low'
    | 'severity-medium'
    | 'severity-high'
    | 'severity-critical'
    | 'status-verified'
    | 'status-action'
    | 'status-review'
    | 'status-archived';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-mono font-medium tracking-wide uppercase select-none border';

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  const variants = {
    neutral: 'bg-ivory-200 text-charcoal-800 border-rail-border-strong',
    spalling: 'bg-[#FDF4EF] text-[#A64522] border-[#E8A389]',
    wheel_burn: 'bg-[#FDF8EC] text-[#9A6214] border-[#DEC17B]',
    squat: 'bg-[#FDF2F0] text-[#9E241A] border-[#E8A29A]',

    // Severity badges
    'severity-low': 'bg-sage-200 text-sage-800 border-sage-300',
    'severity-medium': 'bg-[#FDF8EC] text-[#9A6214] border-[#DEC17B]',
    'severity-high': 'bg-[#FDF4EF] text-[#A64522] border-[#E8A389]',
    'severity-critical': 'bg-[#FDF2F0] text-[#9E241A] border-[#E8A29A]',

    // Status badges
    'status-verified': 'bg-sage-200 text-sage-800 border-sage-300',
    'status-action': 'bg-[#FDF2F0] text-[#9E241A] border-[#E8A29A]',
    'status-review': 'bg-[#FDF8EC] text-[#9A6214] border-[#DEC17B]',
    'status-archived': 'bg-ivory-300 text-charcoal-600 border-rail-border',
  };

  const dotColors: Record<string, string> = {
    neutral: 'bg-charcoal-500',
    spalling: 'bg-[#D9653B]',
    wheel_burn: 'bg-[#C88528]',
    squat: 'bg-[#B83227]',
    'severity-low': 'bg-[#4A5B48]',
    'severity-medium': 'bg-[#C88528]',
    'severity-high': 'bg-[#D9653B]',
    'severity-critical': 'bg-[#B83227]',
    'status-verified': 'bg-[#4A5B48]',
    'status-action': 'bg-[#B83227]',
    'status-review': 'bg-[#C88528]',
    'status-archived': 'bg-charcoal-400',
  };

  return (
    <span className={cn(baseStyles, sizes[size], variants[variant], className)} {...props}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || 'bg-charcoal-700')}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export const DefectClassBadge: React.FC<{
  defectClass: DefectClass;
  size?: 'sm' | 'md';
  confidence?: number;
}> = ({ defectClass, size = 'md', confidence }) => {
  const labels: Record<DefectClass, string> = {
    spalling: 'Spalling',
    wheel_burn: 'Wheel Burn',
    squat: 'Squat',
  };

  return (
    <Badge variant={defectClass} size={size} dot>
      {labels[defectClass]}
      {confidence !== undefined && (
        <span className="font-mono text-[10px] opacity-80 ml-0.5">
          {(confidence * 100).toFixed(0)}%
        </span>
      )}
    </Badge>
  );
};

export const SeverityBadge: React.FC<{
  severity: DefectSeverity | 'none';
  size?: 'sm' | 'md';
}> = ({ severity, size = 'md' }) => {
  if (severity === 'none') {
    return (
      <Badge variant="severity-low" size={size} dot>
        Clear / Nom.
      </Badge>
    );
  }

  const mapVariant: Record<DefectSeverity, 'severity-low' | 'severity-medium' | 'severity-high' | 'severity-critical'> = {
    low: 'severity-low',
    medium: 'severity-medium',
    high: 'severity-high',
    critical: 'severity-critical',
  };

  const labels: Record<DefectSeverity, string> = {
    low: 'Low Risk',
    medium: 'Medium Sev.',
    high: 'High Sev.',
    critical: 'CRITICAL',
  };

  return (
    <Badge variant={mapVariant[severity]} size={size} dot>
      {labels[severity]}
    </Badge>
  );
};
