import Constants from 'expo-constants';
import { useEffect, useState } from 'react';

// Enhanced environment detection
const isNativeAvailable = Constants.appOwnership !== 'expo' && !!Constants.appOwnership;

// Comprehensive mocks for all versions/casings
export const State = {
    None: 'none', Ready: 'ready', Playing: 'playing', Paused: 'paused', Stopped: 'stopped', Buffering: 'buffering', Loading: 'loading',
    STATE_NONE: 'none', STATE_READY: 'ready', STATE_PLAYING: 'playing', STATE_PAUSED: 'paused', STATE_STOPPED: 'stopped', STATE_BUFFERING: 'buffering'
};

export const Event = {
    PlaybackTrackChanged: 'playback-track-changed', PlaybackState: 'playback-state',
    RemotePlay: 'remote-play', RemotePause: 'remote-pause', RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous', RemoteStop: 'remote-stop', RemoteSeek: 'remote-seek',
};

export const Capability = {
    Play: 1, Pause: 2, Stop: 3, SkipToNext: 4, SkipToPrevious: 5, SeekTo: 6,
    CAPABILITY_PLAY: 1, CAPABILITY_PAUSE: 2, CAPABILITY_STOP: 3, CAPABILITY_SKIP_TO_NEXT: 4, CAPABILITY_SKIP_TO_PREVIOUS: 5, CAPABILITY_SEEK_TO: 6
};

export const RepeatMode = { Off: 0, Track: 1, Queue: 2 };

export const TrackPlayer: any = {
    setupPlayer: async () => { if (isNativeAvailable) await require('react-native-track-player').setupPlayer(); },
    updateOptions: async (options: any) => { if (isNativeAvailable) await require('react-native-track-player').updateOptions(options); },
    add: async (tracks: any) => { if (isNativeAvailable) await require('react-native-track-player').add(tracks); },
    reset: async () => { if (isNativeAvailable) await require('react-native-track-player').reset(); },
    play: async () => { if (isNativeAvailable) await require('react-native-track-player').play(); },
    pause: async () => { if (isNativeAvailable) await require('react-native-track-player').pause(); },
    stop: async () => { if (isNativeAvailable) await require('react-native-track-player').stop(); },
    skipToNext: async () => { if (isNativeAvailable) await require('react-native-track-player').skipToNext(); },
    skipToPrevious: async () => { if (isNativeAvailable) await require('react-native-track-player').skipToPrevious(); },
    seekTo: async (pos: number) => { if (isNativeAvailable) await require('react-native-track-player').seekTo(pos); },
    getTrack: async (id: any) => isNativeAvailable ? await require('react-native-track-player').getTrack(id) : null,
    getState: async () => isNativeAvailable ? await require('react-native-track-player').getState() : 'idle',
    setRepeatMode: async (mode: any) => { if (isNativeAvailable) await require('react-native-track-player').setRepeatMode(mode); },
    registerPlaybackService: (service: any) => { if (isNativeAvailable) require('react-native-track-player').registerPlaybackService(service); },
    addEventListener: (event: any, handler: any) => isNativeAvailable ? require('react-native-track-player').addEventListener(event, handler) : ({ remove: () => { } }),
};

// Hooks
export const useSafePlaybackState = () => {
    if (!isNativeAvailable) return { state: 'idle' };
    try {
        const { usePlaybackState } = require('react-native-track-player');
        return usePlaybackState() || { state: 'idle' };
    } catch (e) {
        return { state: 'idle' };
    }
};

export const useSafeProgress = () => {
    const [mockProgress, setMockProgress] = useState({ position: 0, duration: 0, buffered: 0 });

    // Always call useEffect (Rule of Hooks)
    useEffect(() => {
        if (!isNativeAvailable) {
            try {
                const { musicPlayer } = require('./MusicPlayer');
                return musicPlayer.addProgressListener((p: any) => {
                    setMockProgress({ ...p, buffered: 0 });
                });
            } catch (e) {

            }
        }
    }, []);

    // If native is available, we use the real hook. 
    // We must be careful here. If we are in Expo Go, react-native-track-player might not even be linkable.
    if (isNativeAvailable) {
        try {
            const { useProgress } = require('react-native-track-player');
            return useProgress();
        } catch (e) {
            return { position: 0, duration: 0, buffered: 0 };
        }
    }

    return mockProgress;
};

export const useSafeTrackPlayerEvents = (events: any[], handler: (event: any) => void) => {
    if (!isNativeAvailable) {
        useEffect(() => { }, []);
        return;
    }
    try {
        const { useTrackPlayerEvents } = require('react-native-track-player');
        return useTrackPlayerEvents(events, handler);
    } catch (e) {
        return;
    }
};

export default TrackPlayer;
