import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { formatPrice, normalizeMediaUrl } from '../../lib/utils/formatters';
import { apiConfig } from '../../lib/api/config';
import { useProductController } from '../../presentation/controllers/useProductController';
import { useCart } from '../../application/cart/CartContext';

export default function ProductPage() {
  const { urlKey } = useParams();
  const { storeConfig } = useOutletContext();
  const productState = useProductController(urlKey);
  const { addToCart, isLoading: isCartLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (productState.isLoading) {
    return <LoadingState title="Carregando produto..." />;
  }

  if (productState.error) {
    return (
      <ErrorState
        title="Não foi possível carregar o produto."
        detail={productState.error.message}
      />
    );
  }

  if (!productState.product) {
    return (
      <EmptyState
        title="Produto não encontrado"
        detail="Confira a URL ou publique o produto no catálogo Magento."
      />
    );
  }

  const finalPrice = productState.product.finalPrice;
  const regularPrice = productState.product.regularPrice;
  const currency = productState.product.currency;
  const productImage = productState.product.imageUrl;

  async function handleAddToCart() {
    if (isAdding || isCartLoading || productState.product.stockStatus !== 'IN_STOCK') {
      return;
    }

    setIsAdding(true);
    setFeedback('');

    try {
      await addToCart(productState.product, quantity);
      setFeedback('Produto adicionado ao carrinho.');
    } catch (error) {
      setFeedback(error?.message || 'Nao foi possivel adicionar o produto ao carrinho.');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="container product-page">
      <section className="product-gallery">
        {productImage ? (
          <img
            src={normalizeMediaUrl(productImage, storeConfig, apiConfig.mediaBaseUrl)}
            alt={productState.product.imageLabel || productState.product.name}
          />
        ) : (
          <div className="product-page-placeholder">Sem imagem disponível</div>
        )}
      </section>

      <section className="product-summary">
        <p className="eyebrow">Produto</p>
        <h1>{productState.product.name}</h1>
        <p className="product-stock">
          Estoque: {productState.product.stockStatus === 'IN_STOCK' ? 'Disponível' : 'Indisponível'}
        </p>

        <div className="product-page-price">
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

        <div className="product-buy-box">
          <p className="product-buy-kicker">Compra rápida</p>

          <div className="product-page-actions">
            <div className="cart-item-quantity">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1 || isAdding || isCartLoading}
                aria-label="Diminuir quantidade"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                disabled={isAdding || isCartLoading}
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="product-add-to-cart product-add-to-cart-large"
              onClick={handleAddToCart}
              disabled={isAdding || isCartLoading || productState.product.stockStatus !== 'IN_STOCK'}
            >
              {isAdding ? 'Adicionando...' : 'Adicionar ao carrinho'}
            </button>
          </div>

          <Link className="product-view-cart-link" to="/carrinho">
            Ir para o carrinho
          </Link>

          {feedback ? <p className="product-cart-feedback">{feedback}</p> : null}
        </div>

        <div
          className="cms-html"
          dangerouslySetInnerHTML={{
            __html: productState.product.descriptionHtml || '<p>Sem descrição disponível para este produto.</p>',
          }}
        />
      </section>
    </div>
  );
}
