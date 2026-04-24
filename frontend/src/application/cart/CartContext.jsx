import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/authContext';
import { useStorefrontServices } from '../../app/storefrontContext';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'dm3d_cart_id';

const initialState = {
  cartId: null,
  cart: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

function cartReducer(state, action) {
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
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const auth = useAuth();
  const { useCases } = useStorefrontServices();

  const persistGuestCartId = useCallback((cartId) => {
    if (cartId) {
      localStorage.setItem(CART_STORAGE_KEY, cartId);
      return;
    }

    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const syncCart = useCallback((cart, { persistGuest = !auth.token } = {}) => {
    const nextCartId = cart?.id || null;

    if (persistGuest) {
      persistGuestCartId(nextCartId);
    }

    dispatch({ type: 'INIT_CART', payload: { cartId: nextCartId } });
    dispatch({ type: 'SET_CART', payload: { cart } });
  }, [auth.token, persistGuestCartId]);

  // Carregar cartId do localStorage ao iniciar
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

      const guestCartId = state.cartId;

      try {
        if (auth.token) {
          let cart = null;

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
        dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      }
    }

    loadCart();

    return () => {
      controller.abort();
    };
  }, [state.cartId, state.isInitialized, auth.token, persistGuestCartId, syncCart, useCases]);

  const createCart = useCallback(async (signal) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    try {
      const cart = await useCases.createGuestCart(signal);
      if (cart?.id) {
        syncCart(cart);
        return cart;
      }
      throw new Error('Falha ao criar carrinho');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [syncCart, useCases]);

  const addToCart = useCallback(async (product, quantity = 1, signal) => {
    let cartId = state.cartId;

    if (!cartId && !auth.token) {
      const newCart = await createCart(signal);
      cartId = newCart.id;
    }

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cartItems = [
        {
          sku: product.sku,
          quantity,
        },
      ];

      const resolvedCartId = cartId || state.cart?.id || null;
      let targetCartId = resolvedCartId;

      if (!targetCartId && auth.token) {
        const customerCart = await useCases.getCustomerCart(auth.token, signal);
        targetCartId = customerCart?.id || null;
      }

      if (!targetCartId) {
        throw new Error('Falha ao localizar um carrinho válido.');
      }

      const cart = await useCases.addProductsToCart(targetCartId, cartItems, auth.token, signal);
      syncCart(cart, { persistGuest: !auth.token });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, state.cart?.id, auth.token, createCart, syncCart, useCases]);

  const updateItemQuantity = useCallback(async (cartItemUid, quantity, signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.updateCartItem(state.cartId, cartItemUid, quantity, auth.token, signal);
      syncCart(cart, { persistGuest: !auth.token });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, syncCart, useCases]);

  const removeFromCart = useCallback(async (cartItemUid, signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.removeCartItem(state.cartId, cartItemUid, auth.token, signal);
      syncCart(cart, { persistGuest: !auth.token });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, syncCart, useCases]);

  const applyCoupon = useCallback(async (couponCode, signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.applyCouponToCart(state.cartId, couponCode, auth.token, signal);
      syncCart(cart, { persistGuest: !auth.token });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, syncCart, useCases]);

  const removeCoupon = useCallback(async (signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.removeCouponFromCart(state.cartId, auth.token, signal);
      syncCart(cart, { persistGuest: !auth.token });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, syncCart, useCases]);

  const clearCart = useCallback(() => {
    persistGuestCartId(null);
    dispatch({ type: 'CLEAR_CART' });
  }, [persistGuestCartId]);

  const setCartSnapshot = useCallback((cart, options = {}) => {
    syncCart(cart, options);
  }, [syncCart]);

  const value = {
    cartId: state.cartId,
    cart: state.cart,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,
    itemCount: state.cart?.totalQuantity ?? 0,
    items: state.cart?.items ?? [],
    subtotal: state.cart?.subtotal,
    grandTotal: state.cart?.grandTotal,
    totalTax: state.cart?.totalTax,
    totalShipping: state.cart?.totalShipping,
    appliedCoupons: state.cart?.appliedCoupons ?? [],
    createCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCart,
    setCartSnapshot,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
