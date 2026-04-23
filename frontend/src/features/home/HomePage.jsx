import { useOutletContext } from 'react-router-dom';
import CmsContent from '../../components/cms/CmsContent';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import ProductCard from '../../components/catalog/ProductCard';
import { useHomeController } from '../../presentation/controllers/useHomeController';

const fallbackCollections = [
  {
    title: 'Colecao Nebula',
    text: 'Uma curadoria com visual cosmico, brilho metalico e pecas de alto impacto.',
  },
  {
    title: 'Studio Drops',
    text: 'Lancamentos menores para destacar novidades, kits especiais e edicoes limitadas.',
  },
  {
    title: 'Universo DM3D',
    text: 'Linha principal com atmosfera industrial, acabamento premium e narrativa visual forte.',
  },
];

const fallbackHighlights = [
  'Lancamentos com estetica sci-fi e acabamento premium',
  'Blocos pensados para categorias, colecoes e vitrines sazonais',
  'Base pronta para evoluir depois para carrinho e checkout headless',
];

export default function HomePage() {
  const { storeConfig } = useOutletContext();
  const home = useHomeController();

  return (
    <div className="container page-stack">
      <section className="hero-showcase">
        <div className="hero-copy">
          <p className="eyebrow">DM3D Art Headless Store</p>
          <h1>Uma vitrine de e-commerce com impacto visual de galaxia industrial.</h1>
          <p className="hero-text">
            Estrutura inspirada em uma flagship fashion commerce, mas reinterpretada
            com a identidade da DM3D: azul profundo, reflexos cromados e energia neon.
          </p>

          <div className="hero-actions">
            <a className="button-link button-link-primary" href="#destaques">
              Ver destaques
            </a>
            <a className="button-link" href="#colecoes">
              Explorar colecoes
            </a>
          </div>
        </div>

        <div className="hero-orb">
          <div className="hero-orb-core">
            <span>DM3D</span>
            <small>ART</small>
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

      <section className="section-heading" id="colecoes">
        <div>
          <p className="eyebrow">Colecoes em destaque</p>
          <h2>Blocos editoriais para campanhas, categorias e narrativas de marca.</h2>
        </div>
      </section>

      <section className="collection-grid">
        {fallbackCollections.map((collection, index) => (
          <article className={`collection-card collection-card-${index + 1}`} key={collection.title}>
            <p className="eyebrow">Curadoria</p>
            <h3>{collection.title}</h3>
            <p>{collection.text}</p>
          </article>
        ))}
      </section>

      <section className="section-heading" id="destaques">
        <div>
          <p className="eyebrow">Vitrine principal</p>
          <h2>Produtos em evidência para compor a homepage da loja.</h2>
        </div>
      </section>

      {home.isLoading && !home.isReady ? (
        <InlineLoadingState title="Carregando produtos do Magento..." />
      ) : home.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar os produtos."
          detail={home.error.message}
        />
      ) : home.featuredProducts.length ? (
        <section className="product-grid">
          {home.featuredProducts.map((product) => (
            <ProductCard key={product.uid} product={product} storeConfig={storeConfig} />
          ))}
        </section>
      ) : (
        <section className="editorial-panel">
          <div>
            <p className="eyebrow">Catalogo aguardando produtos</p>
            <h3>A estrutura de vitrine ja esta pronta.</h3>
          </div>
          <p>
            Assim que voce cadastrar itens e categorias no Magento, esta area passa
            a exibir cards reais do catalogo automaticamente.
          </p>
        </section>
      )}

      {home.isLoading && !home.isReady ? (
        <InlineLoadingState title="Carregando conteudo do Magento..." />
      ) : home.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar o conteudo dinamico."
          detail={home.error.message}
        />
      ) : (
        <CmsContent
          title={home.cmsPage?.title}
          content={home.cmsPage?.content}
        />
      )}

      <section className="editorial-panel editorial-panel-split">
        <div>
          <p className="eyebrow">Experiencia de compra</p>
          <h3>Base para um e-commerce premium, modular e expansivel.</h3>
        </div>
        <div className="editorial-list">
          <p>Home editorial com seções de campanha e prova social visual.</p>
          <p>Navegacao superior para categorias e futuras colecoes.</p>
          <p>Cards de produto prontos para receber wishlist, quick buy e badges.</p>
        </div>
      </section>
    </div>
  );
}
