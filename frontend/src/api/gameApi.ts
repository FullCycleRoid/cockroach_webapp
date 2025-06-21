import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Player {
  id: string;
  username: string;
  first_name: string;
  last_name?: string;
}

export interface GameInvite {
  id: string;
  game_id: string;
  player_id: string;
  status: string;
  created_at: string;
}

export interface GameState {
  id: string;
  state: {
    cells: Record<string, { type: string; player: number | null }>;
    current_player: number;
    remaining_moves: number;
    activated_walls: string[];
    is_game_over: boolean;
    winner: number | null;
  };
  current_player_id: string;
  status: string;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

export const createGame = async (telegramId: string): Promise<GameState> => {
  const response = await axios.post(`${API_BASE_URL}/games`, {
    creator_id: telegramId
  });
  return response.data;
};

// ... остальные функции API ...