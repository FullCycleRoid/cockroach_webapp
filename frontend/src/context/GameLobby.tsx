import React from 'react';
import { useGameContext } from './GameContext';

const GameLobby: React.FC = () => {
  const {
    invites,
    activeGames,
    createGame,
    invitePlayer,
    acceptInvite,
    loadGame,
    telegramUser
  } = useGameContext();

  const [usernameToInvite, setUsernameToInvite] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');

  const handleCreateGame = async () => {
    if (!telegramUser) return;
    await createGame(telegramUser.id);
  };

  const handleInvitePlayer = async (gameId: string) => {
    if (!usernameToInvite) return;
    await invitePlayer(gameId, usernameToInvite);
    setUsernameToInvite('');
  };

  const handleAcceptInvite = async (inviteId: string) => {
    if (!telegramUser) return;
    await acceptInvite(inviteId, telegramUser.id);
  };

  return (
    <div className="lobby-container">
      <h2>Мои игры</h2>

      <button onClick={handleCreateGame} className="create-game-btn">
        Создать новую игру
      </button>

      <div className="section">
        <h3>Активные игры</h3>
        {activeGames.length === 0 ? (
          <p>Нет активных игр</p>
        ) : (
          <ul className="games-list">
            {activeGames.map(game => (
              <li key={game.id} className="game-item">
                <div>
                  <span>Игра #{game.id.slice(0, 6)}</span>
                  <span>Статус: {game.status}</span>
                </div>
                <button
                  onClick={() => loadGame(game.id)}
                  className="join-btn">
                  Продолжить
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h3>Мои приглашения</h3>
        {invites.length === 0 ? (
          <p>Нет приглашений</p>
        ) : (
          <ul className="invites-list">
            {invites.map(invite => (
              <li key={invite.id} className="invite-item">
                <div>
                  <span>Приглашение от: {invite.creator.username}</span>
                  <span>Статус: {invite.status}</span>
                </div>
                {invite.status === 'pending' && (
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="accept-btn">
                    Принять
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedGameId && (
        <div className="invite-section">
          <h4>Пригласить игрока в игру #{selectedGameId.slice(0, 6)}</h4>
          <div className="invite-form">
            <input
              type="text"
              value={usernameToInvite}
              onChange={(e) => setUsernameToInvite(e.target.value)}
              placeholder="@username игрока"
            />
            <button
              onClick={() => handleInvitePlayer(selectedGameId)}
              disabled={!usernameToInvite}>
              Отправить приглашение
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLobby;