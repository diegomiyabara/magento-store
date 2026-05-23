import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const orderNumber: string = location.state?.orderNumber ?? '';

  return (
    <>
      <Helmet><title>Pedido confirmado | DM3D Tech</title></Helmet>

      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/5">
          <CheckCircle size={40} className="text-success" />
        </div>

        <span className="mb-2 text-xs font-semibold uppercase tracking-widest text-success">
          Pedido confirmado
        </span>
        <h1 className="mb-3 text-3xl font-extrabold text-text">Obrigado!</h1>
        <p className="mb-1 text-text-muted">
          Seu pedido foi enviado e está sendo processado.
        </p>
        {orderNumber && (
          <p className="flex items-center gap-2 text-sm font-medium text-text">
            <Package size={14} className="text-brand" />
            Pedido #{orderNumber}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 w-full sm:flex-row">
          <Link to="/minha-conta/pedidos" className="flex-1">
            <Button variant="secondary" fullWidth size="lg">
              Ver meus pedidos
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="primary" fullWidth size="lg">
              Continuar comprando <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
