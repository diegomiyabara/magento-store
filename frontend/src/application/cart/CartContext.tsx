import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, useRef, useState, ReactNode } from 'react';
import { useAuth } from '@/application/auth/AuthContext';
import { useStorefrontServices } from '../storefront/StorefrontContext';
import type { CartModel, CartItemModel, MoneyModel } from '../../domain/storefront/models';

interface CartState {
  cartId: string | null;
  cart: CartModel | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  optimisticItems: Map<string, boolean> | null;
}

type CartAction =
  | { type: 'INIT_CART'; payload: { cartId: string | null } }
  | { type: 'SET_CART'; payload: { cart: CartModel | null } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPTIMISTIC_TOGGLE'; payload: { uid: string; isActive: boolean } }
  | { type: 'CLEAR_OPTIMISTIC' };

interface SyncCartOptions {
  persistGuest?: boolean;
}

export interface CartContextValue {
  cartId: string | null;
  cart: CartModel | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  itemCount: number;
  items: CartItemModel[];
  subtotal: MoneyModel | null | undefined;
  grandTotal: MoneyModel | null | undefined;
  totalTax: MoneyModel | null | undefined;
  totalShipping: MoneyModel | null | undefined;
  appliedCoupons: Array<{ code: string }>;
  toggleCartItemSelected: (uid: string, isActive: boolean) => void;
  hasPendingToggles: boolean;
  createCart: (signal?: AbortSignal) => Promise<CartModel>;
  addToCart: (product: { sku: string; uid?: string }, quantity?: number, signal?: AbortSignal) => Promise<CartModel | undefined>;
  updateItemQuantity: (cartItemUid: string, quantity: number, signal?: AbortSignal) => Promise<CartModel | undefined>;
  removeFromCart: (cartItemUid: string, signal?: AbortSignal) => Promise<CartModel | undefined>;
  applyCoupon: (couponCode: string, signal?: AbortSignal) => Promise<CartModel | undefined>;
  removeCoupon: (signal?: AbortSignal) => Promise<CartModel | undefined>;
  estimateShipping: (address: Record<string, unknown>, signal?: AbortSignal) => Promise<unknown>;
  clearCart: () => void;
  setCartSnapshot: (cart: CartModel | null, options?: SyncCartOptions) => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = 'dm3d_cart_id';

const initialState: CartState = {
  cartId: null,
  cart: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  optimisticItems: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'INIT_CART':
      return {
        ...state,
        cartId: action.payload.cartId,
        isInitialized: true,
      };
    case 'SET_CART':
      return {
        ...state,
        cart: action.payload.cart,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartId: null,
        cart: null,
        error: null,
      };
    case 'OPTIMISTIC_TOGGLE': {
      const newMap = new Map(state.optimisticItems ?? []);
      newMap.set(action.payload.uid, action.payload.isActive);
      return { ...state, optimisticItems: newMap };
    }
    case 'CLEAR_OPTIMISTIC':
      return { ...state, optimisticItems: null };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const auth = useAuth();
  const { useCases } = useStorefrontServices();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingToggles = useRef<Map<string, boolean>>(new Map());
  const [hasPendingToggles, setHasPendingToggles] = useState(false);

  const persistGuestCartId = useCallback((cartId: string | null) => {
    if (cartId) {
      localStorage.setItem(CART_STORAGE_KEY, cartId);
      return;
    }

    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const syncCart = useCallback(
    (cart: CartModel | null, { persistGuest = !auth.token }: SyncCartOptions = {}) => {
      const nextCartId = persistGuest ? (cart?.id ?? null) : null;

      if (persistGuest) {
        persistGuestCartId(nextCartId);
      } else {
        persistGuestCartId(null);
      }

      dispatch({ type: 'INIT_CART', payload: { cartId: nextCartId } });
      dispatch({ type: 'SET_CART', payload: { cart } });
    },
    [auth.token, persistGuestCartId],
  );

  useEffect(() => {
    const storedCartId = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCartId) {
      dispatch({ type: 'INIT_CART', payload: { cartId: storedCartId } });
    } else {
      dispatch({ type: 'INIT_CART', payload: { cartId: null } });
    }
  }, []);

  useEffect(() => {
    if (!state.isInitialized) return;

    const controller = new AbortController();

    async function loadCart() {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      const guestCartId = localStorage.getItem(CART_STORAGE_KEY);

      try {
        if (auth.token) {
          let cart: CartModel | null = null;

          if (guestCartId) {
            try {
              cart = await useCases.mergeCarts(auth.token, guestCartId, controller.signal);
              persistGuestCartId(null);
            } catch {
              persistGuestCartId(null);
            }
          }

          if (!cart) {
            cart = await useCases.getCustomerCart(auth.token, controller.signal);
          }

          syncCart(cart, { persistGuest: false });
          return;
        }

        if (!guestCartId) {
          dispatch({ type: 'SET_CART', payload: { cart: null } });
          return;
        }

        const cart = await useCases.getGuestCart(guestCartId, controller.signal);
        syncCart(cart);
      } catch (error) {
        persistGuestCartId(null);
        dispatch({ type: 'INIT_CART', payload: { cartId: null } });
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    loadCart();

    return () => {
      controller.abort();
    };
  }, [state.cartId, state.isInitialized, auth.token, persistGuestCartId, syncCart, useCases]);

  const createCart = useCallback(
    async (signal?: AbortSignal): Promise<CartModel> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
      try {
        const cart = await useCases.createGuestCart(signal);
        if (cart?.id) {
          syncCart(cart);
          return cart;
        }
        throw new Error('Falha ao criar carrinho');
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
    [syncCart, useCases],
  );

  const resolveActiveCartId = useCallback(
    async (signal?: AbortSignal): Promise<string | null> => {
      if (auth.token) {
        if (state.cart?.id) {
          return state.cart.id;
        }

        const customerCart = await useCases.getCustomerCart(auth.token, signal);
        return customerCart?.id ?? null;
      }

      return state.cartId ?? state.cart?.id ?? null;
    },
    [auth.token, state.cart?.id, state.cartId, useCases],
  );

  const addToCart = useCallback(
    async (
      product: { sku: string; uid?: string },
      quantity = 1,
      signal?: AbortSignal,
    ): Promise<CartModel | undefined> => {
      let cartId = state.cartId;

      if (!cartId && !auth.token) {
        const newCart = await createCart(signal);
        cartId = newCart.id;
      }

      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        const cartItems = [{ sku: product.sku, quantity }];

        const targetCartId = auth.token
          ? await resolveActiveCartId(signal)
          : cartId ?? state.cart?.id ?? null;

        if (!targetCartId) {
          throw new Error('Falha ao localizar um carrinho válido.');
        }

        const cart = await useCases.addProductsToCart(targetCartId, cartItems, auth.token ?? undefined, signal);
        syncCart(cart, { persistGuest: !auth.token });
        return cart ?? undefined;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
    [state.cartId, state.cart?.id, auth.token, createCart, resolveActiveCartId, syncCart, useCases],
  );

  const updateItemQuantity = useCallback(
    async (cartItemUid: string, quantity: number, signal?: AbortSignal): Promise<CartModel | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        const cartId = await resolveActiveCartId(signal);

        if (!cartId) return;

        const cart = await useCases.updateCartItem(cartId, cartItemUid, quantity, auth.token ?? undefined, signal);
        syncCart(cart, { persistGuest: !auth.token });
        return cart ?? undefined;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
    [auth.token, resolveActiveCartId, syncCart, useCases],
  );

  const removeFromCart = useCallback(
    async (cartItemUid: string, signal?: AbortSignal): Promise<CartModel | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        const cartId = await resolveActiveCartId(signal);

        if (!cartId) return;

        const cart = await useCases.removeCartItem(cartId, cartItemUid, auth.token ?? undefined, signal);
        syncCart(cart, { persistGuest: !auth.token });
        return cart ?? undefined;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
    [auth.token, resolveActiveCartId, syncCart, useCases],
  );

  const applyCoupon = useCallback(
    async (couponCode: string, signal?: AbortSignal): Promise<CartModel | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        const cartId = await resolveActiveCartId(signal);

        if (!cartId) return;

        const cart = await useCases.applyCouponToCart(cartId, couponCode, auth.token ?? undefined, signal);
        syncCart(cart, { persistGuest: !auth.token });
        return cart ?? undefined;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
    [auth.token, resolveActiveCartId, syncCart, useCases],
  );

  const removeCoupon = useCallback(
    async (signal?: AbortSignal): Promise<CartModel | undefined> => {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        const cartId = await resolveActiveCartId(signal);

        if (!cartId) return;

        const cart = await useCases.removeCouponFromCart(cartId, auth.token ?? undefined, signal);
        syncCart(cart, { persistGuest: !auth.token });
        return cart ?? undefined;
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: { error: error instanceof Error ? error.message : String(error) },
        });
        throw error;
      }
    },
    [auth.token, resolveActiveCartId, syncCart, useCases],
  );

  const estimateShipping = useCallback(
    async (address: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> => {
      const cartId = await resolveActiveCartId(signal);
      if (!cartId) throw new Error('Adicione um item ao carrinho antes de calcular o frete.');
      return useCases.estimateShippingMethods(cartId, address, auth.token ?? undefined, signal);
    },
    [auth.token, resolveActiveCartId, useCases],
  );

  const clearCart = useCallback(() => {
    persistGuestCartId(null);
    dispatch({ type: 'CLEAR_CART' });
  }, [persistGuestCartId]);

  const setCartSnapshot = useCallback(
    (cart: CartModel | null, options: SyncCartOptions = {}) => {
      syncCart(cart, options);
    },
    [syncCart],
  );

  const flushPendingToggles = useCallback(async () => {
    const togglesSnapshot = new Map(pendingToggles.current);
    pendingToggles.current.clear();
    setHasPendingToggles(false);
    if (togglesSnapshot.size === 0) return;

    const cartId = await resolveActiveCartId();
    if (!cartId) return;

    const items = Array.from(togglesSnapshot.entries()).map(([uid, isActive]) => ({
      cart_item_uid: uid,
      is_active: isActive,
    }));

    try {
      const cart = await useCases.setCartItemsSelected(cartId, items, auth.token ?? undefined);
      if (cart) {
        syncCart(cart, { persistGuest: !auth.token });
      }
      dispatch({ type: 'CLEAR_OPTIMISTIC' });
    } catch (error) {
      dispatch({ type: 'CLEAR_OPTIMISTIC' });
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }, [resolveActiveCartId, useCases, auth.token, syncCart]);

  const toggleCartItemSelected = useCallback(
    (uid: string, isActive: boolean) => {
      dispatch({ type: 'OPTIMISTIC_TOGGLE', payload: { uid, isActive } });
      pendingToggles.current.set(uid, isActive);
      setHasPendingToggles(true);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(flushPendingToggles, 400);
    },
    [flushPendingToggles],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const mergedItems = useMemo(() => {
    const rawItems = (state.cart?.items ?? []).filter((item): item is CartItemModel => item !== null);
    if (!state.optimisticItems) return rawItems;
    return rawItems.map(item => {
      const override = state.optimisticItems!.get(item.uid);
      return override !== undefined ? { ...item, isActive: override } : item;
    });
  }, [state.cart?.items, state.optimisticItems]);

  const value: CartContextValue = {
    cartId: state.cartId,
    cart: state.cart,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    itemCount: state.cart?.totalQuantity ?? 0,
    items: mergedItems,
    subtotal: state.cart?.subtotal,
    grandTotal: state.cart?.grandTotal,
    totalTax: state.cart?.totalTax,
    totalShipping: state.cart?.totalShipping,
    appliedCoupons: state.cart?.appliedCoupons ?? [],
    toggleCartItemSelected,
    hasPendingToggles,
    createCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    estimateShipping,
    clearCart,
    setCartSnapshot,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
