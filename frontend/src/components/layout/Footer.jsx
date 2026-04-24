import { Link } from 'react-router-dom';

export default function Footer({ storeConfig }) {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-brand-block">
          <strong>{storeConfig?.storeName || 'DM3D Tech'}</strong>
          <p>Loja online com navegação simples, destaque para produtos e compra rápida.</p>
        </div>

        <div className="footer-links">
          <div>
            <span className="footer-title">Comprar</span>
            <Link to="/">Inicio</Link>
            <Link to="/carrinho">Carrinho</Link>
            <Link to="/checkout">Checkout</Link>
          </div>
          <div>
            <span className="footer-title">Conta</span>
            <Link to="/login">Entrar</Link>
            <Link to="/cadastro">Criar conta</Link>
            <Link to="/minha-conta">Minha conta</Link>
          </div>
        </div>
      </div>

      <div className="container footer-bar">
        <p>{storeConfig?.storeName || 'DM3D Tech'}.</p>
        <p>Produtos, categorias e conteudo sempre atualizados na loja.</p>
      </div>
    </footer>
  );
}
