import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, ChevronRight } from 'lucide-react-native';
import { searchSongs, searchArtists } from '../api/saavn';
import { Song, TrackData } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';

// Components
import SearchBar from '../components/search/SearchBar';
import SearchTabs from '../components/search/SearchTabs';
import SearchListItem from '../components/search/SearchListItem';

const { width } = Dimensions.get('window');

type TabType = 'all' | 'songs' | 'artists';

const SearchScreen = ({ navigation }: any) => {
    const [query, setQuery] = useState('');
    const [songResults, setSongResults] = useState<Song[]>([]);
    const [artistResults, setArtistResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    const { setCurrentTrack, addToQueue, setIsPlaying, addToRecentPlays, theme } = usePlayerStore();

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        card: theme === 'dark' ? '#1a1a1a' : '#f9f9f9',
    };

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length > 2) {
            setLoading(true);
            const [songs, artists] = await Promise.all([
                searchSongs(text),
                searchArtists(text)
            ]);
            setSongResults(songs);
            setArtistResults(artists);
            setLoading(false);
        } else {
            setSongResults([]);
            setArtistResults([]);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSongResults([]);
        setArtistResults([]);
    };

    const playSong = async (song: Song) => {
        const highRes = song.image[song.image.length - 1];
        const track: TrackData = {
            id: song.id,
            url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
            title: song.name,
            artist: (song.primaryArtists || 'Unknown Artist').toString().split(',')[0].trim(),
            artistId: (song.primaryArtistsId || '').toString().split(',')[0].trim(),
            artwork: highRes?.link || highRes?.url || '',
            album: song.album.name,
            duration: Number(song.duration),
        };

        setCurrentTrack(track);
        addToQueue(track);
        addToRecentPlays(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
    };

    const navigateToArtist = (artist: any) => {
        navigation.navigate('ArtistProfile', {
            artistId: artist.id,
            artistName: artist.name
        });
    };

    const renderAllResults = () => {
        if (artistResults.length === 0 && songResults.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>No results found for "{query}"</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={[
                    ...(artistResults.length > 0 ? [{ type: 'header', title: 'Artists' }] : []),
                    ...artistResults.slice(0, 3).map(a => ({ type: 'artist', data: a })),
                    ...(artistResults.length > 3 ? [{ type: 'seeAllArtists' }] : []),
                    ...(songResults.length > 0 ? [{ type: 'header', title: 'Songs' }] : []),
                    ...songResults.slice(0, 10).map(s => ({ type: 'song', data: s })),
                ]}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                renderItem={({ item }: any) => {
                    if (item.type === 'header') {
                        return <Text style={[styles.sectionHeader, { color: colors.text }]}>{item.title}</Text>;
                    }
                    if (item.type === 'artist') {
                        return <SearchListItem item={item.data} type="artist" onPress={navigateToArtist} />;
                    }
                    if (item.type === 'seeAllArtists') {
                        return (
                            <TouchableOpacity
                                style={styles.seeAllBtn}
                                onPress={() => setActiveTab('artists')}
                            >
                                <Text style={styles.seeAllText}>See all {artistResults.length} artists</Text>
                                <ChevronRight size={16} color={colors.accent} />
                            </TouchableOpacity>
                        );
                    }
                    if (item.type === 'song') {
                        return <SearchListItem item={item.data} type="song" onPress={playSong} />;
                    }
                    return null;
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
                    <SearchBar
                        value={query}
                        onChangeText={handleSearch}
                        onClear={clearSearch}
                        onSubmit={() => { }}
                    />

                    {/* Tabs */}
                    {query.length > 0 && (songResults.length > 0 || artistResults.length > 0) && (
                        <SearchTabs
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    )}
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                    </View>
                ) : query.length > 0 ? (
                    activeTab === 'all' ? renderAllResults() :
                        activeTab === 'artists' ? (
                            <FlatList
                                data={artistResults}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <SearchListItem item={item} type="artist" onPress={navigateToArtist} />}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.centerContainer}>
                                        <Text style={[styles.emptyText, { color: colors.textSub }]}>No artists found</Text>
                                    </View>
                                }
                            />
                        ) : (
                            <FlatList
                                data={songResults}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => <SearchListItem item={item} type="song" onPress={playSong} />}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.centerContainer}>
                                        <Text style={[styles.emptyText, { color: colors.textSub }]}>No songs found</Text>
                                    </View>
                                }
                            />
                        )
                ) : (
                    <View style={styles.centerContainer}>
                        <SearchIcon size={80} color={colors.card} />
                        <Text style={[styles.hintText, { color: colors.textSub }]}>Find your favorite artists and songs</Text>
                    </View>
                )}
            </SafeAreaView>
            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    listContent: { paddingHorizontal: 20, paddingBottom: 150 },
    sectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 15 },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginBottom: 10 },
    seeAllText: { color: '#1ED760', fontSize: 14, fontWeight: '600', marginRight: 5 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyText: { fontSize: 16, textAlign: 'center' },
    hintText: { fontSize: 18, fontWeight: '600', marginTop: 20, textAlign: 'center', paddingHorizontal: 40 },
});

export default SearchScreen;
