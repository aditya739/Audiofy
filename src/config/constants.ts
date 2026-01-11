/**
 * Application Constants
 * Centralized configuration values for the entire application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://saavn.sumit.co/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  TRENDING_LIMIT: 10,
  SUGGESTIONS_LIMIT: 5,
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  SHOULD_PLAY_IN_SILENT_MODE_IOS: true,
  STAYS_ACTIVE_IN_BACKGROUND: true,
  SHOULD_DUCK_ANDROID: true,
  UPDATE_INTERVAL_MS: 500, // Progress update interval
} as const;

// Theme Colors
export const COLORS = {
  PRIMARY: '#1DB954',
  BACKGROUND: '#000000',
  SURFACE: '#121212',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#999999',
  ERROR: '#FF5252',
  WARNING: '#FFC107',
  SUCCESS: '#4CAF50',
} as const;

// Log Levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Error Codes
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  PLAYBACK_ERROR = 'PLAYBACK_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Player States
export enum PlayerState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  ERROR = 'ERROR',
}

// Search Types
export enum SearchType {
  SONGS = 'SONGS',
  ARTISTS = 'ARTISTS',
  ALBUMS = 'ALBUMS',
}
