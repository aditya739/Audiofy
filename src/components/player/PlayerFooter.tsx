import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Download } from 'lucide-react-native';

interface PlayerFooterProps {
    isDownloaded: boolean;
    onToggleDownload: () => void;
}

const PlayerFooter = ({ isDownloaded, onToggleDownload }: PlayerFooterProps) => {
    return (
        <View style={styles.footerActions}>
            <TouchableOpacity
                onPress={onToggleDownload}
                style={[styles.footerButton, isDownloaded && styles.downloadActive]}
            >
                <Download size={22} color={isDownloaded ? '#1DB954' : '#fff'} />
                <Text style={[styles.footerButtonText, isDownloaded && styles.downloadActiveText]}>
                    {isDownloaded ? 'Downloaded' : 'Download'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footerActions: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    downloadActive: {
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.1)',
    },
    footerButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
    },
    downloadActiveText: {
        color: '#1DB954',
    },
});

export default PlayerFooter;
