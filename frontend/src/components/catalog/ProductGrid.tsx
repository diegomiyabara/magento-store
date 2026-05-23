import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/PageState';

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

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  isLoading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={skeletonCount} />;
  }

  if (!products.length) {
    return (
      <EmptyState
        title="Nenhum produto encontrado"
        detail="Tente ajustar os filtros ou explore outras categorias."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.uid} product={product} />
      ))}
    </div>
  );
}
