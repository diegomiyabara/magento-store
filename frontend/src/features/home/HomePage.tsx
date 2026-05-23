import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ArrowRight, Package, Zap, Truck } from 'lucide-react';
import { useHomeController } from '@/presentation/controllers/useHomeController';
import { useStorefrontShellController } from '@/presentation/controllers/useStorefrontShellController';
import ProductCard from '@/components/catalog/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/PageState';
import Button from '@/components/ui/Button';

const highlights = [
  { icon: Package,  label: 'Impressão 3D',   text: 'Filamentos e peças premium' },
  { icon: Zap,      label: 'Entrega rápida', text: 'Para todo o Brasil'          },
  { icon: Truck,    label: '5% OFF PIX',     text: 'Desconto na hora'            },
];

export default function HomePage() {
  const { featuredProducts, isLoading, error } = useHomeController();
  const { categories, storeConfig } = useStorefrontShellController();

  return (
    <>
      <Helmet>
        <title>{storeConfig?.storeName ?? 'DM3D Tech'} — Impressão 3D e Tecnologia</title>
      </Helmet>

      <div className="mx-auto max-w-[1200px] space-y-12 px-4">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-surface-border)] bg-gradient-to-br from-[rgba(10,23,39,0.95)] to-[rgba(18,34,56,0.88)] p-8 sm:p-12">
          {/* glow orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
                Loja Online
              </span>
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-6xl">
                Tecnologia &amp;<br />
                <span className="bg-gradient-to-r from-brand to-brand-soft bg-clip-text text-transparent">
                  Impressão 3D
                </span>
              </h1>
              <p className="max-w-[42ch] text-base text-text-muted leading-relaxed">
                Filamentos, peças e acessórios para sua impressora 3D. Produtos de qualidade com entrega para todo o Brasil.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                {categories[0] && (
                  <Link to={`/categoria/${categories[0].urlKey}`}>
                    <Button variant="primary" size="lg">
                      Ver produtos <ArrowRight size={16} />
                    </Button>
                  </Link>
                )}
                <Link to={categories[1] ? `/categoria/${categories[1].urlKey}` : '/'}>
                  <Button variant="secondary" size="lg">
                    Categorias
                  </Button>
                </Link>
              </div>
            </div>

            {/* orb decoration */}
            <div className="hidden items-center justify-center lg:flex">
              <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-white/10 bg-gradient-radial from-accent/40 via-brand/30 to-transparent shadow-[0_0_80px_rgba(75,167,255,0.2),0_0_120px_rgba(255,141,58,0.15)]">
                <span className="text-4xl font-extrabold tracking-widest text-text">DM3D</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Highlights ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, label, text }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <Icon size={20} className="text-brand" />
              </div>
              <div>
                <p className="font-semibold text-sm text-text">{label}</p>
                <p className="text-xs text-text-muted">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Category grid ────────────────────────────────────── */}
        {categories.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text">Categorias</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.uid}
                  to={`/categoria/${cat.urlKey}`}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6 text-center transition-all hover:border-brand/30 hover:bg-[rgba(255,141,58,0.05)]"
                >
                  <span className="text-2xl font-bold text-brand">
                    {cat.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-text">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Featured Products Swiper ─────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text">Produtos em destaque</h2>
            {categories[0] && (
              <Link
                to={`/categoria/${categories[0].urlKey}`}
                className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-brand"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {error ? (
            <ErrorState detail="Não foi possível carregar os produtos." />
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              autoplay={{ delay: 5000, disableOnInteraction: true }}
              spaceBetween={12}
              slidesPerView={2}
              breakpoints={{
                640:  { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
            >
              {featuredProducts.map((product) => (
                <SwiperSlide key={product.uid}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : null}
        </section>
      </div>
    </>
  );
}
