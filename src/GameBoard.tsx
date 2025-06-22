import React, { useState, useEffect } from 'react';

// === Константы ===
const WIDTH = 25;
const HEIGHT = 30;
const CELL_SIZE = 16;
const LINE_COLOR = '#d3d3d3';
const BOARD_COLOR = 'white';

// === Цвета ===
const RED = '#FF0000';
const DARK_RED = '#8B0000';
const BLUE = '#0000FF';
const DARK_BLUE = '#00008B';
const BG_BASE1 = '#E0FFE0';
const BG_BASE2 = '#FFE0E0';

// === Типы клеток ===
enum CellType {
  EMPTY = 'empty',
  X = 'x',      // таракан
  WALL = 'wall' // стена
}

// === Позиции ===
const CENTER = Math.floor(WIDTH / 2);

// База игрока 1 (красные)
const BASE1 = [
  [CENTER, 5], [CENTER - 1, 5], [CENTER - 2, 5], [CENTER + 1, 5], [CENTER + 2, 5],
  [CENTER - 2, 4], [CENTER + 2, 4],
  [CENTER - 2, 3], [CENTER + 2, 3],
  [CENTER - 2, 2], [CENTER + 2, 2],
  [CENTER, 1], [CENTER - 1, 1], [CENTER - 2, 1], [CENTER + 1, 1], [CENTER + 2, 1]
] as [number, number][];

const KING1: [number, number] = [CENTER, 3];

// База игрока 2 (синие)
const BASE2 = [
  [CENTER, HEIGHT - 6], [CENTER - 1, HEIGHT - 6], [CENTER - 2, HEIGHT - 6],
  [CENTER + 1, HEIGHT - 6], [CENTER + 2, HEIGHT - 6],
  [CENTER - 2, HEIGHT - 5], [CENTER + 2, HEIGHT - 5],
  [CENTER - 2, HEIGHT - 4], [CENTER + 2, HEIGHT - 4],
  [CENTER - 2, HEIGHT - 3], [CENTER + 2, HEIGHT - 3],
  [CENTER, HEIGHT - 2], [CENTER - 1, HEIGHT - 2], [CENTER - 2, HEIGHT - 2],
  [CENTER + 1, HEIGHT - 2], [CENTER + 2, HEIGHT - 2]
] as [number, number][];

const KING2: [number, number] = [CENTER, HEIGHT - 4];

// Типы данных
interface Cell {
  type: CellType;
  player: number | null;
}

interface GameState {
  currentPlayer: number;
  remainingMoves: number;
  cells: { [key: string]: Cell };
  activatedWalls: Set<string>;
  isGameOver: boolean;
  winner: number | null;
}

