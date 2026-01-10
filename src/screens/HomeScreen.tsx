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
import { getTrending, getNewReleases } from '../api/saavn';
import { Song, TrackData } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

import FeaturedCard from '../components/home/FeaturedCard';
import SectionHeader from '../components/home/SectionHeader';
import HorizontalSongList from '../components/home/HorizontalSongList';
import ArtistList from '../components/home/ArtistList';

const HomeScreen = ({ navigation }: any) => {
    const [trending, setTrending] = useState<Song[]>([]);
    const [newReleases, setNewReleases] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    const { setCurrentTrack, addToQueue, setIsPlaying, recentPlays, addToRecentPlays, theme, toggleTheme } = usePlayerStore();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        console.log('🏠 [HomeScreen] loadData() called - fetching trending and new releases');
        setLoading(true);
        try {
            const [t, n] = await Promise.all([getTrending(), getNewReleases()]);
            console.log('🏠 [HomeScreen] Data loaded - Trending:', t.length, 'New Releases:', n.length);
            setTrending(t);
            setNewReleases(n);
        } catch (e) {
            console.error('❌ [HomeScreen] loadData() error:', e);
        } finally {
            setLoading(false);
        }
    };

    const playSong = async (song: Song | TrackData) => {
        console.log('🏠 [HomeScreen] playSong() called for:', 'downloadUrl' in song ? song.name : song.title);
        let track: TrackData;
        if ('downloadUrl' in song) {
            const highRes = song.image[song.image.length - 1]; // Assuming Song has image array, verified in FeaturedCard extraction
            track = {
                id: song.id,
                url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
                title: song.name,
                artist: (song.primaryArtists || 'Unknown Artist').toString().split(',')[0].trim(),
                artistId: (song.primaryArtistsId || '').toString().split(',')[0].trim(),
                artwork: highRes?.link || highRes?.url || '',
                album: song.album.name,
                duration: Number(song.duration),
            };
        } else {
            track = song;
        }

        console.log('🏠 [HomeScreen] Setting track:', track.title, 'ID:', track.id);
        setCurrentTrack(track);
        addToQueue(track);
        addToRecentPlays(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
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
                <Text style={[styles.greeting, { color: colors.text }]}>Good Evening</Text>
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

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                            data={trending}
                            navigation={navigation}
                        />
                    </View>

                    {/* Extra Spacing for MiniPlayer */}
                    <View style={{ height: 160 }} />
                </ScrollView>
            </SafeAreaView>
            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f0f0f' },
    loadingContainer: { flex: 1, backgroundColor: '#0f0f0f', justifyContent: 'center', alignItems: 'center' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    greeting: { fontSize: 24, fontWeight: 'bold' },
    subGreeting: { fontSize: 13, marginTop: 2 },
    headerActions: { flexDirection: 'row' },
    headerBtn: { marginLeft: 15, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingTop: 10 },
    section: { marginBottom: 30 },
    seeAll: { fontSize: 13 },
});

export default HomeScreen;
