import { useGameContext } from './GameContext';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';
import GameResults from './GameResults';

const GameRouter: React.FC = () => {
  const { currentGame, setCurrentGame } = useGameContext();

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
          className="back-to-lobby"
          onClick={() => setCurrentGame(null)}
        >
          В лобби
        </button>
      )}
    </>
  );
};

export default GameRouter;