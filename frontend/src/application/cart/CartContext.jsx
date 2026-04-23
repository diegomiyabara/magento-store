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

  // Carregar cartId do localStorage ao iniciar
  useEffect(() => {
    const storedCartId = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCartId) {
      dispatch({ type: 'INIT_CART', payload: { cartId: storedCartId } });
    } else {
      dispatch({ type: 'INIT_CART', payload: { cartId: null } });
    }
  }, []);

  // Carregar carrinho quando cartId mudar
  useEffect(() => {
    async function loadCart() {
      if (!state.cartId || !state.isInitialized) return;

      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        let cart;
        if (auth.token) {
          cart = await useCases.getCustomerCart(auth.token);
        } else {
          cart = await useCases.getGuestCart(state.cartId);
        }
        dispatch({ type: 'SET_CART', payload: { cart } });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      }
    }

    loadCart();
  }, [state.cartId, state.isInitialized, auth.token, useCases]);

  // Função para criar carrinho guest
  const createCart = useCallback(async (signal) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    try {
      const cart = await useCases.createGuestCart(signal);
      if (cart?.id) {
        localStorage.setItem(CART_STORAGE_KEY, cart.id);
        dispatch({ type: 'INIT_CART', payload: { cartId: cart.id } });
        dispatch({ type: 'SET_CART', payload: { cart } });
        return cart;
      }
      throw new Error('Falha ao criar carrinho');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [useCases]);

  // Função para adicionar produto ao carrinho
  const addToCart = useCallback(async (product, quantity = 1, signal) => {
    let cartId = state.cartId;

    if (!cartId) {
      const newCart = await createCart(signal);
      cartId = newCart.id;
    }

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cartItems = [
        {
          sku: product.sku,
          quantity,
          parent_product_id: product.uid,
        },
      ];

      const cart = await useCases.addProductsToCart(cartId, cartItems, auth.token, signal);
      dispatch({ type: 'SET_CART', payload: { cart } });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, createCart, useCases]);

  // Função para atualizar quantidade de item
  const updateItemQuantity = useCallback(async (cartItemId, quantity, signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.updateCartItem(state.cartId, cartItemId, quantity, auth.token, signal);
      dispatch({ type: 'SET_CART', payload: { cart } });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, useCases]);

  // Função para remover item do carrinho
  const removeFromCart = useCallback(async (cartItemId, signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.removeCartItem(state.cartId, cartItemId, auth.token, signal);
      dispatch({ type: 'SET_CART', payload: { cart } });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, useCases]);

  // Função para aplicar cupom
  const applyCoupon = useCallback(async (couponCode, signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.applyCouponToCart(state.cartId, couponCode, auth.token, signal);
      dispatch({ type: 'SET_CART', payload: { cart } });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, useCases]);

  // Função para remover cupom
  const removeCoupon = useCallback(async (signal) => {
    if (!state.cartId) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

    try {
      const cart = await useCases.removeCouponFromCart(state.cartId, auth.token, signal);
      dispatch({ type: 'SET_CART', payload: { cart } });
      return cart;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { error: error.message } });
      throw error;
    }
  }, [state.cartId, auth.token, useCases]);

  // Função para limpar carrinho
  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
    dispatch({ type: 'CLEAR_CART' });
  }, []);

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
    createCart,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCart,
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