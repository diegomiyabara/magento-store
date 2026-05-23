import { useState } from 'react';
import { Truck, MapPin } from 'lucide-react';
import { useCart } from '@/application/cart/CartContext';
import { fetchAddressByCep } from '@/lib/api/cep';
import { formatPrice } from '@/lib/utils/formatters';
import Button from '@/components/ui/Button';

interface ShippingMethod {
  carrierCode: string;
  methodCode: string;
  carrierTitle: string;
  methodTitle: string;
  price: number;
  currency: string;
  available: boolean;
}

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function ShippingEstimator() {
  const { estimateShipping, items } = useCart() as {
    estimateShipping: (address: object, signal?: AbortSignal) => Promise<ShippingMethod[]>;
    items: unknown[];
  };

  const [cep, setCep] = useState('');
  const [location, setLocation] = useState<{ city: string; region: string } | null>(null);
  const [methods, setMethods] = useState<ShippingMethod[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = cep.replace(/\D/g, '');
  const isReady = digits.length === 8;

  function reset() {
    setMethods(null);
    setError(null);
    setLocation(null);
  }

  async function handleEstimate() {
    if (!isReady) return;
    setLoading(true);
    reset();

    try {
      const addr = await fetchAddressByCep(digits);
      setLocation({ city: addr.city, region: addr.region });

      const result = await estimateShipping({
        country_code: 'BR',
        postcode: digits,
        region: { region_code: addr.region },
      });

      const available = result.filter((m) => m.available);
      if (!available.length) {
        setError('Nenhuma opção de entrega disponível para este CEP.');
      } else {
        setMethods(available);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular o frete.');
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
        <Truck size={14} className="text-brand" />
        Calcular frete
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          maxLength={9}
          onChange={(e) => {
            setCep(formatCep(e.target.value));
            reset();
          }}
          onKeyDown={(e) => e.key === 'Enter' && isReady && handleEstimate()}
          className="flex-1 rounded-xl border border-[var(--color-surface-border)] bg-transparent px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <Button
          variant="secondary"
          onClick={handleEstimate}
          loading={loading}
          disabled={!isReady}
        >
          Calcular
        </Button>
      </div>

      {location && (
        <p className="mt-2 flex items-center gap-1 text-xs text-text-muted">
          <MapPin size={11} />
          {location.city} – {location.region}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      {methods && (
        <ul className="mt-3 flex flex-col gap-2">
          {methods.map((m) => (
            <li
              key={`${m.carrierCode}-${m.methodCode}`}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text">{m.carrierTitle}</p>
                <p className="truncate text-xs text-text-muted">{m.methodTitle}</p>
              </div>
              <span
                className={[
                  'ml-4 shrink-0 text-sm font-semibold',
                  m.price === 0 ? 'text-success' : 'text-text',
                ].join(' ')}
              >
                {m.price === 0 ? 'Grátis' : formatPrice(m.price, m.currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
