import React, { useState } from 'react';
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
import { useEvents } from './_layout';

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'task' | 'event';
  date?: string;
}

const RestoreIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <Path d="M3 3v5h5M12 7v5l4 2" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </Svg>
);

export default function ArchiveScreen() {
  const { archivedEvents, deleteArchivedEvent, deleteAllArchived, restoreEvent, theme } = useEvents();
  const [showDeleteAll, setShowDeleteAll] = useState<boolean>(false);

  const handleDeleteEvent = (eventId: string): void => {
    deleteArchivedEvent(eventId);
  };

  const handleDeleteAll = (): void => {
    deleteAllArchived();
    setShowDeleteAll(false);
  };

  const handleRestoreEvent = (event: CalendarEvent): void => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    restoreEvent(event.id, event.date || todayString);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Text style={[styles.titleText, { color: theme.text }]}>Archive</Text>
          {archivedEvents.length > 0 && (
            <Pressable
              delayLongPress={0}
              pressRetentionOffset={0}
              style={({ pressed }) => [
                styles.deleteAllButton,
                pressed && styles.deleteAllButtonPressed,
              ]}
              onPress={() => setShowDeleteAll(true)}
            >
              <Text style={styles.deleteAllText}>Delete All</Text>
            </Pressable>
          )}
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {archivedEvents.length > 0 ? (
            archivedEvents.map((event: CalendarEvent) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventTimeContainer}>
                  <Text style={[styles.eventTime, { color: theme.subtext }]}>{event.time}</Text>
                </View>
                <View style={[styles.eventDetails, { backgroundColor: theme.card }]}>
                  <View style={[
                    styles.eventDot,
                    { backgroundColor: event.type === 'task' ? '#FF9800' : '#6C63FF' }
                  ]} />
                  <Text style={[styles.eventTitle, { color: theme.text }]}>{event.title}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <Pressable
                    delayLongPress={0}
                    pressRetentionOffset={0}
                    style={({ pressed }) => [
                      styles.restoreButton,
                      pressed && styles.restoreButtonPressed,
                    ]}
                    onPress={() => handleRestoreEvent(event)}
                  >
                    <RestoreIcon />
                  </Pressable>
                  <Pressable
                    delayLongPress={0}
                    pressRetentionOffset={0}
                    style={({ pressed }) => [
                      styles.deleteButton,
                      pressed && styles.deleteButtonPressed,
                    ]}
                    onPress={() => handleDeleteEvent(event.id)}
                  >
                    <TrashIcon />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={[styles.emptyText, { color: theme.text }]}>No archived events</Text>
              <Text style={[styles.emptySubtext, { color: theme.subtext }]}>Deleted events will appear here</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {showDeleteAll && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.bg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Delete All?</Text>
            <Text style={[styles.modalText, { color: theme.subtext }]}>This will permanently delete all archived events.</Text>
            <View style={styles.modalButtons}>
              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.modalCancelButton,
                  { backgroundColor: theme.card },
                  pressed && { opacity: 0.5 },
                ]}
                onPress={() => setShowDeleteAll(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                delayLongPress={0}
                pressRetentionOffset={0}
                style={({ pressed }) => [
                  styles.modalDeleteButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handleDeleteAll}
              >
                <Text style={styles.modalDeleteText}>Delete All</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  deleteAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFE0E0',
  },
  deleteAllButtonPressed: {
    opacity: 0.5,
    backgroundColor: '#FFCCCC',
  },
  deleteAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingBottom: 100,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  eventTimeContainer: {
    width: 90,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginRight: 8,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  restoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restoreButtonPressed: {
    opacity: 0.5,
    backgroundColor: '#C8E6C9',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.5,
    backgroundColor: '#FFCCCC',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F44336',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});