import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  isAllIn: boolean;
}

export interface Bet {
  playerId: string;
  amount: number;
  isAllIn: boolean;
}

export interface Round {
  id: string;
  roundNumber: number;
  bets: Bet[];
  winners: string[];
  pot: number;
  isSetComplete: boolean;
}

interface GameState {
  players: Player[];
  rounds: Round[];
  gameStarted: boolean;
  currentRound: number;
  currentSet: number;
  addPlayers: (players: Player[]) => void;
  startGame: () => void;
  addRound: (round: Round) => void;
  resetGame: () => void;
  updatePlayerBalance: (playerId: string, newBalance: number, isAllIn?: boolean) => void;
  hasAllInPlayer: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  rounds: [],
  gameStarted: false,
  currentRound: 0,
  currentSet: 1,
  addPlayers: (players) => set({ players: players.map(p => ({ ...p, isAllIn: false })) }),
  startGame: () => set({ gameStarted: true }),
  addRound: (round) => set((state) => {
    const newCurrentRound = state.currentRound + 1;
    const isSetComplete = newCurrentRound % 4 === 0 || get().hasAllInPlayer();
    const newRound = { ...round, isSetComplete };
    
    return {
      rounds: [...state.rounds, newRound],
      currentRound: newCurrentRound,
      currentSet: isSetComplete ? state.currentSet + 1 : state.currentSet,
    };
  }),
  resetGame: () => set({ 
    players: [], 
    rounds: [], 
    gameStarted: false, 
    currentRound: 0,
    currentSet: 1
  }),
  updatePlayerBalance: (playerId, newBalance, isAllIn = false) => set((state) => ({
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, balance: newBalance, isAllIn } : player
    ),
  })),
  hasAllInPlayer: () => {
    const state = get();
    return state.players.some(player => player.isAllIn);
  },
}));