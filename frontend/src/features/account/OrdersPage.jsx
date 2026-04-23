import { Link } from 'react-router-dom';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { useAsyncData } from '../../lib/api/useAsyncData';
import { formatDate, formatPrice } from '../../lib/utils/formatters';

export default function OrdersPage() {
  const account = useAccountController();
  const ordersState = useAsyncData(
    (signal) => {
      if (!account.token) {
        return Promise.resolve({ orders: [], totalCount: 0 });
      }

      return account.useCases.getCustomerOrders(account.token, signal);
    },
    [account.token, account.useCases],
  );

  const orders = ordersState.data?.orders ?? [];
  const totalCount = ordersState.data?.totalCount ?? 0;
  const isInitialLoading = ordersState.isInitialLoading;

  return (
    <>
      <section className="account-hero">
        <p className="eyebrow">My Orders</p>
        <h2>Review your orders</h2>
        <p>Track the history of your purchases and review the latest statuses from Magento.</p>
      </section>

      {ordersState.error || account.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar seus pedidos."
          detail={ordersState.error?.message || account.error?.message}
        />
      ) : null}

      <section className="account-section">
        <div className="account-section-title">
          <h3>My Orders</h3>
          <span>
            {isInitialLoading
              ? 'Carregando pedidos...'
              : ordersState.isRefreshing
                ? 'Atualizando pedidos...'
                : `${totalCount} pedido(s)`}
          </span>
        </div>

        {isInitialLoading ? (
          <InlineLoadingState title="Carregando pedidos..." />
        ) : orders.length ? (
          <div className="orders-table">
            <div className="orders-row orders-row-head">
              <span>Order #</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            {orders.map((order) => (
              <div className="orders-row" key={order.id}>
                <span>{order.number}</span>
                <span>{formatDate(order.date)}</span>
                <span>{order.status}</span>
                <span>{formatPrice(order.grandTotalValue, order.grandTotalCurrency)}</span>
                <span>
                  <Link className="button-link account-table-action" to={`/minha-conta/pedidos/${order.number}`}>
                    Ver detalhes
                  </Link>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <article className="account-block">
            <div className="account-block-body">
              <p>Voce ainda nao realizou nenhum pedido.</p>
            </div>
          </article>
        )}
      </section>
    </>
  );
}
