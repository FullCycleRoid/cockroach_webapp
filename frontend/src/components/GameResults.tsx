import React from 'react';
import { useGameContext } from '../context/GameContext';
import { GameState } from '../types/gameTypes';

const GameResults: React.FC = () => {
  const { currentGame, setCurrentGame, telegramUser } = useGameContext();

  if (!currentGame || !currentGame.winner_id) return null;

  const winnerColor = currentGame.winner_id === '1' ? '#FF0000' : '#0000FF';
  const winnerName = currentGame.winner_id === '1' ? 'Красный' : 'Синий';
  const isWinner = telegramUser?.id === currentGame.winner_id;

  const handleNewGame = () => {
    if (telegramUser) {
      setCurrentGame(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: 'white',
        borderRadius: '10px',
        maxWidth: '90%',
        width: '400px'
      }}>
        <h2 style={{
          color: winnerColor,
          fontSize: '24px',
          marginBottom: '20px'
        }}>
          {isWinner ? '🎉 Вы победили! 🎉' : `Победил ${winnerName} игрок`}
        </h2>

        <p style={{ marginBottom: '20px' }}>
          Игра завершена. Хотите сыграть ещё?
        </p>

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
    </div>
  );
};

export default GameResults;