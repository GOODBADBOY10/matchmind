import { create } from "zustand";

interface AuthState {
  jwt: string | null;
  apiToken: string | null;
  setAuth: (jwt: string, apiToken: string) => void;
  clearAuth: () => void;
}

interface Fixture {
  id: number;
  home: string;
  away: string;
  status: string;
  homeScore: number;
  awayScore: number;
  minute: number;
}

interface GameState {
  currentFixtureId: number | null;
  streak: number;
  totalGuesses: number;
  correctGuesses: number;
  lastResult: "correct" | "wrong" | null;
  setCurrentFixture: (id: number) => void;
  recordGuess: (correct: boolean) => void;
  resetGame: () => void;
}

interface AppState extends AuthState, GameState {
  fixtures: Fixture[];
  setFixtures: (fixtures: Fixture[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  jwt: null,
  apiToken: null,
  setAuth: (jwt, apiToken) => set({ jwt, apiToken }),
  clearAuth: () => set({ jwt: null, apiToken: null }),

  // Fixtures
  fixtures: [],
  setFixtures: (fixtures) => set({ fixtures }),

  // Game
  currentFixtureId: null,
  streak: 0,
  totalGuesses: 0,
  correctGuesses: 0,
  lastResult: null,
  setCurrentFixture: (id) => set({ currentFixtureId: id }),
  recordGuess: (correct) =>
    set((state) => ({
      streak: correct ? state.streak + 1 : 0,
      totalGuesses: state.totalGuesses + 1,
      correctGuesses: correct
        ? state.correctGuesses + 1
        : state.correctGuesses,
      lastResult: correct ? "correct" : "wrong",
    })),
  resetGame: () =>
    set({
      currentFixtureId: null,
      streak: 0,
      totalGuesses: 0,
      correctGuesses: 0,
      lastResult: null,
    }),
}));