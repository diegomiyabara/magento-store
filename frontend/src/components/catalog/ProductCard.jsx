import { Link } from 'react-router-dom';
import { formatPrice, normalizeMediaUrl } from '../../lib/utils/formatters';
import { apiConfig } from '../../lib/api/config';

export default function ProductCard({ product, storeConfig }) {
  const finalPrice = product.finalPrice;
  const regularPrice = product.regularPrice;
  const currency = product.currency;
  const image = product.imageUrl;

  return (
    <article className="product-card">
      <Link className="product-card-media" to={`/produto/${product.urlKey}`}>
        {image ? (
          <img
            src={normalizeMediaUrl(image, storeConfig, apiConfig.mediaBaseUrl)}
            alt={product.imageLabel || product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-card-placeholder">Sem imagem</div>
        )}
      </Link>

      <div className="product-card-body">
        <p className="product-sku">{product.sku}</p>
        <Link className="product-name" to={`/produto/${product.urlKey}`}>
          {product.name}
        </Link>

        <div className="product-price">
          {finalPrice != null ? (
            <>
              <strong>{formatPrice(finalPrice, currency)}</strong>
              {regularPrice && regularPrice !== finalPrice ? (
                <span>{formatPrice(regularPrice, currency)}</span>
              ) : null}
            </>
          ) : (
            <span>Preço indisponível</span>
          )}
        </div>
      </div>
    </article>
  );
}
