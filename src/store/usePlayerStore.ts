import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackData } from '../types';
import DownloadManager from '../utils/DownloadManager';

interface PlayerState {
    currentTrack: TrackData | null;
    queue: TrackData[];
    isPlaying: boolean;
    repeatMode: 'off' | 'track' | 'queue';
    shuffle: boolean;
    downloads: string[];
    downloadedSongs: TrackData[];
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
    playNext: (auto?: boolean) => Promise<void>;
    playPrevious: () => Promise<void>;
    toggleDownload: (track: TrackData) => Promise<void>;
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
            downloadedSongs: [],
            recentPlays: [],
            favorites: [],
            theme: 'dark',

            setCurrentTrack: (track) => set({ currentTrack: track }),
            setQueue: (queue) => set({ queue }),
            addToQueue: (track) => set((state) => ({
                queue: state.queue.find(t => String(t.id) === String(track.id)) ? state.queue : [...state.queue, track]
            })),
            removeFromQueue: (trackId) => set((state) => ({
                queue: state.queue.filter((track) => track.id !== trackId),
            })),
            setIsPlaying: (isPlaying) => set({ isPlaying }),
            setRepeatMode: (mode) => set({ repeatMode: mode }),
            toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
            clearQueue: () => set({ queue: [], currentTrack: null }),
            playNext: async (auto = false) => {
                const { queue, currentTrack, repeatMode, shuffle } = get();
                const { musicPlayer } = require('../services/MusicPlayer');

                if (!currentTrack) return;

                // Robust Repeat One Logic: Replay current track directly
                if (auto && repeatMode === 'track') {
                    await musicPlayer.play(currentTrack);
                    return;
                }

                if (queue.length === 0) return;

                const currentIndex = queue.findIndex(t => String(t.id) === String(currentTrack.id));
                let nextIndex = -1;

                if (shuffle) {
                    if (queue.length <= 1) {
                        nextIndex = 0;
                    } else {
                        do {
                            nextIndex = Math.floor(Math.random() * queue.length);
                        } while (nextIndex === currentIndex && currentIndex !== -1);
                    }
                } else {
                    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
                        nextIndex = currentIndex + 1;
                    } else if (repeatMode === 'queue' || !auto) {
                        nextIndex = 0;
                    }
                }

                if (nextIndex !== -1) {
                    const nextTrack = queue[nextIndex];
                    set({ currentTrack: nextTrack, isPlaying: true });
                    get().addToRecentPlays(nextTrack);
                    await musicPlayer.play(nextTrack);
                } else {
                    set({ isPlaying: false });
                }
            },
            playPrevious: async () => {
                const { queue, currentTrack, shuffle } = get();
                const { musicPlayer } = require('../services/MusicPlayer');

                if (queue.length === 0 || !currentTrack) return;

                const currentIndex = queue.findIndex(t => String(t.id) === String(currentTrack.id));
                let prevIndex = -1;

                if (shuffle) {
                    prevIndex = Math.floor(Math.random() * queue.length);
                } else {
                    prevIndex = (currentIndex - 1 + queue.length) % queue.length;
                }

                const prevTrack = queue[prevIndex];
                if (prevTrack) {
                    set({ currentTrack: prevTrack, isPlaying: true });
                    get().addToRecentPlays(prevTrack);
                    await musicPlayer.play(prevTrack);
                }
            },
            toggleDownload: async (track) => {
                const { downloads } = get();
                const isDownloaded = downloads.includes(track.id);

                if (isDownloaded) {
                    await DownloadManager.deleteSong(track.id);
                    await DownloadManager.deleteArtwork(track.id);
                    set((state) => ({
                        downloads: state.downloads.filter(id => id !== track.id),
                        downloadedSongs: (state.downloadedSongs || []).filter(s => s.id !== track.id)
                    }));
                } else {
                    try {
                        if (!track.url) return;
                        await DownloadManager.downloadSong(track.url, track.id);

                        let localArtwork = track.artwork;
                        if (track.artwork) {
                            const downloadedArt = await DownloadManager.downloadArtwork(track.artwork, track.id);
                            if (downloadedArt) localArtwork = downloadedArt;
                        }

                        const trackWithLocalData = { ...track, artwork: localArtwork };

                        set((state) => ({
                            downloads: [...state.downloads, track.id],
                            downloadedSongs: [...(state.downloadedSongs || []), trackWithLocalData]
                        }));
                    } catch (error) {
                        console.error('Download failed', error);
                        // Optionally remove from downloads if partial failure?
                    }
                }
            },
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
                downloadedSongs: state.downloadedSongs,
                recentPlays: state.recentPlays,
                favorites: state.favorites,
                theme: state.theme,
            }),
        }
    )
);
