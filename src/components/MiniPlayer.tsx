import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '../store/usePlayerStore';
import { musicPlayer } from '../services/MusicPlayer';
import { useSafePlaybackState, useSafeProgress } from '../hooks/usePlayer';

const { width } = Dimensions.get('window');

const MiniPlayer = ({ navigation }: any) => {
    const { currentTrack, isPlaying, setIsPlaying } = usePlayerStore();
    const progress = useSafeProgress();

    if (!currentTrack) return null;

    const togglePlayback = async () => {
        const nextState = !isPlaying;
        setIsPlaying(nextState);
        await musicPlayer.toggle(isPlaying);
    };

    const handleNext = async () => {
        // Skip next logic
    };

    return (
        <TouchableOpacity
            style={styles.outerContainer}
            activeOpacity={1}
            onPress={() => navigation.navigate('Player')}
        >
            <LinearGradient
                colors={['#1c1c1e', '#000']}
                style={styles.container}
            >
                <View style={[
                    styles.progressBar,
                    { width: `${(progress.position / (progress.duration || 1)) * 100}%` }
                ]} />

                <View style={styles.content}>
                    <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
                    </View>
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={togglePlayback} style={styles.controlBtn}>
                            {isPlaying ? (
                                <Pause size={24} color="#fff" fill="#fff" />
                            ) : (
                                <Play size={24} color="#fff" fill="#fff" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNext} style={styles.controlBtn}>
                            <SkipForward size={24} color="#fff" fill="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: 70,
        zIndex: 1000,
    },
    container: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 2,
        backgroundColor: '#1DB954',
        zIndex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    artwork: {
        width: 44,
        height: 44,
        borderRadius: 6,
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
    artist: {
        color: '#1DB954',
        fontSize: 12,
        marginTop: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlBtn: {
        padding: 10,
    }
});

export default MiniPlayer;
