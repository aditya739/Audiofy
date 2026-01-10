import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, ChevronRight } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Song } from '../../types';

interface SearchListItemProps {
    item: any;
    type: 'song' | 'artist';
    onPress: (item: any) => void;
}

const SearchListItem = ({ item, type, onPress }: SearchListItemProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        border: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#e0e0e0',
        accent: '#1ED760',
    };

    if (type === 'song') {
        const songItem = item as Song;
        const imageUrl = songItem.image?.[songItem.image.length - 1]?.url || 'https://via.placeholder.com/150';
        return (
            <TouchableOpacity
                style={[styles.itemCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                onPress={() => onPress(item)}
            >
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{songItem.name}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSub }]} numberOfLines={1}>
                        {songItem.primaryArtists || 'Unknown Artist'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.playBtn} onPress={() => onPress(item)}>
                    <Play size={20} color={colors.accent} fill={colors.accent} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    } else {
        // Artist
        const imageUrl = item.image?.[item.image.length - 1]?.url || 'https://via.placeholder.com/150';
        return (
            <TouchableOpacity
                style={[styles.itemCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                onPress={() => onPress(item)}
            >
                <Image source={{ uri: imageUrl }} style={[styles.image, styles.artistImage]} />
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.subtitle, { color: colors.textSub }]}>Artist</Text>
                </View>
                <ChevronRight size={20} color={colors.textSub} />
            </TouchableOpacity>
        );
    }
};

const styles = StyleSheet.create({
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    image: { width: 55, height: 55, borderRadius: 10 },
    artistImage: { borderRadius: 30, width: 60, height: 60 },
    info: { flex: 1, marginLeft: 15, marginRight: 10 },
    title: { fontSize: 16, fontWeight: '600' },
    subtitle: { fontSize: 14, marginTop: 4 },
    playBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
});

export default SearchListItem;
