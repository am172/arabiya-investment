import { create } from 'zustand';

const KEY = 'nebras-theme';

export const useThemeStore = create((set, get) => ({
    mode: 'light',
    sync: () => {
        set({ mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' });
    },
    setMode: (mode) => {
        document.documentElement.classList.toggle('dark', mode === 'dark');
        try {
            localStorage.setItem(KEY, mode);
        } catch (error) {
            set({ mode });
            return;
        }
        set({ mode });
    },
    toggle: () => get().setMode(get().mode === 'dark' ? 'light' : 'dark')
}));