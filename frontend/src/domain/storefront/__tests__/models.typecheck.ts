/**
 * Type-check tests for domain/storefront/models.ts
 * These are compile-time assertions — if tsc passes, the tests pass.
 */
import {
  createStoreConfigModel,
  createCategoryModel,
  createProductModel,
  createCartModel,
  createCustomerModel,
} from '../models';

// Requirement: createStoreConfigModel with explicit return type
const storeConfig = createStoreConfigModel({
  store_code: 'default',
  store_name: 'DM3D Tech',
  root_category_id: 2,
  root_category_uid: 'Mg==',
  base_url: 'https://example.com/',
  base_media_url: 'https://example.com/media/',
  secure_base_url: 'https://example.com/',
  secure_base_media_url: 'https://example.com/media/',
});

// These property accesses will fail at compile time if types are wrong
if (storeConfig !== null) {
  const _storeCode: string = storeConfig.storeCode;
  const _storeName: string = storeConfig.storeName;
  const _baseUrl: string = storeConfig.baseUrl;
}

// Requirement: createCategoryModel with explicit return type
const category = createCategoryModel({
  id: 1,
  uid: 'MQ==',
  name: 'Test Category',
  url_key: 'test-category',
});

if (category !== null) {
  const _id: number = category.id;
  const _name: string = category.name;
  const _urlKey: string = category.urlKey;
}

// Requirement: createProductModel with explicit return type
const product = createProductModel({
  uid: 'abc',
  sku: 'SKU-001',
  name: 'Test Product',
  url_key: 'test-product',
});

if (product !== null) {
  const _uid: string = product.uid;
  const _sku: string = product.sku;
  const _name: string = product.name;
}

// Requirement: createCartModel with explicit return type
const cart = createCartModel({
  id: 'cart-123',
  total_quantity: 2,
  items: [],
  prices: {},
  shipping_addresses: [],
  applied_coupons: [],
  available_payment_methods: [],
});

if (cart !== null) {
  const _id: string = cart.id;
  const _totalQuantity: number = cart.totalQuantity;
}

// Requirement: createCustomerModel with explicit return type
const customer = createCustomerModel({
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'User',
});

if (customer !== null) {
  const _email: string = customer.email;
  const _firstName: string = customer.firstName;
}

// Requirement: no imports from React, application, or infrastructure
// (structural check — verified by not having such imports in models.ts)
