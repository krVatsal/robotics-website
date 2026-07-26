import { useState } from 'react';
import { Plus, Minus, Play } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

type Player = {
  id: string;
  name: string;
  balance: number;
  isAllIn: boolean;
};

export function PlayerSetup() {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '', balance: 0, isAllIn: false },
    { id: '2', name: '', balance: 0, isAllIn: false },
  ]);

  const { addPlayers, startGame } = useGameStore();

  const addPlayer = () => {
    setPlayers([...players, { id: String(players.length + 1), name: '', balance: 0, isAllIn: false }]);
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(players.filter((p) => p.id !== id));
    }
  };

  const updatePlayer = (id: string, field: 'name' | 'balance', value: string | number) => {
    setPlayers(
      players.map((p) =>
        p.id === id ? { ...p, [field]: field === 'balance' ? Number(value) : value } : p
      )
    );
  };

  const handleStartGame = () => {
    const validPlayers = players.every((p) => p.name && p.balance > 0);
    if (validPlayers) {
      addPlayers(players.map((p) => ({ ...p, initialBalance: p.balance })));
      startGame();
    } else {
      alert('All players must have a name and a balance greater than 0.');
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-6">Player Setup</h2>
      <div className="space-y-4">
        {players.map((player) => (
          <div key={player.id} className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Player Name"
              value={player.name}
              onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
              className="bg-gray-700 rounded px-3 py-2 flex-1"
            />
            <input
              type="number"
              placeholder="Initial Balance"
              value={player.balance || ''}
              onChange={(e) => updatePlayer(player.id, 'balance', e.target.value)}
              className="bg-gray-700 rounded px-3 py-2 w-32"
            />
            <button
              onClick={() => removePlayer(player.id)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Minus size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={addPlayer}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
        >
          <Plus size={20} />
          Add Player
        </button>
        <button
          onClick={handleStartGame}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500 transition-colors"
        >
          <Play size={20} />
          Start Game
        </button>
      </div>
    </div>
  );
}
