import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Song } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';

interface ArtistListProps {
    data: Song[];
    navigation: any;
}

const ArtistList = ({ data, navigation }: ArtistListProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    };

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {data.slice(0, 8).map((item, index) => {
                const artist = item.artists?.primary?.[0];
                const artistName = artist?.name || (item.primaryArtists || 'Artist').toString().split(',')[0];
                const artistId = (item.primaryArtistsId || '').toString().split(',')[0];

                let artistImage = item.image[item.image.length - 1].url;
                if (artist?.image && artist.image.length > 0) {
                    artistImage = artist.image[artist.image.length - 1].url;
                }

                return (
                    <TouchableOpacity
                        key={`artist-${item.id}-${index}`}
                        style={styles.artistItem}
                        onPress={() => navigation.navigate('ArtistProfile', {
                            artistId,
                            artistName
                        })}
                    >
                        <View style={[styles.artistCircle, { borderColor: colors.card }]}>
                            <Image source={{ uri: artistImage }} style={styles.artistImage} />
                        </View>
                        <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{artistName}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    horizontalScroll: { paddingLeft: 20 },
    artistItem: { alignItems: 'center', marginRight: 20, width: 90 },
    artistCircle: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', borderWidth: 2, marginBottom: 8 },
    artistImage: { width: '100%', height: '100%' },
    artistName: { fontSize: 12, fontWeight: '600', textAlign: 'center' }
});

export default ArtistList;
