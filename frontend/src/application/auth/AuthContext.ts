import { createContext, useContext } from 'react';
import type { CustomerModel } from '@/domain/storefront/models';

export interface AuthContextValue {
  customer: CustomerModel | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ customer: CustomerModel | null; token: string }>;
  register: (input: Record<string, unknown>) => Promise<{ customer: CustomerModel | null; token: string }>;
  refreshCustomer: () => Promise<CustomerModel | null>;
  logout: () => void;
  token: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('AuthContext nao inicializado.');
  }

  return context;
}
