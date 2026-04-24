import { Link, useOutletContext } from 'react-router-dom';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import ProductCard from '../../components/catalog/ProductCard';
import { useHomeController } from '../../presentation/controllers/useHomeController';

const fallbackCollections = [
  {
    title: 'Novidades',
    text: 'Confira os ultimos produtos adicionados a loja.',
    href: '/#destaques',
  },
  {
    title: 'Mais vendidos',
    text: 'Produtos com maior procura para facilitar sua escolha.',
    href: '/#destaques',
  },
  {
    title: 'Ofertas',
    text: 'Aproveite as melhores oportunidades para comprar mais pagando menos.',
    href: '/#destaques',
  },
];

const fallbackHighlights = [
  'Compra segura',
  'Envio para todo o Brasil',
  'Atendimento para pedidos e duvidas',
];

export default function HomePage() {
  const { storeConfig, navigation } = useOutletContext();
  const home = useHomeController();
  const featuredCategories = navigation?.slice(0, 3) ?? [];
  const storeName = storeConfig?.storeName?.trim();
  const heroStoreName = !storeName || storeName === 'Default Store View'
    ? 'DM3D Tech'
    : storeName;

  return (
    <div className="container page-stack">
      <section className="hero-showcase">
        <div className="hero-copy">
          <p className="eyebrow">Loja online</p>
          <h1>{heroStoreName}: produtos em destaque para comprar online.</h1>
          <p className="hero-text">
            Encontre novidades, produtos em destaque e categorias principais em um so lugar.
            Navegue pela loja e adicione ao carrinho com rapidez.
          </p>

          <div className="hero-actions">
            <a className="button-link button-link-primary" href="#destaques">Ver produtos</a>
            <a className="button-link" href="#categorias">Ver categorias</a>
          </div>
        </div>

        <div className="hero-orb">
          <div className="hero-orb-core">
            <span>DM3D</span>
            <small>STORE</small>
          </div>
        </div>
      </section>

      <section className="feature-band">
        {fallbackHighlights.map((item) => (
          <article className="feature-pill" key={item}>
            {item}
          </article>
        ))}
      </section>

      <section className="section-heading" id="categorias">
        <div>
          <p className="eyebrow">Categorias</p>
          <h2>Compre por categoria.</h2>
        </div>
      </section>

      <section className="collection-grid">
        {featuredCategories.length
          ? featuredCategories.map((category, index) => (
              <Link
                className={`collection-card collection-card-${(index % 3) + 1}`}
                key={category.uid}
                to={`/categoria/${category.urlKey}`}
              >
                <p className="eyebrow">Categoria</p>
                <h3>{category.name}</h3>
                <p>Veja os produtos disponiveis nesta categoria.</p>
              </Link>
            ))
          : fallbackCollections.map((collection, index) => (
              <a
                className={`collection-card collection-card-${index + 1}`}
                key={collection.title}
                href={collection.href}
              >
                <p className="eyebrow">Destaque</p>
                <h3>{collection.title}</h3>
                <p>{collection.text}</p>
              </a>
            ))}
      </section>

      <section className="section-heading" id="destaques">
        <div>
          <p className="eyebrow">Produtos em destaque</p>
          <h2>Escolha seus produtos e adicione ao carrinho.</h2>
        </div>
        <p className="section-heading-note">Deslize para ver mais produtos.</p>
      </section>

      {home.isLoading && !home.isReady ? (
        <InlineLoadingState title="Carregando produtos do Magento..." />
      ) : home.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar os produtos."
          detail={home.error.message}
        />
      ) : home.featuredProducts.length ? (
        <section className="product-carousel" aria-label="Produtos em destaque">
          {home.featuredProducts.map((product) => (
            <ProductCard key={product.uid} product={product} storeConfig={storeConfig} />
          ))}
        </section>
      ) : (
        <section className="editorial-panel">
          <div>
            <p className="eyebrow">Catalogo vazio</p>
            <h3>Nenhum produto em destaque foi encontrado.</h3>
          </div>
          <p>
            Cadastre produtos no Magento para exibir a vitrine principal da loja nesta pagina.
          </p>
        </section>
      )}
      <section className="editorial-panel editorial-panel-split">
        <div>
          <p className="eyebrow">Compre com facilidade</p>
          <h3>Uma home mais direta para ajudar o cliente a encontrar o que procura.</h3>
        </div>
        <div className="editorial-list">
          <p>Acesso rapido as principais categorias da loja.</p>
          <p>Produtos em destaque logo na primeira tela.</p>
          <p>Carrinho e conta sempre visiveis no topo.</p>
        </div>
      </section>
    </div>
  );
}
