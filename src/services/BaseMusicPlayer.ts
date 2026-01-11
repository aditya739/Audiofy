import { TrackData } from '../types';
import { PlayerState } from '../config/constants';

/**
 * Progress Update Interface
 */
export interface ProgressUpdate {
    position: number;
    duration: number;
}

/**
 * Player Status Interface
 */
export interface PlayerStatus {
    state: PlayerState;
    currentTrack: TrackData | null;
    progress: ProgressUpdate;
    isPlaying: boolean;
}

/**
 * Abstract Music Player Interface
 * Defines the contract that all music players must implement
 * 
 * This follows the Interface Segregation Principle
 */
export interface IMusicPlayer {
    /**
     * Initialize the player
     */
    setup(): Promise<boolean>;

    /**
     * Play a track
     */
    play(track: TrackData): Promise<void>;

    /**
     * Toggle play/pause
     */
    toggle(isPlaying: boolean): Promise<void>;

    /**
     * Stop playback
     */
    stop(): Promise<void>;

    /**
     * Seek to a position in seconds
     */
    seek(seconds: number): Promise<void>;

    /**
     * Get current progress
     */
    getProgress(): ProgressUpdate;

    /**
     * Get current player status
     */
    getStatus(): PlayerStatus;

    /**
     * Add progress listener
     */
    addProgressListener(
        callback: (progress: ProgressUpdate) => void
    ): () => void;

    /**
     * Add state change listener
     */
    addStateListener(
        callback: (state: PlayerState) => void
    ): () => void;
}

/**
 * Abstract Base Music Player
 * Provides common functionality for all player implementations
 * 
 * This follows the Template Method Pattern
 */
export abstract class BaseMusicPlayer implements IMusicPlayer {
    protected currentTrack: TrackData | null = null;
    protected currentState: PlayerState = PlayerState.IDLE;
    protected currentProgress: ProgressUpdate = { position: 0, duration: 0 };

    protected progressListeners: Array<(progress: ProgressUpdate) => void> = [];
    protected stateListeners: Array<(state: PlayerState) => void> = [];

    /**
     * Template method for setup
     */
    public async setup(): Promise<boolean> {
        this.setState(PlayerState.IDLE);
        return this.doSetup();
    }

    /**
     * Template method for play
     */
    public async play(track: TrackData): Promise<void> {
        this.currentTrack = track;
        this.setState(PlayerState.LOADING);

        try {
            await this.doPlay(track);
            this.setState(PlayerState.PLAYING);
        } catch (error) {
            this.setState(PlayerState.ERROR);
            throw error;
        }
    }

    /**
     * Template method for toggle
     */
    public async toggle(isPlaying: boolean): Promise<void> {
        await this.doToggle(isPlaying);
        this.setState(isPlaying ? PlayerState.PAUSED : PlayerState.PLAYING);
    }

    /**
     * Template method for stop
     */
    public async stop(): Promise<void> {
        await this.doStop();
        this.setState(PlayerState.STOPPED);
        this.currentTrack = null;
    }

    /**
     * Template method for seek
     */
    public async seek(seconds: number): Promise<void> {
        await this.doSeek(seconds);
    }

    /**
     * Get current progress
     */
    public getProgress(): ProgressUpdate {
        return { ...this.currentProgress };
    }

    /**
     * Get current status
     */
    public getStatus(): PlayerStatus {
        return {
            state: this.currentState,
            currentTrack: this.currentTrack,
            progress: this.getProgress(),
            isPlaying: this.currentState === PlayerState.PLAYING,
        };
    }

    /**
     * Add progress listener
     */
    public addProgressListener(
        callback: (progress: ProgressUpdate) => void
    ): () => void {
        this.progressListeners.push(callback);
        callback(this.currentProgress);

        return () => {
            this.progressListeners = this.progressListeners.filter(
                (l) => l !== callback
            );
        };
    }

    /**
     * Add state listener
     */
    public addStateListener(
        callback: (state: PlayerState) => void
    ): () => void {
        this.stateListeners.push(callback);
        callback(this.currentState);

        return () => {
            this.stateListeners = this.stateListeners.filter(
                (l) => l !== callback
            );
        };
    }

    /**
     * Update progress and notify listeners
     */
    protected updateProgress(progress: ProgressUpdate): void {
        this.currentProgress = progress;
        this.notifyProgressListeners();
    }

    /**
     * Set state and notify listeners
     */
    protected setState(state: PlayerState): void {
        if (this.currentState !== state) {
            this.currentState = state;
            this.notifyStateListeners();
        }
    }

    /**
     * Notify all progress listeners
     */
    protected notifyProgressListeners(): void {
        this.progressListeners.forEach((listener) => {
            listener(this.currentProgress);
        });
    }

    /**
     * Notify all state listeners
     */
    protected notifyStateListeners(): void {
        this.stateListeners.forEach((listener) => {
            listener(this.currentState);
        });
    }

    /**
     * Abstract methods to be implemented by subclasses
     */
    protected abstract doSetup(): Promise<boolean>;
    protected abstract doPlay(track: TrackData): Promise<void>;
    protected abstract doToggle(isPlaying: boolean): Promise<void>;
    protected abstract doStop(): Promise<void>;
    protected abstract doSeek(seconds: number): Promise<void>;
}
