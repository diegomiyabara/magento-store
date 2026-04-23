import { useEffect, useState } from 'react';
import { CartContext } from './cartContext';
import { useAuth } from './authContext';
import { useStorefrontServices } from './storefrontContext';

const GUEST_CART_STORAGE_KEY = 'dm3dtech.guest.cart.id';

export function CartProvider({ children }) {
  const auth = useAuth();
  const { useCases } = useStorefrontServices();
  const [state, setState] = useState({
    cart: null,
    error: null,
    isBootstrapping: true,
    isMutating: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    const guestCartId = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);

    async function bootstrapCart() {
      setState((current) => ({
        ...current,
        error: null,
        isBootstrapping: true,
      }));

      try {
        if (auth.token) {
          if (guestCartId) {
            try {
              const mergedCart = await useCases.mergeCarts(
                auth.token,
                guestCartId,
                controller.signal,
              );

              window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
              setState({
                cart: mergedCart,
                error: null,
                isBootstrapping: false,
                isMutating: false,
              });
              return;
            } catch {
              window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            }
          }

          const customerCart = await useCases.getCustomerCart(auth.token, controller.signal);

          setState({
            cart: customerCart,
            error: null,
            isBootstrapping: false,
            isMutating: false,
          });
          return;
        }

        if (!guestCartId) {
          setState({
            cart: null,
            error: null,
            isBootstrapping: false,
            isMutating: false,
          });
          return;
        }

        const guestCart = await useCases.getGuestCart(guestCartId, controller.signal);

        setState({
          cart: guestCart,
          error: null,
          isBootstrapping: false,
          isMutating: false,
        });
      } catch (error) {
        window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        setState({
          cart: null,
          error,
          isBootstrapping: false,
          isMutating: false,
        });
      }
    }

    bootstrapCart();

    return () => {
      controller.abort();
    };
  }, [auth.token, useCases]);

  async function ensureCart(signal) {
    if (auth.token) {
      const customerCart = await useCases.getCustomerCart(auth.token, signal);

      setState((current) => ({
        ...current,
        cart: customerCart,
      }));

      return customerCart;
    }

    if (state.cart?.id) {
      return state.cart;
    }

    const guestCart = await useCases.createGuestCart(signal);

    if (guestCart?.id) {
      window.localStorage.setItem(GUEST_CART_STORAGE_KEY, guestCart.id);
    }

    setState((current) => ({
      ...current,
      cart: guestCart,
    }));

    return guestCart;
  }

  async function addSimpleProduct({ quantity = 1, sku }) {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      error: null,
      isMutating: true,
    }));

    try {
      const cart = await ensureCart(controller.signal);
      const updatedCart = await useCases.addProductsToCart(
        cart.id,
        [{ quantity, sku }],
        auth.token,
        controller.signal,
      );

      if (!auth.token && updatedCart?.id) {
        window.localStorage.setItem(GUEST_CART_STORAGE_KEY, updatedCart.id);
      }

      setState({
        cart: updatedCart,
        error: null,
        isBootstrapping: false,
        isMutating: false,
      });

      return updatedCart;
    } catch (error) {
      setState((current) => ({
        ...current,
        error,
        isMutating: false,
      }));
      throw error;
    }
  }

  return (
    <CartContext.Provider
      value={{
        addSimpleProduct,
        cart: state.cart,
        error: state.error,
        isBootstrapping: state.isBootstrapping,
        isMutating: state.isMutating,
        totalQuantity: state.cart?.totalQuantity ?? 0,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
