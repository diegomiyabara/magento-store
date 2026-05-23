import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, MapPin, Package, Info, LogOut } from 'lucide-react';
import { useAuth } from '@/app/authContext';

const NAV = [
  { to: '/minha-conta',              label: 'Painel',       icon: User,    end: true  },
  { to: '/minha-conta/informacoes',  label: 'Informações',  icon: Info,    end: false },
  { to: '/minha-conta/enderecos',    label: 'Endereços',    icon: MapPin,  end: false },
  { to: '/minha-conta/pedidos',      label: 'Pedidos',      icon: Package, end: false },
];

export default function AccountShell() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    navigate('/login');
  }

  return (
    <>
      <Helmet><title>Minha conta | DM3D Tech</title></Helmet>

      <div className="mx-auto max-w-[1200px] px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">
            Olá, {auth.customer?.firstName ?? 'Cliente'}!
          </h1>
          <p className="text-sm text-text-muted">{auth.customer?.email}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* sidebar */}
          <aside className="h-fit rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-3">
            <nav className="flex flex-col gap-0.5">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand/10 text-brand'
                        : 'text-text-soft hover:bg-black/5 hover:text-text',
                    ].join(' ')
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center gap-3 rounded-xl border-t border-[var(--color-surface-border)] px-3 py-2.5 pt-3 text-sm font-medium text-text-muted transition-colors hover:text-danger"
              >
                <LogOut size={15} />
                Sair
              </button>
            </nav>
          </aside>

          {/* content */}
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
