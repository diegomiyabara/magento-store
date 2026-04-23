import { Link, NavLink } from 'react-router-dom';

export default function Header({ categories, storeConfig, isLoading }) {
  return (
    <header className="site-header">
      <div className="promo-strip">
        <div className="container promo-strip-inner">
          <span>5% OFF no PIX</span>
          <span>Envio para todo o Brasil</span>
          <span>Lancamentos em ambiente headless</span>
        </div>
      </div>
      <div className="container header-bar">
        <Link className="brand" to="/">
          <span className="brand-mark">DM3D</span>
          <span className="brand-copy">
            <span className="brand-kicker">ART COMMERCE</span>
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
      </div>
    </header>
  );
}
