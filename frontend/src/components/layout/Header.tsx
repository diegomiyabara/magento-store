import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, ShoppingCart, User } from 'lucide-react';
import { useAuthController } from '@/presentation/controllers/useAuthController';
import { useCartController } from '@/presentation/controllers/useCartController';
import CartDrawer from '@/components/cart/CartDrawer';
import Drawer from '@/components/ui/Drawer';
import Logo from '@/components/ui/Logo';

interface HeaderProps {
  categories: { uid: string; name: string; urlKey: string }[];
  storeConfig: { storeName?: string } | null;
  isLoading: boolean;
}

export default function Header({ categories, isLoading }: HeaderProps) {
  const auth = useAuthController();
  const { totalQuantity } = useCartController();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'text-xs font-medium transition-colors whitespace-nowrap',
      isActive ? 'text-white font-semibold' : 'text-white/60 hover:text-white',
    ].join(' ');

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-bg-dark">
        {/* promo strip */}
        <div className="hidden border-b border-white/10 bg-bg-dark/90 sm:block">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-1.5">
            {['5% OFF no PIX', 'Envio para todo o Brasil', 'Compra segura e rápida'].map((t) => (
              <span key={t} className="text-[0.72rem] font-medium uppercase tracking-widest text-white/70">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* main bar */}
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3">
          {/* logo */}
          <Link to="/" className="shrink-0">
            <Logo variant="light" size="md" />
          </Link>

          {/* desktop nav */}
          <nav className="mx-2 hidden flex-1 items-center gap-0 lg:flex" aria-label="Categorias">
            {isLoading ? (
              <>{[1, 2, 3].map((i) => <div key={i} className="skeleton h-4 w-20 rounded" />)}</>
            ) : (
              categories.slice(0, 6).map((cat) => (
                <NavLink key={cat.uid} to={`/categoria/${cat.urlKey}`} className={navLinkClass}>
                  <span className="px-1.5 py-1">{cat.name}</span>
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
              className="relative flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Carrinho</span>
              {totalQuantity > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
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
                className="flex h-9 items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-3 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
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
                      ? 'border-brand/40 bg-brand/10 text-white'
                      : 'border-white/15 bg-white/10 text-white/70 hover:bg-white/15 hover:text-white',
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-white/70 lg:hidden"
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
                      : 'text-text hover:bg-black/5 hover:text-text',
                  ].join(' ')
                }
              >
                {cat.name}
              </NavLink>
            ))
          )}

          <hr className="my-4 border-surface-border" />

          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Conta
          </p>
          {auth.isAuthenticated ? (
            <>
              <NavLink
                to="/minha-conta"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-black/5"
              >
                Minha conta
              </NavLink>
              <NavLink
                to="/minha-conta/pedidos"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-black/5"
              >
                Meus pedidos
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-black/5"
              >
                Entrar
              </NavLink>
              <NavLink
                to="/cadastro"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-black/5"
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
