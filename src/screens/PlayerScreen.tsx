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
import { getSuggestions } from '../api/saavn';
import { Song, TrackData } from '../types';

// Components
import PlayerHeader from '../components/player/PlayerHeader';
import AlbumArt from '../components/player/AlbumArt';
import SongInfo from '../components/player/SongInfo';
import ProgressBar from '../components/player/ProgressBar';
import PlayerControls from '../components/player/PlayerControls';
import SimilarSongsList from '../components/player/SimilarSongsList';
import PlayerFooter from '../components/player/PlayerFooter';

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
        isFavorite
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
        if (currentTrack) {
            const suggestions = await getSuggestions(currentTrack.id);
            setSimilarSongs(suggestions);
        }
    };

    if (!currentTrack) return null;

    const togglePlayback = async () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);
        await musicPlayer.toggle(isPlaying);
    };

    const playSimilar = async (song: Song) => {
        console.log('🎵 [PlayerScreen] playSimilar() called for:', song.name);
        const { name: artistName, id: artistId } = getArtistInfo(song);
        const track: TrackData = {
            id: song.id,
            url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
            title: song.name,
            artist: artistName,
            artistId: (artistId || '').toString().split(',')[0].trim(),
            artwork: getImageUrl(song.image),
            album: song.album.name,
            duration: Number(song.duration),
        };

        console.log('🎵 [PlayerScreen] Setting similar track:', track.title, 'ID:', track.id);
        setCurrentTrack(track);
        addToQueue(track);
        addToRecentPlays(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
    };

    const handleSeek = async (value: number) => {
        await musicPlayer.seek(value);
    };

    const skipToNext = async () => {
        const { queue, currentTrack, setCurrentTrack, setIsPlaying, addToRecentPlays } = usePlayerStore.getState();
        if (queue.length === 0 || !currentTrack) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        let nextTrack;

        if (shuffle) {
            const randomIndex = Math.floor(Math.random() * queue.length);
            nextTrack = queue[randomIndex];
        } else {
            const nextIndex = (currentIndex + 1) % queue.length;
            nextTrack = queue[nextIndex];
        }

        if (nextTrack) {
            setCurrentTrack(nextTrack);
            addToRecentPlays(nextTrack);
            setIsPlaying(true);
            await musicPlayer.play(nextTrack);
        }
    };

    const skipToPrevious = async () => {
        const { queue, currentTrack, setCurrentTrack, setIsPlaying, addToRecentPlays } = usePlayerStore.getState();
        if (queue.length === 0 || !currentTrack) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
        const prevTrack = queue[prevIndex];

        if (prevTrack) {
            setCurrentTrack(prevTrack);
            addToRecentPlays(prevTrack);
            setIsPlaying(true);
            await musicPlayer.play(prevTrack);
        }
    };

    const handleFavorite = () => {
        if (currentTrack) {
            toggleFavorite(currentTrack);
        }
    };

    const isFav = currentTrack ? isFavorite(currentTrack.id) : false;

    const cycleRepeatMode = () => {
        const modes: ('off' | 'track' | 'queue')[] = ['off', 'track', 'queue'];
        const currentIndex = modes.indexOf(repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
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
                        onToggleShuffle={toggleShuffle}
                        repeatMode={repeatMode}
                        onCycleRepeat={cycleRepeatMode}
                    />

                    <PlayerFooter
                        isDownloaded={downloads.includes(currentTrack.id)}
                        onToggleDownload={() => toggleDownload(currentTrack.id)}
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
