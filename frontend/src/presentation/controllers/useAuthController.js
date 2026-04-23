import { useAuth } from '../../app/authContext';

export function useAuthController() {
  const auth = useAuth();

  return {
    customer: auth.customer,
    isAuthenticated: auth.isAuthenticated,
    isBootstrapping: auth.isBootstrapping,
    isLoggingIn: auth.isLoggingIn,
    isRegistering: auth.isRegistering,
    login: auth.login,
    register: auth.register,
    refreshCustomer: auth.refreshCustomer,
    logout: auth.logout,
  };
}
