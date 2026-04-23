import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../presentation/controllers/useAuthController';

const initialForm = {
  email: '',
  firstname: '',
  lastname: '',
  password: '',
  confirmPassword: '',
  isSubscribed: false,
};

export default function RegisterPage() {
  const auth = useAuthController();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  if (auth.isAuthenticated) {
    return <Navigate to="/minha-conta" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('A confirmacao de senha nao confere.');
      return;
    }

    try {
      await auth.register({
        email: form.email,
        firstname: form.firstname,
        lastname: form.lastname,
        password: form.password,
        is_subscribed: form.isSubscribed,
      });

      navigate('/minha-conta', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="container auth-page">
      <section className="auth-card">
        <p className="eyebrow">Novo cliente</p>
        <h1>Criar conta</h1>
        <p className="auth-copy">
          Cadastre-se para acessar sua conta headless e acompanhar sua jornada de compra.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid">
            <label className="form-field">
              <span>Nome</span>
              <input
                autoComplete="given-name"
                name="firstname"
                onChange={(event) =>
                  setForm((current) => ({ ...current, firstname: event.target.value }))
                }
                required
                type="text"
                value={form.firstname}
              />
            </label>

            <label className="form-field">
              <span>Sobrenome</span>
              <input
                autoComplete="family-name"
                name="lastname"
                onChange={(event) =>
                  setForm((current) => ({ ...current, lastname: event.target.value }))
                }
                required
                type="text"
                value={form.lastname}
              />
            </label>
          </div>

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

          <div className="auth-grid">
            <label className="form-field">
              <span>Senha</span>
              <input
                autoComplete="new-password"
                minLength={8}
                name="password"
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
                type="password"
                value={form.password}
              />
            </label>

            <label className="form-field">
              <span>Confirmar senha</span>
              <input
                autoComplete="new-password"
                minLength={8}
                name="confirmPassword"
                onChange={(event) =>
                  setForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                required
                type="password"
                value={form.confirmPassword}
              />
            </label>
          </div>

          <label className="checkbox-field">
            <input
              checked={form.isSubscribed}
              onChange={(event) =>
                setForm((current) => ({ ...current, isSubscribed: event.target.checked }))
              }
              type="checkbox"
            />
            <span>Desejo receber novidades e lancamentos por email.</span>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button
            className="button-link button-link-primary auth-submit"
            disabled={auth.isRegistering}
            type="submit"
          >
            {auth.isRegistering ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          Ja tem conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </div>
  );
}
