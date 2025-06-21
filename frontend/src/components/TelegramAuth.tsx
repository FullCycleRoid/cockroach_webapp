import React, { useEffect } from 'react';
import { useGameContext } from './GameContext';
import * as api from '../api/gameApi';
import { Player } from '../types/gameTypes';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user: any;
        };
        ready: () => void;
        showAlert: (msg: string, callback?: () => void) => void;
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
        // Регистрируем/авторизуем пользователя на бэкенде
        const userData: Player = {
          telegram_id: user.id.toString(),
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name
        };

        // Отправляем данные на бэкенд
        api.registerPlayer(userData)
          .then((registeredUser) => {
            setTelegramUser(registeredUser);
            window.Telegram.WebApp.ready();
          })
          .catch(error => {
            console.error("Ошибка регистрации:", error);
            window.Telegram.WebApp.showAlert("Ошибка регистрации. Попробуйте позже.");
          });
      }
    }
  }, [setTelegramUser]);

  return null;
};

export default TelegramAuth;