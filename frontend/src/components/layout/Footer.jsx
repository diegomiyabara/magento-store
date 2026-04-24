export default function Footer({ storeConfig }) {
  return (
    <footer className="site-footer">
      <div className="container footer-bar">
        <p>{storeConfig?.storeName || 'DM3D Tech'}.</p>
        <p>Produtos, categorias e conteudo sempre atualizados na loja.</p>
      </div>
    </footer>
  );
}
