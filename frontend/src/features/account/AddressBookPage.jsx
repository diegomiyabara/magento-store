import { useEffect, useMemo, useState } from 'react';
import { useAccountController } from '../../presentation/controllers/useAccountController';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { fetchAddressByCep } from '../../lib/api/cep';
import { useAsyncData } from '../../lib/api/useAsyncData';
import { digitsOnly, maskCep, maskDocument, maskPhone } from '../../lib/utils/masks';

function createEmptyForm(customer = null) {
  return {
    city: '',
    company: '',
    countryCode: 'BR',
    defaultBilling: false,
    defaultShipping: false,
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
    vatId: '',
  };
}

const EMPTY_FORM = {
  city: '',
  company: '',
  countryCode: 'BR',
  defaultBilling: false,
  defaultShipping: false,
  firstName: '',
  lastName: '',
  postcode: '',
  region: '',
  regionId: '',
  street0: '',
  street1: '',
  street2: '',
  street3: '',
  telephone: '',
  vatId: '',
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="form-field-error">{message}</p>;
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

function AddressCard({ address, onDelete, onEdit, removingAddressId }) {
  return (
    <article className="account-block">
      <div className="account-block-header">
        <strong>
          {[address.defaultBilling ? 'Default Billing' : '', address.defaultShipping ? 'Default Shipping' : '']
            .filter(Boolean)
            .join(' / ') || 'Address'}
        </strong>
      </div>
      <div className="account-block-body">
        <p>{[address.firstName, address.lastName].filter(Boolean).join(' ')}</p>
        {address.street.map((line) => (
          <p key={`${address.id}-${line}`}>{line}</p>
        ))}
        <p>{[address.city, address.region, address.postcode].filter(Boolean).join(', ')}</p>
        <p>{address.countryCode}</p>
        <p>T: {address.telephone || '-'}</p>
        <div className="account-inline-actions">
          <button className="button-link account-inline-action" onClick={() => onEdit(address)} type="button">
            Editar
          </button>
          <button
            className="button-link account-inline-action"
            disabled={removingAddressId === address.id}
            onClick={() => onDelete(address)}
            type="button"
          >
            {removingAddressId === address.id ? 'Removendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AddressBookPage() {
  const account = useAccountController();
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [feedback, setFeedback] = useState({
    error: '',
    success: '',
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [removingAddressId, setRemovingAddressId] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [cepState, setCepState] = useState({
    isLoading: false,
    lastFetched: '',
    message: '',
  });
  const regionsState = useAsyncData(
    (signal) => account.useCases.getCountryRegions('BR', signal),
    [account.useCases],
  );
  const regions = regionsState.data ?? [];

  const currentAddress = useMemo(
    () => account.addresses.find((address) => address.id === editingAddressId) ?? null,
    [account.addresses, editingAddressId],
  );

  useEffect(() => {
    if (!currentAddress) {
      setForm(createEmptyForm(account.customer));
      return;
    }

    setForm({
      city: currentAddress.city || '',
      company: currentAddress.company || '',
      countryCode: currentAddress.countryCode || 'BR',
      defaultBilling: currentAddress.defaultBilling,
      defaultShipping: currentAddress.defaultShipping,
      firstName: currentAddress.firstName || '',
      lastName: currentAddress.lastName || '',
      postcode: currentAddress.postcode || '',
      region: currentAddress.region || '',
      regionId: currentAddress.regionId ? String(currentAddress.regionId) : '',
      street0: currentAddress.street?.[0] || '',
      street1: currentAddress.street?.[1] || '',
      street2: currentAddress.street?.[2] || '',
      street3: currentAddress.street?.[3] || '',
      telephone: currentAddress.telephone || '',
      vatId: currentAddress.vatId || '',
    });
  }, [account.customer, currentAddress]);

  useEffect(() => {
    if (!regions.length) {
      return;
    }

    setForm((current) => {
      if (current.regionId || !current.region.trim()) {
        return current;
      }

      const normalizedRegion = current.region.trim().toUpperCase();
      const matchedRegion = regions.find(
        (region) =>
          region.code.toUpperCase() === normalizedRegion ||
          region.name.toUpperCase() === normalizedRegion,
      );

      if (!matchedRegion) {
        return current;
      }

      return {
        ...current,
        region: matchedRegion.name,
        regionId: String(matchedRegion.id),
      };
    });
  }, [regions]);

  useEffect(() => {
    const cepDigits = digitsOnly(form.postcode);

    if (cepDigits.length !== 8 || cepState.lastFetched === cepDigits) {
      return undefined;
    }

    const controller = new AbortController();

    setCepState((current) => ({
      ...current,
      isLoading: true,
      message: '',
    }));

    fetchAddressByCep(cepDigits, controller.signal)
      .then((address) => {
        setForm((current) => ({
          ...current,
          city: current.city || address.city,
          postcode: maskCep(address.postcode),
          region: current.region || address.region,
          regionId:
            current.regionId ||
            String(
              regions.find((region) => region.code.toUpperCase() === address.region.toUpperCase())?.id || '',
            ),
          street0: current.street0 || address.street,
          street3: current.street3 || address.neighborhood,
        }));
        setCepState({
          isLoading: false,
          lastFetched: cepDigits,
          message: 'CEP encontrado. Endereco preenchido automaticamente.',
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        setCepState({
          isLoading: false,
          lastFetched: '',
          message: error.message,
        });
      });

    return () => {
      controller.abort();
    };
  }, [cepState.lastFetched, form.postcode]);

  const validationErrors = {
    firstName: !form.firstName.trim() ? 'Informe o primeiro nome.' : '',
    lastName: !form.lastName.trim() ? 'Informe o sobrenome.' : '',
    postcode: !digitsOnly(form.postcode)
      ? 'Informe o CEP.'
      : digitsOnly(form.postcode).length !== 8
        ? 'Informe um CEP valido.'
        : '',
    street0: !form.street0.trim() ? 'Informe o logradouro.' : '',
    street1: !form.street1.trim() ? 'Informe o numero.' : '',
    city: !form.city.trim() ? 'Informe a cidade.' : '',
    region: !form.regionId ? 'Selecione o estado.' : '',
    telephone: !digitsOnly(form.telephone)
      ? 'Informe o telefone.'
      : digitsOnly(form.telephone).length < 10
        ? 'Informe um telefone valido.'
        : '',
  };

  const hasValidationErrors = Object.values(validationErrors).some(Boolean);

  function resetForm() {
    setEditingAddressId(null);
    setForm(createEmptyForm(account.customer));
    setHasSubmitted(false);
    setIsFormVisible(false);
    setCepState({
      isLoading: false,
      lastFetched: '',
      message: '',
    });
  }

  function buildAddressInput() {
    const selectedRegion = regions.find((region) => String(region.id) === String(form.regionId));

    return {
      city: form.city.trim(),
      company: form.company.trim() || undefined,
      country_code: form.countryCode.trim().toUpperCase(),
      default_billing: form.defaultBilling,
      default_shipping: form.defaultShipping,
      firstname: form.firstName.trim(),
      lastname: form.lastName.trim(),
      postcode: maskCep(form.postcode),
      region: {
        region: selectedRegion?.name || form.region.trim(),
        region_code: selectedRegion?.code || form.region.trim(),
        region_id: selectedRegion?.id ?? null,
      },
      street: buildStreetLines(form),
      telephone: maskPhone(form.telephone),
      vat_id: form.vatId.trim() || undefined,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setHasSubmitted(true);
    setFeedback({ error: '', success: '' });

    if (hasValidationErrors) {
      setFeedback({ error: 'Preencha todos os campos obrigatorios antes de salvar.', success: '' });
      return;
    }

    setIsSaving(true);

    try {
      const isEditing = Boolean(editingAddressId);

      if (editingAddressId) {
        await account.useCases.updateCustomerAddress(account.token, editingAddressId, buildAddressInput());
      } else {
        await account.useCases.createCustomerAddress(account.token, buildAddressInput());
      }

      account.reload();
      resetForm();
      setFeedback({
        error: '',
        success: isEditing
          ? 'Endereco atualizado com sucesso.'
          : 'Endereco criado com sucesso.',
      });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(address) {
    const shouldDelete = window.confirm(
      `Deseja remover o endereco de ${[address.firstName, address.lastName].filter(Boolean).join(' ')}?`,
    );

    if (!shouldDelete) {
      return;
    }

    setFeedback({ error: '', success: '' });
    setRemovingAddressId(address.id);

    try {
      await account.useCases.deleteCustomerAddress(account.token, address.id);
      account.reload();

      if (editingAddressId === address.id) {
        resetForm();
      }

      setFeedback({
        error: '',
        success: 'Endereco removido com sucesso.',
      });
    } catch (error) {
      setFeedback({ error: error.message, success: '' });
    } finally {
      setRemovingAddressId(null);
    }
  }

  return (
    <>
      <section className="account-hero">
        <p className="eyebrow">Address Book</p>
        <h2>Manage your addresses</h2>
        <p>View your default billing and shipping addresses, as well as any saved addresses.</p>
      </section>

      {account.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar seus enderecos."
          detail={account.error.message}
        />
      ) : null}

      <section className="account-section">
        <div className="account-section-title">
          <h3>Address Book</h3>
          <div className="account-inline-actions">
            <span>
              {account.isInitialLoading
                ? 'Carregando enderecos...'
                : account.isRefreshing
                  ? 'Atualizando enderecos...'
                  : `${account.addresses.length} endereco(s)`}
            </span>
            {!isFormVisible ? (
              <button
                className="button-link account-inline-action"
                onClick={() => {
                  setFeedback({ error: '', success: '' });
                  setEditingAddressId(null);
                  setForm(createEmptyForm(account.customer));
                  setHasSubmitted(false);
                  setIsFormVisible(true);
                }}
                type="button"
              >
                Adicionar novo endereco
              </button>
            ) : null}
          </div>
        </div>

        {account.isInitialLoading ? (
          <InlineLoadingState title="Carregando enderecos..." />
        ) : account.addresses.length ? (
          <div className="account-grid">
            {account.addresses.map((address) => (
              <AddressCard
                address={address}
                key={address.id}
                onDelete={handleDelete}
                onEdit={(selectedAddress) => {
                  setFeedback({ error: '', success: '' });
                  setEditingAddressId(selectedAddress.id);
                  setHasSubmitted(false);
                  setIsFormVisible(true);
                }}
                removingAddressId={removingAddressId}
              />
            ))}
          </div>
        ) : (
          <article className="account-block">
            <div className="account-block-body">
              <p>Voce ainda nao possui enderecos cadastrados.</p>
            </div>
          </article>
        )}

        {isFormVisible ? (
          <article className="account-block">
            <div className="account-block-header">
              <strong>{editingAddressId ? 'Editar endereco' : 'Adicionar novo endereco'}</strong>
            </div>
            <div className="account-block-body">
              <form className="auth-form auth-form-compact" onSubmit={handleSubmit}>
                <div className="account-form-section">
                  <strong>Informacoes pessoais</strong>
                </div>

                <div className="auth-grid">
                  <label className="form-field">
                    <span>Primeiro nome *</span>
                    <input
                      onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                      placeholder="Seu nome"
                      type="text"
                      value={form.firstName}
                    />
                    {hasSubmitted ? <FieldError message={validationErrors.firstName} /> : null}
                  </label>

                  <label className="form-field">
                    <span>Sobrenome *</span>
                    <input
                      onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                      placeholder="Seu sobrenome"
                      type="text"
                      value={form.lastName}
                    />
                    {hasSubmitted ? <FieldError message={validationErrors.lastName} /> : null}
                  </label>
                </div>

                <div className="auth-grid">
                  <label className="form-field">
                    <span>Empresa</span>
                    <input
                      onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                      type="text"
                      value={form.company}
                    />
                  </label>

                  <label className="form-field">
                    <span>Telefone *</span>
                    <input
                      inputMode="tel"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          telephone: maskPhone(event.target.value),
                        }))
                      }
                      placeholder="(11) 99999-9999"
                      type="text"
                      value={form.telephone}
                    />
                    {hasSubmitted ? <FieldError message={validationErrors.telephone} /> : null}
                  </label>
                </div>

                <div className="account-form-section">
                  <strong>Endereco</strong>
                  <p>Comece pelo CEP para preencher os campos automaticamente.</p>
                </div>

                <div className="auth-grid">
                  <label className="form-field">
                    <span>CEP *</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) => {
                        const postcode = maskCep(event.target.value);

                        setForm((current) => ({
                          ...current,
                          postcode,
                        }));
                        setCepState((current) => ({
                          ...current,
                          lastFetched:
                            digitsOnly(postcode).length === 8 ? current.lastFetched : '',
                          message: '',
                        }));
                      }}
                      placeholder="00000-000"
                      type="text"
                      value={form.postcode}
                    />
                    {hasSubmitted ? <FieldError message={validationErrors.postcode} /> : null}
                    {cepState.isLoading ? <p className="form-field-help">Buscando CEP...</p> : null}
                    {!cepState.isLoading && cepState.message ? (
                      <p className={cepState.message.includes('preenchido') ? 'form-success' : 'form-error'}>
                        {cepState.message}
                      </p>
                    ) : null}
                  </label>
                </div>

                <label className="form-field">
                  <span>Logradouro *</span>
                  <input
                    onChange={(event) => setForm((current) => ({ ...current, street0: event.target.value }))}
                    placeholder="Rua, avenida, numero..."
                    type="text"
                    value={form.street0}
                  />
                  {hasSubmitted ? <FieldError message={validationErrors.street0} /> : null}
                </label>

                <div className="auth-grid auth-grid-3">
                  <label className="form-field">
                    <span>Numero *</span>
                    <input
                      inputMode="text"
                      onChange={(event) => setForm((current) => ({ ...current, street1: event.target.value }))}
                      placeholder="123"
                      type="text"
                      value={form.street1}
                    />
                    {hasSubmitted ? <FieldError message={validationErrors.street1} /> : null}
                  </label>

                  <label className="form-field">
                    <span>Complemento</span>
                    <input
                      onChange={(event) => setForm((current) => ({ ...current, street2: event.target.value }))}
                      placeholder="Apto, bloco, casa..."
                      type="text"
                      value={form.street2}
                    />
                  </label>

                  <label className="form-field">
                    <span>Bairro</span>
                    <input
                      onChange={(event) => setForm((current) => ({ ...current, street3: event.target.value }))}
                      placeholder="Seu bairro"
                      type="text"
                      value={form.street3}
                    />
                  </label>
                </div>

                <div className="auth-grid auth-grid-3">
                  <label className="form-field">
                    <span>Cidade *</span>
                    <input
                      onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                      placeholder="Sua cidade"
                      type="text"
                      value={form.city}
                    />
                    {hasSubmitted ? <FieldError message={validationErrors.city} /> : null}
                  </label>

                  <label className="form-field">
                    <span>Estado / Regiao *</span>
                    <select
                      onChange={(event) => {
                        const selectedRegion = regions.find(
                          (region) => String(region.id) === event.target.value,
                        );

                        setForm((current) => ({
                          ...current,
                          region: selectedRegion?.name || '',
                          regionId: event.target.value,
                        }));
                      }}
                      value={form.regionId}
                    >
                      <option value="">Selecione</option>
                      {regions.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.code} - {region.name}
                        </option>
                      ))}
                    </select>
                    {regionsState.isLoading ? <p className="form-field-help">Carregando estados...</p> : null}
                    {regionsState.error ? (
                      <p className="form-field-error">Nao foi possivel carregar os estados.</p>
                    ) : null}
                    {hasSubmitted ? <FieldError message={validationErrors.region} /> : null}
                  </label>
                </div>

                <div className="auth-grid">
                  <label className="form-field">
                    <span>CPF/CNPJ ou VAT</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          vatId: maskDocument(event.target.value),
                        }))
                      }
                      placeholder="000.000.000-00"
                      type="text"
                      value={form.vatId}
                    />
                  </label>

                  <label className="form-field">
                    <span>Pais</span>
                    <input disabled type="text" value="Brasil" />
                  </label>
                </div>

                <div className="account-checkbox-grid">
                  <label className="checkbox-field">
                    <input
                      checked={form.defaultShipping}
                      onChange={(event) => setForm((current) => ({ ...current, defaultShipping: event.target.checked }))}
                      type="checkbox"
                    />
                    <span>Endereco padrao de entrega</span>
                  </label>

                  <label className="checkbox-field">
                    <input
                      checked={form.defaultBilling}
                      onChange={(event) => setForm((current) => ({ ...current, defaultBilling: event.target.checked }))}
                      type="checkbox"
                    />
                    <span>Endereco padrao de cobranca</span>
                  </label>
                </div>

                {feedback.error ? <p className="form-error">{feedback.error}</p> : null}
                {feedback.success ? <p className="form-success">{feedback.success}</p> : null}

                <div className="account-inline-actions">
                  <button
                    className="button-link button-link-primary auth-submit account-inline-action"
                    disabled={isSaving || cepState.isLoading || hasValidationErrors}
                    type="submit"
                  >
                    {isSaving ? 'Salvando...' : editingAddressId ? 'Salvar endereco' : 'Adicionar endereco'}
                  </button>

                  <button className="button-link auth-submit account-inline-action" onClick={resetForm} type="button">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </article>
        ) : null}
      </section>
    </>
  );
}
