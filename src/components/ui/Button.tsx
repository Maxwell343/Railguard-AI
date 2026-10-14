import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'signal' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium transition-colors select-none rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-orange disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-charcoal-900 text-ivory-100 hover:bg-charcoal-950 border border-charcoal-900 active:bg-black',
      signal:
        'bg-signal-orange text-white hover:bg-signal-orange-hover border border-signal-orange active:bg-signal-orange-hover shadow-sm',
      secondary:
        'bg-ivory-200 text-charcoal-900 hover:bg-ivory-300 border border-rail-border-strong active:bg-ivory-400',
      outline:
        'bg-transparent text-charcoal-900 hover:bg-ivory-200 border border-rail-border-strong active:bg-ivory-300',
      ghost:
        'bg-transparent text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200 border border-transparent',
      danger:
        'bg-defect-squat text-white hover:bg-red-800 border border-defect-squat active:bg-red-900',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 tracking-tight',
      md: 'text-sm px-3.5 py-2 gap-2 tracking-tight',
      lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
