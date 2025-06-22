import React, { useEffect } from 'react';
import GameBoard from './GameBoard';
import './index.css';

interface AppProps {
  isWebApp: boolean;
  webApp: any;
}

const App: React.FC<AppProps> = ({ isWebApp, webApp }) => {
  useEffect(() => {
    if (isWebApp && webApp) {
      // Настройка темы Telegram
      const themeParams = webApp.themeParams;
      document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color || '#17212b');
      document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color || '#ffffff');
    }
  }, [isWebApp, webApp]);

  return (
    <div className="app-container">
      <h1 className="game-title">Тараканы на тетрадке</h1>
      <GameBoard />

      {isWebApp && (
        <div className="telegram-info">
          Игра запущена в Telegram
        </div>
      )}
    </div>
  );
};

export default App;