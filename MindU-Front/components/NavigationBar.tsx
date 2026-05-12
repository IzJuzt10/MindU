import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface Tab {
  id: string;
  icon: React.FC<{ color: string }>;
  route: string;
}

const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const PlusIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

const ArchiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
  </Svg>
);

const BellIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

const ProfileIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState<string>('home');

  const tabs: Tab[] = [
    { id: 'home', icon: HomeIcon, route: '/calendar' },
    { id: 'add', icon: PlusIcon, route: '/add-event' },
    { id: 'notifications', icon: BellIcon, route: '/notifications' },
    { id: 'archive', icon: ArchiveIcon, route: '/archive' },
    { id: 'profile', icon: ProfileIcon, route: '/profile' },
  ];

  const navBarWidth = width - 40;
  const tabWidth = navBarWidth / 5;

  useEffect(() => {
    const currentTab = tabs.find(tab => pathname === tab.route);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  const handleTabPress = (tabId: string): void => {
    const tab = tabs.find(t => t.id === tabId);
    
    if (!tab || activeTab === tabId) return;

    setActiveTab(tabId);
    
    requestAnimationFrame(() => {
      router.replace(tab.route as any);
    });
  };

  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || HomeIcon;

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { width: navBarWidth }]}>
        <View
          style={[
            styles.notch,
            {
              left: tabs.findIndex(t => t.id === activeTab) * tabWidth + tabWidth / 2 - 26,
            },
          ]}
        >
          <View style={styles.notchInner}>
            <ActiveIcon color="#6C63FF" />
          </View>
        </View>

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <Pressable
              key={tab.id}
              style={[styles.tabButton, { width: tabWidth }]}
              onPress={() => handleTabPress(tab.id)}
              delayLongPress={0}
              pressRetentionOffset={0}
            >
              {({ pressed }) => (
                <View style={[
                  styles.iconWrapper,
                  pressed && { opacity: 0.5 }
                ]}>
                  {!isActive && (
                    <IconComponent color="rgba(255, 255, 255, 0.6)" />
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 66 : 56,
    position: 'relative',
    backgroundColor: '#6C63FF',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    alignItems: 'center',
  },
  notch: {
    position: 'absolute',
    top: -26,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notchInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  tabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
});

export default NavigationBar;