import { Link } from 'react-router-dom';
import { MapPin, Package, User, ChevronRight } from 'lucide-react';
import { useAccountController } from '@/presentation/controllers/useAccountController';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import { LoadingState } from '@/components/ui/PageState';
import Badge from '@/components/ui/Badge';

export default function AccountDashboardPage() {
  const { customer, defaultShippingAddress, orders, isInitialLoading } = useAccountController();

  if (isInitialLoading) return <LoadingState title="Carregando painel..." />;

  return (
    <div className="flex flex-col gap-4">
      {/* info pessoal */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User size={15} className="text-brand" />
            Informações pessoais
          </div>
          <Link to="/minha-conta/informacoes" className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors">
            Editar <ChevronRight size={13} />
          </Link>
        </div>
        <p className="text-sm font-medium text-text">{customer?.firstName} {customer?.lastName}</p>
        <p className="text-sm text-text-muted">{customer?.email}</p>
        {customer?.isSubscribed && (
          <Badge variant="accent" className="mt-2">Newsletter ativa</Badge>
        )}
      </div>

      {/* endereço padrão */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MapPin size={15} className="text-brand" />
            Endereço de entrega padrão
          </div>
          <Link to="/minha-conta/enderecos" className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors">
            Gerenciar <ChevronRight size={13} />
          </Link>
        </div>
        {defaultShippingAddress ? (
          <address className="not-italic text-sm text-text-soft leading-relaxed">
            {defaultShippingAddress.street?.join(', ')}<br />
            {defaultShippingAddress.city} – {defaultShippingAddress.region}<br />
            {defaultShippingAddress.postcode}
          </address>
        ) : (
          <p className="text-sm text-text-muted">Nenhum endereço cadastrado.</p>
        )}
      </div>

      {/* pedidos recentes */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Package size={15} className="text-brand" />
            Pedidos recentes
          </div>
          <Link to="/minha-conta/pedidos" className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors">
            Ver todos <ChevronRight size={13} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-text-muted">Nenhum pedido realizado ainda.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-surface-border)]">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.number}
                to={`/minha-conta/pedidos/${order.number}`}
                className="flex items-center justify-between py-3 text-sm transition-colors hover:text-brand"
              >
                <div>
                  <span className="font-medium">#{order.number}</span>
                  <span className="ml-2 text-text-muted">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-brand">
                    {formatPrice(order.grandTotal?.value ?? 0, order.grandTotal?.currency ?? 'BRL')}
                  </span>
                  <ChevronRight size={14} className="text-text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
