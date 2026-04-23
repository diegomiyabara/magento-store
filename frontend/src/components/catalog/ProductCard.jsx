import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, normalizeMediaUrl } from '../../lib/utils/formatters';
import { apiConfig } from '../../lib/api/config';
import { useCart } from '../../application/cart/CartContext';

export default function ProductCard({ product, storeConfig }) {
  const finalPrice = product.finalPrice;
  const regularPrice = product.regularPrice;
  const currency = product.currency;
  const image = product.imageUrl;
  const { addToCart, isLoading: isCartLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  async function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isAdding || isCartLoading) return;

    setIsAdding(true);
    try {
      await addToCart(product, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    } finally {
      setIsAdding(false);
    }
  }

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

        <button
          className={`product-add-to-cart ${addedSuccess ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={isAdding || isCartLoading || product.stockStatus !== 'IN_STOCK'}
        >
          {isAdding ? (
            'Adicionando...'
          ) : addedSuccess ? (
            'Adicionado!'
          ) : product.stockStatus !== 'IN_STOCK' ? (
            'Indisponível'
          ) : (
            'Adicionar ao carrinho'
          )}
        </button>
      </div>
    </article>
  );
}
