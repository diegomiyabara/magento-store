import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { formatPrice, normalizeMediaUrl } from '../../lib/utils/formatters';
import { apiConfig } from '../../lib/api/config';
import { useProductController } from '../../presentation/controllers/useProductController';
import { useAuth } from '../../app/authContext';
import { useCart } from '../../application/cart/CartContext';
import { useStorefrontServices } from '../../app/storefrontContext';
import { digitsOnly, maskCep } from '../../lib/utils/masks';

export default function ProductPage() {
  const { urlKey } = useParams();
  const { storeConfig } = useOutletContext();
  const productState = useProductController(urlKey);
  const auth = useAuth();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { useCases } = useStorefrontServices();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [postcode, setPostcode] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingError, setShippingError] = useState('');
  const [isEstimatingShipping, setIsEstimatingShipping] = useState(false);
  const estimateCartRef = useRef({ cartId: '', itemUid: '' });
  const estimateRequestRef = useRef(null);

  useEffect(() => () => {
    estimateRequestRef.current?.abort();
  }, []);

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
  const isAvailableForSale = productState.product.isAvailableForSale !== false;

  async function handleAddToCart() {
    if (isAdding || isCartLoading || !isAvailableForSale) {
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

  async function ensureEstimateCart(signal) {
    if (auth.isBootstrapping) {
      throw new Error('Aguarde um instante e tente novamente.');
    }

    if (auth.token) {
      const customerCart = await useCases.getCustomerCart(auth.token, signal);
      const customerCartId = customerCart?.id || '';

      if (!customerCartId) {
        throw new Error('Nao foi possivel localizar o carrinho do cliente.');
      }

      const existingCartItem = customerCart.items?.find(
        (item) => item?.product?.sku === productState.product.sku,
      );

      if (existingCartItem?.uid) {
        await useCases.updateCartItem(
          customerCartId,
          existingCartItem.uid,
          quantity,
          auth.token,
          signal,
        );

        return customerCartId;
      }

      await useCases.addProductsToCart(
        customerCartId,
        [{ sku: productState.product.sku, quantity }],
        auth.token,
        signal,
      );

      return customerCartId;
    }

    const currentEstimate = estimateCartRef.current;

    if (currentEstimate.cartId && currentEstimate.itemUid) {
      try {
        await useCases.updateCartItem(
          currentEstimate.cartId,
          currentEstimate.itemUid,
          quantity,
          null,
          signal,
        );
        return currentEstimate.cartId;
      } catch {
        estimateCartRef.current = { cartId: '', itemUid: '' };
      }
    }

    const createdCart = await useCases.createGuestCart(signal);
    const createdCartId = createdCart?.id || '';

    if (!createdCartId) {
      throw new Error('Nao foi possivel preparar o calculo de frete.');
    }

    const updatedCart = await useCases.addProductsToCart(
      createdCartId,
      [{ sku: productState.product.sku, quantity }],
      null,
      signal,
    );

    const estimateItem =
      updatedCart?.items?.find((item) => item?.product?.sku === productState.product.sku) ||
      updatedCart?.items?.[0] ||
      null;

    estimateCartRef.current = {
      cartId: createdCartId,
      itemUid: estimateItem?.uid || '',
    };

    return createdCartId;
  }

  async function handleEstimateShipping(event) {
    event.preventDefault();

    const postcodeDigits = digitsOnly(postcode);

    if (postcodeDigits.length !== 8) {
      setShippingMethods([]);
      setShippingError('Digite um CEP valido com 8 numeros.');
      return;
    }

    if (auth.isBootstrapping) {
      setShippingMethods([]);
      setShippingError('Aguarde a sessao ser carregada e tente novamente.');
      return;
    }

    if (!isAvailableForSale) {
      setShippingMethods([]);
      setShippingError('O frete so pode ser calculado para produtos disponiveis.');
      return;
    }

    estimateRequestRef.current?.abort();
    const controller = new AbortController();
    estimateRequestRef.current = controller;

    setIsEstimatingShipping(true);
    setShippingError('');

    try {
      const estimateCartId = await ensureEstimateCart(controller.signal);
      const methods = await useCases.estimateShippingMethods(
        estimateCartId,
        {
          country_code: 'BR',
          postcode: postcodeDigits,
        },
        auth.token,
        controller.signal,
      );

      const availableMethods = methods.filter((method) => method.available && !method.errorMessage);

      if (!availableMethods.length) {
        setShippingMethods([]);
        setShippingError('Nenhuma opcao de frete foi encontrada para esse CEP.');
        return;
      }

      setShippingMethods(
        [...availableMethods].sort((firstMethod, secondMethod) => firstMethod.price - secondMethod.price),
      );
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      setShippingMethods([]);
      setShippingError(error?.message || 'Nao foi possivel calcular o frete agora.');
    } finally {
      if (estimateRequestRef.current === controller) {
        estimateRequestRef.current = null;
      }

      setIsEstimatingShipping(false);
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
          Estoque: {isAvailableForSale ? 'Disponível' : 'Indisponível'}
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
              disabled={isAdding || isCartLoading || !isAvailableForSale}
            >
              {isAdding ? 'Adicionando...' : 'Adicionar ao carrinho'}
            </button>
          </div>

          <Link className="product-view-cart-link" to="/carrinho">
            Ir para o carrinho
          </Link>

          {feedback ? <p className="product-cart-feedback">{feedback}</p> : null}
        </div>

        <section className="product-shipping-box" aria-label="Calculo de frete">
          <p className="product-buy-kicker">Calcule o frete</p>

          <form className="product-shipping-form" onSubmit={handleEstimateShipping}>
            <label className="product-shipping-field" htmlFor="product-shipping-postcode">
              <span>CEP</span>
              <input
                id="product-shipping-postcode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={9}
                placeholder="00000-000"
                value={postcode}
                onChange={(event) => {
                  setPostcode(maskCep(event.target.value));
                  setShippingError('');
                }}
              />
            </label>

            <button
              type="submit"
              className="product-shipping-submit"
              disabled={isEstimatingShipping || !isAvailableForSale || auth.isBootstrapping}
            >
              {isEstimatingShipping ? 'Calculando...' : 'Consultar'}
            </button>
          </form>

          <p className="product-shipping-caption">
            Estimativa para {quantity} {quantity === 1 ? 'unidade' : 'unidades'}.
          </p>

          {shippingError ? <p className="product-shipping-error">{shippingError}</p> : null}

          {shippingMethods.length ? (
            <div className="product-shipping-results">
              {shippingMethods.map((method) => (
                <article
                  key={`${method.carrierCode}-${method.methodCode}`}
                  className="product-shipping-method"
                >
                  <div>
                    <strong>{method.methodTitle || method.carrierTitle || 'Entrega'}</strong>
                    {method.carrierTitle && method.methodTitle !== method.carrierTitle ? (
                      <p>{method.carrierTitle}</p>
                    ) : null}
                  </div>
                  <span>{formatPrice(method.price, method.currency)}</span>
                </article>
              ))}
            </div>
          ) : null}
        </section>

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
