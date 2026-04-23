import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../features/home/HomePage';
import CategoryPage from '../features/category/CategoryPage';
import ProductPage from '../features/product/ProductPage';
import NotFoundPage from '../features/not-found/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/categoria/:urlKey" element={<CategoryPage />} />
        <Route path="/produto/:urlKey" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
