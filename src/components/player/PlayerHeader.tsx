import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ListMusic } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';

interface PlayerHeaderProps {
    navigation: any;
    album: string;
}

const PlayerHeader = ({ navigation, album }: PlayerHeaderProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <ChevronDown size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
                <Text style={[styles.headerLabel, { color: colors.textSub }]}>PLAYING FROM ALBUM</Text>
                <Text style={[styles.headerValue, { color: colors.text }]} numberOfLines={1}>{album}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Queue')} style={styles.headerButton}>
                <ListMusic size={24} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    headerButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    headerValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PlayerHeader;
