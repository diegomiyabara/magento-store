import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../application/cart/CartContext';
import { normalizeMediaUrl } from '../../lib/utils/formatters';
import { apiConfig } from '../../lib/api/config';
import { useStorefrontShellController } from '../../presentation/controllers/useStorefrontShellController';

export default function MiniCart() {
  const { items, itemCount, isLoading, subtotal } = useCart();
  const { storeConfig } = useStorefrontShellController();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="mini-cart" ref={dropdownRef}>
      <button
        className="mini-cart-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Carrinho com ${itemCount} itens`}
        aria-expanded={isOpen}
        type="button"
      >
        <span className="mini-cart-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </span>
        <span className="mini-cart-copy">
          <strong>Carrinho</strong>
          <small>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</small>
        </span>
        {itemCount > 0 && (
          <span className="mini-cart-count">{itemCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="mini-cart-dropdown">
          {isLoading ? (
            <div className="mini-cart-loading">
              <span>Carregando...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="mini-cart-empty">
              <p>Seu carrinho está vazio.</p>
              <Link
                to="/"
                className="mini-cart-continue"
                onClick={() => setIsOpen(false)}
              >
                Continuar comprando
              </Link>
            </div>
          ) : (
            <>
              <div className="mini-cart-items">
                {items.map((item) => (
                  <div key={item.uid} className="mini-cart-item">
                    <div className="mini-cart-item-image">
                      {item.product?.imageUrl ? (
                        <img
                          src={normalizeMediaUrl(item.product.imageUrl, storeConfig, apiConfig.mediaBaseUrl)}
                          alt={item.product.name}
                        />
                      ) : (
                        <div className="mini-cart-item-placeholder" />
                      )}
                    </div>
                    <div className="mini-cart-item-details">
                      <Link
                        to={`/produto/${item.product?.urlKey}`}
                        className="mini-cart-item-name"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.product?.name}
                      </Link>
                      <div className="mini-cart-item-qty">
                        {item.quantity}x {formatPrice(item.product?.finalPrice ?? item.product?.regularPrice ?? 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mini-cart-footer">
                <div className="mini-cart-subtotal">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal?.value ?? 0)}</span>
                </div>
                <Link
                  to="/carrinho"
                  className="mini-cart-view-cart"
                  onClick={() => setIsOpen(false)}
                >
                  Ver carrinho
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
