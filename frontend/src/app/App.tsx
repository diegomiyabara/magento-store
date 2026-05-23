import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageSkeleton from '@/components/ui/PageSkeleton';

const HomePage          = lazy(() => import('@/features/home/HomePage'));
const CategoryPage      = lazy(() => import('@/features/category/CategoryPage'));
const ProductPage       = lazy(() => import('@/features/product/ProductPage'));
const CartPage          = lazy(() => import('@/features/cart/CartPage'));
const CheckoutPage      = lazy(() => import('@/features/checkout/CheckoutPage'));
const CheckoutSuccess   = lazy(() => import('@/features/checkout/CheckoutSuccessPage'));
const LoginPage         = lazy(() => import('@/features/login/LoginPage'));
const RegisterPage      = lazy(() => import('@/features/register/RegisterPage'));
const AccountShell      = lazy(() => import('@/features/account/AccountShell'));
const AccountDashboard  = lazy(() => import('@/features/account/AccountDashboardPage'));
const AccountInfo       = lazy(() => import('@/features/account/AccountInformationPage'));
const AddressBook       = lazy(() => import('@/features/account/AddressBookPage'));
const OrdersPage        = lazy(() => import('@/features/account/OrdersPage'));
const OrderDetails      = lazy(() => import('@/features/account/OrderDetailsPage'));
const NotFoundPage      = lazy(() => import('@/features/not-found/NotFoundPage'));

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/carrinho" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/sucesso" element={<CheckoutSuccess />} />
          <Route path="/categoria/:urlKey" element={<CategoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/minha-conta" element={<AccountShell />}>
            <Route index element={<AccountDashboard />} />
            <Route path="informacoes" element={<AccountInfo />} />
            <Route path="enderecos" element={<AddressBook />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="pedidos/:orderNumber" element={<OrderDetails />} />
          </Route>
          <Route path="/produto/:urlKey" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
