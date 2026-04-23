import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../presentation/controllers/useAuthController';

export default function LoginPage() {
  const auth = useAuthController();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  if (auth.isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/minha-conta';
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await auth.login(form);
      navigate(location.state?.from?.pathname || '/minha-conta', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="container auth-page">
      <section className="auth-card">
        <p className="eyebrow">Acesso do cliente</p>
        <h1>Entrar na sua conta</h1>
        <p className="auth-copy">
          Use seu email e senha cadastrados no Magento para acessar a area do cliente.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="form-field">
            <span>Senha</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              required
              type="password"
              value={form.password}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button-link button-link-primary auth-submit" disabled={auth.isLoggingIn} type="submit">
            {auth.isLoggingIn ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
}
