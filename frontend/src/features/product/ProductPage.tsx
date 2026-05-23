import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ShoppingCart, Truck, Minus, Plus } from 'lucide-react';
import { useProductController } from '@/presentation/controllers/useProductController';
import { useCart } from '@/application/cart/CartContext';
import { useStorefrontShellController } from '@/presentation/controllers/useStorefrontShellController';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ErrorState, LoadingState } from '@/components/ui/PageState';
import { formatPrice, normalizeMediaUrl } from '@/lib/utils/formatters';
import { apiConfig } from '@/lib/api/config';
import { fetchAddressByCep } from '@/lib/api/cep';
import { toast } from 'sonner';

export default function ProductPage() {
  const { urlKey = '' } = useParams<{ urlKey: string }>();
  const { product, isLoading, error } = useProductController(urlKey);
  const { storeConfig } = useStorefrontShellController();
  const { addToCart, isLoading: cartLoading } = useCart();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [cep, setCep] = useState('');
  const [shippingResult, setShippingResult] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  async function handleAddToCart() {
    if (!product || adding) return;
    setAdding(true);
    try {
      await addToCart(product, qty);
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar produto.');
    } finally {
      setAdding(false);
    }
  }

  async function handleCepCheck() {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) { toast.error('CEP inválido.'); return; }
    setCepLoading(true);
    try {
      const addr = await fetchAddressByCep(clean);
      if (addr) setShippingResult(`Entrega disponível para ${addr.localidade} – ${addr.uf}`);
      else setShippingResult('CEP não encontrado.');
    } catch {
      setShippingResult('Não foi possível verificar o frete.');
    } finally {
      setCepLoading(false);
    }
  }

  if (isLoading) return <LoadingState title="Carregando produto..." />;
  if (error || !product) return <ErrorState detail="Produto não encontrado." />;

  const images: string[] = product.raw?.media_gallery
    ?.filter((m: { disabled?: boolean }) => !m.disabled)
    ?.map((m: { url: string }) => normalizeMediaUrl(m.url, storeConfig, apiConfig.mediaBaseUrl)) ?? [];

  if (!images.length && product.imageUrl) {
    images.push(normalizeMediaUrl(product.imageUrl, storeConfig, apiConfig.mediaBaseUrl));
  }

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    ...(product.raw?.categories?.[0]
      ? [{ label: product.raw.categories[0].name, href: `/categoria/${product.raw.categories[0].url_key}` }]
      : []),
    { label: product.name },
  ];

  const hasDiscount =
    product.finalPrice != null &&
    product.regularPrice != null &&
    product.finalPrice < product.regularPrice;

  const discountPct = hasDiscount
    ? Math.round(((product.regularPrice! - product.finalPrice!) / product.regularPrice!) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} | DM3D Tech</title>
        {product.shortDescriptionHtml && (
          <meta
            name="description"
            content={product.shortDescriptionHtml.replace(/<[^>]+>/g, '').slice(0, 160)}
          />
        )}
      </Helmet>

      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-5">
          <Breadcrumb items={breadcrumbs} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Gallery ─────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              className="w-full overflow-hidden rounded-2xl border border-[var(--color-surface-border)]"
            >
              {images.length ? images.map((url, i) => (
                <SwiperSlide key={i}>
                  <div className="aspect-square bg-slate-50">
                    <img src={url} alt={`${product.name} — imagem ${i + 1}`} className="h-full w-full object-cover" fetchPriority={i === 0 ? 'high' : 'auto'} />
                  </div>
                </SwiperSlide>
              )) : (
                <SwiperSlide>
                  <div className="aspect-square flex items-center justify-center bg-slate-50 text-text-muted/30">
                    <ShoppingCart size={64} />
                  </div>
                </SwiperSlide>
              )}
            </Swiper>

            {images.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={8}
                slidesPerView={5}
                watchSlidesProgress
                className="w-full"
              >
                {images.map((url, i) => (
                  <SwiperSlide key={i}>
                    <div className="aspect-square cursor-pointer overflow-hidden rounded-lg border border-[var(--color-surface-border)] opacity-60 transition-opacity [.swiper-slide-thumb-active_&]:border-brand [.swiper-slide-thumb-active_&]:opacity-100">
                      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* ── Info ────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start gap-2">
              {!product.isAvailableForSale && <Badge variant="muted">Indisponível</Badge>}
              {hasDiscount && <Badge variant="brand">-{discountPct}%</Badge>}
              <span className="text-xs font-medium uppercase tracking-widest text-text-muted">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-2xl font-bold leading-tight text-text sm:text-3xl">
              {product.name}
            </h1>

            {/* price */}
            <div className="flex items-end gap-3">
              {product.finalPrice != null ? (
                <>
                  <span className="text-3xl font-extrabold text-brand">
                    {formatPrice(product.finalPrice, product.currency)}
                  </span>
                  {hasDiscount && (
                    <span className="mb-1 text-base text-text-muted line-through">
                      {formatPrice(product.regularPrice!, product.currency)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg text-text-muted">Preço indisponível</span>
              )}
            </div>

            {/* qty + add */}
            {product.isAvailableForSale && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-xl border border-[var(--color-surface-border)]">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                    aria-label="Diminuir"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-11 w-11 items-center justify-center text-text-muted transition-colors hover:bg-black/5 hover:text-text"
                    aria-label="Aumentar"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  loading={adding || cartLoading}
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  <ShoppingCart size={16} /> Adicionar ao carrinho
                </Button>
              </div>
            )}

            {/* shipping estimator */}
            <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Truck size={15} className="text-brand" />
                Calcular frete
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  maxLength={9}
                  className="flex-1 rounded-xl border border-[var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
                <Button variant="secondary" size="md" loading={cepLoading} onClick={handleCepCheck}>
                  Verificar
                </Button>
              </div>
              {shippingResult && (
                <p className="mt-2 text-xs text-text-soft">{shippingResult}</p>
              )}
            </div>

            {/* short description */}
            {product.shortDescriptionHtml && (
              <div
                className="prose-dm text-sm"
                dangerouslySetInnerHTML={{ __html: product.shortDescriptionHtml }}
              />
            )}
          </div>
        </div>

        {/* full description */}
        {product.descriptionHtml && (
          <section className="mt-12 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-text">Descrição</h2>
            <div className="prose-dm" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </section>
        )}
      </div>
    </>
  );
}
