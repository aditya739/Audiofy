import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Download } from 'lucide-react-native';
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
    isDownloaded: boolean;
    onToggleDownload: () => void;
}

const PlayerControls = ({
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    shuffle,
    onToggleShuffle,
    repeatMode,
    onCycleRepeat,
    isDownloaded,
    onToggleDownload
}: PlayerControlsProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
    };

    return (
        <View style={styles.container}>
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

            <View style={styles.secondaryControls}>
                <TouchableOpacity
                    onPress={onToggleDownload}
                    style={[styles.downloadBtn, isDownloaded && styles.downloadedBtn]}
                >
                    <Download size={20} color={isDownloaded ? '#1DB954' : colors.text} />
                    <Text style={[styles.downloadText, { color: isDownloaded ? '#1DB954' : colors.text }]}>
                        {isDownloaded ? 'Downloaded' : 'Download'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    secondaryControls: {
        marginTop: 20,
        alignItems: 'center',
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#888',
    },
    downloadedBtn: {
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
    },
    downloadText: {
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default PlayerControls;
