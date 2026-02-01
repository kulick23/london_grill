import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nProvider.jsx';
import { ToastProvider } from './components/Toast/ToastProvider.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nProvider>
      <ToastProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </I18nProvider>
  </React.StrictMode>,
);
