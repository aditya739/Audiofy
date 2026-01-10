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
import { ChevronLeft, Play, Pause, MoreVertical, Heart, Shuffle, Music } from 'lucide-react-native';
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

    const { setCurrentTrack, addToQueue, setIsPlaying, addToRecentPlays, theme } = usePlayerStore();

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        border: theme === 'dark' ? '#333' : '#e0e0e0',
    };

    useEffect(() => {
        loadData();
    }, [artistId]);

    const loadData = async () => {
        console.log('🎭 [ArtistProfileScreen] loadData() called for artist:', artistName, 'ID:', artistId);
        setLoading(true);
        try {
            const [details, artistSongs] = await Promise.all([
                getArtistDetails(artistId),
                getArtistSongs(artistId)
            ]);

            // If API returned songs, use them
            if (artistSongs && artistSongs.length > 0) {
                console.log('🎭 [ArtistProfileScreen] Data loaded - Details:', !!details, 'Songs:', artistSongs.length);
                setArtistData(details);
                setSongs(artistSongs);
            } else {
                // Fallback: Search for songs by artist name
                console.log('⚠️ [ArtistProfileScreen] No songs from API, searching by artist name:', artistName);
                const { searchSongs } = require('../api/saavn');
                const searchResults = await searchSongs(artistName);

                // Filter results to only include songs by this artist
                const filteredSongs = searchResults.filter((song: any) =>
                    song.primaryArtists?.toLowerCase().includes(artistName.toLowerCase())
                );

                console.log('✅ [ArtistProfileScreen] Fallback search found', filteredSongs.length, 'songs');
                setArtistData(details);
                setSongs(filteredSongs);
            }
        } catch (e) {
            console.error('❌ [ArtistProfileScreen] loadData() error:', e);
            // Last resort: try searching by artist name
            try {
                console.log('🔄 [ArtistProfileScreen] Attempting final fallback search');
                const { searchSongs } = require('../api/saavn');
                const searchResults = await searchSongs(artistName);
                const filteredSongs = searchResults.filter((song: any) =>
                    song.primaryArtists?.toLowerCase().includes(artistName.toLowerCase())
                );
                console.log('✅ [ArtistProfileScreen] Final fallback found', filteredSongs.length, 'songs');
                setSongs(filteredSongs);
            } catch (fallbackError) {
                console.error('❌ [ArtistProfileScreen] All fallbacks failed:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const playSong = async (song: Song) => {
        console.log('🎭 [ArtistProfileScreen] playSong() called for:', song.name);
        const track: TrackData = {
            id: song.id,
            url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
            title: song.name,
            artist: artistName || (song.primaryArtists || 'Artist').toString().split(',')[0],
            artistId: (artistId || (song.primaryArtistsId || '').toString().split(',')[0] || '').toString(),
            artwork: song.image[song.image.length - 1]?.url || '',
            album: song.album.name,
            duration: Number(song.duration),
        };

        console.log('🎭 [ArtistProfileScreen] Setting track:', track.title, 'ID:', track.id);
        setCurrentTrack(track);
        addToQueue(track);
        addToRecentPlays(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
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

    const renderSongItem = ({ item, index }: { item: Song, index: number }) => (
        <TouchableOpacity style={styles.songItem} onPress={() => playSong(item)}>
            <Text style={[styles.songIndex, { color: colors.textSub }]}>{index + 1}</Text>
            <Image source={{ uri: item.image[0].url }} style={styles.songArt} />
            <View style={styles.songInfo}>
                <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.songAlbum, { color: colors.textSub }]} numberOfLines={1}>{item.album.name}</Text>
            </View>
            <TouchableOpacity style={styles.songMore}>
                <MoreVertical size={20} color={colors.textSub} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading && !artistData) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Image
                    source={{ uri: artistData?.image?.[artistData?.image?.length - 1]?.url || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800' }}
                    style={[styles.headerImage, { opacity: imageOpacity }]}
                />
                <LinearGradient
                    colors={['transparent', theme === 'dark' ? 'rgba(15,15,15,0.8)' : 'rgba(255,255,255,0.8)', colors.bg]}
                    style={styles.gradient}
                />
                <SafeAreaView style={styles.headerContent} edges={['top']}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={28} color="#fff" />
                    </TouchableOpacity>
                    <Animated.Text style={[styles.artistName, {
                        color: colors.text, // This gets overridden by the gradient/image logic? No, image is behind. But gradient fades to bg.
                        // Actually, header text should probably be white ALWAYS if it's on top of an image.
                        // Wait, if we scroll up, the image fades out (opacity -> 0).
                        // If image fades out, background becomes colors.bg.
                        // So text color should transition? Or just be dynamic?
                        // If image is visible, white text is good. If image hidden (white bg), black text needed.
                        // BUT, image opacity goes to 0 at scroll 200.
                        // So at scroll 200, we need dynamic text color.
                        // At scroll 0 (image visible), white text.
                        // It's tricky with simple interpolation.
                        // Use a fixed color for now or dynamic?
                        // Let's stick to dynamic for consistent look when collapsed.
                        fontSize: scrollY.interpolate({
                            inputRange: [0, 200],
                            outputRange: [40, 20],
                            extrapolate: 'clamp'
                        })
                    }]}>
                        {artistName}
                    </Animated.Text>
                </SafeAreaView>
            </Animated.View>

            <Animated.FlatList
                data={songs}
                keyExtractor={(item) => item.id}
                renderItem={renderSongItem}
                contentContainerStyle={styles.listContent}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <View style={styles.controls}>
                            <TouchableOpacity
                                style={styles.playAllBtn}
                                onPress={() => songs[0] && playSong(songs[0])}
                                disabled={songs.length === 0}
                            >
                                <LinearGradient colors={['#1ed760', '#1db954']} style={styles.playAllGradient}>
                                    <Play size={24} color="#000" fill="#000" />
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.card }]}>
                                <Shuffle size={24} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.card }]}>
                                <Heart size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {songs.length > 0 ? 'Top Songs' : 'Songs'}
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    loading ? null : (
                        <View style={styles.emptyContainer}>
                            <Music size={60} color={colors.textSub} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No songs found</Text>
                            <Text style={[styles.emptySub, { color: colors.textSub }]}>
                                We couldn't find any songs for {artistName}
                            </Text>
                        </View>
                    )
                }
            />

            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' },
    headerImage: { ...StyleSheet.absoluteFillObject },
    gradient: { ...StyleSheet.absoluteFillObject },
    headerContent: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between', paddingBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    artistName: { fontWeight: 'bold' },
    listContent: { paddingTop: 300, paddingBottom: 150 },
    listHeader: { paddingHorizontal: 20, marginBottom: 20 },
    controls: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    playAllBtn: { width: 56, height: 56, borderRadius: 28, marginRight: 20 },
    playAllGradient: { flex: 1, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    secondaryBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold' },
    songItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    songIndex: { fontSize: 14, width: 30 },
    songArt: { width: 48, height: 48, borderRadius: 6 },
    songInfo: { flex: 1, marginLeft: 15 },
    songTitle: { fontSize: 16, fontWeight: '600' },
    songAlbum: { fontSize: 13, marginTop: 4 },
    songMore: { padding: 10 },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
    emptySub: { fontSize: 14, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 }
});

export default ArtistProfileScreen;
