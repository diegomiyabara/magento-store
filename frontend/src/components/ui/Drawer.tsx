import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right';
  children: ReactNode;
  footer?: ReactNode;
}

export default function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  footer,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'fixed top-0 z-50 flex h-full w-full max-w-sm flex-col',
          'border-[var(--color-surface-border)] bg-[var(--color-surface-strong)]',
          'shadow-[0_0_80px_rgba(0,0,0,0.6)]',
          'transition-transform duration-300 ease-in-out',
          side === 'right'
            ? `right-0 border-l ${open ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 border-r ${open ? 'translate-x-0' : '-translate-x-full'}`,
        ].join(' ')}
      >
        {/* header */}
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] px-5 py-4">
            <h2 className="text-base font-semibold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* body */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* footer */}
        {footer && (
          <div className="border-t border-[var(--color-surface-border)] p-4">{footer}</div>
        )}
      </div>
    </>
  );
}
