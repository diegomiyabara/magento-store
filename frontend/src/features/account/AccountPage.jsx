import { Navigate } from 'react-router-dom';
import { useAuthController } from '../../presentation/controllers/useAuthController';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { formatDate, formatPrice } from '../../lib/utils/formatters';

function AddressCard({ address, title }) {
  return (
    <article className="account-block">
      <div className="account-block-header">
        <strong>{title}</strong>
      </div>

      {address ? (
        <div className="account-block-body">
          <p>{[address.firstName, address.lastName].filter(Boolean).join(' ')}</p>
          {address.street.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            {[address.city, address.region, address.postcode].filter(Boolean).join(', ')}
          </p>
          <p>{address.countryCode}</p>
          <p>T: {address.telephone || '-'}</p>
        </div>
      ) : (
        <div className="account-block-body">
          <p>Voce ainda nao cadastrou um endereco padrao.</p>
        </div>
      )}
    </article>
  );
}

export default function AccountPage() {
  const auth = useAuthController();
  const account = useAccountController();

  if (auth.isBootstrapping) {
    return (
      <div className="container auth-page">
        <InlineLoadingState title="Carregando sua conta..." />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container account-page-shell">
      <aside className="account-sidebar">
        <div className="account-sidebar-title">
          <p className="eyebrow">Minha conta</p>
          <h1>{account.customer?.fullName || auth.customer?.fullName || 'Cliente DM3D'}</h1>
        </div>

        <nav className="account-nav" aria-label="Minha conta">
          <a className="account-nav-link is-active" href="#dashboard">
            My Account
          </a>
          <a className="account-nav-link" href="#account-information">
            Account Information
          </a>
          <a className="account-nav-link" href="#address-book">
            Address Book
          </a>
          <a className="account-nav-link" href="#recent-orders">
            My Orders
          </a>
        </nav>

        <button className="button-link auth-submit account-logout" onClick={auth.logout} type="button">
          Sair
        </button>
      </aside>

      <section className="account-dashboard">
        <section className="account-hero" id="dashboard">
          <p className="eyebrow">Account Dashboard</p>
          <h2>Hello, {account.customer?.firstName || auth.customer?.firstName || 'cliente'}!</h2>
          <p>
            From your My Account Dashboard you have the ability to view a snapshot of your
            recent account activity and update your account information.
          </p>
        </section>

        {account.isLoading ? <InlineLoadingState title="Carregando informacoes da conta..." /> : null}
        {account.error ? (
          <InlineErrorState
            title="Nao foi possivel carregar sua conta."
            detail={account.error.message}
          />
        ) : null}

        <section className="account-section" id="account-information">
          <div className="account-section-title">
            <h3>Account Information</h3>
          </div>

          <div className="account-grid">
            <article className="account-block">
              <div className="account-block-header">
                <strong>Contact Information</strong>
              </div>
              <div className="account-block-body">
                <p>{account.customer?.fullName || '-'}</p>
                <p>{account.customer?.email || '-'}</p>
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
        </section>

        <section className="account-section" id="address-book">
          <div className="account-section-title">
            <h3>Address Book</h3>
          </div>

          <div className="account-grid">
            <AddressCard address={account.defaultBillingAddress} title="Default Billing Address" />
            <AddressCard address={account.defaultShippingAddress} title="Default Shipping Address" />
          </div>
        </section>

        <section className="account-section" id="recent-orders">
          <div className="account-section-title">
            <h3>Recent Orders</h3>
            <span>{account.ordersTotalCount} pedido(s)</span>
          </div>

          {account.orders.length ? (
            <div className="orders-table">
              <div className="orders-row orders-row-head">
                <span>Order #</span>
                <span>Date</span>
                <span>Status</span>
                <span>Total</span>
              </div>

              {account.orders.map((order) => (
                <div className="orders-row" key={order.id}>
                  <span>{order.number}</span>
                  <span>{formatDate(order.date)}</span>
                  <span>{order.status}</span>
                  <span>{formatPrice(order.grandTotalValue, order.grandTotalCurrency)}</span>
                </div>
              ))}
            </div>
          ) : (
            <article className="account-block">
              <div className="account-block-body">
                <p>You have placed no orders.</p>
              </div>
            </article>
          )}
        </section>
      </section>
    </div>
  );
}
