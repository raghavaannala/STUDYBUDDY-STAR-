import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  progress?: {
    completedChallenges: number;
    totalPoints: number;
    rank: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
  clearForm: () => void;
}

// For demo purposes, store users in localStorage
const DEMO_USERS_KEY = 'demo-users';

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      signIn: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          // Get existing users from localStorage
          const existingUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
          
          // Check if user exists
          const existingUser = existingUsers.find((u: User) => u.email === email);
          
          if (existingUser) {
            // If user exists, verify password
            if (existingUser.password !== password) {
              throw new Error('Invalid password');
            }
            // Store current user in localStorage for persistence
            localStorage.setItem('current-user', JSON.stringify(existingUser));
            set({ user: existingUser, isAuthenticated: true });
          } else if (name) {
            // If user doesn't exist and name is provided, create new user
            const newUser: User = {
              id: Math.random().toString(36).substr(2, 9),
              name,
              email,
              password,
              progress: {
                completedChallenges: 0,
                totalPoints: 0,
                rank: 'Beginner',
              },
            };
            
            // Save new user to localStorage
            localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([...existingUsers, newUser]));
            localStorage.setItem('current-user', JSON.stringify(newUser));
            set({ user: newUser, isAuthenticated: true });
          } else {
            throw new Error('User not found');
          }
        } catch (error) {
          console.error('Sign in failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      signOut: () => {
        localStorage.removeItem('current-user');
        set({ user: null, isAuthenticated: false });
      },
      clearForm: () => {
        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Restore user session on page load
        if (state) {
          const currentUser = localStorage.getItem('current-user');
          if (currentUser) {
            state.user = JSON.parse(currentUser);
            state.isAuthenticated = true;
          }
        }
      },
    }
  )
); 