import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useAccountController } from '@/presentation/controllers/useAccountController';
import { fetchAddressByCep } from '@/lib/api/cep';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LoadingState, EmptyState } from '@/components/ui/PageState';
import { toast } from 'sonner';

const schema = z.object({
  firstName:  z.string().min(2),
  lastName:   z.string().min(2),
  street:     z.string().min(3),
  number:     z.string().min(1),
  complement: z.string().optional(),
  postcode:   z.string().min(8).max(9),
  city:       z.string().min(2),
  region:     z.string().min(2),
  telephone:  z.string().min(10),
  isDefault:  z.boolean().optional(),
});
type AddressForm = z.infer<typeof schema>;

interface Address {
  id: number;
  firstName: string;
  lastName: string;
  street: string[];
  city: string;
  region: string;
  postcode: string;
  telephone: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

export default function AddressBookPage() {
  const { addresses, token, useCases, reload, isInitialLoading } = useAccountController();
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<AddressForm>({
    resolver: zodResolver(schema),
  });

  if (isInitialLoading) return <LoadingState title="Carregando endereços..." />;

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const clean = e.target.value.replace(/\D/g, '');
    if (clean.length !== 8) return;
    const addr = await fetchAddressByCep(clean).catch(() => null);
    if (addr) {
      setValue('city', addr.localidade ?? '');
      setValue('region', addr.uf ?? '');
      setValue('street', addr.logradouro ?? '');
    }
  }

  async function onSubmit(data: AddressForm) {
    const input = {
      firstname: data.firstName,
      lastname: data.lastName,
      street: [`${data.street}, ${data.number}`, data.complement ?? ''].filter(Boolean),
      city: data.city,
      region: { region_code: data.region },
      country_code: 'BR',
      postcode: data.postcode.replace(/\D/g, ''),
      telephone: data.telephone,
      default_shipping: data.isDefault ?? false,
      default_billing: data.isDefault ?? false,
    };

    try {
      if (editing?.id) {
        await useCases.updateCustomerAddress(token!, editing.id, input);
        toast.success('Endereço atualizado!');
      } else {
        await useCases.createCustomerAddress(token!, input);
        toast.success('Endereço adicionado!');
      }
      reload?.();
      setShowForm(false);
      setEditing(null);
      reset();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar endereço.');
    }
  }

  async function handleDelete(id: number) {
    try {
      await useCases.deleteCustomerAddress(token!, id);
      reload?.();
      toast.success('Endereço removido.');
    } catch {
      toast.error('Erro ao remover endereço.');
    }
  }

  function startEdit(addr: Address) {
    setEditing(addr);
    reset({
      firstName:  addr.firstName,
      lastName:   addr.lastName,
      city:       addr.city,
      region:     addr.region,
      postcode:   addr.postcode,
      telephone:  addr.telephone,
      street:     addr.street?.[0] ?? '',
      number:     '',
    });
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text">Meus endereços</h2>
        {!showForm && (
          <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditing(null); reset(); }}>
            <Plus size={14} /> Adicionar
          </Button>
        )}
      </div>

      {/* form */}
      {showForm && (
        <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">
            {editing ? 'Editar endereço' : 'Novo endereço'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Sobrenome" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="CEP" maxLength={9} error={errors.postcode?.message} {...register('postcode')} onBlur={handleCepBlur} />
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
            <label className="flex items-center gap-2 text-sm text-text-soft">
              <input type="checkbox" {...register('isDefault')} className="h-4 w-4 rounded accent-brand" />
              Definir como padrão
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" type="button" onClick={() => { setShowForm(false); setEditing(null); reset(); }}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" loading={isSubmitting}>
                Salvar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* list */}
      {addresses.length === 0 && !showForm ? (
        <EmptyState title="Nenhum endereço cadastrado" detail="Adicione um endereço para agilizar seus pedidos." />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((addr: Address) => (
            <div key={addr.id} className="flex items-start justify-between rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-4">
              <address className="not-italic text-sm text-text-soft leading-relaxed">
                <span className="font-medium text-text">{addr.firstName} {addr.lastName}</span><br />
                {addr.street?.join(', ')}<br />
                {addr.city} – {addr.region} · {addr.postcode}<br />
                {addr.telephone}
                {(addr.defaultShipping || addr.defaultBilling) && (
                  <span className="mt-1 inline-block rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-brand">
                    Padrão
                  </span>
                )}
              </address>
              <div className="flex shrink-0 gap-1 ml-3">
                <button onClick={() => startEdit(addr)} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-black/5 hover:text-text">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-black/5 hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
