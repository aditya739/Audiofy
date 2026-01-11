import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    StatusBar,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Music, Search, Clock, Sun, Moon } from 'lucide-react-native';
import { saavnApi } from '../api/SaavnApi';
import { Song, TrackData } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';
import { LinearGradient } from 'expo-linear-gradient';
import Logger from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';
import SongConverter from '../utils/SongConverter';

const logger = Logger.getInstance('HomeScreen');

const { width } = Dimensions.get('window');

import FeaturedCard from '../components/home/FeaturedCard';
import SectionHeader from '../components/home/SectionHeader';
import HorizontalSongList from '../components/home/HorizontalSongList';
import ArtistList from '../components/home/ArtistList';

const HomeScreen = ({ navigation }: any) => {
    const [trending, setTrending] = useState<Song[]>([]);
    const [newReleases, setNewReleases] = useState<Song[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const { setCurrentTrack, addToQueue, setIsPlaying, recentPlays, addToRecentPlays, theme, toggleTheme } = usePlayerStore();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (page === 1) {
            logger.group('Load Home Data');
            logger.info('Fetching trending and new releases');
            setLoading(true);
        }

        try {
            const [t, n] = await Promise.all([
                saavnApi.getTrending(),
                saavnApi.getNewReleases(1)
            ]);

            setTrending(t);
            setNewReleases(n);
            setPage(1);
        } catch (e) {
            ErrorHandler.handle(e, 'HomeScreen.loadData');
        } finally {
            setLoading(false);
            if (page === 1) logger.groupEnd();
        }
    };

    const loadMoreSongs = async () => {
        if (loadingMore || loading) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const moreSongs = await saavnApi.getNewReleases(nextPage);
            if (moreSongs.length > 0) {
                setNewReleases(prev => [...prev, ...moreSongs]);
                setPage(nextPage);
            }
        } catch (e) {
            logger.error('Failed to load more songs', e);
        } finally {
            setLoadingMore(false);
        }
    };

    const playSong = async (song: Song | TrackData) => {
        // ... existing implementation
        const songTitle = 'downloadUrl' in song ? song.name : song.title;
        logger.info('Playing song', { title: songTitle });

        try {
            const track = SongConverter.normalize(song);
            logger.debug('Setting track', { title: track.title, id: track.id });
            setCurrentTrack(track);
            addToQueue(track);
            addToRecentPlays(track);
            setIsPlaying(true);
            await musicPlayer.play(track);
        } catch (error) {
            logger.error('Failed to play song', error);
            ErrorHandler.handle(error, 'HomeScreen.playSong');
        }
    };

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        accent: '#1ED760',
    };

    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: colors.bg }]}>
            <View>
                <Text style={[styles.appName, { color: colors.text }]}>Audiofy</Text>
                <Text style={[styles.subGreeting, { color: colors.textSub }]}>Discover new music today</Text>
            </View>
            <View style={styles.headerActions}>
                <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.card }]} onPress={() => navigation.navigate('Search')}>
                    <Search size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.card }]} onPress={toggleTheme}>
                    {theme === 'dark' ? <Sun size={22} color="#FFD700" /> : <Moon size={22} color="#4A5568" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderHeaderComponent = () => (
        <>
            {/* Featured Section */}
            <FeaturedCard
                item={newReleases[0] || null}
                onPlay={playSong}
            />

            {/* Recently Played */}
            {recentPlays.length > 0 && (
                <View style={styles.section}>
                    <SectionHeader
                        title="Recently Played"
                        rightElement={<Clock size={20} color={colors.accent} />}
                    />
                    <HorizontalSongList
                        data={recentPlays}
                        onPlay={playSong}
                        variant="recent"
                    />
                </View>
            )}

            {/* Trending Section */}
            <View style={styles.section}>
                <SectionHeader
                    title="Trending Now"
                    rightElement={
                        <TouchableOpacity>
                            <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
                        </TouchableOpacity>
                    }
                />
                <HorizontalSongList
                    data={trending}
                    onPlay={playSong}
                    variant="trending"
                />
            </View>

            {/* Popular Artists */}
            <View style={styles.section}>
                <SectionHeader title="Artists for You" />
                <ArtistList
                    data={trending} // Using trending for artists as placeholder
                    navigation={navigation}
                />
            </View>

            <View style={styles.section}>
                <SectionHeader title="More For You" />
            </View>
        </>
    );

    const renderSongItem = ({ item }: { item: Song }) => {
        // Safe check
        if (!item || !item.name) return null;

        // Artist Extraction Logic improved for robustness
        const artistName = item.primaryArtists ||
            (item as any).subtitle ||
            (item.artists?.primary?.map((a: any) => a.name).join(', ')) ||
            'Unknown Artist';

        return (
            <TouchableOpacity style={styles.songItem} onPress={() => playSong(item)}>
                <Image
                    source={{ uri: item.image && item.image.length > 0 ? item.image[0].url : 'https://via.placeholder.com/50' }}
                    style={styles.songArt}
                />
                <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.songArtist, { color: colors.textSub }]} numberOfLines={1}>
                        {artistName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && trending.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color="#1ED760" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {renderHeader()}

                <FlatList
                    data={newReleases.slice(1)} // Skip the first one as it is Featured
                    keyExtractor={(item, index) => item.id + index} // Use index to avoid dupe keys if API logic fails
                    renderItem={renderSongItem}
                    ListHeaderComponent={renderHeaderComponent}
                    contentContainerStyle={styles.listContent}
                    onEndReached={loadMoreSongs}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        loadingMore ? <ActivityIndicator size="small" color={colors.accent} style={{ margin: 20 }} /> : <View style={{ height: 100 }} />
                    }
                />
            </SafeAreaView>
            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    appName: { fontSize: 32, fontWeight: '800', letterSpacing: 1 },
    subGreeting: { fontSize: 13, marginTop: 2 },
    headerActions: { flexDirection: 'row' },
    headerBtn: { marginLeft: 15, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingBottom: 100 },
    section: { marginBottom: 30 },
    seeAll: { fontSize: 13 },
    songItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    songArt: { width: 50, height: 50, borderRadius: 4, marginRight: 15 },
    songInfo: { flex: 1, justifyContent: 'center' },
    songTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    songArtist: { fontSize: 13 },
});

export default HomeScreen;
