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
        this.currentTrack = track;
        if (isNativeAvailable) {
            await TrackPlayer.reset();
            await TrackPlayer.add([track]);
            await TrackPlayer.play();
        } else {
            try {
                if (this.expoPlayer) {
                    await this.expoPlayer.unloadAsync();
                }
                const { sound } = await Audio.Sound.createAsync(
                    { uri: track.url },
                    { shouldPlay: true },
                    (status) => this.updateProgress(status)
                );
                this.expoPlayer = sound;
            } catch (e) {
                console.error('Expo AV play failed', e);
            }
        }
    }

    async toggle(isPlaying: boolean) {
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
                        await this.expoPlayer.pauseAsync();
                    } else {
                        await this.expoPlayer.playAsync();
                    }
                }
            }
        }
    }

    async stop() {
        if (isNativeAvailable) {
            await TrackPlayer.stop();
        } else if (this.expoPlayer) {
            await this.expoPlayer.stopAsync();
        }
    }

    async seek(seconds: number) {
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
