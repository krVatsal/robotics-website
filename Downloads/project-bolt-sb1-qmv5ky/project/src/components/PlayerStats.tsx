import { useGameStore } from '@/store/gameStore';

export function PlayerStats() {
  const { players } = useGameStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map((player) => (
        <div
          key={player.id}
          className="bg-gray-800/50 rounded-lg p-4 shadow-xl"
        >
          <h3 className="font-semibold text-lg mb-2">{player.name}</h3>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Balance:</span>
              <span className={player.balance > player.initialBalance ? 'text-green-400' : player.balance < player.initialBalance ? 'text-red-400' : ''}>
                ${player.balance}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Initial Balance:</span>
              <span>${player.initialBalance}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Profit/Loss:</span>
              <span className={player.balance - player.initialBalance > 0 ? 'text-green-400' : player.balance - player.initialBalance < 0 ? 'text-red-400' : ''}>
                ${player.balance - player.initialBalance}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}