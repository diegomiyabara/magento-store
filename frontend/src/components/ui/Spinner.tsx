interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        sizes[size],
        'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
        className,
      ].join(' ')}
    />
  );
}
