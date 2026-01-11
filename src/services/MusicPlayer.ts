import { Audio, AVPlaybackStatus } from 'expo-av';
import Constants from 'expo-constants';
import { TrackPlayer } from './SafeTrackPlayer';
import { TrackData } from '../types';
import { BaseMusicPlayer, ProgressUpdate } from './BaseMusicPlayer';
import { AUDIO_CONFIG } from '../config/constants';
import Logger from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';
import DownloadManager from '../utils/DownloadManager';

const logger = Logger.getInstance('MusicPlayer');

/**
 * Check if native player is available
 */
const isNativeAvailable = Constants.appOwnership !== 'expo' && !!Constants.appOwnership;

/**
 * Music Player Service Implementation
 * Extends BaseMusicPlayer to provide actual playback functionality
 * Supports both native (TrackPlayer) and web (Expo AV) playback
 * 
 * This follows the Liskov Substitution Principle - can be used anywhere BaseMusicPlayer is expected
 */
class MusicPlayerService extends BaseMusicPlayer {
    private static instance: MusicPlayerService;
    private expoPlayer: Audio.Sound | null = null;

    private constructor() {
        super();
        logger.info('MusicPlayerService created', {
            mode: isNativeAvailable ? 'Native' : 'Expo AV',
        });
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): MusicPlayerService {
        if (!MusicPlayerService.instance) {
            MusicPlayerService.instance = new MusicPlayerService();
        }
        return MusicPlayerService.instance;
    }

