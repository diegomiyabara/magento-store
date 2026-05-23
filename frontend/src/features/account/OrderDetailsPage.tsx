import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAccountController } from '@/presentation/controllers/useAccountController';
import { useAsyncData } from '@/lib/api/useAsyncData';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import { LoadingState, ErrorState } from '@/components/ui/PageState';

export default function OrderDetailsPage() {
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  const { token, useCases } = useAccountController();

  const { data: order, isLoading, error } = useAsyncData(
    (signal) => {
      if (!token) return Promise.resolve(null);
      return useCases.getCustomerOrderByNumber(token, orderNumber, signal);
    },
    [token, orderNumber],
  );

  if (isLoading) return <LoadingState title="Carregando pedido..." />;
  if (error || !order) return <ErrorState detail="Pedido não encontrado." />;

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/minha-conta/pedidos"
        className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-brand"
      >
        <ChevronLeft size={14} /> Voltar para pedidos
      </Link>

      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-text">Pedido #{order.number}</h2>
            <p className="text-sm text-text-muted">{formatDate(order.createdAt)}</p>
          </div>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {order.status}
          </span>
        </div>

        {/* items */}
        <div className="flex flex-col divide-y divide-[var(--color-surface-border)]">
          {order.items?.map((item: { product_name: string; product_sku: string; quantity_ordered: number; row_total?: { value: number; currency: string } }, i: number) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-text">{item.product_name}</p>
                <p className="text-xs text-text-muted">SKU: {item.product_sku} · Qtd: {item.quantity_ordered}</p>
              </div>
              <span className="text-sm font-semibold text-brand">
                {formatPrice(item.row_total?.value ?? 0, item.row_total?.currency ?? 'BRL')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[var(--color-surface-border)] pt-4">
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-brand">
              {formatPrice(order.grandTotal?.value ?? 0, order.grandTotal?.currency ?? 'BRL')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
