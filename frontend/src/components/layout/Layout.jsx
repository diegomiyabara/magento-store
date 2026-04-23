import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useStorefrontShellController } from '../../presentation/controllers/useStorefrontShellController';

export default function Layout() {
  const shell = useStorefrontShellController();

  return (
    <div className="shell">
      <Header
        categories={shell.categories}
        storeConfig={shell.storeConfig}
        isLoading={shell.isLoading}
      />
      <main className="page-content">
        <Outlet
          context={{
            navigation: shell.categories,
            storeConfig: shell.storeConfig,
          }}
        />
      </main>
      <Footer storeConfig={shell.storeConfig} />
    </div>
  );
}
