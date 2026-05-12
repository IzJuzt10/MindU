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

// Get screen width for calculating tab sizes
const { width } = Dimensions.get('window');

/**
 * Tab configuration interface
 * @property id - Unique tab identifier
 * @property icon - SVG icon component for this tab
 * @property route - Navigation route path this tab links to
 */
interface Tab {
  id: string;
  icon: React.FC<{ color: string }>;
  route: string;
}

// ============================================================
// SVG ICONS
// Each icon is a line-based SVG matching the app's minimal design.
// All icons accept a "color" prop for stroke color.
// Dimensions: 22x22, viewBox: 0 0 24 24, strokeWidth: 2
// ============================================================

/** Home icon - Simple house shape */
const HomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

/** Plus icon - For adding new events */
const PlusIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

/** Archive icon - Box shape for archived/deleted events */
const ArchiveIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
  </Svg>
);

/** Bell icon - For notifications screen */
const BellIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

/** Profile icon - Person silhouette */
const ProfileIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

/**
 * NavigationBar - Bottom tab bar with animated notch indicator
 * 
 * Features:
 * - 5 tabs: Home (calendar), Add (+), Notifications (bell), Archive (box), Profile (person)
 * - White notch that moves to the active tab position
 * - Active tab icon shown inside the white notch with purple color (#6C63FF)
 * - Inactive tabs shown with white icons at 60% opacity
 * - Uses requestAnimationFrame for instant navigation
 * 
 * ROUTES:
 * - home → /calendar
 * - add → /add-event
 * - notifications → /notifications
 * - archive → /archive
 * - profile → /profile
 */
const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Currently active tab - synced with current route
  const [activeTab, setActiveTab] = useState<string>('home');

  // ============================================================
  // TAB CONFIGURATION
  // To add/remove tabs, modify this array.
  // Make sure the corresponding route exists in _layout.tsx.
  // ============================================================
  const tabs: Tab[] = [
    { id: 'home', icon: HomeIcon, route: '/calendar' },
    { id: 'add', icon: PlusIcon, route: '/add-event' },
    { id: 'notifications', icon: BellIcon, route: '/notifications' },
    { id: 'archive', icon: ArchiveIcon, route: '/archive' },
    { id: 'profile', icon: ProfileIcon, route: '/profile' },
  ];

  // Calculate equal width for each tab
  // navBarWidth = screen width minus 40px padding (20px each side)
  const navBarWidth = width - 40;
  // Each tab gets exactly 1/5 of the bar width
  const tabWidth = navBarWidth / 5;

  /**
   * Sync active tab with the current URL path
   * When the pathname changes, find the matching tab and update state
   */
  useEffect(() => {
    const currentTab = tabs.find(tab => pathname === tab.route);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  /**
   * Handle tab press - Updates active tab and navigates to the route
   * Uses requestAnimationFrame to ensure instant visual response
   * before the navigation happens.
   * 
   * @param tabId - The ID of the tab being pressed
   */
  const handleTabPress = (tabId: string): void => {
    const tab = tabs.find(t => t.id === tabId);
    
    // Don't do anything if the tab doesn't exist or is already active
    if (!tab || activeTab === tabId) return;

    // Update active tab immediately for instant visual feedback
    setActiveTab(tabId);
    
    // Navigate in the next animation frame for smooth transition
    requestAnimationFrame(() => {
      router.replace(tab.route as any);
    });
  };

  // Get the icon component for the currently active tab
  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || HomeIcon;

  return (
    <View style={styles.container}>
      {/* Navigation bar container */}
      <View style={[styles.navBar, { width: navBarWidth }]}>
        {/* 
          White notch that moves to the active tab.
          Position calculated based on: tab index × tab width + half tab width - half notch width
          This centers the notch over the active tab icon.
        */}
        <View
          style={[
            styles.notch,
            {
              left: tabs.findIndex(t => t.id === activeTab) * tabWidth + tabWidth / 2 - 26,
            },
          ]}
        >
          {/* White circular notch with shadow */}
          <View style={styles.notchInner}>
            {/* Active tab icon in purple (#6C63FF) */}
            <ActiveIcon color="#6C63FF" />
          </View>
        </View>

        {/* Render each tab button */}
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
              {/* Show pressed state with opacity change for instant feedback */}
              {({ pressed }) => (
                <View style={[
                  styles.iconWrapper,
                  pressed && { opacity: 0.5 }
                ]}>
                  {/* Only render icon for inactive tabs (active tab icon is in the notch) */}
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

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 24, // More bottom spacing on iOS
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
    backgroundColor: '#6C63FF', // Purple background
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
    top: -26, // Half above the bar
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notchInner: {
    width: 52,
    height: 52,
    borderRadius: 26, // Perfect circle
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