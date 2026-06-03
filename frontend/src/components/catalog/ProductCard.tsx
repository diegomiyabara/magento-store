import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { formatPrice, normalizeMediaUrl } from '@/domain/shared/formatters';
import { apiConfig } from '@/infrastructure/magento/config';
import { useCart } from '@/application/cart/CartContext';
import { useStorefrontShell } from '@/application/storefront/useStorefrontShell';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface Product {
  uid: string;
  sku: string;
  name: string;
  urlKey: string;
  imageUrl: string;
  imageLabel?: string;
  finalPrice: number | null;
  regularPrice: number | null;
  currency: string;
  isAvailableForSale: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart();
  const { storeConfig } = useStorefrontShell();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const imageUrl = normalizeMediaUrl(product.imageUrl, storeConfig, apiConfig.mediaBaseUrl);
  const hasDiscount =
    product.finalPrice != null &&
    product.regularPrice != null &&
    product.finalPrice < product.regularPrice;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.regularPrice! - product.finalPrice!) / product.regularPrice!) * 100,
      )
    : 0;

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (adding || cartLoading || !product.isAvailableForSale) return;
    setAdding(true);
    try {
      await addToCart(product, 1);
      setAdded(true);
      toast.success('Produto adicionado ao carrinho!');
      setTimeout(() => setAdded(false), 2500);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar produto.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface transition-all duration-200 hover:border-brand/20 hover:shadow-card">
      {/* image */}
      <Link to={`/produto/${product.urlKey}`} className="relative block overflow-hidden bg-slate-50" tabIndex={-1}>
        <div className="aspect-square w-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.imageLabel ?? product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted/30">
              <ShoppingCart size={40} />
            </div>
          )}
        </div>

        {/* badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="brand">-{discountPct}%</Badge>
          )}
          {!product.isAvailableForSale && (
            <Badge variant="muted">Esgotado</Badge>
          )}
        </div>
      </Link>

      {/* body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-[0.68rem] font-medium uppercase tracking-widest text-text-muted">
          {product.sku}
        </p>

        <Link
          to={`/produto/${product.urlKey}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-text transition-colors hover:text-brand"
        >
          {product.name}
        </Link>

        {/* price */}
        <div className="mt-auto flex flex-col gap-0.5 pt-1">
          {product.finalPrice != null ? (
            <>
              <span className="text-base font-bold text-brand">
                {formatPrice(product.finalPrice, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-text-muted line-through">
                  {formatPrice(product.regularPrice!, product.currency)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-text-muted">Preço indisponível</span>
          )}
        </div>

        {/* add to cart */}
        <button
          onClick={handleAdd}
          disabled={adding || cartLoading || !product.isAvailableForSale}
          className={[
            'mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold',
            'border transition-all duration-150',
            'disabled:pointer-events-none disabled:opacity-50',
            added
              ? 'border-success/30 bg-[rgba(74,222,128,0.1)] text-success'
              : !product.isAvailableForSale
                ? 'border-[var(--color-surface-border)] bg-transparent text-text-muted'
                : 'border-brand/30 bg-brand/10 text-brand hover:bg-brand hover:text-white',
          ].join(' ')}
        >
          {added ? (
            <><Check size={14} /> Adicionado!</>
          ) : adding ? (
            'Adicionando...'
          ) : !product.isAvailableForSale ? (
            'Indisponível'
          ) : (
            <><ShoppingCart size={14} /> Adicionar</>
          )}
        </button>
      </div>
    </article>
  );
}
