import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import MiniPlayer from '../components/MiniPlayer';
import { Play, Heart, Trash2, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FavoritesScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState<'favorites' | 'downloads'>('favorites');
    const { favorites, downloadedSongs, setCurrentTrack, setIsPlaying, toggleFavorite, toggleDownload, theme } = usePlayerStore();

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        tabActive: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    };

    const playSong = async (track: any) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => playSong(item)}>
            <Image source={{ uri: item.artwork }} style={styles.art} />
            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.artist, { color: colors.textSub }]} numberOfLines={1}>{item.artist}</Text>
            </View>
            <View style={styles.actions}>
                {activeTab === 'favorites' ? (
                    <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.actionBtn}>
                        <Heart size={20} color={colors.accent} fill={colors.accent} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => toggleDownload(item)} style={styles.actionBtn}>
                        <Trash2 size={20} color="#ff4d4d" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => playSong(item)} style={styles.playBtn}>
                    <Play size={18} color="#000" fill="#000" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const data = activeTab === 'favorites' ? favorites : (downloadedSongs || []);

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {theme === 'dark' && (
                <LinearGradient colors={['#1e3c72', colors.bg]} style={styles.topGradient} />
            )}
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>My Library</Text>

                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'favorites' && { backgroundColor: colors.tabActive, borderColor: colors.accent }
                            ]}
                            onPress={() => setActiveTab('favorites')}
                        >
                            <Heart size={16} color={activeTab === 'favorites' ? colors.accent : colors.textSub} style={{ marginRight: 8 }} />
                            <Text style={[styles.tabText, { color: activeTab === 'favorites' ? colors.text : colors.textSub }]}>Favorites</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'downloads' && { backgroundColor: colors.tabActive, borderColor: colors.accent }
                            ]}
                            onPress={() => setActiveTab('downloads')}
                        >
                            <Download size={16} color={activeTab === 'downloads' ? colors.accent : colors.textSub} style={{ marginRight: 8 }} />
                            <Text style={[styles.tabText, { color: activeTab === 'downloads' ? colors.text : colors.textSub }]}>Downloads</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.stats, { color: colors.textSub }]}>{data.length} songs</Text>
                </View>

                {data.length === 0 ? (
                    <View style={styles.empty}>
                        {activeTab === 'favorites' ? (
                            <Heart size={80} color={colors.card} />
                        ) : (
                            <Download size={80} color={colors.card} />
                        )}
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            {activeTab === 'favorites' ? 'Your favorites list is empty' : 'No downloaded songs'}
                        </Text>
                        <Text style={[styles.emptySub, { color: colors.textSub }]}>
                            {activeTab === 'favorites' ? 'Add songs you love to see them here' : 'Download songs to play them offline'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.browseBtn, { backgroundColor: colors.text }]}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={[styles.browseText, { color: colors.bg }]}>Browse Songs</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 250, opacity: 0.3 },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    tabs: { flexDirection: 'row', marginBottom: 15 },
    tab: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
    tabText: { fontWeight: '600', fontSize: 14 },
    stats: { fontSize: 14, marginTop: 5 },
    listContent: { paddingHorizontal: 20, paddingBottom: 150 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, marginBottom: 15 },
    art: { width: 55, height: 55, borderRadius: 10 },
    info: { flex: 1, marginLeft: 15 },
    name: { fontSize: 16, fontWeight: 'bold' },
    artist: { fontSize: 13, marginTop: 4 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { padding: 10 },
    playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1ED760', justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 30 },
    emptySub: { fontSize: 14, marginTop: 10, textAlign: 'center' },
    browseBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    browseText: { fontWeight: 'bold' }
});

export default FavoritesScreen;
