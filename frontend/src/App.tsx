import React from 'react';
import { GameProvider } from './context/GameContext';
import TelegramAuth from './components/TelegramAuth';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import './App.css';

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

const GameRouter: React.FC = () => {
  const { currentGame } = useGameContext();

  return (
    <>
      {currentGame ? (
        <GameBoard />
      ) : (
        <GameLobby />
      )}

      {currentGame && (
        <button
          className="back-to-lobby"
          onClick={() => setCurrentGame(null)}>
          Вернуться в лобби
        </button>
      )}
    </>
  );
};

export default App;