    /**
     * Setup the player
     */
    protected async doSetup(): Promise<boolean> {
        logger.group('Player Setup');

        try {
            if (isNativeAvailable) {
                logger.info('Using native TrackPlayer');
                logger.groupEnd();
                return true;
            } else {
                logger.info('Using Expo AV');

                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: AUDIO_CONFIG.SHOULD_PLAY_IN_SILENT_MODE_IOS,
                    staysActiveInBackground: AUDIO_CONFIG.STAYS_ACTIVE_IN_BACKGROUND,
                    shouldDuckAndroid: AUDIO_CONFIG.SHOULD_DUCK_ANDROID,
                });

                logger.info('Audio mode configured successfully');
                logger.groupEnd();
                return true;
            }
        } catch (error) {
            logger.error('Setup failed', error);
            logger.groupEnd();
            ErrorHandler.handle(
                ErrorHandler.createInitializationError('Failed to setup player'),
                'MusicPlayer.setup'
            );
            return false;
        }
    }

    /**
     * Play a track
     */
    protected async doPlay(track: TrackData): Promise<void> {
        logger.group('Play Track');
        logger.info('Playing track', {
            title: track.title,
            id: track.id,
            artist: track.artist,
        });

        try {
            // Check for local download
            let trackToPlay = { ...track };
            const isDownloaded = await DownloadManager.exists(track.id);

            if (isDownloaded) {
                const localUri = DownloadManager.getLocalUri(track.id);
                logger.info('Playing local file', { localUri });
                trackToPlay.url = localUri;
            } else {
                logger.debug('Playing remote URL');
            }

            if (isNativeAvailable) {
                await this.playNative(trackToPlay);
            } else {
                await this.playExpoAV(trackToPlay);
            }

            logger.info('Track started successfully');
            logger.groupEnd();
        } catch (error) {
            logger.error('Failed to play track', error);
            logger.groupEnd();

            ErrorHandler.handle(
                ErrorHandler.createPlaybackError(`Failed to play: ${track.title}`),
                'MusicPlayer.play'
            );

            throw error;
        }
    }

    /**
     * Play using native TrackPlayer
     */
    private async playNative(track: TrackData): Promise<void> {
        logger.info('Using native TrackPlayer');

        await TrackPlayer.reset();
        await TrackPlayer.add([track]);
        await TrackPlayer.play();
    }

    /**
     * Play using Expo AV
     */
    private async playExpoAV(track: TrackData): Promise<void> {
        logger.info('Using Expo AV');

        // Stop and unload any previous track
        if (this.expoPlayer) {
            logger.debug('Unloading previous track');
            const playerToUnload = this.expoPlayer;
            this.expoPlayer = null;
            await playerToUnload.unloadAsync();
        }

        logger.debug('Creating new sound', { url: track.url });

        // Create new sound object
        const { sound } = await Audio.Sound.createAsync(
            { uri: track.url },
            { shouldPlay: true },
            (status) => this.handlePlaybackStatus(status)
        );

        // Check if this is still the current track (prevents race condition)
        if (this.currentTrack?.id === track.id) {
            logger.debug('Track confirmed, setting as active player');
            this.expoPlayer = sound;
        } else {
            logger.warn('Track changed during load, discarding', {
                expected: track.title,
                current: this.currentTrack?.title,
            });
            await sound.unloadAsync();
        }
    }

    /**
     * Handle playback status updates from Expo AV
     */
    private handlePlaybackStatus(status: AVPlaybackStatus): void {
        if (status.isLoaded) {
            const progress: ProgressUpdate = {
                position: status.positionMillis / 1000,
                duration: status.durationMillis ? status.durationMillis / 1000 : 0,
            };

            this.updateProgress(progress);

            // Check if track finished
            if (status.didJustFinish) {
                logger.info('Track finished playing');
                try {
                    const { usePlayerStore } = require('../store/usePlayerStore');
                    usePlayerStore.getState().playNext(true);
                } catch (error) {
                    logger.error('Failed to auto-play next track', error);
                }
            }
        }
    }

    /**
     * Toggle play/pause
     */
    protected async doToggle(isPlaying: boolean): Promise<void> {
        logger.info('Toggle playback', {
            currentState: isPlaying ? 'playing' : 'paused',
            newState: isPlaying ? 'paused' : 'playing',
        });

        try {
            if (isNativeAvailable) {
                await this.toggleNative(isPlaying);
            } else {
                await this.toggleExpoAV(isPlaying);
            }
        } catch (error) {
            logger.error('Failed to toggle playback', error);
            ErrorHandler.handle(error, 'MusicPlayer.toggle');
            throw error;
        }
    }

    /**
     * Toggle using native TrackPlayer
     */
    private async toggleNative(isPlaying: boolean): Promise<void> {
        if (isPlaying) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    }

    /**
     * Toggle using Expo AV
     */
    private async toggleExpoAV(isPlaying: boolean): Promise<void> {
        if (!this.expoPlayer) {
            logger.warn('No player instance available for toggle');
            return;
        }

        const status = await this.expoPlayer.getStatusAsync();

        if (status.isLoaded) {
            if (status.isPlaying) {
                logger.debug('Pausing playback');
                await this.expoPlayer.pauseAsync();
            } else {
                logger.debug('Resuming playback');
                await this.expoPlayer.playAsync();
            }
        }
    }

    /**
     * Stop playback
     */
    protected async doStop(): Promise<void> {
        logger.info('Stopping playback');

        try {
            if (isNativeAvailable) {
                await TrackPlayer.stop();
            } else if (this.expoPlayer) {
                await this.expoPlayer.stopAsync();
                await this.expoPlayer.unloadAsync();
                this.expoPlayer = null;
            }

            this.updateProgress({ position: 0, duration: 0 });
        } catch (error) {
            logger.error('Failed to stop playback', error);
            ErrorHandler.handle(error, 'MusicPlayer.stop');
            throw error;
        }
    }

    /**
     * Seek to position
     */
    protected async doSeek(seconds: number): Promise<void> {
        logger.info('Seeking to position', { seconds });

        try {
            if (isNativeAvailable) {
                await TrackPlayer.seekTo(seconds);
            } else if (this.expoPlayer) {
                await this.expoPlayer.setPositionAsync(seconds * 1000);
            }
        } catch (error) {
            logger.error('Failed to seek', error);
            ErrorHandler.handle(error, 'MusicPlayer.seek');
            throw error;
        }
    }

    /**
     * Cleanup method
     */
    public async cleanup(): Promise<void> {
        logger.info('Cleaning up player');

        try {
            await this.stop();

            if (this.expoPlayer) {
                await this.expoPlayer.unloadAsync();
                this.expoPlayer = null;
            }

            this.progressListeners = [];
            this.stateListeners = [];
        } catch (error) {
            logger.error('Cleanup failed', error);
        }
    }
}

// Export singleton instance
export const musicPlayer = MusicPlayerService.getInstance();

// Also export the class
export default MusicPlayerService;
