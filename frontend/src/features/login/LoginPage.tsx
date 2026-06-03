import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LogIn, Lock } from 'lucide-react';
import { useAuth } from '@/application/auth/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});
type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from: string = (location.state as { from?: string })?.from ?? '/minha-conta';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      await auth.login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'E-mail ou senha incorretos.');
    }
  }

  return (
    <>
      <Helmet><title>Entrar | DM3D Tech</title></Helmet>

      <div className="mx-auto grid min-h-[70vh] max-w-[900px] items-center px-4 lg:grid-cols-2 lg:gap-12">
        {/* ── Banner ──────────────────────────────────────── */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
            <Lock size={28} className="text-brand" />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight text-text">
            Bem-vindo de volta!
          </h2>
          <p className="text-text-muted leading-relaxed">
            Acesse sua conta para acompanhar seus pedidos, gerenciar endereços e aproveitar ofertas exclusivas.
          </p>
          <p className="text-sm text-text-muted">
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-brand hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* ── Form ────────────────────────────────────────── */}
        <div className="w-full rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <h1 className="mb-6 text-xl font-bold text-text">Entrar na conta</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button variant="primary" type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              <LogIn size={16} /> Entrar
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-muted lg:hidden">
            Não tem conta?{' '}
            <Link to="/cadastro" className="font-semibold text-brand hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
