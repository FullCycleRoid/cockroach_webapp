import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../api/gameApi';
import { GameState, GameInvite, Player } from '../types/gameTypes';

interface GameContextType {
  currentGame: GameState | null;
  invites: GameInvite[];
  activeGames: GameState[];
  createGame: (telegramId: string) => Promise<void>;
  invitePlayer: (gameId: string, username: string) => Promise<void>;
  acceptInvite: (inviteId: string, telegramId: string) => Promise<void>;
  makeMove: (x: number, y: number) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  setCurrentGame: (game: GameState | null) => void;
  telegramUser: Player | null;
  setTelegramUser: (user: Player | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [invites, setInvites] = useState<GameInvite[]>([]);
  const [activeGames, setActiveGames] = useState<GameState[]>([]);
  const [telegramUser, setTelegramUser] = useState<Player | null>(null);

  // Загрузка приглашений и активных игр при изменении telegramUser
  useEffect(() => {
    const loadData = async () => {
      if (telegramUser?.id) {
        try {
          const invitesData = await api.getMyInvites(telegramUser.id);
          setInvites(invitesData);
          const gamesData = await api.getMyGames(telegramUser.id);
          setActiveGames(gamesData);
        } catch (error) {
          console.error("Ошибка при загрузке данных:", error);
        }
      }
    };
    loadData();
  }, [telegramUser]);

  const createGame = async (telegramId: string) => {
    try {
      const newGame = await api.createGame(telegramId);
      setActiveGames(prev => [...prev, newGame]);
    } catch (error) {
      console.error("Ошибка при создании игры:", error);
    }
  };

  const invitePlayer = async (gameId: string, username: string) => {
    try {
      await api.invitePlayer(gameId, username);
      // Обновляем список приглашений
      if (telegramUser?.id) {
        const invitesData = await api.getMyInvites(telegramUser.id);
        setInvites(invitesData);
      }
    } catch (error) {
      console.error("Ошибка при отправке приглашения:", error);
    }
  };

  const acceptInvite = async (inviteId: string, telegramId: string) => {
    try {
      const gameState = await api.acceptInvite(inviteId, telegramId);
      setCurrentGame(gameState);
      // Обновляем активные игры
      const gamesData = await api.getMyGames(telegramId);
      setActiveGames(gamesData);
      // Удаляем принятое приглашение
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
    } catch (error) {
      console.error("Ошибка при принятии приглашения:", error);
    }
  };

  const makeMove = async (x: number, y: number) => {
    if (!currentGame || !telegramUser) return;
    try {
      const updatedGame = await api.makeMove(currentGame.id, telegramUser.id, x, y);
      setCurrentGame(updatedGame);
    } catch (error) {
      console.error("Ошибка при выполнении хода:", error);
    }
  };

  const loadGame = async (gameId: string) => {
    try {
      const gameState = await api.getGameState(gameId);
      setCurrentGame(gameState);
    } catch (error) {
      console.error("Ошибка при загрузке игры:", error);
    }
  };

  return (
    <GameContext.Provider value={{
      currentGame,
      invites,
      activeGames,
      createGame,
      invitePlayer,
      acceptInvite,
      makeMove,
      loadGame,
      setCurrentGame,
      telegramUser,
      setTelegramUser
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};