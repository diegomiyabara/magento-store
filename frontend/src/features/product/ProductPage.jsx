import { useOutletContext, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { formatPrice, normalizeMediaUrl } from '../../lib/utils/formatters';
import { apiConfig } from '../../lib/api/config';
import { useProductController } from '../../presentation/controllers/useProductController';

export default function ProductPage() {
  const { urlKey } = useParams();
  const { storeConfig } = useOutletContext();
  const productState = useProductController(urlKey);

  if (productState.isLoading) {
    return <LoadingState title="Carregando produto..." />;
  }

  if (productState.error) {
    return (
      <ErrorState
        title="Não foi possível carregar o produto."
        detail={productState.error.message}
      />
    );
  }

  if (!productState.product) {
    return (
      <EmptyState
        title="Produto não encontrado"
        detail="Confira a URL ou publique o produto no catálogo Magento."
      />
    );
  }

  const finalPrice = productState.product.finalPrice;
  const regularPrice = productState.product.regularPrice;
  const currency = productState.product.currency;
  const productImage = productState.product.imageUrl;

  return (
    <div className="container product-page">
      <section className="product-gallery">
        {productImage ? (
          <img
            src={normalizeMediaUrl(productImage, storeConfig, apiConfig.mediaBaseUrl)}
            alt={productState.product.imageLabel || productState.product.name}
          />
        ) : (
          <div className="product-page-placeholder">Sem imagem disponível</div>
        )}
      </section>

      <section className="product-summary">
        <p className="eyebrow">Produto</p>
        <h1>{productState.product.name}</h1>
        <p className="product-stock">
          Estoque: {productState.product.stockStatus === 'IN_STOCK' ? 'Disponível' : 'Indisponível'}
        </p>

        <div className="product-page-price">
          {finalPrice != null ? (
            <>
              <strong>{formatPrice(finalPrice, currency)}</strong>
              {regularPrice && regularPrice !== finalPrice ? (
                <span>{formatPrice(regularPrice, currency)}</span>
              ) : null}
            </>
          ) : (
            <span>Preço indisponível</span>
          )}
        </div>

        <div
          className="cms-html"
          dangerouslySetInnerHTML={{
            __html: productState.product.descriptionHtml || '<p>Sem descrição disponível para este produto.</p>',
          }}
        />
      </section>
    </div>
  );
}
