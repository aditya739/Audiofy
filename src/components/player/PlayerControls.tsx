import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../../store/usePlayerStore';

interface PlayerControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNext: () => void;
    onPrev: () => void;
    shuffle: boolean;
    onToggleShuffle: () => void;
    repeatMode: 'off' | 'track' | 'queue';
    onCycleRepeat: () => void;
}

const PlayerControls = ({
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    shuffle,
    onToggleShuffle,
    repeatMode,
    onCycleRepeat
}: PlayerControlsProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
    };

    return (
        <View style={styles.controls}>
            <TouchableOpacity onPress={onToggleShuffle}>
                <Shuffle size={24} color={shuffle ? colors.accent : colors.textSub} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onPrev}>
                <SkipBack size={36} color={colors.text} fill={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onTogglePlay} style={styles.playButton}>
                <LinearGradient
                    colors={['#1ed760', '#1db954']}
                    style={styles.playGradient}
                >
                    {isPlaying ? (
                        <Pause size={32} color="#000" fill="#000" />
                    ) : (
                        <Play size={32} color="#000" fill="#000" style={{ marginLeft: 4 }} />
                    )}
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNext}>
                <SkipForward size={36} color={colors.text} fill={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onCycleRepeat}>
                <Repeat size={24} color={repeatMode !== 'off' ? colors.accent : colors.textSub} />
                {repeatMode === 'track' && <View style={styles.repeatBadge}><Text style={styles.repeatBadgeText}>1</Text></View>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    playButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        shadowColor: '#1DB954',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    playGradient: {
        flex: 1,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    repeatBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#1ED760',
        width: 14,
        height: 14,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    repeatBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default PlayerControls;
