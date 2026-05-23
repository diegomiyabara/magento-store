import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccountController } from '@/presentation/controllers/useAccountController';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/PageState';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName:    z.string().min(2, 'Mínimo 2 caracteres'),
  lastName:     z.string().min(2, 'Mínimo 2 caracteres'),
  isSubscribed: z.boolean().optional(),
});

const passwordSchema = z.object({
  currentPassword:  z.string().min(1, 'Obrigatório'),
  newPassword:      z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword:  z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountInformationPage() {
  const { customer, token, useCases, reload, isInitialLoading } = useAccountController();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { firstName: customer?.firstName ?? '', lastName: customer?.lastName ?? '', isSubscribed: customer?.isSubscribed ?? false },
  });

  const passForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  if (isInitialLoading) return <LoadingState title="Carregando informações..." />;

  async function onProfileSubmit(data: ProfileForm) {
    try {
      await useCases.updateCustomer(token!, {
        firstname: data.firstName,
        lastname: data.lastName,
        is_subscribed: data.isSubscribed,
      });
      reload?.();
      toast.success('Informações atualizadas!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar.');
    }
  }

  async function onPasswordSubmit(data: PasswordForm) {
    try {
      await useCases.changeCustomerPassword(token!, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passForm.reset();
      toast.success('Senha alterada com sucesso!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Senha atual incorreta.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* profile */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-base font-semibold text-text">Informações pessoais</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
            <Input label="Sobrenome" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-soft">
            <input type="checkbox" {...profileForm.register('isSubscribed')} className="h-4 w-4 rounded accent-brand" />
            Receber novidades por e-mail
          </label>
          <Button variant="primary" type="submit" loading={profileForm.formState.isSubmitting} className="self-end">
            Salvar
          </Button>
        </form>
      </div>

      {/* password */}
      <div className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-base font-semibold text-text">Alterar senha</h2>
        <form onSubmit={passForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
          <Input label="Senha atual" type="password" error={passForm.formState.errors.currentPassword?.message} {...passForm.register('currentPassword')} />
          <Input label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" error={passForm.formState.errors.newPassword?.message} {...passForm.register('newPassword')} />
          <Input label="Confirmar nova senha" type="password" error={passForm.formState.errors.confirmPassword?.message} {...passForm.register('confirmPassword')} />
          <Button variant="primary" type="submit" loading={passForm.formState.isSubmitting} className="self-end">
            Alterar senha
          </Button>
        </form>
      </div>
    </div>
  );
}
