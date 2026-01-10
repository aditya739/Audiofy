import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    onSubmit: () => void;
}

const SearchBar = ({ value, onChangeText, onClear, onSubmit }: SearchBarProps) => {
    const { theme } = usePlayerStore();
    const colors = {
        text: theme === 'dark' ? '#fff' : '#000',
        inputBg: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        placeholder: theme === 'dark' ? '#888' : '#aaa',
        border: theme === 'dark' ? '#333' : '#e0e0e0',
    };

    return (
        <View style={[styles.searchBarContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <SearchIcon size={20} color={colors.placeholder} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="What do you want to listen to?"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                    <X size={18} color={colors.text} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16 },
    clearBtn: { padding: 5 },
});

export default SearchBar;
