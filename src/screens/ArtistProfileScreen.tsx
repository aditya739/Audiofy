import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Dimensions,
    Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Play, Pause, MoreVertical, Heart, Shuffle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getArtistDetails, getArtistSongs } from '../api/saavn';
import { Song, TrackData } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';

const { width } = Dimensions.get('window');

const ArtistProfileScreen = ({ route, navigation }: any) => {
    const { artistId, artistName } = route.params;
    const [artistData, setArtistData] = useState<any>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollY = new Animated.Value(0);

    const { setCurrentTrack, addToQueue, setIsPlaying, addToRecentPlays } = usePlayerStore();

    const getImageUrl = (images: any[]) => {
        if (!images || images.length === 0) return '';
        const highRes = images[images.length - 1];
        return highRes?.link || highRes?.url || '';
    };

    useEffect(() => {
        loadData();
    }, [artistId]);

    const loadData = async () => {
        setLoading(true);
        const [details, artistSongs] = await Promise.all([
            getArtistDetails(artistId),
            getArtistSongs(artistId)
        ]);
        setArtistData(details);
        setSongs(artistSongs);
        setLoading(false);
    };

    const playSong = async (song: Song) => {
        const track: TrackData = {
            id: song.id,
            url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
            title: song.name,
            artist: song.primaryArtists || artistName,
            artistId: artistId,
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

    const playAll = async () => {
        if (songs.length > 0) {
            playSong(songs[0]);
        }
    };

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [300, 100],
        extrapolate: 'clamp'
    });

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [1, 0],
        extrapolate: 'clamp'
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    const renderSongItem = ({ item, index }: { item: Song, index: number }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => playSong(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.songIndex}>{index + 1}</Text>
            <View style={styles.songInfo}>
                <Text style={styles.songName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.songMetas}>{item.duration}s • {item.language}</Text>
            </View>
            <TouchableOpacity style={styles.moreBtn}>
                <MoreVertical size={20} color="#666" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Image
                    source={{ uri: getImageUrl(artistData?.image) }}
                    style={[styles.headerImage, { opacity: imageOpacity }]}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                    style={styles.gradient}
                />
                <SafeAreaView style={styles.navHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={30} color="#fff" />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.navTitle, {
                        opacity: scrollY.interpolate({
                            inputRange: [150, 200],
                            outputRange: [0, 1],
                            extrapolate: 'clamp'
                        })
                    }]}>{artistName}</Animated.Text>
                </SafeAreaView>

                <Animated.View style={[styles.headerContent, { opacity: imageOpacity }]}>
                    <Text style={styles.artistName}>{artistName}</Text>
                    <Text style={styles.followerCount}>{artistData?.fanCount || 'Verified Artist'}</Text>
                </Animated.View>
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.songsHeader}>
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.followBtn}>
                            <Heart size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shuffleBtn}>
                            <Shuffle size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.playAllBtn}
                            onPress={playAll}
                        >
                            <Play size={24} color="#000" fill="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.songsSection}>
                    <Text style={styles.sectionTitle}>Popular Songs</Text>
                    <FlatList
                        data={songs}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={renderSongItem}
                        scrollEnabled={false}
                    />
                </View>

                <View style={styles.bottomPadding} />
            </Animated.ScrollView>

            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: 'hidden',
    },
    headerImage: {
        width: width,
        height: 300,
        position: 'absolute',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40,
        height: 100,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    headerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    artistName: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
    },
    followerCount: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 5,
    },
    scrollView: {
        flex: 1,
        marginTop: 0,
    },
    songsHeader: {
        marginTop: 300,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    followBtn: {
        marginRight: 25,
    },
    shuffleBtn: {
        marginRight: 25,
    },
    playAllBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1DB954',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
    },
    songsSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    songIndex: {
        color: '#666',
        fontSize: 16,
        width: 30,
    },
    songInfo: {
        flex: 1,
        marginLeft: 10,
    },
    songName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    songMetas: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
    moreBtn: {
        padding: 10,
    },
    bottomPadding: {
        height: 150,
    }
});

export default ArtistProfileScreen;
