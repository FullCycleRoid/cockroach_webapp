import React from 'react';
import { GameProvider } from './components/GameContext';
import TelegramAuth from './components/TelegramAuth';
import GameLobby from './components/GameLobby';
import GameBoard from './GameBoard';
import GameResults from './components/GameResults';
import './App.css';

const GameRouter: React.FC = () => {
  const { currentGame } = useGameContext();

  return (
    <>
      {currentGame ? (
        <>
          <GameBoard />
          {currentGame.state.is_game_over && <GameResults />}
        </>
      ) : (
        <GameLobby />
      )}

      {currentGame && !currentGame.state.is_game_over && (
        <button
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '8px 15px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => setCurrentGame(null)}
        >
          В лобби
        </button>
      )}
    </>
  );
};

function App() {
  return (
    <GameProvider>
      <div className="App">
        <TelegramAuth />
        <GameRouter />
      </div>
    </GameProvider>
  );
}

export default App;