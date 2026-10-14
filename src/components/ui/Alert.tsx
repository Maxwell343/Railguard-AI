import React from 'react';
import { cn } from '../../utils/cn';
import { AlertTriangle, CheckCircle2, Info, AlertOctagon } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'critical' | 'success';
  title?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  icon,
  children,
  ...props
}) => {
  const styles = {
    info: {
      container: 'bg-ivory-200 border-rail-border-strong text-charcoal-900',
      icon: <Info className="w-5 h-5 text-charcoal-700 shrink-0 mt-0.5" />,
      titleColor: 'text-charcoal-900',
    },
    warning: {
      container: 'bg-[#FDF8EC] border-[#DEC17B] text-[#7A4B07]',
      icon: <AlertTriangle className="w-5 h-5 text-defect-wheelburn shrink-0 mt-0.5" />,
      titleColor: 'text-[#633D05]',
    },
    critical: {
      container: 'bg-[#FDF2F0] border-[#E8A29A] text-[#801B12]',
      icon: <AlertOctagon className="w-5 h-5 text-defect-squat shrink-0 mt-0.5" />,
      titleColor: 'text-[#61130C]',
    },
    success: {
      container: 'bg-sage-200 border-sage-300 text-sage-800',
      icon: <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />,
      titleColor: 'text-sage-800',
    },
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={cn('border p-3.5 flex items-start gap-3 text-xs sm:text-sm', current.container, className)}
      {...props}
    >
      {icon ?? current.icon}
      <div className="flex-1 space-y-1">
        {title && <h5 className={cn('font-semibold uppercase tracking-wider font-mono text-xs', current.titleColor)}>{title}</h5>}
        <div className="leading-relaxed opacity-95">{children}</div>
      </div>
    </div>
  );
};
