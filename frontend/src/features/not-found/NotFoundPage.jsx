import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container">
      <section className="state-card">
        <h1>Página não encontrada</h1>
        <p>Esta rota ainda não existe no storefront headless.</p>
        <Link className="button-link" to="/">
          Voltar para a home
        </Link>
      </section>
    </div>
  );
}
