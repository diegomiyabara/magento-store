import { Link, useLocation } from 'react-router-dom';

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '';

  return (
    <div className="container checkout-page">
      <section className="auth-card checkout-success-card">
        <p className="eyebrow">Pedido concluido</p>
        <h1>Pedido enviado para o Magento.</h1>
        <p className="auth-copy">
          {orderNumber
            ? `Numero do pedido: ${orderNumber}`
            : 'Seu pedido foi criado com sucesso.'}
        </p>

        <div className="checkout-success-actions">
          <Link className="button-link button-link-primary auth-submit" to="/">
            Voltar para a loja
          </Link>
          <Link className="button-link auth-submit" to="/minha-conta/pedidos">
            Ver meus pedidos
          </Link>
        </div>
      </section>
    </div>
  );
}
