import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AccountPage from '../features/account/AccountPage';
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
        <Route path="/minha-conta" element={<AccountPage />} />
        <Route path="/produto/:urlKey" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
