import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { StorefrontProvider } from './app/storefrontProvider';
import './styles/global.css';

const Root = import.meta.env.DEV ? React.Fragment : React.StrictMode;

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root>
    <StorefrontProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StorefrontProvider>
  </Root>,
);
