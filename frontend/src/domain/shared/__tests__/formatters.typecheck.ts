/**
 * Type-check tests for domain/shared/formatters.ts
 */
import { formatPrice, formatDate, normalizeMediaUrl } from '../formatters';

// formatPrice: number, optional currency → string
const price1: string = formatPrice(100);
const price2: string = formatPrice(100, 'USD');

// formatDate: string → string
const date1: string = formatDate('2024-01-01');
const date2: string = formatDate('');

// normalizeMediaUrl: url, storeConfig, optional mediaOverride → string
const url1: string = normalizeMediaUrl('/media/catalog/product/image.jpg', {
  secureBaseMediaUrl: 'https://example.com/media/',
  baseMediaUrl: 'https://example.com/media/',
});
const url2: string = normalizeMediaUrl('https://example.com/image.jpg', null);
const url3: string = normalizeMediaUrl('/image.jpg', null, 'https://cdn.example.com/');

// Suppress unused variable warnings
void price1;
void price2;
void date1;
void date2;
void url1;
void url2;
void url3;
