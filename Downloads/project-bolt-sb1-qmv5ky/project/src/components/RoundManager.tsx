import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export function RoundManager() {
  const { players, currentRound, currentSet, addRound, updatePlayerBalance, hasAllInPlayer } = useGameStore();
  const [bets, setBets] = useState<{ [key: string]: number }>({});
  const [winners, setWinners] = useState<string[]>([]);

  const roundInSet = (currentRound % 4) + 1;
  const isLastRoundInSet = roundInSet === 4 || hasAllInPlayer();

  const handleBetChange = (playerId: string, amount: string) => {
    const betAmount = Number(amount);
    const player = players.find(p => p.id === playerId);
    
    if (player && betAmount >= 0) {
      // Check if it's an all-in bet
      const isAllIn = betAmount === player.balance;
      setBets({ ...bets, [playerId]: betAmount });
      
      if (isAllIn) {
        updatePlayerBalance(playerId, 0, true);
      }
    }
  };

  const toggleWinner = (playerId: string) => {
    if (!isLastRoundInSet) return; // Only allow selecting winners on the last round of a set
    setWinners(
      winners.includes(playerId)
        ? winners.filter((id) => id !== playerId)
        : [...winners, playerId]
    );
  };

  const handleRoundComplete = () => {
    const totalPot = Object.entries(bets).reduce((sum, [playerId, amount]) => {
      const player = players.find(p => p.id === playerId);
      return sum + (player && !player.isAllIn ? amount : 0);
    }, 0);
    
    // Deduct bets from players
    Object.entries(bets).forEach(([playerId, amount]) => {
      const player = players.find((p) => p.id === playerId);
      if (player && !player.isAllIn) {
        updatePlayerBalance(playerId, player.balance - amount);
      }
    });

    // Distribute winnings only on set completion
    if (isLastRoundInSet && winners.length > 0) {
      const winningShare = totalPot / winners.length;
      winners.forEach((winnerId) => {
        const player = players.find((p) => p.id === winnerId);
        if (player) {
          updatePlayerBalance(winnerId, player.balance + winningShare);
        }
      });
    }

    // Add round to history
    addRound({
      id: String(Date.now()),
      roundNumber: currentRound + 1,
      bets: Object.entries(bets).map(([playerId, amount]) => ({
        playerId,
        amount,
        isAllIn: players.find(p => p.id === playerId)?.isAllIn || false
      })),
      winners: isLastRoundInSet ? winners : [],
      pot: totalPot,
      isSetComplete: isLastRoundInSet
    });

    // Reset form
    setBets({});
    if (isLastRoundInSet) {
      setWinners([]);
    }
  };

  const isRoundValid = () => {
    const allBetsValid = players.every(
      (player) => (typeof bets[player.id] === 'number' && bets[player.id] >= 0) || player.isAllIn
    );
    return allBetsValid && (!isLastRoundInSet || winners.length > 0);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Set {currentSet} - Round {roundInSet}/4</h2>
        {hasAllInPlayer() && (
          <span className="text-red-400 text-sm">All-in detected! Set will end after this round.</span>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Place Bets</h3>
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-4">
              <span className="w-32">{player.name}</span>
             <input
  type="number"
  value={bets[player.id] !== undefined && bets[player.id] !== null ? bets[player.id] : ''}
  onChange={(e) => handleBetChange(player.id, e.target.value)}
  placeholder="Bet amount"
  disabled={player.isAllIn}
  max={player.balance}
  className="bg-gray-700 rounded px-3 py-2 w-32 disabled:opacity-50"
/>

              {isLastRoundInSet && (
                <button
                  onClick={() => toggleWinner(player.id)}
                  className={`px-3 py-1 rounded ${
                    winners.includes(player.id)
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-gray-600 hover:bg-gray-500'
                  } transition-colors`}
                >
                  Winner
                </button>
              )}
              {player.isAllIn && (
                <span className="text-red-400 text-sm">All-in</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleRoundComplete}
          disabled={!isRoundValid()}
          className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Complete Round {isLastRoundInSet ? '& Set' : ''}
        </button>
      </div>
    </div>
  );
}