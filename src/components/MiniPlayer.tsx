import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Pause, SkipForward, Music2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import { useSafeProgress } from '../hooks/usePlayer';
import Logger from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';

const logger = Logger.getInstance('MiniPlayer');
const { width } = Dimensions.get('window');

/**
 * MiniPlayer Component
 * Persistent mini player bar that stays at the bottom of the screen
 * Synced with the full PlayerScreen - shares the same state
 * 
 * Features:
 * - Shows current track info (artwork, title, artist)
 * - Real-time progress bar
 * - Play/Pause control
 * - Skip to next track
 * - Tap to open full player
 * - Synced with PlayerScreen via Zustand store
 */
const MiniPlayer = ({ navigation }: any) => {
    const { currentTrack, isPlaying, setIsPlaying, theme, playNext } = usePlayerStore();
    const progress = useSafeProgress();

    // Don't show mini player if no track is playing
    if (!currentTrack) {
        logger.debug('No current track, hiding mini player');
        return null;
    }

    const colors = {
        bg: theme === 'dark' ? '#1a1a1a' : '#f8f8f8',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        progressBg: theme === 'dark' ? '#333' : '#ddd',
    };

    const togglePlayback = async () => {
        logger.info('Toggle playback from mini player', {
            currentState: isPlaying ? 'playing' : 'paused'
        });

        try {
            const nextState = !isPlaying;
            setIsPlaying(nextState);
            await musicPlayer.toggle(isPlaying);

            logger.debug('Playback toggled successfully', {
                newState: nextState ? 'playing' : 'paused'
            });
        } catch (error) {
            logger.error('Failed to toggle playback', error);
            ErrorHandler.handle(error, 'MiniPlayer.togglePlayback');
        }
    };

    const handleNext = async () => {
        logger.info('Skip to next track from mini player');
        try {
            await playNext(false);
        } catch (error) {
            logger.error('Failed to skip to next track', error);
            ErrorHandler.handle(error, 'MiniPlayer.handleNext');
        }
    };

    const openFullPlayer = () => {
        logger.info('Opening full player screen');
        navigation.navigate('Player');
    };

    // Calculate progress percentage
    const progressPercentage = (progress.position / progress.duration) * 100 || 0;

    return (
        <View style={styles.outerContainer}>
            <TouchableOpacity
                style={[styles.container, { backgroundColor: colors.bg }]}
                activeOpacity={0.8}
                onPress={openFullPlayer}
            >
                {/* Progress Bar - Synced with PlayerScreen */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.progressBg }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${progressPercentage}%`,
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

                    {/* Track Info - Synced with PlayerScreen */}
                    <View style={styles.info}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                            {currentTrack.title}
                        </Text>
                        <Text style={[styles.artist, { color: colors.textSub }]} numberOfLines={1}>
                            {currentTrack.artist}
                        </Text>
                    </View>

                    {/* Controls - Synced with PlayerScreen */}
                    <View style={styles.controls}>
                        <TouchableOpacity
                            onPress={togglePlayback}
                            style={styles.playButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {isPlaying ? (
                                <Pause size={28} color={colors.text} fill={colors.text} />
                            ) : (
                                <Play size={28} color={colors.text} fill={colors.text} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleNext}
                            style={styles.nextButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
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

