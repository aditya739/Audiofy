import { Song, TrackData } from '../types';
import Logger from './Logger';

const logger = Logger.getInstance('SongConverter');

/**
 * Song Converter Utility
 * Provides helper functions to convert between different song formats
 * 
 * This follows the Single Responsibility Principle - only handles data conversion
 */
class SongConverter {
    /**
     * Convert Song to TrackData format
     * @param song - Song object from API
     * @returns TrackData object for player
     */
    public static toTrackData(song: Song): TrackData {
        logger.debug('Converting song to track data', { songId: song.id, title: song.name });

        try {
            // Get highest quality image
            const highRes = song.image[song.image.length - 1];

            // Get highest quality download URL
            const downloadUrl = song.downloadUrl[song.downloadUrl.length - 1];
            const url = downloadUrl.link || downloadUrl.url || '';

            if (!url) {
                logger.warn('No download URL found for song', { songId: song.id });
            }

            // Extract primary artist
            let primaryArtist = 'Unknown Artist';
            if (song.primaryArtists) {
                primaryArtist = song.primaryArtists.toString().split(',')[0].trim();
            } else if ((song as any).subtitle) {
                primaryArtist = (song as any).subtitle;
            } else if (song.artists?.primary?.[0]?.name) {
                primaryArtist = song.artists.primary[0].name;
            } else if ((song as any).more_info?.artistMap?.primary_artists?.[0]?.name) {
                primaryArtist = (song as any).more_info.artistMap.primary_artists[0].name;
            }

            // Extract primary artist ID
            let primaryArtistId = '';
            if (song.primaryArtistsId) {
                primaryArtistId = song.primaryArtistsId.toString().split(',')[0].trim();
            } else if (song.artists?.primary?.[0]?.id) {
                primaryArtistId = song.artists.primary[0].id;
            }

            // Get artwork URL
            const artwork = highRes?.link || highRes?.url || '';

            const trackData: TrackData = {
                id: song.id,
                url,
                title: song.name,
                artist: primaryArtist,
                artistId: primaryArtistId,
                artwork,
                album: song.album.name,
                duration: Number(song.duration),
            };

            logger.debug('Song converted successfully', {
                id: trackData.id,
                title: trackData.title,
            });

            return trackData;
        } catch (error) {
            logger.error('Failed to convert song', error);

            // Return a fallback track data
            return {
                id: song.id,
                url: '',
                title: song.name || 'Unknown',
                artist: 'Unknown Artist',
                artistId: '',
                artwork: '',
                album: song.album?.name || 'Unknown Album',
                duration: 0,
            };
        }
    }

    /**
     * Convert multiple songs to track data
     * @param songs - Array of Song objects
     * @returns Array of TrackData objects
     */
    public static toTrackDataArray(songs: Song[]): TrackData[] {
        logger.debug('Converting song array', { count: songs.length });
        return songs.map((song) => this.toTrackData(song));
    }

    /**
     * Check if object is already TrackData
     * @param obj - Object to check
     * @returns True if object is TrackData
     */
    public static isTrackData(obj: any): obj is TrackData {
        return (
            obj &&
            typeof obj.id === 'string' &&
            typeof obj.url === 'string' &&
            typeof obj.title === 'string' &&
            typeof obj.artist === 'string' &&
            typeof obj.artwork === 'string' &&
            typeof obj.album === 'string' &&
            typeof obj.duration === 'number'
        );
    }

    /**
     * Convert Song or TrackData to TrackData
     * Handles both types automatically
     * @param songOrTrack - Song or TrackData object
     * @returns TrackData object
     */
    public static normalize(songOrTrack: Song | TrackData): TrackData {
        if (this.isTrackData(songOrTrack)) {
            logger.debug('Object is already TrackData', { id: songOrTrack.id });
            return songOrTrack;
        }

        logger.debug('Converting Song to TrackData', { id: songOrTrack.id });
        return this.toTrackData(songOrTrack as Song);
    }

    /**
     * Get formatted duration string
     * @param seconds - Duration in seconds
     * @returns Formatted duration (e.g., "3:45")
     */
    public static formatDuration(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Get artist names from Song
     * @param song - Song object
     * @returns Object with primary, featured, and all artists
     */
    public static getArtists(song: Song): {
        primary: string[];
        featured: string[];
        all: string[];
    } {
        const primary = song.primaryArtists
            ? song.primaryArtists.toString().split(',').map((a) => a.trim())
            : [];

        const featured = song.featuredArtists
            ? song.featuredArtists.toString().split(',').map((a) => a.trim())
            : [];

        const all = [...new Set([...primary, ...featured])];

        return { primary, featured, all };
    }
}

export default SongConverter;
