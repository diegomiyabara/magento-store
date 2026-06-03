import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useStorefrontShell } from '@/application/storefront/useStorefrontShell';

export default function Layout() {
  const shell = useStorefrontShell();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        categories={shell.categories}
        storeConfig={shell.storeConfig}
        isLoading={shell.isLoading}
      />
      <main className="flex-1 py-6">
        <Outlet context={{ navigation: shell.categories, storeConfig: shell.storeConfig }} />
      </main>
      <Footer storeConfig={shell.storeConfig} />
    </div>
  );
}
