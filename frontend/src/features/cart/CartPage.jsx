import { Link } from 'react-router-dom';
import { useCart } from '../../application/cart/CartContext';
import { InlineLoadingState } from '../../components/ui/PageState';

function formatPrice(value, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export default function CartPage() {
  const {
    items,
    isLoading,
    itemCount,
    subtotal,
    grandTotal,
    updateItemQuantity,
    removeFromCart,
  } = useCart();

  async function handleQuantityChange(cartItemId, newQuantity) {
    if (newQuantity < 1) return;
    await updateItemQuantity(cartItemId, newQuantity);
  }

  async function handleRemove(cartItemId) {
    await removeFromCart(cartItemId);
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="container cart-page">
        <InlineLoadingState title="Carregando carrinho..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container cart-page">
        <h1>Meu Carrinho</h1>
        <div className="cart-empty">
          <p>Seu carrinho está vazio.</p>
          <Link to="/" className="cart-continue-shopping">
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Meu Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</h1>

      <div className="cart-items">
        {items.map((item) => {
          const price = item.product?.finalPrice ?? item.product?.regularPrice ?? 0;
          const itemSubtotal = price * item.quantity;

          return (
            <div key={item.uid} className="cart-item">
              <div className="cart-item-image">
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--surface-border)' }} />
                )}
              </div>

              <div className="cart-item-details">
                <Link to={`/produto/${item.product?.urlKey}`} className="cart-item-name">
                  {item.product?.name}
                </Link>
                <div className="cart-item-price">
                  {formatPrice(price)} cada
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.uid, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.uid, item.quantity + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cart-item-actions">
                <button
                  className="cart-item-remove"
                  onClick={() => handleRemove(item.uid)}
                  aria-label="Remover item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
                <div className="cart-item-subtotal">
                  {formatPrice(itemSubtotal)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal?.value ?? 0)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Frete</span>
          <span>Calculado no checkout</span>
        </div>
        <div className="cart-summary-row">
          <span>Impostos</span>
          <span>{formatPrice(totalTax?.value ?? 0)}</span>
        </div>
        <div className="cart-summary-row total">
          <span>Total</span>
          <span>{formatPrice(grandTotal?.value ?? 0)}</span>
        </div>

        <button className="cart-checkout-button">
          Finalizar Compra
        </button>
      </div>
    </div>
  );
}