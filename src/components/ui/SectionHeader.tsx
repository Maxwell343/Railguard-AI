import React from 'react';
import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  sectionNumber?: string; // e.g. "01"
  title: string;
  subtitle?: string;
  metadata?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionNumber,
  title,
  subtitle,
  metadata,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'pb-3 mb-5 border-b border-rail-border flex flex-col sm:flex-row sm:items-end justify-between gap-3',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {sectionNumber && (
            <span className="font-mono text-xs font-semibold text-signal-orange tracking-wider">
              {sectionNumber} //
            </span>
          )}
          {metadata && (
            <span className="font-mono text-[11px] text-charcoal-500 uppercase tracking-wide">
              {metadata}
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5 max-w-2xl font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};
