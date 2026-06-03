import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import { useCart } from '@/application/cart/CartContext';
import { normalizeMediaUrl, formatPrice } from '@/domain/shared/formatters';
import { apiConfig } from '@/infrastructure/magento/config';
import { useStorefrontShell } from '@/application/storefront/useStorefrontShell';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, itemCount, subtotal, isLoading, updateItemQuantity, removeFromCart } = useCart();
  const { storeConfig } = useStorefrontShell();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Carrinho (${itemCount})`}
      footer={
        items.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-semibold text-text">
                {formatPrice(subtotal?.value ?? 0, subtotal?.currency ?? 'BRL')}
              </span>
            </div>
            <Link to="/carrinho" onClick={onClose}>
              <Button variant="secondary" fullWidth>
                Ver carrinho completo
              </Button>
            </Link>
            <Link to="/checkout" onClick={onClose}>
              <Button variant="primary" fullWidth>
                Finalizar compra
              </Button>
            </Link>
          </div>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-3 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="skeleton h-16 w-16 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <ShoppingBag size={48} className="text-text-muted/40" />
          <div>
            <p className="font-semibold">Carrinho vazio</p>
            <p className="mt-1 text-sm text-text-muted">Adicione produtos para começar.</p>
          </div>
          <Link to="/" onClick={onClose}>
            <Button variant="primary">Explorar produtos</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--color-surface-border)]">
          {items.map((item) => {
            const price = item.product?.finalPrice ?? item.product?.regularPrice ?? 0;
            const currency = item.product?.currency ?? 'BRL';
            const imageUrl = normalizeMediaUrl(
              item.product?.imageUrl ?? '',
              storeConfig,
              apiConfig.mediaBaseUrl,
            );

            return (
              <li key={item.uid} className="flex gap-3 p-4">
                <Link
                  to={`/produto/${item.product?.urlKey}`}
                  onClick={onClose}
                  className="shrink-0"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product?.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <Link
                    to={`/produto/${item.product?.urlKey}`}
                    onClick={onClose}
                    className="line-clamp-2 text-sm font-medium leading-tight hover:text-brand transition-colors"
                  >
                    {item.product?.name}
                  </Link>
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(price * item.quantity, currency)}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-[var(--color-surface-border)]">
                      <button
                        onClick={() => updateItemQuantity(item.uid, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-text disabled:opacity-30"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.uid, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-text-muted transition-colors hover:text-text"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.uid)}
                      className="ml-auto text-text-muted transition-colors hover:text-danger"
                      aria-label="Remover item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
