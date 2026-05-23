import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/application/cart/CartContext';
import { useStorefrontShellController } from '@/presentation/controllers/useStorefrontShellController';
import { formatPrice, normalizeMediaUrl } from '@/lib/utils/formatters';
import { apiConfig } from '@/lib/api/config';
import Button from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/PageState';
import ShippingEstimator from '@/components/cart/ShippingEstimator';
import { toast } from 'sonner';

export default function CartPage() {
  const {
    items, cart, isLoading,
    updateItemQuantity, removeFromCart,
    applyCoupon, removeCoupon,
  } = useCart();
  const { storeConfig } = useStorefrontShellController();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponInput.trim());
      toast.success('Cupom aplicado!');
      setCouponInput('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cupom inválido.');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleRemoveCoupon() {
    try {
      await removeCoupon();
      toast.success('Cupom removido.');
    } catch {
      toast.error('Erro ao remover cupom.');
    }
  }

  if (isLoading && !items.length) return <LoadingState title="Carregando carrinho..." />;

  return (
    <>
      <Helmet><title>Carrinho | DM3D Tech</title></Helmet>

      <div className="mx-auto max-w-[1200px] px-4">
        <h1 className="mb-6 text-2xl font-bold text-text">Carrinho</h1>

        {!items.length ? (
          <EmptyState
            title="Seu carrinho está vazio"
            detail="Explore nossos produtos e adicione itens ao carrinho."
            action={
              <Link to="/"><Button variant="primary">Explorar produtos</Button></Link>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* ── Items ─────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const price = item.product?.finalPrice ?? item.product?.regularPrice ?? 0;
                const currency = item.product?.currency ?? 'BRL';
                const imageUrl = normalizeMediaUrl(
                  item.product?.imageUrl ?? '',
                  storeConfig,
                  apiConfig.mediaBaseUrl,
                );

                return (
                  <div
                    key={item.uid}
                    className="flex gap-4 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4"
                  >
                    <Link to={`/produto/${item.product?.urlKey}`} className="shrink-0">
                      <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.product?.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag size={24} className="text-text-muted/30" />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <Link
                        to={`/produto/${item.product?.urlKey}`}
                        className="line-clamp-2 text-sm font-medium text-text transition-colors hover:text-brand"
                      >
                        {item.product?.name}
                      </Link>
                      <p className="text-xs text-text-muted">{item.product?.sku}</p>
                      <p className="font-semibold text-brand">
                        {formatPrice(price * item.quantity, currency)}
                      </p>

                      <div className="mt-auto flex items-center gap-3">
                        <div className="flex items-center overflow-hidden rounded-lg border border-[var(--color-surface-border)]">
                          <button
                            onClick={() => updateItemQuantity(item.uid, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:text-text disabled:opacity-30"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQuantity(item.uid, item.quantity + 1)}
                            disabled={isLoading}
                            className="flex h-8 w-8 items-center justify-center text-text-muted transition-colors hover:text-text"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.uid)}
                          disabled={isLoading}
                          className="ml-auto text-xs text-text-muted transition-colors hover:text-danger flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* shipping estimator */}
              <ShippingEstimator />

              {/* coupon */}
              <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Tag size={14} className="text-brand" />
                  Cupom de desconto
                </div>

                {cart?.appliedCoupons?.length ? (
                  <div className="flex items-center justify-between rounded-xl bg-brand/10 border border-brand/20 px-3 py-2">
                    <span className="text-sm font-medium text-brand">
                      {cart.appliedCoupons[0].code}
                    </span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-text-muted hover:text-danger transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Código do cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 rounded-xl border border-[var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                    <Button variant="secondary" loading={couponLoading} onClick={handleApplyCoupon}>
                      Aplicar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Order Summary ─────────────────────────────── */}
            <div className="h-fit rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-24">
              <h2 className="mb-4 text-base font-semibold text-text">Resumo do pedido</h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>{formatPrice(cart?.subtotal?.value ?? 0, cart?.subtotal?.currency ?? 'BRL')}</span>
                </div>

                {cart?.discounts?.map((d, i) => (
                  <div key={i} className="flex justify-between text-success">
                    <span>{d.label}</span>
                    <span>-{formatPrice(d.value, d.currency)}</span>
                  </div>
                ))}

                {cart?.totalTax?.value != null && cart.totalTax.value > 0 && (
                  <div className="flex justify-between text-text-muted">
                    <span>Impostos</span>
                    <span>{formatPrice(cart.totalTax.value, cart.totalTax.currency)}</span>
                  </div>
                )}

                <div className="border-t border-[var(--color-surface-border)] pt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-brand">
                    {formatPrice(cart?.grandTotal?.value ?? 0, cart?.grandTotal?.currency ?? 'BRL')}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link to="/checkout">
                  <Button variant="primary" fullWidth size="lg">
                    Finalizar compra <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" fullWidth>
                    Continuar comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
