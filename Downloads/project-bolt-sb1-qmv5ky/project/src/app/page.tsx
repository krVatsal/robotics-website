'use client';

import { DollarSign } from 'lucide-react';
import { PlayerSetup } from '../components/PlayerSetup';
import { GameTable } from '../components/GameTable';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const { gameStarted } = useGameStore();

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 bg-black/30 p-6 rounded-lg shadow-xl">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-400" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Poker Calculator Pro
            </h1>
          </div>
        </header>

        <div className="space-y-8">
          {!gameStarted ? <PlayerSetup /> : <GameTable />}
        </div>
      </div>
    </main>
  );
}