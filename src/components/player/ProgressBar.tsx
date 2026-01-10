import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../../store/usePlayerStore';

interface ProgressBarProps {
    position: number;
    duration: number;
    onSeek: (value: number) => void;
}

const ProgressBar = ({ position, duration, onSeek }: ProgressBarProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.progressSection}>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration || 100}
                value={position}
                minimumTrackTintColor={colors.accent}
                maximumTrackTintColor={theme === 'dark' ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                thumbTintColor={colors.text}
                onSlidingComplete={onSeek}
            />
            <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: colors.textSub }]}>{formatTime(position)}</Text>
                <Text style={[styles.timeText, { color: colors.textSub }]}>{formatTime(duration)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    progressSection: {
        marginTop: 30,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default ProgressBar;
