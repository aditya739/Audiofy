import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Song, TrackData } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';

interface HorizontalSongListProps {
    data: Song[] | TrackData[];
    onPlay: (item: Song | TrackData) => void;
    variant: 'recent' | 'trending';
}

const HorizontalSongList = ({ data, onPlay, variant }: HorizontalSongListProps) => {
    const { theme } = usePlayerStore();

    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {data.map((item, index) => {
                // Type guard or assuming structure
                const image = 'image' in item
                    ? item.image[item.image.length - 1].url
                    : item.artwork;

                const title = 'name' in item ? item.name : item.title;
                const artist = 'primaryArtists' in item
                    ? (item.primaryArtists || 'Artist').toString().split(',')[0]
                    : item.artist;

                if (variant === 'recent') {
                    return (
                        <TouchableOpacity
                            key={`${item.id}-${index}`}
                            style={styles.recentItem}
                            onPress={() => onPlay(item)}
                        >
                            <Image source={{ uri: image }} style={styles.recentImage} />
                            <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                            <Text style={[styles.recentArtist, { color: colors.textSub }]} numberOfLines={1}>{artist}</Text>
                        </TouchableOpacity>
                    );
                } else {
                    return (
                        <TouchableOpacity
                            key={`${item.id}-${index}`}
                            style={[styles.trendingCard, { backgroundColor: colors.card }]}
                            onPress={() => onPlay(item)}
                        >
                            <Image source={{ uri: image }} style={styles.trendingImage} />
                            <View style={styles.trendingInfo}>
                                <Text style={[styles.trendingTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                                <Text style={[styles.trendingArtist, { color: colors.textSub }]} numberOfLines={1}>{artist}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    horizontalScroll: { paddingLeft: 20 },
    // Recent specific
    recentItem: { width: 120, marginRight: 15 },
    recentImage: { width: 120, height: 120, borderRadius: 15, marginBottom: 8 },
    recentTitle: { fontSize: 14, fontWeight: '600' },
    recentArtist: { fontSize: 12 },
    // Trending specific
    trendingCard: { width: 220, marginRight: 15, borderRadius: 15, overflow: 'hidden' },
    trendingImage: { width: 220, height: 130 },
    trendingInfo: { padding: 12 },
    trendingTitle: { fontSize: 15, fontWeight: 'bold' },
    trendingArtist: { fontSize: 12, marginTop: 2 },
});

export default HorizontalSongList;
