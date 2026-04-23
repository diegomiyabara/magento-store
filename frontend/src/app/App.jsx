import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AccountPage from '../features/account/AccountPage';
import AccountInformationPage from '../features/account/AccountInformationPage';
import AccountShell from '../features/account/AccountShell';
import AddressBookPage from '../features/account/AddressBookPage';
import OrderDetailsPage from '../features/account/OrderDetailsPage';
import OrdersPage from '../features/account/OrdersPage';
import HomePage from '../features/home/HomePage';
import LoginPage from '../features/login/LoginPage';
import RegisterPage from '../features/register/RegisterPage';
import CategoryPage from '../features/category/CategoryPage';
import ProductPage from '../features/product/ProductPage';
import NotFoundPage from '../features/not-found/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/categoria/:urlKey" element={<CategoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/minha-conta" element={<AccountShell />}>
          <Route index element={<AccountPage />} />
          <Route path="informacoes" element={<AccountInformationPage />} />
          <Route path="enderecos" element={<AddressBookPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/:orderNumber" element={<OrderDetailsPage />} />
        </Route>
        <Route path="/produto/:urlKey" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
