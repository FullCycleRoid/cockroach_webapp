import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Создать новую игру
export const createGame = async (telegramId: string): Promise<GameState> => {
  const response = await axios.post(`${API_BASE_URL}/games`, {
    creator_id: telegramId
  });
  return response.data;
};

// Пригласить игрока
export const invitePlayer = async (gameId: string, telegramUsername: string): Promise<GameInvite> => {
  const response = await axios.post(`${API_BASE_URL}/games/${gameId}/invite`, {
    username: telegramUsername
  });
  return response.data;
};

// Принять приглашение
export const acceptInvite = async (inviteId: string, telegramId: string): Promise<GameState> => {
  const response = await axios.post(`${API_BASE_URL}/invites/${inviteId}/accept`, {
    player_id: telegramId
  });
  return response.data;
};

// Получить состояние игры
export const getGameState = async (gameId: string): Promise<GameState> => {
  const response = await axios.get(`${API_BASE_URL}/games/${gameId}`);
  return response.data;
};

// Сделать ход
export const makeMove = async (gameId: string, playerId: string, x: number, y: number): Promise<GameState> => {
  const response = await axios.post(`${API_BASE_URL}/games/${gameId}/move`, {
    player_id: playerId,
    x,
    y
  });
  return response.data;
};

// Получить мои активные игры
export const getMyGames = async (telegramId: string): Promise<GameState[]> => {
  const response = await axios.get(`${API_BASE_URL}/players/${telegramId}/games`);
  return response.data;
};

// Получить мои приглашения
export const getMyInvites = async (telegramId: string): Promise<GameInvite[]> => {
  const response = await axios.get(`${API_BASE_URL}/players/${telegramId}/invites`);
  return response.data;
};

// Регистрация/авторизация игрока
export const registerPlayer = async (userData: {
  telegram_id: string;
  username?: string;
  first_name: string;
  last_name?: string;
}): Promise<Player> => {
  const response = await axios.post(`${API_BASE_URL}/players`, userData);
  return response.data;
};