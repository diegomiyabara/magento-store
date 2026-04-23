import { Navigate } from 'react-router-dom';
import { useAuthController } from '../../presentation/controllers/useAuthController';
import { InlineLoadingState } from '../../components/ui/PageState';

export default function AccountPage() {
  const auth = useAuthController();

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
    <div className="container auth-page">
      <section className="auth-card">
        <p className="eyebrow">Minha conta</p>
        <h1>{auth.customer?.fullName || 'Cliente DM3D'}</h1>
        <div className="account-summary">
          <p>
            <strong>Email:</strong> {auth.customer?.email}
          </p>
          <p>
            <strong>Primeiro nome:</strong> {auth.customer?.firstName}
          </p>
          <p>
            <strong>Sobrenome:</strong> {auth.customer?.lastName}
          </p>
        </div>

        <button className="button-link auth-submit" onClick={auth.logout} type="button">
          Sair
        </button>
      </section>
    </div>
  );
}
