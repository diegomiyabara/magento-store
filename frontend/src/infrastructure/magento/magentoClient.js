import { apiConfig } from '../../lib/api/config';

const responseCache = new Map();
const inFlightRequests = new Map();
const DEFAULT_CACHE_TTL_MS = 60_000;

function buildCacheKey(query, variables) {
  return JSON.stringify({
    store: apiConfig.storeCode,
    query,
    variables,
  });
}

async function parseResponse(response) {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Falha ao consultar o Magento.');
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message || 'Erro GraphQL no Magento.');
  }

  return payload.data;
}

export async function executeMagentoQuery(query, variables = {}, options = {}) {
  const { cacheTtlMs = DEFAULT_CACHE_TTL_MS, skipCache = false, signal } = options;
  const cacheKey = buildCacheKey(query, variables);
  const cachedEntry = responseCache.get(cacheKey);

  if (!skipCache && cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.data;
  }

  if (!skipCache && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const response = await fetch(apiConfig.graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Store: apiConfig.storeCode,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  const request = parseResponse(response)
    .then((data) => {
      if (!skipCache) {
        responseCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + cacheTtlMs,
        });
      }

      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  if (!skipCache) {
    inFlightRequests.set(cacheKey, request);
  }

  return request;
}
