import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X } from 'lucide-react';
import { useCategoryPage } from '@/application/category/useCategoryPage';
import ProductGrid from '@/components/catalog/ProductGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Pagination from '@/components/ui/Pagination';
import { ErrorState } from '@/components/ui/PageState';

const SORT_OPTIONS = [
  { label: 'Nome (A–Z)',    value: 'name_asc',   sort: { name: 'ASC'  } },
  { label: 'Nome (Z–A)',    value: 'name_desc',  sort: { name: 'DESC' } },
  { label: 'Menor preço',  value: 'price_asc',  sort: { price: 'ASC' } },
  { label: 'Maior preço',  value: 'price_desc', sort: { price: 'DESC'} },
];

export default function CategoryPage() {
  const { urlKey = '' } = useParams<{ urlKey: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortValue, setSortValue] = useState('name_asc');
  const [showInStock, setShowInStock] = useState(false);

  const currentSort = (SORT_OPTIONS.find((o) => o.value === sortValue)?.sort ?? { name: 'ASC' }) as unknown as { name: string };

  const { category, products, totalPages, isLoading, error } = useCategoryPage(
    urlKey,
    currentPage,
    currentSort,
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortValue(value);
    setCurrentPage(1);
  }, []);

  const nonNullProducts = products.filter((p): p is NonNullable<typeof p> => p !== null);
  const displayed = showInStock
    ? nonNullProducts.filter((p) => p.isAvailableForSale)
    : nonNullProducts;

  const breadcrumbs = [
    { label: 'Início', href: '/' },
    { label: category?.name ?? urlKey },
  ];

  return (
    <>
      <Helmet>
        <title>
          {category?.name ? `${category.name} | DM3D Tech` : 'Categoria | DM3D Tech'}
        </title>
        {category?.metaDescription && (
          <meta name="description" content={category.metaDescription} />
        )}
      </Helmet>

      <div className="mx-auto max-w-[1200px] px-4">
        {/* breadcrumb */}
        <div className="mb-4">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text sm:text-3xl">
            {isLoading ? (
              <div className="skeleton h-8 w-48 rounded-lg" />
            ) : (
              category?.name ?? urlKey
            )}
          </h1>
          {!isLoading && category?.productCount != null && (
            <p className="mt-1 text-sm text-text-muted">
              {category.productCount} {category.productCount === 1 ? 'produto' : 'produtos'}
            </p>
          )}
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar filtros ──────────────────────────────── */}
          <aside className="hidden w-56 shrink-0 flex-col gap-4 lg:flex">
            <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal size={15} />
                Filtros
              </div>

              {/* disponibilidade */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Disponibilidade
                </p>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-soft">
                  <input
                    type="checkbox"
                    checked={showInStock}
                    onChange={(e) => { setShowInStock(e.target.checked); setCurrentPage(1); }}
                    className="h-4 w-4 rounded border-[var(--color-surface-border)] accent-brand"
                  />
                  Apenas em estoque
                </label>
              </div>
            </div>
          </aside>

          {/* ── Main ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              {/* mobile filter */}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-text-muted lg:hidden">
                <input
                  type="checkbox"
                  checked={showInStock}
                  onChange={(e) => { setShowInStock(e.target.checked); setCurrentPage(1); }}
                  className="accent-brand"
                />
                Em estoque
              </label>

              <div className="ml-auto flex items-center gap-2">
                {showInStock && (
                  <button
                    onClick={() => setShowInStock(false)}
                    className="flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                  >
                    Em estoque <X size={11} />
                  </button>
                )}
                <select
                  value={sortValue}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <ErrorState detail="Não foi possível carregar os produtos." />
            ) : (
              <>
                <ProductGrid products={displayed} isLoading={isLoading} />
                {!isLoading && totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
