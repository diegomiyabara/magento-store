import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/authProvider';
import { CartProvider } from './application/cart/CartContext';
import App from './app/App';
import { StorefrontProvider } from './app/storefrontProvider';
import './styles/global.css';

const Root = import.meta.env.DEV ? React.Fragment : React.StrictMode;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root>
    <StorefrontProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </StorefrontProvider>
  </Root>,
);
