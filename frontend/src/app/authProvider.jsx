import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import { useStorefrontServices } from './storefrontContext';

const CUSTOMER_TOKEN_STORAGE_KEY = 'dm3dtech.customer.token';

export function AuthProvider({ children }) {
  const { useCases } = useStorefrontServices();
  const [state, setState] = useState({
    customer: null,
    isAuthenticated: false,
    isBootstrapping: true,
    isLoggingIn: false,
    token: null,
  });

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
          token: null,
        });
      });

    return () => {
      controller.abort();
    };
  }, [useCases]);

  async function login(credentials) {
    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isLoggingIn: true,
    }));

    try {
      const token = await useCases.loginCustomer(credentials, controller.signal);
      const customer = await useCases.getCustomerProfile(token, controller.signal);

      window.localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, token);

      setState({
        customer,
        isAuthenticated: true,
        isBootstrapping: false,
        isLoggingIn: false,
        token,
      });

      return { customer, token };
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoggingIn: false,
      }));

      throw error;
    }
  }

  function logout() {
    window.localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
    setState({
      customer: null,
      isAuthenticated: false,
      isBootstrapping: false,
      isLoggingIn: false,
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
        login,
        logout,
        token: state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
