function normalizeCepPayload(payload) {
  if (!payload || payload.erro) {
    return null;
  }

  return {
    city: payload.localidade || '',
    neighborhood: payload.bairro || '',
    postcode: payload.cep || '',
    region: payload.uf || '',
    street: payload.logradouro || '',
  };
}

export async function fetchAddressByCep(cep, signal) {
  const normalizedCep = String(cep || '').replace(/\D/g, '');

  if (normalizedCep.length !== 8) {
    throw new Error('Informe um CEP valido com 8 digitos.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`, {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel consultar o CEP informado.');
  }

  const payload = await response.json();
  const address = normalizeCepPayload(payload);

  if (!address) {
    throw new Error('CEP nao encontrado.');
  }

  return address;
}
