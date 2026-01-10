import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { TrackData } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SongInfoProps {
    track: TrackData;
    isFav: boolean;
    onToggleFav: () => void;
    onArtistPress: () => void;
}

const SongInfo = ({ track, isFav, onToggleFav, onArtistPress }: SongInfoProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
    };

    return (
        <View style={styles.trackInfo}>
            <View style={styles.titleWrap}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{track.title}</Text>
                <TouchableOpacity onPress={onArtistPress}>
                    <Text style={[styles.artist, { color: colors.textSub }]} numberOfLines={1}>{track.artist}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onToggleFav}>
                <Heart size={28} color={colors.accent} fill={isFav ? colors.accent : "transparent"} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    trackInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    titleWrap: {
        flex: 1,
        marginRight: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    artist: {
        fontSize: 18,
        marginTop: 4,
        fontWeight: '500',
    },
});

export default SongInfo;
