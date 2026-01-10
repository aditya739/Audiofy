import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Music, Play } from 'lucide-react-native';
import { Song, TrackData } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SimilarSongsListProps {
    data: Song[];
    onPlay: (song: Song) => void;
}

const SimilarSongsList = ({ data, onPlay }: SimilarSongsListProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        card: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
        accent: '#1ED760',
    };

    const getImageUrl = (images: any[]) => {
        if (!images || images.length === 0) return '';
        const highRes = images[images.length - 1];
        return highRes?.link || highRes?.url || '';
    };

    return (
        <View style={styles.similarSection}>
            <View style={styles.similarHeader}>
                <Music size={18} color={colors.accent} />
                <Text style={[styles.similarTitle, { color: colors.text }]}>Similar Songs</Text>
            </View>
            <View style={styles.similarList}>
                {data.slice(0, 10).map((song, index) => (
                    <TouchableOpacity
                        key={`${song.id}-${index}`}
                        style={[styles.similarItem, { backgroundColor: colors.card }]}
                        onPress={() => onPlay(song)}
                    >
                        <Image source={{ uri: getImageUrl(song.image) }} style={styles.similarArt} />
                        <View style={styles.similarInfo}>
                            <Text style={[styles.similarName, { color: colors.text }]} numberOfLines={1}>{song.name}</Text>
                            <Text style={[styles.similarArtist, { color: colors.textSub }]} numberOfLines={1}>{song.primaryArtists}</Text>
                        </View>
                        <Play size={16} color={colors.accent} fill={colors.accent} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    similarSection: {
        marginTop: 40,
        marginBottom: 20,
    },
    similarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    similarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    similarList: {
        gap: 10,
    },
    similarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
    },
    similarArt: {
        width: 45,
        height: 45,
        borderRadius: 8,
    },
    similarInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 10,
    },
    similarName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    similarArtist: {
        fontSize: 12,
    },
});

export default SimilarSongsList;
