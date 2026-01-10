import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface AlbumArtProps {
    artwork: string;
}

const AlbumArt = ({ artwork }: AlbumArtProps) => {
    return (
        <View style={styles.artContainer}>
            <Image source={{ uri: artwork }} style={styles.artwork} />
        </View>
    );
};

const styles = StyleSheet.create({
    artContainer: {
        width: width - 60,
        height: width - 60,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        marginTop: 20,
        alignSelf: 'center',
    },
    artwork: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
});

export default AlbumArt;
