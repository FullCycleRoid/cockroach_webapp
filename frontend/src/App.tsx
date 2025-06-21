import { useEffect } from 'react';
import { GameProvider } from './components/GameContext';
import TelegramAuth from './components/TelegramAuth';
import GameRouter from './components/GameRouter';
import './App.css';

interface AppProps {
  isWebApp?: boolean;
  webApp?: any;
}

function App({ isWebApp, webApp }: AppProps) {
  useEffect(() => {
    if (isWebApp && webApp) {
      try {
        webApp.setHeaderColor('#4CAF50');
        webApp.setBackgroundColor('#f0f2f5');
      } catch (error) {
        console.error('Error setting Telegram WebApp colors:', error);
      }
    }
  }, [isWebApp, webApp]);

  return (
    <GameProvider>
      <div className="App">
        <TelegramAuth />
        <GameRouter />
      </div>
    </GameProvider>
  );
}

export default App;