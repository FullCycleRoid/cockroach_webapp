import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { GameState, LocalGameState, CellType } from '../types/gameTypes';

// Константы игры
const WIDTH = 25;
const HEIGHT = 30;
const CELL_SIZE = 16;
const LINE_COLOR = '#d3d3d3';
const BOARD_COLOR = 'white';

const RED = '#FF0000';
const DARK_RED = '#8B0000';
const BLUE = '#0000FF';
const DARK_BLUE = '#00008B';
const BG_BASE1 = '#E0FFE0';
const BG_BASE2 = '#FFE0E0';

const CENTER = Math.floor(WIDTH / 2);

const GameBoard: React.FC = () => {
  const { currentGame, makeMove, telegramUser, setCurrentGame } = useGameContext();
  const [localState, setLocalState] = useState<LocalGameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Преобразование состояния из бекенда в локальное
  useEffect(() => {
    if (currentGame) {
      const state = currentGame.state;
      setLocalState({
        currentPlayer: state.current_player,
        remainingMoves: state.remaining_moves,
        cells: state.cells,
        activatedWalls: new Set(state.activated_walls),
        isGameOver: state.is_game_over,
        winner: state.winner
      });
    } else {
      setLocalState(null);
    }
  }, [currentGame]);

  // WebSocket подключение для обновлений
  useEffect(() => {
    if (!currentGame) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/game/${currentGame.id}`;

    const websocket = new WebSocket(wsUrl);
    setWs(websocket);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'game_update') {
        setCurrentGame(data.game);
      }
    };

    return () => {
      websocket.close();
    };
  }, [currentGame, setCurrentGame]);

  const handleCellClick = async (x: number, y: number) => {
    if (!localState || !telegramUser) return;

    // Проверяем, что это ход текущего игрока
    const currentPlayerId = currentGame?.current_player_id;
    if (currentPlayerId !== telegramUser.id) {
      alert('Сейчас не ваш ход!');
      return;
    }

    try {
      await makeMove(x, y);
    } catch (error) {
      console.error('Ошибка хода:', error);
    }
  };

  // Рендер клетки
  const renderCell = (x: number, y: number) => {
    if (!localState) return null;

    const pos = `${x},${y}`;
    const cell = localState.cells[pos] || { type: CellType.EMPTY, player: null };
    let cellStyle: React.CSSProperties = {
      width: CELL_SIZE,
      height: CELL_SIZE,
      border: `1px solid ${LINE_COLOR}`,
      position: 'relative',
      boxSizing: 'border-box',
      cursor: localState.isGameOver ? 'default' : 'pointer'
    };

    // Определение базовых позиций
    const isBase1 = [
      [CENTER, 5], [CENTER - 1, 5], [CENTER - 2, 5], [CENTER + 1, 5], [CENTER + 2, 5],
      [CENTER - 2, 4], [CENTER + 2, 4],
      [CENTER - 2, 3], [CENTER + 2, 3],
      [CENTER - 2, 2], [CENTER + 2, 2],
      [CENTER, 1], [CENTER - 1, 1], [CENTER - 2, 1], [CENTER + 1, 1], [CENTER + 2, 1]
    ].some(([bx, by]) => bx === x && by === y);

    const isBase2 = [
      [CENTER, HEIGHT - 6], [CENTER - 1, HEIGHT - 6], [CENTER - 2, HEIGHT - 6],
      [CENTER + 1, HEIGHT - 6], [CENTER + 2, HEIGHT - 6],
      [CENTER - 2, HEIGHT - 5], [CENTER + 2, HEIGHT - 5],
      [CENTER - 2, HEIGHT - 4], [CENTER + 2, HEIGHT - 4],
      [CENTER - 2, HEIGHT - 3], [CENTER + 2, HEIGHT - 3],
      [CENTER, HEIGHT - 2], [CENTER - 1, HEIGHT - 2], [CENTER - 2, HEIGHT - 2],
      [CENTER + 1, HEIGHT - 2], [CENTER + 2, HEIGHT - 2]
    ].some(([bx, by]) => bx === x && by === y);

    // Отрисовка фона базы
    if (isBase1) cellStyle.backgroundColor = BG_BASE1;
    if (isBase2) cellStyle.backgroundColor = BG_BASE2;

    // Отрисовка содержимого клетки
    let cellContent = null;

    if (cell.type === CellType.X) {
      const isKing1 = x === CENTER && y === 3;
      const isKing2 = x === CENTER && y === HEIGHT - 4;
      const isKing = isKing1 || isKing2;
      const color = cell.player === 1 ? RED : BLUE;

      if (isKing) {
        // Король - крестик с кружком
        cellContent = (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              height: 3,
              backgroundColor: color,
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              height: 3,
              backgroundColor: color,
              transform: 'translate(-50%, -50%) rotate(-45deg)',
            }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50%',
              height: '50%',
              border: `2px solid ${color}`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}></div>
          </>
        );
      } else {
        // Обычный таракан - крестик
        cellContent = (
          <>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              height: 2,
              backgroundColor: color,
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}></div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '70%',
              height: 2,
              backgroundColor: color,
              transform: 'translate(-50%, -50%) rotate(-45deg)',
            }}></div>
          </>
        );
      }
    } else if (cell.type === CellType.WALL) {
      const color = cell.player === 1 ? DARK_RED : DARK_BLUE;
      const isActivated = localState.activatedWalls.has(pos);

      cellStyle.backgroundColor = color;

      if (isActivated) {
        cellStyle.boxShadow = 'inset 0 0 0 1px yellow';
      }
    }

    return (
      <div
        key={`${x}-${y}`}
        style={cellStyle}
        onClick={() => !localState.isGameOver && handleCellClick(x, y)}
      >
        {cellContent}
      </div>
    );
  };

  if (!localState) {
    return <div>Загрузка игры...</div>;
  }

  return (
    <div style={{
      maxWidth: WIDTH * CELL_SIZE,
      margin: '0 auto',
      padding: '10px'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: localState.currentPlayer === 1 ? RED : BLUE,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        {`Ход: ${localState.currentPlayer === 1 ? 'Красный' : 'Синий'} | Осталось ходов: ${localState.remainingMoves}`}
      </div>

      <div style={{
        backgroundColor: BOARD_COLOR,
        border: '1px solid #444',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        overflow: 'auto',
        maxHeight: '70vh'
      }}>
        {Array.from({ length: HEIGHT }).map((_, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {Array.from({ length: WIDTH }).map((_, x) => renderCell(x, y))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;