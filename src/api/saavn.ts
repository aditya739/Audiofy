/**
 * Legacy API Module
 * 
 * This file maintains backward compatibility with existing code
 * while delegating to the new OOP-based SaavnApi service.
 * 
 * @deprecated Use SaavnApi service directly for new code
 */

import { saavnApi } from './SaavnApi';
import { Song } from '../types';

/**
 * Search for songs
 * @deprecated Use saavnApi.searchSongs() instead
 */
export const searchSongs = async (query: string, page: number = 1): Promise<Song[]> => {
    return saavnApi.searchSongs(query, page);
};

/**
 * Get song details by ID
 * @deprecated Use saavnApi.getSongDetails() instead
 */
export const getSongDetails = async (id: string): Promise<Song | null> => {
    return saavnApi.getSongDetails(id);
};

/**
 * Get song suggestions
 * @deprecated Use saavnApi.getSuggestions() instead
 */
export const getSuggestions = async (id: string): Promise<Song[]> => {
    return saavnApi.getSuggestions(id);
};

/**
 * Get trending songs
 * @deprecated Use saavnApi.getTrending() instead
 */
export const getTrending = async (): Promise<Song[]> => {
    return saavnApi.getTrending();
};

/**
 * Get new releases
 * @deprecated Use saavnApi.getNewReleases() instead
 */
export const getNewReleases = async (): Promise<Song[]> => {
    return saavnApi.getNewReleases();
};

/**
 * Get artist details
 * @deprecated Use saavnApi.getArtistDetails() instead
 */
export const getArtistDetails = async (id: string): Promise<any> => {
    return saavnApi.getArtistDetails(id);
};

/**
 * Get artist songs
 * @deprecated Use saavnApi.getArtistSongs() instead
 */
export const getArtistSongs = async (id: string): Promise<Song[]> => {
    return saavnApi.getArtistSongs(id);
};

/**
 * Search for artists
 * @deprecated Use saavnApi.searchArtists() instead
 */
export const searchArtists = async (query: string): Promise<any[]> => {
    return saavnApi.searchArtists(query);
};

