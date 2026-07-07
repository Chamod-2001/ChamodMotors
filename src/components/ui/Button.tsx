import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg font-semibold',
          'transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          'min-h-[56px]', // large tap target for tablets/phones
          variant === 'primary' && 'bg-brand text-white hover:bg-brand-dark',
          variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
          variant === 'ghost' && 'bg-transparent text-brand hover:bg-brand-light',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
