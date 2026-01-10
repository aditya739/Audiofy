import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackData } from '../types';

interface PlayerState {
    currentTrack: TrackData | null;
    queue: TrackData[];
    isPlaying: boolean;
    repeatMode: 'off' | 'track' | 'queue';
    shuffle: boolean;
    downloads: string[];
    recentPlays: TrackData[];
    favorites: TrackData[];
    theme: 'dark' | 'light';

    // Actions
    setCurrentTrack: (track: TrackData | null) => void;
    setQueue: (queue: TrackData[]) => void;
    addToQueue: (track: TrackData) => void;
    removeFromQueue: (trackId: string) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setRepeatMode: (mode: 'off' | 'track' | 'queue') => void;
    toggleShuffle: () => void;
    clearQueue: () => void;
    toggleDownload: (trackId: string) => void;
    addToRecentPlays: (track: TrackData) => void;
    toggleFavorite: (track: TrackData) => void;
    isFavorite: (trackId: string) => boolean;
    toggleTheme: () => void;
}

export const usePlayerStore = create<PlayerState>()(
    persist(
        (set, get) => ({
            currentTrack: null,
            queue: [],
            isPlaying: false,
            repeatMode: 'off',
            shuffle: false,
            downloads: [],
            recentPlays: [],
            favorites: [],
            theme: 'dark',

            setCurrentTrack: (track) => set({ currentTrack: track }),
            setQueue: (queue) => set({ queue }),
            addToQueue: (track) => set((state) => ({
                queue: state.queue.find(t => t.id === track.id) ? state.queue : [...state.queue, track]
            })),
            removeFromQueue: (trackId) => set((state) => ({
                queue: state.queue.filter((track) => track.id !== trackId),
            })),
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            setRepeatMode: (mode) => set({ repeatMode: mode }),
            toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
            clearQueue: () => set({ queue: [], currentTrack: null }),
            toggleDownload: (trackId) => set((state) => ({
                downloads: state.downloads.includes(trackId)
                    ? state.downloads.filter(id => id !== trackId)
                    : [...state.downloads, trackId]
            })),
            addToRecentPlays: (track) => set((state) => {
                const filtered = state.recentPlays.filter(t => t.id !== track.id);
                return { recentPlays: [track, ...filtered].slice(0, 20) };
            }),
            toggleFavorite: (track) => set((state) => {
                const isFav = state.favorites.find(f => f.id === track.id);
                if (isFav) {
                    return { favorites: state.favorites.filter(f => f.id !== track.id) };
                } else {
                    return { favorites: [track, ...state.favorites] };
                }
            }),
            isFavorite: (trackId) => {
                return !!get().favorites.find(f => f.id === trackId);
            },
            toggleTheme: () => set((state) => ({
                theme: state.theme === 'dark' ? 'light' : 'dark'
            })),
        }),
        {
            name: 'player-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                queue: state.queue,
                repeatMode: state.repeatMode,
                shuffle: state.shuffle,
                downloads: state.downloads,
                recentPlays: state.recentPlays,
                favorites: state.favorites,
                theme: state.theme,
            }),
        }
    )
);
