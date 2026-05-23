import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Truck, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useCart } from '@/application/cart/CartContext';
import { useAuth } from '@/app/authContext';
import { useStorefrontServices } from '@/app/storefrontContext';
import { formatPrice } from '@/lib/utils/formatters';
import { fetchAddressByCep } from '@/lib/api/cep';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

/* ── Zod schema ─────────────────────────────────────────── */
const addressSchema = z.object({
  email:      z.string().email('E-mail inválido').optional().or(z.literal('')),
  firstName:  z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:   z.string().min(2, 'Mínimo 2 caracteres'),
  street:     z.string().min(3, 'Endereço obrigatório'),
  number:     z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  postcode:   z.string().min(8, 'CEP inválido').max(9),
  city:       z.string().min(2, 'Cidade obrigatória'),
  region:     z.string().min(2, 'Estado obrigatório'),
  telephone:  z.string().min(10, 'Telefone inválido'),
});
type AddressForm = z.infer<typeof addressSchema>;

/* ── Steps ──────────────────────────────────────────────── */
const STEPS = [
  { id: 'address',  label: 'Endereço', icon: MapPin       },
  { id: 'shipping', label: 'Entrega',  icon: Truck        },
  { id: 'payment',  label: 'Pagamento',icon: CreditCard   },
] as const;
type Step = typeof STEPS[number]['id'];

interface ShippingMethod {
  carrierCode: string;
  methodCode: string;
  carrierTitle: string;
  methodTitle: string;
  price: number;
  currency: string;
  available: boolean;
}

