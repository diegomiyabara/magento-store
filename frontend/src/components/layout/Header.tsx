import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingCart, User, X, Search } from 'lucide-react';
import { useAuthController } from '@/presentation/controllers/useAuthController';
import { useCartController } from '@/presentation/controllers/useCartController';
import CartDrawer from '@/components/cart/CartDrawer';
import Drawer from '@/components/ui/Drawer';

interface HeaderProps {
  categories: { uid: string; name: string; urlKey: string }[];
  storeConfig: { storeName?: string } | null;
  isLoading: boolean;
}

export default function Header({ categories, storeConfig, isLoading }: HeaderProps) {
  const auth = useAuthController();
  const { totalQuantity } = useCartController();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'text-sm font-medium transition-colors',
      isActive ? 'text-brand' : 'text-text-muted hover:text-text',
    ].join(' ');

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--color-surface-border)] bg-[rgba(5,9,19,0.75)] backdrop-blur-xl">
        {/* promo strip */}
        <div className="hidden border-b border-[rgba(255,255,255,0.05)] bg-gradient-to-r from-[rgba(255,141,58,0.1)] to-[rgba(75,167,255,0.1)] sm:block">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-1.5">
            {['5% OFF no PIX', 'Envio para todo o Brasil', 'Compra segura e rápida'].map((t) => (
              <span key={t} className="text-[0.72rem] font-medium uppercase tracking-widest text-brand-soft">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* main bar */}
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3">
          {/* logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 items-center rounded-full bg-gradient-to-br from-brand to-brand-soft px-3 text-sm font-bold tracking-widest text-[#08111c]">
              DM3D
            </span>
            <span className="hidden flex-col sm:flex">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                Loja Online
              </span>
              <span className="text-sm font-semibold leading-tight">
                {storeConfig?.storeName ?? 'DM3D Tech'}
              </span>
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="mx-4 hidden flex-1 items-center gap-1 lg:flex" aria-label="Categorias">
            {isLoading ? (
              <>{[1, 2, 3].map((i) => <div key={i} className="skeleton h-4 w-20 rounded" />)}</>
            ) : (
              categories.slice(0, 6).map((cat) => (
                <NavLink key={cat.uid} to={`/categoria/${cat.urlKey}`} className={navLinkClass}>
                  <span className="px-2 py-1">{cat.name}</span>
                </NavLink>
              ))
            )}
          </nav>

          {/* actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Carrinho, ${totalQuantity} itens`}
              className="relative flex h-9 items-center gap-1.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-text-muted transition-colors hover:bg-[rgba(255,255,255,0.07)] hover:text-text"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Carrinho</span>
              {totalQuantity > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-[#08111c]">
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </button>

            {/* account */}
            {auth.isBootstrapping ? (
              <div className="skeleton h-9 w-20 rounded-xl" />
            ) : auth.isAuthenticated ? (
              <NavLink
                to="/minha-conta"
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[rgba(255,141,58,0.25)] bg-[rgba(255,141,58,0.08)] px-3 text-sm font-medium text-brand-soft transition-colors hover:bg-[rgba(255,141,58,0.14)]"
              >
                <User size={15} />
                <span className="hidden max-w-[80px] truncate sm:inline">
                  {auth.customer?.firstName ?? 'Conta'}
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    'flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-brand/40 bg-brand/10 text-brand'
                      : 'border-[var(--color-surface-border)] bg-[var(--color-surface)] text-text-muted hover:text-text hover:bg-white/5',
                  ].join(' ')
                }
              >
                <User size={15} />
                <span className="hidden sm:inline">Entrar</span>
              </NavLink>
            )}

            {/* hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-surface-border)] text-text-muted lg:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Menu Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} side="left" title="Menu">
        <nav className="flex flex-col p-4" aria-label="Menu mobile">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Categorias
          </p>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          ) : (
            categories.map((cat) => (
              <NavLink
                key={cat.uid}
                to={`/categoria/${cat.urlKey}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-text-soft hover:bg-white/5 hover:text-text',
                  ].join(' ')
                }
              >
                {cat.name}
              </NavLink>
            ))
          )}

          <hr className="my-4 border-[var(--color-surface-border)]" />

          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Conta
          </p>
          {auth.isAuthenticated ? (
            <>
              <NavLink
                to="/minha-conta"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-white/5"
              >
                Minha conta
              </NavLink>
              <NavLink
                to="/minha-conta/pedidos"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-white/5"
              >
                Meus pedidos
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-white/5"
              >
                Entrar
              </NavLink>
              <NavLink
                to="/cadastro"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-white/5"
              >
                Criar conta
              </NavLink>
            </>
          )}
        </nav>
      </Drawer>
    </>
  );
}
