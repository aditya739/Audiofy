import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, User, Bell, Shield, Info, LogOut, Music, Moon } from 'lucide-react-native';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store/usePlayerStore';

const SettingsScreen = ({ navigation }: any) => {
    const { theme, toggleTheme } = usePlayerStore();

    const colors = {
        bg: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        text: theme === 'dark' ? '#fff' : '#000',
        textSub: theme === 'dark' ? '#888' : '#666',
        accent: '#1ED760',
        card: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        border: theme === 'dark' ? '#333' : '#e0e0e0',
        iconBg: 'rgba(30, 215, 96, 0.1)',
        groupTitle: theme === 'dark' ? '#666' : '#888',
    };

    const SettingItem = ({ icon: Icon, title, subtitle, isSwitch = false, value, onValueChange, showArrow = true }: any) => (
        <TouchableOpacity style={[styles.item, { backgroundColor: colors.card }]} activeOpacity={0.7} disabled={isSwitch}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
                <Icon size={22} color={colors.accent} />
            </View>
            <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.subtitle, { color: colors.textSub }]}>{subtitle}</Text>}
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#333', true: colors.accent }}
                    thumbColor="#fff"
                />
            ) : showArrow ? (
                <ChevronRight size={20} color={colors.textSub} />
            ) : null}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <SafeAreaView style={styles.safeArea}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
                        <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                            <User size={30} color={colors.textSub} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.text }]}>Guest User</Text>
                            <Text style={styles.profileSub}>Premium Member</Text>
                        </View>
                        <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.border }]}>
                            <Text style={[styles.editBtnText, { color: colors.text }]}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.group}>
                        <Text style={[styles.groupTitle, { color: colors.groupTitle }]}>Appearance</Text>
                        <SettingItem
                            icon={Moon}
                            title="Dark Mode"
                            isSwitch={true}
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                        />
                    </View>

                    <View style={styles.group}>
                        <Text style={[styles.groupTitle, { color: colors.groupTitle }]}>Account</Text>
                        <SettingItem icon={User} title="Personal Information" />
                        <SettingItem icon={Shield} title="Security" subtitle="Password, Biometrics" />
                    </View>

                    <View style={styles.group}>
                        <Text style={[styles.groupTitle, { color: colors.groupTitle }]}>Streaming</Text>
                        <SettingItem icon={Music} title="Audio Quality" subtitle="Very High" />
                        <SettingItem icon={Bell} title="Notifications" isSwitch={true} value={true} />
                    </View>

                    <View style={styles.group}>
                        <Text style={[styles.groupTitle, { color: colors.groupTitle }]}>General</Text>
                        <SettingItem icon={Info} title="About Mume" />
                        <SettingItem icon={LogOut} title="Log Out" showArrow={false} />
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.version, { color: colors.border }]}>Version 1.2.0</Text>
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
    headerTitle: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    scrollContent: { paddingBottom: 150 },
    profileSection: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 20, borderRadius: 20, marginBottom: 30 },
    avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    profileInfo: { flex: 1, marginLeft: 15 },
    profileName: { fontSize: 18, fontWeight: 'bold' },
    profileSub: { color: '#1ED760', fontSize: 12, marginTop: 4, fontWeight: '600' },
    editBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
    editBtnText: { fontSize: 12, fontWeight: '600' },
    group: { marginBottom: 30, paddingHorizontal: 20 },
    groupTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10 },
    iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, marginLeft: 15 },
    title: { fontSize: 16, fontWeight: '600' },
    subtitle: { fontSize: 12, marginTop: 2 },
    footer: { alignItems: 'center', marginTop: 10 },
    version: { fontSize: 12 }
});

export default SettingsScreen;
