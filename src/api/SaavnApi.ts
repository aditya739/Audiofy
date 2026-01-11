import { BaseApiClient } from './BaseApiClient';
import { SearchResponse, Song } from '../types';
import { PAGINATION } from '../config/constants';
import Logger from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';

const logger = Logger.getInstance('SaavnApi');

/**
 * Saavn API Service
 * Extends BaseApiClient to provide music-specific API methods
 * 
 * This follows the Open/Closed Principle - extends base functionality without modifying it
 */
class SaavnApiService extends BaseApiClient {
    private static instance: SaavnApiService;

    private constructor() {
        super();
        logger.info('SaavnApiService initialized');
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): SaavnApiService {
        if (!SaavnApiService.instance) {
            SaavnApiService.instance = new SaavnApiService();
        }
        return SaavnApiService.instance;
    }

    /**
     * Search for songs
     * @param query - Search query string
     * @param page - Page number for pagination
     * @returns Array of songs
     */
    public async searchSongs(
        query: string,
        page: number = PAGINATION.DEFAULT_PAGE
    ): Promise<Song[]> {
        logger.group('searchSongs');
        logger.info('Searching songs', { query, page });

        try {
            const response = await this.get<SearchResponse>('/search/songs', {
                query,
                page,
                limit: PAGINATION.DEFAULT_LIMIT,
            });

            const results = response.data.results;
            logger.info(`Found ${results.length} songs`);
            logger.groupEnd();

            return results;
        } catch (error) {
            logger.error('Failed to search songs', error);
            logger.groupEnd();
            return [];
        }
    }

    /**
     * Get song details by ID
     * @param id - Song ID
     * @returns Song object or null
     */
    public async getSongDetails(id: string): Promise<Song | null> {
        logger.info('Fetching song details', { id });

        try {
            const response = await this.get<{ success: boolean; data: Song[] }>(
                `/songs/${id}`
            );

            const song = response.data[0] || null;

            if (song) {
                logger.info('Song details retrieved', { title: song.name });
            } else {
                logger.warn('Song not found', { id });
            }

            return song;
        } catch (error) {
            logger.error('Failed to fetch song details', error);
            return null;
        }
    }

    /**
     * Get song suggestions based on a song ID
     * @param id - Song ID
     * @returns Array of suggested songs
     */
    public async getSuggestions(id: string): Promise<Song[]> {
        logger.group('getSuggestions');
        logger.info('Fetching suggestions', { id });

        try {
            const response = await this.get<{ success: boolean; data: any }>(
                `/songs/${id}/suggestions`,
                {},
                { retryCount: 3 } as any // Disable retries for suggestions as it's often flaky
            );

            let results: Song[] = [];

            if (response.data) {
                if (Array.isArray(response.data)) {
                    results = response.data;
                } else if (response.data.results) {
                    results = response.data.results;
                }
            }

            logger.info(`Found ${results.length} suggestions`);
            logger.groupEnd();

            return results.slice(0, PAGINATION.SUGGESTIONS_LIMIT);
        } catch (error) {
            logger.warn('Suggestions failed, falling back to trending');

            try {
                const fallback = await this.getTrending();
                logger.info(`Fallback returned ${fallback.length} songs`);
                logger.groupEnd();
                return fallback.slice(0, PAGINATION.SUGGESTIONS_LIMIT);
            } catch (fallbackError) {
                logger.error('Fallback also failed', fallbackError);
                logger.groupEnd();
                return [];
            }
        }
    }

    /**
     * Get trending songs
     * @returns Array of trending songs
     */
    /**
     * Get trending songs
     * @param page - Page number (default 1)
     * @param limit - limit per page
     * @returns Array of trending songs
     */
    public async getTrending(page: number = 1, limit: number = PAGINATION.TRENDING_LIMIT): Promise<Song[]> {
        logger.info('Fetching trending songs', { page });

        try {
            const response = await this.get<SearchResponse>('/search/songs', {
                query: 'Trending',
                page,
                limit,
            });

            const results = response.data.results;
            logger.info(`Found ${results.length} trending songs`);

            return results;
        } catch (error) {
            logger.error('Failed to fetch trending songs', error);
            return [];
        }
    }

    /**
     * Get new releases
     * @param page - Page number (default 1)
     * @param limit - limit per page
     * @returns Array of new release songs
     */
    public async getNewReleases(page: number = 1, limit: number = PAGINATION.TRENDING_LIMIT): Promise<Song[]> {
        logger.info('Fetching new releases', { page });

        try {
            const response = await this.get<SearchResponse>('/search/songs', {
                query: 'Top Hits',
                page,
                limit,
            });

            const results = response.data.results;
            logger.info(`Found ${results.length} new releases`);

            return results;
        } catch (error) {
            logger.error('Failed to fetch new releases', error);
            return [];
        }
    }

    /**
     * Get artist details
     * @param id - Artist ID
     * @returns Artist details or null
     */
    public async getArtistDetails(id: string): Promise<any> {
        logger.info('Fetching artist details', { id });

        try {
            const response = await this.get<{ success: boolean; data: any }>(
                `/artists/${id}`
            );

            logger.info('Artist details retrieved', { id });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                logger.warn('Artist not found', { id });
            } else {
                logger.error('Failed to fetch artist details', error);
            }
            return null;
        }
    }

    /**
     * Get artist songs
     * @param id - Artist ID
     * @returns Array of artist songs
     */
    public async getArtistSongs(id: string): Promise<Song[]> {
        logger.info('Fetching artist songs', { id });

        try {
            const response = await this.get<{ success: boolean; data: any }>(
                `/artists/${id}/songs`
            );

            const data = response.data;
            let results: Song[] = [];

            if (data) {
                if (Array.isArray(data)) {
                    results = data;
                } else if (data.results) {
                    results = data.results;
                } else if (data.songs) {
                    results = data.songs;
                }
            }
            logger.info(`Found ${results.length} artist songs`);

            return results;
        } catch (error: any) {
            if (error.response?.status === 404) {
                logger.warn('Artist not found', { id });
            } else {
                logger.error('Failed to fetch artist songs', error);
            }
            return [];
        }
    }

    /**
     * Search for artists
     * @param query - Search query string
     * @returns Array of artists
     */
    public async searchArtists(query: string): Promise<any[]> {
        logger.info('Searching artists', { query });

        try {
            const response = await this.get<{ success: boolean; data: any }>(
                '/search/artists',
                {
                    query,
                    limit: 10,
                }
            );

            const results = response.data.results || [];
            logger.info(`Found ${results.length} artists`);

            return results;
        } catch (error) {
            logger.error('Failed to search artists', error);
            return [];
        }
    }
}

// Export singleton instance
export const saavnApi = SaavnApiService.getInstance();

// Also export the class for testing purposes
export default SaavnApiService;
