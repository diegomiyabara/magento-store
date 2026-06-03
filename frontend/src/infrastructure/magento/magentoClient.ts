import { apiConfig } from './config';

export interface QueryOptions {
  authToken?: string;
  cacheTtlMs?: number;
  extraHeaders?: Record<string, string>;
  skipCache?: boolean;
  signal?: AbortSignal;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const DEFAULT_CACHE_TTL_MS = 60_000;

function buildCacheKey(query: string, variables: Record<string, unknown>, authToken = ''): string {
  return JSON.stringify({
    authToken,
    store: apiConfig.storeCode,
    query,
    variables,
  });
}

async function parseResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload: { data?: T; errors?: Array<{ message?: string }>; message?: string } | null = null;

  try {
    payload = responseText ? JSON.parse(responseText) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        payload?.errors?.[0]?.message ||
        responseText ||
        'Falha ao consultar o Magento.',
    );
  }

  if (payload?.errors?.length) {
    throw new Error(payload.errors[0]?.message || 'Erro GraphQL no Magento.');
  }

  return payload?.data as T;
}

export async function executeMagentoQuery<T = Record<string, unknown>>(
  query: string,
  variables: Record<string, unknown> = {},
  options: QueryOptions = {},
): Promise<T> {
  const {
    authToken,
    cacheTtlMs = DEFAULT_CACHE_TTL_MS,
    extraHeaders = {},
    skipCache = false,
    signal,
  } = options;
  const cacheKey = buildCacheKey(query, variables, authToken);
  const cachedEntry = responseCache.get(cacheKey) as CacheEntry<T> | undefined;

  if (!skipCache && cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.data;
  }

  if (!skipCache && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>;
  }

  const response = await fetch(apiConfig.graphqlUrl, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      Store: apiConfig.storeCode,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...extraHeaders,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  const request = parseResponse<T>(response)
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
