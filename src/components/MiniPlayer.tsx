import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Pause, SkipForward, Music2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import { useSafeProgress } from '../hooks/usePlayer';

const { width } = Dimensions.get('window');

const MiniPlayer = ({ navigation }: any) => {
    const { currentTrack, isPlaying, setIsPlaying, theme } = usePlayerStore();
    const progress = useSafeProgress();

    if (!currentTrack) return null;

    const colors = {
        bg: theme === 'dark' ? '#1a1a1a' : '#f8f8f8',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        progressBg: theme === 'dark' ? '#333' : '#ddd',
    };

    const togglePlayback = async () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);
        await musicPlayer.toggle(isPlaying);
    };

    const handleNext = async () => {
        const { queue, currentTrack, setCurrentTrack, setIsPlaying, addToRecentPlays, shuffle } = usePlayerStore.getState();
        if (queue.length === 0 || !currentTrack) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        let nextTrack;

        if (shuffle) {
            const randomIndex = Math.floor(Math.random() * queue.length);
            nextTrack = queue[randomIndex];
        } else {
            const nextIndex = (currentIndex + 1) % queue.length;
            nextTrack = queue[nextIndex];
        }

        if (nextTrack) {
            setCurrentTrack(nextTrack);
            addToRecentPlays(nextTrack);
            setIsPlaying(true);
            await musicPlayer.play(nextTrack);
        }
    };

    return (
        <View style={styles.outerContainer}>
            <TouchableOpacity
                style={[styles.container, { backgroundColor: colors.bg }]}
                activeOpacity={1}
                onPress={() => navigation.navigate('Player')}
            >
                {/* Progress Bar */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.progressBg }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${(progress.position / progress.duration) * 100 || 0}%`,
                                backgroundColor: colors.accent,
                            },
                        ]}
                    />
                </View>

                <View style={styles.content}>
                    {/* Album Art */}
                    {currentTrack.artwork ? (
                        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
                    ) : (
                        <View style={[styles.placeholderArt, { backgroundColor: colors.progressBg }]}>
                            <Music2 size={20} color={colors.textSub} />
                        </View>
                    )}

                    {/* Track Info */}
                    <View style={styles.info}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {currentTrack.title}
                        </Text>
                        <Text style={[styles.artist, { color: colors.textSub }]} numberOfLines={1}>
                            {currentTrack.artist}
                        </Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                            {isPlaying ? (
                                <Pause size={28} color={colors.text} fill={colors.text} />
                            ) : (
                                <Play size={28} color={colors.text} fill={colors.text} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                            <SkipForward size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 95, // Above Custom Tab Bar (85 height + 10 gap)
        width: width - 20,
        marginHorizontal: 10,
        height: 60,
        zIndex: 1000,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    artwork: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    artistRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    artist: {
        fontSize: 12,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        padding: 5,
        marginRight: 10,
    },
    nextButton: {
        padding: 5,
    },
    progressBarBg: {
        height: 2,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
    },
    placeholderArt: {
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MiniPlayer;
