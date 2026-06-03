import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useStorefrontServices } from '@/application/storefront/StorefrontContext';
import type { CustomerModel } from '@/domain/storefront/models';

const CUSTOMER_TOKEN_STORAGE_KEY = 'dm3dtech.customer.token';

interface AuthState {
  customer: CustomerModel | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  token: string | null;
}

const initialState: AuthState = {
  customer: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isLoggingIn: false,
  isRegistering: false,
  token: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { useCases } = useStorefrontServices();
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const token = window.localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY);

    if (!token) {
      setState((current) => ({
        ...current,
        isBootstrapping: false,
      }));
      return;
    }

    const controller = new AbortController();

    useCases
      .getCustomerProfile(token, controller.signal)
      .then((customer) => {
        setState({
          customer,
          isAuthenticated: Boolean(customer),
          isBootstrapping: false,
          isLoggingIn: false,
          isRegistering: false,
          token,
        });
      })
      .catch(() => {
        window.localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
        setState({
          customer: null,
          isAuthenticated: false,
          isBootstrapping: false,
          isLoggingIn: false,
          isRegistering: false,
          token: null,
        });
      });

    return () => {
      controller.abort();
    };
  }, [useCases]);

  async function login(credentials: { email: string; password: string }): Promise<{ customer: CustomerModel | null; token: string }> {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isLoggingIn: true,
    }));

    try {
      const rawToken = await useCases.loginCustomer(credentials, controller.signal);

      if (!rawToken) {
        throw new Error('Login falhou: token não recebido.');
      }

      const customer = await useCases.getCustomerProfile(rawToken, controller.signal);

      window.localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, rawToken);

      setState({
        customer,
        isAuthenticated: true,
        isBootstrapping: false,
        isLoggingIn: false,
        isRegistering: false,
        token: rawToken,
      });

      return { customer, token: rawToken };
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoggingIn: false,
      }));

      throw error;
    }
  }

  async function register(input: Record<string, unknown>): Promise<{ customer: CustomerModel | null; token: string }> {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isRegistering: true,
    }));

    try {
      await useCases.registerCustomer(input, controller.signal);
      const rawToken = await useCases.loginCustomer(
        { email: input.email as string, password: input.password as string },
        controller.signal,
      );

      if (!rawToken) {
        throw new Error('Registro falhou: token não recebido.');
      }

      const customer = await useCases.getCustomerProfile(rawToken, controller.signal);

      window.localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, rawToken);

      setState({
        customer,
        isAuthenticated: true,
        isBootstrapping: false,
        isLoggingIn: false,
        isRegistering: false,
        token: rawToken,
      });

      return { customer, token: rawToken };
    } catch (error) {
      setState((current) => ({
        ...current,
        isRegistering: false,
      }));

      throw error;
    }
  }

  async function refreshCustomer(): Promise<CustomerModel | null> {
    if (!state.token) {
      return null;
    }

    const controller = new AbortController();
    const customer = await useCases.getCustomerProfile(state.token, controller.signal);

    setState((current) => ({
      ...current,
      customer,
      isAuthenticated: Boolean(customer),
    }));

    return customer;
  }

  function logout() {
    window.localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
    setState({
      customer: null,
      isAuthenticated: false,
      isBootstrapping: false,
      isLoggingIn: false,
      isRegistering: false,
      token: null,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
        isBootstrapping: state.isBootstrapping,
        isLoggingIn: state.isLoggingIn,
        isRegistering: state.isRegistering,
        login,
        register,
        refreshCustomer,
        logout,
        token: state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
