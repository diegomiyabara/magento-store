import { Link } from 'react-router-dom';
import { Share2, Mail, MapPin, Truck, ShieldCheck, CreditCard, RotateCcw } from 'lucide-react';

interface FooterProps {
  storeConfig: { storeName?: string } | null;
}

const features = [
  { icon: Truck,        label: 'Frete para todo Brasil'  },
  { icon: ShieldCheck,  label: 'Compra segura'           },
  { icon: CreditCard,   label: '5% OFF no PIX'           },
  { icon: RotateCcw,    label: 'Trocas e devoluções'     },
];

export default function Footer({ storeConfig }: FooterProps) {
  const storeName = storeConfig?.storeName ?? 'DM3D Tech';
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--color-surface-border)] bg-[rgba(5,9,19,0.6)]">
      {/* feature strip */}
      <div className="border-b border-[var(--color-surface-border)]">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px px-4 py-6 sm:grid-cols-4">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-2 text-center">
              <Icon size={22} className="text-brand" />
              <span className="text-xs font-medium text-text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* main footer */}
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* brand */}
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-full bg-gradient-to-br from-brand to-brand-soft px-3 py-1.5 text-sm font-bold tracking-widest text-[#08111c]">
            DM3D
          </span>
          <p className="text-sm text-text-muted leading-relaxed">
            Sua loja de tecnologia e impressão 3D. Produtos de qualidade, entrega rápida.
          </p>
          <div className="flex gap-2 mt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-surface-border)] text-text-muted transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Share2 size={15} />
            </a>
            <a
              href="mailto:contato@dm3dtech.com"
              aria-label="E-mail"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-surface-border)] text-text-muted transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Mail size={15} />
            </a>
          </div>
        </div>

        {/* comprar */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Comprar
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { label: 'Início', href: '/' },
              { label: 'Carrinho', href: '/carrinho' },
              { label: 'Checkout', href: '/checkout' },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link to={href} className="text-sm text-text-muted transition-colors hover:text-text">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* conta */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Conta
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { label: 'Entrar', href: '/login' },
              { label: 'Criar conta', href: '/cadastro' },
              { label: 'Minha conta', href: '/minha-conta' },
              { label: 'Meus pedidos', href: '/minha-conta/pedidos' },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link to={href} className="text-sm text-text-muted transition-colors hover:text-text">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* contato */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
            Contato
          </p>
          <ul className="flex flex-col gap-2 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <Mail size={14} className="mt-0.5 shrink-0" />
              contato@dm3dtech.com
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              Brasil
            </li>
          </ul>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-[var(--color-surface-border)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 text-xs text-text-muted">
          <span>© {year} {storeName}. Todos os direitos reservados.</span>
          <span>Powered by Mage-OS</span>
        </div>
      </div>
    </footer>
  );
}
