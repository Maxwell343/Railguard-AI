import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  headerLabel?: string;
  headerMeta?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'muted' | 'accent' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  className,
  headerLabel,
  headerMeta,
  headerAction,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-ivory-50 border-rail-border text-charcoal-900',
    muted: 'bg-ivory-200/60 border-rail-border-strong text-charcoal-900',
    accent: 'bg-ivory-50 border-signal-orange text-charcoal-900',
    dark: 'bg-charcoal-900 border-charcoal-800 text-ivory-100',
  };

  return (
    <div
      className={cn(
        'border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {(headerLabel || headerMeta || headerAction) && (
        <div
          className={cn(
            'px-4 py-2 border-b flex items-center justify-between text-xs font-mono',
            variant === 'dark'
              ? 'border-charcoal-800 bg-charcoal-950/70 text-charcoal-400'
              : 'border-rail-border bg-ivory-200/40 text-charcoal-600'
          )}
        >
          <div className="flex items-center gap-2">
            {headerLabel && (
              <span className="font-semibold text-charcoal-900 uppercase tracking-wider">
                {headerLabel}
              </span>
            )}
            {headerMeta && (
              <span className="opacity-70 text-[11px]">{headerMeta}</span>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