// Инициализация игрового состояния
const initializeGameState = (): GameState => {
  const cells: { [key: string]: Cell } = {};

  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      cells[`${x},${y}`] = { type: CellType.EMPTY, player: null };
    }
  }

  BASE1.forEach(([x, y]) => {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      cells[`${x},${y}`] = { type: CellType.X, player: 1 };
    }
  });

  BASE2.forEach(([x, y]) => {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      cells[`${x},${y}`] = { type: CellType.X, player: 2 };
    }
  });

  cells[`${KING1[0]},${KING1[1]}`] = { type: CellType.X, player: 1 };
  cells[`${KING2[0]},${KING2[1]}`] = { type: CellType.X, player: 2 };

  return {
    currentPlayer: 1,
    remainingMoves: 10,
    cells,
    activatedWalls: new Set<string>(),
    isGameOver: false,
    winner: null
  };
};

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGameState());

  // Обновление активированных стен
  useEffect(() => {
    if (!gameState.isGameOver) {
      updateActivatedWalls();
      checkKings();
    }
  }, [gameState.currentPlayer, gameState.cells]);

  // Проверка состояния королей
  const checkKings = () => {
    const king1 = gameState.cells[`${KING1[0]},${KING1[1]}`];
    const king2 = gameState.cells[`${KING2[0]},${KING2[1]}`];

    if (king1.type !== CellType.X || king1.player !== 1) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner: 2
      }));
    } else if (king2.type !== CellType.X || king2.player !== 2) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner: 1
      }));
    }
  };

  // Найти все связные области стен для игрока
  const getWallClusters = (player: number): Set<string>[] => {
    const walls = new Set<string>();

    Object.entries(gameState.cells).forEach(([pos, cell]) => {
      if (cell.type === CellType.WALL && cell.player === player) {
        walls.add(pos);
      }
    });

    const clusters: Set<string>[] = [];
    const visited = new Set<string>();
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    walls.forEach(wall => {
      if (visited.has(wall)) return;

      const cluster = new Set<string>();
      const queue = [wall];
      visited.add(wall);

      while (queue.length > 0) {
        const current = queue.shift()!;
        cluster.add(current);

        const [x, y] = current.split(',').map(Number);

        directions.forEach(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;
          const neighbor = `${nx},${ny}`;

          if (walls.has(neighbor) && !visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      clusters.push(cluster);
    });

    return clusters;
  };

  const updateActivatedWalls = () => {
    const player = gameState.currentPlayer;
    const clusters = getWallClusters(player);
    const activatedWalls = new Set<string>();

    clusters.forEach(cluster => {
      let activated = false;

      for (const wallPos of cluster) {
        const [x, y] = wallPos.split(',').map(Number);

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;
            const neighborPos = `${nx},${ny}`;
            const neighborCell = gameState.cells[neighborPos];

            if (neighborCell && neighborCell.type === CellType.X && neighborCell.player === player) {
              activated = true;
              break;
            }
          }
          if (activated) break;
        }
        if (activated) break;
      }

      if (activated) {
        cluster.forEach(pos => activatedWalls.add(pos));
      }
    });

    setGameState(prev => ({
      ...prev,
      activatedWalls
    }));
  };

  const isAdjacentToActivatedWall = (x: number, y: number): boolean => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;
        const neighborPos = `${nx},${ny}`;

        if (gameState.activatedWalls.has(neighborPos)) {
          return true;
        }
      }
    }
    return false;
  };

  const isAdjacentToPlayer = (x: number, y: number, player: number): boolean => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const nx = x + dx;
        const ny = y + dy;
        const neighborPos = `${nx},${ny}`;
        const neighborCell = gameState.cells[neighborPos];

        if (neighborCell && neighborCell.player === player && neighborCell.type === CellType.X) {
          return true;
        }
      }
    }
    return false;
  };

  // Обработка клика по клетке
  const handleCellClick = (x: number, y: number) => {
    if (gameState.isGameOver || gameState.remainingMoves <= 0) return;

    const pos = `${x},${y}`;
    const cell = gameState.cells[pos];
    const currentPlayer = gameState.currentPlayer;

    // Действие через активированную стену
    if (isAdjacentToActivatedWall(x, y)) {
      if (cell.type === CellType.X && cell.player !== currentPlayer) {
        // Превращаем вражеского таракана в стену
        const newCells = { ...gameState.cells };
        newCells[pos] = { type: CellType.WALL, player: currentPlayer };

        setGameState(prev => ({
          ...prev,
          cells: newCells,
          remainingMoves: prev.remainingMoves - 1
        }));
        return;
      } else if (cell.type === CellType.EMPTY) {
        // Ставим своего таракана
        const newCells = { ...gameState.cells };
        newCells[pos] = { type: CellType.X, player: currentPlayer };

        setGameState(prev => ({
          ...prev,
          cells: newCells,
          remainingMoves: prev.remainingMoves - 1
        }));
        return;
      }
    }

    // Стандартные действия
    if (cell.type === CellType.X && cell.player !== currentPlayer) {
      if (isAdjacentToPlayer(x, y, currentPlayer)) {
        const newCells = { ...gameState.cells };
        newCells[pos] = { type: CellType.WALL, player: currentPlayer };

        setGameState(prev => ({
          ...prev,
          cells: newCells,
          remainingMoves: prev.remainingMoves - 1
        }));
        return;
      }
    }

    if (cell.type === CellType.EMPTY) {
      if (isAdjacentToPlayer(x, y, currentPlayer)) {
        const newCells = { ...gameState.cells };
        newCells[pos] = { type: CellType.X, player: currentPlayer };

        setGameState(prev => ({
          ...prev,
          cells: newCells,
          remainingMoves: prev.remainingMoves - 1
        }));
      }
    }
  };

  // Обновление статуса после хода
  useEffect(() => {
    if (gameState.remainingMoves <= 0 && !gameState.isGameOver) {
      const newPlayer = gameState.currentPlayer === 1 ? 2 : 1;

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          currentPlayer: newPlayer,
          remainingMoves: 10
        }));
      }, 500);
    }
  }, [gameState.remainingMoves]);

  // Рендер клетки
  const renderCell = (x: number, y: number) => {
    const pos = `${x},${y}`;
    const cell = gameState.cells[pos];
    let cellStyle: React.CSSProperties = {
      width: CELL_SIZE,
      height: CELL_SIZE,
      border: `1px solid ${LINE_COLOR}`,
      position: 'relative',
      boxSizing: 'border-box',
      cursor: gameState.isGameOver ? 'default' : 'pointer'
    };

    // Отрисовка фона базы
    const isBase1 = BASE1.some(([bx, by]) => bx === x && by === y);
    const isBase2 = BASE2.some(([bx, by]) => bx === x && by === y);

    if (isBase1) cellStyle.backgroundColor = BG_BASE1;
    if (isBase2) cellStyle.backgroundColor = BG_BASE2;

    // Отрисовка содержимого клетки
    let cellContent = null;

    if (cell.type === CellType.X) {
      const isKing = (x === KING1[0] && y === KING1[1]) || (x === KING2[0] && y === KING2[1]);
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
      const isActivated = gameState.activatedWalls.has(pos);

      cellStyle.backgroundColor = color;

      if (isActivated) {
        cellStyle.boxShadow = 'inset 0 0 0 1px yellow';
      }
    }

    return (
      <div
        key={`${x}-${y}`}
        style={cellStyle}
        onClick={() => !gameState.isGameOver && handleCellClick(x, y)}
      >
        {cellContent}
      </div>
    );
  };

  // Рендер игрового поля
  const renderBoard = () => {
    const board = [];

    for (let y = 0; y < HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < WIDTH; x++) {
        row.push(renderCell(x, y));
      }
      board.push(
        <div key={y} style={{ display: 'flex' }}>
          {row}
        </div>
      );
    }

    return board;
  };

  // Получение информации о текущем игроке
  const playerInfo = {
    color: gameState.currentPlayer === 1 ? RED : BLUE,
    name: gameState.currentPlayer === 1 ? 'Красный' : 'Синий'
  };

  // Обработка новой игры
  const handleNewGame = () => {
    setGameState(initializeGameState());
  };

  // Рендер экрана завершения игры
  if (gameState.isGameOver) {
    const winnerColor = gameState.winner === 1 ? RED : BLUE;
    const winnerName = gameState.winner === 1 ? 'Красный' : 'Синий';

    return (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        <h2 style={{
          color: winnerColor,
          fontSize: '24px',
          marginBottom: '20px',
          textShadow: '0 0 10px rgba(255,255,255,0.5)'
        }}>
          Игра окончена! Победил {winnerName} игрок!
        </h2>

        <button
          onClick={handleNewGame}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          Новая игра
        </button>
      </div>
    );
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
        color: playerInfo.color,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        marginBottom: '10px'
      }}>
        Ход: {playerInfo.name} | Осталось ходов: {gameState.remainingMoves}
      </div>

      <div style={{
        backgroundColor: BOARD_COLOR,
        border: '1px solid #444',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        overflow: 'auto',
        maxHeight: '70vh'
      }}>
        {renderBoard()}
      </div>

      <div style={{
        marginTop: '15px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#aaa'
      }}>
        <p>Клик по пустой клетке - ставит таракана</p>
        <p>Клик по вражескому таракану - превращает в стену</p>
      </div>
    </div>
  );
};

export default GameBoard;