import { Audio, AVPlaybackStatus } from 'expo-av';
import Constants from 'expo-constants';
import { TrackPlayer } from './SafeTrackPlayer';
import { TrackData } from '../types';

const isNativeAvailable = Constants.appOwnership !== 'expo' && !!Constants.appOwnership;

type ProgressCallback = (progress: { position: number; duration: number }) => void;

class MusicPlayerService {
    private expoPlayer: Audio.Sound | null = null;
    private currentTrack: TrackData | null = null;
    private progressListeners: ProgressCallback[] = [];
    private currentProgress = { position: 0, duration: 0 };

    async setup() {
        if (isNativeAvailable) {
            return true;
        } else {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                });
                return true;
            } catch (e) {
                console.error('Expo AV setup failed', e);
                return false;
            }
        }
    }

    addProgressListener(callback: ProgressCallback) {
        this.progressListeners.push(callback);
        callback(this.currentProgress);
        return () => {
            this.progressListeners = this.progressListeners.filter(l => l !== callback);
        };
    }

    private updateProgress(status: AVPlaybackStatus) {
        if (status.isLoaded) {
            this.currentProgress = {
                position: status.positionMillis / 1000,
                duration: status.durationMillis ? status.durationMillis / 1000 : 0
            };
            this.progressListeners.forEach(l => l(this.currentProgress));
        }
    }

    async play(track: TrackData) {
        console.log('🎵 [MusicPlayer] play() called for:', track.title, 'ID:', track.id);
        this.currentTrack = track;
        if (isNativeAvailable) {
            console.log('📱 [MusicPlayer] Using native TrackPlayer');
            await TrackPlayer.reset();
            await TrackPlayer.add([track]);
            await TrackPlayer.play();
        } else {
            console.log('🌐 [MusicPlayer] Using Expo AV');
            try {
                // Stop and unload any previous track immediately
                if (this.expoPlayer) {
                    console.log('⏹️ [MusicPlayer] Unloading previous track');
                    const playerToUnload = this.expoPlayer;
                    this.expoPlayer = null;
                    await playerToUnload.unloadAsync();
                }

                console.log('🔄 [MusicPlayer] Creating new sound for:', track.url);
                // Create the new sound object
                const { sound } = await Audio.Sound.createAsync(
                    { uri: track.url },
                    { shouldPlay: true },
                    (status) => this.updateProgress(status)
                );

                // Check if this is still the current track (prevents race condition)
                if (this.currentTrack?.id === track.id) {
                    console.log('✅ [MusicPlayer] Track confirmed, setting as active player');
                    this.expoPlayer = sound;
                } else {
                    console.warn('⚠️ [MusicPlayer] Track changed during load, discarding:', track.title);
                    await sound.unloadAsync();
                }
            } catch (e) {
                console.error('❌ [MusicPlayer] Expo AV play failed:', e);
            }
        }
        console.log('✅ [MusicPlayer] play() completed for:', track.title);
    }

    async toggle(isPlaying: boolean) {
        console.log('⏯️ [MusicPlayer] toggle() called, current state:', isPlaying ? 'playing' : 'paused');
        if (isNativeAvailable) {
            if (isPlaying) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        } else {
            if (this.expoPlayer) {
                const status = await this.expoPlayer.getStatusAsync();
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        console.log('⏸️ [MusicPlayer] Pausing playback');
                        await this.expoPlayer.pauseAsync();
                    } else {
                        console.log('▶️ [MusicPlayer] Resuming playback');
                        await this.expoPlayer.playAsync();
                    }
                }
            } else {
                console.warn('⚠️ [MusicPlayer] No player instance available for toggle');
            }
        }
    }

    async stop() {
        console.log('⏹️ [MusicPlayer] stop() called');
        if (isNativeAvailable) {
            await TrackPlayer.stop();
        } else if (this.expoPlayer) {
            await this.expoPlayer.stopAsync();
        }
    }

    async seek(seconds: number) {
        console.log('⏩ [MusicPlayer] seek() called to:', seconds, 'seconds');
        if (isNativeAvailable) {
            await TrackPlayer.seekTo(seconds);
        } else if (this.expoPlayer) {
            await this.expoPlayer.setPositionAsync(seconds * 1000);
        }
    }

    getProgress() {
        return this.currentProgress;
    }
}

export const musicPlayer = new MusicPlayerService();
