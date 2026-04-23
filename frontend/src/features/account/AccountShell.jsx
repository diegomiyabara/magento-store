import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuthController } from '../../presentation/controllers/useAuthController';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { InlineLoadingState } from '../../components/ui/PageState';

export default function AccountShell() {
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
          <NavLink className={({ isActive }) => `account-nav-link${isActive ? ' is-active' : ''}`} end to="/minha-conta">
            My Account
          </NavLink>
          <NavLink className={({ isActive }) => `account-nav-link${isActive ? ' is-active' : ''}`} to="/minha-conta/informacoes">
            Account Information
          </NavLink>
          <NavLink className={({ isActive }) => `account-nav-link${isActive ? ' is-active' : ''}`} to="/minha-conta/enderecos">
            Address Book
          </NavLink>
          <NavLink className={({ isActive }) => `account-nav-link${isActive ? ' is-active' : ''}`} to="/minha-conta/pedidos">
            My Orders
          </NavLink>
        </nav>

        <button className="button-link auth-submit account-logout" onClick={auth.logout} type="button">
          Sair
        </button>
      </aside>

      <section className="account-dashboard">
        <Outlet />
      </section>
    </div>
  );
}
