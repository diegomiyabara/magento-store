import { AlertCircle, Inbox } from 'lucide-react';
import Spinner from './Spinner';
import { ProductGridSkeleton } from './Skeleton';

export function LoadingState({ title = 'Carregando...' }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
      <Spinner size="lg" />
      <p className="text-sm">{title}</p>
    </div>
  );
}

export function GridLoadingState({ count = 8 }: { count?: number }) {
  return <ProductGridSkeleton count={count} />;
}

export function ErrorState({
  title = 'Não foi possível carregar.',
  detail,
  onRetry,
}: {
  title?: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 py-16 text-center">
      <AlertCircle size={32} className="text-danger" />
      <div>
        <p className="font-semibold text-text">{title}</p>
        {detail && <p className="mt-1 text-sm text-text-muted">{detail}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-surface-border px-4 py-2 text-sm transition-colors hover:bg-black/5"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Inbox size={40} className="text-text-muted/50" />
      <div>
        <p className="font-semibold text-text">{title}</p>
        {detail && <p className="mt-1 text-sm text-text-muted">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
