import axios from 'axios';
import { SearchResponse, Song } from '../types';

const BASE_URL = 'https://saavn.sumit.co/api';

const api = axios.create({
    baseURL: BASE_URL,
});

export const searchSongs = async (query: string, page: number = 1): Promise<Song[]> => {
    console.log('🔍 [API] searchSongs() called with query:', query, 'page:', page);
    try {
        const response = await api.get<SearchResponse>('/search/songs', {
            params: {
                query,
                page,
                limit: 20,
            },
        });
        console.log('✅ [API] searchSongs() returned', response.data.data.results.length, 'results');
        return response.data.data.results;
    } catch (error) {
        console.error('❌ [API] searchSongs() error:', error);
        return [];
    }
};

export const getSongDetails = async (id: string): Promise<Song | null> => {
    try {
        const response = await api.get<{ success: boolean; data: Song[] }>(`/songs/${id}`);
        return response.data.data[0] || null;
    } catch (error) {
        console.error('Error fetching song details:', error);
        return null;
    }
};

export const getSuggestions = async (id: string): Promise<Song[]> => {
    console.log('🎵 [API] getSuggestions() called for song ID:', id);
    try {
        const response = await api.get<{ success: boolean; data: any }>(`/songs/${id}/suggestions`);
        if (response.data.data) {
            if (Array.isArray(response.data.data)) {
                console.log('✅ [API] getSuggestions() returned', response.data.data.length, 'suggestions');
                return response.data.data;
            }
            if (response.data.data.results) {
                console.log('✅ [API] getSuggestions() returned', response.data.data.results.length, 'suggestions');
                return response.data.data.results;
            }
        }
        console.warn('⚠️ [API] getSuggestions() returned empty data');
        return [];
    } catch (error) {
        console.warn('⚠️ [API] getSuggestions() failed, falling back to trending');
        try {
            const fallback = await getTrending();
            console.log('✅ [API] getSuggestions() fallback returned', fallback.slice(0, 5).length, 'songs');
            return fallback.slice(0, 5);
        } catch (e) {
            console.error('❌ [API] getSuggestions() fallback also failed:', e);
            return [];
        }
    }
};
export const getTrending = async (): Promise<Song[]> => {
    try {
        // Fetch trending by searching popular current hits
        const response = await api.get<SearchResponse>('/search/songs', {
            params: { query: 'Trending', page: 1, limit: 10 }
        });
        return response.data.data.results;
    } catch (error) {
        return [];
    }
};

export const getNewReleases = async (): Promise<Song[]> => {
    try {
        const response = await api.get<SearchResponse>('/search/songs', {
            params: { query: 'Top Hits', page: 1, limit: 10 }
        });
        return response.data.data.results;
    } catch (error) {
        return [];
    }
};

export const getArtistDetails = async (id: string): Promise<any> => {
    console.log('🎤 [API] getArtistDetails() called for artist ID:', id);
    try {
        const response = await api.get(`/artists/${id}`);
        console.log('✅ [API] getArtistDetails() success for:', id);
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.warn('⚠️ [API] getArtistDetails() 404 - Artist not found:', id);
        } else {
            console.error('❌ [API] getArtistDetails() error:', error.message);
        }
        return null;
    }
};

export const getArtistSongs = async (id: string): Promise<Song[]> => {
    console.log('🎵 [API] getArtistSongs() called for artist ID:', id);
    try {
        const response = await api.get(`/artists/${id}/songs`);
        console.log('✅ [API] getArtistSongs() returned', response.data.data.results?.length || 0, 'songs');
        return response.data.data.results || [];
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.warn('⚠️ [API] getArtistSongs() 404 - Artist not found:', id);
        } else {
            console.error('❌ [API] getArtistSongs() error:', error.message);
        }
        return [];
    }
};

export const searchArtists = async (query: string): Promise<any[]> => {
    console.log('🎤 [API] searchArtists() called with query:', query);
    try {
        const response = await api.get('/search/artists', {
            params: {
                query,
                limit: 10,
            },
        });
        console.log('✅ [API] searchArtists() returned', response.data.data.results?.length || 0, 'artists');
        return response.data.data.results || [];
    } catch (error: any) {
        console.error('❌ [API] searchArtists() error:', error.message);
        return [];
    }
};

