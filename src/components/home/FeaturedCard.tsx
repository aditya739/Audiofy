import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Song, TrackData } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';

interface FeaturedCardProps {
    item: Song | null;
    onPlay: (song: Song) => void;
}

const FeaturedCard = ({ item, onPlay }: FeaturedCardProps) => {
    const { theme } = usePlayerStore();

    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSecondary: theme === 'dark' ? '#ccc' : '#555',
    };

    if (!item) return null;

    const artistName = (item.primaryArtists || 'Top Artists').toString().split(',')[0];
    const imageUrl = item.image[item.image.length - 1].url;

    return (
        <View style={styles.featuredContainer}>
            <LinearGradient
                colors={theme === 'dark' ? ['#2c3e50', '#1a1a1a'] : ['#4A90E2', '#E8F4F8']}
                style={styles.featuredCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.featuredContent}>
                    <View style={styles.featuredInfo}>
                        <Text style={[styles.featuredTitle, { color: colors.text }]} numberOfLines={2}>
                            {item.name || 'Fresh Hits'}
                        </Text>
                        <Text style={[styles.featuredArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                            {artistName}
                        </Text>
                        <TouchableOpacity
                            style={[styles.playNowBtn, { backgroundColor: theme === 'dark' ? '#fff' : '#000' }]}
                            onPress={() => onPlay(item)}
                        >
                            <Text style={[styles.playNowText, { color: theme === 'dark' ? '#000' : '#fff' }]}>Listen Now</Text>
                        </TouchableOpacity>
                    </View>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.featuredImage}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    featuredContainer: { paddingHorizontal: 20, marginBottom: 30 },
    featuredCard: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#1ED760',
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    featuredContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        minHeight: 160,
    },
    featuredInfo: { flex: 1, marginRight: 15, justifyContent: 'center' },
    featuredTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    featuredArtist: { fontSize: 13, marginBottom: 12 },
    playNowBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
    playNowText: { fontSize: 12, fontWeight: 'bold' },
    featuredImage: { width: 100, height: 100, borderRadius: 12 },
});

export default FeaturedCard;
