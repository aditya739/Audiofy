import SongConverter from '../SongConverter';
import { Song } from '../../types';

// Mock Logger to avoid console spam during tests
jest.mock('../Logger', () => {
    return {
        getInstance: () => ({
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        }),
    };
});

describe('SongConverter', () => {
    describe('formatDuration', () => {
        it('should format seconds into MM:SS correctly', () => {
            expect(SongConverter.formatDuration(0)).toBe('0:00');
            expect(SongConverter.formatDuration(61)).toBe('1:01');
            expect(SongConverter.formatDuration(125)).toBe('2:05');
            expect(SongConverter.formatDuration(3600)).toBe('60:00');
        });
    });

    describe('toTrackData', () => {
        const mockSong: Song = {
            id: '123',
            name: 'Test Song',
            type: 'song',
            album: { name: 'Test Album', id: 'album1', url: '' },
            year: '2023',
            releaseDate: '2023-01-01',
            duration: '300',
            label: 'Test Label',
            primaryArtists: 'Artist 1',
            primaryArtistsId: 'a1',
            featuredArtists: 'Artist 2',
            featuredArtistsId: 'a2',
            explicitContent: 0,
            playCount: '1000',
            language: 'english',
            hasLyrics: 'false',
            url: '',
            copyright: '',
            image: [
                { quality: 'low', link: 'http://test.com/low.jpg' },
                { quality: 'high', link: 'http://test.com/high.jpg' }
            ],
            downloadUrl: [
                { quality: 'low', link: 'http://test.com/audio_low.mp3' },
                { quality: 'high', link: 'http://test.com/audio_high.mp3' }
            ]
        };

        it('should convert a valid Song object to TrackData', () => {
            const result = SongConverter.toTrackData(mockSong);

            expect(result).toEqual({
                id: '123',
                title: 'Test Song',
                artist: 'Artist 1',
                artistId: 'a1',
                album: 'Test Album',
                artwork: 'http://test.com/high.jpg',
                url: 'http://test.com/audio_high.mp3',
                duration: 300,
            });
        });

        it('should handle missing download URL gracefully', () => {
            // Simulate a song with empty download urls which might cause the try block to fail
            const invalidSong = { ...mockSong, downloadUrl: [] };

            // The catch block in SongConverter should return a fallback object
            const result = SongConverter.toTrackData(invalidSong as any);

            expect(result).toEqual(expect.objectContaining({
                id: '123',
                title: 'Test Song',
                url: '', // Fallback URL
                artist: 'Unknown Artist', // Fallback artist due to error flow
            }));
        });
    });
});
