import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useEvents } from './_layout';

const UserIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const SettingsIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </Svg>
);

const NotificationIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const ThemeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, theme } = useEvents();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            router.replace('/login');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Text style={[styles.titleText, { color: theme.text }]}>Profile</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#1A1A4E' : '#F0EEFF' }]}>
              <UserIcon />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>MindU User</Text>
              <Text style={[styles.userEmail, { color: theme.subtext }]}>user@mindu.com</Text>
            </View>
          </View>

          <View style={[styles.statsContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Events</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Tasks</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Completed</Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Settings</Text>
            
            <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <NotificationIcon />
                  <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E0E0E0', true: '#8B85FF' }}
                  thumbColor={notificationsEnabled ? '#6C63FF' : '#FFFFFF'}
                />
              </View>

              <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <ThemeIcon />
                  <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  trackColor={{ false: '#E0E0E0', true: '#8B85FF' }}
                  thumbColor={isDarkMode ? '#6C63FF' : '#FFFFFF'}
                />
              </View>

              <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.settingItem,
                  pressed && styles.settingItemPressed,
                ]}
              >
                <View style={styles.settingLeft}>
                  <SettingsIcon />
                  <Text style={[styles.settingText, { color: theme.text }]}>App Settings</Text>
                </View>
                <ChevronIcon />
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.subtext }]}>Account</Text>
            
            <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.settingItem,
                  pressed && styles.settingItemPressed,
                ]}
                onPress={() => router.push('/login')}
              >
                <View style={styles.settingLeft}>
                  <UserIcon />
                  <Text style={[styles.settingText, { color: theme.text }]}>Edit Profile</Text>
                </View>
                <ChevronIcon />
              </Pressable>

              <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.settingItem,
                  pressed && styles.settingItemPressed,
                ]}
                onPress={handleLogout}
              >
                <View style={styles.settingLeft}>
                  <LogoutIcon />
                  <Text style={[styles.settingText, { color: '#F44336' }]}>Logout</Text>
                </View>
              </Pressable>
            </View>
          </View>

          <Text style={[styles.versionText, { color: isDarkMode ? '#555555' : '#CCCCCC' }]}>MindU v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 20 : 28,
    paddingBottom: 16,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 28,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 28,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemPressed: {
    opacity: 0.5,
    backgroundColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 30,
  },
});