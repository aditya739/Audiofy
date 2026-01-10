import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ScrollView,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ChevronDown,
    ListMusic,
    Shuffle,
    Repeat,
    Download,
    Heart,
    Music
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { State, RepeatMode } from '../services/SafeTrackPlayer';
import { usePlayerStore } from '../store/usePlayerStore';
import { useSafePlaybackState, useSafeProgress } from '../hooks/usePlayer';
import { musicPlayer } from '../services/MusicPlayer';
import { getSuggestions } from '../api/saavn';
import { Song, TrackData } from '../types';

const { width, height } = Dimensions.get('window');

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
        addToRecentPlays
    } = usePlayerStore();

    const [similarSongs, setSimilarSongs] = useState<Song[]>([]);

    const playbackState = useSafePlaybackState();
    const progress = useSafeProgress();

    const getImageUrl = (images: any[]) => {
        if (!images || images.length === 0) return '';
        const highRes = images[images.length - 1];
        return highRes?.link || highRes?.url || '';
    };

    useEffect(() => {
        if (currentTrack) {
            fetchSimilar();
        }
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
        const track: TrackData = {
            id: song.id,
            url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
            title: song.name,
            artist: song.primaryArtists,
            artistId: song.primaryArtistsId.split(',')[0].trim(),
            artwork: getImageUrl(song.image),
            album: song.album.name,
            duration: Number(song.duration),
        };

        setCurrentTrack(track);
        addToQueue(track);
        addToRecentPlays(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
    };

    const handleSeek = async (value: number) => {
        await musicPlayer.seek(value);
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

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
                artistName: (currentTrack.artist || '').split(',')[0].trim() || 'Artist'
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Image
                source={{ uri: currentTrack.artwork }}
                style={StyleSheet.absoluteFillObject}
                blurRadius={50}
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <ChevronDown size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerLabel}>PLAYING FROM ALBUM</Text>
                        <Text style={styles.headerValue} numberOfLines={1}>{currentTrack.album}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Queue')} style={styles.headerButton}>
                        <ListMusic size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.artContainer}>
                        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
                    </View>

                    <View style={styles.trackInfo}>
                        <View style={styles.titleWrap}>
                            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                            <TouchableOpacity onPress={navigateToArtist}>
                                <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity>
                            <Heart size={28} color="#1DB954" fill="#1DB954" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.progressSection}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={progress.duration || 100}
                            value={progress.position}
                            minimumTrackTintColor="#1DB954"
                            maximumTrackTintColor="rgba(255,255,255,0.2)"
                            thumbTintColor="#fff"
                            onSlidingComplete={handleSeek}
                        />
                        <View style={styles.timeRow}>
                            <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
                            <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
                        </View>
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity onPress={toggleShuffle}>
                            <Shuffle size={24} color={shuffle ? '#1DB954' : '#fff'} />
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <SkipBack size={36} color="#fff" fill="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                            <LinearGradient
                                colors={['#1ed760', '#1db954']}
                                style={styles.playGradient}
                            >
                                {isPlaying ? (
                                    <Pause size={32} color="#000" fill="#000" />
                                ) : (
                                    <Play size={32} color="#000" fill="#000" style={{ marginLeft: 4 }} />
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <SkipForward size={36} color="#fff" fill="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={cycleRepeatMode}>
                            <Repeat size={24} color={repeatMode !== 'off' ? '#1DB954' : '#fff'} />
                            {repeatMode === 'track' && <View style={styles.repeatBadge}><Text style={styles.repeatBadgeText}>1</Text></View>}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            onPress={() => toggleDownload(currentTrack.id)}
                            style={[styles.footerButton, downloads.includes(currentTrack.id) && styles.downloadActive]}
                        >
                            <Download size={22} color={downloads.includes(currentTrack.id) ? '#1DB954' : '#fff'} />
                            <Text style={[styles.footerButtonText, downloads.includes(currentTrack.id) && styles.downloadActiveText]}>
                                {downloads.includes(currentTrack.id) ? 'Downloaded' : 'Download'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {similarSongs.length > 0 && (
                        <View style={styles.similarSection}>
                            <View style={styles.similarHeader}>
                                <Music size={18} color="#1DB954" />
                                <Text style={styles.similarTitle}>Similar Songs</Text>
                            </View>
                            <View style={styles.similarList}>
                                {similarSongs.slice(0, 10).map((song, index) => (
                                    <TouchableOpacity
                                        key={`${song.id}-${index}`}
                                        style={styles.similarItem}
                                        onPress={() => playSimilar(song)}
                                    >
                                        <Image source={{ uri: getImageUrl(song.image) }} style={styles.similarArt} />
                                        <View style={styles.similarInfo}>
                                            <Text style={styles.similarName} numberOfLines={1}>{song.name}</Text>
                                            <Text style={styles.similarArtist} numberOfLines={1}>{song.primaryArtists}</Text>
                                        </View>
                                        <Play size={16} color="#1DB954" fill="#1DB954" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerLabel: {
        color: '#999',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    headerValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 30,
        paddingBottom: 60,
    },
    artContainer: {
        width: width - 60,
        height: width - 60,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        marginTop: 20,
    },
    artwork: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    trackInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    titleWrap: {
        flex: 1,
        marginRight: 20,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    artist: {
        color: '#1DB954',
        fontSize: 18,
        marginTop: 4,
        fontWeight: '500',
    },
    progressSection: {
        marginTop: 30,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    timeText: {
        color: '#999',
        fontSize: 12,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    playGradient: {
        flex: 1,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    repeatBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#1DB954',
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    repeatBadgeText: {
        color: '#000',
        fontSize: 8,
        fontWeight: 'bold',
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    footerButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '600',
    },
    downloadActive: {
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderColor: '#1DB954',
        borderWidth: 1,
    },
    downloadActiveText: {
        color: '#1DB954',
    },
    similarSection: {
        marginTop: 40,
    },
    similarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    similarTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    similarList: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 15,
        padding: 10,
    },
    similarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    similarArt: {
        width: 40,
        height: 40,
        borderRadius: 5,
    },
    similarInfo: {
        flex: 1,
        marginLeft: 15,
    },
    similarName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    similarArtist: {
        color: '#999',
        fontSize: 12,
    }
});

export default PlayerScreen;
