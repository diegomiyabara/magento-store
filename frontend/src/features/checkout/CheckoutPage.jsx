import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/authContext';
import { useCart } from '../../application/cart/CartContext';
import { useStorefrontServices } from '../../app/storefrontContext';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { useAsyncData } from '../../lib/api/useAsyncData';
import { digitsOnly, maskCep, maskPhone } from '../../lib/utils/masks';
import { formatPrice } from '../../lib/utils/formatters';

function createEmptyAddress(customer = null) {
  return {
    city: '',
    company: '',
    countryCode: 'BR',
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    postcode: '',
    region: '',
    regionId: '',
    street0: '',
    street1: '',
    street2: '',
    street3: '',
    telephone: '',
    vatId: customer?.taxvat || '',
  };
}

function mapAddressToForm(address, customer = null) {
  if (!address) {
    return createEmptyAddress(customer);
  }

  return {
    city: address.city || '',
    company: address.company || '',
    countryCode: address.countryCode || 'BR',
    firstName: address.firstName || customer?.firstName || '',
    lastName: address.lastName || customer?.lastName || '',
    postcode: address.postcode || '',
    region: address.region || '',
    regionId: address.regionId ? String(address.regionId) : '',
    street0: address.street?.[0] || '',
    street1: address.street?.[1] || '',
    street2: address.street?.[2] || '',
    street3: address.street?.[3] || '',
    telephone: address.telephone || '',
    vatId: address.vatId || customer?.taxvat || '',
  };
}

function buildStreetLines(form) {
  const line1 = [form.street0.trim(), form.street1.trim() ? `, ${form.street1.trim()}` : '']
    .join('')
    .trim();
  const line2 = [form.street2.trim(), form.street3.trim()]
    .filter(Boolean)
    .join(' - ');

  return [line1, line2].filter(Boolean);
}

function buildCartAddressInput(form, regions) {
  const selectedRegion = regions.find((region) => String(region.id) === String(form.regionId));

  return {
    city: form.city.trim(),
    company: form.company.trim() || undefined,
    country_code: form.countryCode,
    firstname: form.firstName.trim(),
    lastname: form.lastName.trim(),
    postcode: maskCep(form.postcode),
    region: selectedRegion?.name || form.region.trim() || undefined,
    region_id: selectedRegion?.id ?? (form.regionId ? Number(form.regionId) : undefined),
    street: buildStreetLines(form),
    telephone: maskPhone(form.telephone),
    vat_id: form.vatId.trim() || undefined,
  };
}

function validateAddress(form) {
  return {
    city: !form.city.trim() ? 'Informe a cidade.' : '',
    firstName: !form.firstName.trim() ? 'Informe o primeiro nome.' : '',
    lastName: !form.lastName.trim() ? 'Informe o sobrenome.' : '',
    postcode: !digitsOnly(form.postcode)
      ? 'Informe o CEP.'
      : digitsOnly(form.postcode).length !== 8
        ? 'Informe um CEP valido.'
        : '',
    regionId: !form.regionId ? 'Selecione o estado.' : '',
    street0: !form.street0.trim() ? 'Informe o logradouro.' : '',
    street1: !form.street1.trim() ? 'Informe o numero.' : '',
    telephone: !digitsOnly(form.telephone)
      ? 'Informe o telefone.'
      : digitsOnly(form.telephone).length < 10
        ? 'Informe um telefone valido.'
        : '',
  };
}

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="form-field-error">{message}</p>;
}

