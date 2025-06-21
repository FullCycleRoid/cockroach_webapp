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

export interface LocalGameState {
  currentPlayer: number;
  remainingMoves: number;
  cells: { [key: string]: { type: string; player: number | null } };
  activatedWalls: Set<string>;
  isGameOver: boolean;
  winner: number | null;
}

export enum CellType {
  EMPTY = 'empty',
  X = 'x',
  WALL = 'wall'
}