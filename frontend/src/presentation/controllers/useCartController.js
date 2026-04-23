import { useCart } from '../../app/cartContext';

export function useCartController() {
  const cart = useCart();

  return {
    addSimpleProduct: cart.addSimpleProduct,
    cart: cart.cart,
    error: cart.error,
    isBootstrapping: cart.isBootstrapping,
    isMutating: cart.isMutating,
    totalQuantity: cart.totalQuantity,
  };
}
