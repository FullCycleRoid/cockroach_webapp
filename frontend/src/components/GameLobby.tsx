import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { GameState, GameInvite } from '../types/gameTypes';

const GameLobby: React.FC = () => {
  const {
    invites,
    activeGames,
    createGame,
    invitePlayer,
    acceptInvite,
    loadGame,
    telegramUser,
    setCurrentGame
  } = useGameContext();

  const [usernameToInvite, setUsernameToInvite] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');

  const handleCreateGame = async () => {
    if (!telegramUser) return;
    await createGame(telegramUser.id);
  };

  const handleInvitePlayer = async () => {
    if (!selectedGameId || !usernameToInvite) return;
    await invitePlayer(selectedGameId, usernameToInvite);
    setUsernameToInvite('');
  };

  const handleAcceptInvite = async (inviteId: string) => {
    if (!telegramUser) return;
    await acceptInvite(inviteId, telegramUser.id);
  };

  return (
    <div className="lobby-container">
      <h2>Лобби игры "Тараканы"</h2>

      <div className="section">
        <button onClick={handleCreateGame} className="create-game-btn">
          Создать новую игру
        </button>
      </div>

      <div className="section">
        <h3>Активные игры</h3>
        {activeGames.length === 0 ? (
          <p>У вас нет активных игр</p>
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
          <p>У вас нет приглашений</p>
        ) : (
          <ul className="invites-list">
            {invites.map(invite => (
              <li key={invite.id} className="invite-item">
                <div>
                  <span>Приглашение в игру #{invite.game_id.slice(0, 6)}</span>
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

      {activeGames.length > 0 && (
        <div className="invite-section">
          <h4>Пригласить игрока</h4>
          <div className="invite-controls">
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="game-select"
            >
              <option value="">Выберите игру</option>
              {activeGames.map(game => (
                <option key={game.id} value={game.id}>
                  Игра #{game.id.slice(0, 6)}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={usernameToInvite}
              onChange={(e) => setUsernameToInvite(e.target.value)}
              placeholder="Введите @username"
              className="username-input"
            />

            <button
              onClick={handleInvitePlayer}
              disabled={!selectedGameId || !usernameToInvite}
              className="invite-btn"
            >
              Пригласить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLobby;