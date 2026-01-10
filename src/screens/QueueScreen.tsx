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
    const { queue, removeFromQueue, currentTrack, setCurrentTrack, setIsPlaying, clearQueue } = usePlayerStore();

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
            <View style={[styles.item, isActive && styles.activeItem]}>
                <View style={styles.grip}>
                    <GripVertical size={20} color="#333" />
                </View>
                <TouchableOpacity
                    style={styles.itemContent}
                    onPress={() => playFromQueue(item)}
                >
                    <Image source={{ uri: item.artwork }} style={styles.art} />
                    <View style={styles.info}>
                        <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeTrack(item.id)} style={styles.removeBtn}>
                    <Trash2 size={20} color={isActive ? '#1DB954' : '#666'} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#1a1a1a', '#000']}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronDown size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Playing Queue</Text>
                    <TouchableOpacity onPress={clearQueue}>
                        <Text style={styles.clearBtn}>Clear</Text>
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
                            <Text style={styles.emptyText}>Your queue is empty</Text>
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
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearBtn: {
        color: '#1DB954',
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
    },
    activeItem: {
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
        borderColor: 'rgba(29, 185, 84, 0.3)',
        borderWidth: 1,
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
        backgroundColor: '#222',
    },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    activeText: {
        color: '#1DB954',
    },
    artist: {
        color: '#999',
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
        color: '#666',
        fontSize: 16,
    }
});

export default QueueScreen;
