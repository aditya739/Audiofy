import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ListMusic, ChevronRight } from 'lucide-react-native';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store/usePlayerStore';

const PlaylistsScreen = ({ navigation }: any) => {
    const { theme } = usePlayerStore();

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        cardInner: theme === 'dark' ? '#333' : '#e0e0e0',
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Playlists</Text>
                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.card }]}>
                        <Plus size={24} color={colors.accent} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity style={[styles.createCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.plusContainer, { backgroundColor: colors.cardInner }]}>
                            <Plus size={30} color={colors.text} />
                        </View>
                        <View style={styles.createInfo}>
                            <Text style={[styles.createTitle, { color: colors.text }]}>Create New Playlist</Text>
                            <Text style={[styles.createSub, { color: colors.textSub }]}>Save your favorite tracks</Text>
                        </View>
                        <ChevronRight size={20} color={colors.textSub} />
                    </TouchableOpacity>

                    <View style={styles.emptyContainer}>
                        <ListMusic size={80} color={colors.card} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No playlists yet</Text>
                        <Text style={[styles.emptySub, { color: colors.textSub }]}>Start curating your unique vibe</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <MiniPlayer navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 25 },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    addBtn: { width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 150 },
    createCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 40 },
    plusContainer: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    createInfo: { flex: 1, marginLeft: 15 },
    createTitle: { fontSize: 16, fontWeight: 'bold' },
    createSub: { fontSize: 13, marginTop: 4 },
    emptyContainer: { flex: 1, alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 20, fontWeight: 'bold', marginTop: 30 },
    emptySub: { fontSize: 14, marginTop: 10, textAlign: 'center' }
});

export default PlaylistsScreen;
