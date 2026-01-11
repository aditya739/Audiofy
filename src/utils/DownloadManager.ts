import * as FileSystem from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import Logger from './Logger';

const logger = Logger.getInstance('DownloadManager');

// Attempt to get document directory from either source, casting to any to avoid TS errors if types are mismatched
const docDir = (LegacyFileSystem as any).documentDirectory || (FileSystem as any).documentDirectory;
const SONGS_DIR = docDir ? docDir + 'songs/' : null;

if (!docDir) {
    logger.error('CRITICAL: documentDirectory is null');
}

/**
 * DownloadManager handles downloading and managing local song files.
 */
export const DownloadManager = {
    /**
     * Ensures the songs directory exists.
     */
    ensureDir: async () => {
        if (!SONGS_DIR) return;
        try {
            const dirInfo = await LegacyFileSystem.getInfoAsync(SONGS_DIR);
            if (!dirInfo.exists) {
                await LegacyFileSystem.makeDirectoryAsync(SONGS_DIR, { intermediates: true });
            }
        } catch (error) {
            logger.error('Failed to ensure directory', error);
        }
    },

    /**
     * Downloads a song from a URL and saves it locally.
     * @param url The download URL.
     * @param id The unique song ID.
     * @returns The local URI of the downloaded file.
     */
    downloadSong: async (url: string, id: string) => {
        try {
            if (!SONGS_DIR) throw new Error('Document directory not available');
            await DownloadManager.ensureDir();
            const fileName = `${id}.m4a`; // Using m4a as generic audio container
            const fileUri = SONGS_DIR + fileName;

            logger.info('Starting download', { id, url });
            const downloadRes = await LegacyFileSystem.downloadAsync(url, fileUri);

            if (downloadRes.status !== 200) {
                throw new Error(`Download failed with status ${downloadRes.status}`);
            }

            logger.info('Song downloaded successfully', { id, uri: downloadRes.uri });
            return downloadRes.uri;
        } catch (error) {
            logger.error('Download failed', error);
            throw error;
        }
    },

    /**
     * Deletes a downloaded song.
     * @param id The song ID.
     */
    deleteSong: async (id: string) => {
        try {
            if (!SONGS_DIR) return;
            const fileUri = SONGS_DIR + `${id}.m4a`;
            await LegacyFileSystem.deleteAsync(fileUri, { idempotent: true });
            logger.info('Song deleted', { id });
        } catch (error) {
            logger.error('Delete failed', error);
        }
    },

    /**
     * Gets the local URI for a song if it exists.
     * @param id The song ID.
     */
    getLocalUri: (id: string) => {
        return SONGS_DIR ? SONGS_DIR + `${id}.m4a` : '';
    },

    /**
     * Checks if a song is downloaded.
     * @param id The song ID.
     */
    exists: async (id: string) => {
        try {
            if (!SONGS_DIR) return false;
            const fileUri = SONGS_DIR + `${id}.m4a`;
            const info = await LegacyFileSystem.getInfoAsync(fileUri);
            return info.exists;
        } catch (error) {
            return false;
        }
    },

    /**
     * Downloads artwork and saves it locally.
     */
    downloadArtwork: async (url: string, id: string) => {
        try {
            if (!SONGS_DIR) throw new Error('Document directory not available');
            await DownloadManager.ensureDir();
            const fileUri = SONGS_DIR + `${id}.jpg`;

            logger.info('Starting artwork download', { id });
            const downloadRes = await LegacyFileSystem.downloadAsync(url, fileUri);

            if (downloadRes.status !== 200) {
                // Warn but don't fail?
                logger.warn('Artwork download status not 200', { status: downloadRes.status });
            }
            return downloadRes.uri;
        } catch (error) {
            logger.error('Artwork download failed', error);
            return null;
        }
    },

    /**
     * Deletes locally saved artwork.
     */
    deleteArtwork: async (id: string) => {
        try {
            if (!SONGS_DIR) return;
            const fileUri = SONGS_DIR + `${id}.jpg`;
            await LegacyFileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch (error) {
            logger.error('Artwork delete failed', error);
        }
    },

    getArtworkUri: (id: string) => {
        return SONGS_DIR ? SONGS_DIR + `${id}.jpg` : '';
    }
};

export default DownloadManager;
