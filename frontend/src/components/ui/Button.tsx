import { forwardRef, ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand to-brand-soft text-[#08111c] font-semibold border-transparent hover:opacity-90 active:scale-[0.98]',
  secondary:
    'bg-[var(--color-surface)] border-[var(--color-surface-border)] text-text hover:bg-[rgba(255,255,255,0.07)]',
  ghost:
    'bg-transparent border-transparent text-text-muted hover:text-text hover:bg-[rgba(255,255,255,0.05)]',
  danger:
    'bg-[rgba(255,107,107,0.12)] border-[rgba(255,107,107,0.3)] text-danger hover:bg-[rgba(255,107,107,0.2)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          'inline-flex items-center justify-center border font-medium',
          'transition-all duration-150 cursor-pointer',
          'disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
