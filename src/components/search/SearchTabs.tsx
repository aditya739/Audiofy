import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SearchTabsProps {
    activeTab: 'all' | 'songs' | 'artists';
    setActiveTab: (tab: 'all' | 'songs' | 'artists') => void;
}

const SearchTabs = ({ activeTab, setActiveTab }: SearchTabsProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        tabBg: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        textSub: theme === 'dark' ? '#888' : '#666',
    };

    const tabs: ('all' | 'songs' | 'artists')[] = ['all', 'songs', 'artists'];

    return (
        <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.tab,
                        { backgroundColor: colors.tabBg },
                        activeTab === tab && styles.activeTab
                    ]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[
                        styles.tabText,
                        { color: colors.textSub },
                        activeTab === tab && styles.activeTabText
                    ]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    tabsContainer: { flexDirection: 'row', marginTop: 20, gap: 10 },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    activeTab: { backgroundColor: '#1ED760' },
    tabText: { fontSize: 14, fontWeight: '600' },
    activeTabText: { color: '#000' },
});

export default SearchTabs;
