import { useAuth } from '../../app/authContext';

export function useAuthController() {
  const auth = useAuth();

  return {
    customer: auth.customer,
    isAuthenticated: auth.isAuthenticated,
    isBootstrapping: auth.isBootstrapping,
    isLoggingIn: auth.isLoggingIn,
    login: auth.login,
    logout: auth.logout,
  };
}
