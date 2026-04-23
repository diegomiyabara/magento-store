import { Link } from 'react-router-dom';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { formatDate, formatPrice } from '../../lib/utils/formatters';

export default function AccountDashboardPage() {
  const account = useAccountController();
  const isInitialLoading = account.isInitialLoading && !account.customer;

  return (
    <>
      <section className="account-hero">
        <p className="eyebrow">Account Dashboard</p>
        <h2>Hello, {account.customer?.firstName || 'cliente'}!</h2>
        <p>
          From your My Account Dashboard you have the ability to view a snapshot of your
          recent account activity and update your account information.
        </p>
      </section>

      {account.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar sua conta."
          detail={account.error.message}
        />
      ) : null}

      <section className="account-section">
        <div className="account-section-title">
          <h3>Account Information</h3>
          {account.isRefreshing ? (
            <span>Atualizando...</span>
          ) : (
            <Link className="button-link account-table-action" to="/minha-conta/informacoes">
              Editar conta
            </Link>
          )}
        </div>

        {isInitialLoading ? (
          <InlineLoadingState title="Carregando informacoes da conta..." />
        ) : (
          <div className="account-grid">
            <article className="account-block">
              <div className="account-block-header">
                <strong>Contact Information</strong>
              </div>
              <div className="account-block-body">
                <p>{account.customer?.fullName || '-'}</p>
                <p>{account.customer?.email || '-'}</p>
                {account.customer?.createdAt ? <p>Conta criada em {formatDate(account.customer.createdAt)}</p> : null}
              </div>
            </article>

            <article className="account-block">
              <div className="account-block-header">
                <strong>Newsletters</strong>
              </div>
              <div className="account-block-body">
                <p>
                  {account.isSubscribed
                    ? 'You are subscribed to General Subscription.'
                    : 'You are currently not subscribed to any newsletter.'}
                </p>
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="account-section">
        <div className="account-section-title">
          <h3>Address Book</h3>
          <Link className="button-link account-table-action" to="/minha-conta/enderecos">
            Gerenciar enderecos
          </Link>
        </div>

        {account.isInitialLoading ? (
          <InlineLoadingState title="Carregando enderecos..." />
        ) : (
          <div className="account-grid">
            <article className="account-block">
              <div className="account-block-header">
                <strong>Default Billing</strong>
              </div>
              <div className="account-block-body">
                {account.defaultBillingAddress ? (
                  <>
                    <p>{[account.defaultBillingAddress.firstName, account.defaultBillingAddress.lastName].filter(Boolean).join(' ')}</p>
                    {account.defaultBillingAddress.street.map((line) => (
                      <p key={`billing-${line}`}>{line}</p>
                    ))}
                    <p>{[account.defaultBillingAddress.city, account.defaultBillingAddress.region, account.defaultBillingAddress.postcode].filter(Boolean).join(', ')}</p>
                  </>
                ) : (
                  <p>Nenhum endereco de cobranca cadastrado.</p>
                )}
              </div>
            </article>

            <article className="account-block">
              <div className="account-block-header">
                <strong>Default Shipping</strong>
              </div>
              <div className="account-block-body">
                {account.defaultShippingAddress ? (
                  <>
                    <p>{[account.defaultShippingAddress.firstName, account.defaultShippingAddress.lastName].filter(Boolean).join(' ')}</p>
                    {account.defaultShippingAddress.street.map((line) => (
                      <p key={`shipping-${line}`}>{line}</p>
                    ))}
                    <p>{[account.defaultShippingAddress.city, account.defaultShippingAddress.region, account.defaultShippingAddress.postcode].filter(Boolean).join(', ')}</p>
                  </>
                ) : (
                  <p>Nenhum endereco de entrega cadastrado.</p>
                )}
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="account-section">
        <div className="account-section-title">
          <h3>Recent Orders</h3>
          <Link className="button-link account-table-action" to="/minha-conta/pedidos">
            Ver todos
          </Link>
        </div>

        {account.isInitialLoading ? (
          <InlineLoadingState title="Carregando pedidos..." />
        ) : account.orders.length ? (
          <div className="orders-table">
            <div className="orders-row orders-row-head">
              <span>Order #</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            {account.orders.slice(0, 5).map((order) => (
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
