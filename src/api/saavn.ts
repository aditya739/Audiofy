import axios from 'axios';
import { SearchResponse, Song } from '../types';

const BASE_URL = 'https://saavn.sumit.co/api';

const api = axios.create({
    baseURL: BASE_URL,
});

export const searchSongs = async (query: string, page: number = 1): Promise<Song[]> => {
    try {
        const response = await api.get<SearchResponse>('/search/songs', {
            params: {
                query,
                page,
                limit: 20,
            },
        });
        return response.data.data.results;
    } catch (error) {
        console.error('Error searching songs:', error);
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
    try {
        const response = await api.get<{ success: boolean; data: Song[] }>(`/songs/${id}/suggestions`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
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
    try {
        const response = await api.get(`/artists/${id}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching artist details:', error);
        return null;
    }
};

export const getArtistSongs = async (id: string): Promise<Song[]> => {
    try {
        const response = await api.get(`/artists/${id}/songs`);
        return response.data.data.results;
    } catch (error) {
        console.error('Error fetching artist songs:', error);
        return [];
    }
};
