import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <>
      <Helmet><title>Página não encontrada | DM3D Tech</title></Helmet>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-7xl font-extrabold text-brand/30">404</p>
        <h1 className="text-2xl font-bold text-text">Página não encontrada</h1>
        <p className="text-text-muted">O endereço que você acessou não existe ou foi removido.</p>
        <Link to="/">
          <Button variant="primary" size="lg">
            <Home size={16} /> Ir para o início
          </Button>
        </Link>
      </div>
    </>
  );
}
