import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Home as HomeIcon, Search as SearchIcon, Heart, Settings, ListMusic } from 'lucide-react-native';
import { usePlayerStore } from '../store/usePlayerStore';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';
import ArtistProfileScreen from '../screens/ArtistProfileScreen';

export type RootStackParamList = {
    MainTabs: undefined;
    Player: undefined;
    Queue: undefined;
    ArtistProfile: { artistId: string; artistName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const theme = usePlayerStore((state) => state.theme);

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        tabBg: theme === 'dark' ? '#1a1a1a' : '#f8f8f8',
        border: theme === 'dark' ? '#333' : '#e0e0e0',
        text: theme === 'dark' ? '#fff' : '#000',
        textInactive: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
    };

    return (
        <View style={[styles.tabBarContainer, { backgroundColor: colors.bg }]}>
            <View style={[styles.tabBar, { backgroundColor: colors.tabBg, borderTopColor: colors.border }]}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel || route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const Icon = options.tabBarIcon;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Icon color={isFocused ? colors.accent : colors.textInactive} size={24} />
                            <Text style={[
                                styles.tabLabel,
                                { color: isFocused ? colors.accent : colors.textInactive }
                            ]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarIcon: (props: any) => <HomeIcon {...props} /> }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{ tabBarIcon: (props: any) => <SearchIcon {...props} /> }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ tabBarIcon: (props: any) => <Heart {...props} /> }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ tabBarIcon: (props: any) => <Settings {...props} /> }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen
                    name="Player"
                    component={PlayerScreen}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="Queue" component={QueueScreen} />
                <Stack.Screen name="ArtistProfile" component={ArtistProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    tabBar: {
        flexDirection: 'row',
        height: 85,
        borderTopWidth: 1,
        paddingBottom: 25,
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        padding: 5,
        borderRadius: 12,
        marginBottom: 4,
    },
    activeIconContainer: {
        backgroundColor: 'rgba(30, 215, 96, 0.1)',
    },
    tabLabel: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
    },
});

export default AppNavigator;
