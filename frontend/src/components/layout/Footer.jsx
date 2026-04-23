export default function Footer({ storeConfig }) {
  return (
    <footer className="site-footer">
      <div className="container footer-bar">
        <p>{storeConfig?.storeName || 'DM3D Tech'} em modo headless.</p>
        <p>Magento segue como backend de catálogo, CMS e mídia.</p>
      </div>
    </footer>
  );
}
