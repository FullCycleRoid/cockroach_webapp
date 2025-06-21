import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Инициализация Telegram WebApp
function initTelegramWebApp() {
  if (window.Telegram?.WebApp) {
    try {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      console.log('Telegram WebApp initialized');
      return webApp;
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
      return null;
    }
  }
  return null;
}

// Основная функция рендеринга
function renderApp() {
  const webApp = initTelegramWebApp();
  const isWebApp = !!webApp;

  const container = document.getElementById('root');
  if (!container) return;

  const root = createRoot(container);

  root.render(
    <StrictMode>
      <App isWebApp={isWebApp} webApp={webApp} />
    </StrictMode>
  );
}

// Запуск приложения
renderApp();