import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/authContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

const schema = z.object({
  firstName:         z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:          z.string().min(2, 'Mínimo 2 caracteres'),
  email:             z.string().email('E-mail inválido'),
  password:          z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword:   z.string(),
  isSubscribed:      z.boolean().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { isSubscribed: true },
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await auth.register({
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        is_subscribed: data.isSubscribed ?? false,
      });
      navigate('/minha-conta', { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta.');
    }
  }

  return (
    <>
      <Helmet><title>Criar conta | DM3D Tech</title></Helmet>

      <div className="mx-auto grid min-h-[70vh] max-w-[900px] items-center px-4 lg:grid-cols-2 lg:gap-12">
        {/* ── Banner ──────────────────────────────────────── */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
            <Sparkles size={28} className="text-brand" />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight text-text">
            Crie sua conta grátis
          </h2>
          <p className="text-text-muted leading-relaxed">
            Acompanhe pedidos, salve endereços e receba ofertas exclusivas na sua caixa de entrada.
          </p>
          <p className="text-sm text-text-muted">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        {/* ── Form ────────────────────────────────────────── */}
        <div className="w-full rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <h1 className="mb-6 text-xl font-bold text-text">Criar conta</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Sobrenome" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Input label="Senha" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" error={errors.password?.message} {...register('password')} />
            <Input label="Confirmar senha" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-soft">
              <input type="checkbox" {...register('isSubscribed')} className="h-4 w-4 rounded accent-brand" />
              Quero receber novidades e ofertas por e-mail
            </label>

            <Button variant="primary" type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              <UserPlus size={16} /> Criar conta
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-text-muted lg:hidden">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </>
  );
}
