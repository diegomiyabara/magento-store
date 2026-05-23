import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  const delta = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - delta - 1 && i > 1) ||
      (i === currentPage + delta + 1 && i < totalPages)
    ) {
      pages.push('...');
    }
  }

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-surface-border)] text-text-muted transition-colors hover:bg-black/5 hover:text-text disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-text-muted">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={[
              'flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors',
              page === currentPage
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-[var(--color-surface-border)] text-text-muted hover:bg-black/5 hover:text-text',
            ].join(' ')}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Próxima página"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-surface-border)] text-text-muted transition-colors hover:bg-black/5 hover:text-text disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
