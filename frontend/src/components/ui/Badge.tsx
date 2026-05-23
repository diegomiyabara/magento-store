type BadgeVariant = 'brand' | 'accent' | 'muted' | 'danger' | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  brand:   'bg-blue-50 text-brand border-blue-200',
  accent:  'bg-orange-50 text-accent border-orange-200',
  muted:   'bg-slate-100 text-text-muted border-slate-200',
  danger:  'bg-red-50 text-danger border-red-200',
  success: 'bg-green-50 text-success border-green-200',
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
