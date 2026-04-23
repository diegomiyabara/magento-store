import { useEffect, useState } from 'react';
import { useAuthController } from '../../presentation/controllers/useAuthController';
import { InlineErrorState, InlineLoadingState } from '../../components/ui/PageState';
import { useAccountController } from '../../presentation/controllers/useAccountController';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AccountInformationPage() {
  const auth = useAuthController();
  const account = useAccountController();
  const initialProfileForm = {
    firstname: account.customer?.firstName || '',
    lastname: account.customer?.lastName || '',
    isSubscribed: account.isSubscribed,
  };
  const initialEmailForm = {
    email: account.customer?.email || '',
    password: '',
  };
  const [profileForm, setProfileForm] = useState({
    firstname: '',
    lastname: '',
    isSubscribed: false,
  });
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    confirmPassword: '',
    currentPassword: '',
    newPassword: '',
  });
  const [feedback, setFeedback] = useState({
    emailError: '',
    emailSuccess: '',
    passwordError: '',
    passwordSuccess: '',
    profileError: '',
    profileSuccess: '',
  });
  const [savingState, setSavingState] = useState({
    email: false,
    password: false,
    profile: false,
  });
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);

  useEffect(() => {
    if (!account.customer) {
      return;
    }

    setProfileForm({
      firstname: account.customer.firstName || '',
      lastname: account.customer.lastName || '',
      isSubscribed: account.isSubscribed,
    });
    setEmailForm((current) => ({
      ...current,
      email: account.customer.email || '',
    }));
  }, [account.customer, account.isSubscribed]);

  const isProfileDirty =
    profileForm.firstname !== initialProfileForm.firstname ||
    profileForm.lastname !== initialProfileForm.lastname ||
    profileForm.isSubscribed !== initialProfileForm.isSubscribed;

  const isEmailDirty =
    emailForm.email !== initialEmailForm.email || emailForm.password.trim().length > 0;
  const isEmailChanged = emailForm.email !== initialEmailForm.email;

  const isPasswordDirty =
    passwordForm.currentPassword.trim().length > 0 ||
    passwordForm.newPassword.trim().length > 0 ||
    passwordForm.confirmPassword.trim().length > 0;

  const profileValidationError =
    !profileForm.firstname.trim()
      ? 'Informe o primeiro nome.'
      : !profileForm.lastname.trim()
        ? 'Informe o sobrenome.'
        : '';

  const emailValidationError =
    !emailForm.email.trim()
      ? 'Informe o email.'
      : !isValidEmail(emailForm.email)
        ? 'Informe um email valido.'
        : isEmailChanged && !emailForm.password.trim()
          ? 'Informe sua senha atual para alterar o email.'
          : '';

  const passwordValidationError =
    !passwordForm.currentPassword.trim()
      ? 'Informe a senha atual.'
      : passwordForm.newPassword.length < 8
        ? 'A nova senha deve ter pelo menos 8 caracteres.'
        : passwordForm.newPassword !== passwordForm.confirmPassword
          ? 'A confirmacao da nova senha nao confere.'
          : '';

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setFeedback((current) => ({
      ...current,
      profileError: '',
      profileSuccess: '',
    }));

    if (profileValidationError) {
      setFeedback((current) => ({
        ...current,
        profileError: profileValidationError,
      }));
      return;
    }

    setSavingState((current) => ({ ...current, profile: true }));

    try {
      await account.useCases.updateCustomer(
        account.token,
        {
          firstname: profileForm.firstname,
          lastname: profileForm.lastname,
          is_subscribed: profileForm.isSubscribed,
        },
      );

      await Promise.all([account.reload(), auth.refreshCustomer()]);

      setFeedback((current) => ({
        ...current,
        profileSuccess: 'Informacoes da conta atualizadas com sucesso.',
      }));
    } catch (error) {
      setFeedback((current) => ({
        ...current,
        profileError: error.message,
      }));
    } finally {
      setSavingState((current) => ({ ...current, profile: false }));
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setFeedback((current) => ({
      ...current,
      emailError: '',
      emailSuccess: '',
    }));

    if (emailValidationError) {
      setFeedback((current) => ({
        ...current,
        emailError: emailValidationError,
      }));
      return;
    }

    setSavingState((current) => ({ ...current, email: true }));

    try {
      await account.useCases.updateCustomerEmail(account.token, {
        email: emailForm.email,
        password: emailForm.password,
      });

      await Promise.all([account.reload(), auth.refreshCustomer()]);

      setEmailForm((current) => ({
        ...current,
        email: emailForm.email,
        password: '',
      }));
      setFeedback((current) => ({
        ...current,
        emailSuccess: 'Email atualizado com sucesso.',
      }));
    } catch (error) {
      setFeedback((current) => ({
        ...current,
        emailError: error.message,
      }));
    } finally {
      setSavingState((current) => ({ ...current, email: false }));
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setFeedback((current) => ({
      ...current,
      passwordError: '',
      passwordSuccess: '',
    }));

    if (passwordValidationError) {
      setFeedback((current) => ({
        ...current,
        passwordError: passwordValidationError,
      }));
      return;
    }

    setSavingState((current) => ({ ...current, password: true }));

    try {
      await account.useCases.changeCustomerPassword(account.token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        confirmPassword: '',
        currentPassword: '',
        newPassword: '',
      });
      setIsPasswordFormVisible(false);
      setFeedback((current) => ({
        ...current,
        passwordSuccess: 'Senha alterada com sucesso.',
      }));
    } catch (error) {
      setFeedback((current) => ({
        ...current,
        passwordError: error.message,
      }));
    } finally {
      setSavingState((current) => ({ ...current, password: false }));
    }
  }

  return (
    <>
      <section className="account-hero">
        <p className="eyebrow">Account Information</p>
        <h2>Edit Account Information</h2>
        <p>Manage your personal data, email and password from this page.</p>
      </section>

      {account.error ? (
        <InlineErrorState
          title="Nao foi possivel carregar sua conta."
          detail={account.error.message}
        />
      ) : null}

      {account.isInitialLoading ? (
        <section className="account-section">
          <InlineLoadingState title="Carregando informacoes da conta..." />
        </section>
      ) : null}

      {!account.isInitialLoading ? (
      <section className="account-section">
        <div className="account-grid">
          <article className="account-block">
            <div className="account-block-header">
              <strong>Contact Information</strong>
            </div>
            <div className="account-block-body">
              <form className="auth-form auth-form-compact" onSubmit={handleProfileSubmit}>
                <div className="auth-grid">
                  <label className="form-field">
                    <span>First Name</span>
                    <input
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          firstname: event.target.value,
                        }))
                      }
                      placeholder="Seu nome"
                      required
                      type="text"
                      value={profileForm.firstname}
                    />
                  </label>

                  <label className="form-field">
                    <span>Last Name</span>
                    <input
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          lastname: event.target.value,
                        }))
                      }
                      placeholder="Seu sobrenome"
                      required
                      type="text"
                      value={profileForm.lastname}
                    />
                  </label>
                </div>

                <label className="checkbox-field">
                  <input
                    checked={profileForm.isSubscribed}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        isSubscribed: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>Assinar newsletter</span>
                </label>

                {feedback.profileError || (isProfileDirty && profileValidationError) ? (
                  <p className="form-error">{feedback.profileError || profileValidationError}</p>
                ) : null}
                {feedback.profileSuccess ? <p className="form-success">{feedback.profileSuccess}</p> : null}

                {isProfileDirty ? (
                  <button
                    className="button-link button-link-primary auth-submit"
                    disabled={savingState.profile || Boolean(profileValidationError)}
                    type="submit"
                  >
                    {savingState.profile ? 'Salvando...' : 'Save'}
                  </button>
                ) : null}
              </form>
            </div>
          </article>

          <article className="account-block">
            <div className="account-block-header">
              <strong>Change Email</strong>
            </div>
            <div className="account-block-body">
              <form className="auth-form auth-form-compact" onSubmit={handleEmailSubmit}>
                <label className="form-field">
                  <span>Email</span>
                  <input
                    onChange={(event) =>
                      setEmailForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="voce@exemplo.com"
                    required
                    type="email"
                    value={emailForm.email}
                  />
                </label>

                {isEmailChanged ? (
                  <label className="form-field">
                    <span>Current Password</span>
                    <input
                      onChange={(event) =>
                        setEmailForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Confirme sua senha atual"
                      required
                      type="password"
                      value={emailForm.password}
                    />
                  </label>
                ) : null}

                {feedback.emailError || (isEmailDirty && emailValidationError) ? (
                  <p className="form-error">{feedback.emailError || emailValidationError}</p>
                ) : null}
                {feedback.emailSuccess ? <p className="form-success">{feedback.emailSuccess}</p> : null}

                {isEmailDirty ? (
                  <button
                    className="button-link auth-submit"
                    disabled={savingState.email || Boolean(emailValidationError)}
                    type="submit"
                  >
                    {savingState.email ? 'Atualizando...' : 'Update Email'}
                  </button>
                ) : null}
              </form>
            </div>
          </article>
        </div>

        <article className="account-block">
          <div className="account-block-header">
            <strong>Change Password</strong>
          </div>
          <div className="account-block-body">
            {feedback.passwordSuccess ? <p className="form-success">{feedback.passwordSuccess}</p> : null}

            {!isPasswordFormVisible ? (
              <button
                className="button-link auth-submit account-inline-action"
                onClick={() => {
                  setFeedback((current) => ({
                    ...current,
                    passwordError: '',
                    passwordSuccess: '',
                  }));
                  setIsPasswordFormVisible(true);
                }}
                type="button"
              >
                Change Password
              </button>
            ) : (
              <form className="auth-form auth-form-compact" onSubmit={handlePasswordSubmit}>
                <div className="auth-grid auth-grid-3">
                  <label className="form-field">
                    <span>Current Password</span>
                    <input
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          currentPassword: event.target.value,
                        }))
                      }
                      placeholder="Sua senha atual"
                      required
                      type="password"
                      value={passwordForm.currentPassword}
                    />
                  </label>

                  <label className="form-field">
                    <span>New Password</span>
                    <input
                      minLength={8}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          newPassword: event.target.value,
                        }))
                      }
                      required
                      type="password"
                      value={passwordForm.newPassword}
                    />
                  </label>

                  <label className="form-field">
                    <span>Confirm New Password</span>
                    <input
                      minLength={8}
                      onChange={(event) =>
                        setPasswordForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Repita a nova senha"
                      required
                      type="password"
                      value={passwordForm.confirmPassword}
                    />
                  </label>
                </div>

                {feedback.passwordError || (isPasswordDirty && passwordValidationError) ? (
                  <p className="form-error">{feedback.passwordError || passwordValidationError}</p>
                ) : null}

                <div className="account-inline-actions">
                  <button
                    className="button-link auth-submit"
                    onClick={() => {
                      setPasswordForm({
                        confirmPassword: '',
                        currentPassword: '',
                        newPassword: '',
                      });
                      setFeedback((current) => ({
                        ...current,
                        passwordError: '',
                      }));
                      setIsPasswordFormVisible(false);
                    }}
                    type="button"
                  >
                    Cancel
                  </button>

                  {isPasswordDirty ? (
                    <button
                      className="button-link button-link-primary auth-submit"
                      disabled={savingState.password || Boolean(passwordValidationError)}
                      type="submit"
                    >
                      {savingState.password ? 'Atualizando...' : 'Save Password'}
                    </button>
                  ) : null}
                </div>
              </form>
            )}
          </div>
        </article>
      </section>
      ) : null}
    </>
  );
}
