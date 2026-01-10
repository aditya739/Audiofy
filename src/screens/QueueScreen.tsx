import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Trash2, GripVertical } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import { TrackData } from '../types';

const QueueScreen = ({ navigation }: any) => {
    const { queue, removeFromQueue, currentTrack, setCurrentTrack, setIsPlaying, clearQueue, theme } = usePlayerStore();

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        activeCard: theme === 'dark' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(30, 215, 96, 0.1)',
        activeText: theme === 'dark' ? '#1ED760' : '#1ED760',
    };

    const playFromQueue = async (track: TrackData) => {
        setCurrentTrack(track);
        setIsPlaying(true);
        await musicPlayer.play(track);
    };

    const removeTrack = (id: string) => {
        removeFromQueue(id);
    };

    const renderItem = ({ item }: { item: TrackData }) => {
        const isActive = item.id === currentTrack?.id;
        return (
            <View style={[styles.item, { backgroundColor: colors.card }, isActive && { backgroundColor: colors.activeCard, borderColor: colors.accent, borderWidth: 1 }]}>
                <View style={styles.grip}>
                    <GripVertical size={20} color={colors.textSub} />
                </View>
                <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => playFromQueue(item)}
                >
                    <Image source={{ uri: item.artwork }} style={styles.art} />
                    <View style={styles.info}>
                        <Text style={[styles.title, { color: isActive ? colors.activeText : colors.text }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.artist, { color: colors.textSub }]} numberOfLines={1}>{item.artist}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTrack(item.id)} style={styles.removeBtn}>
                    <Trash2 size={20} color={isActive ? colors.accent : colors.textSub} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronDown size={30} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Playing Queue</Text>
                    <TouchableOpacity onPress={clearQueue}>
                        <Text style={[styles.clearBtn, { color: colors.accent }]}>Clear</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={queue}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSub }]}>Your queue is empty</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearBtn: {
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
        borderRadius: 12,
    },
    grip: {
        paddingHorizontal: 10,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    art: {
        width: 48,
        height: 48,
        borderRadius: 6,
    },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    artist: {
        fontSize: 14,
        marginTop: 2,
    },
    removeBtn: {
        padding: 15,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
    }
});

export default QueueScreen;
