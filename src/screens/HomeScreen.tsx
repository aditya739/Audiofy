import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StatusBar,
    ScrollView,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Play, MoreVertical, Compass, Music, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { searchSongs, getTrending, getNewReleases } from '../api/saavn';
import { Song, TrackData } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [trending, setTrending] = useState<Song[]>([]);
    const [newReleases, setNewReleases] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const { setCurrentTrack, addToQueue, setIsPlaying, recentPlays, addToRecentPlays } = usePlayerStore();

    const getArtworkUrl = (images: any[]) => {
        if (!images || images.length === 0) return '';
        const highRes = images[images.length - 1];
        return highRes?.link || highRes?.url || '';
    };

    useEffect(() => {
        loadInitialContent();
    }, []);

    const loadInitialContent = async () => {
        setLoading(true);
        const [trendingSongs, newSongs] = await Promise.all([
            getTrending(),
            getNewReleases()
        ]);
        setTrending(trendingSongs);
        setNewReleases(newSongs);
        setLoading(false);
    };

    const handleSearch = async (text: string) => {
        setQuery(text);
        if (text.length > 2) {
            setLoading(true);
            const results = await searchSongs(text, 1);
            setSearchResults(results);
            setLoading(false);
        } else {
            setSearchResults([]);
        }
    };

    const playSong = async (song: Song | TrackData) => {
        let track: TrackData;

        if ('downloadUrl' in song) {
            track = {
                id: song.id,
                url: song.downloadUrl[song.downloadUrl.length - 1].link || song.downloadUrl[song.downloadUrl.length - 1].url || '',
                title: song.name,
                artist: song.primaryArtists || 'Unknown Artist',
                artistId: (song.primaryArtistsId || '').split(',')[0].trim(),
                artwork: getArtworkUrl(song.image),
                album: song.album.name,
                duration: Number(song.duration),
            };
        } else {
            track = song;
        }

        setCurrentTrack(track);
        addToQueue(track);
        addToRecentPlays(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
    };

    const renderHorizontalItem = ({ item }: { item: Song }) => {
        const artistId = (item.primaryArtistsId || '').split(',')[0].trim();
        const artistName = (item.primaryArtists || '').split(',')[0].trim();

        const navigateToArtist = () => {
            navigation.navigate('ArtistProfile', { artistId, artistName });
        };

        return (
            <View style={styles.horizontalCard}>
                <TouchableOpacity
                    onPress={() => playSong(item)}
                    activeOpacity={0.8}
                >
                    <Image
                        source={{ uri: getArtworkUrl(item.image) }}
                        style={styles.horizontalArt}
                    />
                    <Text style={styles.horizontalTitle} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToArtist}>
                    <Text style={styles.horizontalArtist} numberOfLines={1}>{item.primaryArtists}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderSongItem = ({ item, index }: { item: Song | TrackData, index: number }) => {
        const title = 'name' in item ? item.name : item.title;
        const artist = 'primaryArtists' in item ? item.primaryArtists : item.artist;
        const artistIdRaw = 'primaryArtistsId' in item ? item.primaryArtistsId : (item as any).artistId;
        const artistId = (artistIdRaw || '').split(',')[0].trim();
        const artwork = 'image' in item ? getArtworkUrl(item.image) : item.artwork;

        const navigateToArtist = () => {
            if (artistId) {
                navigation.navigate('ArtistProfile', {
                    artistId,
                    artistName: (artist || '').split(',')[0].trim() || 'Artist'
                });
            }
        };

        return (
            <TouchableOpacity
                style={styles.songCard}
                onPress={() => playSong(item)}
                activeOpacity={0.7}
                key={`${item.id}-${index}`}
            >
                <Image source={{ uri: artwork }} style={styles.albumArt} />
                <View style={styles.songInfo}>
                    <Text style={styles.songName} numberOfLines={1}>{title}</Text>
                    <TouchableOpacity onPress={navigateToArtist}>
                        <Text style={styles.artistName} numberOfLines={1}>{artist}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Play size={18} color="#1DB954" fill="#1DB954" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Evening</Text>
                        <Text style={styles.title}>Browse Music</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <View style={styles.profilePlaceholder} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Search size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search songs, artists..."
                            placeholderTextColor="#666"
                            value={query}
                            onChangeText={handleSearch}
                        />
                    </View>
                </View>

                {query.length > 2 ? (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={({ item, index }) => renderSongItem({ item, index })}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={loading ? <ActivityIndicator color="#1DB954" style={{ margin: 20 }} /> : null}
                    />
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {recentPlays.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Clock size={20} color="#1DB954" />
                                    <Text style={styles.sectionTitle}>Recently Played</Text>
                                </View>
                                <FlatList
                                    horizontal
                                    data={recentPlays}
                                    keyExtractor={(item, index) => `recent-${item.id}-${index}`}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.horizontalCard}
                                            onPress={() => playSong(item)}
                                        >
                                            <Image source={{ uri: item.artwork }} style={styles.horizontalArt} />
                                            <Text style={styles.horizontalTitle} numberOfLines={1}>{item.title}</Text>
                                        </TouchableOpacity>
                                    )}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                        )}

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Compass size={20} color="#1DB954" />
                                <Text style={styles.sectionTitle}>Trending Now</Text>
                            </View>
                            <FlatList
                                horizontal
                                data={trending}
                                keyExtractor={(item, index) => `trending-${item.id}-${index}`}
                                renderItem={renderHorizontalItem}
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Music size={20} color="#1DB954" />
                                <Text style={styles.sectionTitle}>New Releases</Text>
                            </View>
                            <View style={{ paddingHorizontal: 20 }}>
                                {newReleases.map((item, index) => renderSongItem({ item, index }))}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>

            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    greeting: {
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    profilePlaceholder: {
        flex: 1,
        backgroundColor: '#1DB954',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginVertical: 15,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    horizontalCard: {
        width: 140,
        marginLeft: 20,
    },
    horizontalArt: {
        width: 140,
        height: 140,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#222',
    },
    horizontalTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    horizontalArtist: {
        color: '#999',
        fontSize: 12,
    },
    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        padding: 8,
    },
    albumArt: {
        width: 56,
        height: 56,
        borderRadius: 8,
        backgroundColor: '#222',
    },
    songInfo: {
        flex: 1,
        marginLeft: 15,
    },
    songName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    artistName: {
        color: '#999',
        fontSize: 14,
    },
    moreButton: {
        padding: 10,
    }
});

export default HomeScreen;
