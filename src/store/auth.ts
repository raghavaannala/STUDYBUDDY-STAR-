import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  progress: {
    completedChallenges: number;
    totalPoints: number;
    rank: string;
  };
}

interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: async (email, password) => {
        // Simulate API call
        const user = {
          id: '1',
          name: 'User',
          email,
          progress: {
            completedChallenges: 0,
            totalPoints: 0,
            rank: 'Beginner',
          },
        };
        set({ user, isAuthenticated: true });
      },
      register: async (name, email, password) => {
        // Simulate API call
        const user = {
          id: '1',
          name,
          email,
          progress: {
            completedChallenges: 0,
            totalPoints: 0,
            rank: 'Beginner',
          },
        };
        set({ user, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
); 