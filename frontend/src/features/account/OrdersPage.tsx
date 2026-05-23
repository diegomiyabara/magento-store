import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAccountController } from '@/presentation/controllers/useAccountController';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import { LoadingState, EmptyState } from '@/components/ui/PageState';

export default function OrdersPage() {
  const { orders, isInitialLoading } = useAccountController();

  if (isInitialLoading) return <LoadingState title="Carregando pedidos..." />;

  if (!orders.length) {
    return (
      <EmptyState
        title="Nenhum pedido ainda"
        detail="Seus pedidos aparecerão aqui após a compra."
        action={<Link to="/" className="text-sm font-medium text-brand hover:underline">Explorar produtos</Link>}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="border-b border-[var(--color-surface-border)] px-5 py-4">
        <h2 className="font-semibold text-text">Meus pedidos</h2>
      </div>
      <div className="flex flex-col divide-y divide-[var(--color-surface-border)]">
        {orders.map((order) => (
          <Link
            key={order.number}
            to={`/minha-conta/pedidos/${order.number}`}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/3"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-text">#{order.number}</span>
              <span className="text-xs text-text-muted">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-brand">
                {formatPrice(order.grandTotal?.value ?? 0, order.grandTotal?.currency ?? 'BRL')}
              </span>
              <ChevronRight size={14} className="text-text-muted" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
