export function formatPrice(price: number, currency = 'BRL'): string {
  if (typeof price !== 'number') {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatDate(dateString: string): string {
  if (!dateString) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

interface StoreConfigLike {
  secureBaseMediaUrl?: string;
  baseMediaUrl?: string;
}

export function normalizeMediaUrl(
  url: string,
  storeConfig: StoreConfigLike | null | undefined,
  mediaOverride = '',
): string {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const baseUrl =
    mediaOverride || storeConfig?.secureBaseMediaUrl || storeConfig?.baseMediaUrl || '';

  if (!baseUrl) {
    return url;
  }

  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}