function AddressFields({ form, onChange, regions, errors, title }) {
  return (
    <div className="checkout-section-body">
      {title ? (
        <div className="account-form-section">
          <strong>{title}</strong>
        </div>
      ) : null}

      <div className="auth-grid">
        <label className="form-field">
          <span>Primeiro nome *</span>
          <input
            onChange={(event) => onChange('firstName', event.target.value)}
            type="text"
            value={form.firstName}
          />
          <FieldError message={errors.firstName} />
        </label>

        <label className="form-field">
          <span>Sobrenome *</span>
          <input
            onChange={(event) => onChange('lastName', event.target.value)}
            type="text"
            value={form.lastName}
          />
          <FieldError message={errors.lastName} />
        </label>
      </div>

      <div className="auth-grid">
        <label className="form-field">
          <span>Empresa</span>
          <input
            onChange={(event) => onChange('company', event.target.value)}
            type="text"
            value={form.company}
          />
        </label>

        <label className="form-field">
          <span>Telefone *</span>
          <input
            inputMode="tel"
            onChange={(event) => onChange('telephone', maskPhone(event.target.value))}
            type="text"
            value={form.telephone}
          />
          <FieldError message={errors.telephone} />
        </label>
      </div>

      <div className="auth-grid">
        <label className="form-field">
          <span>CEP *</span>
          <input
            inputMode="numeric"
            onChange={(event) => onChange('postcode', maskCep(event.target.value))}
            type="text"
            value={form.postcode}
          />
          <FieldError message={errors.postcode} />
        </label>

        <label className="form-field">
          <span>CPF/CNPJ</span>
          <input
            onChange={(event) => onChange('vatId', event.target.value)}
            type="text"
            value={form.vatId}
          />
        </label>
      </div>

      <label className="form-field">
        <span>Logradouro *</span>
        <input
          onChange={(event) => onChange('street0', event.target.value)}
          type="text"
          value={form.street0}
        />
        <FieldError message={errors.street0} />
      </label>

      <div className="auth-grid auth-grid-3">
        <label className="form-field">
          <span>Numero *</span>
          <input
            onChange={(event) => onChange('street1', event.target.value)}
            type="text"
            value={form.street1}
          />
          <FieldError message={errors.street1} />
        </label>

        <label className="form-field">
          <span>Complemento</span>
          <input
            onChange={(event) => onChange('street2', event.target.value)}
            type="text"
            value={form.street2}
          />
        </label>

        <label className="form-field">
          <span>Bairro</span>
          <input
            onChange={(event) => onChange('street3', event.target.value)}
            type="text"
            value={form.street3}
          />
        </label>
      </div>

      <div className="auth-grid">
        <label className="form-field">
          <span>Cidade *</span>
          <input
            onChange={(event) => onChange('city', event.target.value)}
            type="text"
            value={form.city}
          />
          <FieldError message={errors.city} />
        </label>

        <label className="form-field">
          <span>Estado *</span>
          <select
            onChange={(event) => {
              const selectedRegion = regions.find(
                (region) => String(region.id) === String(event.target.value),
              );

              onChange('regionId', event.target.value);
              onChange('region', selectedRegion?.name || '');
            }}
            value={form.regionId}
          >
            <option value="">Selecione</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.regionId} />
        </label>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const account = useAccountController();
  const { cart, isLoading: isCartLoading, clearCart, setCartSnapshot } = useCart();
  const { useCases } = useStorefrontServices();
  const regionsState = useAsyncData(
    (signal) => useCases.getCountryRegions('BR', signal),
    [useCases],
  );
  const regions = regionsState.data ?? [];
  const [guestEmail, setGuestEmail] = useState(auth.customer?.email || '');
  const [shippingForm, setShippingForm] = useState(createEmptyAddress(auth.customer));
  const [billingForm, setBillingForm] = useState(createEmptyAddress(auth.customer));
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [hasSubmittedAddress, setHasSubmittedAddress] = useState(false);

  useEffect(() => {
    if (!guestEmail && auth.customer?.email) {
      setGuestEmail(auth.customer.email);
    }
  }, [auth.customer, guestEmail]);

  useEffect(() => {
    if (!account.defaultShippingAddress || shippingForm.postcode || !auth.isAuthenticated) {
      return;
    }

    setShippingForm(mapAddressToForm(account.defaultShippingAddress, auth.customer));
  }, [account.defaultShippingAddress, auth.customer, auth.isAuthenticated, shippingForm.postcode]);

  useEffect(() => {
    if (!account.defaultBillingAddress || billingForm.postcode || !auth.isAuthenticated) {
      return;
    }

    setBillingForm(mapAddressToForm(account.defaultBillingAddress, auth.customer));
  }, [account.defaultBillingAddress, auth.customer, auth.isAuthenticated, billingForm.postcode]);

  useEffect(() => {
    if (!cart?.selectedPaymentMethod?.code) {
      return;
    }

    setSelectedPaymentMethod(cart.selectedPaymentMethod.code);
  }, [cart?.selectedPaymentMethod?.code]);

  const shippingErrors = useMemo(() => validateAddress(shippingForm), [shippingForm]);
  const billingErrors = useMemo(() => validateAddress(billingForm), [billingForm]);
  const hasShippingErrors = Object.values(shippingErrors).some(Boolean);
  const hasBillingErrors = !sameAsShipping && Object.values(billingErrors).some(Boolean);
  const shippingMethods = (cart?.shippingAddresses?.[0]?.availableShippingMethods ?? []).filter(
    (method) => method.available && method.methodCode,
  );
  const paymentMethods = cart?.availablePaymentMethods ?? [];

  function updateShippingField(field, value) {
    setShippingForm((current) => ({ ...current, [field]: value }));
  }

  function updateBillingField(field, value) {
    setBillingForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSaveAddresses(event) {
    event.preventDefault();
    setHasSubmittedAddress(true);
    setFeedback({ error: '', success: '' });

    if (!auth.isAuthenticated && !guestEmail.trim()) {
      setFeedback({ error: 'Informe o email para continuar no checkout.', success: '' });
      return;
    }

    if (hasShippingErrors || hasBillingErrors) {
      setFeedback({ error: 'Preencha os campos obrigatorios para continuar.', success: '' });
      return;
    }

    if (!cart?.id) {
      setFeedback({ error: 'Seu carrinho nao esta disponivel no momento.', success: '' });
      return;
    }

    const controller = new AbortController();
    setIsSavingAddress(true);

    try {
      let nextCart = cart;

      if (!auth.isAuthenticated) {
        nextCart = await useCases.setGuestEmailOnCart(
          cart.id,
          guestEmail.trim(),
          auth.token,
          controller.signal,
        );
        setCartSnapshot(nextCart, { persistGuest: true });
      }

      nextCart = await useCases.setShippingAddressOnCart(
        cart.id,
        { address: buildCartAddressInput(shippingForm, regions) },
        auth.token,
        controller.signal,
      );
      setCartSnapshot(nextCart, { persistGuest: !auth.token });

      nextCart = await useCases.setBillingAddressOnCart(
        cart.id,
        sameAsShipping
          ? { same_as_shipping: true }
          : { address: buildCartAddressInput(billingForm, regions) },
        auth.token,
        controller.signal,
      );
      setCartSnapshot(nextCart, { persistGuest: !auth.token });

      setFeedback({
        error: '',
        success: 'Enderecos salvos. Agora escolha o frete e o pagamento.',
      });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function handleSaveShippingMethod(event) {
    event.preventDefault();
    setFeedback({ error: '', success: '' });

    if (!selectedShippingMethod) {
      setFeedback({ error: 'Selecione um metodo de entrega.', success: '' });
      return;
    }

    const method = shippingMethods.find(
      (item) => `${item.carrierCode}::${item.methodCode}` === selectedShippingMethod,
    );

    if (!method || !cart?.id) {
      setFeedback({ error: 'Metodo de entrega invalido.', success: '' });
      return;
    }

    const controller = new AbortController();
    setIsSavingShipping(true);

    try {
      const nextCart = await useCases.setShippingMethodOnCart(
        cart.id,
        method.carrierCode,
        method.methodCode,
        auth.token,
        controller.signal,
      );

      setCartSnapshot(nextCart, { persistGuest: !auth.token });
      setFeedback({
        error: '',
        success: 'Metodo de entrega salvo. Agora escolha a forma de pagamento.',
      });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setIsSavingShipping(false);
    }
  }

  async function handleSavePaymentMethod(event) {
    event.preventDefault();
    setFeedback({ error: '', success: '' });

    if (!selectedPaymentMethod || !cart?.id) {
      setFeedback({ error: 'Selecione uma forma de pagamento.', success: '' });
      return;
    }

    const controller = new AbortController();
    setIsSavingPayment(true);

    try {
      const nextCart = await useCases.setPaymentMethodOnCart(
        cart.id,
        { code: selectedPaymentMethod },
        auth.token,
        controller.signal,
      );

      setCartSnapshot(nextCart, { persistGuest: !auth.token });
      setFeedback({
        error: '',
        success: 'Pagamento salvo. Revise o pedido e finalize a compra.',
      });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setIsSavingPayment(false);
    }
  }

  async function handlePlaceOrder() {
    setFeedback({ error: '', success: '' });

    if (!cart?.id) {
      setFeedback({ error: 'Seu carrinho nao esta disponivel no momento.', success: '' });
      return;
    }

    if (!cart.selectedPaymentMethod?.code) {
      setFeedback({ error: 'Defina a forma de pagamento antes de finalizar.', success: '' });
      return;
    }

    if (!cart.isVirtual && !cart.shippingAddresses?.[0]?.selectedShippingMethod?.methodCode) {
      setFeedback({ error: 'Defina o metodo de entrega antes de finalizar.', success: '' });
      return;
    }

    const controller = new AbortController();
    setIsPlacingOrder(true);

    try {
      const order = await useCases.placeOrder(cart.id, auth.token, controller.signal);
      clearCart();
      navigate('/checkout/sucesso', {
        state: {
          orderNumber: order.number,
        },
      });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (isCartLoading && !cart) {
    return (
      <div className="container checkout-page">
        <InlineLoadingState title="Carregando checkout..." />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="container checkout-page">
        <section className="auth-card">
          <p className="eyebrow">Checkout</p>
          <h1>Seu carrinho esta vazio.</h1>
          <p className="auth-copy">Adicione produtos antes de prosseguir para a finalizacao.</p>
          <Link className="button-link button-link-primary auth-submit" to="/">
            Voltar para a loja
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <section className="checkout-header">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Finalize sua compra no headless.</h1>
          <p className="auth-copy">
            Preencha seus dados, confirme frete e pagamento, e envie o pedido para o Magento.
          </p>
        </div>
        <Link className="button-link" to="/carrinho">
          Voltar ao carrinho
        </Link>
      </section>

      {feedback.error ? <p className="form-error">{feedback.error}</p> : null}
      {feedback.success ? <p className="form-success">{feedback.success}</p> : null}

      <div className="checkout-layout">
        <div className="checkout-main">
          <article className="account-block">
            <div className="account-block-header">
              <strong>1. Contato e endereco</strong>
            </div>
            <div className="account-block-body">
              <form className="auth-form auth-form-compact" onSubmit={handleSaveAddresses}>
                {!auth.isAuthenticated ? (
                  <label className="form-field">
                    <span>Email para o pedido *</span>
                    <input
                      onChange={(event) => setGuestEmail(event.target.value)}
                      type="email"
                      value={guestEmail}
                    />
                  </label>
                ) : (
                  <div className="checkout-summary-strip">
                    <strong>Cliente autenticado</strong>
                    <span>{auth.customer?.email}</span>
                  </div>
                )}

                <AddressFields
                  errors={hasSubmittedAddress ? shippingErrors : {}}
                  form={shippingForm}
                  onChange={updateShippingField}
                  regions={regions}
                  title={cart.isVirtual ? 'Endereco do pedido' : 'Endereco de entrega'}
                />

                <label className="checkbox-field">
                  <input
                    checked={sameAsShipping}
                    onChange={(event) => setSameAsShipping(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Usar o mesmo endereco para cobranca.</span>
                </label>

                {!sameAsShipping ? (
                  <AddressFields
                    errors={hasSubmittedAddress ? billingErrors : {}}
                    form={billingForm}
                    onChange={updateBillingField}
                    regions={regions}
                    title="Endereco de cobranca"
                  />
                ) : null}

                <button className="button-link button-link-primary auth-submit" disabled={isSavingAddress} type="submit">
                  {isSavingAddress ? 'Salvando endereco...' : 'Salvar endereco'}
                </button>
              </form>
            </div>
          </article>

          {!cart.isVirtual ? (
            <article className="account-block">
              <div className="account-block-header">
                <strong>2. Metodo de entrega</strong>
              </div>
              <div className="account-block-body">
                {!shippingMethods.length ? (
                  <p className="auth-copy">
                    Salve o endereco para carregar as opcoes de entrega disponiveis.
                  </p>
                ) : (
                  <form className="auth-form auth-form-compact" onSubmit={handleSaveShippingMethod}>
                    <div className="checkout-option-list">
                      {shippingMethods.map((method) => {
                        const value = `${method.carrierCode}::${method.methodCode}`;

                        return (
                          <label className="checkout-option" key={value}>
                            <input
                              checked={selectedShippingMethod === value}
                              name="shippingMethod"
                              onChange={() => setSelectedShippingMethod(value)}
                              type="radio"
                            />
                            <span>
                              <strong>{method.carrierTitle} - {method.methodTitle}</strong>
                              <small>{formatPrice(method.price, method.currency)}</small>
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    <button className="button-link button-link-primary auth-submit" disabled={isSavingShipping} type="submit">
                      {isSavingShipping ? 'Salvando frete...' : 'Salvar frete'}
                    </button>
                  </form>
                )}
              </div>
            </article>
          ) : null}

          <article className="account-block">
            <div className="account-block-header">
              <strong>{cart.isVirtual ? '2. Pagamento' : '3. Pagamento'}</strong>
            </div>
            <div className="account-block-body">
              {!paymentMethods.length ? (
                <p className="auth-copy">
                  {cart.isVirtual
                    ? 'Salve o endereco para carregar as formas de pagamento.'
                    : 'Salve o frete para carregar as formas de pagamento.'}
                </p>
              ) : (
                <form className="auth-form auth-form-compact" onSubmit={handleSavePaymentMethod}>
                  <div className="checkout-option-list">
                    {paymentMethods.map((method) => (
                      <label className="checkout-option" key={method.code}>
                        <input
                          checked={selectedPaymentMethod === method.code}
                          name="paymentMethod"
                          onChange={() => setSelectedPaymentMethod(method.code)}
                          type="radio"
                        />
                        <span>
                          <strong>{method.title}</strong>
                          <small>{method.code}</small>
                        </span>
                      </label>
                    ))}
                  </div>

                  <button className="button-link button-link-primary auth-submit" disabled={isSavingPayment} type="submit">
                    {isSavingPayment ? 'Salvando pagamento...' : 'Salvar pagamento'}
                  </button>
                </form>
              )}
            </div>
          </article>
        </div>

        <aside className="checkout-sidebar">
          <article className="account-block">
            <div className="account-block-header">
              <strong>Resumo do pedido</strong>
            </div>
            <div className="account-block-body account-stack">
              {cart.items.map((item) => {
                const unitPrice =
                  item.configuredVariant?.finalPrice ??
                  item.product?.finalPrice ??
                  item.product?.regularPrice ??
                  0;

                return (
                  <div className="checkout-line-item" key={item.uid}>
                    <div>
                      <strong>{item.product?.name}</strong>
                      <p>{item.quantity} x {formatPrice(unitPrice, item.product?.currency || 'BRL')}</p>
                    </div>
                    <span>{formatPrice(unitPrice * item.quantity, item.product?.currency || 'BRL')}</span>
                  </div>
                );
              })}

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal?.value ?? 0, cart.subtotal?.currency ?? 'BRL')}</span>
                </div>
                <div className="checkout-total-row">
                  <span>Frete</span>
                  <span>
                    {cart.totalShipping?.value != null
                      ? formatPrice(cart.totalShipping.value, cart.totalShipping.currency)
                      : 'A definir'}
                  </span>
                </div>
                <div className="checkout-total-row">
                  <span>Impostos</span>
                  <span>{formatPrice(cart.totalTax?.value ?? 0, cart.totalTax?.currency ?? 'BRL')}</span>
                </div>
                <div className="checkout-total-row total">
                  <span>Total</span>
                  <span>{formatPrice(cart.grandTotal?.value ?? 0, cart.grandTotal?.currency ?? 'BRL')}</span>
                </div>
              </div>

              <div className="checkout-summary-strip">
                <strong>Pagamento selecionado</strong>
                <span>{cart.selectedPaymentMethod?.title || 'Ainda nao definido'}</span>
              </div>

              {!cart.isVirtual ? (
                <div className="checkout-summary-strip">
                  <strong>Entrega selecionada</strong>
                  <span>
                    {cart.shippingAddresses?.[0]?.selectedShippingMethod
                      ? `${cart.shippingAddresses[0].selectedShippingMethod.carrierTitle} - ${cart.shippingAddresses[0].selectedShippingMethod.methodTitle}`
                      : 'Ainda nao definida'}
                  </span>
                </div>
              ) : null}

              <button
                className="cart-checkout-button"
                disabled={isPlacingOrder}
                onClick={handlePlaceOrder}
                type="button"
              >
                {isPlacingOrder ? 'Finalizando pedido...' : 'Confirmar pedido'}
              </button>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