interface PaymentMethod {
  code: string;
  title: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, isLoading: cartLoading } = useCart();
  const auth = useAuth();
  const { useCases } = useStorefrontServices();

  const [step, setStep] = useState<Step>('address');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [placing, setPlacing] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  const cartId = cart?.id ?? '';
  const token = auth.token ?? undefined;

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const clean = e.target.value.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const addr = await fetchAddressByCep(clean);
      if (addr) {
        setValue('city', addr.localidade ?? '');
        setValue('region', addr.uf ?? '');
        setValue('street', addr.logradouro ?? '');
      }
    } finally {
      setCepLoading(false);
    }
  }

  async function submitAddress(data: AddressForm) {
    if (!cartId) { toast.error('Carrinho não encontrado.'); return; }

    const address = {
      firstname: data.firstName,
      lastname: data.lastName,
      street: [`${data.street}, ${data.number}`, data.complement ?? ''].filter(Boolean),
      city: data.city,
      region: { region_code: data.region },
      country_code: 'BR',
      postcode: data.postcode.replace(/\D/g, ''),
      telephone: data.telephone,
      save_in_address_book: false,
    };

    try {
      if (!auth.isAuthenticated && data.email) {
        await useCases.setGuestEmailOnCart(cartId, data.email, undefined);
      }
      await useCases.setShippingAddressOnCart(cartId, { address }, token);
      await useCases.setBillingAddressOnCart(cartId, { address: { same_as_shipping: true } }, token);

      const methods = await useCases.estimateShippingMethods(cartId, {
        country_code: 'BR',
        postcode: address.postcode,
        region: data.region,
      }, token);

      setShippingMethods(methods.filter((m: ShippingMethod) => m.available));
      if (methods.length) setSelectedShipping(methods[0]);

      const cartWithPayments = await useCases.getCustomerCart(token!).catch(() =>
        useCases.getGuestCart(cartId)
      );
      setPaymentMethods(cartWithPayments?.availablePaymentMethods ?? []);

      setStep('shipping');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao processar endereço.');
    }
  }

  async function submitShipping() {
    if (!selectedShipping || !cartId) return;
    try {
      await useCases.setShippingMethodOnCart(
        cartId,
        selectedShipping.carrierCode,
        selectedShipping.methodCode,
        token,
      );
      setStep('payment');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao selecionar frete.');
    }
  }

  async function submitPayment() {
    if (!selectedPayment || !cartId) return;
    setPlacing(true);
    try {
      await useCases.setPaymentMethodOnCart(cartId, { code: selectedPayment }, token);
      const order = await useCases.placeOrder(cartId, token);
      navigate('/checkout/sucesso', { state: { orderNumber: order.number }, replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao finalizar pedido.');
    } finally {
      setPlacing(false);
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <>
      <Helmet><title>Checkout | DM3D Tech</title></Helmet>

      <div className="mx-auto max-w-[900px] px-4">
        <h1 className="mb-6 text-2xl font-bold text-text">Finalizar compra</h1>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-0">
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex;
            const active = s.id === step;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={[
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                    done   ? 'border-success bg-success/10 text-success'
                    : active ? 'border-brand bg-brand/10 text-brand'
                    : 'border-[var(--color-surface-border)] text-text-muted',
                  ].join(' ')}>
                    {done ? <Check size={15} /> : <Icon size={15} />}
                  </div>
                  <span className={['text-xs font-medium', active ? 'text-text' : 'text-text-muted'].join(' ')}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={['flex-1 h-0.5 mx-2 mb-4 transition-colors', done ? 'bg-success/40' : 'bg-[var(--color-surface-border)]'].join(' ')} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── Step content ─────────────────────────────── */}
          <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6">

            {/* ADDRESS */}
            {step === 'address' && (
              <form onSubmit={handleSubmit(submitAddress)} className="flex flex-col gap-4">
                <h2 className="mb-2 text-base font-semibold">Endereço de entrega</h2>

                {!auth.isAuthenticated && (
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nome" error={errors.firstName?.message} {...register('firstName')} />
                  <Input label="Sobrenome" error={errors.lastName?.message} {...register('lastName')} />
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    maxLength={9}
                    error={errors.postcode?.message}
                    {...register('postcode')}
                    onBlur={handleCepBlur}
                  />
                  <div className="flex items-end pb-0.5">
                    {cepLoading && <span className="text-xs text-text-muted">Buscando...</span>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
                  <Input label="Rua / Avenida" error={errors.street?.message} {...register('street')} />
                  <Input label="Número" error={errors.number?.message} {...register('number')} />
                </div>

                <Input label="Complemento (opcional)" {...register('complement')} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Cidade" error={errors.city?.message} {...register('city')} />
                  <Input label="Estado (UF)" maxLength={2} error={errors.region?.message} {...register('region')} />
                </div>

                <Input label="Telefone" type="tel" error={errors.telephone?.message} {...register('telephone')} />

                <Button variant="primary" type="submit" loading={isSubmitting} className="mt-2 self-end" size="lg">
                  Continuar <ChevronRight size={16} />
                </Button>
              </form>
            )}

            {/* SHIPPING */}
            {step === 'shipping' && (
              <div className="flex flex-col gap-4">
                <h2 className="mb-2 text-base font-semibold">Método de entrega</h2>
                {shippingMethods.length === 0 ? (
                  <p className="text-sm text-text-muted">Nenhum método disponível para o endereço informado.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {shippingMethods.map((m) => (
                      <label
                        key={`${m.carrierCode}_${m.methodCode}`}
                        className={[
                          'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
                          selectedShipping?.methodCode === m.methodCode
                            ? 'border-brand/40 bg-brand/10'
                            : 'border-[var(--color-surface-border)] hover:border-brand/20',
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.methodCode === m.methodCode}
                          onChange={() => setSelectedShipping(m)}
                          className="accent-brand"
                        />
                        <div className="flex flex-1 items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{m.carrierTitle} — {m.methodTitle}</p>
                          </div>
                          <span className="text-sm font-semibold text-brand">
                            {m.price === 0 ? 'Grátis' : formatPrice(m.price, m.currency)}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setStep('address')}>Voltar</Button>
                  <Button variant="primary" onClick={submitShipping} disabled={!selectedShipping} size="lg">
                    Continuar <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* PAYMENT */}
            {step === 'payment' && (
              <div className="flex flex-col gap-4">
                <h2 className="mb-2 text-base font-semibold">Método de pagamento</h2>
                <div className="flex flex-col gap-2">
                  {(paymentMethods.length ? paymentMethods : cart?.availablePaymentMethods ?? []).map((m) => (
                    <label
                      key={m.code}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
                        selectedPayment === m.code
                          ? 'border-brand/40 bg-brand/10'
                          : 'border-[var(--color-surface-border)] hover:border-brand/20',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.code}
                        checked={selectedPayment === m.code}
                        onChange={() => setSelectedPayment(m.code)}
                        className="accent-brand"
                      />
                      <span className="text-sm font-medium">{m.title}</span>
                    </label>
                  ))}
                </div>

                {/* order total review */}
                <div className="mt-2 rounded-xl border border-[var(--color-surface-border)] p-3 text-sm">
                  <div className="flex justify-between text-text-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart?.subtotal?.value ?? 0, 'BRL')}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between text-text-muted">
                      <span>Frete</span>
                      <span>{selectedShipping.price === 0 ? 'Grátis' : formatPrice(selectedShipping.price, selectedShipping.currency)}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between border-t border-[var(--color-surface-border)] pt-2 font-bold text-base">
                    <span>Total</span>
                    <span className="text-brand">{formatPrice(cart?.grandTotal?.value ?? 0, 'BRL')}</span>
                  </div>
                </div>

                <div className="mt-2 flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setStep('shipping')}>Voltar</Button>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={placing || cartLoading}
                    disabled={!selectedPayment}
                    onClick={submitPayment}
                  >
                    Confirmar pedido
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Mini summary ─────────────────────────────── */}
          <div className="h-fit rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4 lg:sticky lg:top-24">
            <h2 className="mb-3 text-sm font-semibold text-text">Seu pedido</h2>
            <div className="flex flex-col gap-1 text-sm text-text-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cart?.subtotal?.value ?? 0, 'BRL')}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[var(--color-surface-border)] pt-2 font-semibold text-text">
                <span>Total</span>
                <span className="text-brand">{formatPrice(cart?.grandTotal?.value ?? 0, 'BRL')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
