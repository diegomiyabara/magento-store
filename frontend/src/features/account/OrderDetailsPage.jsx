import { Link, Navigate, useParams } from 'react-router-dom';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { useAsyncData } from '../../lib/api/useAsyncData';
import { formatDate, formatPrice } from '../../lib/utils/formatters';

function AddressSummary({ address, title }) {
  if (!address) {
    return null;
  }

  return (
    <article className="account-block">
      <div className="account-block-header">
        <strong>{title}</strong>
      </div>
      <div className="account-block-body">
        <p>{[address.firstName, address.middleName, address.lastName].filter(Boolean).join(' ')}</p>
        {address.company ? <p>{address.company}</p> : null}
        {address.street.map((line) => (
          <p key={`${title}-${line}`}>{line}</p>
        ))}
        <p>{[address.city, address.region, address.postcode].filter(Boolean).join(', ')}</p>
        <p>{address.countryCode}</p>
        {address.telephone ? <p>T: {address.telephone}</p> : null}
      </div>
    </article>
  );
}

export default function OrderDetailsPage() {
  const account = useAccountController();
  const { orderNumber = '' } = useParams();
  const orderState = useAsyncData(
    (signal) => {
      if (!account.token || !orderNumber) {
        return Promise.resolve(null);
      }

      return account.useCases.getCustomerOrderByNumber(account.token, orderNumber, signal);
    },
    [account.token, account.useCases, orderNumber],
  );

  if (!orderState.isInitialLoading && !orderState.data && !orderState.error) {
    return <Navigate replace to="/minha-conta/pedidos" />;
  }

  const order = orderState.data;

  return (
    <>
      <section className="account-hero">
        <p className="eyebrow">Order Details</p>
        <h2>Pedido #{orderNumber}</h2>
        <p>Consulte itens, totais, pagamento, envio e o historico do pedido.</p>
      </section>

      <div className="account-inline-actions">
        <Link className="button-link" to="/minha-conta/pedidos">
          Voltar para pedidos
        </Link>
      </div>

      {orderState.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar os detalhes do pedido."
          detail={orderState.error.message}
        />
      ) : null}

      {orderState.isInitialLoading ? (
        <section className="account-section">
          <InlineLoadingState title="Carregando detalhes do pedido..." />
        </section>
      ) : null}

      {order ? (
        <>
          <section className="account-section">
            <div className="account-grid">
              <article className="account-block">
                <div className="account-block-header">
                  <strong>Resumo do pedido</strong>
                </div>
                <div className="account-block-body">
                  <p>Numero: #{order.number}</p>
                  <p>Data: {formatDate(order.date)}</p>
                  <p>Status: {order.status}</p>
                  <p>Total: {formatPrice(order.grandTotalValue, order.grandTotalCurrency)}</p>
                  {order.statusChangedAt ? (
                    <p>Ultima atualizacao: {formatDate(order.statusChangedAt)}</p>
                  ) : null}
                </div>
              </article>

              <article className="account-block">
                <div className="account-block-header">
                  <strong>Pagamento e envio</strong>
                </div>
                <div className="account-block-body">
                  {order.paymentMethods.length ? (
                    order.paymentMethods.map((method) => (
                      <p key={method.type || method.name}>
                        Pagamento: {[method.name, method.type].filter(Boolean).join(' - ')}
                      </p>
                    ))
                  ) : (
                    <p>Pagamento nao informado.</p>
                  )}
                  {order.shippingMethod ? <p>Metodo de envio: {order.shippingMethod}</p> : null}
                  {order.carrier ? <p>Transportadora: {order.carrier}</p> : null}
                  {order.appliedCoupons.length ? (
                    <p>Cupom: {order.appliedCoupons.map((coupon) => coupon.code).join(', ')}</p>
                  ) : null}
                </div>
              </article>
            </div>
          </section>

          <section className="account-section">
            <div className="account-section-title">
              <h3>Itens do pedido</h3>
              <span>{order.items.length} item(ns)</span>
            </div>

            <div className="account-stack">
              {order.items.map((item) => (
                <article className="account-block" key={item.id}>
                  <div className="account-block-header">
                    <strong>{item.productName || item.productSku}</strong>
                  </div>
                  <div className="account-block-body account-order-item">
                    <p>SKU: {item.productSku}</p>
                    <p>Quantidade: {item.quantityOrdered}</p>
                    <p>Preco unitario: {formatPrice(item.salePriceValue, item.salePriceCurrency)}</p>
                    <p>Total da linha: {formatPrice(item.rowTotalValue, item.rowTotalCurrency)}</p>
                    {item.status ? <p>Status: {item.status}</p> : null}
                    {item.selectedOptions.length ? (
                      <div className="account-subsection">
                        <strong>Opcoes selecionadas</strong>
                        {item.selectedOptions.map((option) => (
                          <p key={`${item.id}-${option.label}`}>{option.label}: {option.value}</p>
                        ))}
                      </div>
                    ) : null}
                    {item.enteredOptions.length ? (
                      <div className="account-subsection">
                        <strong>Opcoes informadas</strong>
                        {item.enteredOptions.map((option) => (
                          <p key={`${item.id}-${option.label}-entered`}>{option.label}: {option.value}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="account-section">
            <div className="account-grid">
              <AddressSummary address={order.billingAddress} title="Endereco de cobranca" />
              {!order.isVirtual ? (
                <AddressSummary address={order.shippingAddress} title="Endereco de entrega" />
              ) : null}
            </div>
          </section>

          <section className="account-section">
            <div className="account-grid">
              <article className="account-block">
                <div className="account-block-header">
                  <strong>Totais</strong>
                </div>
                <div className="account-block-body">
                  <p>Subtotal: {formatPrice(order.subtotalValue, order.subtotalCurrency)}</p>
                  <p>Frete: {formatPrice(order.totalShippingValue, order.totalShippingCurrency)}</p>
                  <p>Impostos: {formatPrice(order.totalTaxValue, order.totalTaxCurrency)}</p>
                  {order.totalDiscounts.map((discount) => (
                    <p key={`${discount.label}-${discount.amountValue}`}>
                      Desconto {discount.label ? `(${discount.label})` : ''}: -{formatPrice(discount.amountValue, discount.amountCurrency)}
                    </p>
                  ))}
                  <p>
                    <strong>Total final: {formatPrice(order.grandTotalValue, order.grandTotalCurrency)}</strong>
                  </p>
                </div>
              </article>

              <article className="account-block">
                <div className="account-block-header">
                  <strong>Faturas e remessas</strong>
                </div>
                <div className="account-block-body">
                  {order.invoices.length ? (
                    order.invoices.map((invoice) => (
                      <p key={invoice.id}>
                        Fatura #{invoice.number}: {formatPrice(invoice.grandTotalValue, invoice.grandTotalCurrency)}
                      </p>
                    ))
                  ) : (
                    <p>Nenhuma fatura encontrada.</p>
                  )}

                  {order.shipments.length ? (
                    order.shipments.map((shipment) => (
                      <p key={shipment.id}>
                        Remessa #{shipment.number}
                        {shipment.tracking[0]?.number ? ` - rastreio ${shipment.tracking[0].number}` : ''}
                      </p>
                    ))
                  ) : null}
                </div>
              </article>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
