import { useOutletContext, useParams } from 'react-router-dom';
import ProductCard from '../../components/catalog/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { useCategoryController } from '../../presentation/controllers/useCategoryController';

export default function CategoryPage() {
  const { urlKey } = useParams();
  const { storeConfig } = useOutletContext();
  const category = useCategoryController(urlKey);

  if (category.isLoading) {
    return <LoadingState title="Carregando categoria..." />;
  }

  if (category.error) {
    return (
      <ErrorState
        title="Não foi possível carregar a categoria."
        detail={category.error.message}
      />
    );
  }

  if (!category.category) {
    return (
      <EmptyState
        title="Categoria não encontrada"
        detail="Confira a URL ou publique esta categoria no Magento."
      />
    );
  }

  return (
    <div className="container page-stack">
      <section className="hero-card hero-card-compact category-hero">
        <div>
          <p className="eyebrow">Categoria</p>
          <h1>{category.category.name}</h1>
          <p>
            {category.totalCount} produto(s) encontrado(s) para esta categoria.
          </p>
        </div>
        <div className="category-hero-summary">
          <span>Selecao da loja</span>
          <strong>Navegue, compare e adicione ao carrinho com rapidez.</strong>
        </div>
      </section>

      {category.products.length ? (
        <section className="product-grid product-grid-catalog category-products-grid">
          {category.products.map((product) => (
            <ProductCard key={product.uid} product={product} storeConfig={storeConfig} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="Nenhum produto nesta categoria"
          detail="Quando o catálogo estiver populado no Magento, os itens aparecerão aqui."
        />
      )}
    </div>
  );
}
