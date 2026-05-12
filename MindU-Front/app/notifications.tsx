import React from 'react';
import {
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Bell icon - used for each notification item
const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

// Trash icon - for deleting individual notifications
const TrashIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </Svg>
);

/**
 * Notification data structure
 * @property id - Unique notification identifier
 * @property title - Event name that triggered this notification
 * @property message - Notification body/description text
 * @property time - Event time display string
 * @property date - Event date (YYYY-MM-DD format)
 * @property read - Whether the user has viewed this notification
 */
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
}

/**
 * NotificationsScreen - Displays all notifications and reminders
 * 
 * Features:
 * - List of all notifications with read/unread status
 * - Unread count badge in header
 * - Tap to mark as read
 * - Individual delete button on each notification
 * - "Clear All" button to remove all notifications
 * - Empty state when no notifications exist
 * 
 * BACKEND INTEGRATION:
 * - Replace hardcoded notifications with GET /api/notifications
 * - Mark as read: PUT /api/notifications/{id}/read
 * - Delete single: DELETE /api/notifications/{id}
 * - Clear all: DELETE /api/notifications
 * 
 * LOCAL NOTIFICATIONS (Optional enhancement):
 * - Install expo-notifications: npx expo install expo-notifications
 * - Schedule notifications when events are created in add-event.tsx
 * - Listen for incoming notifications to populate this list automatically
 */
export default function NotificationsScreen() {
  // ============================================================
  // NOTIFICATION STATE
  // Currently using hardcoded sample data for demonstration.
  // TO BACKEND: Replace with API fetch on mount.
  // ============================================================
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'Daily Yoga',
      message: 'Time for your daily yoga session!',
      time: '6:00 AM',
      date: '2026-05-11',
      read: false, // Unread notification
    },
    {
      id: '2',
      title: 'Gym Time!',
      message: 'Don\'t forget your gym session',
      time: '9:00 AM',
      date: '2026-05-11',
      read: false, // Unread notification
    },
    {
      id: '3',
      title: 'Family Dinner',
      message: 'Family dinner at 6:00 PM',
      time: '6:00 PM',
      date: '2026-05-10',
      read: true, // Already read notification
    },
  ]);

  /**
   * Deletes a single notification by ID
   * TO BACKEND: DELETE /api/notifications/{id}
   */
  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * Marks a notification as read when tapped
   * TO BACKEND: PUT /api/notifications/{id}/read
   */
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  /**
   * Clears all notifications
   * TO BACKEND: DELETE /api/notifications
   */
  const handleClearAll = () => {
    setNotifications([]);
  };

  // Count of unread notifications for the badge display
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container}>
        {/* Header with title, unread badge, and Clear All button */}
        <View style={styles.topBar}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>Notifications</Text>
            {/* Red badge showing unread count - only visible when > 0 */}
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {/* Clear All button - only visible when notifications exist */}
          {notifications.length > 0 && (
            <Pressable
              delayLongPress={0}
              pressRetentionOffset={0}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && { opacity: 0.5 },
              ]}
              onPress={handleClearAll}
            >
              <Text style={styles.clearText}>Clear All</Text>
            </Pressable>
          )}
        </View>

        {/* Scrollable notification list */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Pressable
                key={notification.id}
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.notificationItem,
                  !notification.read && styles.unreadItem, // Purple background for unread
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.notificationLeft}>
                  {/* Bell icon - purple background when unread */}
                  <View style={[
                    styles.iconContainer,
                    !notification.read && styles.unreadIcon,
                  ]}>
                    <BellIcon />
                  </View>
                  {/* Notification content */}
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    {/* Date and time metadata */}
                    <View style={styles.notificationMeta}>
                      <Text style={styles.notificationDate}>{notification.date}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </View>
                </View>
                {/* Individual delete button */}
                <Pressable
                  delayLongPress={0}
                  pressRetentionOffset={0}
                  style={({ pressed }) => [
                    styles.deleteBtn,
                    pressed && { opacity: 0.5 },
                  ]}
                  onPress={() => handleDelete(notification.id)}
                >
                  <TrashIcon />
                </Pressable>
              </Pressable>
            ))
          ) : (
            // Empty state display
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>No notifications</Text>
              <Text style={styles.emptySubtext}>Event reminders will appear here</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30, paddingTop: Platform.OS === 'ios' ? 20 : 28, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleText: { fontSize: 28, fontWeight: 'bold', color: '#333333' },
  // Unread count badge
  badge: { backgroundColor: '#F44336', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  clearButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F5F5F5' },
  clearText: { fontSize: 14, color: '#F44336', fontWeight: '500' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 100 },
  // Notification item card
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEEEEE' },
  // Unread notification gets a purple tint
  unreadItem: { backgroundColor: '#F0EEFF', borderColor: '#D0CCFF' },
  notificationLeft: { flexDirection: 'row', flex: 1, gap: 12 },
  // Circular icon container
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0EEFF', justifyContent: 'center', alignItems: 'center' },
  unreadIcon: { backgroundColor: '#6C63FF' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '600', color: '#333333', marginBottom: 4 },
  notificationMessage: { fontSize: 13, color: '#666666', lineHeight: 18, marginBottom: 6 },
  notificationMeta: { flexDirection: 'row', gap: 12 },
  notificationDate: { fontSize: 11, color: '#999999' },
  notificationTime: { fontSize: 11, color: '#6C63FF', fontWeight: '500' },
  deleteBtn: { padding: 8 },
  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999999' },
});