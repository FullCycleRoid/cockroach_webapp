import React, { useEffect } from 'react';
import { useGameContext } from './GameContext';
import * as api from '../api/gameApi';
import { Player } from '../types/gameTypes';

const TelegramAuth: React.FC = () => {
  const { setTelegramUser } = useGameContext();

  useEffect(() => {
    const initTelegramAuth = async () => {
      try {
        if (window.Telegram?.WebApp?.initData) {
          const user = window.Telegram.WebApp.initDataUnsafe.user;
          if (user) {
            const userData: Player = {
              telegram_id: user.id.toString(),
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name || ''
            };

            const registeredUser = await api.registerPlayer(userData);
            setTelegramUser(registeredUser);

            // Уведомляем Telegram об успешной инициализации
            window.Telegram.WebApp.ready();
            console.log('Telegram user authenticated');
          }
        }
      } catch (error) {
        console.error('Telegram auth error:', error);
        if (window.Telegram?.WebApp?.showAlert) {
          window.Telegram.WebApp.showAlert('Ошибка авторизации. Попробуйте позже.');
        }
      }
    };

    initTelegramAuth();
  }, [setTelegramUser]);

  return null;
};

export default TelegramAuth;