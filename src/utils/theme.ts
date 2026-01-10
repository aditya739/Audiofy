export const getThemeColors = (theme: 'dark' | 'light') => ({
    bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
    bgSecondary: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    text: theme === 'dark' ? '#ffffff' : '#000000',
    textSecondary: theme === 'dark' ? '#888888' : '#666666',
    textTertiary: theme === 'dark' ? '#666666' : '#999999',
    card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    cardBorder: theme === 'dark' ? '#333333' : '#e0e0e0',
    accent: '#1ED760',
    accentLight: 'rgba(30, 215, 96, 0.1)',
    border: theme === 'dark' ? '#333333' : '#e0e0e0',
    shadow: theme === 'dark' ? '#000000' : '#cccccc',
    overlay: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
});

export type ThemeColors = ReturnType<typeof getThemeColors>;
