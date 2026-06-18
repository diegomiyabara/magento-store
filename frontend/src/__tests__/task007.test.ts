/**
 * Task 007 type-level tests.
 * All assertions are compile-time checks. tsc --noEmit is the test runner.
 */

import type {
  CartItemModel,
} from '../domain/storefront/models';
import {
  createCartModel,
} from '../domain/storefront/models';
import {
  CART_ITEM_FIELDS,
  SET_CART_ITEM_SELECTED_MUTATION,
  SET_CART_ITEMS_SELECTED_MUTATION,
} from '../infrastructure/magento/queries/cartQueries';
import { createMagentoStorefrontRepository } from '../infrastructure/magento/magentoStorefrontRepository';
import { createStorefrontUseCases } from '../application/storefront/useCases';

// ── Requirement 1: it adds isActive boolean field to CartItemModel interface ──

// This must compile — CartItemModel must have isActive: boolean
type _R1 = CartItemModel extends { isActive: boolean } ? true : false;
const _r1: _R1 = true;
void _r1;

// ── Requirement 2: it defaults isActive to true when is_active is absent from raw GraphQL data ──

function _r2(): void {
  const cart = createCartModel({
    id: 'c1',
    items: [{ uid: 'u1', id: '1', quantity: 1, product: { uid: 'p1', sku: 's', name: 'P', url_key: 'p', image: { url: '', label: '' }, price_range: { minimum_price: { regular_price: { value: 10, currency: 'BRL' }, final_price: { value: 10, currency: 'BRL' } } } } }],
  });
  const item = cart?.items[0];
  if (!item) throw new Error('no item');
  // isActive should be true when is_active is absent
  const isActive: boolean = item.isActive;
  if (isActive !== true) throw new Error(`Expected true, got ${String(isActive)}`);
}
_r2();

// ── Requirement 3: it maps is_active false from GraphQL to isActive false in CartItemModel ──

function _r3(): void {
  const cart = createCartModel({
    id: 'c1',
    items: [{ uid: 'u1', id: '1', quantity: 1, is_active: false, product: { uid: 'p1', sku: 's', name: 'P', url_key: 'p', image: { url: '', label: '' }, price_range: { minimum_price: { regular_price: { value: 10, currency: 'BRL' }, final_price: { value: 10, currency: 'BRL' } } } } }],
  });
  const item = cart?.items[0];
  if (!item) throw new Error('no item');
  if (item.isActive !== false) throw new Error(`Expected false, got ${String(item.isActive)}`);
}
_r3();

// ── Requirement 4: it maps is_active true from GraphQL to isActive true in CartItemModel ──

function _r4(): void {
  const cart = createCartModel({
    id: 'c1',
    items: [{ uid: 'u1', id: '1', quantity: 1, is_active: true, product: { uid: 'p1', sku: 's', name: 'P', url_key: 'p', image: { url: '', label: '' }, price_range: { minimum_price: { regular_price: { value: 10, currency: 'BRL' }, final_price: { value: 10, currency: 'BRL' } } } } }],
  });
  const item = cart?.items[0];
  if (!item) throw new Error('no item');
  if (item.isActive !== true) throw new Error(`Expected true, got ${String(item.isActive)}`);
}
_r4();

// ── Requirement 5: it includes is_active field in CART_ITEM_FIELDS GraphQL fragment ──

function _r5(): void {
  const _field: string = CART_ITEM_FIELDS;
  if (!_field.includes('is_active')) {
    throw new Error('CART_ITEM_FIELDS must include is_active');
  }
}
_r5();

// ── Requirement 6: it exports SET_CART_ITEM_SELECTED_MUTATION with correct GraphQL structure ──

function _r6(): void {
  const _mutation: string = SET_CART_ITEM_SELECTED_MUTATION;
  if (!_mutation.includes('setCartItemSelected')) {
    throw new Error('SET_CART_ITEM_SELECTED_MUTATION must reference setCartItemSelected');
  }
  if (!_mutation.includes('$cartId: String!')) {
    throw new Error('SET_CART_ITEM_SELECTED_MUTATION must have $cartId parameter');
  }
  if (!_mutation.includes('$cartItemUid: ID!')) {
    throw new Error('SET_CART_ITEM_SELECTED_MUTATION must have $cartItemUid parameter');
  }
  if (!_mutation.includes('$isActive: Boolean!')) {
    throw new Error('SET_CART_ITEM_SELECTED_MUTATION must have $isActive parameter');
  }
}
_r6();

// ── Requirement 7: it exports SET_CART_ITEMS_SELECTED_MUTATION accepting array of items ──

function _r7(): void {
  const _mutation: string = SET_CART_ITEMS_SELECTED_MUTATION;
  if (!_mutation.includes('setCartItemsSelected')) {
    throw new Error('SET_CART_ITEMS_SELECTED_MUTATION must reference setCartItemsSelected');
  }
  if (!_mutation.includes('$items')) {
    throw new Error('SET_CART_ITEMS_SELECTED_MUTATION must have $items parameter');
  }
}
_r7();

// ── Requirement 8: it adds setCartItemsSelected to the magento storefront repository returning a CartModel ──

type _Repo = ReturnType<typeof createMagentoStorefrontRepository>;
type _HasSetCartItemsSelected = _Repo extends {
  setCartItemsSelected: (
    cartId: string,
    items: { cart_item_uid: string; is_active: boolean }[],
    token?: string,
    signal?: AbortSignal
  ) => Promise<import('../domain/storefront/models').CartModel | null>
} ? true : false;
const _r8: _HasSetCartItemsSelected = true;
void _r8;

// ── Requirement 9: it adds setCartItemsSelected passthrough to storefront useCases ──

type _UseCases = ReturnType<typeof createStorefrontUseCases>;
type _HasUseCasesMethod = _UseCases extends {
  setCartItemsSelected: (
    cartId: string,
    items: { cart_item_uid: string; is_active: boolean }[],
    token?: string,
    signal?: AbortSignal
  ) => Promise<import('../domain/storefront/models').CartModel | null>
} ? true : false;
const _r9: _HasUseCasesMethod = true;
void _r9;

// ── Requirement 10: it does not break existing CartItemModel consumers (quantity, product, configuredVariant still present) ──

type _R10 = CartItemModel extends {
  uid: string;
  id: string;
  quantity: number;
  product: { uid: string; sku: string; name: string };
  configuredVariant: { uid: string; sku: string; name: string; finalPrice: number | null; currency: string } | null;
  isActive: boolean;
} ? true : false;
const _r10: _R10 = true;
void _r10;
