import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { StorefrontProvider } from './app/storefrontProvider';
import { AuthProvider } from './app/authProvider';
import { CartProvider } from './application/cart/CartContext';
import App from './app/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <StorefrontProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <App />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    color: '#1e293b',
                    fontFamily: '"Space Grotesk", sans-serif',
                  },
                }}
              />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </StorefrontProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
