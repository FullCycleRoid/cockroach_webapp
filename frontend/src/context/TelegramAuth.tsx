import React, { useEffect } from 'react';
import { useGameContext } from './GameContext';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user: any;
        };
        ready: () => void;
      };
    };
  }
}

const TelegramAuth: React.FC = () => {
  const { setTelegramUser } = useGameContext();

  useEffect(() => {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp?.initData) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user) {
        setTelegramUser({
          id: user.id.toString(),
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name
        });
        window.Telegram.WebApp.ready();
      }
    }
  }, [setTelegramUser]);

  return null;
};

export default TelegramAuth;