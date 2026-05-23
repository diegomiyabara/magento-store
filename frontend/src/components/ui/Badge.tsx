type BadgeVariant = 'brand' | 'accent' | 'muted' | 'danger' | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand:   'bg-[rgba(255,141,58,0.15)] text-brand border-[rgba(255,141,58,0.3)]',
  accent:  'bg-[rgba(75,167,255,0.15)] text-accent border-[rgba(75,167,255,0.3)]',
  muted:   'bg-[rgba(255,255,255,0.06)] text-text-muted border-[var(--color-surface-border)]',
  danger:  'bg-[rgba(255,107,107,0.12)] text-danger border-[rgba(255,107,107,0.3)]',
  success: 'bg-[rgba(74,222,128,0.12)] text-success border-[rgba(74,222,128,0.3)]',
};

export default function Badge({ variant = 'muted', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
