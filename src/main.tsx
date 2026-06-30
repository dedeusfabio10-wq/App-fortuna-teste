import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Registrar o Service Worker do PWA para suporte mobile nativo e offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Fortuna PWA registrado com sucesso! Escopo:', registration.scope);
      })
      .catch((error) => {
        console.error('Falha ao registrar Service Worker do PWA:', error);
      });
  });
}

