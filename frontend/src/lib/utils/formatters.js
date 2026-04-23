export function formatPrice(price, currency = 'BRL') {
  if (typeof price !== 'number') {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
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
