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
                    background: 'rgba(18, 32, 52, 0.96)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f3efe8',
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
