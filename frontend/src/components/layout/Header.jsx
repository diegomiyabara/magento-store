import { Link, NavLink } from 'react-router-dom';
import { useAuthController } from '../../presentation/controllers/useAuthController';
import MiniCart from '../cart/MiniCart';

export default function Header({ categories, storeConfig, isLoading }) {
  const auth = useAuthController();

  function renderAccountAction() {
    if (auth.isBootstrapping) {
      return <span className="header-user-link nav-placeholder">Conta...</span>;
    }

    if (auth.isAuthenticated) {
      return (
        <NavLink className="header-user-link nav-link nav-link-accent" to="/minha-conta">
          {auth.customer?.firstName || 'Minha conta'}
        </NavLink>
      );
    }

    return (
      <NavLink className="header-user-link nav-link" to="/login">
        Entrar
      </NavLink>
    );
  }

  return (
    <header className="site-header">
      <div className="promo-strip">
        <div className="container promo-strip-inner">
          <span>5% OFF no PIX</span>
          <span>Envio para todo o Brasil</span>
          <span>Compra online com praticidade</span>
        </div>
      </div>
      <div className="container header-bar">
        <Link className="brand" to="/">
          <span className="brand-mark">DM3D</span>
          <span className="brand-copy">
            <span className="brand-kicker">LOJA ONLINE</span>
            <span className="brand-text">
              {storeConfig?.storeName || 'DM3D Art'}
            </span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Categorias">
          {isLoading ? (
            <span className="nav-placeholder">Carregando menu...</span>
          ) : categories.length ? (
            categories.map((category) => (
              <NavLink
                key={category.uid}
                className="nav-link"
                to={`/categoria/${category.urlKey}`}
              >
                {category.name}
              </NavLink>
            ))
          ) : (
            <span className="nav-placeholder">Nenhuma categoria publicada ainda.</span>
          )}
        </nav>

        <div className="header-actions">
          <MiniCart />
          {renderAccountAction()}
        </div>
      </div>
    </header>
  );
}
