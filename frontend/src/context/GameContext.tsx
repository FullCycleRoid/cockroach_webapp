import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/gameApi';

interface GameContextType {
  currentGame: api.GameState | null;
  invites: api.GameInvite[];
  activeGames: api.GameState[];
  createGame: (telegramId: string) => Promise<void>;
  invitePlayer: (gameId: string, username: string) => Promise<void>;
  acceptInvite: (inviteId: string, telegramId: string) => Promise<void>;
  makeMove: (x: number, y: number) => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  telegramUser: any;
  setTelegramUser: (user: any) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<api.GameState | null>(null);
  const [invites, setInvites] = useState<api.GameInvite[]>([]);
  const [activeGames, setActiveGames] = useState<api.GameState[]>([]);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    if (telegramUser?.id) {
      loadInvites();
      loadActiveGames();
    }
  }, [telegramUser]);

  const loadInvites = async () => {
    if (!telegramUser?.id) return;
    const invites = await api.getMyInvites(telegramUser.id);
    setInvites(invites);
  };

  const loadActiveGames = async () => {
    if (!telegramUser?.id) return;
    const games = await api.getMyGames(telegramUser.id);
    setActiveGames(games);
  };

  const createGameHandler = async (telegramId: string) => {
    const gameInvite = await api.createGame(telegramId);
    setInvites(prev => [...prev, gameInvite]);
  };

  const invitePlayerHandler = async (gameId: string, username: string) => {
    await api.invitePlayer(gameId, username);
    loadInvites();
  };

  const acceptInviteHandler = async (inviteId: string, telegramId: string) => {
    const gameState = await api.acceptInvite(inviteId, telegramId);
    setCurrentGame(gameState);
    loadActiveGames();
    setInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

  const makeMoveHandler = async (x: number, y: number) => {
    if (!currentGame || !telegramUser) return;
    const updatedGame = await api.makeMove(currentGame.id, telegramUser.id, x, y);
    setCurrentGame(updatedGame);
  };

  const loadGameHandler = async (gameId: string) => {
    const gameState = await api.getGameState(gameId);
    setCurrentGame(gameState);
  };

  return (
    <GameContext.Provider value={{
      currentGame,
      invites,
      activeGames,
      createGame: createGameHandler,
      invitePlayer: invitePlayerHandler,
      acceptInvite: acceptInviteHandler,
      makeMove: makeMoveHandler,
      loadGame: loadGameHandler,
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