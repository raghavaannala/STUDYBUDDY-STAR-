import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  puzzleScore: number;
  raceScore: number;
  completedPuzzles: string[];
  completedChallenges: string[];
  updatePuzzleScore: (score: number) => void;
  updateRaceScore: (score: number) => void;
  addCompletedPuzzle: (puzzleId: string) => void;
  addCompletedChallenge: (challengeId: string) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      puzzleScore: 0,
      raceScore: 0,
      completedPuzzles: [],
      completedChallenges: [],
      updatePuzzleScore: (score) =>
        set((state) => ({ puzzleScore: state.puzzleScore + score })),
      updateRaceScore: (score) =>
        set((state) => ({ raceScore: state.raceScore + score })),
      addCompletedPuzzle: (puzzleId) =>
        set((state) => ({
          completedPuzzles: [...new Set([...state.completedPuzzles, puzzleId])]
        })),
      addCompletedChallenge: (challengeId) =>
        set((state) => ({
          completedChallenges: [...new Set([...state.completedChallenges, challengeId])]
        }))
    }),
    {
      name: 'game-storage'
    }
  )
); 