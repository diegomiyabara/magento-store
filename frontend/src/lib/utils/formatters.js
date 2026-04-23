export function formatPrice(price, currency = 'BRL') {
  if (typeof price !== 'number') {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function normalizeMediaUrl(url, storeConfig, mediaOverride = '') {
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
