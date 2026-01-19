import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  dailyUsage: number;
  lastUsageDate: string; // YYYY-MM-DD
  checkLimit: () => boolean;
  incrementUsage: () => void;
}

const DAILY_LIMIT = 40;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      dailyUsage: 0,
      lastUsageDate: new Date().toISOString().split('T')[0],
      
      checkLimit: () => {
        const { dailyUsage, lastUsageDate } = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (lastUsageDate !== today) {
          // It's a new day, reset (logic handled in increment, but check should pass)
          return true;
        }
        
        return dailyUsage < DAILY_LIMIT;
      },

      incrementUsage: () => {
        const { dailyUsage, lastUsageDate } = get();
        const today = new Date().toISOString().split('T')[0];

        if (lastUsageDate !== today) {
          set({ dailyUsage: 1, lastUsageDate: today });
        } else {
          set({ dailyUsage: dailyUsage + 1 });
        }
      },
    }),
    {
      name: 'user-usage-storage',
    }
  )
);
