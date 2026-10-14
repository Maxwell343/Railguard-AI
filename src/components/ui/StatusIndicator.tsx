import React from 'react';
import { cn } from '../../utils/cn';

interface StatusIndicatorProps {
  status: 'online' | 'standby' | 'alert' | 'offline';
  label: string;
  sublabel?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  className,
}) => {
  const dotStyles = {
    online: 'bg-emerald-600 border-emerald-300',
    standby: 'bg-[#C88528] border-amber-300',
    alert: 'bg-defect-squat border-red-300',
    offline: 'bg-charcoal-400 border-charcoal-300',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs font-mono', className)}>
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2 border',
            dotStyles[status]
          )}
        />
      </span>
      <div className="flex flex-col leading-none">
        <span className="font-semibold text-charcoal-900 tracking-wider uppercase text-[11px]">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-charcoal-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
};
