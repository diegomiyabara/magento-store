import { useCart } from '../../application/cart/CartContext';

export function useCartController() {
  const cart = useCart();

  return {
    addSimpleProduct: cart.addToCart,
    cart: cart.cart,
    error: cart.error,
    isBootstrapping: !cart.isInitialized && cart.isLoading,
    isMutating: cart.isLoading,
    totalQuantity: cart.itemCount,
  };
}
