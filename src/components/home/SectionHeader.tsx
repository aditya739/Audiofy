import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SectionHeaderProps {
    title: string;
    rightElement?: React.ReactNode;
}

const SectionHeader = ({ title, rightElement }: SectionHeaderProps) => {
    const { theme } = usePlayerStore();
    const textColor = theme === 'dark' ? '#fff' : '#000';

    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
            {rightElement}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
});

export default SectionHeader;
