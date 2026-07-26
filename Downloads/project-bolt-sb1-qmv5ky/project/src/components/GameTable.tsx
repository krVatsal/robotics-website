import { useState } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PlayerStats } from './PlayerStats';
import { RoundManager } from './RoundManager';

export function GameTable() {
  const { players, rounds, resetGame } = useGameStore();
  const [showHistory, setShowHistory] = useState(false);

  // Group rounds by sets
  const roundSets = rounds.reduce((sets, round) => {
    const setIndex = Math.floor((round.roundNumber - 1) / 4);
    if (!sets[setIndex]) {
      sets[setIndex] = [];
    }
    sets[setIndex].push(round);
    return sets;
  }, [] as typeof rounds[]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Game Progress</h2>
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition-colors"
        >
          <RotateCcw size={20} />
          Reset Game
        </button>
      </div>

      <PlayerStats />
      <RoundManager />

      {rounds.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 shadow-xl">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <Trophy size={20} className="text-yellow-400" />
            Game History
          </button>
          
          {showHistory && (
            <div className="space-y-6">
              {roundSets.map((set, setIndex) => (
                <div key={setIndex} className="border-b border-gray-700 pb-6">
                  <h3 className="font-semibold mb-4">Set {setIndex + 1}</h3>
                  <div className="space-y-4">
                    {set.map((round) => (
                      <div key={round.id} className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Round {(round.roundNumber - 1) % 4 + 1}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm text-gray-400 mb-1">Bets:</h5>
                            {round.bets.map((bet) => {
                              const player = players.find((p) => p.id === bet.playerId);
                              return (
                                <div key={bet.playerId} className="text-sm flex justify-between">
                                  <span>{player?.name}:</span>
                                  <span className="flex items-center gap-2">
                                    ${bet.amount}
                                    {bet.isAllIn && (
                                      <span className="text-red-400 text-xs">ALL-IN</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          {round.isSetComplete && round.winners.length > 0 && (
                            <div>
                              <h5 className="text-sm text-gray-400 mb-1">Winners:</h5>
                              {round.winners.map((winnerId) => {
                                const player = players.find((p) => p.id === winnerId);
                                return (
                                  <div key={winnerId} className="text-sm text-emerald-400">
                                    {player?.name}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {round.isSetComplete && (
                          <div className="mt-2 text-sm font-medium text-emerald-400">
                            Set Pot: ${round.pot}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}