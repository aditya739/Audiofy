import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/usePlayerStore';
import { useSafePlaybackState, useSafeProgress } from '../hooks/usePlayer';
import { musicPlayer } from '../services/MusicPlayer';
import { saavnApi } from '../api/SaavnApi';
import { Song, TrackData } from '../types';
import Logger from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';
import SongConverter from '../utils/SongConverter';

const logger = Logger.getInstance('PlayerScreen');

// Components
import PlayerHeader from '../components/player/PlayerHeader';
import AlbumArt from '../components/player/AlbumArt';
import SongInfo from '../components/player/SongInfo';
import ProgressBar from '../components/player/ProgressBar';
import PlayerControls from '../components/player/PlayerControls';
import SimilarSongsList from '../components/player/SimilarSongsList';

const PlayerScreen = ({ navigation }: any) => {
    const {
        currentTrack,
        isPlaying,
        setIsPlaying,
        shuffle,
        toggleShuffle,
        repeatMode,
        setRepeatMode,
        downloads,
        toggleDownload,
        setCurrentTrack,
        addToQueue,
        addToRecentPlays,
        theme,
        toggleFavorite,
        isFavorite,
        playNext,
        playPrevious
    } = usePlayerStore();

    const [similarSongs, setSimilarSongs] = useState<Song[]>([]);

    const playbackState = useSafePlaybackState();
    const progress = useSafeProgress();

    // Theme colors
    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
    };

    const getImageUrl = (images: any[]) => {
        if (!images || images.length === 0) return '';
        const highRes = images[images.length - 1];
        return highRes?.link || highRes?.url || '';
    };

    const getArtistInfo = (song: Song) => {
        let name = 'Unknown Artist';
        let id = '';

        if (song.primaryArtists) {
            name = song.primaryArtists;
            id = song.primaryArtistsId || '';
        } else if (song.artists?.primary && song.artists.primary.length > 0) {
            name = song.artists.primary.map(a => a.name).join(', ');
            id = song.artists.primary.map(a => a.id).join(', ');
        }

        return { name, id };
    };

    useEffect(() => {
        if (currentTrack) fetchSimilar();
    }, [currentTrack?.id]);

    const fetchSimilar = async () => {
        if (!currentTrack) return;

        logger.group('Fetch Similar Songs');
        logger.info('Fetching suggestions', { trackId: currentTrack.id });

        try {
            const suggestions = await saavnApi.getSuggestions(currentTrack.id);
            logger.info('Suggestions loaded', { count: suggestions.length });
            setSimilarSongs(suggestions);
        } catch (error) {
            logger.error('Failed to fetch suggestions', error);
            ErrorHandler.handle(error, 'PlayerScreen.fetchSimilar');
        } finally {
            logger.groupEnd();
        }
    };

    if (!currentTrack) return null;

    const togglePlayback = async () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);
        await musicPlayer.toggle(isPlaying);
    };

    const playSimilar = async (song: Song) => {
        logger.info('Playing similar song', { title: song.name });

        try {
            // Use SongConverter to convert Song to TrackData
            const track = SongConverter.toTrackData(song);

            logger.debug('Setting similar track', { title: track.title, id: track.id });
            setCurrentTrack(track);
            addToQueue(track);
            addToRecentPlays(track);
            setIsPlaying(true);
            await musicPlayer.play(track);
        } catch (error) {
            logger.error('Failed to play similar song', error);
            ErrorHandler.handle(error, 'PlayerScreen.playSimilar');
        }
    };

    const handleSeek = async (value: number) => {
        await musicPlayer.seek(value);
    };

    const skipToNext = async () => {
        logger.info('Skipping to next track');
        await playNext(false);
    };

    const skipToPrevious = async () => {
        logger.info('Skipping to previous track');
        await playPrevious();
    };

    const handleFavorite = () => {
        if (currentTrack) {
            toggleFavorite(currentTrack);
        }
    };

    const toggleShuffleMode = () => {
        logger.info('Toggling shuffle mode', { from: shuffle, to: !shuffle });
        toggleShuffle();
    };

    const isFav = currentTrack ? isFavorite(currentTrack.id) : false;

    const cycleRepeatMode = () => {
        logger.info('Cycling repeat mode', { currentMode: repeatMode });
        const modes: ('off' | 'track' | 'queue')[] = ['off', 'track', 'queue'];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        logger.info('Repeat mode changed', { from: repeatMode, to: nextMode });
        setRepeatMode(nextMode);
    };

    const navigateToArtist = () => {
        if (currentTrack.artistId) {
            navigation.navigate('ArtistProfile', {
                artistId: currentTrack.artistId,
                artistName: (currentTrack.artist || '').toString().split(',')[0].trim() || 'Artist'
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

            {theme === 'dark' && (
                <>
                    <Image
                        source={{ uri: currentTrack.artwork }}
                        style={StyleSheet.absoluteFillObject}
                        blurRadius={50}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)', '#000']}
                        style={StyleSheet.absoluteFillObject}
                    />
                </>
            )}

            <SafeAreaView style={styles.safeArea}>
                <PlayerHeader
                    navigation={navigation}
                    album={currentTrack.album}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <AlbumArt artwork={currentTrack.artwork} />

                    <SongInfo
                        track={currentTrack}
                        isFav={isFav}
                        onToggleFav={handleFavorite}
                        onArtistPress={navigateToArtist}
                    />

                    <ProgressBar
                        position={progress.position}
                        duration={progress.duration}
                        onSeek={handleSeek}
                    />

                    <PlayerControls
                        isPlaying={isPlaying}
                        onTogglePlay={togglePlayback}
                        onNext={skipToNext}
                        onPrev={skipToPrevious}
                        shuffle={shuffle}
                        onToggleShuffle={toggleShuffleMode}
                        repeatMode={repeatMode}
                        onCycleRepeat={cycleRepeatMode}
                        isDownloaded={downloads.includes(currentTrack.id)}
                        onToggleDownload={() => toggleDownload(currentTrack)}
                    />

                    {similarSongs.length > 0 && (
                        <SimilarSongsList
                            data={similarSongs}
                            onPlay={playSimilar}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingBottom: 60,
    },
});

export default PlayerScreen;
